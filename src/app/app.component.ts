import { Component} from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {

  title = 'Assignment3';

  scroll(el: string) {
    const element = document.getElementById(el);
    if(element) {
      element.scrollIntoView({behavior: 'smooth', block:'start'});
    }
  } 
}
