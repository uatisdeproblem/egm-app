import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  inject,
  SecurityContext
} from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { IonicModule } from '@ionic/angular';
import { AngularEditorConfig, AngularEditorModule } from '@kolkov/angular-editor';
import { docsSoap } from 'docs-soap';
import { HttpClientModule } from '@angular/common/http';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, HttpClientModule, AngularEditorModule],
  selector: 'app-html-editor',
  template: `
    @if(editMode){
    <angular-editor
      [(ngModel)]="text"
      [config]="editorConfig"
      (input)="contentChange.emit($event.target.innerHTML)"
      (paste)="cleanHTMLCode()"
    />
    }@else {
    <div class="view" [innerHTML]="sanitizedHtml"></div>
    }
  `,
  styles: [
    `
      div.view {
        margin: var(--app-html-editor-margin, 0);
        padding: var(--app-html-editor-padding, 20px);
        background-color: var(--app-html-editor-background-color, var(--ion-color-white));
        color: var(--app-html-editor-color, var(--ion-color-text));
        box-shadow: var(--app-html-editor-box-shadow, none);
        border: var(--app-html-editor-border-width, 1px) solid var(--ion-border-color);
        border-radius: var(--app-html-editor-border-radius, 0);
      }
    `
  ]
})
export class HTMLEditorComponent implements OnInit, OnChanges {
  /**
   * Whether the parent page is in editMode or not (simplified).
   */
  @Input() editMode = false;
  /**
   * The HTML content.
   */
  @Input() content: string;
  /**
   * Trigger when the HTML content changes.
   */
  @Output() contentChange = new EventEmitter<string>();

  text: string;

  editorConfig: AngularEditorConfig = {
    editable: true,
    spellcheck: false,
    sanitize: true,
    rawPaste: false,
    minHeight: '300px',
    toolbarHiddenButtons: [
      [
        'subscript',
        'superscript',
        'justifyLeft',
        'justifyCenter',
        'justifyRight',
        'justifyFull',
        'heading',
        'fontName'
      ],
      [
        'fontSize',
        'textColor',
        'backgroundColor',
        'customClasses',
        'insertImage',
        'insertVideo',
        'insertHorizontalRule',
        'toggleEditorMode'
      ]
    ]
  };

  sanitizedHtml: string;

  _sanitizer = inject(DomSanitizer);

  ngOnInit(): void {
    this.forceTextChange();
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (changes.editMode) this.sanitizedHtml = this._sanitizer.sanitize(SecurityContext.HTML, this.content);
    if (changes.content) this.sanitizedHtml = this._sanitizer.sanitize(SecurityContext.HTML, this.content);
  }
  forceTextChange(): void {
    this.text = this.content;
  }

  cleanHTMLCode(): void {
    setTimeout((): void => {
      this.text = docsSoap(this.text);
      this.contentChange.emit(this.text);
    }, 100);
  }
}
