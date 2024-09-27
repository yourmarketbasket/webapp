import { Component, OnInit } from '@angular/core';
import { MasterServiceService } from 'src/app/services/master-service.service';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-select-store-dialog',
  templateUrl: './select-store-dialog.component.html',
  styleUrls: ['./select-store-dialog.component.css']
})
export class SelectStoreDialogComponent implements OnInit{
  // properties
  userStores:any;
  userid:any;  
  selectedStore:any;
  // constructor
  constructor(private ms: MasterServiceService){}

  ngOnInit(): void {
    this.userid = localStorage.getItem("userId")
    this.ms.getStores(this.userid).subscribe((res:any)=>{
      if(res.success){
        this.userStores = res.data

      }
    })
    
  }

}
