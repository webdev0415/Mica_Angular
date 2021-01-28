import * as TreatmentsActions from './treatments.actions';

describe('treatments actions', () => {

  it('toggleValidation', () => {
    expect(TreatmentsActions.toggleValidation).toBeTruthy();
  });

  it('setActiveTreatmentsRecord', () => {
    expect(TreatmentsActions.setActiveTreatmentsRecord).toBeTruthy();
  });
});
