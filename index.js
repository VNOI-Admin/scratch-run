// For some reason, `new Buffer()` is added to the compiled code by ncc.
// This triggers the warning "DeprecationWarning: Buffer() is deprecated due to security and usability issues."
// Until it is fixed in ncc, we workaround by suppressing the warning.
process.removeAllListeners('warning');

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

function check_scratch_file(filename) {
  const vm = new scratchVM();
  vm.start();
  vm.setTurboMode(true);

  // Block loading extensions (e.g., music)
  vm.extensionManager.loadExtensionURL = (id) => {
    process.stderr.write(
      'Not a valid Scratch file: Can not use extension ' + id + '\n'
    );
    process.exit(1);
  };

  fs.readFile(filename, function (err, data) {
    if (err) {
      process.stderr.write(err + '\n');
      process.exit(1);
    }

    vm.loadProject(data)
      .then(() => {
        process.exit(0);
      })
      .catch(function (err) {
        process.stderr.write('Not a valid Scratch file: ' + err + '\n');
        process.exit(1);
      });
  });
}

class Queue {
  constructor(data = []) {
    this._data = Array.from(data);
    this._head_ptr = 0;
  }

  get length() {
    return this._data.length - this._head_ptr;
  }

  front() {
    if (this.length === 0) {
      return null;
    }
    return this._data[this._head_ptr];
  }

  push(elm) {
    this._data.push(elm);
  }

  shift() {
    if (this.length === 0) {
      return null;
    }
    return this._data[this._head_ptr++];
  }

  toString() {
    return this._data.slice(this._head_ptr).toString();
  }
}

function run_scratch_file(filename) {
  let lines = new Queue();
  let ask_queue = new Queue();
  let cur_pos = 0;

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
  });

  rl.on('line', (text) => {
    lines.push(text);
    if (ask_queue.length > 0) {
      try_to_answer();
    }
  });

  const vm = new scratchVM();
  vm.start();
  vm.setTurboMode(true);

  // Block loading extensions (e.g., music)
  vm.extensionManager.loadExtensionURL = (id) => {
    process.stderr.write(
      'scratch-vm encountered an error: Can not use extension ' + id + '\n'
    );
    process.exit(1);
  };

  function is_space(c) {
    // based on regex \s
    // no need to check for '\n' and '\r'. they are handled by readline
    return c === ' ' || c === '\t' || c === '\v' || c === '\f';
  }

  function try_to_answer() {
    if (ask_queue.front()) {
      // read_token
      while (lines.length > 0) {
        const line_front = lines.front();
        while (cur_pos < line_front.length && is_space(line_front[cur_pos])) {
          cur_pos++;
        }
        if (cur_pos === line_front.length) {
          lines.shift();
          cur_pos = 0;
        } else {
          let nxt_pos = cur_pos + 1;
          while (
            nxt_pos < line_front.length &&
            !is_space(line_front[nxt_pos])
          ) {
            nxt_pos++;
          }
          vm.runtime.emit(
            'ANSWER',
            line_front.substr(cur_pos, nxt_pos - cur_pos)
          );
          cur_pos = nxt_pos;
          if (cur_pos === line_front.length) {
            cur_pos = 0;
            lines.shift();
          }
          ask_queue.shift();
          break;
        }
      }
    } else {
      // read_line
      if (lines.length > 0) {
        vm.runtime.emit('ANSWER', lines.shift().substr(cur_pos));
        cur_pos = 0;
        ask_queue.shift();
      }
    }
  }

  vm.runtime.on('SAY', function (target, type, text) {
    text = text.toString();
    if (type === 'say') {
      process.stdout.write(text + '\n');
    } else {
      // type === 'think'
      process.stdout.write(text);
    }
  });

  vm.runtime.on('QUESTION', function (question) {
    if (question !== null) {
      ask_queue.push(question === 'read_token');
      try_to_answer();
    }
  });

  fs.readFile(filename, function (err, data) {
    if (err) {
      process.stderr.write(err + '\n');
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
      .catch(function (err) {
        process.stderr.write('scratch-vm encountered an error: ' + err + '\n');
        process.exit(1);
      });
  });
}

if (process.argv[2] === '--check') {
  if (process.argv.length < 4) {
    process.stdout.write('ERROR: No file argument\n');
    process.exit(1);
  }
  check_scratch_file(process.argv[3]);
} else {
  run_scratch_file(process.argv[2]);
}
