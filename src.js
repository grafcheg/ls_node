const fs = require('fs');
const path = require('path');
const util = require('util');
const mkdirPromisify = util.promisify(fs.mkdir);
const linkPromisify = util.promisify(fs.link);
const readdirPromisify = util.promisify(fs.readdir);

// default folders name
const fromDir = process.argv[2] || 'not_sorted';
const toDir = process.argv[3] || 'sorted';

const readDir = (base, level) => {
  readdirPromisify(base)
    .then(files => {
      files.forEach(item => {
        const localBase = path.join(base, item);
        const state = fs.statSync(localBase);

        if (state.isDirectory()) {
          readDir(localBase, level + 1);
        } else {
          copyFn(item, localBase);
        }
      });
    })
    .catch(err => {
      console.log(err);
    });
};

const copyFn = (item, itemLink) => {
  const firstSymbol = item.substring(0, 1).toUpperCase();
  const targetDir = path.join(toDir, firstSymbol);

  mkdirPromisify(targetDir, { recursive: true })
    .then(linkPromisify(itemLink, path.join(targetDir, item)))
    .catch(err => {
      console.log(err);
    });
};

fs.access(fromDir, err => {
  if (err) {
    console.log(`${fromDir} folder does not exist.\n ${err}`);
    process.exit(9);
  }
});

mkdirPromisify(toDir, { recursive: true })
  .then(readDir(fromDir, 0))
  .catch(err => {
    console.log(err);
  });
