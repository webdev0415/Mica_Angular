import * as _ from "lodash";

const notIn: <T>(origin: T[], inTarget: T[]) => T[] = (xs, ys) => _.reject(xs, x => Boolean(~_.indexOf(ys, x)));

const nonExistingSymptoms = (originSymptoms: Symptom.Value[], model: {[id: string]: Symptom.Data}): string[] => {
  const originIDs = _.map(originSymptoms, "symptomID");
  const targetIDs = _.map(_.values(model), "symptomID");
  const nonExisting = notIn(originIDs, targetIDs);

  _.forEach(nonExisting, s => delete model[s]);

  return nonExisting;
};

const nonExistingCategories = (originCategories: Illness.Normalized.FormValueCategory[],
                               model: { [id: string]: Workbench.Normalized.Category }): string[] => {
  const originIDs = _.map(originCategories, "categoryID");
  const targetIDs = _.map(_.values(model), "categoryID");
  const nonExisting = notIn(originIDs, targetIDs);

  _.forEach(nonExisting, s => delete model[s]);

  return nonExisting;
};

const nonExistingSections = (originSections: Illness.Normalized.FormValueSection[],
                             model: {[id: string]: Workbench.Normalized.Section}): string[] => {
  const originIDs = _.map(originSections, "sectionID");
  const targetIDs = _.map(_.values(model), "sectionID");
  const nonExisting = notIn(originIDs, targetIDs);

  _.forEach(nonExisting, s => delete model[s]);

  return nonExisting;
};

/**
 * Returns a triple: [categoryName, categoryID, misplacedSymptoms[]]
 * @param originCategories
 * @param entities
 */
/* istanbul ignore next */
export const symptomsInWrongCat = (
  originCategories: Illness.Normalized.FormValueCategory[],
  entities: Workbench.Normalized.Entities
): Illness.MisplacedEntities => (
  _.reduce(originCategories, (acc, cat: Illness.Normalized.FormValueCategory) => {
    const catModel = entities.categories[cat.categoryID];

    if (!catModel) {
      // Category doesn't exist. Should be validated with another function
      return acc;
    }

    const misplaced = notIn(cat.symptoms, catModel.symptoms);

    cat.symptoms = _.difference(cat.symptoms, misplaced);

    return misplaced.length
      ? [...acc, [catModel.name, cat.categoryID, misplaced]] as Array<[string, string, string[]]>
      : acc;
  }, [])
);

/* istanbul ignore next */
const symptomBodyParts = (entities: Illness.Normalized.Entities): string[] => {
  const sgWithBodyParts = ["physical"];
  const catsRequiringBodyParts = _.flatMap(_.map(sgWithBodyParts, name => {
    const sg = entities.symptomGroups[name];

    return sg
      ? sg.categories || _.flatMap(_.map(sg.sections, section => entities.sections[section].categories))
      : [];
  })) as string[];

  return _.reduce(catsRequiringBodyParts, (acc, catName) => {
    const symptoms = _.map(entities.categories[catName].symptoms, id => entities.symptoms[id]);
    const invalidSymptoms = _.filter(symptoms, s => (
      !s.bodyParts || !s.bodyParts.length || _.some(s.bodyParts, bp => bp === "")
    ));

    return acc.concat(_.map(invalidSymptoms, s => s.symptomID));
  }, [] as string[]);
};

export const excludeNlpSymptoms = (value: Illness.Normalized.IllnessValue) => {
  // categories without NLP
  const { SYMPTCG33, ...categories } = value.entities.categories;
  // symptoms without NLP
  const symptoms = { ...value.entities.symptoms };

  if (SYMPTCG33) {
    SYMPTCG33.symptoms.forEach(id => delete symptoms[id]);
  }

  return { symptoms, categories };
};

export const modelErrors = (value: Illness.Normalized.IllnessValue, data: Workbench.Normalized.Entities): Illness.ModelValidation => ({
  nonExisting: {
    symptoms: nonExistingSymptoms(_.values(value.entities.symptoms), data.symptoms),
    categories: nonExistingCategories(_.values(value.entities.categories), data.categories),
    sections: nonExistingSections(_.values(value.entities.sections), data.sections)
  },
  misplaced: {
    symptoms: symptomsInWrongCat(_.values(value.entities.categories), data)
  },
  invalidValues: {
    bodyParts: symptomBodyParts(value.entities),
  }
});


interface NonExistingProperties {
  nonExistingMultiplier: string[];
  nonExistingModifier: string[];
}

export const nonExistingSymptomProperties = (symptomValues: Symptom.Value[],
                                             symptomData: { [id: string]: Symptom.Data }): NonExistingProperties => {
  let nonExistingMultiplier: string[] = [];
  let nonExistingModifier: string[] = [];

  _.forEach(symptomValues, sv => {
    const rows = sv.rows;
    const sd = symptomData[sv.symptomID];

    if (!sd) {
      return;
    }

    const multipleValues = !!sd.multipleValues;
    const hasScale = !!~_.indexOf(sd.symptomsModel.dataStoreTypes, "TimeUnit");

    rows.forEach((row: Symptom.RowValue) => {
      if (!multipleValues && row.multiplier) {
        delete row.multiplier;
        nonExistingMultiplier = _.union(nonExistingMultiplier, [sv.symptomID]);
      }

      if (!hasScale && row.modifierValues) {
        delete row.modifierValues;
        nonExistingModifier = _.union(nonExistingMultiplier, [sv.symptomID]);
      }
    });
  });

  return { nonExistingMultiplier, nonExistingModifier };
};

export const inconsistentModelMsgs = (value: Illness.Normalized.IllnessValue,
                                      data: Workbench.Normalized.Entities): string[] => {
  const prefix = (ss: string[], msg: string): string => (
    ss.length ? `${msg}: ${ss.join(", ")}.` : ""
  );

  const { symptoms } = excludeNlpSymptoms(value); // exclude NLP Symptoms
  const droppedProps = nonExistingSymptomProperties(_.values(symptoms), data.symptoms);
  const tests: string[] = [
    prefix(
      nonExistingSymptoms(_.values(value.entities.symptoms), data.symptoms),
      "The following symptoms do not exist anymore"
    ),
    prefix(
      nonExistingCategories(_.values(value.entities.categories), data.categories),
      "The following categories do not exist anymore"
    ),
    prefix(
      nonExistingSections(_.values(value.entities.sections), data.sections),
      "The following sections do not exist anymore"
    ),
    ..._.map(
        symptomsInWrongCat(_.values(value.entities.categories), data),
        triple => {
          const [categoryName, categoryID, misplaced] = triple;
          return `Category ${categoryName} (${categoryID}) does no longer include the following symptoms:
          ${_.join(_.map(misplaced, id => `"${data.symptoms[id] ? data.symptoms[id].name : id}"`), ", ")}.`
        }
      ),
    prefix(
      symptomBodyParts(value.entities),
      "The following symptoms have invalid bodyParts properties"
    ),
    prefix(
      droppedProps.nonExistingMultiplier,
      "The following symptoms have no multiplier anymore"
    ),
    prefix(
      droppedProps.nonExistingModifier,
      "The following symptoms have no modifier values anymore"
    )
  ];

  return _.filter(tests, t => !!t);
};
