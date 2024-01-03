// For some reason, `new Buffer()` is added to the compiled code by ncc.
// This triggers the warning "DeprecationWarning: Buffer() is deprecated due to security and usability issues."
// Until it is fixed in ncc, we workaround by suppressing the warning.
process.removeAllListeners('warning');

const argv = require('minimist')(process.argv.slice(2), {
  boolean: ['help', 'version', 'check', 'buffer-stdout']
});

if (argv._.length == 0 || argv.help) {
  console.log(`Usage: scratch-run project-file [OPTIONS]
Options:
  --help                  print this message
  --version               print the version
  --check                 validate project file
  --buffer-stdout         buffer stdout for better performance
`);
  process.exit(0);
}

const fs = require('fs');
const scratchVM = require('scratch-vm');
const Kattio = require('./kattio');

// Disable vm logging. Need to be done after importing scratch-vm.
const minilog = require('minilog');
minilog.disable();

if (argv.version) {
  const { version } = require('../package.json');
  process.stdout.write(version + '\n');
  process.exit(0);
}

function check_scratch_file(filename) {
  const vm = new scratchVM();

  // Block loading extensions (e.g., music)
  vm.extensionManager.loadExtensionIdSync =
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

function run_scratch_file(filename) {
  const vm = new scratchVM();

  // Hack to speeding up vm.runtime._step calls
  const real_step = vm.runtime._step.bind(vm.runtime);
  vm.runtime._step = () => {
    for (let loop_count = 0; loop_count < 5000; ++loop_count) {
      setImmediate(real_step);
    }
  };

  // Block loading extensions (e.g., music)
  vm.extensionManager.loadExtensionIdSync =
    vm.extensionManager.loadExtensionURL = (id) => {
      process.stderr.write(
        'scratch-vm encountered an error: Can not use extension ' + id + '\n'
      );
      process.exit(1);
    };

  let stdoutBuffer = '';
  if (argv['buffer-stdout']) {
    vm.runtime.on('SAY', function (target, type, text) {
      text = text.toString() + (type === 'say' ? '\n' : '');
      stdoutBuffer += text;
    });
  } else {
    vm.runtime.on('SAY', function (target, type, text) {
      text = text.toString() + (type === 'say' ? '\n' : '');
      process.stdout.write(text);
    });
  }

  vm.runtime.on('QUESTION', function (question) {
    if (question !== null) {
      if (question === 'read_token') {
        vm.runtime.emit('ANSWER', Kattio.nextToken());
      } else {
        vm.runtime.emit('ANSWER', Kattio.nextLine());
      }
    }
  });

  vm.runtime.on('PROJECT_RUN_STOP', function () {
    process.stdout.write(stdoutBuffer);
    process.exit(0);
  });

  fs.readFile(filename, function (err, data) {
    if (err) {
      process.stderr.write(err + '\n');
      process.exit(1);
    }

    vm.loadProject(data)
      .then(() => {
        for (const target of vm.runtime.targets) {
          target.setVisible(false);
        }
        vm.convertToPackagedRuntime();
        vm.setTurboMode(true);
        vm.setFramerate(250);
        vm.start();
        vm.greenFlag();
      })
      .catch(function (err) {
        process.stderr.write('scratch-vm encountered an error: ' + err + '\n');
        process.exit(1);
      });
  });
}

const filename = argv._[0];
if (process.argv[2] === '--check') {
  check_scratch_file(filename);
} else {
  run_scratch_file(filename);
}
