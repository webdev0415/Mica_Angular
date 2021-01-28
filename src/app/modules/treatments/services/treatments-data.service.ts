import { Injectable } from '@angular/core';
import * as _ from 'lodash';

@Injectable({
  providedIn: 'root'
})
export class TreatmentsDataService {

  constructor() { }

  saveDrugToRecord({ drug, atcGroup, template }: { drug: Treatments.Drug.Description, atcGroup: Treatments.AtcGroup, template: Treatments.Types.Template },
                   record: Treatments.Record.New | null): Treatments.Record.New {

    if (!record) throw new Error('No current record found');

    const treatments = record.treatments.map(treatment => {
      if (treatment.typeID === template.typeID) {
        let drugAdded = false;
        const groups = (<Treatments.Drug.Extended>treatment).groups.reduce((res, group) => {
          if (group.groupCode === atcGroup.groupCode) {
            const drugs = group.drugs.reduce((drugsRes, item) => {
              if (item.drugName === drug.drugName) {
                drugAdded = true;
                return [ ...drugsRes, drug ];
              } else {
                return [ ...drugsRes, item ];
              }
            }, []);

            if (!drugAdded) {
              drugs.push(drug);
              drugAdded = true;
            }

            return [
              ...res,
              { ...group, drugs }
            ];
          }

          return [ ...res, group ];
        }, []);

        if (!drugAdded) {
          groups.push(
            {
              groupName: atcGroup.groupCode,
              groupCode: atcGroup.groupCode,
              drugs: [ drug ]
            }
          );
        }

        return {
          ...treatment,
          groups
        }

      } else {
        return treatment;
      }
    });

    return { ...record, treatments };
  }

  saveNonDrugToRecord({ nonDrug, atcGroup, template }: { nonDrug: Treatments.NonDrug.Description, atcGroup: Treatments.AtcGroup, template: Treatments.Types.Template },
                      record: Treatments.Record.New | null): Treatments.Record.New {

    if (!record) throw new Error('No current record found');

    const treatments = record.treatments.map(treatment => {
      if (treatment.typeID === template.typeID) {
        let nonDrugAdded = false;
        const groups = (<Treatments.NonDrug.Extended>treatment).groups.reduce((res, group) => {
          if (group.groupCode === atcGroup.groupCode) {
            const nonDrugs = group.nonDrugs.reduce((nonDrugsRes, item) => {
              if (item.typeDescID === nonDrug.typeDescID) {
                nonDrugAdded = true;
                return [ ...nonDrugsRes, nonDrug ];
              } else {
                return [ ...nonDrugsRes, item ];
              }
            }, []);

            if (!nonDrugAdded) {
              nonDrugs.push(nonDrug);
              nonDrugAdded = true;
            }

            return [
              ...res,
              { ...group, nonDrugs }
            ];
          }

          return [ ...res, group ];
        }, []);

        if (!nonDrugAdded) {
          groups.push(
            {
              groupName: atcGroup.groupCode,
              groupCode: atcGroup.groupCode,
              nonDrugs: [ nonDrug ]
            }
          );
        }

        return {
          ...treatment,
          groups
        }

      } else {
        return treatment;
      }
    });

    return { ...record, treatments };
  }

  removeDrugFromRecord({ drugIdx, groupIdx, template }: { drugIdx: number, groupIdx: number, template: Treatments.Types.Template },
                       record: Treatments.Record.New | null): Treatments.Record.New {
    if (!record) throw new Error('No current record found');

    return {
      ...record,
      treatments: record.treatments.map(treatment => {

        if (treatment.typeID === template.typeID) {
          return {
            ...treatment,
            groups: (<Treatments.Drug.Extended>treatment).groups.reduce((res, group, idx) => {
              if (idx === groupIdx && group.drugs.length > 1) {
                return [
                  ...res,
                  { ...group, drugs: group.drugs.filter((item, key) => key !== drugIdx) }
                ];
              } else if (idx !== groupIdx) {
                return [ ...res, group ];
              } else {
                return res;
              }
            }, [])
          }
        } else {
          return treatment;
        }
      })
    };
  }

  removeNonDrugFromRecord({ nonDrugIdx, groupIdx, template }: { nonDrugIdx: number, groupIdx: number, template: Treatments.Types.Template },
                          record: Treatments.Record.New | null): Treatments.Record.New {
    if (!record) throw new Error('No current record found');

    return {
      ...record,
      treatments: record.treatments.map(treatment => {

        if (treatment.typeID === template.typeID) {
          return {
            ...treatment,
            groups: (<Treatments.NonDrug.Extended>treatment).groups.reduce((res, group, idx) => {
              if (idx === groupIdx && group.nonDrugs.length > 1) {
                return [
                  ...res,
                  { ...group, nonDrugs: group.nonDrugs.filter((item, key) => key !== nonDrugIdx) }
                ];
              } else if (idx !== groupIdx) {
                return [ ...res, group ];
              } else {
                return res;
              }
            }, [])
          }
        } else {
          return treatment;
        }
      })
    };
  }

}
