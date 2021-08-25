import os
import platform
import unittest
from subprocess import PIPE, Popen

__DIR__ = os.path.dirname(os.path.realpath(__file__))
os.chdir(__DIR__)


def get_executable():
    # FIXME: check architecture
    if platform.system() == 'Linux':
        return '../build/linux-x64/scratch-run'
    elif platform.system() == 'Darwin':
        return '../build/macos-x64/scratch-run'
    elif platform.system() == 'Windows':
        return '../build/win-x64/scratch-run'
    else:
        raise RuntimeError('Unsupported platform: {}'.format(platform.system()))


class TestScratchRun(unittest.TestCase):
    executable = get_executable()

    def test_say_think(self):
        proc = Popen([self.executable, 'say_think.sb3'], stdin=PIPE, stdout=PIPE, stderr=PIPE)
        expected_output = b'Hello world!\n'
        stdout, stderr = proc.communicate()
        self.assertTrue(stdout == expected_output and not stderr)

    def test_echo(self):
        proc = Popen([self.executable, 'echo.sb3'], stdin=PIPE, stdout=PIPE, stderr=PIPE)
        test_message = b'echo: Hello, World!'
        stdout, stderr = proc.communicate(test_message + b'\n')
        self.assertTrue(stdout.strip() == test_message and not stderr)

    def test_aplusb_token(self):
        proc = Popen([self.executable, 'aplusb.sb3'], stdin=PIPE, stdout=PIPE, stderr=PIPE)
        input = b'123 456\n'
        stdout, stderr = proc.communicate(input)
        self.assertTrue(stdout.strip() == b'579' and not stderr)

    def test_aplusb_line(self):
        proc = Popen([self.executable, 'aplusb.sb3'], stdin=PIPE, stdout=PIPE, stderr=PIPE)
        input = b'123\n456\n'
        stdout, stderr = proc.communicate(input)
        self.assertTrue(stdout.strip() == b'579' and not stderr)

    def test_permutation(self):
        proc = Popen([self.executable, 'permutation.sb3'], stdin=PIPE, stdout=PIPE, stderr=PIPE)
        input = b'3\n'
        expected_output = b'123\n132\n213\n231\n312\n321\n'
        stdout, stderr = proc.communicate(input)
        self.assertTrue(stdout == expected_output and not stderr)


if __name__ == '__main__':
    unittest.main()
