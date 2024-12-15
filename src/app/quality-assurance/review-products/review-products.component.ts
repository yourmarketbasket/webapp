import { Component, OnInit, ViewChild } from '@angular/core';
import { MasterServiceService } from 'src/app/services/master-service.service';
import { DatePipe } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from 'src/app/auth.service';
import { Subject } from 'rxjs';
import moment from 'moment';

interface Product {
  _id: number;
  name: string;
  storeid: string;
  brand: string;
  model: string;
  description: string;
  category: string;
  subcategory: string;
  bp: number;
  sp: number;
  avatar: any[];
  features: any[];
  quantity: number;
  approved: boolean;
  verified: boolean;
  createdAt: Date;
}

@Component({
  selector: 'app-review-products',
  templateUrl: './review-products.component.html',
  styleUrls: ['./review-products.component.css'],
  standalone: false
})
export class ReviewProductsComponent implements OnInit {
  images!: any[];
  currentIndex: number = 0;
  loading: boolean = true;
  selectedProductId!: string;
  showOverlay: boolean = false;
  selectedProductDescription: any;
  selectedProductVerified!: boolean;
  products: Product[] = [];
  userid!: any;
  advancedActionAllowed!: boolean;
  paginatedProducts: any[] = [];
  pageSize = 10; // Default page size
  currentPage = 0; // Current page index
  totalPages = 0; // Total number of pages
  pageNumbers: number[] = [];
  visiblePageNumbers: number[] = [];
  searchTerm: string = ''; // Holds the search term input by the user
  filteredProducts: Product[] = [];

  constructor(
    private snackBar: MatSnackBar,
    private ms: MasterServiceService,
    private datePipe: DatePipe,
    private authService: AuthService
  ) {}

  ngOnInit() {
    document.title = 'Product Review';
    this.dataRepopulate();
  }

  setVisiblePages() {
    const maxVisiblePages = 5;
    let startPage = Math.max(0, this.currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(this.totalPages - 1, startPage + maxVisiblePages - 1);

    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(0, endPage - maxVisiblePages + 1);
    }

    this.visiblePageNumbers = Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);
  }

  openSnackBar(message: any, action: any) {
    this.snackBar.open(message, action, {
      horizontalPosition: 'right',
      verticalPosition: 'bottom'
    });
  }

  showOverlayButtons() {
    this.showOverlay = true;
  }

  hideOverlayButtons() {
    this.showOverlay = false;
  }

  previousImage() {
    if (!this.loading && this.currentIndex > 0) {
      this.loading = true;
      this.currentIndex--;
    }
  }

  nextImage() {
    if (!this.loading && this.currentIndex < this.images.length - 1) {
      this.loading = true;
      this.currentIndex++;
    }
  }

  onImageLoad() {
    this.loading = false;
  }

  readableDate(date: any) {
    const now = moment();
    const inputDate = moment(date);

    if (now.diff(inputDate, 'seconds') < 5) {
      return 'a few seconds ago';
    } else if (inputDate.isSame(now, 'day')) {
      return inputDate.format('LT');
    } else if (inputDate.isSame(now.clone().subtract(1, 'day'), 'day')) {
      return 'Yesterday';
    } else if (inputDate.isSame(now, 'month')) {
      return inputDate.format('MMM D');
    } else {
      return inputDate.format('MMM D, YYYY');
    }
  }

  viewProduct(pname: any, pverified: any, pdescription: any, pimage: any, id: any) {
    this.images = pimage;
    this.loading = true;
    this.selectedProductId = id;
    this.selectedProductDescription = pdescription;
    this.selectedProductVerified = pverified;
  }

  approveListedItem(id: any) {
    const data = { action: 'approve', id: id };

    this.authService.reviewListedItemAction(data).subscribe((data: any) => {
      if (data.success) {
        this.openSnackBar(data.message, 'CLOSE');
        this.dataRepopulate();
      }
    });
  }

  rejectListedItem(id: any) {
    const reason = prompt('Please give your reason for rejection!');
    if (reason !== '') {
      const data = { action: 'reject', id: id, reason: reason };

      this.authService.reviewListedItemAction(data).subscribe((data: any) => {
        if (data.success) {
          this.openSnackBar(data.message, 'CLOSE');
          this.dataRepopulate();
        }
      });
    }
  }

  dataRepopulate() {
    this.userid = localStorage.getItem('userId');
  
    // Check if advanced action is allowed
    this.ms.advancedActionAllowed({ id: this.userid }).subscribe((data: any) => {
      if (data.allowed) {
        this.advancedActionAllowed = true;
  
        // Get the products
        this.ms.reviewProducts({ allowed: this.advancedActionAllowed }).subscribe((data: any) => {
          this.products = data;
  
          // Sort products to show unapproved and unverified first
          this.products.sort((a, b) => {
            if (!a.approved && !a.verified) {
              return -1; // Show unapproved and unverified products first
            }
            if (a.approved && a.verified) {
              return 1; // Show approved and verified products later
            }
            // If one is approved and the other isn't, ensure that unapproved comes first
            return a.approved === b.approved ? 0 : (a.approved ? 1 : -1);
          });
  
          // Initialize filteredProducts with all products on load
          this.filteredProducts = [...this.products];
  
          // Calculate pagination details
          this.totalPages = Math.ceil(this.filteredProducts.length / this.pageSize);
          this.setVisiblePages();
          this.paginateProducts(); // Make sure pagination is done right after loading
        });
      }
    });
  }
  

  // Function to search products by name, description, brand, or category
  searchProducts() {
    if (this.searchTerm.trim() === '') {
      // If the search term is empty, reset to the full list of products
      this.filteredProducts = [...this.products]; // Create a copy to avoid mutating the original list
    } else {
      // Convert search term to lowercase for case-insensitive comparison
      const searchTermLower = this.searchTerm.toLowerCase();
    
      // Filter products based on multiple fields
      this.filteredProducts = this.products.filter(product =>
        product.name.toLowerCase().includes(searchTermLower) ||
        product.brand.toLowerCase().includes(searchTermLower) ||
        product.category.toLowerCase().includes(searchTermLower) ||
        product.model.toLowerCase().includes(searchTermLower) ||
        product.features.some(feature => feature.toLowerCase().includes(searchTermLower)) ||
        product.description.toLowerCase().includes(searchTermLower)
      );
    }
  
    // After filtering, recalculate the totalPages based on the filteredProducts
    this.totalPages = Math.ceil(this.filteredProducts.length / this.pageSize);
    this.setVisiblePages();
    this.paginateProducts();
  }
  
  
  
  

  

  paginateProducts() {
    const startIndex = this.currentPage * this.pageSize;
    const endIndex = startIndex + this.pageSize;
  
    // Use filteredProducts for pagination
    this.paginatedProducts = this.filteredProducts.slice(startIndex, endIndex);
  }

  changePage(page: number) {
    if (page < 0 || page >= this.totalPages) return; // Invalid page index

    this.currentPage = page;
    this.setVisiblePages();
    this.paginateProducts();
  }
  
}
