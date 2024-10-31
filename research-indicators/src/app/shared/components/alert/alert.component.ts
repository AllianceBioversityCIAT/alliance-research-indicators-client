import { Component, Input } from '@angular/core';
import { trigger, state, style, transition, animate } from '@angular/animations';

@Component({
  selector: 'app-alert',
  standalone: true,
  imports: [],
  templateUrl: './alert.component.html',
  styleUrls: ['./alert.component.scss'],
  animations: [trigger('alertAnimation', [state('information', style({ opacity: 1 })), state('warning', style({ opacity: 1 })), state('error', style({ opacity: 1 })), transition('void => information', [style({ opacity: 0 }), animate('300ms ease-in')]), transition('void => warning', [style({ opacity: 0 }), animate('300ms ease-in')]), transition('void => error', [style({ opacity: 0 }), animate('300ms ease-in')])])]
})
export class AlertComponent {
  @Input() status: 'information' | 'warning' | 'error' = 'information';
}
