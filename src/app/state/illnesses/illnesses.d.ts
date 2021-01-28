import {Action} from "redux";

declare namespace Illnesses {
  namespace Actions {
    interface SetIllnesses extends Action {
      illnesses: Illness.DataShort[];
    }

    type IllnessesAction = SetIllnesses;
  }
}

declare module "Illnesses" {
  export = Illnesses;
}
