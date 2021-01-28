import { async, ComponentFixture, fakeAsync, TestBed, tick } from "@angular/core/testing";
import { NotifierComponent } from "./notifier.component";
import { NgRedux } from "@angular-redux/store";
import { defaultState } from "../../app.config";
import { DEL_MSG, POST_UNDO } from "../../state/messages/messages.actions";
import { of } from "rxjs/observable/of";
import NotificationMessage = MICA.NotificationMessage;
import { RouterTestingModule } from "@angular/router/testing";
import { NavigationEnd, Router } from "@angular/router";
import { Observable } from "rxjs";

class MockRouter {
  newNavEnd = new NavigationEnd(0, "", "/treatments");
  events = new Observable(observer => {
    observer.next(this.newNavEnd);
    observer.complete();
  });
}

const mockRedux = {
  getState: (): State.Root => {
    return defaultState
  },
  select: (selector) => of(selector(defaultState)),
  dispatch: (arg: any) => {}
};

describe("NotifierComponent", () => {
  let component: NotifierComponent;
  let fixture: ComponentFixture<NotifierComponent>;
  let redux: NgRedux<State.Root>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NotifierComponent ],
      providers: [
        { provide: NgRedux, useValue: mockRedux },
        {provide: Router, useClass: MockRouter}
      ],
      imports: [RouterTestingModule]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NotifierComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    redux = TestBed.get(NgRedux);
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("getAlertClass should return correct alert class", () => {
    const options = {type: "success"};
    let res = component.getAlertClass(options);
    expect(res).toEqual("bg-success");

    options.type = "warning";
    res = component.getAlertClass(options);
    expect(res).toEqual("bg-warning");

    options.type = "error";
    res = component.getAlertClass(options);
    expect(res).toEqual("bg-danger");

    options.type = "danger";
    res = component.getAlertClass(options);
    expect(res).toEqual("bg-danger");

    options.type = "default";
    res = component.getAlertClass(options);
    expect(res).toEqual("bg-primary");
  });

  it("getBtnClass should return correct btn class", () => {
    const options = {type: "success"};
    let res = component.getBtnClass(options);
    expect(res).toEqual("btn-success");

    options.type = "warning";
    res = component.getBtnClass(options);
    expect(res).toEqual("btn-warning");

    options.type = "error";
    res = component.getBtnClass(options);
    expect(res).toEqual("btn-danger");

    options.type = "default";
    res = component.getBtnClass(options);
    expect(res).toEqual("btn-info");
  });

  it("delMessage should dispatch state", () => {
    const mockDispatch = spyOn(redux, "dispatch").and.callThrough();
    const id = 1;
    component.delMessage(id);
    expect(mockDispatch).toHaveBeenCalledWith({
      type: DEL_MSG,
      id: id
    })
  });

  it("delMessageTimeout should call delMessage", fakeAsync(() => {
    const mockDelMessage = spyOn(component, "delMessage").and.callThrough();
    const id = 1;
    component.delMessageTimeout(id);
    tick(10000);
    expect(mockDelMessage).toHaveBeenCalledWith(id)
  }));

  it("onUndo should call delMessageTimeout", () => {
    const mockDelMessage = spyOn(component, "delMessageTimeout").and.callThrough();
    const mockDispatch = spyOn(redux, "dispatch").and.callThrough();
    const message = {
      text: "text",
      id: 1,
      options: {}
    };
    component.onUndo(message);
    expect(mockDelMessage).toHaveBeenCalledWith(message.id);
    expect(mockDispatch).toHaveBeenCalledWith({
      type: POST_UNDO,
      message: message
    });
  });

  it("onUndo should call delMessageTimeout", () => {
    const mockDelMessage = spyOn(component, "delMessageTimeout").and.callThrough();
    const mockDispatch = spyOn(redux, "dispatch").and.callThrough();
    const message = {
      text: "text",
      options: {}
    };
    component.onUndo(message);
    expect(mockDelMessage).not.toHaveBeenCalled();
    expect(mockDispatch).toHaveBeenCalledWith({
      type: POST_UNDO,
      message: message
    });
  });

  it("ngOnInit", () => {
    spyOnProperty<any>(component, "queue$", "get").and.returnValue(of([{id: 17}]));
    const publisherSpy = spyOn(component.publisher, "next").and.callThrough();
    // component["queue"] = [{id: 18} as NotificationMessage];
    component.ngOnInit();
    expect(publisherSpy).toHaveBeenCalled();
  });

  it("ngOnInit", () => {
    spyOnProperty<any>(component, "queue$", "get").and.returnValue(of([{}]));
    const publisherSpy = spyOn(component.publisher, "next").and.callThrough();
    const delMessageSpy = spyOn(component, "delMessageTimeout").and.callThrough();
    // component["queue"] = [{id: 18} as NotificationMessage];
    component.ngOnInit();
    expect(publisherSpy).toHaveBeenCalled();
    expect(delMessageSpy).not.toHaveBeenCalled();
  });

  it("ngOnInit", () => {
    spyOnProperty<any>(component, "queue$", "get").and.returnValue(of([]));
    const publisherSpy = spyOn(component.publisher, "next").and.callThrough();
    const delMessageSpy = spyOn(component, "delMessageTimeout").and.callThrough();
    // component["queue"] = [{} as NotificationMessage];
    component.ngOnInit();
    expect(publisherSpy).toHaveBeenCalled();
    expect(delMessageSpy).not.toHaveBeenCalled();
  });

  it("ngOnInit", () => {
    const messages = [
      {
        text: "text",
        id: 1,
        options: {autoClose: false}
      } as NotificationMessage,
      {
        text: "text 1",
        id: 2,
        options: {autoClose: false}
      } as NotificationMessage
    ];
    // component["queue$"]= messages;
    spyOnProperty(component, "queue$", "get").and.returnValue(of(messages));
    const nextSpy = spyOn(component.publisher, "next").and.callThrough();
    component.ngOnInit();
    expect(nextSpy).toHaveBeenCalled();
  });

  it("trackByFunc", () => {
    const messages = [
      {
        text: "text",
        id: 1
      } as NotificationMessage
    ];
    expect(component.trackByFunc(1,  messages[0])).toEqual(messages[0].id);
  });

});
