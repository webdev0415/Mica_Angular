import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'mica-warning-form',
  templateUrl: './warning-form.component.html',
  styleUrls: ['./warning-form.component.sass'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WarningFormComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
