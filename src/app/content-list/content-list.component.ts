// content-list.component.ts
import { Component, OnInit } from '@angular/core';
import { DataService, ApiItem } from '../data.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser'; // <-- Import für DomSanitizer

@Component({
  selector: 'app-content-list',
  template: `
  <div *ngIf="bachelorContentItems.length" id="content">
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
    <h2 >Content</h2>
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
    <h2>Person</h2>
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
    <h2 #organisation>Organisation</h2>
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
    gap: 20px;
    list-style: none;
    padding: 0;
  }

  li {
    border: 1px solid #ccc;
    padding: 15px;
  }

  h2 {
    margin-top: 40px;
  }

  div {
  overflow-wrap: break-word;
  }


  .container img {
    height: 100%;
    width: 100%;
    object-fit: contain;
    margin-bottom: 10px;
  }

`]
})

export class ContentListComponent implements OnInit {
  items: ApiItem[] = [];
  filteredItems: ApiItem[] = [];
  filteredItemsImage: ApiItem[] = []; 
  personItems: ApiItem[] = [];
  imageItems: ApiItem[] = [];
  organisationItems: ApiItem[] = [];
  metatagItems: ApiItem[] = [];
  tagItems: ApiItem[] = [];
  itentifierItems: ApiItem[] = [];
  connectionItems: ApiItem[] = [];
  contentItems: ApiItem[] = [];
  imageDict: { [key: string]: ApiItem } = {};
  bachelorMetaTags: string[] = []; 
  bachelorItem: ApiItem | undefined; 
  bachelorContentItems: ApiItem[] = [];

  constructor(private dataService: DataService, private sanitizer: DomSanitizer) {}

  ngOnInit() {
    this.dataService.getMashupData().subscribe(items => {
      this.items = items;
      this.contentItems = this.items.filter(item => item.type === "data:content" && item.stringValue);
      this.contentItems = this.contentItems.filter(item => !item.stringValue.includes("<img")) //removes unformatable news feeds
      this.personItems = this.items.filter(item => item.type === "data:person" && item.stringValue);
      this.organisationItems = this.items.filter(item => item.type === "data:organisation" && item.stringValue);
      this.imageItems = this.items.filter(item => item.type === "data:images" && item.fileUrl);

      this.bachelorItem = items.find(item => item.type === "data:metatag" && item.name === "type:bachelorarbeit");

      if (this.bachelorItem && this.bachelorItem.metaTagged) {
        this.bachelorMetaTags = this.bachelorItem.metaTagged.split(" "); 
      }

      this.bachelorContentItems = items.filter(item => this.bachelorMetaTags.includes(item.ident))

      this.imageItems.forEach(image => this.imageDict[image.ident] = image);
      console.log(this.imageDict)


      this.personItems.forEach(person => {
        if (person.images) {
          const imageIdent = person.images; 
          const image = this.items.find(item => item.ident === imageIdent && item.type === 'data:image');
          if (image) {
            person.fileUrl = image.fileUrl;
          }
        }
      });

      this.filteredItems =[...this.items.filter(item => item.type === "data:content" && item.stringValue != "" 
        && item.stringValue != undefined), ...this.items.filter(item => item.type === "data:email" 
          && item.stringValue != "" && item.stringValue != undefined), ...this.items.filter(item => item.type === "data:person" 
            && item.stringValue != "" && item.stringValue != undefined), ...this.items.filter(item => item.type === "data:organisation" 
              && item.stringValue != "" && item.stringValue != undefined) ];
    });
  }

  sanitizeHtml(html: string): SafeHtml { // <-- Methode zum Sanitize von HTML
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }


}
