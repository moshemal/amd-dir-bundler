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
        dep.isPrivate = true;
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

function topologicalSort(privateModules) {
  let sorted = [];
  let visited = {};
  let indexes = {};
  privateModules.forEach((curr, i)=>{
    indexes[curr.moduleName] = i;
  });
  privateModules.forEach((curr, i, arr)=>{
    if (visited[curr.moduleName]){
      return;
    }
    helper(curr, arr, indexes)
  });
  function helper(curr, privateModules, indexes){
    visited[curr.moduleName] = true;
    curr.deps.forEach((dep) => {
      if (!dep.isPrivate || visited[dep.moduleName]){
        return;
      }
      helper(privateModules[indexes[dep.moduleName]], privateModules, indexes);
    });
    sorted.push(curr);
  }
  return sorted;
}

function pack(basePath, filePath) {
  if (!Boolean(filePath)){
    filePath = basePath;
    basePath = path.dirname(basePath);
  }
  basePath = path.resolve(basePath);
  if (filePath.endsWith(".js")){
    filePath = filePath.substring(0, filePath.indexOf(".js"))
  }

  return getAllModulesProps(basePath, filePath).then((modules)=>{
    let globalIndexes = {};
    let globalModules = modules.globalModules.map((curr, i)=>{
      globalIndexes[curr.moduleName] = i;
      return curr.moduleName;
    });

    modules.privateModules = topologicalSort(modules.privateModules);

    return `define([${globalModules.join(",")}], function(){
        var __modules = {};
        ${modules.privateModules.map((currModule)=>{return printModule(currModule, globalIndexes)}).join("\n")}
        return __modules["${path.relative(basePath, filePath)}"];
      });`
  });
}

module.exports = {
  pack
};

function printModule(moduleProps, globalDepsIndex) {
  let args = moduleProps.deps.map( (curr) => {
    if (typeof globalDepsIndex[curr.moduleName] === "number"){
      return `arguments[${globalDepsIndex[curr.moduleName]}]`
    } else {
      return `__modules["${curr.moduleName}"]`;
    }
  }).join(", ");
  return `__modules["${moduleProps.moduleName}"] =  ( ${moduleProps.callback} )(${args});`;
}




