// import {
//   async, ComponentFixture,
//   TestBed
// } from "@angular/core/testing";
// import {APP_BASE_HREF} from "@angular/common";
// import {RouterModule} from "@angular/router";
// import {AppComponent} from "./app.component";
// import {
//   Http,
//   ConnectionBackend,
//   BaseRequestOptions,
//   Response,
//   ResponseOptions
// } from "@angular/http";
// import {MockBackend} from "@angular/http/testing";
// import {HeaderComponent} from "./modules/header/header.component";
// import {appRoutes} from "./app.routing";
// import {LogoutComponent} from "./components/logout/logout.component";
// import {BootstrapperComponent} from "./components/bootstrapper/bootstrapper.component";
// import {GlobalErrorComponent} from "./components/global-error/global-error.component";
// import {NotifierComponent} from "./components/notifier/notifier.component";
// import {NavComponent} from "./modules/header/components/nav/nav.component";
// import {UserComponent} from "./modules/header/components/user/user.component";
// import {ErrorBoxComponent} from "./modules/error-reporting/box/box.component";
// import {SymptomsListComponent} from "./modules/workbench/shared/symptoms-list/symptoms-list.component";
// fdescribe("AppComponent", () => {
//   let fixture: ComponentFixture<AppComponent>;
//   let component: AppComponent;
//
//   beforeEach(() => {
//     TestBed.configureTestingModule({
//       declarations: [
//         AppComponent,
//         HeaderComponent,
//         LogoutComponent,
//         BootstrapperComponent,
//         GlobalErrorComponent,
//         NotifierComponent,
//         NavComponent,
//         UserComponent,
//         ErrorBoxComponent,
//         SymptomsListComponent
//       ],
//       providers: [
//         {provide: APP_BASE_HREF, useValue: "/"},
//         BaseRequestOptions,
//         MockBackend,
//         {
//           provide: Http,
//           useFactory: (backend: ConnectionBackend, defaultOptions: BaseRequestOptions) => new Http(backend, defaultOptions),
//           deps: [MockBackend, BaseRequestOptions]
//         }
//       ],
//       imports: [RouterModule.forRoot(appRoutes)]
//     });
//     TestBed.compileComponents();
//   });
//
//   beforeEach(async(() => {
//     fixture = TestBed.createComponent(AppComponent);
//     component = fixture.debugElement.componentInstance;
//   }));
//
//   it("should create the app", async(() => {
//     expect(component).toBeTruthy();
//   }));
// });
