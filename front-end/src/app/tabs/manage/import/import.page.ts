import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { AlertController, IonContent, IonInfiniteScroll } from '@ionic/angular';
import { read, utils, WorkBook, writeFile } from 'xlsx';

import { IDEAApiService, IDEALoadingService, IDEAMessageService, IDEATranslationsService } from '@idea-ionic/common';
import { Suggestion } from 'idea-toolbox';

import { AppService } from '@app/app.service';
import { VenuesService } from '@app/tabs/venues/venues.service';
import { RoomsService } from '@app/tabs/rooms/rooms.service';
import { OrganizationsService } from '@app/tabs/organizations/organizations.service';
import { SpeakersService } from '@app/tabs/speakers/speakers.service';
import { SessionsService } from '@app/tabs/sessions/sessions.service';

import { Venue, VenueFlat } from '@models/venue.model';
import { Room, RoomFlat } from '@models/room.model';
import { Organization, OrganizationFlat } from '@models/organization.model';
import { Speaker, SpeakerFlat, SpeakerLinked } from '@models/speaker.model';
import { Session, SessionFlat } from '@models/session.model';

import { environment as env } from '@env';

const MAX_PAGE_SIZE = 24;

/**
 * The key to a hidden attribute that stores the import status for each element.
 */
const IMPORT_STATUS_KEY = '__IMPORT_STATUS__';

@Component({
  selector: 'app-import',
  templateUrl: './import.page.html',
  styles: [
    `
      ion-breadcrumb {
        ion-button {
          opacity: 0.7;
          font-size: 0.9em;
          text-transform: none;
          margin: 0;
          height: 24px;
          font-weight: normal;
          letter-spacing: 0;
          --padding-start: 0;
          --padding-end: 0;
        }
        ion-button[disabled] {
          opacity: 1;
          font-weight: 500;
        }
        ion-icon[slot='separator'] {
          font-size: 0.9em;
        }
      }
      .childEntity {
        --padding-start: 28px;
      }
      .grandchildEntity {
        --padding-start: 56px;
      }
    `
  ]
})
export class ImportPage implements OnInit {
  private _alert = inject(AlertController);
  private _message = inject(IDEAMessageService);
  private _loading = inject(IDEALoadingService);
  private _api = inject(IDEAApiService);
  private _venues = inject(VenuesService);
  private _rooms = inject(RoomsService);
  private _organizations = inject(OrganizationsService);
  private _speakers = inject(SpeakersService);
  private _sessions = inject(SessionsService);
  _translate = inject(IDEATranslationsService);
  _app = inject(AppService);

  /**
   * To manage the page content.
   */
  @ViewChild(IonContent, { static: true }) content: IonContent;
  /**
   * Helper to use the enum in the UI.
   */
  EntityTypes = EntityTypes;
  /**
   * The entity we want to import.
   */
  entity: EntityTypes;
  /**
   * The current step in the import process.
   */
  step: ImportSteps;
  /**
   * Helper to use the enum in the UI.
   */
  STEPS = ImportSteps;
  /**
   * The file to import.
   */
  fileToImport: File;
  /**
   * Whether something is in progress, to show a loading indicator. Alternative to the usual one for UX issues.
   */
  somethingInProgress: boolean;
  /**
   * The rows to import, acquired from the import file.
   */
  excelRows: any[];
  /**
   * The suggestions of the columns extracted from the Excel.
   */
  excelColsHeaderSuggestions: Suggestion[];
  /**
   * The list of attributes of the selected entity.
   * Each of them have to be linked with a `excelRows` column through the `entityAttributesColsMap` structure.
   */
  entityAttributes: string[];
  /**
   * The list of obligatory attributes for the entity (calculated).
   */
  entityObligatoryAttributes: Set<string>;
  /**
   * The mapping between the Excel columns and the entity attributes.
   */
  entityAttributesColsMap: { [attr: string]: string };
  /**
   * The array of elements to import for the selected entity.
   */
  importableElements: any[];
  /**
   * The existing venues.
   * */
  venues: Venue[];
  /**
   * The existing rooms.
   * */
  rooms: Room[];
  /**
   * The existing organizations.
   */
  organizations: Organization[];
  /**
   * The existing speakers.
   */
  speakers: Speaker[];
  /**
   * The existing sessions.
   * */
  sessions: Session[];
  /**
   * Whether each element to import is ok (validation passed) or not. Index: resource URL.
   */
  validElements: string[];
  /**
   * Whether an element already exist in the db. Index: resource URL.
   */
  existingElements: string[];
  /**
   * Whether the element has been selected to be imported.
   */
  confirmedElementsToImport: { [elementURL: string]: boolean };
  /**
   * The elements imported.
   * An attribute of key `IMPORT_STATUS_KEY` and type `ImportStatuses` is added during import for improving the UX.
   */
  elementsToImport: any[];
  /**
   * The number of elements currently elaborated (successfully or failing).
   */
  numElementsImported: number;
  /**
   * Helper to use the enum in the UX.
   */
  IS = ImportStatuses;
  /**
   * If set to true, it will interrupt an ongoing import asap.
   */
  interruptImport: boolean;

