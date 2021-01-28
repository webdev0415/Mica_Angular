import { createSelector } from "reselect";
import * as _ from "lodash";
import * as symptomSelectors from "../symptoms/symptoms.selectors";

const navSelector = (state: State.Root) => state.nav;
export const activeSectionID = (state: State.Root) => state.nav.activeSection;
const activeSymptomGroupData = (state: State.Root) => symptomSelectors.activeSymptomGroupData(state);
const activeSectionData = (state: State.Root) => symptomSelectors.activeSectionData(state);

export const activeCategoryID = createSelector(
  navSelector,
  nav => nav.activeCategory
)

export const activeCategoryIDNext = createSelector(
  activeCategoryID,
  activeSymptomGroupData,
  activeSectionData,
  (categoryID, sg, section) => getCategory(categoryID, sg, section)
)

export const activeSymptomGroup = createSelector(
  navSelector,
  nav => nav.activeGroup || ""
);

export const symptomItems = createSelector(
  navSelector,
  nav => nav.symptomItems
)

export const symptomItemsIDs = createSelector(
  symptomItems,
  items => _.map(items, i => _.split(i.name.toLowerCase(), "/")[0])
)

export const symptomItemPath = (id: string) => createSelector(
  symptomItems,
  items => {
    const item = _.find(items, {name: _.startCase(id)});
    return item ? item.path : null
  }
)

export const getCategory = (categoryID: any, sg: any, section: any) => {
  if (sg && sg.categories) {
    const currIndex = _.findIndex(sg.categories, c => c === categoryID);
    return sg.categories[~currIndex ? currIndex + 1 : 0];
  } else if (section) {
    const currIndex = _.findIndex(section.categories, c => c === categoryID);
    return section.categories[~currIndex ? currIndex + 1 : 0];
  }
};
