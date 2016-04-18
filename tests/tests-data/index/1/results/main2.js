define([], function(){
  var __modules = {};
  __modules["utils/1"] = (function(){
    'use strict';
    var str = "I am utils/1";
    return {
      name: "utils/1",
      deps: [],
      privates: [str]
    };
  })();
  __modules["main2"] = (function(utils){
    'use strict';
    return {
      name: "1/main2",
      deps: [utils]
    };
  })(__modules["utils/1"]);
  return __modules["main2"];
});