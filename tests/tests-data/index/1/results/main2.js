(function () {

})();
define([], function(){
  'use strict';
  var utils = (function(){
    var str = "I am utils/1";
    return {
      name: "utils/1",
      deps: [],
      privates: [str]
    };
  })();

  return {
    name: "1/main2",
    deps: [utils]
  }
});