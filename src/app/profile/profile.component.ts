import { Component, ViewChild, AfterViewInit, ElementRef } from '@angular/core';
import { MatSidenav, MatSidenavModule  } from '@angular/material/sidenav';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import { OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { CreatestoreComponent } from '../mystores/createstore/createstore.component';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { ChangeDetectorRef } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Store } from '../mystores/stores-dashboard/stores-interface';
import { SocketService } from '../services/socket.service';
import { MasterServiceService } from '../services/master-service.service';
import {MatPaginator} from '@angular/material/paginator';
import {MatTableDataSource} from '@angular/material/table';
import { VerifyComponent } from '../verify/verify.component';
import { responsive } from '@cloudinary/ng';
import { Chart, Legend } from 'chart.js/auto';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { CurrencyPipe } from '@angular/common';

Chart.register(ChartDataLabels);

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
  items:number;
  totalvalue:number;
}

@Component({
    selector: 'app-profile',
    templateUrl: './profile.component.html',
    styleUrls: ['./profile.component.css'],
    standalone: false
})


export class ProfileComponent implements OnInit, AfterViewInit {
  // chart options
  @ViewChild('piechart', { static: true }) piechart!: ElementRef<HTMLCanvasElement>;
  @ViewChild('chartCanvas', { static: true }) chartCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('barChart', { static: true }) barChart!: ElementRef<HTMLCanvasElement>;
  @ViewChild('storeBarChart', { static: true }) storeBarChart!: ElementRef<HTMLCanvasElement>;
  @ViewChild('storePieChart', { static: true }) storePieChart!: ElementRef<HTMLCanvasElement>;





  chart!: any;
  data = {
    labels: [
      'Red',
      'Blue',
      'Yellow'
    ],
    datasets: [{
      label: 'My First Dataset',
      data: [300, 50, 100],
      backgroundColor: [
        'rgb(255, 99, 132)',
        'rgb(54, 162, 235)',
        'rgb(255, 205, 86)'
      ],
      hoverOffset: 4
    }]
  }
  config:any = {
    type: 'doughnut',
    data: this.data,
  };

  
 
  

  
  
  
  // other variables
  @ViewChild('sidenav') sidenav!: MatSidenav;
  rating = 3.2;
  isLoading = true;
  stores:any;
  userId: any;
  displayedColumns: string[] = ['transactionId', 'payment', 'orderStatus', 'total'];
  displayedStoresColumns: string[] = ['name', 'items', 'totalvalue'];
  phone = "";
  avatar = "";
  name = "";
  dob = "";
  verified = false;
  address = "";
  vendor = false;
  email = "";
  registered = "";
  client = false;
  title='Profile';
  showManageStoreComponent = false;
  approved: any;
  gender: any;
  city: any;
  active: any;
  zipcode: any;
  createdAt:any;
  location:any;
  mapurl:any;
  orders:any;
  dataSource = new MatTableDataSource<OrdersData>();  // Initialize in the class
  storesDataSource= new MatTableDataSource<StoresData>();
  chartData:any = {
      paymentStatus: {},
      overallStatus: {},
      storesNoProducts: {},
      storesValue: {},


  };
  chartInstances: Map<any, Chart> = new Map();
  
  constructor(private socketService: SocketService, private ms: MasterServiceService, private router: Router, private domSanitizer:DomSanitizer, private authService: AuthService, private dialog: MatDialog, private cdr: ChangeDetectorRef, private currency: CurrencyPipe) { 
  
  }
  openDialog(){
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    this.dialog.open(CreatestoreComponent, dialogConfig);

  }
  userLogout(){
    this.authService.logout();
  }
  
  range(count: number) {
    return Array.from({length: count}, (x, i) => i + 1);
  }
  editUserInfo(){
      
  }

