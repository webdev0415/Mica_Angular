declare module Groups {

  interface Group  {
    name: string,
    groupID: number
  }

  interface SymptomsInGroup {
    groupID: number,
    symptoms: SymptomGroupData[]
  }

  interface SymptomGroupData {
    groupFlag: string;
    symptomID: string;
  }

  type New = Group | null;

  type Search = Readonly<{
    new: boolean | null;
    record: Groups.New | null
  }>
}
