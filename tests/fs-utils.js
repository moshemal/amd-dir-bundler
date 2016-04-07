'use strict';
const assert = require('chai').assert;
const fsUtils = require('../src/fs-utils');

const testDataPath = __dirname + "/tests-data/fs-utils";

describe('##fs-utils.js:', () => {

  describe('getPaths():', () => {

    it('should return empty array', (done) => {
      fsUtils.getPaths(testDataPath + "/1").then((res)=>{
        assert.deepEqual([], res);
        done();
      });
    });

    let res1 = [testDataPath + "/2/1.js"]
    it('should return: ' + res1 , (done) => {
      fsUtils.getPaths(testDataPath + "/2").then((res)=>{
        assert.deepEqual(res1, res);
        done();
      });
    });

    it('should return 3 members in the array' , (done) => {
      fsUtils.getPaths(testDataPath + "/3").then((res)=>{
        assert.equal(3, res.length);
        assert( res.indexOf(testDataPath + "/3/1.js") >=0 );
        assert(res.indexOf(testDataPath + "/3/2.js") >= 0);
        assert(res.indexOf(testDataPath + "/3/a/1.js") >= 0);
        done();
      });
    });
  })

  describe('readModuleFile():', () => {

    it('should return file content',() => {
     // fsUtils.readModuleFile()
    });

  });

}); 