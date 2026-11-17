# Extending N.U safely

## Add a game package

1. Copy `samples/template` to a new directory.
2. Give the module a stable reverse-DNS identifier.
3. Keep all paths package-relative.
4. Use only opcodes listed in NUVM-v1.md.
5. Run `python -m unittest discover -s tests -v`.
6. Load the .numod manifest in the launcher and test Pause/Run, invalid files and completion.

## Add an opcode

Do not add an opcode only to a game. Update, in one change:
- the NUVM v1 specification (or define a new VM major version);
- parser validation and instruction representation;
- interpreter behavior;
- a positive and negative fixture;
- automated contract tests;
- compatibility notes.

Unknown opcodes must remain rejected.

## Add a runtime generation

Create a new runtime implementation beside G1. Do not change G1 semantics in place. Define:
- package manifest major version and capability negotiation;
- bytecode format and limits;
- translator/service interfaces;
- conformance fixtures and golden outputs;
- migration and fallback behavior.

Keep old modules installable. A host should select the runtime by explicit package metadata, never by guessing.

## Current extension seam vs future work

The current app is still a single translation unit. The documents define stable package/runtime boundaries, but dynamic module loading, a public plugin ABI, translators, assets, dependency resolution and cryptographic package verification are not yet implemented. The next engineering milestone is to extract the interpreter into a separately compiled library with unit tests before exposing third-party extensions.
