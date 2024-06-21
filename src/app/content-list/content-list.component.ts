// content-list.component.ts
import { Component, OnInit } from '@angular/core';
import { DataService, ApiItem } from '../data.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-content-list',
  template: `
  <div *ngIf="bachelorContentItems.length" id="bachelor">
    <h2 >Bachelor-Arbeiten</h2>
    <ul>
      <li *ngFor="let item of bachelorContentItems">
        <div>
          <h3>{{ item.name }}</h3>
          <div [innerHTML]="sanitizeHtml(item.stringValue)"></div>
        </div>
      </li>
    </ul>
  </div>
  <div *ngIf="contentItems.length" id="content">
    <h2 >Inhalt</h2>
    <ul>
      <li *ngFor="let item of contentItems">
        <div>
          <h3>{{ item.name }}</h3>
          <div [innerHTML]="sanitizeHtml(item.stringValue)"></div>
        </div>
      </li>
    </ul>
  </div>
  <div *ngIf="personItems.length" id="person">
    <h2>Personen</h2>
    <ul>
      <li *ngFor="let item of personItems">
        <div class="container">
          <h3>{{ item.name }}</h3>
          <img class="shadow rounded" *ngIf="item.images" 
            [src]="item.fileUrl"  
            alt="{{ item.name }}">
          <div [innerHTML]="sanitizeHtml(item.stringValue)"></div>
        </div>
      </li>
    </ul>
  </div>
  <div *ngIf="organisationItems.length" id="organ">
    <h2 #organisation>Organisationen</h2>
    <ul>
      <li *ngFor="let item of organisationItems">
        <div>
          <h3>{{ item.name }}</h3>
          <div [innerHTML]="sanitizeHtml(item.stringValue)"></div>
        </div>
      </li>
    </ul>
  </div>
  `,
  styles: [`
  ul {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
    list-style: none;
    padding: 0;
  }

  li {
    border: 1px solid #ccc;
    padding: 1.5rem;
    border-radius: 5px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  }

  h2 {
    color: #2a2058;
    margin-top: 2rem;
  }

  div {
  overflow-wrap: break-word;
  }

  .container img {
    max-width: 100%;
    height: auto;
    object-fit: contain;
    margin-bottom: 1rem;
  }
`]
})

export class ContentListComponent implements OnInit {
  items: ApiItem[] = [];
  personItems: ApiItem[] = [];
  imageItems: ApiItem[] = [];
  organisationItems: ApiItem[] = [];
  contentItems: ApiItem[] = [];
  imageDict: { [key: string]: ApiItem } = {};

  bachelorItem: ApiItem | undefined; // will grab the single bachelor announcement meta tag, the others are not needed
  bachelorMetaTags: string[] = [];
  bachelorContentItems: ApiItem[] = [];

  constructor(private dataService: DataService, private sanitizer: DomSanitizer) { }

  ngOnInit() {
    this.dataService.getMashupData().subscribe(items => {
      this.items = items;
      this.contentItems = this.items.filter(item => item.type === "data:content" && item.stringValue && !item.stringValue.includes("<img"));
      this.personItems = this.items.filter(item => item.type === "data:person" && item.stringValue);
      this.organisationItems = this.items.filter(item => item.type === "data:organisation" && item.stringValue);
      this.imageItems = this.items.filter(item => item.type === "data:images" && item.fileUrl);

      this.bachelorItem = items.find(item => item.type === "data:metatag" && item.name === "type:bachelorarbeit");

      if (this.bachelorItem && this.bachelorItem.metaTagged) {
        this.bachelorMetaTags = this.bachelorItem.metaTagged.split(" ");
      }

      this.bachelorContentItems = items.filter(item => this.bachelorMetaTags.includes(item.ident))

      this.imageItems.forEach(image => this.imageDict[image.ident] = image);

      this.personItems.forEach(person => {
        if (person.images) {
          const imageIdent = person.images;
          const image = this.items.find(item => item.ident === imageIdent && item.type === 'data:image');
          if (image) {
            person.fileUrl = image.fileUrl;
          }
        } //iteriert über die sachen, die ein image haben und ordnet ihnen das item mit dem ident zu, welches dann das Bild ist
      });

    });
  }

  sanitizeHtml(html: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

}
