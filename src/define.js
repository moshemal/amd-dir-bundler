/**
 * Created by moshemal on 4/7/16.
 */

module.exports = function (name, deps, callback) {

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
  console.log("define");
  console.log(deps, callback.toSource());


};
