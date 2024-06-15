// content-list.component.ts
import { Component, OnInit } from '@angular/core';
import { DataService, ApiItem } from '../data.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser'; // <-- Import für DomSanitizer

@Component({
  selector: 'app-content-list',
  template: `
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
        <div>
          <h3>{{ item.name }}</h3>
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
  <div *ngIf="imageItems.length">
    <h2>Images</h2>
    <ul>
      <li *ngFor="let item of imageItems">
        <div>
          <h3>{{ item.name }}</h3>
          <img [src]="item.fileUrl" alt="{{ item.name }}">
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

    img {
    max-width: 300px;
    }

`]
})

export class ContentListComponent implements OnInit {
  items: ApiItem[] = [];
  filteredItems: ApiItem[] = []; // <-- Neues Array für gefilterte Elemente
  filteredItemsImage: ApiItem[] = []; // <-- Neues Array für gefilterte Elemente
  personItems: ApiItem[] = [];
  imageItems: ApiItem[] = [];
  organisationItems: ApiItem[] = [];
  metatagItems: ApiItem[] = [];
  tagItems: ApiItem[] = [];
  itentifierItems: ApiItem[] = [];
  connectionItems: ApiItem[] = [];
  contentItems: ApiItem[] = [];

  constructor(private dataService: DataService, private sanitizer: DomSanitizer) {}

  ngOnInit() {
    this.dataService.getMashupData().subscribe(items => {
      this.items = items;
      this.contentItems = this.items.filter(item => item.type === "data:content" && item.stringValue);
      this.contentItems = this.contentItems.filter(item => !item.stringValue.includes("<img")) //removes unformatable news feeds
      this.personItems = this.items.filter(item => item.type === "data:person" && item.stringValue);
      this.organisationItems = this.items.filter(item => item.type === "data:organisation" && item.stringValue);
      this.imageItems = this.items.filter(item => item.type === "data:image" && item.fileUrl);

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
