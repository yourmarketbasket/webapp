import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { SelectionModel } from '@angular/cdk/collections';
import { Order } from 'src/app/Interfaces/interfaces-master-file';
import { MasterServiceService } from 'src/app/services/master-service.service';
import { MatDialog } from '@angular/material/dialog';
import { ProcessOrderComponent } from 'src/app/mystores/process-order/process-order.component';
import { SelectStoreDialogComponent } from './select-store-dialog/select-store-dialog.component';
import { AuthService } from 'src/app/auth.service';



@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.css']
})

export class OrdersComponent implements OnInit, AfterViewInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  storeid: any;
  selectedStore: any;
  displayedColumns: string[] = ['select','Client', 'Contact',  'Pay Status', 'OrderStatus','TransactionID', 'Actions'];
  selection = new SelectionModel<Order>(true, []);
  OrdersDataSource = new MatTableDataSource<Order>([]); // Initialize with an empty data source
  orders: Order[] = [];
  userid: any;
  stores:any;
  store:any;
  storename:any;

  constructor(private ms: MasterServiceService, private dialog: MatDialog, private authService: AuthService) {}

  ngOnInit(): void {

    this.authService.getStores(localStorage.getItem('userId')).subscribe((response: any) => {
      if (response.success) {
        this.stores = response.data;
      }
    });


    this.selectedStore = localStorage.getItem('selectedStore');
    this.storename = localStorage.getItem('viewOrdersStoreName');

    if (!this.selectedStore) {
      this.selectStore(this.selectedStore);
    }else{

      this.getStoreOrders(this.selectedStore);
    }
  }

  ngAfterViewInit(): void {
    this.ms.getStoreOrders(localStorage.getItem('selectedStore')).subscribe((response: any) => {
      if (response.data) {
        this.OrdersDataSource = new MatTableDataSource(response.data);
        this.OrdersDataSource.paginator = this.paginator;
        this.OrdersDataSource.sort = this.sort;
      }
    });   
        
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.OrdersDataSource.filter = filterValue.trim().toLowerCase();

    if (this.OrdersDataSource.paginator) {
      this.OrdersDataSource.paginator.firstPage();
    }
  }

  selectStore(storeid:any) {
    this.storename = this.store.storename;
    localStorage.removeItem("viewOrdersStoreName");
    localStorage.setItem('viewOrdersStoreName',this.store.storename)
    localStorage.removeItem("selectedStore");
    localStorage.setItem("selectedStore",storeid);
    this.getStoreOrders(storeid);
  }

  getStoreOrders(storeid: any) {
    this.orders = [];
    this.ms.getStoreOrders(storeid).subscribe((res: any) => {
      this.orders = res.orders;
      this.OrdersDataSource.data = this.orders; 
      this.OrdersDataSource.paginator = this.paginator;
      this.OrdersDataSource.sort = this.sort;
      
    });
  }

  processOrder(data: any) {
    if(data){
      const dialogRef = this.dialog.open(ProcessOrderComponent, {
        data: data,
        width: 'auto',
        height: 'auto'
      });
    }else{
      console.log("no data from parent")
    }
  }

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.OrdersDataSource.data.length;
    return numSelected === numRows;
  }

  toggleAllRows() {
    if (this.isAllSelected()) {
      this.selection.clear();
    } else {
      this.selection.select(...this.OrdersDataSource.data);
    }
  }

  checkboxLabel(order?: Order): string {
    if (!order) {
      return `${this.isAllSelected() ? 'deselect' : 'select'} all`;
    }
    return `${this.selection.isSelected(order) ? 'deselect' : 'select'} Product ${order.buyername}`;
  }
}
