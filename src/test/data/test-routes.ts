import {TestComponent} from "../test.component";

export const testRoutes = [{
    path: "treatments",
    component: TestComponent,
    data: {
      title: "Treatments"
    }
  }, {
    path: "",
    component: TestComponent,
    data: {
      title: "None"
    }
}];
