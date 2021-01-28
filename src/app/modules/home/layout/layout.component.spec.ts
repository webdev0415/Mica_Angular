import { async, ComponentFixture, TestBed } from "@angular/core/testing";
import { LayoutComponent } from "./layout.component";
import { EditorLoaderServiceStub } from "../../../../test/services-stubs/editor-loader.service.stub";
import { EditorLoaderService } from "../../workbench/services/editor-loader.service";
import { PageSpinnerComponent } from "../../spinner/page-spinner/page-spinner.component";
import { ErrorBoxComponent } from "../../error-reporting/box/box.component";
import { Component, Input } from "@angular/core";
import { TitleServiceStub } from "../../../../test/services-stubs/title.service.stub";
import { TitleService } from "../../global-providers/services/title.service";
import { defaultState } from "app/app.config";
import { NgRedux } from "@angular-redux/store";
import { TitleCasePipe } from "../../pipes/title-case.pipe";
import { setTasks, checkedPreviousVersion } from "app/state/task/task.actions";
import { HomeServiceStub } from "../../../../test/services-stubs/home.service.stub";
import { HomeService } from "../home.service";
import { of } from "rxjs/observable/of";
import { ErrorObservable } from "rxjs/observable/ErrorObservable";
import Data = Task.Data;
const fakeTasks = require("../../../../test/data/tasks.json").tasks;
import * as workbenchSelectors from "app/state/workbench/workbench.selectors";

const mockRedux = {
  getState: (): State.Root => {
    return defaultState
  },
  select: (selector) => of(selector(defaultState)),
  dispatch: (arg: any) => {
  }
};

@Component({
  selector: "mica-tasks",
  template: "<div></div>"
})
class MockTasksComponent {
  @Input() tasks: Task.Data[] = [];
  @Input() title: string;
  @Input() disabledAccordion: boolean;
  @Input() removeEnabled: boolean;
  @Input() tasksOriginal: Task.Data[] = [];
}

