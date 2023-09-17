import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent {
  resetError!:any;
  resetFeedback!:any;
  showPassword!:any;
  showNPassword!:any;

  // initiate the fields
  resetPasswordForm = new FormGroup({
    phone: new FormControl('', Validators.required),
    password: new FormControl('', Validators.required),
    otp: new FormControl('', Validators.required),
    npassword: new FormControl('', Validators.required),


  });

  // reset password
  resetPassword(){

  }

}
