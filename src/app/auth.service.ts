import { EventEmitter, Injectable, Output } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  sessionOut:any;

  // isLoggedIn = false;
  baseurl = 'https://marketapi.fly.dev'; //for production
  // baseurl = 'http://localhost:3000';


  private  getToken(){
    return localStorage.getItem('token')
  }

  private  getAuthHeaders() {
      const token = this.getToken();
      if (token) {
          return {
              headers: new HttpHeaders({
                  'Authorization': `Bearer ${token}`
              })
          };
      }
      return {};
  }
  loginUser(user: any) {
    return this.http.post(`${this.baseurl}/api/users/login`, user);
  }
  registerUser(user: any) {
    return this.http.post(`${this.baseurl}/api/users/register`, user);
  }
  checkIfUserVerified(data: any) {
    return this.http.post(`${this.baseurl}/api/users/checkIfUserVerified`, data);
  }
  getPrdoucts(storeId: any) {
    return this.http.get(`${this.baseurl}/getProducts/${storeId}`);
  }
  deleteProduct(productId: any) {
    return this.http.delete(`${this.baseurl}/deleteProduct/${productId}`);
  }
  addProduct(product: any) {
    return this.http.post(`${this.baseurl}/api/products/addProduct`, product, this.getAuthHeaders());
  }
  verifyUser(user: any) {
    return this.http.post(`${this.baseurl}/api/users/verifyOTP`, user);
  }
  getZipCode(data:any) {
    return this.http.post(`${this.baseurl}/api/users/getZipCode`, data);
  }
  getUser(userId:any){
    return this.http.get(`${this.baseurl}/getUser/${userId}`);
  }
  sendOTP(data: any) {
    return this.http.post(`${this.baseurl}/sendOTP`, data);
  }

  sendTwilioOTP(data: any) {
    return this.http.post(`${this.baseurl}/api/users/sendTwilioOTP`, data);
  }
  verifyTwilioOTP(data: any) {
    return this.http.post(`${this.baseurl}/api/users/verifyTwilioOTP`, data);
  }
  markUserAsVerified(data: any) {
    return this.http.post(`${this.baseurl}/api/users/markUserAsVerified`, data);
  }
  sendResetPasswordOTP(data: any) {
    return this.http.post(`${this.baseurl}/api/users/sendResetPasswordOTP`, data);
  }
  verifyResetPasswordOTP(data: any) {
    return this.http.post(`${this.baseurl}/api/users/verifyResetPasswordOTP`, data);
  }
  resetUserPassword(data:any){
    return this.http.post(`${this.baseurl}/api/users/resetUserPassword`, data);
  }
  addStore (data: any) {
    return this.http.post(`${this.baseurl}/addStore`, data);
  }
  getStores (userId: any) {
    return this.http.get(`${this.baseurl}/getStores/${userId}`);
  }
  getStoreDetails(storeId: any) {
    return this.http.get(`${this.baseurl}/getStoreDetails/${storeId}`);
  }
  // changeUserAvatar
  changeUserAvatar(data: any) {
    return this.http.post(`${this.baseurl}/api/users/changeUserAvatar`, data,  this.getAuthHeaders());
  }
  reviewListedItemAction(data:any){     
      return this.http.post(`${this.baseurl}/api/products/reviewlisteditem`, data, this.getAuthHeaders());
    
  }
  logout() {
    
    this.clearLocalStorageExcept("productsinfo")

    this.router.navigate(['/login']);
  }

  clearLocalStorageExcept(excludedKey:any) {
    // Store the value of the excluded key
    const excludedValue = localStorage.getItem(excludedKey);
  
    // Clear all items in localStorage
    localStorage.clear();
  
    // Restore the excluded item back to localStorage
    if (excludedValue !== null) {
      localStorage.setItem(excludedKey, excludedValue);
    }
  }
  get isLoggedIn() {
    return !!localStorage.getItem('token');
  }
  set isLoggedIn(value: boolean) {
    this.isLoggedIn = value;
  }

  checkSession() {
    const intervalId = setInterval(() => {
      const loginTimeStr = localStorage.getItem('timeStamp');

      if (loginTimeStr) {
        const loginTime = new Date(loginTimeStr); // Retrieve loginTime from localStorage
        const currentTime = new Date();
        const timeElapsed = (currentTime.getTime() - loginTime.getTime()) / 1000; // Time in seconds

        if (timeElapsed > 43200) { // 60 seconds = 1 minute
          this.logout();
          clearInterval(intervalId); 
        }
      }
    }, 1800000); // Check every 5 seconds (adjust as needed)
  }

  loggedIn(){
    return !!localStorage.getItem('token')
  }
  constructor(private http: HttpClient, private router: Router) { }


}