describe("LayoutComponent", () => {
  let component: LayoutComponent;
  let fixture: ComponentFixture<LayoutComponent>;
  let homeService: HomeService;
  let redux: NgRedux<State.Root>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        LayoutComponent,
        MockTasksComponent,
        PageSpinnerComponent,
        ErrorBoxComponent,
        TitleCasePipe
      ],
      providers: [
        {provide: EditorLoaderService, useClass: EditorLoaderServiceStub},
        {provide: TitleService, useClass: TitleServiceStub},
        {provide: HomeService, useClass: HomeServiceStub},
        {provide: NgRedux, useValue: mockRedux}
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    redux = TestBed.get(NgRedux);
    fixture = TestBed.createComponent(LayoutComponent);
    component = fixture.componentInstance;
    homeService = TestBed.get(HomeService);
    fixture.detectChanges();
  });

  it("should create and destroy OK", () => {
    expect(component).toBeTruthy();
    (component as any).lazyLoadTasks = of([]).subscribe();
    const mockUnsubscribe = spyOn((component as any).lazyLoadTasks, "unsubscribe").and.callThrough();
    component.ngOnDestroy();
    expect(mockUnsubscribe).toHaveBeenCalled();
  });

  it("taskLoader", () => {
    const error: any = {
      name: "ERROR",
      message: "Error message."
    };
    spyOnProperty(homeService, "tasks$", "get").and.returnValue(ErrorObservable.create(error));
    homeService.tasks$.subscribe(null, err => {
      expect(err).toBeTruthy();
    });

    (component as any).taskLoader.subscribe();
    expect(component.taskErrorMsg).toContain(error.message);

    error.message = null;
    (component as any).taskLoader.subscribe().unsubscribe();
    expect(component.taskErrorMsg).toContain("no message");

    error.status = 500;
    (component as any).taskLoader.subscribe().unsubscribe();
    expect(component.taskErrorMsg).toContain("internal");

    error.name = "TimeoutError";
    (component as any).taskLoader.subscribe().unsubscribe();
    expect(component.taskErrorMsg).toContain("Timeout");
  });

  it("loadTasksOnce", () => {
    const mockDispatch = spyOn(redux, "dispatch").and.callThrough();
    spyOnProperty((component as any), "taskLoader", "get").and.returnValue(of(fakeTasks));
    (component as any).loadTasksOnce();
    expect(mockDispatch).toHaveBeenCalledWith(setTasks(fakeTasks));
  });

  it("onReloadTasks", () => {
    const mockDispatch = spyOn(redux, "dispatch").and.callThrough();
    const mockLoadTasksOnce = spyOn((component as any), "loadTasksOnce").and.callFake(() => {
    });
    component.dataLoading = false;
    component.newTasksAvailable = fakeTasks;
    component.onReloadTasks();
    expect(mockDispatch).toHaveBeenCalledWith(setTasks(fakeTasks));
    expect(mockDispatch).toHaveBeenCalledWith(checkedPreviousVersion(false));
    expect(component.newTasksAvailable).toEqual([]);
    expect(component.newTasksCounter).toEqual(0);
    expect(component.dataLoading).toBeFalsy();

    component.onReloadTasks();
    expect(mockLoadTasksOnce).toHaveBeenCalled();
    expect(component.dataLoading).toBeTruthy();
  });

  it("tasksWithLimitedIllnesses", () => {
    const tasks = [{illness: [{}, {}]}];
    expect(component["tasksWithLimitedIllnesses"](tasks as Data[], 0)).toBeDefined();
  });

  it("tasksWithLimitedIllnesses", () => {
    const tasks = [{illness: [{}]}];
    expect(component["tasksWithLimitedIllnesses"](tasks as Data[], 1)).toBeDefined();
  });

  it("tasksWithLimitedIllnesses", () => {
    const tasks = [{illness: [{}, {}]}];
    expect(component["tasksWithLimitedIllnesses"](tasks as Data[], 3)).toBeDefined();
  });

  it("processStoredTasks", () => {
    component.tasksComplete = [{dateComplete: null, illness: []} as Data];
    const loadTasksOnceSpy = spyOn<any>(component, "loadTasksOnce").and.callThrough();
    component["processStoredTasks"]([]);
    expect(loadTasksOnceSpy).toHaveBeenCalled();
  });

  it("processStoredTasks", () => {
    component.tasksComplete = [{dateComplete: new Date(), illness: [{}]} as Data];
    component.enableLazyLoading = false;
    const loadTasksOnceSpy = spyOn<any>(component, "loadTasksOnce").and.callThrough();
    expect(component["processStoredTasks"]([])).toBeUndefined();
    expect(loadTasksOnceSpy).not.toHaveBeenCalled();
  });

  it("processStoredTasks", () => {
    component.tasksComplete = [{dateComplete: new Date(), illness: [{}]} as Data];
    component.enableLazyLoading = true;
    component["lazyLoadTasks"] = of({}).subscribe();
    const lazyLoadTasksSpy = spyOn<any>(component["lazyLoadTasks"], "unsubscribe").and.callThrough();
    component["processStoredTasks"]([]);
    expect(lazyLoadTasksSpy).toHaveBeenCalled();
  });

  it("processStoredTasks", () => {
    component.tasksComplete = [{dateComplete: new Date(), illness: [{}]} as Data];
    component.enableLazyLoading = true;
    component["lazyLoadTasks"] = null;
    spyOnProperty<any>(component, "taskLoader", "get").and.returnValue(of([]));
    expect(component["processStoredTasks"]([])).toBeUndefined();
  });

  it("processStoredTasks", () => {
    component.tasksComplete = [{dateComplete: new Date(), illness: [{}]} as Data];
    component.enableLazyLoading = true;
    component["lazyLoadTasks"] = null;
    const err = {
      name: "TimeoutError"
    };
    spyOnProperty<any>(component, "taskLoader", "get").and.returnValue(ErrorObservable.create(err));
    const consoleSpy = spyOn(console, "log").and.callThrough();
    component["processStoredTasks"]([]);
    expect(consoleSpy).toHaveBeenCalledWith("Lazy checks for new tasks timed out");
  });

  it("processStoredTasks", () => {
    component.tasksComplete = [{dateComplete: new Date(), illness: [{}]} as Data];
    component.enableLazyLoading = true;
    component["lazyLoadTasks"] = null;
    const err = {
      name: "InternalError"
    };
    spyOnProperty<any>(component, "taskLoader", "get").and.returnValue(ErrorObservable.create(err));
    const consoleSpy = spyOn(console, "log").and.callThrough();
    component["processStoredTasks"]([]);
    expect(consoleSpy).toHaveBeenCalledWith("Lazy checks for new tasks failed: ", err);
  });

  it("onTasks", () => {
    component.enableLazyLoading = false;
    expect(component["onTasks"]([])).toBeUndefined();
  });

  it("onTasks", () => {
    component.enableLazyLoading = true;
    const tasks = [
      {
        illness: [
          {
            form: {
              idIcd10Code: "18"
            },
            idIcd10Code: "17",
            version: 1
          }
        ]
      }
    ] as any;
    spyOnProperty<any>(component, "taskLoader", "get").and.returnValue(of(tasks));
    spyOn(workbenchSelectors, "illnessValues").and.returnValue(tasks[0].illness);
    component["onTasks"]([]);
    expect(component.enableLazyLoading).toBeFalsy();
  });

  it("onTasks", () => {
    component.enableLazyLoading = true;
    const tasks = [
      {
        illness: [
          {
            form: {
              idIcd10Code: "17"
            },
            idIcd10Code: "17",
            version: 1
          }
        ]
      }
    ];
    spyOnProperty<any>(component, "taskLoader", "get").and.returnValue(of(tasks));
    const illness = {...tasks[0].illness[0]};
    illness.version = 2;
    spyOn(workbenchSelectors, "illnessValues").and.returnValue([illness]);
    const mockDispatch = spyOn(redux, "dispatch").and.callThrough();
    component["onTasks"]([]);
    expect(component.enableLazyLoading).toBeFalsy();
    expect(mockDispatch).toHaveBeenCalled();
  });

  it("onTasks", () => {
    spyOn<any>(component, "tasksWithLimitedIllnesses").and.callFake(() => []);
    spyOn<any>(component, "processStoredTasks").and.callFake(() => {});
    const tasks = [
      {
        dateComplete: new Date()
      } as Data,
      {
        dateComplete: null
      } as Data
    ];
    component["onTasks"](tasks);
    expect(component.enableLazyLoading).toBeTruthy();
  });

  it("tasksWithLimitedIllnesses", () => {
    const tasks = [
      {
        taskId: 0
      } as Data
    ];
    expect(component["tasksWithLimitedIllnesses"](tasks, 0)).toEqual([]);
  });

  it("tasksWithLimitedIllnesses", () => {
    const tasks = [
      {
        taskId: 0,
        illness: [
          {}
        ]
      } as Data,
      {
        taskId: 1,
        illness: [
          {}
        ]
      } as Data
    ];
    expect(component["tasksWithLimitedIllnesses"](tasks, 4)).toBeDefined();
  });

  it("tasksWithLimitedIllnesses", () => {
    const tasks = [
      {
        taskId: 1,
        illness: [
          {},
          {}
        ]
      } as Data
    ];
    expect(component["tasksWithLimitedIllnesses"](tasks, 1)).toBeDefined();
  });

  it("tasksWithLimitedIllnesses", () => {
    const tasks = [
      {
        taskId: -1,
        illness: [
          {},
          {},
          {},
          {},
          {},
          {}
        ]
      } as Data
    ];
    expect(component["tasksWithLimitedIllnesses"](tasks, 1)).toBeDefined();
  });

  it("sortByDate", () => {
    const taskA = {
      dateComplete: "2"
    } as any;
    const taskB = {
      dateComplete: "3"
    } as any;
    expect(component["sortByDate"](taskA, taskB)).toEqual(1);
  });

  it("sortByCode", () => {
    const illA = { idIcd10Code: "G44.001" } as any;
    const illB = { idIcd10Code: "G44.002" } as any;
    expect(component["sortByCode"](illA, illB)).toBe(-1);
    expect(component["sortByCode"](illB, illA)).toBe(1);
    expect(component["sortByCode"](illA, illA)).toBe(0);
  });

  it("getIllnessCount", () => {
    const task = {
      illness: [
        {}
      ]
    } as any;
    expect(component["getIllnessCount"](0, task)).toEqual(1);
  });

  it("tasksLoading", () => {
    expect(component.tasksLoading).toBeDefined();
  });

  it("onEnableRemove", () => {
    const removeEnabled = false;
    component.removeEnabled = true;
    component.onEnableRemove(removeEnabled);
    expect(component.removeEnabled).toEqual(removeEnabled);
  });

});
