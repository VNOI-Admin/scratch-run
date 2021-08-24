const fs = require('fs');
const readline = require('readline');
const scratchVM = require('scratch-vm');

// Disable vm logging. Need to be done after importing scratch-vm.
const minilog = require('minilog');
minilog.disable();

if (process.argv.length < 3) {
  process.stdout.write('ERROR: No file argument\n');
  process.exit(1);
}

if (process.argv[2] === '--version') {
  const { version } = require('./package.json');
  process.stdout.write(version + '\n');
  process.exit(0);
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

let lines = [];
let waiting = false;

rl.on('line', (text) => {
  lines.push(text);
  process.stdout.write('> ' + text);
  if (waiting) {
    answer(lines.shift());
    waiting = false;
  }
});

const vm = new scratchVM();
//const storage = new scratchStorage();

//vm.attachStorage(storage);

vm.start();
vm.setTurboMode(true);

function answer(text) {
  vm.runtime.emit('ANSWER', text);
}

vm.runtime.on('SAY', function (target, type, text) {
  process.stdout.write(text + '\n');
});

vm.runtime.on('QUESTION', function (question) {
  if (question !== null) {
    if (lines.length > 0) answer(lines.shift());
    else waiting = true;
  }
});

fs.readFile(process.argv[2], function (err, data) {
  if (err) {
    process.exit(1);
  }

  vm.loadProject(data)
    .then(() => {
      for (let i = 0; i < vm.runtime.targets.length; i++) {
        vm.runtime.targets[i].visible = false;
      }

      vm.greenFlag();

      vm.runtime.on('PROJECT_RUN_STOP', function () {
        process.exit(0);
      });
    })
    .catch(function () {
      process.exit(1);
    });
});
