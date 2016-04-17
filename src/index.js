/**
 * Created by moshemal on 4/7/16.
 */
'use strict';

const fsUtils = require('./fs-utils');
const define  = require('./define');
const path    = require('path');
const ASYNC   = require('asyncawait/async');
const AWAIT   = require('asyncawait/await');

function handleOneModule(basePath, modulePath, isPrivate) {
  let currDir = path.dirname(modulePath);
  return fsUtils.readModuleFile(modulePath).then((code)=>{
    var props = eval(code);
    props.modulePath = modulePath;
    props.moduleName = path.relative(basePath, modulePath);
    props.deps = props.depNames.map((depName) => {
      let dep = {};
      let absolutePath = path.resolve(currDir, depName);
      let relativePath = path.relative(basePath, absolutePath);
      if (isPrivate(absolutePath)){
        dep.absolutePath = absolutePath;
        dep.moduleName = relativePath;
      } else {
        dep.moduleName = depName.startsWith(".") ? relativePath : depName
      }
      return dep;
    });
    return props;
  });
}

function isPrivateModuleExist(privateModules, queue, absolutePath) {
  return privateModules.some((currModuleProps) => {
      return currModuleProps.absolutePath === absolutePath;
    }) || queue.some((currModulePath) => {
      return currModulePath === absolutePath;
    });
}

function isGlobalModuleExist(globalModules, resolvedName) {
  return globalModules.some( (currGlobal) => {
    return currGlobal.moduleName === resolvedName;
  });
}

const getAllModulesProps = ASYNC (function(basePath,modulePath){
  let subFiles = AWAIT (fsUtils.lsSubFiles(basePath));

  let privatesDict = subFiles.reduce((res, subFile)=>{
    res[subFile] = true;
    return res;
  }, {});

  const isPrivate = function (fileName){
    return fileName &&
    (privatesDict[path.resolve(fileName)] === true ||
      privatesDict[path.resolve(fileName) + ".js"] === true);
  };

  let queue = [];
  let privateModules = [];
  let globalModules = [];
  queue.push(modulePath);
  while (queue.length > 0) {
    let moduleProps = AWAIT (handleOneModule(basePath, queue.shift(), isPrivate));
    moduleProps.deps.forEach((dep)=>{
      if (isPrivate(dep.absolutePath)){
        if (!isPrivateModuleExist(privateModules, queue, dep.absolutePath)){
          queue.push(dep.absolutePath);
        }
      } else {
        if (!isGlobalModuleExist(globalModules, dep.moduleName)){
          globalModules.push(dep);
        }
      }
    });
    if(isPrivate(moduleProps.modulePath)){
      privateModules.push(moduleProps)
    }
  }
  return {
    privateModules, globalModules
  }
});

function pack(basePath, filePath) {
  if (!Boolean(filePath)){
    filePath = basePath;
    basePath = path.dirname(basePath);
  }
  basePath = path.resolve(basePath);

  return getAllModulesProps(basePath, filePath).then((modules)=>{
    let globalIndexes = {};
    let globalModules = modules.globalModules.map((curr, i)=>{
      globalIndexes[curr.moduleName] = i;
      return curr.moduleName;
    });


    let res = `define([${globalModules.join(",")}], function(){
      var __modules = {};
      ${modules.privateModules.map((currModule)=>{return printModule(currModule)}).join("\n")}
      return __modules["${path.relative(basePath, filePath)}"];
    });`
   return res;
  });
}

module.exports = {
  pack
};

function printModule(moduleProps, globalDepsIndex, isPrivate) {
  let args = moduleProps.deps.map( (curr) => {
    if (true){
      return `privateDeps["${curr.moduleName}"]`;
    } else {

      return `arguments[]`
    }
  }).join(", ");
  return `__modules["${moduleProps.moduleName}"] =  ( ${moduleProps.callback} )(${args})`;
}


pack(__dirname + "/../tests/tests-data/index/1/main4").then((res)=>{console.log(res)});


