const EOL = "\r\n";
const delimiter = "|"

export const row = {
  data: {
    "bias": true,
    "multiplier": [
      "Red Patches"
    ],
    "modifierValues": [{
      "name": "Time",
      "likelihood": "80",
      "scale": {
        "upperTimeLimit": 99,
        "scaleTimeLimitStart": 0,
        "value": 99,
        "slope": "Flat",
        "timeUnit": "Years"
      }
    }]
  },
  csv: [ [delimiter.repeat(2), "Red Patches", "80", "0 - 99", "Years"].join(delimiter) ]
}

const bodyParts = {
  data: ["Right Leg", "Left Leg"],
  csv: [ ["Right Leg", "Left Leg"].join(",") ]
}

export const symptom = {
  data: {
    symptomID: "SYMPT0000007",
    rows: [row.data],
    bodyParts: bodyParts.data
  } as Symptom.Value,
  csv: [ ["L02.03", "SYMPT0000007", "Name", ...row.csv].join(delimiter)],
  csvPhysical: [ ["L02.03", "SYMPT0000007", "Name", ...row.csv, ...bodyParts.csv].join(delimiter)]
}

export const category = {
  data: {categoryID: "SYMPTCG01", symptoms: [symptom.data]},
  csv: symptom.csv,
  csvPhysical: symptom.csvPhysical
}

export const Illness = {
  data: {
    name: "Carbuncle of face",
    idIcd10Code: "L02.03",
    version: 10,
    criticality: 7,
    state: "COMPLETE" as Illness.State,
    groupsComplete: [],
    symptomGroups: [
      { name: "Physical", groupID: "physical", categories: [category.data] },
      { name: "Pain/Swelling", groupID: "pain", sections: [
        { sectionID: "SC001", categories: [category.data] }
      ]},
    ]
  },
  csv: [
    ["icd10Code", "SymptomID", "Symptom Name", "Likelihood", "Time Range", "Time Unit", "List Values", "List Value Likelihood",
      "List Value Time Range", "List Value Time Unit", "Body Parts"].join(delimiter),
    ["L02.03v10", "Carbuncle of face"].join(delimiter),
    ...category.csvPhysical,
    ...category.csv,
    delimiter
  ].join(EOL)
}
