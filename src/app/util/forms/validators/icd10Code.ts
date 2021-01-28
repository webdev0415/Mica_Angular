import { FormControl} from "@angular/forms";

export function icd10CodeValidator(control: FormControl): {[key: string]: any} | null {
  const value: string = control.value;
  const re = /^[A-Z0-9.]{3,}$/i;
  return !value || re.test(value.trim()) ? null : {icd10Code: {invalid: true}}
}
