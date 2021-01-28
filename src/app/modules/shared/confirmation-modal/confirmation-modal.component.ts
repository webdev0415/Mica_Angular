import { Component, OnInit, ChangeDetectionStrategy, Input } from '@angular/core';

@Component({
  selector: 'mica-confirmation-modal',
  templateUrl: './confirmation-modal.component.html',
  styleUrls: ['./confirmation-modal.component.sass'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConfirmationModalComponent implements OnInit {
  @Input() messageText: string;
  @Input() cancelText: string;
  @Input() confirmText: string;

  constructor() { }

  ngOnInit() {
  }

}
