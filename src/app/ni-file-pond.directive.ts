import { Directive, ElementRef, Renderer2, Output, EventEmitter, Input, ChangeDetectorRef } from '@angular/core';

@Directive({
  selector: '[appNiFilePond]'
})
export class NiFilePondDirective {
  @Output() filesChanged: EventEmitter<File[]> = new EventEmitter();
  @Input() enableDragDrop: boolean = true; // Enable/disable drag-and-drop
  @Input() enableBrowse: boolean = true;  // Enable/disable browse button
  @Input() multiple: boolean = true; // Allow multiple files to be uploaded
  @Input() maxFiles: number = 5;  // Max number of files to be uploaded
  private filesArray: { filename: string, url: string }[] = []; 
  private browseInput!: HTMLInputElement; // Store files as objects with filename and url

  constructor(private el: ElementRef, private renderer: Renderer2, private cdRef: ChangeDetectorRef) {
    if (this.enableBrowse) {
      this.setupBrowseButton();
    }
    if (this.enableDragDrop) {
      this.setupDragAndDrop();
    }

    // Load existing images from local storage if available
    this.loadExistingFiles();
  }

  private setupBrowseButton(): void {
    const browseInput = this.renderer.createElement('input');
    this.renderer.setAttribute(browseInput, 'type', 'file');
    this.renderer.setAttribute(browseInput, 'multiple', this.multiple ? 'true' : 'false');
    this.renderer.listen(browseInput, 'change', (event: any) => this.handleFileInput(event.target.files));
    this.el.nativeElement.appendChild(browseInput);

    // Hide the input file button after setup
    this.renderer.setStyle(browseInput, 'display', 'none');
  }

  private setupDragAndDrop(): void {
    const dropZone = this.el.nativeElement;

    // Apply dynamic width and height to the container
    this.renderer.setStyle(dropZone, 'width', '100%');  // Set to 100% of the parent width
    this.renderer.setStyle(dropZone, 'height', 'auto'); // Allow height to adjust based on content
    this.renderer.setStyle(dropZone, 'border', '2px dashed #ccc');
    this.renderer.setStyle(dropZone, 'padding', '20px');
    this.renderer.setStyle(dropZone, 'text-align', 'center');
    this.renderer.setStyle(dropZone, 'cursor', 'pointer');
    this.renderer.setStyle(dropZone, 'display', 'block'); // Ensure it behaves as a block-level element
    this.renderer.setStyle(dropZone, 'flex-grow', '1');  // Allow the drop zone to grow and fill the parent container

    this.renderer.listen(dropZone, 'dragover', (event: DragEvent) => {
      event.preventDefault();
      event.stopPropagation();
      this.renderer.setStyle(dropZone, 'background-color', '#e0e0e0');
    });

    this.renderer.listen(dropZone, 'dragleave', (event: DragEvent) => {
      event.preventDefault();
      event.stopPropagation();
      this.renderer.removeStyle(dropZone, 'background-color');
    });

    this.renderer.listen(dropZone, 'drop', (event: DragEvent) => {
      event.preventDefault();
      event.stopPropagation();
      const files = event.dataTransfer?.files;
      if (files) {
        this.handleFileInput(files);
      }
      this.renderer.removeStyle(dropZone, 'background-color');
    });

    this.renderer.listen(dropZone, 'click', (event: Event) => {
      if (this.enableBrowse && !this.isPreviewClick(event)) {
        this.el.nativeElement.querySelector('input[type="file"]').click();
      }
    });
  }

  private handleFileInput(files: FileList): void {
    if (this.filesArray.length + files.length > this.maxFiles) {
      // Show an alert or console message if file limit is exceeded
      alert(`You can upload a maximum of ${this.maxFiles} files.`);
      return;  // Do not process files if the limit is exceeded
    }

    // Process the selected files
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileURL = URL.createObjectURL(file); // Create a URL for the file

      // Store both the filename and URL in the filesArray
      this.filesArray.push({ filename: file.name, url: fileURL });
    }

