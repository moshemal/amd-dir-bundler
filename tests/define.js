/**
 * Created by moshemal on 4/7/16.
 */
'use strict';
const assert    = require('chai').assert;
const define    = require('../src/define');
const pfs       = require('../src/promisified-fs');
const UglifyJS  = require("uglify-js");

const testDataPath = __dirname + "/tests-data/define";
describe('##define.js: ', function() {

  let p1 = pfs.readFile(testDataPath + "/1.js", 'utf8');
  let p2 = pfs.readFile(testDataPath + "/2.js", 'utf8');

  it('should return empty depNames and a simple callback', function(done) {
    p1.then( (code) => {
      var result = eval(code);
      assert.deepEqual(result.depNames, []);
      assert.deepEqual(result.parameters, []);
      assert.equal(UglifyJS.minify("var x = function(){return{};}", {fromString: true}).code,
        UglifyJS.minify("var x = " + result.callback, {fromString: true}).code);
    }).then(done,done);
  });

  it('should return 2.js parameters', (done) => {
    p2.then( (code) => {
      var result = eval(code);
      assert.deepEqual(result.parameters, ["dep1", "dep2"]);
    }).then(done, done);
  });

  it('should return 2.js dependencies strings', (done) => {
    p2.then( (code) => {
      var result = eval(code);
      assert.deepEqual(result.depNames, ["dep1", "dep2"]);
    }).then(done, done);
  });
});



