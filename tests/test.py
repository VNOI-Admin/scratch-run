import os
import platform
import unittest
from subprocess import PIPE, Popen

__DIR__ = os.path.dirname(os.path.realpath(__file__))
os.chdir(__DIR__)


def get_executable():
    arch = 'arm64' if platform.machine() == 'aarch64' else 'amd64'
    if platform.system() == 'Linux':
        return f'../build/linux-{arch}/scratch-run'
    elif platform.system() == 'Darwin':
        return f'../build/macos-{arch}/scratch-run'
    elif platform.system() == 'Windows':
        return f'../build/win-{arch}/scratch-run'
    else:
        raise RuntimeError('Unsupported platform: {}'.format(platform.system()))


class TestScratchRun(unittest.TestCase):
    executable = get_executable()

    def test_say_think(self):
        proc = Popen([self.executable, 'say_think.sb3'], stdin=PIPE, stdout=PIPE, stderr=PIPE)
        stdout, stderr = proc.communicate()

        self.assertEqual(proc.returncode, 0)
        self.assertEqual(stdout, b'Hello world!\n')
        self.assertEqual(stderr, b'')

    def test_echo(self):
        test_message = b'echo: Hello, World!\n'

        proc = Popen([self.executable, 'echo.sb3'], stdin=PIPE, stdout=PIPE, stderr=PIPE)
        stdout, stderr = proc.communicate(test_message)

        self.assertEqual(proc.returncode, 0)
        self.assertEqual(stdout, test_message)
        self.assertEqual(stderr, b'')

    def test_echo_json(self):
        test_message = b'echo: Hello, World!\n'

        proc = Popen([self.executable, 'echo.json'], stdin=PIPE, stdout=PIPE, stderr=PIPE)
        stdout, stderr = proc.communicate(test_message)

        self.assertEqual(proc.returncode, 0)
        self.assertEqual(stdout, test_message)
        self.assertEqual(stderr, b'')

    def test_aplusb_token(self):
        proc = Popen([self.executable, 'aplusb.sb3'], stdin=PIPE, stdout=PIPE, stderr=PIPE)
        stdout, stderr = proc.communicate(b'123 456\n')

        self.assertEqual(proc.returncode, 0)
        self.assertEqual(stdout, b'579\n')
        self.assertEqual(stderr, b'')

    def test_aplusb_line(self):
        proc = Popen([self.executable, 'aplusb.sb3'], stdin=PIPE, stdout=PIPE, stderr=PIPE)
        stdout, stderr = proc.communicate(b'123\n456\n')

        self.assertEqual(proc.returncode, 0)
        self.assertEqual(stdout, b'579\n')
        self.assertEqual(stderr, b'')

    def test_permutation(self):
        proc = Popen([self.executable, 'permutation.sb3'], stdin=PIPE, stdout=PIPE, stderr=PIPE)
        stdout, stderr = proc.communicate(b'3\n')

        self.assertEqual(proc.returncode, 0)
        self.assertEqual(stdout, b'123\n132\n213\n231\n312\n321\n')
        self.assertEqual(stderr, b'')

    def test_invalid_file(self):
        proc = Popen([self.executable, 'invalid.sb3'], stdin=PIPE, stdout=PIPE, stderr=PIPE)
        stdout, stderr = proc.communicate()

        self.assertEqual(proc.returncode, 1)
        self.assertEqual(stdout, b'')
        self.assertEqual(stderr, b'scratch-vm encountered an error: Error: Non-ascii character in FixedAsciiString\n')

    def test_check_invalid_file(self):
        proc = Popen([self.executable, '--check', 'invalid.sb3'], stdin=PIPE, stdout=PIPE, stderr=PIPE)
        stdout, stderr = proc.communicate()

        self.assertEqual(proc.returncode, 1)
        self.assertEqual(stdout, b'')
        self.assertEqual(stderr, b'Not a valid Scratch file: Error: Non-ascii character in FixedAsciiString\n')


if __name__ == '__main__':
    unittest.main()
