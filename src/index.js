/**
 * Created by moshemal on 4/7/16.
 */
'use strict';

const fsUtils = require('./fs-utils');
const define = require('./define');


function pack(filePath) {
  
  return fsUtils.readModuleFile(filePath);
}

module.exports = {
  pack
};

