import { TitleService } from './services/title.service';
import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';

@NgModule({
  imports: [
    CommonModule,
  ],
  declarations: []
})
export class GlobalProvidersModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: GlobalProvidersModule,
      providers: [
        TitleService
      ]
    }
  }
}
