import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-notification-modal',
  templateUrl: './notification-modal.component.html',
  styleUrl: './notification-modal.component.css'
})
export class NotificationModalComponent {

  @Input() notificationData: any; // Data passed from the service

  constructor() {}

}
