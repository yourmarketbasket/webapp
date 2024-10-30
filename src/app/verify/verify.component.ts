import { Component, Inject, OnInit } from '@angular/core';
import { AuthService } from '../auth.service';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-verify',
  templateUrl: './verify.component.html',
  styleUrls: ['./verify.component.css']
})
export class VerifyComponent implements OnInit {

  data:any;

  constructor(private authService:AuthService, @Inject(MAT_DIALOG_DATA) public dialogData:any){}

  ngOnInit() {
    this.data = this.dialogData;
    console.log(this.data);
    
  }




  verifyMobileNumber(phone:any){
    const signature = "3wZsyyh51s9";
    this.authService.sendTwilioOTP({mobilenumber: phone, signature: signature}).subscribe((res:any)=>{

    });

  }
  resendOtp(){

  }
  verifyOTP(){
    
  }

}
