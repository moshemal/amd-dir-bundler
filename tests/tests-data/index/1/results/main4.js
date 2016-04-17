define(["sandbox"], function(){
  var privateDeps = {};
  privateDeps["utils/1"] = (function(){
    'use strict';
    var str = "I am utils/1";
    return {
      name: "utils/1",
      deps: [],
      privates: [str]
    };
  })();

  privateDeps["controller/1"] = (function(utils){
    'use strict';
    return {
      name: "1/controller/1",
      deps: [utils]
    };
  })(privateDeps["utils/1"]);



  return (function(ctrl, sandbox){
    'use strict';
    return {
      name: "1/main4",
      deps: [ctrl, sandbox]
    };
  })(privateDeps["controller/1"], arguments[0]);
});