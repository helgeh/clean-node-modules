#! /usr/bin/env node

var program = require('commander');
var fs = require('fs');
var path = require('path');
var rimraf = require('rimraf');
var colors = require('colors');

program
  .usage('[options] <keywords>')
  .option('-p, --path [path]', 'Directory to start renaming process (must be or contain \'node_modules\')')
  .parse(process.argv);

var keys = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];
var key = 0;
var suffix = 0;

if (program.path) {
  var p = getNodeModulesDirectory(program.path);
  if (!p) {
    showWarningAndExit(
      'The supplied directory does not contain a \'node_modules\' directory.' +
      '\nFor security reasons the directory will not get processed without it.'
    );
  }
  else {
    handleDirectory(p);
    cleanDirectory(p);
  }
}
else {
  program.help();
}

function getNodeModulesDirectory(dir) {
  if (dir.indexOf('node_modules') >= 0) {
    return dir;
  }
  else if (isDirectory(dir)) {
    var dirs = getSubDirectories(dir);
    if (dirs && dirs.length && dirs.indexOf('node_modules') >= 0)
      return path.join(dir, 'node_modules');
  }
  return false;
}

function showWarningAndExit(msg) {
  console.log(colors.red('!!!'));
  console.log(colors.red(msg));
  console.log(colors.red('!!!'));
  program.help();
}

function handleDirectory(dir) {
  var i, curDirs;
  key = 0;
  suffix = 0;
  curDirs = renameDirectories(dir, getSubDirectories(dir));
  for (i = 0; i < curDirs.length; i++) {
    handleDirectory(path.join(dir, curDirs[i]));
  }
}

function getSubDirectories(dir) {
  var dirs, p, files, i;
  files = fs.readdirSync(dir);
  dirs = [];
  for (i = 0; i < files.length; i++) {
    p = path.join(dir, files[i]);
    if (isDirectory(p)) {
      dirs.push(files[i]);
    }
  }
  return dirs;
}

function renameDirectories(base, dirs) {
  var i, cur;
  for (i = 0; i < dirs.length; i++) {
    cur = path.join(base, dirs[i]);
    if (isDirectory(cur)) {
      dirs[i] = getNextKey();
      doRename(cur, path.join(base, dirs[i]));
    }
  }
  return dirs;
}

function getNextKey() {
  var newKey;
  if (keys.length <= key) {
    key = 0;
    suffix++;
  }
  newKey = keys[key++] + suffix.toString(10);
  return newKey;
}

function doRename(oldName, newName) {
  try {
    fs.renameSync(oldName, newName);
  }
  catch (e) {
    if (e.code === 'EPERM' || e.code === 'EACCES') {
      showWarningAndExit('Something iffy with permissions or access... Maybe an open explorer window under the folder in question?');
    } else {
      throw e;
    }
  }
}

function isDirectory(p) {
  var stats = fs.statSync(p);
  return stats.isDirectory();
}

function cleanDirectory(p) {
  rimraf(p, {disableGlob: true}, function(err) {
    if (!err)
      console.log(colors.green('Directory cleaned successfully!'));
    else
      console.log(colors.red('Something went wrong! ' + err));
  });
}
