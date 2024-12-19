import { Component, ViewChild } from '@angular/core';
import { FilePondComponent } from 'ngx-filepond';
import { FilePondOptions } from 'filepond';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MasterServiceService } from 'src/app/services/master-service.service';
import { UploadService } from 'src/app/services/upload.service';
import { FilePond } from 'filepond';
import { NiFilePondDirective } from 'src/app/ni-file-pond.directive';

@Component({
  selector: 'app-add-provider',
  templateUrl: './add-provider.component.html',
  styleUrl: './add-provider.component.css'
})
export class AddProviderComponent {
  @ViewChild('avataPond') avataPond!: FilePondComponent;
  @ViewChild('licensePond') licensePond!: FilePondComponent;
  @ViewChild('insurancePond') insurancePond!: FilePondComponent;
  @ViewChild(NiFilePondDirective) filePondDirective!: NiFilePondDirective;


  @ViewChild('nav13') nav13: any; 
  activeTabId: number = 1;
  forms: { [key: number]: FormGroup } = {}; 
  validationError:any;
  confirm: boolean = false;
  tnc: boolean = false;
  filesWithMetadata: any[]= [];
  uploadedFilesArray:any[]=[];
  mugshot:any = '';
  license:any =  '';
  insurance:any =  '';
  files: File[] = [];


