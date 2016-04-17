define([], function(){
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
  return (function(utils){
    'use strict';
    return {
      name: "1/main2",
      deps: [utils]
    };
  })(privateDeps["utils/1"]);
});