/**
 * Created by moshemal on 4/10/16.
 */

'use strict';
const assert = require('chai').assert;
const index = require('../src/index');
const UglifyJS = require("uglify-js");
const pfs = require('../src/promisified-fs');

const testDataPath = __dirname + "/tests-data/index";

describe('##index.js:', () => {

  describe('pack():', () => {
    it('should return main1 content', (done) => {
      testPackCase("/1/main1.js", "/1/results/main1.js")
        .then(done,done);
    });
    it('should pack main2 with utils inside it', (done) => {
      testPackCase("/1/main2.js", "/1/results/main2.js")
        .then(done,done);
    });
    it('should pack main3 with utils and controller inside it', (done) => {
      testPackCase("/1/main3.js", "/1/results/main3.js")
        .then(done,done);
    });
    it('should pack main4', (done) => {
      testPackCase("/1/main4.js", "/1/results/main4.js")
        .then(done,done);
    });
    it('should pack main5 with html text inside it', (done) => {
      testPackCase("/1/main5.js", "/1/results/main5.js")
        .then(done,done);
    });

  });
});

/*
  Helpers
 */
function testPackCase(modulePath, resultPath) {
  return Promise.all([
    index.pack(testDataPath + modulePath),
    pfs.readFile(testDataPath + resultPath, 'utf8')
  ]).then( (values) => {
    assert.equal(UglifyJS.minify(values[0], {fromString: true, mangle: false, compress: false}).code,
      UglifyJS.minify(values[1], {fromString: true, mangle: false, compress: false}).code);
  })
}
