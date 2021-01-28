import { SetLabOrders } from "./laborders.actions";
import { laborersInit } from "app/app.config";
import { labordersReducer } from "./laborders.reducer";

describe("laborder reducer", () => {
  const laborders = [
    {
      name: "one",
      orderID: 1,
    },
    {
      name: "two",
      orderID: 2,
    },
  ];
  const state = { ...laborersInit };

  it("SET_LABORDERS", () => {
    const action = SetLabOrders(laborders);
    expect(labordersReducer(state, action).laborders.length).toEqual(laborders.length);
  });
});
