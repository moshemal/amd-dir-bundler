define([], function(){
  var privateDeps = (function () {
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
    })(utils);
    return privateDeps;
  })();

  return (function(ctrl){
    'use strict';
    return {
      name: "1/main3",
      deps: [ctrl]
    };
  })(privateDeps["controller/1"]);
});