  calculateTimeDifference(dateString: string): string {
    const targetDate = new Date(dateString);
    const currentDate = new Date();

    // Get the total difference in milliseconds
    const diffInMs = Math.abs(currentDate.getTime() - targetDate.getTime());

    // Helper values for conversions
    const msPerSecond = 1000;
    const msPerMinute = msPerSecond * 60;
    const msPerHour = msPerMinute * 60;
    const msPerDay = msPerHour * 24;
    const msPerWeek = msPerDay * 7;
    const msPerMonth = msPerDay * 30.44;  // Average month length
    const msPerYear = msPerDay * 365.25;  // Accounting for leap years

    // Calculate years, months, weeks, days, hours, minutes, and seconds
    const years = Math.floor(diffInMs / msPerYear);
    const remainingAfterYears = diffInMs % msPerYear;

    const months = Math.floor(remainingAfterYears / msPerMonth);
    const remainingAfterMonths = remainingAfterYears % msPerMonth;

    const weeks = Math.floor(remainingAfterMonths / msPerWeek);
    const remainingAfterWeeks = remainingAfterMonths % msPerWeek;

    const days = Math.floor(remainingAfterWeeks / msPerDay);
    const remainingAfterDays = remainingAfterWeeks % msPerDay;

    const hours = Math.floor(remainingAfterDays / msPerHour);
    const remainingAfterHours = remainingAfterDays % msPerHour;

    const minutes = Math.floor(remainingAfterHours / msPerMinute);
    const remainingAfterMinutes = remainingAfterHours % msPerMinute;

    const seconds = Math.floor(remainingAfterMinutes / msPerSecond);

    // Conditional logic for returning only two units at once
    if (years > 0 && months > 0) {
        return `${years} year${years !== 1 ? 's' : ''}, ${months} month${months !== 1 ? 's' : ''}`;
    } else if (months > 0 && weeks > 0) {
        return `${months} month${months !== 1 ? 's' : ''}, ${weeks} week${weeks !== 1 ? 's' : ''}`;
    } else if (weeks > 0 && days > 0) {
        return `${weeks} week${weeks !== 1 ? 's' : ''}, ${days} day${days !== 1 ? 's' : ''}`;
    } else if (days > 0 && hours > 0) {
        return `${days} day${days !== 1 ? 's' : ''}, ${hours} hour${hours !== 1 ? 's' : ''}`;
    } else if (hours > 0 && minutes > 0) {
        return `${hours} hour${hours !== 1 ? 's' : ''}, ${minutes} minute${minutes !== 1 ? 's' : ''}`;
    } else if (minutes > 0 && seconds > 0) {
        return `${minutes} minute${minutes !== 1 ? 's' : ''}, ${seconds} second${seconds !== 1 ? 's' : ''}`;
    } else if (seconds > 0) {
        return `${seconds} second${seconds !== 1 ? 's' : ''}`;
    } else {
        return '0 seconds';
    }
  }

  

  @ViewChild('ordersPaginator') ordersPaginator!: MatPaginator;
@ViewChild('storesPaginator') storesPaginator!: MatPaginator;


   

