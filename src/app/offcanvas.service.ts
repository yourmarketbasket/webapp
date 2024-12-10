import { Injectable } from '@angular/core';
import { NgbOffcanvas, NgbOffcanvasRef } from '@ng-bootstrap/ng-bootstrap';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { NotificationsComponent } from './offcanvas/notifications/notifications.component';

@Injectable({
  providedIn: 'root',
})
export class OffcanvasService {
  private offcanvasRef: NgbOffcanvasRef | null = null;
  private modalRef: NgbModalRef | null = null;

  constructor(private offcanvas: NgbOffcanvas, private modalService: NgbModal) {
  }

  async openNotifications(data?: any) {
    if (this.offcanvasRef) {
      // Wait for the existing offcanvas to close before opening a new one
      await this.offcanvasRef.dismiss();
      this.offcanvasRef = null; // Reset the reference after dismissal
    }

    // Play notification sound
    // this.playNotificationSound();

    // Open a new offcanvas
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

  // private async playNotificationSound() {
  //   try {
  //     const permission = await navigator.permissions.query({ name: 'autoplay' as PermissionName });
  //     if (permission.state === 'granted') {
  //       // If permission is granted, play the sound
  //       const audio = new Audio('../assets/sounds/notification.mp3');
  //       audio.load();
  //       audio.play().catch((error) => {
  //         console.error('Error playing notification sound:', error);
  //       });
  //     } else {
  //       console.log('Autoplay permission not granted');
  //     }
  //   } catch (error) {
  //     console.error('Error checking autoplay permission:', error);
  //   }
  // }
  
  

  closeNotifications() {
    if (this.offcanvasRef) {
      this.offcanvasRef.dismiss();
      this.offcanvasRef = null;
    }
  }

  openModal(component: any, data?: any) {
    if (!this.modalRef) {
      // Open the modal with the provided component
      this.modalRef = this.modalService.open(component, {
        size: 'lg', // Adjust size as needed ('sm', 'lg', 'xl')
        backdrop: 'static', // Prevent closing modal by clicking outside
        keyboard: false, // Prevent closing modal by pressing ESC
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

  closeModal() {
    if (this.modalRef) {
      this.modalRef.close();
      this.modalRef = null;
    }
  }
}
