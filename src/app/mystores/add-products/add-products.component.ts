import { Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthService } from 'src/app/auth.service';
import { HttpClient } from '@angular/common/http';
import { SocketService } from 'src/app/services/socket.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatStepper } from '@angular/material/stepper';
import { MatChipInputEvent } from '@angular/material/chips';
import { UploadService } from 'src/app/services/upload.service';

@Component({
  selector: 'app-add-products',
  templateUrl: './add-products.component.html',
  styleUrls: ['./add-products.component.css']
})
export class AddProductsComponent implements OnInit {
  @ViewChild('stepper') stepper!: MatStepper;
  @ViewChild('productphoto', {static:false}) productphoto!: ElementRef;
  @ViewChild('productpic', {static:false}) productpic!: ElementRef;

  selectedImages: any[] = [];
  imageFiles: File[] = [];
  isLinear = true;
  progressColor = "";
  storeid:any;
  storename = "";
  uploadProgress = 0;
  imageUrl = "";
  featuresText: string[] = [];
  formControl = new FormControl('');
  imageNames: any[] = [];
  isChecked = false;
  feedbackerror = "";
  feedback = '';
  imageUrls: string[] = [];
  hoverIndex: number = -1;
  imageControl = new FormControl('', [Validators.required]);

  ngOnInit(): void {
    this.storeid = localStorage.getItem('storeId');
    console.log(this.storeid);
  }

  productdetails = new FormGroup({
    name: new FormControl('', [Validators.required]),
    brand: new FormControl('', [Validators.required]),
  });
  category = new FormGroup({
    category: new FormControl('', [Validators.required]),
    subcategory: new FormControl('', [Validators.required]),
  });
  description = new FormGroup({
    description: new FormControl('', [Validators.required]),
  });
  productimage = new FormGroup({
    image: new FormControl(''),
  });
  modelandqtty = new FormGroup({
    quantity: new FormControl('', [Validators.required, Validators.min(1)]),
    model: new FormControl('', [Validators.required]),
  });
  features = new FormGroup({
    featureslist: new FormControl('', [Validators.required]),
  });
  price = new FormGroup({
    bp: new FormControl('', [Validators.required, Validators.min(1)]),
    sp: new FormControl('', [Validators.required, Validators.min(1)]),
  });
  submitinfo = new FormGroup({
    terms: new FormControl(""),
  });

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<AddProductsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private socketService: SocketService,
    private auth: AuthService,
    private uploadService: UploadService
  ) {
    this.storeid = data.storeid;
    this.storename = data.storename;
  }

  addFeature(event: MatChipInputEvent) {
    const feature = (event.value || '').trim();
    if (feature) {
      this.featuresText.push(feature);
    }
    event.chipInput!.clear();
  }

  removeImage(index: number): void {
    this.selectedImages.splice(index, 1);
  }

  onImageSelected(event: any) {
    if (event.target.files.length > 0) {
      const file: FileList = event.target.files;
      for (let i = 0; i < file.length; i++) {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.selectedImages.push(e.target.result);
          this.imageNames.push(file[i].name);
          this.imageFiles.push(file[i]);
        };
        reader.readAsDataURL(file[i]);
      }
    } else {
      this.feedbackerror = "Please select an image";
    }
  }

  async submitAddProductDetails() {
    if (this.productdetails.valid && this.features.valid && this.price.valid && this.modelandqtty.valid && this.description.valid && this.category.valid && this.productimage.valid) {
      if (this.selectedImages.length == 0) {
        this.feedbackerror = "Please select an image";
        return;
      } else {
        this.feedbackerror = "";
        if (this.isChecked) {
          const confirm = window.confirm("Are you sure you want to add this product?");
          if (confirm) {
            this.feedback = "Uploading images...";
            this.progressColor = 'accent';

            // Use the UploadService to handle all file uploads
            this.uploadService.uploadFiles(this.imageFiles).subscribe({
              next: (response) => {
                if (response.status === 'complete') {
                  this.imageUrls = response.results.map((result: any) => {
                    const secureUrl = result.message.secure_url;
                    // Insert transformation into URL after `upload/`
                    const transformedUrl = secureUrl.replace(
                      "/upload/",
                      "/upload/t_thumbnail_100x100/"
                    );
                    return transformedUrl;
                  });
                  this.feedback = "Images uploaded successfully!";
                  this.progressColor = 'primary';

                  const productData = {
                    name: this.productdetails.value.name,
                    brand: this.productdetails.value.brand,
                    category: this.category.value.category,
                    subcategory: this.category.value.subcategory,
                    description: this.description.value.description,
                    features: this.featuresText,
                    quantity: this.modelandqtty.value.quantity,
                    model: this.modelandqtty.value.model,
                    bp: this.price.value.bp,
                    sp: this.price.value.sp,
                    images: this.imageUrls,
                    storeid: this.storeid,
                  };

                  this.auth.addProduct(productData).subscribe((res: any) => {
                    if (res.success) {
                      this.socketService.emit('productadded', productData);
                      alert("Product added successfully");
                      this.dialogRef.close();
                    } else {
                      this.progressColor = 'warn';
                      this.feedback = res.message;
                    }
                  });
                } else if (response.status === 'progress') {
                  this.uploadProgress = response.overallProgress;
                  this.feedback = `Uploading images... ${this.uploadProgress}%`;
                }
              },
              error: (error) => {
                this.progressColor = 'warn';
                this.feedback = "Error uploading images: " + error.message;
              },
            });
          }
        } else {
          this.feedbackerror = "Please accept the terms and conditions";
        }
      }
    } else {
      this.feedbackerror = "Please ensure that all fields are completed";
    }
  }

  onSubmit(stepper: MatStepper){

  }

  removeFeature(feature: string) {
    const index = this.featuresText.indexOf(feature);
    if (index >= 0) {
      this.featuresText.splice(index, 1);
    }
  }
}
