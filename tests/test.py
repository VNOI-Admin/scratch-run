import os
import platform
import unittest
from subprocess import PIPE, Popen, TimeoutExpired

__DIR__ = os.path.dirname(os.path.realpath(__file__))
os.chdir(__DIR__)


def get_executable():
    arch = 'arm64' if platform.machine() == 'aarch64' else 'amd64'
    if platform.system() == 'Linux':
        return f'../bin/linux-{arch}/scratch-run'
    elif platform.system() == 'Darwin':
        return f'../bin/macos-{arch}/scratch-run'
    elif platform.system() == 'Windows':
        return f'../bin/win-{arch}/scratch-run'
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

    def test_aplusb_sb_token(self):
        proc = Popen([self.executable, 'aplusb.sb'], stdin=PIPE, stdout=PIPE, stderr=PIPE)
        stdout, stderr = proc.communicate(b'123 456\n')

        self.assertEqual(proc.returncode, 0)
        self.assertEqual(stdout, b'579\n')
        self.assertEqual(stderr, b'')

    def test_aplusb_sb_line(self):
        proc = Popen([self.executable, 'aplusb.sb'], stdin=PIPE, stdout=PIPE, stderr=PIPE)
        stdout, stderr = proc.communicate(b'123\n456\n')

        self.assertEqual(proc.returncode, 0)
        self.assertEqual(stdout, b'579\n')
        self.assertEqual(stderr, b'')

    def test_aplusb_sb2_token(self):
        proc = Popen([self.executable, 'aplusb.sb2'], stdin=PIPE, stdout=PIPE, stderr=PIPE)
        stdout, stderr = proc.communicate(b'123 456\n')

        self.assertEqual(proc.returncode, 0)
        self.assertEqual(stdout, b'579\n')
        self.assertEqual(stderr, b'')

    def test_aplusb_sb2_line(self):
        proc = Popen([self.executable, 'aplusb.sb2'], stdin=PIPE, stdout=PIPE, stderr=PIPE)
        stdout, stderr = proc.communicate(b'123\n456\n')

        self.assertEqual(proc.returncode, 0)
        self.assertEqual(stdout, b'579\n')
        self.assertEqual(stderr, b'')

    def test_aplusb_sb3_token(self):
        proc = Popen([self.executable, 'aplusb.sb3'], stdin=PIPE, stdout=PIPE, stderr=PIPE)
        stdout, stderr = proc.communicate(b'123 456\n')

        self.assertEqual(proc.returncode, 0)
        self.assertEqual(stdout, b'579\n')
        self.assertEqual(stderr, b'')

    def test_aplusb_sb3_line(self):
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

    def test_stopall(self):
        proc = Popen([self.executable, 'stopall.sb3'], stdin=PIPE, stdout=PIPE, stderr=PIPE)
        try:
            stdout, stderr = proc.communicate(timeout=1)
        except TimeoutExpired:
            proc.kill()
            raise

        self.assertEqual(proc.returncode, 0)
        self.assertEqual(stdout, b'')
        self.assertEqual(stderr, b'')

    def test_sum_1ton(self):
        N = 100000
        inp = f'{N}\n'
        for i in range(N):
            inp += str(i + 1) + '\n'

        proc = Popen([self.executable, 'sum_1ton.sb3'], stdin=PIPE, stdout=PIPE, stderr=PIPE)
        try:
            stdout, stderr = proc.communicate(inp.encode(), timeout=2)
        except TimeoutExpired:
            proc.kill()
            raise

        self.assertEqual(proc.returncode, 0)
        self.assertEqual(stdout, (str(N * (N + 1) // 2) + '\n').encode())
        self.assertEqual(stderr, b'')

    def test_invalid_file(self):
        proc = Popen([self.executable, 'invalid.sb3'], stdin=PIPE, stdout=PIPE, stderr=PIPE)
        stdout, stderr = proc.communicate()

        self.assertEqual(proc.returncode, 1)
        self.assertEqual(stdout, b'')
        self.assertEqual(stderr, b'scratch-vm encountered an error: SyntaxError: Unexpected end of JSON input\n')

    def test_check_invalid_file(self):
        proc = Popen([self.executable, '--check', 'invalid.sb3'], stdin=PIPE, stdout=PIPE, stderr=PIPE)
        stdout, stderr = proc.communicate()

        self.assertEqual(proc.returncode, 1)
        self.assertEqual(stdout, b'')
        self.assertEqual(stderr, b'Not a valid Scratch file: SyntaxError: Unexpected end of JSON input\n')

    def test_music_extension(self):
        proc = Popen([self.executable, 'music_extension.sb3'], stdin=PIPE, stdout=PIPE, stderr=PIPE)
        stdout, stderr = proc.communicate()

        self.assertEqual(proc.returncode, 1)
        self.assertEqual(stdout, b'')
        self.assertEqual(stderr, b'Not a valid Scratch file: Can not use extension music\n')

    def test_check_music_extension(self):
        proc = Popen([self.executable, '--check', 'music_extension.sb3'], stdin=PIPE, stdout=PIPE, stderr=PIPE)
        stdout, stderr = proc.communicate()

        self.assertEqual(proc.returncode, 1)
        self.assertEqual(stdout, b'')
        self.assertEqual(stderr, b'Not a valid Scratch file: Can not use extension music\n')


if __name__ == '__main__':
    unittest.main()
