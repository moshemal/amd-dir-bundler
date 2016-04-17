/**
 * Created by moshemal on 4/7/16.
 */
'use strict';

const fsUtils = require('./fs-utils');
const define  = require('./define');
const path    = require('path');


function handleOneFile(basePath, filePath, isPrivate) {
  let currDir = path.dirname(filePath);
  return fsUtils.readModuleFile(filePath).then((code)=>{
    var props = eval(code);
    props.deps = props.depNames.map((depName) => {
      let dep = {
        filePath
      };
      let absolutePath = path.resolve(currDir, depName);
      if (isPrivate(absolutePath)){
        dep["absolutePath"] = absolutePath;
        dep["resolvedName"] = path.relative(basePath, absolutePath);
        dep["isPrivate"] = true;
      } else {
        dep["resolvedName"] = depName.startsWith(".") ? absolutePath : depName
      }
      return dep;
    });
    return props;
  });
}

function pack(basePath, filePath) {
  if (!Boolean(filePath)){
    filePath = basePath;
    basePath = path.dirname(basePath);
  }
  basePath = path.resolve(basePath);

  return fsUtils.lsSubFiles(basePath).then((subFiles)=>{
    var dict = subFiles.reduce((res, subFile)=>{
      res[subFile] = true;
      return res;
    }, {});
    return function (fileName){
      return dict[path.resolve(fileName)] === true ||
        dict[path.resolve(fileName) + ".js"] === true;
    };
  }).then((isPrivate)=>{
    return handleOneFile(basePath, filePath, isPrivate);
  }).then((res)=>{
    console.log(res); return res;
  });
}

module.exports = {
  pack
};

function printModule(moduleProps, globalDepsIndex) {
  let args = moduleProps.deps.map( (curr) => {
    if (curr.isPrivate){
      return `privateDeps["${path.relative(baseUrl, curr.path)}"]`;
    } else {

      return `arguments[]`
    }
  }).join(", ");
  return `return ( ${moduleProps.callback} )(${args})`;
}


pack("/home/moshemal/projects/requirejs-dir-bundler/tests/tests-data/index/1/main3");


