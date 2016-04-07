/**
 * Created by moshemal on 4/7/16.
 */
'use strict';

const define = require('./define');

function readModuleFile(path, callback) {
  try {
    var filename = require.resolve(path);
    fs.readFile(filename, 'utf8', callback);
  } catch (e) {
    callback(e);
  }
}

readModuleFile('./a.js', (err, words) => {
  console.log(words);
  eval(words);
});