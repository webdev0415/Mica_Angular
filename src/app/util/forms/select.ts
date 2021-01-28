import * as _ from "lodash";

export function findCatData(
  sectionID: string,
  sg: Illness.FormValueSymptomGroup,
  catIndex: number
): Workbench.Category | Illness.FormValueCategory | null {
  if (!sg) throw new Error("Unable to find symptom group when getting active categories");
  if (sg.sections) {
    const section = _.find(sg.sections, (s: Illness.FormValueSection | Workbench.Section) => {
      return s.sectionID === sectionID;
    }) || sg.sections[0];
    if (!section) throw new Error("Unable to find section when getting active categories");
    return ~catIndex ? section.categories[catIndex] : null;
  } else {
    if (!sg.categories) throw new Error("Unable to find categories when getting active categories");
    return ~catIndex ? sg.categories[catIndex] : null;
  }
}

export function catsInSymptomGroupParser(sg: Workbench.SymptomGroup, sectionID?: string): Workbench.Category[] {
  if (!sg) return [];
  if (sectionID) {
    return _.get(_.find(sg.sections, {sectionID}), "categories") || [];
  }
  return sg.sections ? _.flatMap(_.map(sg.sections, "categories")) : sg.categories || [];
}

export function findCatDataIndex(sg: Workbench.SymptomGroup, categoryID: string): number | undefined {
  if (!sg || !categoryID ) throw new Error("Unable to find category index: " + categoryID);
  if (sg.sections) {
    const cats = <Workbench.Category[]>_.flatMap(_.map(sg.sections, "categories"));
    return _.findIndex(cats, {categoryID});
  } else {
    if (!sg.categories) throw new Error("Unable to find category index: " + categoryID);
    return _.findIndex(sg.categories, {categoryID})
  }
}


