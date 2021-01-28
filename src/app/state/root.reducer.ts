import { Reducer, combineReducers } from 'redux';
import { navReducer } from './nav/nav.reducer';
import { globalReducer } from './global/global.reducer';
import { taskReducer } from './task/task.reducer';
import { userReducer } from './user/user.reducer';
import { symptomsReducer } from './symptoms/symptoms.reducer';
import { messagesReducer } from './messages/messages.reducer';
import workbenchReducer from './workbench/workbench.reducer';
import { symptomTemplatesReducer } from './symptom-templates/templates.reducer';
import ecwReducer from './ecw/ecw.reducer';
import { groupsReducer } from './groups/groups.reducer';
import { labordersReducer } from './laborders/laborders.reducer';

import { illnessesReducer } from './illnesses/illnesses.reducer';
import { sourceInit, treatmentsInit } from '../app.config';

export const rootReducer: Reducer<any> = combineReducers<any>(
  {
    global: globalReducer,
    messages: messagesReducer,
    nav: navReducer,
    task: taskReducer,
    user: userReducer,
    symptoms: symptomsReducer,
    sources: state => state || sourceInit,
    treatments: state => state || treatmentsInit,
    symptomTemplates: symptomTemplatesReducer,
    workbench: workbenchReducer,
    ecw: ecwReducer,
    illnesses: illnessesReducer,
    groups: groupsReducer,
    laborders: labordersReducer
  });

export default rootReducer;
