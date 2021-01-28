import { defaultState } from "app/app.config";
import { allLabordersSelector } from "./laborders.selectors";

describe("laborders selectors", () => {

  it("all laborders", () => {
    const s = {
      ...defaultState,
      laborders: {
        laborders: [
          <Laborders.Laborder>{
            name: "CA 19-9",
            orderID: 10,
            loincCode: "24108-3"
          }
        ]
      }
    };

    expect(allLabordersSelector(s).length).toEqual(1);
  });

});
