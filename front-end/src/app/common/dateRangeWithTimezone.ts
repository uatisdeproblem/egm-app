import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
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
  selector: 'app-daterange-timezone',
  template: `
    <ion-item [lines]="lines" [color]="color">
      <ion-label position="stacked">{{ label }} @if(obligatory) {<ion-text class="obligatoryDot" />}</ion-label>

      <div class="date-range-container">
        <ion-datetime-button
          datetime="startDate"
          [disabled]="disabled"
          class="date-button"
        ></ion-datetime-button>

        <span class="date-separator">-</span>

        <ion-datetime-button
          datetime="endDate"
          [disabled]="disabled"
          class="date-button"
        ></ion-datetime-button>

        <ion-modal [keepContentsMounted]="true" #startModal>
          <ng-template>
            <ion-datetime
              id="startDate"
              #startDateTime
              [value]="initialStartValue"
              (ionChange)="onStartDateChange($event)"
              (ionCancel)="startModal.dismiss()"
              [max]="initialEndValue"
              locale="en-GB"
              presentation="date"
              first-day-of-week="1"
              [showDefaultButtons]="true"
              [showClearButton]="false"
            >
            </ion-datetime>
          </ng-template>
        </ion-modal>

        <ion-modal [keepContentsMounted]="true" #endModal>
          <ng-template>
            <ion-datetime
              id="endDate"
              #endDateTime
              [value]="initialEndValue"
              (ionChange)="onEndDateChange($event)"
              (ionCancel)="endModal.dismiss()"
              [min]="initialStartValue"
              locale="en-GB"
              presentation="date"
              first-day-of-week="1"
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
export class DateRangeWithTimezoneStandaloneComponent implements OnInit {
  @Input() timezone: string;
  @Input() label: string;
  @Input() color: string;
  @Input() lines: string;
  @Input() disabled = false;
  @Input() obligatory = false;

  private _startDate: epochISOString;
  @Input()
  set startDate(value: epochISOString) {
    this._startDate = value;
    if (value) {
      this.initialStartValue = this.utcToZonedTimeString(value);
    }
  }
  get startDate(): epochISOString {
    return this._startDate;
  }
  @Output() startDateChange = new EventEmitter<epochISOString>();

  private _endDate: epochISOString;
  @Input()
  set endDate(value: epochISOString) {
    this._endDate = value;
    if (value) {
      this.initialEndValue = this.utcToZonedTimeString(value);
    }
  }
  get endDate(): epochISOString {
    return this._endDate;
  }
  @Output() endDateChange = new EventEmitter<epochISOString>();

  initialStartValue: string = '';
  initialEndValue: string = '';

  @ViewChild('startDateTime') startDateTime: ElementRef;
  @ViewChild('endDateTime') endDateTime: ElementRef;

  constructor(public app: AppService) {}

  ngOnInit(): void {
    this.timezone = this.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;
  }

  onStartDateChange(event: any): void {
    if (event.detail.value) {
      const newStartDate = this.zonedTimeStringToUTC(event.detail.value);
      this._startDate = newStartDate;
      this.initialStartValue = event.detail.value;
      this.startDateChange.emit(this._startDate);
    }
  }

  onEndDateChange(event: any): void {
    if (event.detail.value) {
      const newEndDate = this.zonedTimeStringToUTC(event.detail.value);
      this._endDate = newEndDate;
      this.initialEndValue = event.detail.value;
      this.endDateChange.emit(this._endDate);
      console.log('End date changed to:', this._endDate);
    }
  }

  utcToZonedTimeString(isoString: epochISOString): string {
    if (!isoString) return '';
    return formatInTimeZone(isoString, this.timezone, "yyyy-MM-dd");
  }

  zonedTimeStringToUTC(dateLocale: string): epochISOString {
    return zonedTimeToUtc(new Date(dateLocale), this.timezone).toISOString();
  }
}