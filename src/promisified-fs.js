/**
 * Created by moshemal on 4/6/16.
 */

'use strict';
const promisify = require("es6-promisify");
const fs = require('fs');

const methods = [
  'readFile',
  'readdir',
  'stat'
];

module.exports = methods.reduce( (res, methodName) => {
  res[methodName] = promisify(fs[methodName]);
  return res;
}, {});