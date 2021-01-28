import { Component, OnInit, ChangeDetectionStrategy, Input } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'mica-drug-likelihood',
  templateUrl: './drug-likelihood.component.html',
  styleUrls: ['./drug-likelihood.component.sass'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DrugLikelihoodComponent implements OnInit {
  @Input() likelihoodCtrl: FormControl;

  likelihoods: { value: number, name: string }[] = [
    { value: 0, name: 'Forbidden' },
    { value: 20, name: 'Discouraged' },
    { value: 40, name: 'Allowed' },
    { value: 60, name: 'Suggested' },
    { value: 80, name: 'Preferred' },
    { value: 100, name: 'Always' },
  ];

  constructor() { }

  ngOnInit() {
  }

}
