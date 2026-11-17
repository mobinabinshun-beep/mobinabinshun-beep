import pathlib
import unittest

ROOT = pathlib.Path(__file__).resolve().parents[1]
MANIFEST = ROOT / "samples" / "hello.numod"
PROGRAM = ROOT / "samples" / "hello.nuvm"
TEMPLATE_MANIFEST = ROOT / "samples" / "template" / "template.numod"
TEMPLATE_PROGRAM = ROOT / "samples" / "template" / "main.nuvm"
SOURCE = ROOT / "src" / "main.cpp"
ALLOWED = {"CLEAR", "RECT", "TEXT"}

def instructions(path):
    return [line.strip().split()[0] for line in path.read_text(encoding="utf-8").splitlines()
            if line.strip() and not line.lstrip().startswith("#")]

def parse_manifest(path):
    values, active = {}, False
    for raw in path.read_text(encoding="utf-8").splitlines():
        line = raw.strip()
        if not line or line.startswith(("#", ";")):
            continue
        if line.startswith("["):
            active = line == "[Module]"
        elif active and "=" in line:
            key, value = line.split("=", 1)
            values[key.strip()] = value.strip()
    return values

class ModuleContractTests(unittest.TestCase):
    def test_sample_manifest_is_generation_one_and_relative(self):
        values = parse_manifest(MANIFEST)
        self.assertEqual(values["generation"], "1")
        self.assertEqual(values["id"], "org.nu.samples.hello")
        self.assertEqual(values["entry"], "hello.nuvm")
        self.assertNotIn("..", values["entry"])
        self.assertFalse(pathlib.PurePosixPath(values["entry"]).is_absolute())

    def test_sample_uses_only_generation_one_opcodes(self):
        ops = instructions(PROGRAM)
        self.assertTrue(ops)
        self.assertTrue(set(ops).issubset(ALLOWED))

    def test_template_declares_versioned_runtime_contract(self):
        values = parse_manifest(TEMPLATE_MANIFEST)
        self.assertEqual(values["format"], "NUMOD")
        self.assertEqual(values["format_version"], "1")
        self.assertEqual(values["runtime"], "NUVM")
        self.assertEqual(values["runtime_version"], "1")
        self.assertEqual(values["generation"], "1")
        self.assertEqual(values["entry"], "main.nuvm")
        self.assertTrue(set(instructions(TEMPLATE_PROGRAM)).issubset(ALLOWED))

    def test_native_host_has_fail_closed_guards(self):
        source = SOURCE.read_text(encoding="utf-8")
        self.assertIn("generation != 1", source)
        self.assertIn("SafeRelativePath(entry)", source)
        self.assertIn("unknown VM opcode", source)
        self.assertIn("parsed.size() >= 4096", source)

if __name__ == "__main__":
    unittest.main()
