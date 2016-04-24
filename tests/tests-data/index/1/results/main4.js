define(["sandbox"], function(){
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
  __modules["controller/1"] = (function(utils){
    'use strict';
    return {
      name: "1/controller/1",
      deps: [utils]
    };
  })(__modules["utils/1"]);
  __modules["main4"] = (function(ctrl, sandbox){
    'use strict';
    return {
      name: "1/main4",
      deps: [ctrl, sandbox]
    };
  })(__modules["controller/1"], arguments[0]);
  return __modules["main4"];
});