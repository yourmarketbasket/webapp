import { Component, OnInit } from '@angular/core';
import {Cloudinary, CloudinaryImage} from '@cloudinary/url-gen';
import { UploadService } from 'src/app/services/upload.service';
import { MasterServiceService } from 'src/app/services/master-service.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-manage-views',
  templateUrl: './manage-views.component.html',
  styleUrls: ['./manage-views.component.css']
})
export class ManageViewsComponent implements OnInit {
  // constructor
  constructor(private uploadservice: UploadService, private ms: MasterServiceService){}
  // Arrays to store images for each category (categories, brands, carousel)
  categories: string[] = [];
  brands: string[] = [];
  carousel: string[] = [];
  img!: CloudinaryImage; 
  uploadingInprogress:boolean = false;
  selectedImageType: string = 'carousel'; 
  filesToUpload: File[] = [];
  imagePreviews: string[] = [];
  imageCategorySelection = [
    { value: 'carousel', label: 'Carousel Images' },
    { value: 'categories', label: 'Category Images' },
    { value: 'brands', label: 'Brand Images' },
  ];

  // Drag-and-drop states for each category
  isCategoryDragOver = false;
  isBrandDragOver = false;
  isCarouselDragOver = false;

  ngOnInit(): void {
    document.title = 'Manage Views'; 
    
  }

  private addFilesToPreview(files: File[], type: string): void {
    // Add new files to the filesToUpload array
    this.filesToUpload = [...this.filesToUpload, ...files];
    
    // Generate previews for the newly added files
    const newPreviews = files.map(file => URL.createObjectURL(file));
    
    // Add previews to the appropriate category array
    if (type === 'categories') {
      this.categories = [...this.categories, ...newPreviews];
    } else if (type === 'brands') {
      this.brands = [...this.brands, ...newPreviews];
    } else if (type === 'carousel') {
      this.carousel = [...this.carousel, ...newPreviews];
    }
  
    // Update the imagePreviews array with the previews for all categories
    this.imagePreviews = [...this.imagePreviews, ...newPreviews];
  }
  

  // Trigger the file input dialog when clicking the area to upload images
  triggerFileInput(type: string): void {
    const fileInput = document.querySelector(`#${type}FileInput`) as HTMLInputElement;
    if (fileInput) {
      fileInput.click(); // Open file input dialog
    }
  }

  // Handle the change event for file input (when files are selected manually)
  onFileChange(event: Event, type: string): void {
    const input = event.target as HTMLInputElement;
    if (input && input.files) {
      const files = Array.from(input.files); // Convert FileList to an array
      this.addFilesToPreview(files, type); // Process the files
    }
  }

  // Handle dragover event (for visual feedback when dragging files over the area)
  onDragOver(event: DragEvent, type: string): void {
    event.preventDefault(); // Allow drop
    if (type === 'categories') {
      this.isCategoryDragOver = true;
    } else if (type === 'brands') {
      this.isBrandDragOver = true;
    } else if (type === 'carousel') {
      this.isCarouselDragOver = true;
    }
  }

  // Handle dragleave event (when dragging leaves the drop area)
  onDragLeave(type: string): void {
    if (type === 'categories') {
      this.isCategoryDragOver = false;
    } else if (type === 'brands') {
      this.isBrandDragOver = false;
    } else if (type === 'carousel') {
      this.isCarouselDragOver = false;
    }
  }

  // Handle the drop event (when files are dropped into the area)
  onDrop(event: DragEvent, type: string): void {
    event.preventDefault();
    const files = Array.from(event.dataTransfer?.files || []); // Get the dropped files
    this.addFilesToPreview(files, type); // Process the files
    this.onDragLeave(type); // Reset dragover state
    
  }

  // Remove an image from the respective category array
  removeImage(index: number, type: string): void {
    // Remove image from the filesToUpload array
    this.filesToUpload.splice(index, 1);
  
    // Remove image from the corresponding category array
    if (type === 'categories') {
      this.categories.splice(index, 1);
    } else if (type === 'brands') {
      this.brands.splice(index, 1);
    } else if (type === 'carousel') {
      this.carousel.splice(index, 1);
    }
  
    // Remove the corresponding preview from the imagePreviews array
    this.imagePreviews.splice(index, 1);
  }
  

