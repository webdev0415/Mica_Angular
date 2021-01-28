import { Action } from "redux";

declare namespace Nav {

  interface MenuItem {
    name: string;
    href: string;
  }

  interface MenuLevel {
    level: number;
    name: string;
  }

  /**
   *   ACTIONS
   */

  namespace Actions {
    import AppName = State.AppName;

    interface SetActiveGroup extends Action {
      group: string;
    }

    interface activeSectionSet extends Action {
      section: string;
    }

    interface SetActiveCategory extends Action {
      id: string;
    }

    interface setTitle extends Action {
      title: string;
    }

    interface ToggleEdit extends Action {
      edit: State.ActivateEditToken;
    }

    // interface SelectBodyPart extends Action {
    //   zone: string;
    //   bodyParts: string[];
    //   selected: string[];
    // }

    interface ToggleDescriptor extends Action {
      illness: string,
      symptom: string;
      row: number;
    }

    interface Upgrade extends Action{}

    interface ChangeNavBar extends Action {
      navBar: MICA.NavBarType;
    }

    interface ToggleIllnessErrors extends Action {}


    type NavAction = ToggleEdit | SetActiveGroup | activeSectionSet | setTitle
      | SetActiveCategory | ToggleDescriptor | Upgrade | ChangeNavBar | ToggleIllnessErrors;
  }
}

declare module "Nav" {
  export = Nav;
}