  async ngOnInit() { 
    // change the window title
    // get the user id from the local storage
    this.userId = localStorage.getItem('userId');
    
    // get user details from auth service
    this.authService.getUser(this.userId).subscribe((data: any) => {
      if(data.success){
        const date = new Date(data.data.dob);
        this.avatar = data.data.avatar;
        this.name = data.data.fname+" "+data.data.lname;
        this.phone = data.data.phone;
        this.dob = date.getDate()+"/"+(date.getMonth()+1)+"/"+date.getFullYear();
        this.verified = data.data.verified;
        this.address = data.data.address.toUpperCase();
        this.vendor = data.data.vendor;
        this.email = data.data.email;
        this.registered = data.data.createdAt;
        this.client = data.data.client;
        this.approved = data.data.approved;
        this.gender = data.data.gender.toUpperCase()
        this.city = data.data.city.toUpperCase();
        this.active = data.data.active;
        this.zipcode = data.data.zipcode;
        this.location = data.data.location;

      }
      window.document.title = this.title+" | "+this.name;
      const mapurl = `https://www.google.com/maps/embed/v1/place?key=AIzaSyDdvqTHmz_HwPar6XeBj8AiMxwzmFdqC1w&q=(${this.location.latitude},${this.location.longitude})&center=${this.location.latitude},${this.location.longitude}&zoom=18&maptype=roadmap`;
      this.mapurl = this.domSanitizer.bypassSecurityTrustResourceUrl(mapurl);


    }

    

    
    
    );
    // get user orders
    this.ms.getUserOrders(this.userId).subscribe((res: any) => {
      if (res.success && res.data.length > 0) {
        this.orders = res.data;  
        this.dataSource = new MatTableDataSource<OrdersData>(this.orders);
        this.dataSource.paginator = this.ordersPaginator;
        this.generateChartData()

      }
    });

    this.ms.getStoresAndProductsByOwnerId(this.userId).subscribe((res: any) => {
      if (res.success && res.data) {
        this.stores = res.data;
        this.storesDataSource = new MatTableDataSource<StoresData>(this.stores);
        this.storesDataSource.paginator = this.storesPaginator;
        this.generateChartData()
      }
    });



    

    
  
   }

   ngAfterViewInit() {
    
      // Existing subscription code
      this.ms.getUserOrders(this.userId).subscribe((res: any) => {
        if (res.success && res.data.length > 0) {
          this.orders = res.data;  
          this.dataSource = new MatTableDataSource<OrdersData>(this.orders);
          this.dataSource.paginator = this.ordersPaginator;
          this.generateChartData()
        }
      });
      this.ms.getStoresAndProductsByOwnerId(this.userId).subscribe((res: any) => {
        if (res.success && res.data) {
          this.stores = res.data;
          this.storesDataSource = new MatTableDataSource<StoresData>(this.stores);
          this.storesDataSource.paginator = this.storesPaginator;
          this.generateChartData()
        }

      });
    

    



  }
  
  

  generateColors(count: number) {
    // Define a refined palette with indigo, pink, lavender, green, gray, and deep blue shades
    const colors = [
      '#F48FB1', '#F06292', '#F8BBD0', // Pink shades
      '#B39DDB', '#D1C4E9', '#EDE7F6', // Lavender shades
    ];
  
    // Create a function to generate a random color from the array
    const getRandomColor = () => colors[Math.floor(Math.random() * colors.length)];
  
    // Generate an array of random colors up to the given count
    return Array.from({ length: count }, () => getRandomColor());
  }
  
  
  

   getAdjustedIndex(index: number): number {
      return index + (this.ordersPaginator.pageIndex * this.ordersPaginator.pageSize) + 1;
    }


