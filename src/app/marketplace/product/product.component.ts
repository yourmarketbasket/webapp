import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router} from '@angular/router';
import { MasterServiceService } from 'src/app/services/master-service.service';
import { getKForPrice } from 'src/app/services/computations';
import { CartService } from 'src/app/services/cart.service';
import { AddToCartComponent } from '../add-to-cart/add-to-cart.component';
import { MatDialog } from '@angular/material/dialog';
import { SocketService } from 'src/app/services/socket.service';
import { SharedDataService } from 'src/app/services/shared-data.service';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-product',
    templateUrl: './product.component.html',
    styleUrls: ['./product.component.css'],
    standalone: false
})
export class ProductComponent implements OnInit{

  // properties
  productid:any;
  product!:any;
  pname!:any;
  storeid!:any;
  brand!:any;
  category!:any;
  subcategory!:any;
  model!:any;
  description!:any;
  sp!:any;
  avatar!:any;
  quantity!:any;
  features!:any;
  posted!:any
  displayimg!:any;
  discount!:any;
  price!:any;
  userid!:any;
  disableAddToCartButton:boolean = false;
  addtocartfeedback!:any;
  currency:any;
  location:any;
  views:any;
  sold:any;

  // methods
  ngOnInit() { 
    this.sharedDataService.productData$.subscribe((data) => {
      if(data){
        this.product = data;
        this.posted = this.product.createdAt 
        this.productid = this.product._id
         this.pname = this.product.name
         this.avatar = this.product.avatar
         this.displayimg = this.avatar[0]
         this.discount = this.product.discount;
         this.model = this.product.model;
         this.brand = this.product.brand;
         this.features = this.product.features;
         this.description = this.product.description;
         this.subcategory = this.product.subcategory;
         this.category = this.product.category;
         this.price = this.product.sp;
         this.storeid = this.product.storeid;
         this.location = this.product.storeLocation;
         this.currency = this.product.storeCurrency;
         this.views = this.product.views;
         this.sold = this.product.sold;


      
      }
      localStorage.getItem('userId') ? this.getAvailableProductQuantity(localStorage.getItem('userId'),this.product._id): null;

      this.socketService.listen('cartoperationsevent').subscribe((data:any) => {
        if(data.userid==localStorage.getItem('userId') && data.productid==this.productid){
          this.ms.getAvailableQuantityForUser({userid:localStorage.getItem('userId'), productid:this.productid}).subscribe((res:any)=>{
            if(res.success){
              this.quantity = res.quantity
            }
  
          })        
        }
        // Your logic for product added to cart event
      });

    });

    
    
    
    
    const data = {
      uid: localStorage.getItem('userId'),
      pid: this.product._id
    }
    localStorage.getItem('userId') ? this.ms.addProductView(data).subscribe((res:any)=>{
    }): null;
    // fetch the product data
    

    
  }
  // get the available quantity 
  getAvailableProductQuantity(userid:any, productid:any){
    const data = {
      userid: userid,
      productid: productid
    }
    this.ms.getAvailableQuantityForUser(data).subscribe((res:any)=>{
      if(res.success){
        this.quantity = res.quantity
      }
    })
  }
  
  setDisplayImage(image:any){
    this.displayimg = image
  }
  calculateDiscountedPrice(price:any,discount:any){
    if(!discount || discount==0){
      return price == null?"":price
    }else{
      const dp = ((100-discount)/100)*price
      return dp == null?"":dp
    }
  }
  // calculate remaining percentage
  calculateRemainingQuantityPercentage(sold: number = 0, quantity: any): { remainingQuantity: number, remainingPercentage: number } {
    console.log(sold)
    // Ensure quantity is a valid number and greater than 0
    if (quantity <= 0) {
      return { remainingQuantity: 0, remainingPercentage: 0 };  // If quantity is 0 or negative, return 0 for both
    }
    
    // If sold is undefined or null, it defaults to 0
    const soldValue = sold ?? 0;
  
    // Calculate the remaining quantity
    const remainingQuantity = Math.abs(quantity - soldValue);
  
    // Calculate the percentage of remaining quantity
    const remainingPercentage = Math.abs(remainingQuantity / (quantity+sold)) * 100;
  
    // Return the remaining quantity and percentage, ensuring percentage doesn't exceed 100% or go below 0%
    return {
      remainingQuantity: Math.max(0, remainingQuantity), // Ensure remainingQuantity is not negative
      remainingPercentage: Math.max(0, Math.min(100, remainingPercentage)) // Ensure remainingPercentage is between 0 and 100
    };
  }
  
  

  // constructor
  constructor(private cartServive: CartService,private socketService:SocketService, private router: Router, private route: ActivatedRoute, private ms:MasterServiceService, private dialog: MatDialog, private sharedDataService:SharedDataService){}
  // show thousands in k
  thousandsInK(price:any){
    return getKForPrice(price)
  }
  // checkout
  viewCart(){
    this.router.navigate(['/market_place/cart'])
  }
  addToCart(id: any, storeid: any, quantity: any, model: any, name: any, price: any, avatar: any, discount: any) {
    const userid = localStorage.getItem('userId');
    if (userid) {
      const dialogRef = this.dialog.open(AddToCartComponent, {
        width: '400px',
        disableClose: true,
        data: {
          id: id,
          quantity: quantity
        }
      });
  
      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          const data = {
            userid: localStorage.getItem('userId'),
            name: name,
            productid: result.productid,
            storeid: storeid,
            quantity: result.qtty,
            available: quantity,
            model: model,
            totalcost: (price * result.qtty),
            price: this.price,
            avatar: avatar,
            discount: discount ? discount : 0
          };
  
          this.ms.addToCart(data).subscribe((response: any) => {
            this.quantity = response.available;
            this.addtocartfeedback = response.message;
  
            if (response.success) {
              // Show SweetAlert success message with the response message
              Swal.fire({
                icon: 'success',
                title: 'Success!',
                text: response.message, // Use the message from response
              });
  
              if (response.available === 0) {
                this.disableAddToCartButton = true;
              }
            } else {
              // Show SweetAlert error message with the response message
              Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: response.message, // Use the message from response
              });
  
              this.disableAddToCartButton = true;
            }
          });
        }
      });
    } else {
      this.router.navigate(['/login']);
    }
  }
}
