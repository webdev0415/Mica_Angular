import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'policyFormat'
})
export class PolicyFormatPipe implements PipeTransform {

  transform(value: Treatments.Drug.Policy, drugName: string): any {
    console.log('pipe value =================== ', value)
    switch (value.target) {
      case 'ILLNESS':
        if (value.targetOperator) {
          return `${value.action} the drug ${drugName} when ${value.target} ${value.targetCompare || 'equals'} ${value.propertyName[0]} ${value.targetOperator} ${value.propertyName[1]}`;
        }
        return `${value.action} the drug ${drugName} when ${value.target} ${value.targetCompare || 'equals'} ${value.propertyName[0]}`;
      case 'SYMPTOM':
        if (value.targetOperator) {
          return `${value.action} the drug ${drugName} when ${value.target} ${value.propertyName[0] || 'PROPERTY NAME'} ${value.targetCompare} ${value.targetDetail[0]} ${value.targetOperator} ${value.targetDetail[1]}`;
        }
        return `${value.action} the drug ${drugName} when ${value.target} ${value.propertyName[0]  || 'PROPERTY NAME'} ${value.targetCompare} ${value.targetDetail[0]}`;
      case 'PROPERTY':
        if (value.propertyName[0] === 'Age') {
          return `${value.action} the drug ${drugName} when ${value.target} ${value.propertyName[0]  || 'PROPERTY NAME'} ${value.targetCompare} ${value.targetDetail[0]} year(s) old`
        }
        if (value.propertyName[0] === 'Weight') {
          return `${value.action} the drug ${drugName} when ${value.target} ${value.propertyName[0]  || 'PROPERTY NAME'} ${value.targetCompare} ${value.targetDetail[0]} lbs`
        }
        return '';
      default:
        return 'Policy saved but not valid. Notify Support.'
    }
  }

}