  uploadFiles(): void {
    if (this.filesToUpload.length === 0) {
      console.log('No files selected for upload');
      return; // No files selected, do nothing
    }
  
    // Display a loading message or initiate a progress bar (optional)
    this.uploadingInprogress = true;
  
    this.uploadservice.uploadFiles(this.filesToUpload, false).subscribe(
      (response: any) => {
        if (response.status === 'complete') {
          this.uploadingInprogress = false;
  
          // Clear arrays for new uploads
          switch (this.selectedImageType) {
            case 'categories':
              this.categories = [];
              break;
            case 'brands':
              this.brands = [];
              break;
            case 'carousel':
              this.carousel = [];
              break;
            default:
              console.error('Invalid selected image type');
          }
  
          const saveOperations: Promise<any>[] = [];
          const successResults: any[] = [];
          const failedResults: any[] = [];
  
          // Process each uploaded image
          response.results.forEach((result: any) => {
            const imageUrl = result.transformedUrl;
  
            // Add URLs to the respective category array
            switch (this.selectedImageType) {
              case 'categories':
                this.categories.push(imageUrl);
                break;
              case 'brands':
                this.brands.push(imageUrl);
                break;
              case 'carousel':
                this.carousel.push(imageUrl);
                break;
              default:
                console.error('Invalid selected image type');
            }
  
            // Prepare data for saving
            const data = {
              managerId: localStorage.getItem('userId'),
              imageUrl: result.message.url,
              category: this.selectedImageType,
              fileSize: result.message.bytes,
            };
  
            // Add save operation with error handling
            const saveOperation = this.ms.addStaticImages(data).toPromise()
              .then((res: any) => {
                if (res.success) {
                  successResults.push(result.message.url);
                } else {
                  failedResults.push(result.message.url);
                }
              })
              .catch(() => {
                failedResults.push(result.message.url);
              });
  
            saveOperations.push(saveOperation);
          });
  
          // Wait for all save operations to complete
          Promise.all(saveOperations)
            .then(() => {
              const successCount = successResults.length;
              const failureCount = failedResults.length;
  
              // Display consolidated results
              if (failureCount === 0) {
                Swal.fire({
                  icon: 'success',
                  title: 'Upload Complete',
                  text: `All ${successCount} image(s) were uploaded and saved successfully.`,
                  confirmButtonText: 'Close',
                  timer: 5000,
                });
              } else {
                Swal.fire({
                  icon: 'warning',
                  title: 'Partial Success',
                  html: `Successfully uploaded and saved ${successCount} image(s).<br>` +
                    `Failed to save ${failureCount} image(s). Please retry.`,
                  confirmButtonText: 'Close',
                  timer: 5000,
                });
              }
            })
            .catch(() => {
              Swal.fire({
                icon: 'error',
                title: 'Upload Error',
                text: 'An unexpected error occurred while saving some images. Please try again.',
                confirmButtonText: 'Close',
              });
            })
            .finally(() => {
              // Clear files and previews
              this.filesToUpload = [];
              this.imagePreviews = [];
            });
        } else if (response.status === 'progress') {
          console.log(`File ${response.fileIndex + 1}: ${response.progress}%`);
          console.log(`Overall progress: ${response.overallProgress}%`);
        } else if (response.status === 'error') {
          console.error(`Error uploading file ${response.fileIndex + 1}: ${response.message}`);
  
          Swal.fire({
            icon: 'error',
            title: 'Upload Failed!',
            text: `An error occurred while uploading file ${response.fileIndex + 1}. Please try again.`,
            confirmButtonText: 'Close',
          });
  
          this.uploadingInprogress = false;
        }
      },
      (error: any) => {
        console.error('Error during upload:', error);
  
        Swal.fire({
          icon: 'error',
          title: 'Upload Failed!',
          text: 'There was an error during the upload. Please check your connection and try again.',
          confirmButtonText: 'Close',
        });
  
        this.uploadingInprogress = false;
      }
    );
  }
  
  
  
}