  constructor(private fb: FormBuilder, private ms: MasterServiceService, private uploadService: UploadService) {
    // forms for different tabs
    this.forms[1] = this.fb.group({
      driverID: ['', Validators.required],
      name: ['', Validators.required],
      dateOfBirth: ['', Validators.required],
      gender: ['', Validators.required],
      contactNumber: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      email: ['', [Validators.required, Validators.email]]
    });

    this.forms[2] = this.fb.group({
      registrationNumber: ['', Validators.required],
      model: ['', Validators.required],
      type: ['', Validators.required],
      color: ['', Validators.required],
      insuranceNumber: ['', Validators.required],
      insuranceExpiryDate: ['', Validators.required]
    });

    this.forms[3] = this.fb.group({
      licenseNumber: ['', Validators.required],
      licenseExpiry: ['', Validators.required],
      issuingCountry: ['', Validators.required],
      issueDate: ['', Validators.required]
    });

    this.forms[4] = this.fb.group({
      emergencyName: ['', Validators.required],
      emergencyContactNumber: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]]
    });
  }

   

  // Method to handle tab change
  onTabChange(nextTabId: number): void {
    const currentTabId = this.nav13.activeId;
    if (this.validateTab(currentTabId)) {
      this.nav13.activeId = nextTabId;
    } else {
      alert('Please complete the current tab before proceeding.');
    }
  }
   // Method to collect data and send to the backend
   submitForm(): void {
    // Validate all forms before submission
    const allValid = Object.values(this.forms).every(form => form.valid);
    if (!allValid) {
      alert('Please complete all required fields before submitting.');
      return;
    }

    const formData: any = {};
    Object.keys(this.forms).forEach(tabId => {
      formData[tabId] = this.forms[+tabId].value;
    });

    console.log('Collected Data:', formData);
    // Replace with actual API call
    // this.http.post('/api/submit', formData).subscribe(response => {
    //   console.log('Submission Successful:', response);
    // });
  }

  filterFunction(date: Date): boolean {
    const today = new Date();
    const minYear = today.getFullYear() - 18;
  
    // Check if the date's year is less than the minimum year
    if (date.getFullYear() > minYear) {
      return false;
    }
  
  
    return true;
  }
  
  tabValidity:any = {
    1: true,  // First tab is always accessible
    2: true,
    3: true,
    4: true,
    5: true
  };

  // file pond methods
  pondOptions: FilePondOptions = {
    storeAsFile: true,
    allowMultiple: false, 
    allowImageCrop: true,
    imagePreviewMarkupShow: false,
    allowFileEncode: true,
    // allowDirectoriesOnly: true,
    allowImagePreview: true,
    // imageCropAspectRatio: '1:1',
    labelIdle: 'Drop files here...'   
  }
  licensePondFiles: FilePondOptions["files"] = [ ]
  insurancePondFiles: FilePondOptions["files"] = []
  avatarPondFiles: FilePondOptions["files"] = []
  pondHandleInit() {
    // console.log('FilePond has initialised', this.myPond);
  }
  // Move to the next tab, unlock it, and set it as active
  goToNextTab(): void {
    if (this.validateCurrentTab()) {
      const nextTabId = this.activeTabId + 1;
  
      if (nextTabId <= 5) {
        this.tabValidity[nextTabId] = true; // Unlock the next tab
        this.activeTabId = nextTabId; // Set the active tab ID
  
        // Open the next tab (assuming there's a method to handle tab switching)
        this.openTab(nextTabId);
      }
    } else {
      this.validationError = 'Please fill out the required fields in the current tab.';
    }
  }
  goToPreviousTab(): void {
    if (this.validateCurrentTab()) {
      const previousTabId = this.activeTabId - 1;
  
      if (previousTabId >= 1) {
        this.tabValidity[previousTabId] = true; // Unlock the previous tab
        this.activeTabId = previousTabId; // Set the active tab to the previous one
  
        // Open the previous tab (assuming there's a method to handle tab switching)
        this.openTab(previousTabId);
      }
    } else {
      this.validationError = 'Please fill out the required fields in the current tab.';
    }
  }
  
  
  // Helper method to open the tab
  openTab(tabId: number): void {
    // Logic to open the tab based on the tabId, for example:
    this.nav13.activeId = tabId;
  }
  
  // Validate the current tab's form
  validateTab(tabId: number): boolean {
    // Replace this with actual validation logic
    switch (tabId) {
      case 1:
      case 2:
      case 3:
      case 4:
        return true; // Return true if the tab is valid
      default:
        return false;
    }
  }

  

  // Validate the current tab's form
  validateCurrentTab(): boolean {
    const currentForm = this.forms[this.activeTabId];

    if (currentForm.invalid) {
      currentForm.markAllAsTouched(); // Highlight errors
      return false;
    }
    return true;
  }

  // Handle the Next button click
  onNextClick(): void {
    if (this.validateCurrentTab()) {
      this.goToNextTab();
    } else {
      alert('Please complete the current tab before proceeding.');
    }
  }

  // Check if a tab is accessible
  isTabAccessible(tabId: number): boolean {
    return this.tabValidity[tabId];
  }

  

  pondHandleAddFile(event: any, description: any) {
    console.log(event.file.serverId)
    // Get the base64-encoded file string
    const base64File = event.file.getFileEncodeBase64String();
    
    // Extract the file's MIME type and file name from the event (you can customize how you get these)
    const mimeType = event.file.fileType; // Extract MIME type (e.g., image/png)
    const fileName = event.file.fileName || description;  // Use file name from event, fallback to 'untitled'
    
    // Convert the base64 string to a File object
    const file = this.base64ToFile(base64File, fileName, mimeType);
  
    if (file) {
      // Push the file and description into the `filesWithMetadata` array
      this.filesWithMetadata.push({
        file: file,  // The File object created from the base64 string
        description: description
      });
  
      // Log for debugging
      // console.log('File added:', file);
      // console.log('Description:', description);
    } else {
      console.error('Invalid file. Could not convert base64 to file.');
      // Handle error case, for example, by showing an error message to the user
    }
  }
  
  // Function to convert base64 string to a File object
  base64ToFile(base64String: string, fileName: string, mimeType: string): File | undefined {
    // Ensure that the base64 string does not have a data URL prefix (e.g., 'data:image/png;base64,')
    const base64Data = base64String.startsWith('data:') 
      ? base64String.split(',')[1]  // Remove the prefix if it's a data URL
      : base64String;
  
    // Ensure that the base64 string only contains valid base64 characters
    if (!/^[A-Za-z0-9+/=]+$/.test(base64Data)) {
      console.error('Invalid base64 string');
      return undefined;  // Return undefined if the string is not valid
    }
  
    // Decode the base64 string into a byte array
    try {
      const byteCharacters = atob(base64Data);
      const byteArrays = new Uint8Array(byteCharacters.length);
  
      for (let i = 0; i < byteCharacters.length; i++) {
        byteArrays[i] = byteCharacters.charCodeAt(i);
      }
  
      // Create a File object with the byte array, file name, and mime type
      const file = new File([byteArrays], fileName, { type: mimeType });
      return file;
  
    } catch (error) {
      console.error('Error decoding base64 string:', error);
      return undefined;  // Return undefined if there's an error during decoding
    }
  }
  
  
  pondProcessFile(event:any){
    // console.log(event.file.getFiles());
  }

  pondHandleActivateFile(event: any) {
    // console.log('A file was activated', event)
  }

  // Helper function to check if all forms are valid
  validateAllTabs(): boolean {
    // Use Object.values to convert the form object into an array of FormGroup and check validity
    return Object.values(this.forms).every(form => form.valid);
  }
  // Method to set the description for a file
  setDescription(index: number, description: string) {
    this.filesWithMetadata[index].description = description;
  }

  uploadAllFiles() {
    // check if tncs and confirmation is checked
    if(this.confirm && this.tnc){
      // Define allowed types and max size (example values)
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];  // Allowed file types
        const maxSizeInMB = 10;  // Maximum file size in MB
      
        // Iterate over each file in the filesWithMetadata array
        for (let i = 0; i < this.filesWithMetadata.length; i++) {
          const file = this.filesWithMetadata[i].file;
          const description = this.filesWithMetadata[i].description;
      
          // Validate file before uploading
          if (!this.isValidFile(file, allowedTypes, maxSizeInMB)) {
            console.error(`File with description "${description}" is invalid. Skipping upload.`);
            continue;  // Skip the upload if the file is invalid
          }
          
          // check if the array already contains the data
          if(this.uploadedFilesArray.length===0){
            // Call uploadService for each valid file
              this.uploadService.uploadFiles([file]).subscribe(response => {
                if (response.status === 'complete') {
                  const result = response.results[0];  // Only one result per file because we're uploading one at a time
                  const uploadedUrl = result.transformedUrl;  // URL of the uploaded image
                  this.uploadedFilesArray.push({
                    file: uploadedUrl,
                    description: description,
                  })
                  if(this.uploadedFilesArray.length===3){
                    this.submitAllForms();
                  }else{
                    console.log("not equal")
                  }
          

                  
                  // Optionally, you can store the URL in the metadata array
                } else {
                  console.error(`Error during upload of file with description "${description}":`, response.message);
                }
              });


          }else{
            this.submitAllForms();

          }
          
        }

    }else{
      this.validationError = "Check the confirmation button and accept terms and conditions."
    }
    
  }

 
  

  private isValidFile(file: File, allowedTypes: string[], maxSizeInMB: number): boolean {
    // Validate file type
    if (!allowedTypes.includes(file.type)) {
      console.error('Invalid file type:', file.type);
      return false; // Invalid file type
    }
  
    // Validate file size
    const fileSizeInMB = file.size / (1024 * 1024); // Convert size to MB
    if (fileSizeInMB > maxSizeInMB) {
      console.error('File is too large:', fileSizeInMB, 'MB');
      return false; // File is too large
    }
  
    // If both checks pass, the file is valid
    return true;
  }
  
  
  
  
  

  submitAllForms(): void {
    // Check if all forms are valid
    if (this.validateAllTabs()) {
      const combinedData = {
        personalDetails: this.forms[1].value,
        vehicleDetails: this.forms[2].value,
        licenseDetails: this.forms[3].value,
        emergencyContact: this.forms[4].value,
        // You can add more if you have additional forms
      };
      combinedData.personalDetails.avatar = this.uploadedFilesArray.find(item=>item.description==="Mugshot").file;
      combinedData.licenseDetails.license = this.uploadedFilesArray.find(item=>item.description==="License").file;
      combinedData.vehicleDetails.insuranceDocument = this.uploadedFilesArray.find(item=>item.description==="Insurance").file;



      this.ms.registerDriver(combinedData).subscribe((res:any)=>{
        console.log(res)
      })

      
  
    } else {
      this.validationError = 'Please fill out the required fields in all the tabs.';
    }
  }

  // for nifilepond
  selectedFiles: File[] = [];


  processFiles() {
    // Use the selected files array for further processing (e.g., upload to server)
    console.log('Processing files:', this.selectedFiles);
  }

  getFinalFiles(): void {
    this.files = this.filePondDirective.getFiles(); // Calling the getFiles() method on the directive
    console.log(this.files); // Process or display the files as needed
  }

  // Method that will be triggered when files are changed
  onFilesChanged(files: File[]): void {
    this.files = files;
    console.log(this.files);
    this.getFinalFiles() // Log or process files here
  }

}
