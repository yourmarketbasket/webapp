import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.css'],
    standalone: false
})
export class DashboardComponent implements OnInit {

  sideBarOpen = false;
  nobackdrop = false;
  toggleThisSideBar(){
    this.sideBarOpen = !this.sideBarOpen;
  }

  ngOnInit(){
    
  }
}
