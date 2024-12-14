import { Component, ViewChild, AfterViewInit, ElementRef, OnInit } from '@angular/core';
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { ChangeDetectorRef } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { CurrencyPipe } from '@angular/common';
import { CreatestoreComponent } from '../mystores/createstore/createstore.component';
import { VerifyComponent } from '../verify/verify.component';
import { SocketService } from '../services/socket.service';
import { MasterServiceService } from '../services/master-service.service';
import { Chart, Legend } from 'chart.js/auto';

export interface OrdersData {
  items: string;
  total: number;
  deliveryFee: number;
  paymentStatus: string;
}

export interface StoresData {
  name: string;
  type: string;
  currency: string;
  items: number;
  totalvalue: number;
}

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
  standalone: false
})
export class ProfileComponent implements OnInit, AfterViewInit {
  @ViewChild('piechart', { static: true }) piechart!: ElementRef<HTMLCanvasElement>;
  @ViewChild('chartCanvas', { static: true }) chartCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('barChart', { static: true }) barChart!: ElementRef<HTMLCanvasElement>;
  @ViewChild('storeBarChart', { static: true }) storeBarChart!: ElementRef<HTMLCanvasElement>;
  @ViewChild('storePieChart', { static: true }) storePieChart!: ElementRef<HTMLCanvasElement>;
  @ViewChild('sidenav') sidenav!: MatSidenav;
  @ViewChild('ordersPaginator') ordersPaginator!: MatPaginator;
  @ViewChild('storesPaginator') storesPaginator!: MatPaginator;

  orders: any[] = [];
  stores: any[] = [];
  
  title = 'Profile';
  userId: any;
  mapurl: any;
  phone = '';
  avatar = '';
  name = '';
  dob = '';
  email = '';
  registered = '';
  address = '';
  verified = false;
  vendor = false;
  client = false;
  gender: any;
  city: any;
  zipcode: any;
  location: any;
  active: any;
  approved: any;

  rating = 3.2;
  isLoading = true;
  displayedColumns: string[] = ['transactionId', 'payment', 'orderStatus', 'total'];
  displayedStoresColumns: string[] = ['name', 'items', 'totalvalue'];
  pageSize: number = 5;
  storesPageSize: number = 5;
  currentPage: number = 0;
  storesCurrentPage: number = 0;
  storesPages: number[] = [];
  pages: number[] = [];
  pagedOrders: any = [];
  pagedStores: any[] = []; 
  chartInstances: Map<any, Chart> = new Map();

  constructor(
    private socketService: SocketService,
    private ms: MasterServiceService,
    private router: Router,
    private domSanitizer: DomSanitizer,
    private authService: AuthService,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef,
    private currency: CurrencyPipe
  ) {}

  ngOnInit() {
    this.userId = localStorage.getItem('userId');
    this.loadUserData();
    this.loadUserOrders();
    this.loadUserStores();
  }

  ngAfterViewInit() {
    // Any necessary post-initialization logic
  }

  loadUserData() {
    this.authService.getUser(this.userId).subscribe((data: any) => {
      if (data.success) {
        const date = new Date(data.data.dob);
        this.avatar = data.data.avatar;
        this.name = `${data.data.fname} ${data.data.lname}`;
        this.phone = data.data.phone;
        this.dob = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
        this.verified = data.data.verified;
        this.address = data.data.address.toUpperCase();
        this.vendor = data.data.vendor;
        this.email = data.data.email;
        this.registered = data.data.createdAt;
        this.client = data.data.client;
        this.approved = data.data.approved;
        this.gender = data.data.gender.toUpperCase();
        this.city = data.data.city.toUpperCase();
        this.active = data.data.active;
        this.zipcode = data.data.zipcode;
        this.location = data.data.location;

        window.document.title = `${this.title} | ${this.name}`;
        this.updateMapUrl();
      }
    });
  }

