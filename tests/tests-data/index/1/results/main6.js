define(["sandbox/bla", "sandbox/bla/nestedBla"], function(){
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
  __modules["html/1.html"] = (function(){
    return '<div>bla bla</div>';
  })();
  __modules["main5"] = (function(utils, sandbox, html){
    'use strict';
    return {
      name: "1/main5",
      deps: [utils, sandbox, html]
    };
  })(__modules["utils/1"], arguments[0].bla, arguments[0].bla.nestedBla, __modules["html/1.html"]);
  return __modules["main5"];
});