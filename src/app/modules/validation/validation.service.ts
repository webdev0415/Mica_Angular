import { postMsg } from "app/state/messages/messages.actions";
import { NgRedux } from "@angular-redux/store";
import { Injectable } from "@angular/core";
import { modelErrors } from "app/util/forms/validators/illness-model";
import * as _ from "lodash";
import { symptomData, multiplierValues, symptomDataPath, symptomNameFromID, symptomDataMany } from "app/state/symptoms/symptoms.selectors";
import { isSymptomGroupComplete } from "app/state/workbench/workbench.selectors";
import { completeSymptomGroup, setManySymptomErrors } from "app/state/workbench/workbench.actions";

@Injectable()
export class ValidationService {
  private get state() { return this.s.getState() }

  constructor(private s: NgRedux<State.Root>) { }

  addSymptomsErrorsToTODO(activeIllness: Illness.Normalized.IllnessValue) {
    const symptomsWithInvalidMultiplier = this.getSymptomsWithInvalidMultiplier(activeIllness);

    if (!symptomsWithInvalidMultiplier.length) {
      return;
    }

    const errors =  symptomsWithInvalidMultiplier.map(s => {
      const path = symptomDataPath(s.symptomID)(this.state);

      if (isSymptomGroupComplete(path.symptomGroup)(this.state)) {
        this.s.dispatch(completeSymptomGroup(path.symptomGroup, false));
      }

      const err: Symptom.ValueError = {
        symptomID: s.symptomID,
        name: symptomNameFromID(s.symptomID)(this.state),
        bodyParts: s.bodyParts ? s.bodyParts : null,
        groupID: path.symptomGroup,
        rowErrors: s.rows.filter(el => !!el.multiplier).map((row, index) => ({
          index,
          multiplier: { required: true }
        }))
      };

      return err;
    });

    this.s.dispatch(setManySymptomErrors(errors));
    this.s.dispatch(postMsg(`Removed invalid multipliers for the symptoms ${
        symptomsWithInvalidMultiplier.map(s => s.symptomID).join(", ")
      }, see TODO`,
      { type: "warning" }
    ));
  }

  sanitizeIllness(illness: Illness.Normalized.IllnessValue): Illness.Normalized.IllnessValue {
    try {
      const errs = modelErrors(illness, this.state.symptoms.entities);

      // 1. Remove full entities listed in non existing errors
      const entitiesRemoved: Illness.Normalized.Entities = _.reduce(
        illness.entities,
        (dict, entities, name: string) => {
          const nonExisting = _.get(errs, ["nonExisting", name]) as string[];

          if (nonExisting && nonExisting.length) {
            const options: any = { type: "warning" };
            if (name === "symptoms") {
              options["autoClose"] = false;
            }
            this.s.dispatch(postMsg(
              `Invalid data detected before submission. Removed the following ${name}: ${nonExisting.join(", ")}`,
               options
            ));

            return {
              ...illness.entities,
              [name]: _.omit(_.get(illness, ["entities", name]), nonExisting)
            }
          } else {
            return {
              ...dict,
              [name]: _.get(illness, ["entities", name])
            };
          }
        },
        {} as Illness.Normalized.Entities
      );

      // 2. Remove misplaced symptoms
      const misplacedSymptoms = _.flatMap(_.map(errs.misplaced.symptoms, x => x[2])) as string[];
      const misplacedRemoved: Illness.Normalized.Entities = misplacedSymptoms && misplacedSymptoms.length
        ? {
          ...entitiesRemoved,
          symptoms: _.omit(entitiesRemoved.symptoms, misplacedSymptoms) as {[id: string]: Symptom.Value},
          categories: _.reduce(entitiesRemoved.categories, (acc, cat, catID) => {
            acc[catID] = {
              ...cat,
              symptoms: _.without(cat.symptoms, ...misplacedSymptoms)
            };
            return acc;
          }, {} as { [id: string]: Illness.Normalized.FormValueCategory })
        }
        : entitiesRemoved;

      if (misplacedSymptoms && misplacedSymptoms.length) {
        this.s.dispatch(postMsg(
          `Invalid data detected before submission. Removed the following misplaced symptoms: ${misplacedSymptoms.join(", ")}`,
          { type: "warning" }
        ));
      }

      // 3. Remove symptoms with invalid values
      const { bodyParts } = errs.invalidValues;
      const withoutInvalidValues: Illness.Normalized.Entities = {
        ...misplacedRemoved,
        symptoms: _.omit(misplacedRemoved.symptoms, bodyParts)
      };

      if (bodyParts && bodyParts.length) {
        this.s.dispatch(postMsg(
          `Invalid data detected before submission. Removed the following invalid symptoms: ${errs.invalidValues.bodyParts.join(", ")}`,
          { type: "warning" }
        ));
      }

      // 4. Purge references to entities removed in 1 & 3
      const refsRemoved = {
        ...withoutInvalidValues,
        categories: _.reduce(
          withoutInvalidValues.categories,
          (acc, cat, catID) => ({
            ...acc,
            [catID]: { ...cat, symptoms: _.without(cat.symptoms, ...errs.nonExisting.symptoms, ...errs.invalidValues.bodyParts) }
          }),
          {} as { [id: string]: Illness.Normalized.FormValueCategory },
        ),
        sections: _.reduce(
          withoutInvalidValues.sections,
            (acc, section, id) => ({
            ...acc,
            [id]: { ...section, categories: _.without(section.categories, ...errs.nonExisting.categories) }
          }),
          {} as { [id: string]: Illness.Normalized.FormValueSection },
        ),
        symptomGroups: _.reduce(
          withoutInvalidValues.symptomGroups,
          (acc, sg, id) => ({
            ...acc,
            [id]: { ...sg, categories: _.without(sg.categories, ...errs.nonExisting.categories) }
          }),
          {} as { [id: string]: Illness.Normalized.SymptomGroup },
        )
      };

      return { ...illness, entities: refsRemoved } as Illness.Normalized.IllnessValue;
    } catch (error) {
      console.error("error: ", error);
      throw new Error(`Unable to sanitize illness ${illness.form.idIcd10Code} v${illness.form.version}.\n${error.message}`);
    }
  }

  /**
   * Gets all symptoms with invalid multiplier
   **/
  private getSymptomsWithInvalidMultiplier(illness: Illness.Normalized.IllnessValue): Symptom.Value[] {
    const symptomsWithInvalidMultiplier: Symptom.Value[] = [];

    _.each(illness.entities.symptoms, (sympt) => {
      const sData = symptomData(sympt.symptomID)(this.s.getState());
      const multiplierValue = multiplierValues(sData)(this.s.getState());
      const values: Workbench.DataStoreRefTypeValue[] = multiplierValue && multiplierValue.values || [];

      if (!values.length) {
        return sympt;
      }

      _.each(sympt.rows, row => {

        if (!row.multiplier) {
          return;
        }

        const ms = row.multiplier[0].toString().split(",");

        row.multiplier[0] = ms.map(m => {
          if (values.find(v => v.name === m)) {
            return m;
          } else {
            symptomsWithInvalidMultiplier.push(sympt);
            return "";
          }
        }).join(",");
      });
    });

    return _.uniqBy(symptomsWithInvalidMultiplier, "symptomID");
  }

}
