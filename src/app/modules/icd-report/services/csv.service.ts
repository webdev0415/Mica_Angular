import { Injectable } from "@angular/core";
import { NgRedux } from "@angular-redux/store"
import { sectionNameFromID, catNameFromID, symptomData} from "../../../state/symptoms/symptoms.selectors";

@Injectable()
export class CsvService {
  private defaultOptions = {
    EOL: "\r\n",
    delimiter: "|"
  };
  options = this.defaultOptions;
  headers = [
    "icd10Code", "SymptomID", "Symptom Name",
    "Likelihood", "Time Range", "Time Unit",
    "List Values", "List Value Likelihood", "List Value Time Range", "List Value Time Unit",
    "Body Parts"
  ];
  csv: string;

  constructor(private s: NgRedux<State.Root>) {}

  private get state() {
    return this.s.getState()
  }
  private getSymptomMeta(symptomID: string) {
    return symptomData(symptomID)(this.state);
  }

  /* istanbul ignore next */
  createAndDownload(
    data: Illness.FormValue[],
    /* istanbul ignore next */
    fileName = "file",
    /* istanbul ignore next */
    options = {}) {
    this.options = { ...this.defaultOptions, ...options };
    this.csv = this.generateCSVForAllIllness(data);

    const blob = new Blob(["\ufeff", this.csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = fileName.replace(/\s/g, "_");
    a.setAttribute("visibility", "hidden");
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  generateCSVForAllIllness(data: Illness.FormValue[]): string {
    const { delimiter, EOL } = this.options;
    const emptyRow = delimiter;
    const csv: string[] = [];
    csv.push(this.headers.join(delimiter));

    data.forEach(ill => {
      const sGroups: {[groupId: string]: Symptom.Value[]} = {};
      csv.push([ill.idIcd10Code + "v" + ill.version, ill.name].join(delimiter));

      ill.symptomGroups.forEach(group => {
      const symptoms: Symptom.Value[] = [];
        if (group.categories) {
          symptoms.push(...this.getSymptomsFromCategories(group.categories));
        }
        if (group.sections) {
          group.sections.forEach(sec => {
            symptoms.push(...this.getSymptomsFromCategories(sec.categories));
          });
        }
        sGroups[group.groupID] = symptoms;
      })

      // tslint:disable-next-line:forin
      for (const groupID in sGroups) {
        sGroups[groupID].forEach(sympt => {
          const csvSymptom = this.symptomToCSV(sympt, ill.idIcd10Code, groupID);
          csv.push(...csvSymptom);
        })
      }
      csv.push(emptyRow);
    })
    return csv.join(EOL);
  }

  getSymptomsFromCategories(categories: Illness.FormValueCategory[]): Symptom.Value[] {
    const symptoms: Symptom.Value[] = []
    categories.forEach(cat => {
      if (cat.symptoms.length) {
        cat.symptoms.forEach(sympt => {
          symptoms.push(sympt);
        })
      }
    })
    return symptoms;
  }

  symptomToCSV(sympt: Symptom.Value, idIcd10Code: string, groupID: string): string[] {
    const delimiter = this.options.delimiter
    const csvSympt: string[] = []
    const symptHead = [idIcd10Code, sympt.symptomID, this.getSymptomMeta(sympt.symptomID).name].join(delimiter);

    csvSympt.push(...this.symptomRowsToCSV(sympt.rows));

    if (groupID === "physical" && sympt.bodyParts && csvSympt.length) {
      const count = this.headers.length - symptHead.split(delimiter).length - csvSympt[0].split(delimiter).length;
      csvSympt[0] += delimiter.repeat(count) + sympt.bodyParts.join(",");
    }
    return csvSympt.map(value => symptHead + delimiter + value);
  }

  symptomRowsToCSV(rows: Symptom.RowValue[]): string[] {
    const delimiter = this.options.delimiter;
    let multiplier: string | number | undefined;
    let likelihood: string | undefined = "";
    let values: any[] = [];
    const result: any[] = [];
    const number = 2;

    rows.forEach(row => {
      likelihood = row.likelihood
      multiplier = row.multiplier && row.multiplier[0];
      if (row.modifierValues) {
        row.modifierValues.forEach(mod => {
          const val = [];
          val.push(mod.likelihood);
          if (mod.scale) {
            val.push(`${mod.scale.scaleTimeLimitStart} - ${mod.scale.upperTimeLimit}`, mod.scale.timeUnit);
          }
          values.push(val);
        })
      }
      if (values.length) {
        result.push(...values.map(value => {
          return multiplier
          ? [delimiter.repeat(number), multiplier, ...value]
          : value}
        ))
      } else if (multiplier) {
        result.push([delimiter.repeat(number), (row.multiplier as Array<any>).join("-"), likelihood])
      } else {
          result.push([likelihood])
      }
      multiplier = "";
      values = [];
    })
    return result.map((el: string[]) => el.join(delimiter));
  }
}
