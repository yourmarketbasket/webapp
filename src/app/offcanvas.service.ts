import { Injectable } from '@angular/core';
import { NgbOffcanvas, NgbOffcanvasRef } from '@ng-bootstrap/ng-bootstrap';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { NotificationsComponent } from './offcanvas/notifications/notifications.component';

@Injectable({
  providedIn: 'root'
})
export class OffcanvasService {
  private offcanvasRef: NgbOffcanvasRef | null = null;
  private modalRef: NgbModalRef | null = null;

  constructor(private offcanvas: NgbOffcanvas, private modalService: NgbModal) {}

  // Open notifications offcanvas with optional data
  openNotifications(data?: any) {
    if (!this.offcanvasRef) {
      this.offcanvasRef = this.offcanvas.open(NotificationsComponent, {
        position: 'end',
        backdrop: true,
        keyboard: true,
      });

      // Pass data to the component instance if provided
      if (data) {
        this.offcanvasRef.componentInstance.notificationData = data;
      }

      // Reset reference when closed
      this.offcanvasRef.result.finally(() => {
        this.offcanvasRef = null;
      });
    }
  }

  // Close notifications offcanvas
  closeNotifications() {
    if (this.offcanvasRef) {
      this.offcanvasRef.dismiss();
      this.offcanvasRef = null;
    }
  }
  // Open modal with optional data (modal component content passed in)
  openModal(component: any, data?: any) {
    if (!this.modalRef) {
      // Open the modal with the provided component
      this.modalRef = this.modalService.open(component, {
        size: 'lg', // Adjust size as needed ('sm', 'lg', 'xl')
        backdrop: 'static', // Prevent closing modal by clicking outside
        keyboard: false,    // Prevent closing modal by pressing ESC
      });
  
      // Pass data to the modal component instance if provided
      if (data) {
        this.modalRef.componentInstance.notificationData = data;
      }
  
      // Reset reference when closed
      this.modalRef.result.finally(() => {
        this.modalRef = null;
      });
    }
  }
  

  // Close modal
  closeModal() {
    if (this.modalRef) {
      this.modalRef.close();
      this.modalRef = null;
    }
  }
}
