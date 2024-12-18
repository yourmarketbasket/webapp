import { Component } from '@angular/core';
import { MdbModalRef, MdbModalService } from 'mdb-angular-ui-kit/modal';
import { AddProviderComponent } from '../add-provider/add-provider.component';

@Component({
  selector: 'app-providers',
  templateUrl: './providers.component.html',
  styleUrl: './providers.component.css'
})
export class ProvidersComponent {
  modalRef: MdbModalRef<AddProviderComponent> | null = null;

  constructor(private modalService: MdbModalService, ){

  }

  // open add delivery driver modal
  openAddDeliveryDriverModal(){
    this.modalRef = this.modalService.open(AddProviderComponent, {
      modalClass: 'modal-xl'
    })
  }

}
