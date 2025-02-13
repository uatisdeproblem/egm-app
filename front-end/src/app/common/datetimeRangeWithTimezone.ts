import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { formatInTimeZone, zonedTimeToUtc } from 'date-fns-tz';
import { epochISOString } from 'idea-toolbox';
import { AppService } from '@app/app.service';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
  selector: 'app-datetime-range-timezone',
  template: `
    <ion-item [lines]="lines" [color]="color">
      <ion-label position="stacked">{{ label }} @if(obligatory) {<ion-text class="obligatoryDot" />}</ion-label>

      <div class="date-range-container">
        <ion-datetime-button
          [datetime]="'startDateTime_' + _uid"
          [disabled]="disabled"
          class="date-button"
        ></ion-datetime-button>

        <span class="date-separator">-</span>

        <ion-datetime-button
          [datetime]="'endDateTime_' + _uid"
          [disabled]="disabled"
          class="date-button"
        ></ion-datetime-button>

        <ion-modal [keepContentsMounted]="true" #startModal>
          <ng-template>
            <ion-datetime
              [id]="'startDateTime_' + _uid"
              #startDateTime
              [value]="initialStartValue"
              (ionChange)="onStartDateChange($event)"
              (ionCancel)="startModal.dismiss()"
              [max]="initialEndValue"
              locale="en-GB"
              presentation="date-time"
              first-day-of-week="1"
              hour-cycle="h23"
              [showDefaultButtons]="true"
              [showClearButton]="false"
            >
            </ion-datetime>
          </ng-template>
        </ion-modal>

        <ion-modal [keepContentsMounted]="true" #endModal>
          <ng-template>
            <ion-datetime
              [id]="'endDateTime_' + _uid"
              #endDateTime
              [value]="initialEndValue"
              (ionChange)="onEndDateChange($event)"
              (ionCancel)="endModal.dismiss()"
              [min]="initialStartValue"
              locale="en-GB"
              presentation="date-time"
              first-day-of-week="1"
              hour-cycle="h23"
              [showDefaultButtons]="true"
              [showClearButton]="false"
            >
            </ion-datetime>
          </ng-template>
        </ion-modal>
      </div>

      <ng-content></ng-content>
    </ion-item>
  `,
  styles: [`
    .date-range-container {
      display: flex;
      align-items: center;
      gap: 1rem;
      width: 100%;
      margin: 0.5rem 0;
    }
    .date-separator {
      font-weight: bold;
      padding: 0 0.5rem;
    }
    .date-button {
      flex: 1;
      min-width: 130px;
    }
    :host ::ng-deep .date-button .datetime-button-native {
      width: 100%;
      --padding-start: 1rem;
      --padding-end: 1rem;
    }
  `]
})
export class DateTimeRangeWithTimezone implements OnInit, OnChanges {
  @Input() timezone: string;
  @Input() label: string;
  @Input() color: string;
  @Input() lines: string;
  @Input() disabled = false;
  @Input() obligatory = false;

  @Input() startDate: epochISOString;
  @Output() startDateChange = new EventEmitter<epochISOString>();

  @Input() endDate: epochISOString;
  @Output() endDateChange = new EventEmitter<epochISOString>();

  initialStartValue: string = '';
  initialEndValue: string = '';
  protected _uid = crypto.randomUUID();

  @ViewChild('startDateTime') startDateTime: ElementRef;
  @ViewChild('endDateTime') endDateTime: ElementRef;

  constructor(public app: AppService) {}

  ngOnInit(): void {
    this.timezone = this.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;
    this.initialStartValue = this.utcToZonedTimeString(this.startDate);
    this.initialEndValue = this.utcToZonedTimeString(this.endDate);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['startDate'] || changes['endDate'] || changes['timezone']) {
      this.timezone = this.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;
      this.initialStartValue = this.utcToZonedTimeString(this.startDate);
      this.initialEndValue = this.utcToZonedTimeString(this.endDate);
    }
  }

  onStartDateChange(event: any): void {
    if (event.detail.value) {
      const newStartDate = this.zonedTimeStringToUTC(event.detail.value);
      this.startDate = newStartDate;
      this.initialStartValue = event.detail.value;
      this.startDateChange.emit(this.startDate);
    }
  }

  onEndDateChange(event: any): void {
    if (event.detail.value) {
      const newEndDate = this.zonedTimeStringToUTC(event.detail.value);
      this.endDate = newEndDate;
      this.initialEndValue = event.detail.value;
      this.endDateChange.emit(this.endDate);
    }
  }

  utcToZonedTimeString(isoString: epochISOString): string {
    if (!isoString) return '';
    return formatInTimeZone(isoString, this.timezone, "yyyy-MM-dd'T'HH:mm:ss");
  }

  zonedTimeStringToUTC(dateLocale: string): epochISOString {
    return zonedTimeToUtc(new Date(dateLocale), this.timezone).toISOString();
  }
}