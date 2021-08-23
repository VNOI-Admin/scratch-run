const fs = require('fs');
const process = require('process');
const scratchVM = require('scratch-vm');
const readlineSync = require('readline-sync');

// Disable vm logging. Need to be done after importing ScratchVM.
const minilog = require('minilog');
minilog.disable();

readlineSync.setDefaultOptions({ prompt: '' });

let _buffer = [];
let _buffer_used = 0;

function get_input() {
  if (_buffer_used == _buffer.length) {
    _buffer = [];
    _buffer_used = 0;
    while (_buffer.length == 0) {
      _buffer = readlineSync.prompt().split(' ');
    }
  }
  const res = _buffer[_buffer_used++];
  return res;
}

if (process.argv.length < 3) {
  process.stdout.write('ERROR: No file argument\n');
  process.exit(1);
}

const vm = new scratchVM();
//const storage = new scratchStorage();

//vm.attachStorage(storage);

vm.start();
vm.setTurboMode(true);

vm.runtime.on('SAY', function (target, type, text) {
  process.stdout.write(text + '\n');
});

vm.runtime.on('QUESTION', function (question) {
  if (question !== null) {
    vm.runtime.emit('ANSWER', get_input());
  }
});

const fileName = process.argv[2];

fs.readFile(fileName, function (err, data) {
  if (err) {
    process.exit(1);
  }

  vm.loadProject(data)
    .then((input) => {
      for (let i = 0; i < vm.runtime.targets.length; i++) {
        vm.runtime.targets[i].visible = false;
      }

      vm.greenFlag();

      vm.runtime.on('PROJECT_RUN_STOP', function () {
        process.exit(0);
      });
    })
    .catch(function (err) {
      process.exit(1);
    });
});
