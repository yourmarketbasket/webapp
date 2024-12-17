import { Component, OnInit, Optional } from '@angular/core';
import { MdbModalRef } from 'mdb-angular-ui-kit/modal';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { MasterServiceService } from '../services/master-service.service';

@Component({
  selector: 'app-view-order',
  templateUrl: './view-order.component.html',
  styleUrl: './view-order.component.css'
})
export class ViewOrderComponent implements OnInit{
  title: string | null = null;
  order: any;
  mapUrl:any;
  origin:any;
  destination:any;
  orderAction:any;
  orderToProcess:any;

  constructor(public modalRef: MdbModalRef<ViewOrderComponent>, private domSanitizer: DomSanitizer, private ms: MasterServiceService){
    
  }
  
  ngOnInit(): void {
    this.order = this.modalRef.component;
    this.title = `Order Tracking ID [${this.order.transactionID}]`
    console.log(this.order);
    // map url
    const origin = `${this.order.origin.latitude},${this.order.origin.longitude}`; // Replace with your origin coordinates
    const destination = `${this.order.destination.latitude},${this.order.destination.longitude}`; 
    const mapurl = `https://www.google.com/maps/embed/v1/directions?key=AIzaSyDdvqTHmz_HwPar6XeBj8AiMxwzmFdqC1w&origin=${origin}&destination=${destination}&mode=driving`;
    this.mapUrl = this.domSanitizer.bypassSecurityTrustResourceUrl(mapurl);

  }

  confirmOrderAction(action:any, id:any){
    if(this.orderAction){
      this.ms.markOrderStatus({status:action, orderId:this.orderToProcess._id, productid:id}).subscribe((res:any)=>{
        if(res.success){
          this.orderToProcess = null;
        }
      })
    }

  }

  isArray(products: any): boolean {
    return Array.isArray(products);
  }

}
