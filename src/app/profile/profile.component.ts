import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';
import { MatSidenav, } from '@angular/material/sidenav';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { CreatestoreComponent } from '../mystores/createstore/createstore.component';
import { VerifyComponent } from '../verify/verify.component';
import { SocketService } from '../services/socket.service';
import { MasterServiceService } from '../services/master-service.service';
import ApexCharts from 'apexcharts'


@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
  standalone: false
})
export class ProfileComponent implements OnInit {
  @ViewChild('piechart', { static: true }) piechart!: ElementRef<HTMLCanvasElement>;
  @ViewChild('chartCanvas', { static: true }) chartCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('barChart', { static: true }) barChart!: ElementRef<HTMLCanvasElement>;
  @ViewChild('storeBarChart', { static: true }) storeBarChart!: ElementRef<HTMLCanvasElement>;
  @ViewChild('storePieChart', { static: true }) storePieChart!: ElementRef<HTMLCanvasElement>;
  @ViewChild('sidenav') sidenav!: MatSidenav;


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
  pageSize: number = 5;
  storesPageSize: number = 5;
  currentPage: number = 0;
  storesCurrentPage: number = 0;
  storesPages: number[] = [];
  pages: number[] = [];
  pagedOrders: any = [];
  pagedStores: any[] = []; 
  ordersChartData:any;

  constructor(
    private socketService: SocketService,
    private ms: MasterServiceService,
    private router: Router,
    private domSanitizer: DomSanitizer,
    private authService: AuthService,
    private dialog: MatDialog,
  ) {}

