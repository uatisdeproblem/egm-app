import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { IDEATranslationsModule } from '@idea-ionic/common';

import { VenuesRoutingModule } from './venues-routing.module';
import { VenuesPage } from './venues.page';
import { VenuePage } from './venue.page';
import { VenueCardStandaloneComponent } from './venueCard.component';
import { RoomCardStandaloneComponent } from '../rooms/roomCard.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    IDEATranslationsModule,
    VenuesRoutingModule,
    VenueCardStandaloneComponent,
    RoomCardStandaloneComponent
  ],
  declarations: [VenuesPage, VenuePage]
})
export class VenuesModule {}
