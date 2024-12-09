import { Component, Input, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { OffcanvasService } from 'src/app/offcanvas.service';
import { NotificationModalComponent } from '../notification-modal/notification-modal.component';
import { MasterServiceService } from 'src/app/services/master-service.service';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.css'] // Corrected here to styleUrls (plural)
})
export class NotificationsComponent implements OnInit{
  constructor(private offcanvasService: OffcanvasService, private modalService: NgbModal, private ms: MasterServiceService) {}

  // properties
  @Input() notificationData: any;
  isExpanded: boolean = false;
  expandedNotificationId: string | null = null;

 

  // oninit
  ngOnInit(): void {
    // console.log(this.notificationData)
  }

  // methods
  close() {
    this.offcanvasService.closeNotifications(); // Close the offcanvas via the service
  }

  // mark notification as read
  markAsRead(_id:any){
    this.ms.markNotificationAsRead(_id).subscribe((res:any)=>{
      if (res) {
        // Wait for 30 seconds (30000 milliseconds) before calling toggleAccordion
        setTimeout(() => {
          this.toggleAccordion(_id);
        }, 30000);
      } else {
        console.log(res);
      }
      
    })
  }
  
  // format date
  formatDate(date: string): string {
    const newDate = new Date(date);
    return newDate.toLocaleDateString(); // You can customize the format
  }

  toggleAccordion(notificationId: string) {
    if (this.expandedNotificationId === notificationId) {
      this.expandedNotificationId = null; // Close it if it's already expanded
    } else {
      this.expandedNotificationId = notificationId; // Expand it if it's not already expanded
      this.markAsRead(notificationId);
    }
  }

  timeAgo(date: string | Date): string {
      const now = new Date();
      const inputDate = new Date(date);
      const seconds = Math.floor((now.getTime() - inputDate.getTime()) / 1000);
      const minutes = Math.floor(seconds / 60);
      const hours = Math.floor(minutes / 60);
      const days = Math.floor(hours / 24);
      const months = Math.floor(days / 30.416);
      const years = Math.floor(months / 12);

      if (seconds < 60) {
          return seconds === 1 ? 'one second ago' : `${seconds} seconds ago`;
      } else if (minutes < 60) {
          return minutes === 1 ? 'one minute ago' : `${minutes} minutes ago`;
      } else if (hours < 24) {
          return hours === 1 ? 'one hour ago' : `${hours} hours ago`;
      } else if (days < 30) {
          return days === 1 ? 'one day ago' : `${days} days ago`;
      } else if (months < 12) {
          return months === 1 ? 'one month ago' : `${months} months ago`;
      } else {
          return years === 1 ? 'one year ago' : `${years} years ago`;
      }
  }

  splitMessageByFirstFullstop(message: string): { part1: string, part2: string | null } {
    const indexOfFirstFullstop = message.indexOf('.'); // Find the first full stop
    if (indexOfFirstFullstop === -1) {
        return { part1: message, part2: null }; // If no full stop is found, return the entire message in part1 and null for part2
    }

    const part1 = message.substring(0, indexOfFirstFullstop + 1); // Extract text before and including the full stop
    const part2 = message.substring(indexOfFirstFullstop + 1).trim(); // Extract text after the full stop and trim any extra spaces

    // If part2 is empty after trimming, return null for part2
    return { part1, part2: part2.length > 0 ? part2 : null };
}


}