    generateChartData() {
      if (this.orders) {
          this.orders.forEach((order: any) => {
              const paymentStatus = order.paymentStatus;
              this.chartData.paymentStatus[paymentStatus] = 
                  (this.chartData.paymentStatus[paymentStatus] || 0) + 1;
  
              const overallStatus = order.overallStatus;
              this.chartData.overallStatus[overallStatus] = 
                  (this.chartData.overallStatus[overallStatus] || 0) + 1;
          });

          this.storesDataSource.data.forEach((store: any) => {
            const name = store.storeName;  // Get store name
            const items = store.numberOfProducts;  // Get the number of products in the store
            const value = store.totalValue;  // Get the total value for the store
          
            // Update storesNoProducts with the number of products for each store
            this.chartData.storesNoProducts[name] = items;
          
            // Update storesValue with the total value for each store
            this.chartData.storesValue[name] = value;
          });

          
  
          // Create chart for payment status
          this.createChart(this.piechart.nativeElement, 'doughnut', {
              labels: Object.keys(this.chartData.paymentStatus),
              datasets: [
                  {
                      label: 'Payment Status',
                      data: Object.values(this.chartData.paymentStatus),
                      backgroundColor:["#69F0AE",'#C2185B'],
                  },
              ],
          }, "Payment Status");
  
          // Optionally create another chart for overall status
          this.createChart(this.chartCanvas.nativeElement, 'doughnut', {
              labels: Object.keys(this.chartData.overallStatus),
              datasets: [
                  {
                      label: 'Order Status',
                      data: Object.values(this.chartData.overallStatus),
                      backgroundColor: this.generateColors(Object.keys(this.chartData.overallStatus).length),
                  },
              ],
          }, "Order Status");

          this.createChart(this.storeBarChart.nativeElement, 'bar', {
              labels: Object.keys(this.chartData.storesValue),
              datasets: [
                  {
                      label: 'Stock Value',
                      data: Object.values(this.chartData.storesValue),
                      backgroundColor: this.generateColors(Object.keys(this.chartData.storesValue).length),
                  },
              ],
          }, "Stock");
          this.createChart(this.storePieChart.nativeElement, 'doughnut', {
            labels: Object.keys(this.chartData.storesNoProducts),
            datasets: [
                {
                    label: 'Number of Products',
                    data: Object.values(this.chartData.storesNoProducts),
                    backgroundColor: this.generateColors(Object.keys(this.chartData.storesNoProducts).length),
                },
            ],
        }, "# Products");
      }
    }
  

    

    openVerificationDialog(){
      const data ={
        zipcode: this.zipcode,
        phone: this.phone,
        signature:"3wZsyyh51s9"
      }

      this.authService.sendTwilioOTP({mobilenumber: data.zipcode+data.phone.slice(1), signature: data.signature}).subscribe((res:any)=>{
        if(res.success){
          this.dialog.open(VerifyComponent, {
            data: data, 
          })
          
        }
      })

      
    }

    createChart(
      chartElement: any,
      chartType: any,
      chartData: any,
      chartLabel: any = ""
    ) {
      // Check if there's an existing chart for the canvas and destroy it
      if (this.chartInstances.has(chartElement)) {
        this.chartInstances.get(chartElement)?.destroy();
        this.chartInstances.delete(chartElement);
      }
    
      // Determine axis configuration based on chart type
      const axisConfig =
        chartType === "bar" || chartType === "line"
          ? {
              y: {
                display: true,  // Show the Y-axis
                beginAtZero: true,
              },
              x: {
                display: true,  // Show the X-axis
              },
            }
          : undefined;
    
      const newChart = new Chart(chartElement, {
        type: chartType,
        data: chartData,
        options: {
          responsive: true,
          plugins: {
            ChartDataLabels,
            datalabels: {
              display: true,
              formatter: (value: any) => `${value}`,
              color: chartType === 'bar' || chartType === 'line' ? 'black' : 'white',
              rotation: chartType === 'bar' || chartType === 'line' ? 270 : 0, 
            },
            tooltip: {
              enabled: true,
            },
            legend: {
              display: false,
            },
          },
          scales: axisConfig,  // Apply the axes configuration if chart type is bar or line
        },
        plugins:
          chartType === "doughnut"
            ? [
                {
                  id: "centerLabelPlugin",
                  beforeDraw(chart) {
                    const { width, height, ctx } = chart;
                    ctx.save();
    
                    const fontSize = (height / 250).toFixed(2);
                    ctx.font = `${fontSize}em sans-serif`;
                    ctx.textBaseline = "middle";
                    ctx.fillStyle = "black";
    
                    const text = chartLabel;
                    const textX = Math.round(
                      (width - ctx.measureText(text).width) / 2
                    );
                    const textY = height / 2;
    
                    ctx.fillText(text, textX, textY);
                    ctx.restore();
                  },
                },
              ]
            : [],  // No plugin for other chart types
      });
    
      this.chartInstances.set(chartElement, newChart);
    
      return newChart;
    }
    
    
    

    
    

    
   


  

}
