import { TestBed } from '@angular/core/testing';

import { TreatmentsDataService } from './treatments-data.service';

describe('TreatmentsDataService', () => {
  let service: TreatmentsDataService;

  beforeEach(() => TestBed.configureTestingModule({}));
  beforeEach(() => {
    service = TestBed.get(TreatmentsDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  xit('saveDrugToRecord', () => {
    const drug: Treatments.Drug.Description = {
      drugName: 'test',
      sourceInfo: [],
    };
    const atcGroup: Treatments.AtcGroup = { atcGroupName: 'test', micaGroupName: 'test', groupCode: 'code' };
    const template: Treatments.Types.Template = { name: 'test', typeID: 1, treatmentTypeDesc: [] };
    const record: Treatments.Record.New = {
      name: 'test',
      symptomID: 'test',
      icd10Code: undefined,
      treatments: [
        { name: 'test', groups: [], typeID: 1 }
      ]
    };

    expect(service.saveDrugToRecord({ drug, atcGroup, template }, record).treatments[0].groups[0].drugs[0].drugName).toEqual('test');
    expect(() => service.saveDrugToRecord({ drug, atcGroup, template }, null).treatments[0].groups[0].drugs[0].drugName).toThrow();

    record.treatments[0].groups = [ { groupName: 'test', groupCode: 'code', drugs: [] } ];
    expect(service.saveDrugToRecord({ drug, atcGroup, template }, record).treatments[0].groups[0].drugs[0].drugName).toEqual('test');

    record.treatments[0].groups[0].groupCode = '';
    expect(service.saveDrugToRecord({ drug, atcGroup, template }, record).treatments[0].groups[0].drugs.length).toEqual(0);

    record.treatments[0].typeID = 0;
    expect(service.saveDrugToRecord({ drug, atcGroup, template }, record).treatments[0].groups[0].drugs.length).toEqual(0);
  });

  it('removeDrugFromRecord', () => {
    const drug: Treatments.Drug.Description = {
      drugName: 'test',
      sourceInfo: [],
    };
    const template: Treatments.Types.Template = { name: 'test', typeID: 1, treatmentTypeDesc: [] };
    const record: Treatments.Record.New = {
      name: 'test',
      symptomID: 'test',
      icd10Code: undefined,
      treatments: [
        { name: 'test', groups: [ { groupName: 'test', groupCode: 'test', drugs: [ drug ] } ], typeID: 1 }
      ]
    };
    let drugIdx = 0;
    let groupIdx = 0;

    expect(() => service.removeDrugFromRecord({ drugIdx, groupIdx, template }, null)).toThrow();
    expect(service.removeDrugFromRecord({ drugIdx, groupIdx, template }, record).treatments[0].groups.length).toEqual(0);

    groupIdx = 1;
    expect(service.removeDrugFromRecord({ drugIdx, groupIdx, template }, record).treatments[0].groups.length).toEqual(1);

    record.treatments[0].groups[0].drugs.push(drug);
    expect(service.removeDrugFromRecord({ drugIdx, groupIdx, template }, record).treatments[0].groups.length).toEqual(1);

    record.treatments[0].typeID = 0;
    expect(service.removeDrugFromRecord({ drugIdx, groupIdx, template }, record).treatments[0].groups.length).toEqual(1);
  });
});