  ngOnInit() {
    this.userId = localStorage.getItem('userId');
    this.loadUserData();
    this.loadUserOrders();
    this.loadUserStores();
    // socket listening
    this.socketService.listen('new-notification').subscribe((data:any) => {
      
      if(data.userId===localStorage.getItem('userId')){
        this.loadUserOrders()     
      }
    });

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
        this.countStatuses(this.orders);
        this.showBarChart("bar",Object.keys(this.countStatuses(this.orders).overallStatus), Object.values(this.countStatuses(this.orders).overallStatus),"orderStatus")
      }
    });
  }

  loadUserStores() {
    this.ms.getStoresAndProductsByOwnerId(this.userId).subscribe((res: any) => {
      if (res.success && res.data) {
        this.stores = res.data;
  
        // Create an array of store names and total values
        const storeNames: string[] = [];
        const totalValues: number[] = [];
  
        // Loop through stores and populate the arrays
        this.stores.forEach((store: any) => {
          storeNames.push(store.storeName);      // Add storeName to the storeNames array
          totalValues.push(store.totalValue);   // Add totalValue to the totalValues array
        });
  
        this.showPieChart("donut",storeNames, totalValues,"storesChart")
  
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

  openStore(store:any){
    localStorage.setItem('activeStorename',store.storeName);
    localStorage.setItem('storeId',store.storeId);
    this.router.navigate(['/dashboard/stores-dashboard'])

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

  countStatuses(orders: { overallStatus: string; paymentStatus: string }[]) {
    const overallStatusCounts: Record<string, number> = {};
    const paymentStatusCounts: Record<string, number> = {};
  
    orders.forEach((order) => {
      // Count overallStatus
      if (order.overallStatus in overallStatusCounts) {
        overallStatusCounts[order.overallStatus]++;
      } else {
        overallStatusCounts[order.overallStatus] = 1;
      }
  
      // Count paymentStatus
      if (order.paymentStatus in paymentStatusCounts) {
        paymentStatusCounts[order.paymentStatus]++;
      } else {
        paymentStatusCounts[order.paymentStatus] = 1;
      }
    });
  
    return {
      overallStatus: overallStatusCounts,
      paymentStatus: paymentStatusCounts,
    };
  }

  

  showBarChart(type: string, keys: any[], values: any[], chartID: string, colors: string[] = []) {
    // Default colors if not provided
    const defaultColors = ['#FF5733', '#33FF57', '#3357FF', '#FF33A1', '#FFC300'];
    const chartColors = colors.length ? colors : defaultColors;

    // General Chart Options
    var options = {
        chart: {
            type: type, // Type of chart (line, bar, area)
            // height: 350 // Chart height
        },
        colors: chartColors, // Custom colors for the chart
        series: [{
            name: 'value',
            data: values // Data points for the chart
        }],
        xaxis: {
            categories: keys // Categories for the x-axis
        },
        tooltip: {
            y: {
                formatter: function (val: number) {
                    return val; // Custom tooltip formatter
                }
            }
        },
        dataLabels: {
            enabled: true,
            formatter: function (val: number) {
                return val.toFixed(0); // Display values without decimals
            },
            style: { // Color of data labels
                fontSize: '14px',
                fontWeight: 700
            }
        },
        // Additional chart-specific configurations
        plotOptions: {}
    };

    // Handle specific chart types
    if (type === 'bar') {
        options.plotOptions = {
            bar: {
                horizontal: false, // Vertical bars (set to true for horizontal bars)
                distributed: true, // Apply colors to individual bars
                borderRadius: 5, // Rounded corners for bars
            }
        };
    }

    // Destroy the existing chart if it exists
    const existingChart = ApexCharts.getChartByID(chartID);
    if (existingChart) {
        existingChart.destroy();
    }

    // Create and render the new chart
    var chart = new ApexCharts(document.querySelector("#" + chartID), options);
    chart.render();
  }

  
  
  

  showPieChart(type: string, keys: any[], values: any[], chartID: string, colors: string[] = [], centerTitle?: string) {
      // Bootstrap color palette
      const bootstrapColors = [
        '#80deea', // primary (light cyan)
        '#f8bbd0', // secondary (light pink)
        '#e1bee7', // success (light purple)
        '#ff80ab', // danger (soft pink)
        '#ffccbc', // warning (light coral)
        '#b2ebf2', // info (pale cyan)
        '#f3e5f5'  // light (soft lavender)
      ];
      
      
      

      // Use provided colors or Bootstrap colors (cycled if necessary)
      const chartColors = colors.length ? colors : bootstrapColors;

      // Calculate the total of the values for percentage conversion
      const totalValue = values.reduce((sum, value) => sum + value, 0);

      // General Chart Options
      const options: any = {
          chart: {
              type: type,
              // height: 350 // Ensure chart has height
          },
          colors: chartColors, // Set colors
          series: values.map(value => (value / totalValue) * 100), // Convert values to percentages
          labels: keys, // Labels for pie/donut charts
          tooltip: {
              y: {
                  formatter: function (val: number, opts: any) {
                      const originalValue = values[opts.seriesIndex];
                      return `${val.toFixed(1)}% (${originalValue})`;
                  }
              }
          },
          legend: {
              show: true,
              position: 'bottom',  // Position the legend below the pie chart
              horizontalAlign: 'center',
          },
          dataLabels: {
              enabled: true,
              formatter: function (val: number) {
                  return `${val.toFixed()}%`; // Show percentage with one decimal point
              },
              style: { // Color of data labels
                  fontSize: '14px',
                  fontWeight: 700
              }
          }
      };

      // Pie/Donut chart specific configurations
      if (type === 'pie' || type === 'donut') {
          options.plotOptions = {
              pie: {
                  // customScale: 0.8, // Optional: Resize pie
                  donut: {
                      size: '60%', // Donut chart inner radius
                      labels: {
                          show: !!centerTitle, // Show the center title only if provided
                          total: {
                              show: !!centerTitle, // Only show if centerTitle exists
                              label: centerTitle || '', // Center title text
                              fontSize: '18px', // Title font size
                              fontWeight: 700,
                              formatter: function () {
                                  return ''; // No total value, only the title
                              }
                          }
                      },
                      
                      

                  }
              }
          };
      }

      // Destroy the existing chart if it exists
      const existingChart = ApexCharts.getChartByID(chartID);
      if (existingChart) {
          existingChart.destroy();
      }

      // Create and render the new chart
      const chart = new ApexCharts(document.querySelector("#" + chartID), options);
      chart.render();
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
