'use strict';
const assert = require('chai').assert;
const fsUtils = require('../src/fs-utils');
const fs = require('fs');
const testDataPath = __dirname + "/tests-data/fs-utils";

describe('##fs-utils.js:', () => {

  describe('lsSubFiles():', () => {

    it('should return empty array', (done) => {
      fs.mkdir(testDataPath + "/1", function(){
        fsUtils.lsSubFiles(testDataPath + "/1").then((res)=>{
          assert.deepEqual([], res);
          done();
        });
      });
    });

    let res1 = [testDataPath + "/2/1.js"]
    it('should return: ' + res1 , (done) => {
      fsUtils.lsSubFiles(testDataPath + "/2").then((res)=>{
        assert.deepEqual(res1, res);
        done();
      });
    });

    it('should return 3 members in the array' , (done) => {
      fsUtils.lsSubFiles(testDataPath + "/3").then((res)=>{
        assert.equal(3, res.length);
        assert( res.indexOf(testDataPath + "/3/1.js") >=0);
        assert(res.indexOf(testDataPath + "/3/2.js") >= 0);
        assert(res.indexOf(testDataPath + "/3/a/1.js") >= 0);

      }).then(done,done);
    });
  })

  describe('readModuleFile():', () => {

    it('should return file with js extension content', function(done) {
     fsUtils.readModuleFile(testDataPath + "/2/1.js").then( function(res){
       assert.equal(res, '"content of 2/1.js"');
     }).then(done,done);
    });

    it('should return file with no js extension content', function(done) {
      fsUtils.readModuleFile(testDataPath + "/2/1").then( function(res){
        assert.equal(res, '"content of 2/1.js"');
      }).then(done,done);
    });

  });

}); 