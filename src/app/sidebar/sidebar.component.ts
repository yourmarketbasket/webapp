import { Component, ElementRef, EventEmitter, Output, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/auth.service';
import { SocketService } from 'src/app/services/socket.service';
import { Store } from 'src/app/mystores/stores-dashboard/stores-interface';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

@Component({
    selector: 'app-sidebar',
    templateUrl: './sidebar.component.html',
    styleUrls: ['./sidebar.component.css'],
    standalone: false
})
export class SidebarComponent {
  @Output() hideSidebar: EventEmitter<any> = new EventEmitter();
  @ViewChild('fileInput', { static: true }) fileInput!: ElementRef;
  
  // User information variables
  isLoggedin = false;
  isLoading = true;
  stores!: Store[];
  userId: any;
  fname = "";
  lname = "";
  phone = "";
  admin = false;
  avatar!: any;
  verified = false;
  active = false;
  vendor = false;
  client = false;
  zipcode = "";
  city = "";
  address = "";
  userName = "";
  userPhone = "";
  userVerification = "";

  constructor(
    private socketService: SocketService,
    public router: Router,
    private authService: AuthService,
    private dialog: MatDialog,
    private sanitizer: DomSanitizer
  ) {}

  // Logout user
  userLogout() {
    this.authService.logout();
    localStorage.removeItem('userId');
  }

  // Get user information
  ngOnInit(): void {
    this.isLoggedin = this.authService.loggedIn();
    this.userId = localStorage.getItem('userId');
    this.authService.getUser(this.userId).subscribe(
      (response: any) => {
        if (response.success) {
          const userData = response.data;
          this.fname = userData.fname;
          this.lname = userData.lname;
          this.phone = userData.phone;
          this.admin = userData.admin;
          this.avatar = userData.avatar;
          this.verified = userData.verified;
          this.active = userData.active;
          this.vendor = userData.vendor;
          this.client = userData.client;
          this.zipcode = userData.zipcode;
          this.city = userData.city;
          this.address = userData.address;
          this.userName = this.fname + " " + this.lname;
          this.userPhone = this.phone;
          this.userVerification = this.verified ? "Verified" : "Not Verified";
        } else {
          this.router.navigate(['/login']);
        }
      },
      (error) => {
        this.router.navigate(['/login']);
      }
    );
  }

  // To safe URL
  toSafeUrl(url: any): SafeUrl {
    return this.sanitizer.bypassSecurityTrustUrl(url);
  }
}
