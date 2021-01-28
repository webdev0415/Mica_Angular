import {
  FormArray,
  FormControl,
  FormGroup,
  Validators,
  ValidatorFn
} from "@angular/forms";
import * as MICAValidators from "./validators";
import * as _ from "lodash";
import * as navSelectors from "app/state/nav/nav.selectors";

/**
 * Deeply parse a plain object,
 * turn all objects into FormGroups,
 * and turn all primitives/values into FormControl
 */
export function formGroupFactory(formValue: any, state: State.Root, allRequired?: boolean): FormGroup | FormArray {
  const formGroup = new FormGroup({});

  (formValue.addedBy === "NLP") && console.log("VALUE:", formValue);

  _.forIn(formValue, (value, controlName) => {
    const validators = getValidators(controlName, state, allRequired);

    if (isPlainValue(controlName)) {
      formGroup.addControl(controlName, new FormControl(value, validators));
    } else if (isCollection(value)) {
      formGroup.addControl(controlName, new FormArray(_.map(value, row => {
        return formGroupFactory(row, state, allRequired);
      })));
    } else if (isFormValue(value)) {
      formGroup.addControl(controlName, new FormControl(value, validators));
    } else if (isControlDeep(value)) {
      formGroup.addControl(controlName, formGroupFactory(value, state, allRequired));
    } else if (isEmptyControl(value)) {
      console.warn("Empty form group detected and added to form");
      formGroup.addControl(controlName, new FormGroup({}));
    } else if (isNullControl(value)) {
      console.warn("Null value converted to string in new form");
      formGroup.addControl(controlName, new FormControl("", validators));
    } else {
      throw Error("Unable to parse form value for: " + controlName);
    }
  });
  return formGroup;
}

export function formArrayFactory (arrayValue: any[], state: State.Root, allRequired?: boolean): FormArray {
  return new FormArray(_.map(arrayValue, v => formGroupFactory(v, state, allRequired)));
}

/**
 * Check if controlName has a ValidatorFn configured
 */
function getValidators(controlName: string, state: State.Root, required?: boolean): ValidatorFn[]  {
  const basic = required ? [Validators.required] : [];
  const validatorsDic: {[name: string]: ValidatorFn} = {
    // likelihood: MICAValidators.likelihoodValidator,
    // multiplier: MICAValidators.multiplierValidator,
    groupsComplete: MICAValidators.allGroupsComplete(navSelectors.symptomItemsIDs(state)),
    bias: Validators.pattern(/^true$|^false$/),
    minDiagCriteria: Validators.pattern(/^true$|^false$/),
    medNecessary: Validators.pattern(/^true$|^false$/),
    must: Validators.pattern(/^true$|^false$/),
    ruleOut: Validators.pattern(/^true$|^false$/),
    value: Validators.required, // scale value
    timeFrame: Validators.required,
    bodyParts: MICAValidators.bodyPartsValidator
  };

  const controlValidator = validatorsDic[controlName];
  return controlValidator ? [...basic, validatorsDic[controlName]] : basic;
};

/**
 *
 * Test if it has same values which are objects themselves
 * and should be turned into FormGroups
 * @param {*} value Form value with embedded groups
 * @returns {boolean}
 */
function isControlDeep(value: any): boolean {
  return _.isPlainObject(value) && !_.isEmpty(value);
}

/**
 * Test if it is a dictionary (i.e.: no FormGroups inside)
 *
 * @param {*} value
 * @returns {boolean}
 */
function isEmptyControl(value: any): boolean {
  return value && _.isPlainObject(value) && _.isEmpty(value);
}

function isNullControl(value: any): boolean {
  return !value || _.isNull(value) || _.isUndefined(value);
}

/**
 * Symptoms have rows. Test if value is one of them
 *
 * @param {*} value
 * @returns {boolean}
 */
function isCollection(value: any): boolean {
  return _.isArray(value)
    && (value.length === 0 || _.every(value, v => _.isPlainObject(v)));
}

/**
 * Detect if value is a primitive or an acceptable FormControl value
 *
 * @param {*} value
 * @returns {boolean}
 */
function isFormValue(value: any): boolean {
  return _.isString(value)
    || _.isBoolean(value)
    || _.isNumber(value)
    || _.isArray(value) && _.every(value, v => isFormValue(v));
}

/**
 * Detect if controlName is in a list of exceptions
 * For example, do not control FormArray if not necessary
 * @param controlName
 */
function isPlainValue(controlName: string): boolean {
  const plainValueControls = ["groupsComplete"];
  return !!~_.indexOf(plainValueControls, controlName);
}

export function symptomTemplateCtrlFactory(value: Symptom.Template, state: State.Root): FormGroup {
  const antithesisEditable = _.find(state.symptomTemplates.editableProperties, {"name": "antithesis"});
  const criticalityEditable = _.find(state.symptomTemplates.editableProperties, {"name": "criticality"});
  if (!antithesisEditable || !criticalityEditable) {
    throw Error("Missing editable properties");
  }
  const antithesisMinMax = antithesisEditable.minMax;
  const criticalityMinMax = criticalityEditable.minMax;
  if (!antithesisMinMax || !antithesisMinMax.length || !criticalityMinMax || !criticalityMinMax.length) {
    throw Error("Missing editable min/max values");
  }


  const definitionControl = new FormControl(value.definition);
  const questionControl = new FormControl(value.question, [Validators.required, MICAValidators.whitespacesValidator]);
  const esQuestionControl = new FormControl(value.es_question, [Validators.required, MICAValidators.whitespacesValidator]);

  /* istanbul ignore next */
  definitionControl.valueChanges.subscribe((val) => {
    if (val && !_.trim(val)) definitionControl.reset();
  });

  /* istanbul ignore next */
  questionControl.valueChanges.subscribe((val) => {
    if (val && !_.trim(val)) questionControl.reset();
  });

  /* istanbul ignore next */
  esQuestionControl.valueChanges.subscribe((val) => {
    if (val && !_.trim(val)) esQuestionControl.reset();
  });

  return new FormGroup({
    symptomID: new FormControl(value.symptomID, [Validators.required]),
    name: new FormControl(value.name, [Validators.required]),
    es_name: new FormControl(value.name, [Validators.required]),
    question: questionControl,
    es_question: esQuestionControl,
    criticality: new FormControl(value.criticality,
      [Validators.required, MICAValidators.minMax(criticalityMinMax[0], criticalityMinMax[1])]),
    treatable: new FormControl(value.treatable, [Validators.required, Validators.pattern(/true|false/)]),
    cardinality: new FormControl(value.cardinality, [Validators.required, Validators.pattern(/true|false/)]),
    definition: new FormControl(value.definition),
    displayDrApp: new FormControl(value.displayDrApp, [Validators.required, Validators.pattern(/true|false/)]),
    genderGroup: new FormControl(value.genderGroup || "null"),
    groupID: new FormControl(value.groupID ? value.groupID.toString() : ""),
    labsOrdered: new FormControl(value.labsOrdered ? value.labsOrdered.toString() : ""),
    additionalInfo: formArrayFactory(value.additionalInfo, state, false)
  });
}

export function treatmentCtrlFactory(value: Treatments.Record.New, state: State.Root): FormGroup {
  return formGroupFactory(value, state, true) as FormGroup;
}