  loadUserOrders() {
    this.ms.getUserOrders(this.userId).subscribe((res: any) => {
      if (res.success && res.data.length > 0) {
        this.orders = res.data;
        this.getTotalPages();  // Calculate total pages when orders are loaded
        this.loadData(this.currentPage); // Load the first page's data
      }
    });
  }

  loadUserStores() {
    this.ms.getStoresAndProductsByOwnerId(this.userId).subscribe((res: any) => {
      if (res.success && res.data) {
        this.stores = res.data;
        this.getTotalStorePages();  // Calculate total pages when stores are loaded
        this.loadStoreData(this.storesCurrentPage); 
      }
    });
  }

  // Calculate the total number of store pages
  getTotalStorePages(): void {
    const totalStorePages = Math.ceil(this.stores.length / this.storesPageSize);
    this.storesPages = Array.from({ length: totalStorePages }, (_, i) => i);  // Create an array of page numbers (0-based)
  }

  // Load paginated store data based on the current page
  loadStoreData(page: number): void {
    const startIndex = page * this.storesPageSize;
    const endIndex = startIndex + this.storesPageSize;
    this.pagedStores = this.stores.slice(startIndex, endIndex); 
  }

  updateMapUrl() {
    const mapurl = `https://www.google.com/maps/embed/v1/place?key=AIzaSyDdvqTHmz_HwPar6XeBj8AiMxwzmFdqC1w&q=(${this.location.latitude},${this.location.longitude})&center=${this.location.latitude},${this.location.longitude}&zoom=18&maptype=roadmap`;
    this.mapurl = this.domSanitizer.bypassSecurityTrustResourceUrl(mapurl);
  }

  openDialog() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    this.dialog.open(CreatestoreComponent, dialogConfig);
  }

  // Method for handling store page change
  onStorePageChange(pageIndex: number): void {
    this.storesCurrentPage = pageIndex;
    this.loadStoreData(pageIndex); // Load the stores for the new page
  }

  userLogout() {
    this.authService.logout();
  }

  range(count: number) {
    return Array.from({ length: count }, (x, i) => i + 1);
  }

  openVerificationDialog() {
    const data = {
      zipcode: this.zipcode,
      phone: this.phone,
      signature: "3wZsyyh51s9"
    };
    this.authService.sendTwilioOTP({ mobilenumber: `${data.zipcode}${data.phone.slice(1)}`, signature: data.signature }).subscribe((res: any) => {
      if (res.success) {
        this.dialog.open(VerifyComponent, { data: data });
      }
    });
  }

  // Calculate the total number of pages
  getTotalPages(): void {
    const totalPages = Math.ceil(this.orders.length / this.pageSize);
    this.pages = Array.from({ length: totalPages }, (_, i) => i);  // Create an array of page numbers (0-based)
  }

  // Method to slice orders based on page size and page index
  loadData(page: number): void {
    const startIndex = page * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.pagedOrders = this.orders.slice(startIndex, endIndex);  // Populate pagedOrders with orders for the current page
  }

  // Method for handling page change for orders
  onPageChange(pageIndex: number): void {
    this.currentPage = pageIndex;
    this.loadData(pageIndex); // Load the orders for the new page
  }

  // status class styling
  getStatusClass(status: string): string {
    switch (status) {
      case 'processing':
        return 'btn-warning-light'; // Example class for 'processing'
      case 'confirmed':
        return 'btn-primary-light'; // Example class for 'confirmed'
      case 'packed':
        return 'btn-success-light'; // Example class for 'packed'
      case 'dispatched':
        return 'btn-info-light'; // Example class for 'dispatched'
      case 'partialCompleted':
        return 'btn-secondary-light'; // Example class for 'partialCompleted'
      case 'delivered':
        return 'btn-teal-light'; // Example class for 'delivered'
      case 'completed':
        return 'btn-success-light'; // Example class for 'completed'
      case 'failed':
        return 'btn-danger-light'; // Example class for 'failed'
      default:
        return 'btn-light'; // Default class if no status matches
    }
  }
  
}
