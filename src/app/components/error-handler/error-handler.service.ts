
import { ApplicationRef, ErrorHandler, Injectable, Injector } from '@angular/core';
import * as Sentry from '@sentry/browser';
import { ModalService } from '../modal/modal.service';
import { ErrorHandlerModalComponent } from './error-handler.component';
import { first, skipWhile } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

Sentry.init({
  dsn: environment.SENTRY_KEY
});


@Injectable()
export class MICAErrorHandlerService implements ErrorHandler {
  isModalshow = false;

  constructor(private injector: Injector) {
  }

  // @ts-ignore
  handleError(error) {
    if (!environment.production && !environment.pilot) {
      if (this.isModalshow) {
        return;
      }
      this.isModalshow = true;
      console.error('Error detected in MICA Global Handler: ', error);

      if (error.json) error = error.json();
      const modalSvc = this.injector.get(ModalService);
      const modalRef = modalSvc.open(ErrorHandlerModalComponent);
      const modal: ErrorHandlerModalComponent = modalRef.instance;

      modal.onModalClose.pipe(
        first()
      ).subscribe(() => {
        this.isModalshow = false
      });

      modal.errorMessage = error.message ? error.message : 'An error has been detected.';
      modal.emailBody = encodeURIComponent(`Error Report for MICA\n–––––––––-–––––––––––––––\n` +
        `Error message: ${error.message || 'No error message reported.'}\n` +
        `Error reason: ${error.reason || 'No reason reported.'}\n` +
        `Error statusCode: ${error.statusCode || 'No status code reported.'}\n` +
        (error.stack ? `Stack trace: ${error.stack}` : ``));
      // ApplicationRef depends on ErrorHandler
      // Get it here instead of in constructor to avoid an infinite loop
      const appRef: ApplicationRef = this.injector.get(ApplicationRef);
      appRef.isStable
        .pipe(
          skipWhile(stable => !stable),
          first()
        )
        .subscribe(stable => appRef.tick());
    }

    if (environment.production || environment.pilot) {
      const eventId = Sentry.captureException(error.originalError || error);
      Sentry.showReportDialog({eventId});
    }

  }
}

