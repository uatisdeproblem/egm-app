import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, Input, OnInit, ViewChild, inject } from '@angular/core';
import {
  IonButton,
  IonButtons,
  IonCheckbox,
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
  IonRange,
  IonTitle,
  IonToolbar,
  ModalController
} from '@ionic/angular/standalone';
import { IDEATranslatePipe } from '@idea-ionic/common';

import { SessionType } from '@models/session.model';

@Component({
  selector: 'app-session-filters-modal',
  imports: [
    // Angular
    CommonModule,
    // IDEA
    IDEATranslatePipe,
    // Ionic
    IonButton,
    IonButtons,
    IonCheckbox,
    IonContent,
    IonHeader,
    IonIcon,
    IonItem,
    IonLabel,
    IonList,
    IonListHeader,
    IonRange,
    IonTitle,
    IonToolbar
  ],
  styles: [
    `
      .filterSectionTitle {
        padding-left: 8px;
      }

      .filterSectionGap {
        margin-top: 12px;
      }

      .sliderEnds {
        display: flex;
        justify-content: space-between;
        width: 100%;
        padding: 0 16px 8px;
        color: var(--ion-color-medium);
        font-size: 0.85rem;
      }

      .sliderEndsItem {
        --min-height: 0;
        --padding-top: 0;
        --inner-padding-top: 0;
      }

      .sliderItem {
        --inner-padding-bottom: 0;
        --padding-bottom: 0;
      }

      ion-range::part(pin) {
        width: 2.25rem;
        height: 2rem;
      }
    `
  ],
  template: `
    <ion-header class="ion-no-border">
      <ion-toolbar color="medium">
        <ion-buttons slot="start">
          <ion-button [title]="'COMMON.CLOSE' | translate" (click)="close()">
            <ion-icon slot="icon-only" icon="close-circle"></ion-icon>
          </ion-button>
        </ion-buttons>
        <ion-title>{{ 'COMMON.FILTERS' | translate }}</ion-title>
        <ion-buttons slot="end">
          <ion-button [title]="'COMMON.DONE' | translate" (click)="apply()">
            <ion-icon slot="icon-only" icon="checkmark-circle"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <ion-list lines="full">
        <ion-list-header class="filterSectionTitle">
          <ion-label>
            <h3>{{ 'SESSIONS.TYPE' | translate }}</h3>
          </ion-label>
        </ion-list-header>
        <ion-item *ngFor="let type of availableTypes" button detail="false" (click)="toggleType(type, !isSelected(type))">
          <ion-checkbox
            slot="start"
            [checked]="isSelected(type)"
            (click)="$event.stopPropagation()"
            (ionChange)="toggleType(type, $event.detail.checked)"
          ></ion-checkbox>
          <ion-label>{{ 'SESSIONS.TYPES.' + type | translate }}</ion-label>
        </ion-item>
        <ion-list-header class="filterSectionTitle filterSectionGap">
          <ion-label>
            <h3>{{ 'SESSIONS.STARTS_IN_BETWEEN' | translate }} {{ formatMinutes(startTimeRange.lower) }} - {{ formatMinutes(startTimeRange.upper) }}</h3>
          </ion-label>
        </ion-list-header>
        <ion-item lines="none" class="sliderItem">
          <ion-range
            #timeRangeSlider
            [pin]="true"
            [pinFormatter]="pinFormatter"
            [dualKnobs]="true"
            dual-knobs="true"
            [min]="dayStartMinutes"
            [max]="dayEndMinutes"
            [step]="5"
            [value]="startTimeRange"
            (ionChange)="onTimeRangeChange($event)"
          ></ion-range>
        </ion-item>
        <ion-item lines="none" class="sliderEndsItem">
          <div class="sliderEnds">
            <span>{{ formatMinutes(dayStartMinutes) }}</span>
            <span>{{ formatMinutes(dayEndMinutes) }}</span>
          </div>
        </ion-item>
        <ion-list-header class="filterSectionTitle filterSectionGap">
          <ion-label>
            <h3>{{ 'SESSIONS.ENDS_IN_BETWEEN' | translate }} {{ formatMinutes(endTimeRange.lower) }} - {{ formatMinutes(endTimeRange.upper) }}</h3>
          </ion-label>
        </ion-list-header>
        <ion-item lines="none" class="sliderItem">
          <ion-range
            #endTimeRangeSlider
            [pin]="true"
            [pinFormatter]="pinFormatter"
            [dualKnobs]="true"
            dual-knobs="true"
            [min]="dayStartMinutes"
            [max]="dayEndMinutes"
            [step]="5"
            [value]="endTimeRange"
            (ionChange)="onEndTimeRangeChange($event)"
          ></ion-range>
        </ion-item>
        <ion-item lines="none" class="sliderEndsItem">
          <div class="sliderEnds">
            <span>{{ formatMinutes(dayStartMinutes) }}</span>
            <span>{{ formatMinutes(dayEndMinutes) }}</span>
          </div>
        </ion-item>
        <ion-item lines="none" class="filterSectionGap">
          <ion-button fill="clear" color="medium" (click)="clear()">
            {{ 'COMMON.CLEAR' | translate }}
          </ion-button>
        </ion-item>
      </ion-list>
    </ion-content>
  `
})
export class SessionFiltersModalComponent implements OnInit, AfterViewInit {
  @Input() selectedTypes: SessionType[] = [];
  @Input() selectedTimeRange: [number, number] = [420, 1200];
  @Input() selectedEndTimeRange: [number, number] = [420, 1200];
  @ViewChild('timeRangeSlider', { read: ElementRef })
  timeRangeSlider?: ElementRef<HTMLIonRangeElement>;
  @ViewChild('endTimeRangeSlider', { read: ElementRef })
  endTimeRangeSlider?: ElementRef<HTMLIonRangeElement>;

