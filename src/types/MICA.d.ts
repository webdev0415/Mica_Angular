/// <reference path='./index.d.ts'/>

declare module MICA {

  type SelectableEl = Readonly<{
    name: string;
    value: any;
    origin?: string;
    defaultValue?: boolean;
    displayOrder?: number;
  }>

  type TypeaheadType = "static" | "liveSearch";
  type LiveSearchType = "drugByName" | "illnessNode" | "remoteIllnessValue";
  type LiveSearchTypeaheadResult = Readonly<{
    name: string;
    origin: string;
    value: Illness.FormValue;
  }>

  type SemanticVersioning = "major" | "minor" | "patch";

  type BasicError = Readonly<{
    status: number;
    message: string;
  }>

  type ControlError = Readonly<{
    [property: string]: any;
  }>

  type BootstrapProgress = Readonly<{
    finished?: boolean;
    progress?: number;
    symptomGroupsLoaded?: number;
    stepsStarted?: Set<string>;
    stepsCompleted?: Set<string>;
    stepStarted?: string;
    stepCompleted?: string;
  }>

  type NavBarType = "symptoms" | "treatments" | "templates" | "inspector" | "groups";

  interface SymptomNavItem {
    name: string;
    path?: string;
    subitems?: SymptomNavItem[];
  }

  interface NotificationMessage {
    text: string;
    id?: number;
    options: NotificationOptions
  }

  interface NotificationOptions { [name: string]: any }

  interface NotificationAction {
    id?: number,
    component: string;
    action: string;
    message: NotificationMessage;
  }


  type MessageType = "info" | "success" | "warn" | "error";



  namespace API {
    interface ResponseSimple {
      status: string;
    }

    namespace UpdateIllnessState {
      interface RequestItem {
        userID: number;
        fromState: Illness.State;
        toState: Illness.State;
        rejectionReason?: string;
        icd10Code: string;
        version: number;
      }

      interface Response extends ResponseSimple {
        count: number;
        idIcd10Codes: string[];
      }
    }
  }

  namespace MITA {
    type IllnessState = "complete" | "approved";

    interface UpdateIllnessState {
      reviewerId?: number;
      collectorId?: number;
      version: number;
      illnessCode: string;
    }
  }

  namespace Review {
    type SymptomPropertyPending = Readonly<{
      symptomID: string;
      changes: {
        [property: string]: any;
      }
    }>

    type IllnessPending = Readonly<{
      idIcd10Code: string;
      version: number;
      symptoms: SymptomPropertyPending[];
    }>
  }

  namespace User {
    type RoleName = "reviewer" | "collector";

    type Data = Readonly<{
      userID: number;
      roleID: number;
      roleName: RoleName | null;
      name: string;
      surname: string;
      email: string;
    }>

    type MICAData = Readonly<{
      user_id: number,
      role_id: number,
      role_name: string,
      email: string,
      name: string,
      surname: string,
      created_on: number
    }>

    interface SyncIllnessData {
      userData: Task.SyncIllness[]
    }

    interface GetIllnessByState {
      userID: number,
      state: string[];
    }

    type IllnessesByState = Readonly<{
      [state: string]: Illness.FormValue[];
    }>
  }

  interface Country {
    name: string;
    topLevelDomain: string[];
    alpha2Code: string;
    alpha3Code: string;
    callingCodes: string[];
    capital: string;
    altSpellings: string[];
    relevance: string;
    region: string;
    subregion: string;
    translations: {[lang: string]: string}
    population: number;
    latlng: [number, number];
    demonym: string;
    area: number;
    gini: number;
    timezones: string[];
    borders: string[];
    nativeName: string;
    numericCode: string;
    currencies: string[];
    languages: string[];
  }

  namespace BodyImage {

    type SelectedPath = [string, string, string, string[]];  // [view, perspective, zone, selected parts and/or sides]

    type ViewName = "general" | "muscle" | "skin" | "bone";

    type Output = {
      selectedPath: SelectedPath;
      bodyParts: string[];
    }

    interface Image {
      name: string;
      // x: number;
      // y: number;
      width?: number;
      // height: number;
      position: number;
      preserveAspectRatio: string;
      href: string,
      transform?: string
    }

    interface View {
      [view: string]: Image[];
    }

    interface ImageTransform {
      translate?: [number, number];
    }

    interface SVGConfig {
      height: number;
      width: number;
      bodyWidth: number;
      bodyHeight: number;
      transform: {
        front: ImageTransform,
        back: ImageTransform,
        side: ImageTransform
      };
    }

    interface ImgConfig {
      name: string;
      order: number;
      transform: ImageTransform;
      centralCoord: number;
      width: number;
    }
    // interface ClipPath {
    //   height: number;
    //   width: number;
    //   x: number;
    //   y: number;
    // }

    interface ViewSVGMap {
      [view: string]: PerspectiveSVGMap;
    }

    interface PerspectiveSVGMap {
      [perspective: string]: ZoneSVGMap;
    }

    interface ZoneSVGMap {
      [part: string]: SVGGroup[];
    }

    interface SVGGroup {
      groupName?: string; // if exists, it means there should be more than one shape. It's a group
      isLast?: boolean;
      // only one shape in pain as each body part is equivalent to a category
      shapes?: (BodyShape | BodyShapePath | BodyShapeEllipse | BodyShapeRect | BodyShapeCircle)[];
    }

    interface BodyShape {
      name: string;
      transform?: string;
    }

    interface BodyShapePath extends BodyShape {
      type: "path";
      d: string;
    }

    interface BodyShapeCircle extends BodyShape {
      type: "circle";
      cy?: number;
      cx?: number;
      r?: number;
    }

    interface BodyShapeEllipse extends BodyShape {
      type: "ellipse";
      ry?: number;
      rx?: number;
      cy?: number;
      cx?: number;
    }

    interface BodyShapeRect extends BodyShape {
      type: "rect";
      x: number;
      y: number;
    }
  }

  interface Auth0Configuration {
    clientID: string;
    domain: string;
  }


}
