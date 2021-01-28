"use strict";

const fs = require("fs");
const state = require("./AbeFile.json");
const _ = require("lodash");

function updateSymptoms(data) {
  let d = _.cloneDeep(data);
  d.global.config.api.hostMICA = "http://ec2-54-242-122-153.compute-1.amazonaws.com:8081";
  delete d.nav.bodySelection;

  function parseCats(cats, groupID) {
    return _.map(cats, c => {
      c["symptoms"] = _.map(c["symptoms"], s => {
        if (groupID === "pain" || groupID === "physical") {
          s.bodyParts = s.bodyParts || [findCatNameByID(c.categoryID, d.workbench)];
        }

        s.rows = _.map(s.rows, r => {
          let newR = {
            bias      : r.bias,
            multiplier: r.multiplier,
            likelihood: r.likelihood
          };

          if (r.scale) {
            _.assign(newR, {
              modifierValues: [{
                name      : "Time",
                likelihood: r.likelihood,
                scale     : {
                  upperTimeLimit     : r.scale.upperTimeLimit,
                  scaleTimeLimitStart: r.scale.scaleTimeLimitStart,
                  slope              : r.scale.slope,
                  timeUnit           : r.scale.timeUnit,
                  value              : r.scale.value
                }
              }]
            });
          }

          if (r.rangeValues) {
            newR.rangeValues = r.rangeValues;
            delete r.multiplier;
          }

          if (r.multiplier) {
            newR.multiplier = _.isArray(r.multiplier)
              ? r.multiplier : [r.multiplier];
          }

          return newR;
        });
        return s;
      });

      return c;
    });
  }

  d.task.userData = _.map(d.task.userData, ill => {
    let illData = _.find(_.flatMap(_.map(d.task.tasks, "illness")), { "idIcd10Code": ill.idIcd10Code });
    return {
      idIcd10Code   : ill.idIcd10Code,
      groupsComplete: ill.groupsComplete,
      name          : illData.name,
      criticality   : illData.criticality,
      state         : "PENDING",
      symptomGroups : _.map(ill.symptomGroups, g => {
        if (g["categories"]) g["categories"] = parseCats(g["categories"], g.groupID);
        if (g["sections"]) g["sections"] = _.map(g["sections"], s => {
          s["categories"] = parseCats(s["categories"], g.groupID);
          return s;
        });
        return g;
      })
    };
  });

  console.log("d.task.userData: ", d.task.userData[0]);
  return d;
}

fs.writeFileSync("state_upgraded.json", JSON.stringify(updateSymptoms(state)), { encoding: "UTF-8" });

// console.log(JSON.stringify(updateSymptoms(state).task.userData[0].symptomGroups[0].categories[0].symptoms[2], null, 2));

function findCatNameByID(catID, workbenchData) {
  const cats = _.reduce(workbenchData, (result, group, groupName) => {
    if (group.categories) result.push(...group.categories);
    if (group.sections) result.push(..._.flatMap(group.sections, "categories"));
    return result;
  }, []);

  return _.find(cats, { "categoryID": catID }).name;
}
