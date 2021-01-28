
import { tap } from "rxjs/operators";
import { HttpErrorResponse, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "../../environments/environment";


@Injectable({providedIn: "root"})
export class LoggingInterceptor implements HttpInterceptor {
  private currentRequest: HttpRequest<any>;
  color = "green";

  constructor() {}

  intercept(req: HttpRequest<any>, next: HttpHandler) {
    this.currentRequest = req;

    if (!environment.production) {
      return next.handle(req).pipe(
        tap((event: any) => {
            if (event instanceof HttpResponse) {
              this.logLocal(event);
            }
          }, (error: any) => {
            if (error instanceof HttpErrorResponse) {
              this.logLocal(undefined, error);
            }
          }
        )
      );
    } else {
      return next.handle(req);
    }
  }

  public logLocal(evt?: HttpResponse<any> | any, err?: HttpErrorResponse | any) {
    const res = evt || err
    this.color = err ? "red" : "green";

    if (res) {
      console.groupCollapsed(
        `%c${this.currentRequest.method} ${res.status} ${res.url}`,
        `color: ${this.color}; font-style: italic`
      );
      console.groupCollapsed("Request");
      console.log(this.currentRequest != null ? JSON.stringify(this.currentRequest.body) : this.currentRequest);
      console.groupEnd();
      console.groupCollapsed("Response");
      console.log(res === evt ? JSON.stringify(res.body) : JSON.stringify(res.message));
      console.groupEnd();
      console.groupEnd();
    }
  }
}
