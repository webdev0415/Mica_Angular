import {CorrectSpellingPipe} from "./correct-spelling.pipe";

it("CorrectSpellingPipe", () => {
  const pipe = new CorrectSpellingPipe();
  expect(pipe.transform("behaviour")).toEqual("Behavior");
  expect(pipe.transform("general")).not.toEqual("Behavior");
});
