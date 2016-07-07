
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
  var p = lookForNodeFolder(program.path);
  if (!p) {
    showWarningAndExit();
  }
  else {
    handleDirectory(p);
    cleanDirectory(p);
  }
}
else {
  program.help();
}

function lookForNodeFolder(p) {
  if (p.indexOf('node_modules') >= 0) {
    return p;
  }
  else if (isDir(p)) {
    var dirs = getDirs(p);
    if (dirs && dirs.length && dirs.indexOf('node_modules') >= 0)
      return path.join(p, 'node_modules');
  }
  return false;
}

function showWarningAndExit() {
  var msg = 'The supplied directory does not contain a \'node_modules\' directory.\nFor security reasons the directory will not get processed without it.';
  console.log(colors.red('!!!'));
  console.log(colors.red(msg));
  console.log(colors.red('!!!'));
  program.help();
}

function handleDirectory(dir) {
  var i, curDirs;
  key = 0;
  suffix = 0;
  curDirs = renameDirs(dir, getDirs(dir));
  for (i = 0; i < curDirs.length; i++) {
    handleDirectory(path.join(dir, curDirs[i]));
  }
}

function getDirs(dir) {
  var dirs, p, files, i;
  files = fs.readdirSync(dir);
  dirs = [];
  for (i = 0; i < files.length; i++) {
    p = path.join(dir, files[i]);
    if (isDir(p)) {
      dirs.push(files[i]);
    }
  }
  return dirs;
}

function renameDirs(base, dirs) {
  var i, cur;
  for (i = 0; i < dirs.length; i++) {
    cur = path.join(base, dirs[i]);
    if (isDir(cur)) {
      dirs[i] = getNextKey();
      fs.renameSync(cur, path.join(base, dirs[i]));
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

function isDir(p) {
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
