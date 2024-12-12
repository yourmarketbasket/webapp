import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-manage-views',
  templateUrl: './manage-views.component.html',
  styleUrl: './manage-views.component.css'
})
export class ManageViewsComponent implements OnInit{

  // oninit
  ngOnInit(): void {
    document.title = "Manage Views";
  }


}
