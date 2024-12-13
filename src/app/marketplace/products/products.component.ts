import { Component,OnInit, HostListener, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { MasterServiceService } from 'src/app/services/master-service.service';
import { truncateString } from 'src/app/services/computations';
import { Router } from '@angular/router';
import { AddToCartComponent } from '../add-to-cart/add-to-cart.component';
import { MatDialog } from '@angular/material/dialog';
import { SharedDataService } from 'src/app/services/shared-data.service';
import { SocketService } from 'src/app/services/socket.service';
import { NzCarouselComponent } from 'ng-zorro-antd/carousel';
import { FormBuilder, FormGroup } from '@angular/forms';


@Component({
    selector: 'app-products',
    templateUrl: './products.component.html',
    styleUrls: ['./products.component.css'],
    standalone: false
})
export class ProductsComponent implements OnInit,OnDestroy{
    rating = 3.7;
    id = "tsparticles";
    particlesUrl = "http://foo.bar/particles.json";

    ariaValueText(current: number, max: number) {
      return `${current} out of ${max} hearts`;
    }
    products:any[] = [];
    err!:any;
    page:number = 1;
    limit:number = 20;
    userid!:any;
    searchQuery!:any;
    searchedProduct:any[]=[]
    numberOfResults:any;
    numberofDisplayedProducts!:number;
    hasMore!:boolean;
    searchStartIndex:number = 0;
    searchBatchSize:number = 5;
    array = [1, 2, 3, 4];
    dotPosition = 'bottom';
    carouselData!:any;
    carouselProducts:any[]=[];
    totalPages:number = 0;
    currentPage:number = 1;
    productItemsPerPage:number = 20;
    filterAmountMinValue:number=0;
    filterAmountMaxValue:number=0;
    allproductsloading!:boolean;
    searchproductsloading!:boolean;
    currentImageIndex = 0;
    imageLoopInterval: any;
    isCollapsed=true;//placeholder
    isCollapsed1=true;//placeholder
    isCollapsed3=true;//placeholder
    collapse1: any;
    isChecked=true;
    carouselStaticImages!:any;
    public someRange: number[] = [0.00, 10000.00];//placeholder
    form!: FormGroup;

  


    @ViewChild(NzCarouselComponent, { static: false })
    myCarousel!: NzCarouselComponent;
    imageLoopData: { [key: string]: { currentImageIndex: number; imageLoopInterval: any } } = {};

    @ViewChild('searchResults') searchResults!: ElementRef;
    @ViewChild('marketplace') marketplace!: ElementRef;


    goTo(index:number) {
      this.myCarousel.goTo(Number(index));
    }

    next() {
      this.myCarousel.next();
    }
    previous() {
      this.myCarousel.pre();
    }

    ngOnDestroy() {
      // Clear intervals when the component is destroyed
      for (const productId in this.imageLoopData) {
        if (this.imageLoopData[productId]?.imageLoopInterval) {
          clearInterval(this.imageLoopData[productId].imageLoopInterval);
        }
      }
    }

    ngAfterViewInit() {
      const particles = document.querySelectorAll('.particle');
      particles.forEach(particle => {
        const randomX = Math.random() * window.innerWidth;
        const randomY = Math.random() * window.innerHeight;
        (particle as HTMLElement).style.transform = `translate(${randomX}px, ${randomY}px)`;
      });
    }

    startImageLoop(productId: string, avatars: string[]) {
      // Initialize the loop data for each product if not already initialized
      if (!this.imageLoopData[productId]) {
        this.imageLoopData[productId] = { currentImageIndex: 0, imageLoopInterval: null };
      }
  
      const productLoop = () => {
        // Auto-switch the image every 3 seconds (3000 ms)
        this.imageLoopData[productId].imageLoopInterval = setInterval(() => {
          const currentIndex = this.imageLoopData[productId]?.currentImageIndex || 0;
          const nextIndex = (currentIndex + 1) % avatars.length; // Loop back to 0 after last image
          this.imageLoopData[productId].currentImageIndex = nextIndex;
        }, 3000); // Change image every 3 seconds
      };
  
      productLoop(); // Start the image loop
    }
        
   
    // truncate the name and model
    truncateName(name:any){
      return truncateString(name);
    }
    discountedPrice(sp:any,discount:any){
      if(!discount){
        return sp.toLocaleString('en-US');
      }else{
         const discountedprice = sp*((100-discount)/100);
        return discountedprice.toLocaleString('en-US')
      }

    }
    range(count: number) {
      return Array.from({length: count}, (x, i) => i + 1);
    }
    scrollToSearchResults(results: any) {
      if (results.length !== 0 && this.searchResults?.nativeElement) {
        // Scroll to the search results area
        this.searchResults.nativeElement.scrollIntoView({ behavior: 'smooth' });
      } else if (this.marketplace?.nativeElement) {
        this.marketplace.nativeElement.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
    
    
    
    // search products
    searchMarket(query:any, products:any){
      this.searchproductsloading = true;
      if(query){
          const data = {
            query: query,
            startIndex: this.searchStartIndex,
            batchSize: this.searchBatchSize
          }
          this.ms.searchProduct(data).subscribe((res:any)=>{
            this.searchedProduct = [];
            this.numberOfResults = 0;
            if(res.data.length>0){
              this.searchproductsloading = false;
              this.searchedProduct = res.data
              this.numberOfResults = res.data.length;
            }else{
              console.log("Error occured "+res.message)
              this.searchproductsloading = false;

            }
            
            this.scrollToSearchResults(this.numberOfResults);
            this.searchproductsloading = false;

          })        
      }else{
        this.searchproductsloading = false;

      } 


      

    }
    // filter products
    filterProducts(searchQuery:string){
      this.ms.setSearchQuery(searchQuery);    
  
    }
    
   
    // View product
    viewProduct(product: any) {
      // Clear the existing product data (if any)
      localStorage.removeItem('product');
      if (!product.sold || !product.discount) {
        product.sold = 0; 
        product.discount = 0 // Set default value if 'sold' is undefined or null
      }

      // Add the incoming product data
      this.sharedData.setProductData(product, 'product');
      
      // Navigate to the product view page
      this.router.navigate(['/market_place/product']);
    }

  
    // add product to cart    
    addToCart(id:any, quantity:any){
      const userid = localStorage.getItem('userId')
      if(userid){
        const dialogRef = this.dialog.open(AddToCartComponent, {
          width: '400px',
          disableClose: true,
          data: {
            id:id,
            quantity: quantity
          }
        });
        dialogRef.afterClosed().subscribe(result=>{
          console.log(result)
        })
      }else{
        this.router.navigate(['/login'])
      }     
      
    }

    
    // convert to shor scale
    convertNumberToShortScale(input: number | string, discountPercentage: number | string = '0'): string {
        const number = typeof input === 'string' ? parseFloat(input) : input;
        const discount = typeof discountPercentage === 'string' ? parseFloat(discountPercentage) : discountPercentage;
    
        if (isNaN(number)) {
            return 'Invalid input';
        }
    
        if (isNaN(discount) || discount < 0 || discount > 100) {
            return 'Invalid discount percentage';
        }
    
        const discountedNumber = number * (1 - discount / 100);
        let result = "";
    
        if (discountedNumber >= 1000000000) {
            result = `${(discountedNumber / 1000000000).toFixed(1)}B`;
        } else if (discountedNumber >= 1000000) {
            result = `${(discountedNumber / 1000000).toFixed(1)}M`;
        } else if (discountedNumber >= 1000) {
            result = `${(discountedNumber / 1000).toFixed(1)}k`;
        } else {
            result = discountedNumber.toFixed(2);
        }
    
        // Remove trailing zeros
        result = result.replace(/\.?0*$/, "");
    
        return result;
    }
  
       

    // constructor
    constructor( private fb: FormBuilder, private ms:MasterServiceService,private router:Router, private dialog: MatDialog, private sharedData: SharedDataService, private socketService:SocketService){}
    // onInit
    async ngOnInit() {
      
      this.carouselStaticImages =  await this.getCarouselImages()
      

      this.form = this.fb.group({
        dapzem1: [false] // default value (false means unchecked)
      });
      this.userid = localStorage.getItem('userId')      
      this.ms.searchQuery$.subscribe((query) => {
        this.searchQuery = query;
        this.searchMarket(this.searchQuery, this.products);
      });
      this.socketService.listen('addproductevent').subscribe((data: any) => {
        this.products.unshift(data.product);  
      });

      
     

      this.socketService.listen('viewsupdate')
        .subscribe((data:any) => {
          // Update the relevant product data based on the event data
          const updatedProducts = this.products.map((product: any) => {
            if (product._id === data._id) {
              return data; // Replace the existing product data with the updated data
            }
            return product; // Return unchanged product data for other products
          });

          this.products = updatedProducts;
        

        });      
      
      this.fetchPaginatedProducts();



      this.sharedData.productsInfo$.subscribe((data:any)=>{
        if(data){
          this.carouselData=data;
          // Iterate over the keys of the object
          Object.entries(data.products).forEach(([key, value]) => {
            this.carouselProducts.push({key, value});
            // Access the value associated with the key
          });

        }else{
          this.sharedData.getProductsInfo();
        }
      })  

      this.searchedProduct.forEach((product) => {
        this.startImageLoop(product.id, product.avatar);
      });


      
      


    }

    computeDiscountedSP(price:any, discount:any){
      if(discount){
        return price*((100-discount)/100)
      }else{
        return price;
      }
    }

    


    fetchPaginatedProducts(){
      this.allproductsloading = true;
      this.ms.getPaginatedProducts({page:this.page, limit:this.limit}).subscribe((res:any)=>{
        if(res.success){
          this.products = res.data;  
          this.totalPages =res.data.length;
        }
      this.allproductsloading = false;

      })
    }
    getPageRange(): number[] {
      const pageCount = Math.ceil(this.totalPages / this.productItemsPerPage);
      return Array(pageCount).fill(0).map((x, i) => i + 1);
    }

    setPage(page: number) {
      this.currentPage = page;
    }

    async getCarouselImages() {
      return new Promise((resolve, reject) => {
        this.ms.getCarouselStaticImages().subscribe(
          (res: any) => {
            if (res.success) {
              resolve(res.data);
            } else {
              reject('Failed to fetch carousel images');
            }
          },
          (error) => reject(error)
        );
      });
    }

    formatLabel(value: number): string {
      if (value >= 1000) {
        return Math.round(value / 1000) + 'k';
      }
  
      return `${value}`;
    }
    
    browseByCategory(category:any){
      this.router.navigate([`/market_place/category/${category}`])
    }

    


  
    
}
