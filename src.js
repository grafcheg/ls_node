const fs = require('fs');
const path = require('path');

// default folders name
const fromDir = process.argv[2] || 'not_sorted';
const toDir = process.argv[3] || 'sorted';

const deleteArg = process.argv[4];

if (!fs.existsSync(fromDir)) {
  console.error('Source folder does not exist');
  process.exit(9);
}

if (!fs.existsSync(toDir)) {
  fs.mkdirSync(toDir);
} else {
  console.error('Can not create distination folder or folder already exists');
  process.exit(9);
}

const copyFn = (item, itemLink) => {
  const firstSymbol = item.substring(0, 1).toUpperCase();
  const targetDir = path.join(toDir, firstSymbol);

  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir);
  }

  fs.link(itemLink, path.join(targetDir, item), err => {
    if (err) {
      console.error(err.message);
    }
  });
};

const readDir = (base, level) => {
  const files = fs.readdirSync(base);

  files.forEach(item => {
    const localBase = path.join(base, item);
    const state = fs.statSync(localBase);

    if (state.isDirectory()) {
      readDir(localBase, level + 1);
    } else {
      copyFn(item, localBase);
    }
  });
};

readDir(fromDir, 0);

if (deleteArg) {
  fs.rmdir(fromDir, { recursive: true }, err => {
    if (err) {
      console.error(err.message);
    }
  });
}
