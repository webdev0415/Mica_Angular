import { ImageLoadingService } from './services/image-loading.service';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { PipesModule } from './modules/pipes/pipes.module';
import { GlobalProvidersModule } from './modules/global-providers/global-providers.module';
import { ErrorReportingModule } from './modules/error-reporting/error-reporting.module';
import { GuardsModule } from './modules/guards/guards.module';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ErrorHandler, NgModule } from '@angular/core';
import { RouterModule, PreloadAllModules } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgReduxModule, NgRedux } from '@angular-redux/store';
import { store } from './state/state.store';

import { authConfig, AUTH_CONFIG } from './app.config';
import { AppComponent } from './app.component';
import { appRoutes } from './app.routing';
import { CountryService, SymptomService, IllnessService, AuthService,
  EcwService, SourceService } from './services';

import { HeaderModule } from './modules/header/header.module';
import { SpinnerModule } from './modules/spinner/spinner.module';
import { GuiWidgetsModule } from './modules/gui-widgets/gui-widgets.module';

import { NotifierComponent } from './components/notifier/notifier.component';
import { LogoutComponent } from './components/logout/logout.component';
import { BootstrapperComponent } from './components/bootstrapper/bootstrapper.component';
import { IdleDetectorService, TemplateService } from './services';
import { GlobalErrorComponent } from './components/global-error/global-error.component';
import { TypeaheadModule } from './modules/typeahead/typeahead.module';
import { ModalComponent } from './components/modal/modal.component';
import { ErrorHandlerModalComponent } from './components/error-handler/error-handler.component';
import { MICAErrorHandlerService } from './components/error-handler/error-handler.service';
import { ModalService } from './components/modal/modal.service';
import { HttpClientModule } from '@angular/common/http';
import { JwtModule } from '@auth0/angular-jwt';
import { NgxPageScrollModule } from 'ngx-page-scroll';
export function tokenGetter() { return localStorage.getItem('id_token.MICA'); }

import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { MatCardModule } from '@angular/material';
import { AppChooserComponent } from './components/app-chooser/app-chooser.component';
import { LoggingInterceptor } from './components/logging-interceptor';
import { StoreModule } from '@ngrx/store';
import { reducers, metaReducers } from './reducers';
import { EffectsModule } from '@ngrx/effects';
import { SourceEffects } from './state/source/source.effects';

@NgModule({
  declarations: [
    AppComponent,
    NotifierComponent,
    LogoutComponent,
    BootstrapperComponent,
    GlobalErrorComponent,
    ModalComponent,
    ErrorHandlerModalComponent,
    AppChooserComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    JwtModule.forRoot({
      config: {
        tokenGetter: tokenGetter
      }
    }),
    RouterModule.forRoot(appRoutes, {preloadingStrategy: PreloadAllModules, onSameUrlNavigation: 'reload'}),
    NgReduxModule,
    NgbModule,
    SpinnerModule,
    HeaderModule,
    TypeaheadModule,
    GuiWidgetsModule,
    NgxPageScrollModule,
    GuardsModule,
    ErrorReportingModule,
    GlobalProvidersModule.forRoot(),
    PipesModule,
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule,
    MatCardModule,
    StoreModule.forRoot(reducers, {
      metaReducers,
      runtimeChecks: {
        strictStateImmutability: true,
        strictActionImmutability: true
      }
    }),
    EffectsModule.forRoot([SourceEffects])
  ],
  providers: [
    { provide: AUTH_CONFIG, useValue:  authConfig},
    { provide: ErrorHandler, useClass: MICAErrorHandlerService },
    { provide: HTTP_INTERCEPTORS, useClass: LoggingInterceptor, multi: true },
    CountryService,
    SymptomService,
    IllnessService,
    AuthService,
    IdleDetectorService,
    ImageLoadingService,
    ModalService,
    EcwService,
    SourceService,
    TemplateService
  ],
  bootstrap: [AppComponent],
  entryComponents: [
    ModalComponent,
    ErrorHandlerModalComponent
  ]
})
export class AppModule {
  constructor(private ngRedux: NgRedux<State.Root>) {
    ngRedux.provideStore(store);
  }
}
