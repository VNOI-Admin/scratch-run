// Suppress all warnings
process.removeAllListeners('warning');

const fs = require('fs');

function writeStdoutSync(text) {
  fs.writeSync(process.stdout.fd, text);
}

function writeStderrSync(text) {
  fs.writeSync(process.stderr.fd, text);
}

const argv = require('minimist')(process.argv.slice(2), {
  boolean: ['help', 'version', 'check', 'buffer-stdout']
});

if (argv.version) {
  const { version } = require('../package.json');
  writeStdoutSync(version + '\n');
  process.exit(0);
}

if (argv._.length == 0 || argv.help) {
  writeStdoutSync(`Usage: scratch-run project-file [OPTIONS]
Options:
  --help                  print this message
  --version               print the version
  --check                 validate project file
  --buffer-stdout         buffer stdout for better performance
`);
  process.exit(0);
}

const scratchVM = require('scratch-vm');
const Kattio = require('./kattio');

function check_scratch_file(filename) {
  const vm = new scratchVM();
  vm.convertToPackagedRuntime();

  // Block loading extensions (e.g., music)
  vm.extensionManager.loadExtensionIdSync =
    vm.extensionManager.loadExtensionURL = (id) => {
      writeStderrSync(
        'Not a valid Scratch file: Can not use extension ' + id + '\n'
      );
      process.exit(1);
    };

  fs.readFile(filename, function (err, data) {
    if (err) {
      writeStderrSync(err + '\n');
      process.exit(1);
    }

    vm.loadProject(data)
      .then(() => {
        process.exit(0);
      })
      .catch(function (err) {
        writeStderrSync('Not a valid Scratch file: ' + err + '\n');
        process.exit(1);
      });
  });
}

function run_scratch_file(filename) {
  const vm = new scratchVM();
  vm.convertToPackagedRuntime();

  // Block loading extensions (e.g., music)
  vm.extensionManager.loadExtensionIdSync =
    vm.extensionManager.loadExtensionURL = (id) => {
      writeStderrSync(
        'scratch-vm encountered an error: Can not use extension ' + id + '\n'
      );
      process.exit(1);
    };

  // _scratch_run_* are called from the generated code by scratch-vm's compiler
  let stdoutBuffer = '';
  if (argv['buffer-stdout']) {
    vm.runtime._scratch_run_say = function (text) {
      stdoutBuffer += text + '\n';
    };
    vm.runtime._scratch_run_think = function (text) {
      stdoutBuffer += text;
    };
  } else {
    vm.runtime._scratch_run_say = function (text) {
      process.stdout.write(text + '\n');
    };
    vm.runtime._scratch_run_think = function (text) {
      process.stdout.write(text);
    };
  }
  vm.runtime._scratch_run_ask = function (question) {
    try {
      if (question === 'read_token') {
        return Kattio.nextToken();
      } else {
        return Kattio.nextLine();
      }
    } catch (e) {
      writeStderrSync(
        'scratch-vm encountered an error: Could not read input: ' +
          e.message +
          '\n'
      );
      process.exit(1);
    }
  };

  vm.runtime.on('PROJECT_RUN_STOP', function () {
    vm.runtime.quit();
    process.stdout.write(stdoutBuffer, () => process.exit(0));
  });

  fs.readFile(filename, function (err, data) {
    if (err) {
      writeStderrSync(err + '\n');
      process.exit(1);
    }

    vm.loadProject(data)
      .then(() => {
        for (const target of vm.runtime.targets) {
          target.setVisible(false);
        }
        vm.runtime.precompile();
        vm.setTurboMode(true);
        vm.setFramerate(250);
        vm.start();
        vm.greenFlag();
      })
      .catch(function (err) {
        writeStderrSync('scratch-vm encountered an error: ' + err + '\n');
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
