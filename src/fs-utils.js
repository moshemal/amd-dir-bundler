'use strict';

const pfs = require('./promisified-fs');

function getPaths(path) {
  //path = __dirname + path;
  return pfs.readdir(path).then( (fileNames) => {
    let promises = fileNames.map((fileName) => {
      let currPath = path + "/" + fileName;
      return pfs.stat(currPath)
        .then( (stat) => {
          if (stat.isDirectory()){
            return getPaths(currPath);
          } else {
            return [currPath];
          }
        })
    });
    return Promise.all(promises).then((arr) => {
      return arr.reduce((res, curr) => {
        return res.concat(curr);
      }, []);
    })
  });
}

function readModuleFile(path) {

}

module.exports = {
  getPaths, readModuleFile
};

