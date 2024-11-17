import { Component, ElementRef, OnInit, ViewChild, ViewContainerRef, ComponentFactoryResolver, Type, AfterViewInit, QueryList, ViewChildren } from '@angular/core';
import { AuthService } from 'src/app/auth.service';
import { Store } from 'src/app/mystores/stores-dashboard/stores-interface';
import { SocketService } from 'src/app/services/socket.service';
import { NavigationEnd, Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { ManageStoresComponent } from '../manage-stores/manage-stores.component';
import { MasterServiceService } from 'src/app/services/master-service.service';
import { computePercentageOfExpectedGrossProfit } from 'src/app/services/computations';
import { DomSanitizer } from '@angular/platform-browser';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { AddProductsComponent } from '../add-products/add-products.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSort } from '@angular/material/sort';
import { SelectionModel } from '@angular/cdk/collections';
import { Product } from 'src/app/Interfaces/interfaces-master-file';
import { EditProductModalComponent } from '../view-products/edit-product-modal/edit-product-modal.component';
import moment from 'moment';
import { FormControl } from '@angular/forms';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';

@Component({
  selector: 'app-stores-dashboard',
  templateUrl: './stores-dashboard.component.html',
  styleUrls: ['./stores-dashboard.component.css'],
})
export class StoresDashboardComponent implements OnInit, AfterViewInit{
  @ViewChild('componentoutlet', { read: ViewContainerRef }) componentOutlet!: ViewContainerRef;
  dataSource = new MatTableDataSource<any>([]);
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  // refactored
  dataSources: MatTableDataSource<Product>[] = [];
  @ViewChildren(MatPaginator) paginators!: QueryList<MatPaginator>;
  
  selection = new SelectionModel<Product>(true, []);
  [key: string]: any;
  stores: Store[] = [];
  userId!: any;
  reload = false;
  storeid!: any;
  cepgp!: any;
  storeProfitability: any = {};
  activeStore:any;
  activeStoreID!: any;
  storename!: any;
  location!: any;
  mapurl!: any;
  length!: any;
  products: any;
  showProductFeatures!: boolean;
  showEditProduct!: boolean;
  title = "Stores Dashboard";
  displayedStoreProductsColumns: string[] = ['select', 'name', 'brand', 'model', 'category', 'subcategory', 'bp', 'sp', 'quantity', 'approved', 'Actions'];
  selected = new FormControl(0);

  constructor(
    private ms: MasterServiceService,
    private router: Router,
    private activateRoute: ActivatedRoute,
    private authService: AuthService,
    private socketService: SocketService,
    private componentFactoryResolver: ComponentFactoryResolver,
    private domSanitizer: DomSanitizer,
    private dialog: MatDialog,
    private skb: MatSnackBar
  ) {
  }

  ngOnInit() {
    this.userId = localStorage.getItem('userId');  
    this.activeStore = localStorage.getItem('activeStorename');
    
    // Fetch stores associated with the user
    this.authService.getStores(this.userId).subscribe((response: any) => {
      if (response.success) {
        this.stores = response.data;

        // Ensure the map is loaded with the active store's location
        this.loadActiveStoreMap();
      }
    });

    this.ms.getPrdoucts(localStorage.getItem('storeId')).subscribe((response: any) => {
      if (response.success) {
        this.dataSource = response.data;
        this.dataSource.paginator = this.paginator;
      }
    });
  }

  ngAfterViewInit(): void {
    this.ms.getPrdoucts(localStorage.getItem('storeId')).subscribe((response: any) => {
      if (response.data) {
        this.dataSource = new MatTableDataSource(response.data);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
      }
    });   
        
  }
  
 

  async loadStoreProducts(stores:any){
    stores.forEach((store:any) => {
      this.ms.getPrdoucts(store._id).subscribe((response:any)=>{
        this.dataSources.push(response.data)
      })
      
    });

  }

  exportToPDF(tableId: string | undefined, header?: string): void {
    if (!tableId) {
      console.error('Table ID is required');
      return; // Return early if tableId is undefined or empty
    }
  
    // Get the table element by the provided table ID
    const table = document.getElementById(tableId);
  
    if (!table) {
      console.error(`Table with id "${tableId}" not found`);
      return; // Return early if the table is not found
    }
  
    // Clone the table to keep the original HTML intact
    const tableClone = table.cloneNode(true) as HTMLTableElement;
  
    // Get all the rows of the table
    const rows = tableClone.querySelectorAll('tr');
  
    // Find the number of columns (cells) in the first row
    const firstRow = rows[0];
    const cellsCount = firstRow ? firstRow.cells.length : 0;
  
    // Check if there are at least 2 columns to remove
    if (cellsCount > 2) {
      // Loop through each row and remove the last two columns
      rows.forEach(row => {
        const cells = row.querySelectorAll('td, th'); // Include header cells as well
        if (cells.length > 2) {
          // Remove last two columns (th or td)
          row.deleteCell(cells.length - 1); // Remove last column
          row.deleteCell(cells.length - 2); // Remove second last column
        }
      });
    }
  
    // Create a new jsPDF instance with landscape orientation
    const doc = new jsPDF('p', 'mm', 'a4'); // 'l' for landscape, 'a4' size
  
    const headerHeight = 20;  // Adjust header height
    const secondLineMargin = 10;  // Margin for the second header line
    const tableTop = headerHeight; // Space between header and table
  
    // If a header is provided, add it to the PDF
    if (header) {
      doc.setFontSize(18);
      doc.text(header, 15, headerHeight);  // Placing first header line
    }
  
    // Second hardcoded line: "Nisoko Technologies"
    doc.setFontSize(13);  // Smaller font for the second line
    doc.text('Powered by Nisoko Technologies: Contact: 254701-650-736 | 254797-773-450', 15, headerHeight + secondLineMargin);  // Placing the second header line
  
    // Use the `html` method from jsPDF to capture the cloned table and convert it to PDF
    doc.html(tableClone, {
      callback: (doc) => {
        // Save the generated PDF to the client
        doc.save(`${header}.pdf`);
      },
      margin: [tableTop, 3, 10, 3],  // Increase top margin to account for header and proper alignment
      x: 10,
      y: tableTop,  // Place the table immediately below the header
      width: 180,  // Width of the table in the PDF
      windowWidth: 800,  // Window width for scaling the content
    });
  }
  
  
  
  
  
  
  
  

  exportToExcel(tableId: string | undefined): void {
    if (!tableId) {
      console.error('Table ID is required');
      return; // Return early if tableId is undefined or empty
    }

    // Get the table element by the provided table ID
    const table = document.getElementById(tableId);

    if (!table) {
      console.error(`Table with id "${tableId}" not found`);
      return; // Return early if the table is not found
    }

    // Convert the table to worksheet
    const ws: XLSX.WorkSheet = XLSX.utils.table_to_sheet(table);

    // Ensure that the worksheet has a valid ref before proceeding
    if (!ws['!ref']) {
      console.error('No valid range reference found in the worksheet');
      return; // Exit early if the range reference is not available
    }

    // Decode the range from the worksheet reference
    const range = XLSX.utils.decode_range(ws['!ref']);
    
    // Remove the last two columns by adjusting the range
    range.e.c -= 2; // Decrease the last column index by 2
    
    // Set the range in the worksheet (this adjusts the number of columns)
    ws['!ref'] = XLSX.utils.encode_range(range);

    // Create a new workbook and append the worksheet
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

    // Set the cell style for wrapping text
    // Loop through all rows and columns in the worksheet
    for (let row = range.s.r; row <= range.e.r; row++) {
      for (let col = range.s.c; col <= range.e.c; col++) {
        const cellAddress = { r: row, c: col };  // Row and column indexes
        const cellRef = XLSX.utils.encode_cell(cellAddress); // Convert to cell reference (like 'A1', 'B2', etc.)
        
        const cell = ws[cellRef]; // Get the actual cell object
        
        if (cell && !cell.s) {
          cell.s = {}; // Initialize cell style if it doesn't exist
        }

        if (cell) {
          cell.s['wrapText'] = true; // Set wrap text style
        }
      }
    }

    // Trigger the download of the Excel file with a dynamic name
    XLSX.writeFile(wb, `${tableId}.xlsx`);
  }

   // Load the map URL dynamically when a store is selected
   private updateStoreMap(latitude: number, longitude: number): void {
    const mapUrl = `https://www.google.com/maps/embed/v1/place?key=AIzaSyDdvqTHmz_HwPar6XeBj8AiMxwzmFdqC1w&q=(${latitude},${longitude})&center=${latitude},${longitude}&zoom=18&maptype=roadmap`;
    this.mapurl = this.domSanitizer.bypassSecurityTrustResourceUrl(mapUrl);
  }

  // Function to ensure the map is correctly set for the active store when the page reloads
  private loadActiveStoreMap() {
    const activeStoreId = localStorage.getItem('storeId');
    if (activeStoreId) {
      const activeStore:any = this.stores.find(store => store._id === activeStoreId);
      if (activeStore && activeStore.location) {
        this.updateStoreMap(activeStore.location.latitude, activeStore.location.longitude);
      }
    }
  }
  

  setActiveStoreID(event: any) {
    if (event.value) {
      // Set the active store in localStorage
      localStorage.setItem("storeId", event.value._id);
      localStorage.setItem("activeStorename", event.value.storename);

      // Update component variables
      this.activeStore = event.value.storename;
      this.storename = event.value.storename;

      // Clear current data to show empty state while loading new data
      this.dataSource.data = [];

      // Fetch new data for the selected store
      this.ms.getPrdoucts(event.value._id).subscribe((response: any) => {
        if (response.data) {
          // Populate dataSource with new data
          this.dataSource.data = response.data;

          // Update paginator and sorter
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;
        }
      });

      // Update map URL for the new store's location
      this.updateStoreMap(event.value.location.latitude, event.value.location.longitude);
    }
  }
  
  

  _setDataSource(indexNumber: any) {
    const dataSource = this[`dataSource${indexNumber}`];
    const paginator = this[`paginator${indexNumber}`];

    if (dataSource && paginator) {
      dataSource.paginator = paginator;
      dataSource.sort = this.sort; // Setting the sort if required
    }
  }

  // Manage store
  async manageStore(id: any) {
    const data = { userid: this.userId, storeId: id };
    this.router.navigate(['dashboard/stores-dashboard/manage-store/'], { queryParams: { userId: this.userId, storeId: id } });
  }

  addProductToStore(storeid: any) {
    // Navigate to add product page
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.width = "90%";
    dialogConfig.data = {
      storeid: storeid,
      storename: this.storename
    };
    this.dialog.open(AddProductsComponent, dialogConfig);
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

  editProduct(id: any) {
    this.showEditProduct = true;
    this.showProductFeatures = false;
    this.ms.fetchProductDetails(id).subscribe((data: any) => {
      if (data.success) {
        const dialogref = this.dialog.open(EditProductModalComponent, {
          data: data.product[0],
          width: 'auto',
          height: 'auto'
        });
      }
    });
  }

  deleteProduct(id: any, name: any, model: any) {
    if (confirm(`Do you want to delete Product: ${name} Model: ${model}? Click OK to Proceed or CANCEL to Exit.`)) {
      this.authService.deleteProduct(id).subscribe((data: any) => {
        if (data.success) {
          this.openSkb(data.message);
        }
      });
    }
  }

  dataRepopulate(storeid: any) {
    this.ms.getPrdoucts(storeid).subscribe((data: any) => {
      this.products = data.data;
      this.dataSource = new MatTableDataSource(this.products);
      this.dataSource.paginator = this.paginator; // Set the paginator initially
      this.dataSource.sort = this.sort; // Set the sort initially
      this.length = this.dataSource.data.length;
    });
  }

  toggleAllRows() {
    if (this.isAllSelected()) {
      this.selection.clear(); // Clear all selected rows
    } else {
      this.selection.select(...this.dataSource.data); // Select all rows
    }
  }
  

  checkboxLabel(product?: Product): string {
    if (!product) {
      return `${this.isAllSelected() ? 'deselect' : 'select'} all`;
    }
    return `${this.selection.isSelected(product) ? 'deselect' : 'select'} Product ${product.name}`;
  }
  

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource?.data?.length || 0; // Use dataSource.data.length here
    return numSelected === numRows;
  }
  

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  openSkb(message: any) {
    this.skb.open(message, 'CLOSE', {
      horizontalPosition: 'right',
      verticalPosition: 'bottom'
    });
  }

  async getProfitability() {
    for (const store of this.stores) {
      this.cepgp = await computePercentageOfExpectedGrossProfit(this.storeid, this.ms, this.authService);
      Object.assign(this.storeProfitability, { [store.storename]: this.cepgp });
    }
  }
}
