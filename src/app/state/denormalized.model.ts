import { schema, denormalize, normalize, Schema } from "normalizr";
import * as _ from "lodash";

const symptom = new schema.Entity("symptoms", {}, {idAttribute: "symptomID"});

export const categorySchema = new schema.Entity("categories", {
  symptoms: [symptom]
}, {
  idAttribute: "categoryID"
});

const sectionSchema = new schema.Entity("sections", {
  categories: [categorySchema]
}, {
  idAttribute: "sectionID"
});

export const symptomGroupSchema = new schema.Entity("symptomGroups", {
  categories: [categorySchema],
  sections: [sectionSchema]
}, {
  idAttribute: "groupID"
});

export const illnessValueSchema = new schema.Entity("illnesses", {
  symptomGroups: [symptomGroupSchema]
}, {
  idAttribute: "idIcd10Code"
});

const denormalizeEntities = <T>(target: {[key: string]: T}, schema: Schema, entities: {[key: string]: any}) => (
  _.reduce(target, (acc, v, k) => {
    const value = denormalize(v, schema, entities);
    /* istanbul ignore next */
    if (value) acc[k] = value;
    return acc;
  }, {} as {[key: string]: T})
);

export const denormalizeIllnessValue = (value: Illness.Normalized.IllnessValue): Illness.FormValue => {
  const entities = {
    ...value.entities,
    categories: denormalizeEntities(value.entities.categories, categorySchema, value.entities),
  };
  entities.sections = denormalizeEntities(value.entities.sections, sectionSchema, entities);
  entities.symptomGroups = denormalizeEntities(value.entities.symptomGroups, symptomGroupSchema, entities);
  return denormalize(value.form, illnessValueSchema, entities);
};

export const normalizeIllness = (value: Illness.FormValue | ECW.IllnessData): Illness.Normalized.IllnessValue => {
  const normalized = normalize(value, illnessValueSchema);

  return {
    form: normalized.entities.illnesses[value.idIcd10Code],
    entities: <Illness.Normalized.Entities>_.omit(normalized.entities, "illnesses")
  }
};
