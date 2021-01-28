import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { AuthService } from '../../services';
import { NgRedux } from '@angular-redux/store';
import { resetActiveIllness } from '../../state/workbench/workbench.actions';

@Component({
  selector: 'mica-app-chooser',
  templateUrl: './app-chooser.component.html',
  styleUrls: ['./app-chooser.component.sass'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppChooserComponent implements OnInit {

  constructor(private auth: AuthService, private s: NgRedux<any>) { }

  ngOnInit() {
    this.auth.resetApp();
    this.s.dispatch(resetActiveIllness());
  }

}
