/**
 * Created by moshemal on 4/7/16.
 */

const STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;

function getFunctionParams (str) {
  'use strict';
  str = str.replace(STRIP_COMMENTS, "");
  let paramsDirtyArr = str.slice(str.indexOf("(") + 1, str.indexOf(")")).split(",");
  paramsDirtyArr = paramsDirtyArr.filter((curr) => {
    return (curr !== "");
  });
  return paramsDirtyArr.map((param)=>{return param.trim()});
}

module.exports = function (name, deps, callback) {
  'use strict';
  //Allow for anonymous modules
  if (typeof name !== 'string') {
    //Adjust args appropriately
    callback = deps;
    deps = name;
    name = null;
  }

  //This module may not have dependencies
  if (!Array.isArray(deps)) {
    callback = deps;
    deps = null;
  }

  let parameters = getFunctionParams(callback.toString());

  return {
    depNames: deps || [],
    callback: callback.toString(),
    parameters: parameters
  }
};
