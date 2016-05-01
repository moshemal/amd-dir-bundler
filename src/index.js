/**
 * Created by moshemal on 4/7/16.
 */
'use strict';

const fsUtils = require('./fs-utils');
const define  = require('./define');
const path    = require('path');
const ASYNC   = require('asyncawait/async');
const AWAIT   = require('asyncawait/await');
const beautify = require('js-beautify').js_beautify;

const plugins = {
  text(content){
    let res = content.replace(/'/gm, "\\'");
    res = res.replace(/"/gm, '\\"').replace(/\r/gm, "");
    res = res.split("\n").join("' + \n'");
    return {
      depNames: [],
      callback: `function () {
        return '${res}';
        }
        `,
      parameters: []
    }
  }
};

function splitPrefix(name) {
  var prefix,
    index = name ? name.indexOf('!') : -1;
  if (index > -1) {
    prefix = name.substring(0, index);
    name = name.substring(index + 1, name.length);
  }
  return [prefix, name];
}

function createProps(moduleDep, fileContent) {
  let props = {};
  if (moduleDep.pluginName){
    props = plugins[moduleDep.pluginName](fileContent);
  } else {
    props = eval(fileContent);
  }
  return props
}


function handleOneModule(basePath, moduleDep, isPrivate) {
  let modulePath = moduleDep.absolutePath;
  let currDir = path.dirname(modulePath);
  return fsUtils.readModuleFile(modulePath, moduleDep.pluginName).then((fileContent)=>{
    var props = createProps(moduleDep, fileContent);
    props.modulePath = modulePath;
    props.moduleName = path.relative(basePath, modulePath);
    props.deps = props.depNames.map((depName) => {
      let prefixNName = splitPrefix(depName);
      depName = prefixNName[1];
      let dep = {};
      if (prefixNName[0]){
        dep.pluginName = prefixNName[0]
      }
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

const getAllModulesProps = ASYNC (function(basePath, modulePath){
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
  queue.push({
    absolutePath: modulePath
  });
  while (queue.length > 0) {
    let moduleProps = AWAIT (handleOneModule(basePath, queue.shift(), isPrivate));
    moduleProps.deps.forEach((dep)=>{
      if (isPrivate(dep.absolutePath)){
        if (!isPrivateModuleExist(privateModules, queue, dep.absolutePath)){
          queue.push(dep);
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
    handleDeps(curr, arr, indexes)
  });
  function handleDeps(curr, privateModules, indexes){
    visited[curr.moduleName] = true;
    curr.deps.forEach((dep) => {
      if (!dep.isPrivate || visited[dep.moduleName]){
        return;
      }
      handleDeps(privateModules[indexes[dep.moduleName]], privateModules, indexes);
    });
    sorted.push(curr);
  }
  return sorted;
}


function pack(basePath, filePath, options) {
  if (typeof basePath !== 'string') {
    throw new Error("First argument type must be a string");
  }
  options = options || {};
  if (!Boolean(filePath)){
    filePath = basePath;
    basePath = path.dirname(basePath);
  } else if (typeof filePath === 'object'){
    options = filePath;
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

    let code = beautify(`define([${globalModules.map((name)=>{return'"' + name + '"';}).join(",")}], function(){
              var __modules = {};
              ${modules.privateModules.map((currModule)=>{return printModule(currModule, globalIndexes, options)}).join("\n")}
              return __modules["${path.relative(basePath, filePath)}"];
            });`, { "indent_size": 2, "indent_char": " "});

    return {code}
  });
}

module.exports = {
  pack
};

function useSubOfHandler(moduleName, options) {
  var res = "";
  if (Array.isArray(options.useSubOf)){
    options.useSubOf.some((rootName) => {
      if (moduleName.startsWith(rootName)){
        res = moduleName.split(path.sep).slice(1).join(".");
        return true;
      }
      return false;
    });
  }
  return res;
}

function printModule(moduleProps, globalDepsIndex, options) {
  let args = moduleProps.deps.map( (curr) => {
    if (typeof globalDepsIndex[curr.moduleName] === "number"){
      return `arguments[${globalDepsIndex[curr.moduleName]}]` + useSubOfHandler(curr.moduleName, options);
    } else {
      return `__modules["${curr.moduleName}"]`;
    }
  }).join(", ");
  return `__modules["${moduleProps.moduleName}"] =  ( ${moduleProps.callback} )(${args});`;
}