  availableTypes = Object.values(SessionType);
  readonly dayStartMinutes = 420;
  readonly dayEndMinutes = 1200;
  readonly defaultStartMinutes = 420;
  readonly defaultEndMinutes = 1200;
  readonly pinFormatter = (value: number): string => this.formatMinutes(value);
  startTimeRange = { lower: this.defaultStartMinutes, upper: this.defaultEndMinutes };
  endTimeRange = { lower: this.defaultStartMinutes, upper: this.defaultEndMinutes };

  private selectedTypeSet = new Set<SessionType>();

  private modalCtrl = inject(ModalController);

  ngOnInit(): void {
    this.selectedTypeSet = new Set(this.selectedTypes || []);
    const [lower = this.defaultStartMinutes, upper = this.defaultEndMinutes] = this.selectedTimeRange || [];
    this.startTimeRange = {
      lower: Math.max(this.dayStartMinutes, Math.min(this.dayEndMinutes, lower)),
      upper: Math.max(this.dayStartMinutes, Math.min(this.dayEndMinutes, upper))
    };
    const [endLower = this.defaultStartMinutes, endUpper = this.defaultEndMinutes] = this.selectedEndTimeRange || [];
    this.endTimeRange = {
      lower: Math.max(this.dayStartMinutes, Math.min(this.dayEndMinutes, endLower)),
      upper: Math.max(this.dayStartMinutes, Math.min(this.dayEndMinutes, endUpper))
    };
  }

  ngAfterViewInit(): void {
    requestAnimationFrame(() => {
      this.syncSliderValue();
      this.syncEndSliderValue();
    });
  }

  isSelected(type: SessionType): boolean {
    return this.selectedTypeSet.has(type);
  }

  toggleType(type: SessionType, checked: boolean): void {
    if (checked) this.selectedTypeSet.add(type);
    else this.selectedTypeSet.delete(type);
  }

  onTimeRangeChange(event: CustomEvent): void {
    const value = event.detail.value;
    if (!value || typeof value !== 'object' || !('lower' in value) || !('upper' in value)) return;
    this.startTimeRange = { lower: Number(value.lower), upper: Number(value.upper) };
  }

  onEndTimeRangeChange(event: CustomEvent): void {
    const value = event.detail.value;
    if (!value || typeof value !== 'object' || !('lower' in value) || !('upper' in value)) return;
    this.endTimeRange = { lower: Number(value.lower), upper: Number(value.upper) };
  }

  private syncSliderValue(): void {
    const slider = this.timeRangeSlider?.nativeElement;
    if (!slider) return;
    slider.dualKnobs = true;
    slider.pinFormatter = this.pinFormatter;
    slider.value = { lower: this.startTimeRange.lower, upper: this.startTimeRange.upper };
  }

  private syncEndSliderValue(): void {
    const slider = this.endTimeRangeSlider?.nativeElement;
    if (!slider) return;
    slider.dualKnobs = true;
    slider.pinFormatter = this.pinFormatter;
    slider.value = { lower: this.endTimeRange.lower, upper: this.endTimeRange.upper };
  }

  formatMinutes(totalMinutes: number): string {
    const hours = Math.floor(totalMinutes / 60)
      .toString()
      .padStart(2, '0');
    const minutes = (totalMinutes % 60).toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  clear(): void {
    this.selectedTypeSet.clear();
    this.startTimeRange = { lower: this.defaultStartMinutes, upper: this.defaultEndMinutes };
    this.endTimeRange = { lower: this.defaultStartMinutes, upper: this.defaultEndMinutes };
    this.syncSliderValue();
    this.syncEndSliderValue();
    this.modalCtrl.dismiss({
      types: [],
      timeRange: [this.defaultStartMinutes, this.defaultEndMinutes],
      endTimeRange: [this.defaultStartMinutes, this.defaultEndMinutes]
    });
  }

  apply(): void {
    this.modalCtrl.dismiss({
      types: Array.from(this.selectedTypeSet),
      timeRange: [this.startTimeRange.lower, this.startTimeRange.upper],
      endTimeRange: [this.endTimeRange.lower, this.endTimeRange.upper]
    });
  }

  close(): void {
    this.modalCtrl.dismiss();
  }
}