  filteredElementsToImport: any[];
  filteredImportableElements: any[];

  currentPage: number;

  ngOnInit(): void {
    if (!this._app.userCanManageSomething()) this._app.closePage('COMMON.UNAUTHORIZED');
    this.step = ImportSteps.SELECT_ENTITY;
  }

  /**
   * Go to the following step.
   */
  nextStep(): void {
    if (this.step < ImportSteps.RESULTS) {
      this.step++;
      this.content.scrollToTop();
    }
  }

  /**
   * Based on the entity, prepare and download an Excel template using sample data (STEP 2).
   */
  async downloadTemplate(): Promise<void> {
    try {
      await this._loading.show();
      const sampleRow: any[] = [
        {
          organizationId: 'example-org-1',
          name: 'Example name',
          description: 'Example description of the entity',
          website: 'www.esn.org',
          contactEmail: 'egm-technical@esn.org',
          venueId: 'example-venue-1',
          address: 'Example address',
          latitude: 41.13696640320431,
          longitude: -8.608850950231222,
          roomId: 'example-room-1',
          internalLocation: '1st Floor',
          venue: { venueId: 'example-venue-1' },
          speakerId: 'example-speaker-1',
          organization: { organizationId: 'example-org-1' },
          sessionId: 'example-session-1',
          code: '01-EGT',
          type: 'DISCUSSION',
          startsAt: '2025-04-01T13:00',
          endsAt: '2025-04-01T14:30',
          durationMinutes: 90,
          room: { roomId: 'example-room-1' },
          speakers: [
            { speakerId: 'example-speaker-1' },
            { speakerId: 'example-speaker-2' },
            { speakerId: 'example-speaker-3' }
          ],
          numberOfParticipants: 0,
          limitOfParticipants: 100,
          requiresRegistration: true
        }
      ];
      // map the data according to the entity class
      const entityClass = this.getEntityClass();
      const exportData = sampleRow.map((x: any) => new entityClass(x).exportFlat());
      // download the template containing the sample data
      this.downloadDataAsExcel(exportData, this.getEntityLabel(this.entity));
    } catch (error) {
      this._message.error('COMMON.OPERATION_FAILED');
    } finally {
      await this._loading.hide();
    }
  }

