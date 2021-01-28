import {whitespacesValidator} from "./whitestpace";
import {FormControl} from "@angular/forms";

describe("whitespace validators", () => {
  it("whiteSpacesValidator", () => {
    const formControl = new FormControl(" ");
    expect(whitespacesValidator(formControl).whitespace).toBeTruthy();
  });
});
