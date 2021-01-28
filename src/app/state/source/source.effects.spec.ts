import { TestBed } from '@angular/core/testing';

import { SourceEffects } from './source.effects';
import { SourceService } from '../../services';
import { SourceServiceStub } from '../../../test/services-stubs/source.service.stub';
import { Actions } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';

describe('SourceEffects', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [
      StoreModule.forRoot({})
    ],
    providers: [
      Actions,
      { provide: SourceService, useClass: SourceServiceStub }
    ]
  }));

  it('should be created', () => {
    const service: SourceEffects = TestBed.get(SourceEffects);
    expect(service).toBeTruthy();
  });
});
