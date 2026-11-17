import pathlib
import unittest

ROOT = pathlib.Path(__file__).resolve().parents[1]
MANIFEST = ROOT / "samples" / "hello.numod"
PROGRAM = ROOT / "samples" / "hello.nuvm"
SOURCE = ROOT / "src" / "main.cpp"

class ModuleContractTests(unittest.TestCase):
    def test_sample_manifest_is_generation_one_and_relative(self):
        values = {}
        active = False
        for raw in MANIFEST.read_text(encoding="utf-8").splitlines():
            line = raw.strip()
            if line == "[Module]":
                active = True
                continue
            if line.startswith("["):
                active = False
            if active and "=" in line:
                key, value = line.split("=", 1)
                values[key] = value
        self.assertEqual(values["generation"], "1")
        self.assertEqual(values["id"], "org.nu.samples.hello")
        self.assertEqual(values["entry"], "hello.nuvm")
        self.assertNotIn("..", values["entry"])
        self.assertFalse(pathlib.PurePosixPath(values["entry"]).is_absolute())

    def test_sample_uses_only_generation_one_opcodes(self):
        allowed = {"CLEAR", "RECT", "TEXT"}
        instructions = [
            line.strip().split()[0]
            for line in PROGRAM.read_text(encoding="utf-8").splitlines()
            if line.strip() and not line.lstrip().startswith("#")
        ]
        self.assertTrue(instructions)
        self.assertTrue(set(instructions).issubset(allowed))

    def test_native_host_has_fail_closed_guards(self):
        source = SOURCE.read_text(encoding="utf-8")
        self.assertIn('generation != 1', source)
        self.assertIn('SafeRelativePath(entry)', source)
        self.assertIn('unknown VM opcode', source)
        self.assertIn('parsed.size() >= 4096', source)

if __name__ == "__main__":
    unittest.main()
