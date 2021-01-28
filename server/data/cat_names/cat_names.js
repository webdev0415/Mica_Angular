"use strict";

const data = require("./physical");
const _ = require("lodash");

const catNames = _.map(data.categories, "name");

console.log("CATEGORY NAMES: ");
_.each(catNames, c => console.log(c));