  /**
   * Get the class of an entity.
   */
  private getEntityClass(): any {
    switch (this.entity) {
      case EntityTypes.ORGANIZATIONS:
        return Organization;
      case EntityTypes.SPEAKERS:
        return Speaker;
      case EntityTypes.VENUES:
        return Venue;
      case EntityTypes.ROOMS:
        return Room;
      case EntityTypes.SESSIONS:
        return Session;
      default:
        return null;
    }
  }
  /**
   * Get the label of an entity.
   */
  getEntityLabel(type: EntityTypes): string {
    switch (type) {
      case EntityTypes.ORGANIZATIONS:
        return this._translate._('MANAGE.ORGANIZATIONS');
      case EntityTypes.SPEAKERS:
        return this._translate._('MANAGE.SPEAKERS');
      case EntityTypes.VENUES:
        return this._translate._('MANAGE.VENUES');
      case EntityTypes.ROOMS:
        return this._translate._('MANAGE.ROOMS');
      case EntityTypes.SESSIONS:
        return this._translate._('MANAGE.SESSIONS');
      default:
        return null;
    }
  }
  /**
   * Get the flat class of an entity.
   */
  private getEntityFlatClass(): any {
    switch (this.entity) {
      case EntityTypes.ORGANIZATIONS:
        return OrganizationFlat;
      case EntityTypes.SPEAKERS:
        return SpeakerFlat;
      case EntityTypes.VENUES:
        return VenueFlat;
      case EntityTypes.ROOMS:
        return RoomFlat;
      case EntityTypes.SESSIONS:
        return SessionFlat;
      default:
        return null;
    }
  }
  /**
   * Download a flat structure as an Excel file.
   */
  private downloadDataAsExcel(flatData: any[], title: string): any {
    // prepare the Excel's workbook
    const wb: WorkBook = { SheetNames: [], Sheets: {}, Props: { Title: title, Author: env.idea.auth.title } };
    // add the spreadsheet with users data to the workbook
    utils.book_append_sheet(wb, utils.json_to_sheet(flatData), '1');
    // generate a buffer of the Excel file
    return writeFile(wb, title.concat('.xlsx'));
  }
  /**
   * Simulate the click on the (hidden) browse button.
   *
   */
  browseFiles(): void {
    const input = document.getElementById('inputFileToImport');
    if (input) input.click();
  }
  /**
   * Select the file to import from the native picker. Of a set of files, only the first one is considered.
   */
  selectFile(event: any): void {
    this.fileToImport = event.target.files && event.target.files.length > 0 ? event.target.files[0] : null;
  }
  /**
   * Analyse the file to import and acquire its records.
   */
  analyseFileToImport(): void {
    const fileReader = new FileReader();
    fileReader.onerror = () => {
      this.somethingInProgress = false;
      this._message.error('COMMON.OPERATION_FAILED');
    };
    fileReader.onload = event => {
      // parse the excel file into records to import
      this.excelRows = this.parseRecordsFromExcel((event.target as any).result);
      if (!this.excelRows.length) throw new Error();
      // prepare the UX to help the users linking the entities' attributes with the Excel columns
      this.prepareAttributesColumnsMatch();
      // go the the next step
      this.somethingInProgress = false;
      this.nextStep();
    };
    // fire the action
    this.somethingInProgress = true;
    fileReader.readAsBinaryString(this.fileToImport);
  }
  /**
   * Parse the rows from the Excel file read.
   */
  private parseRecordsFromExcel(excelContent: any): any[] {
    try {
      const workbook = read(excelContent, { type: 'binary' });
      // acquire the header in a preliminar step,
      // to avoid a bug that occurs when the last column of the first not-header row is empty
      const header = utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], { raw: true, header: 1 })[0];
      // acquire the rows, forcing the header read in the first row
      const rows = utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], {
        raw: true,
        header: header as any,
        defval: '',
        range: 1 // skip header row
      });
      return rows;
    } catch (err) {
      return [];
    }
  }
  /**
   * Prepare the UX so that the user is able to match each attribute with a column of the Excel file.
   */
  private prepareAttributesColumnsMatch(): void {
    // prepare the columns suggestion by analysing the first row; highlight top 5 rows to help identifying the columns
    this.excelColsHeaderSuggestions = Object.keys(this.excelRows[0]).map(
      k =>
        new Suggestion({
          name: k,
          value:
            this.excelRows
              .slice(0, 5)
              .map(x => x[k])
              .filter(x => x)
              .join(', ') || '-'
        })
    );
    // acquire the entity attributes expected (may be obligatory or not) to be filled in
    const entityFlatClass = this.getEntityFlatClass();
    this.entityAttributes = Object.keys(new entityFlatClass());
    // if the entity uses automatic id, remove the entity id attribute from the list
    if (this.entityUsesAutomaticIDs()) this.removeEntityIdAttribute();
    // guess the obligatory attributes that must be filled in
    this.entityObligatoryAttributes = this.guessAndGetObligatoryAttributes();
    // initialize the link between the entity attributes and the Excel columns
    this.entityAttributesColsMap = {};
    // automatically associate attributes to columns with the same name
    this.entityAttributes.forEach(attr => {
      if (this.excelColsHeaderSuggestions.some(col => col.name === attr)) this.entityAttributesColsMap[attr] = attr;
    });
  }
  /**
   * Whether the entity uses automatic IDs or not (based on organization configuration).
   */
  public entityUsesAutomaticIDs(): boolean {
    return false; // @todo we force manual IDs on massive import
  }
  /**
   * Dynamically guess the obligatory attributes of an entity, based on their `validate` methods.
   * Note: this method wouldn't work on mandatory complex fields (e.g. objects). Anyway, it should be fine by now.
   */
  private guessAndGetObligatoryAttributes(): Set<string> {
    const entityClass = this.getEntityClass();
    const entity = new entityClass();
    // for each obligatory field bsed on the `validate` method, set a value
    entity.validate().forEach((attr: string) => {
      if (Array.isArray(entity[attr])) entity[attr] = ['@@@'];
      else entity[attr] = '@@@';
    });
    // flatten the object and see where the value just set did go: that is the obligatory field
    const flat = entity.exportFlat();
    const obligatorySet = new Set(
      Object.keys(flat).filter(attr => flat[attr] === '@@@' || JSON.stringify(flat[attr]) === JSON.stringify(['@@@']))
    );
    // add the keys of each entity, because they aren't usually considered in the `validate` method
    if (!this.entityUsesAutomaticIDs()) obligatorySet.add(this.getEntityIdAttribute());
    return obligatorySet;
  }
  /**
   * Remove the id attribute of an entity (useful in case the entity is configured for automatic IDs).
   */
  private removeEntityIdAttribute(): void {
    const index = this.entityAttributes.indexOf(this.getEntityIdAttribute());
    if (index > -1) this.entityAttributes.splice(index, 1);
  }
  /**
   * Link the attribute with the column selected.
   */
  linkAttributeToColumn(attr: string, col: Suggestion): void {
    this.entityAttributesColsMap[attr] = col.name;
  }
  /**
   * Whether we can proceed to the next step.
   */
  isMetadataConfigurationDone(): boolean {
    return Array.from(this.entityObligatoryAttributes).every(a => Boolean(this.entityAttributesColsMap[a]));
  }

  /**
   * Prepare the preview with the elements to import.
   */
  async createPreview(): Promise<void> {
    await this._loading.show();
    // init the support structures
    this.importableElements = new Array<any>();
    this.validElements = new Array<string>();
    this.existingElements = new Array<string>();
    this.confirmedElementsToImport = {};
    this.venues = await this._venues.getList({ force: true });
    this.rooms = await this._rooms.getList({ force: true });
    this.organizations = await this._organizations.getList({ force: true });
    this.speakers = await this._speakers.getList({ force: true });
    this.sessions = await this._sessions.getList({ force: true });
    const entityClass = this.getEntityClass();
    const entityFlatClass = this.getEntityFlatClass();
    // for each Excel row,
    this.excelRows.forEach((excelRow, index) => {
      // prepare an element in the expected import format (flat), applying the configured remapping
      const mappedElement = new entityFlatClass();
      this.entityAttributes.forEach(attr => {
        const colName = this.entityAttributesColsMap[attr];
        mappedElement[attr] = excelRow[colName];
      });
      // if the entity has automatic ids, draft one for each mapped element (so we can distinguish them later)
      if (this.entityUsesAutomaticIDs()) this.setAutomaticIdToElement(mappedElement, index);
      // import the flat structure into the regular structure
      const el = new entityClass();
      el.importFlat(mappedElement);
      // check whether the element is valid and set the helper structure
      if (!this.invalidElementFields(el)) {
        const resURL = this.getEntityElementResourceURL(el);
        this.validElements.push(resURL);
        this.confirmedElementsToImport[resURL] = true;
      }
      // add the element to the ones to import
      this.importableElements.push(el);
    });
    //
    // acquire the existing records for the resource, to check if some exists already
    const records = await this.acquireEntityRecords();
    // check by key whether an element exists already in the db and set the helper structure
    records.forEach(record => {
      const recordURL = this.getEntityElementResourceURL(record);
      if (this.importableElements.some(x => this.getEntityElementResourceURL(x) === recordURL)) {
        this.existingElements.push(recordURL);
        this.confirmedElementsToImport[recordURL] = false;
      }
    });
    // sort the elements, putting the problematic ones on top
    this.importableElements = this.importableElements.sort((a, b) => {
      let precedenceA = 0;
      if (!this.isElementToImportValid(a)) precedenceA = -2;
      else if (this.doesElementToImportExist(a)) precedenceA = -1;
      let precedenceB = 0;
      if (!this.isElementToImportValid(b)) precedenceB = -2;
      else if (this.doesElementToImportExist(b)) precedenceB = -1;
      const urlA = this.getEntityElementResourceURL(a);
      const urlB = this.getEntityElementResourceURL(b);
      return precedenceA - precedenceB || urlA.localeCompare(urlB);
    });
    this.currentPage = 0;
    this.filteredImportableElements = this.importableElements.slice(0, MAX_PAGE_SIZE);
    // move to the next step
    this._loading.hide();
    this.nextStep();
  }
  invalidElementFields(el: any): any {
    const errors = el.validate();

    switch (this.entity) {
      case EntityTypes.SPEAKERS:
        if (
          el.organization.organizationId &&
          !this.organizations.some(o => o.organizationId === el.organization.organizationId)
        )
          errors.push('organization id');
        break;
      case EntityTypes.ROOMS:
        if (el.venue.venueId && !this.venues.some(v => v.venueId === el.venue.venueId)) errors.push('venue id');
        break;
      case EntityTypes.SESSIONS:
        if (el.room.roomId && !this.rooms.some(r => r.roomId === el.room.roomId)) errors.push('speaker id');
        el.speakers.forEach((speaker: SpeakerLinked, index: number) => {
          if (!this.speakers.some(s => s.speakerId === speaker.speakerId)) errors.push(`speaker #${index + 1} id`);
        });
        break;
      case EntityTypes.ORGANIZATIONS:
      case EntityTypes.VENUES:
      default:
        break;
    }

    return errors.join(', ');
  }
  /**
   * Get the resource URL to access the entity's element.
   */
  getEntityElementResourceURL(element: any): string {
    switch (this.entity) {
      case EntityTypes.ORGANIZATIONS:
        return `organizations/${element.organizationId}`;
      case EntityTypes.SPEAKERS:
        return `speakers/${element.speakerId}`;
      case EntityTypes.VENUES:
        return `venues/${element.venueId}`;
      case EntityTypes.ROOMS:
        return `rooms/${element.roomId}`;
      case EntityTypes.SESSIONS:
        return `sessions/${element.sessionId}`;
      default:
        return null;
    }
  }
  /**
   * Set an automatic id to an element.
   */
  private setAutomaticIdToElement(element: any, id: number | string): void {
    element[this.getEntityIdAttribute()] = String(id);
  }
  /**
   * Get the id attribute of an entity.
   */
  private getEntityIdAttribute(): string {
    switch (this.entity) {
      case EntityTypes.ORGANIZATIONS:
        return 'Organization ID';
      case EntityTypes.SPEAKERS:
        return 'Speaker ID';
      case EntityTypes.VENUES:
        return 'Venue ID';
      case EntityTypes.ROOMS:
        return 'Room ID';
      case EntityTypes.SESSIONS:
        return 'Session ID';
      default:
        return null;
    }
  }
  /**
   * Acquire the records currently in the db for the entity.
   */
  private async acquireEntityRecords(): Promise<any> {
    switch (this.entity) {
      case EntityTypes.ORGANIZATIONS:
        return (await this._api.getResource(['organizations'])).map(o => new Organization(o));
      case EntityTypes.SPEAKERS:
        return (await this._api.getResource(['speakers'])).map(s => new Speaker(s));
      case EntityTypes.VENUES:
        return (await this._api.getResource(['venues'])).map(v => new Venue(v));
      case EntityTypes.ROOMS:
        return (await this._api.getResource(['rooms'])).map(r => new Room(r));
      case EntityTypes.SESSIONS:
        return (await this._api.getResource(['sessions'])).map(s => new Session(s));
      default:
        return null;
    }
  }
  /**
   * Whether the element to import is valid.
   */
  isElementToImportValid(el: any): boolean {
    return this.validElements.some(x => x === this.getEntityElementResourceURL(el));
  }
  /**
   * Whether the element to import exists already in the db.
   */
  doesElementToImportExist(el: any): boolean {
    return this.existingElements.some(x => x === this.getEntityElementResourceURL(el));
  }
  /**
   * Whether the element has been selected to be imported.
   */
  shouldImportElement(element: any): boolean {
    return this.confirmedElementsToImport[this.getEntityElementResourceURL(element)];
  }
  /**
   * Mark an element to import/to skip.
   */
  markToImport(element: any, toImport: boolean): void {
    this.confirmedElementsToImport[this.getEntityElementResourceURL(element)] = toImport;
  }
  /**
   * Select/deselect all the (valid) elements to import.
   */
  selectAll(doSelect: boolean): void {
    this.importableElements.forEach(
      x =>
        (this.confirmedElementsToImport[this.getEntityElementResourceURL(x)] =
          this.isElementToImportValid(x) && doSelect)
    );
  }
  /**
   * Get the number of elements selected to be imported.
   */
  getNumElementSelectedToImport(): number {
    return this.importableElements.filter(x => this.confirmedElementsToImport[this.getEntityElementResourceURL(x)])
      .length;
  }
  /**
   * Confirm the import of the selected elements.
   */
  async doImport(): Promise<void> {
    const header = this._translate._('COMMON.ARE_YOU_SURE');
    const message = this._translate._('IMPORT.YOU_WILL_IMPORT_NUM_ELEMENTS_', {
      num: this.getNumElementSelectedToImport()
    });
    const buttons = [
      { text: this._translate._('COMMON.CANCEL'), role: 'cancel' },
      {
        text: this._translate._('IMPORT.IMPORT'),
        handler: async () => {
          // identify the selected elements to import
          this.elementsToImport = this.importableElements.filter(
            x => this.confirmedElementsToImport[this.getEntityElementResourceURL(x)]
          );
          // flag the elements accordingly
          this.elementsToImport.forEach(x => (x[IMPORT_STATUS_KEY] = ImportStatuses.TODO));
          this.currentPage = 0;
          this.filteredElementsToImport = this.elementsToImport.slice();
          // advance to the next UX step, to show the progress bar
          this.nextStep();
          // start the import, uploading the elements one by one
          this.numElementsImported = 0;
          this.interruptImport = false;
          await this.importNextElement();
          // sort the elements based on their import status
          this.elementsToImport = this.elementsToImport.sort((a, b) => a[IMPORT_STATUS_KEY] - b[IMPORT_STATUS_KEY]);
        }
      }
    ];

    const alert = await this._alert.create({ header, message, buttons });
    alert.present();
  }
  /**
   * Get a descriptive name for the entity's element.
   */
  getEntityElementName(element: any): string {
    switch (this.entity) {
      case EntityTypes.ORGANIZATIONS:
      case EntityTypes.SPEAKERS:
      case EntityTypes.VENUES:
      case EntityTypes.ROOMS:
      case EntityTypes.SESSIONS:
        return element.name;
      default:
        return null;
    }
  }
  scrollImportable(scrollToNextPage?: IonInfiniteScroll): void {
    if (scrollToNextPage) this.currentPage++;
    else this.currentPage = 0;
    this.filteredImportableElements = this.importableElements.slice(0, (this.currentPage + 1) * MAX_PAGE_SIZE);
    if (scrollToNextPage) setTimeout((): Promise<void> => scrollToNextPage.complete(), 100);
  }
  scrollToImport(scrollToNextPage?: IonInfiniteScroll): void {
    if (scrollToNextPage) this.currentPage++;
    else this.currentPage = 0;
    this.filteredElementsToImport = this.elementsToImport.slice(0, (this.currentPage + 1) * MAX_PAGE_SIZE);

    if (scrollToNextPage) setTimeout((): Promise<void> => scrollToNextPage.complete(), 100);
  }
  /**
   * Import the next element of the list to import, until there aren't more.
   */
  private async importNextElement() {
    // if an interrupt was requested, force stop the operation
    if (this.interruptImport) this.numElementsImported = this.elementsToImport.length;
    // if we just imported the last element, exit
    if (this.numElementsImported >= this.elementsToImport.length) return;

    // identify the element to elaborate
    const el = this.elementsToImport[this.numElementsImported];
    // get the resource URL
    let elURL = this.getEntityElementResourceURL(el);
    // extract the entityId from the URL
    const urlEArr = elURL.split('/');
    const entityId = urlEArr.pop();
    elURL = urlEArr.join('/');

    // prepare the new/edit request
    let req: any;

    try {
      if (this.doesElementToImportExist(el)) req = await this._api.putResource([elURL, entityId], { body: el });
      else {
        const path = this.entityUsesAutomaticIDs() ? elURL : [elURL, entityId];
        req = await this._api.postResource(path, { body: el });
      }

      el[IMPORT_STATUS_KEY] = ImportStatuses.OK;
    } catch (error) {
      el[IMPORT_STATUS_KEY] = ImportStatuses.KO;
    } finally {
      this.numElementsImported++;
      await this.importNextElement();
    }
  }

  /**
   * Get the element import status.
   */
  public getElementImportStatus(el: any): ImportStatuses {
    return el[IMPORT_STATUS_KEY];
  }
  /**
   * Get the number of elements successfully imported.
   */
  public numElementsImportedOk(): number {
    return this.elementsToImport.filter(x => x[IMPORT_STATUS_KEY] === ImportStatuses.OK).length;
  }
  /**
   * Get the number of elements failed to import.
   */
  public numElementsImportedKo(): number {
    return this.elementsToImport.filter(x => x[IMPORT_STATUS_KEY] === ImportStatuses.KO).length;
  }
}

/**
 * The import steps.
 */
enum ImportSteps {
  SELECT_ENTITY = 0,
  DOWNLOAD_TEMPLATE,
  UPLOAD_EXCEL,
  METADATA_CONFIG,
  PREVIEW,
  RESULTS
}

/**
 * Possible import statuses for an element.
 */
enum ImportStatuses {
  KO = -1,
  TODO = 0,
  OK = 1
}

/**
 * The possible type of entities of the platform.
 */
enum EntityTypes {
  VENUES = 'VENUES',
  ROOMS = 'ROOMS',
  ORGANIZATIONS = 'ORGANIZATIONS',
  SPEAKERS = 'SPEAKERS',
  SESSIONS = 'SESSIONS'
}