    this.filesChanged.emit(this.getFiles());  // Emit only File objects
    this.displayFilesPreview();
    this.saveToLocalStorage();  
  }

  private displayFilesPreview(): void {
    let previewContainer = this.el.nativeElement.querySelector('.file-previews');
    
    if (!previewContainer) {
      previewContainer = this.renderer.createElement('div');
      this.renderer.addClass(previewContainer, 'file-previews');
      this.el.nativeElement.appendChild(previewContainer);
    } else {
      previewContainer.innerHTML = '';
    }
  
    // Loop through the files and preview them
    this.filesArray.forEach((file) => {
      this.previewImage(file);
    });
  }

  private previewImage(file: { filename: string, url: string }): void {
    const imagePreview = document.createElement('img');
    imagePreview.src = file.url;  // Use the URL of the file
    
    // Ensure aspect ratio is maintained and size is controlled
    imagePreview.style.maxWidth = '100px';  // Maximum width for the image
    imagePreview.style.height = 'auto';     // Maintain aspect ratio
    imagePreview.style.borderRadius = '10px'; // Rounded corners
    imagePreview.style.objectFit = 'cover';  // Ensure the image covers the area without distortion
  
    const removeBtn = document.createElement('button');
    removeBtn.textContent = 'X';
    removeBtn.classList.add('btn', 'btn-danger', 'btn-sm', 'rounded-pill');
    removeBtn.style.position = 'absolute';
    removeBtn.style.top = '5px';
    removeBtn.style.right = '5px';
    removeBtn.onclick = (event) => this.removeImage(file, event);
  
    const container = document.createElement('div');
    container.style.display = 'inline-block';
    container.style.margin = '10px';
    container.style.position = 'relative';  // Relative positioning for the close button
    container.setAttribute('data-file', file.url);
  
    container.appendChild(imagePreview);
    container.appendChild(removeBtn);
  
    let previewContainer = this.el.nativeElement.querySelector('.file-previews');
    if (!previewContainer) {
      previewContainer = this.renderer.createElement('div');
      this.renderer.addClass(previewContainer, 'file-previews');
      this.el.nativeElement.appendChild(previewContainer);
    }
    previewContainer.appendChild(container);
  }

  private removeImage(file: { filename: string, url: string }, event: Event): void {
    event.stopPropagation();

    // Remove preview from the DOM
    const previewContainer = this.el.nativeElement.querySelector('.file-previews');
    let previewRemoved = false;

    if (previewContainer) {
      const imageElements = previewContainer.querySelectorAll('div');
  
      imageElements.forEach((element: HTMLElement) => {
        const fileData = element.getAttribute('data-file');
        
        if (fileData === file.url) {
          element.remove();
          previewRemoved = true;
        }
      });

      if (!previewRemoved) {
        console.warn('No matching preview found to remove.');
        return;
      }
    } else {
      console.warn('Preview container not found.');
      return;
    }

    // Remove from the files array
    this.filesArray = this.filesArray.filter(f => f.url !== file.url);

    // Remove from localStorage and save updated list
    this.removeFromLocalStorage(file);
    this.saveToLocalStorage();

    // Emit updated files array
    this.filesChanged.emit(this.getFiles());
}


  private removeFromLocalStorage(file: { filename: string, url: string }): void {
    const storedFiles = JSON.parse(localStorage.getItem('files') || '[]');
    const updatedFiles = storedFiles.filter((storedFile: any) => storedFile.url !== file.url);
    localStorage.setItem('files', JSON.stringify(updatedFiles));
  }

  private saveToLocalStorage() {
    const filesForStorage = this.filesArray.map(file => ({
      filename: file.filename,
      url: file.url
    }));
    localStorage.setItem('files', JSON.stringify(filesForStorage));
  }

  private isPreviewClick(event: Event): boolean {
    const target = event.target as HTMLElement;
    return !!target.closest('.file-previews');
  }

  private loadExistingFiles(): void {
    const storedFiles = localStorage.getItem('files');
    if (storedFiles) {
      const filesFromStorage = JSON.parse(storedFiles);
      filesFromStorage.forEach((fileData: { filename: string, url: string }) => {
        this.filesArray.push(fileData);
      });
      this.displayFilesPreview();
    }
  }

  getFiles(): File[] {
    return this.filesArray.map(file => {
      // Return only the file objects (not URLs)
      const fileObject = new File([file.url], file.filename, { type: 'image/png' });
      return fileObject;
    });
  }

  
}
