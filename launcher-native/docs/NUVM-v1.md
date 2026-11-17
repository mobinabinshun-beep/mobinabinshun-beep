# NUVM bytecode v1

NUVM v1 is line-oriented UTF-8/ASCII text. Blank lines and lines whose first non-space character is # are comments. One instruction per line. Current interpreter limits: 512 bytes per line, 4096 instructions, and a 5–50 ms cooperative execution slice per 100 ms host timer.

## Opcodes currently implemented

| Opcode | Syntax | Meaning |
|---|---|---|
| CLEAR | `CLEAR r g b` | Set frame background |
| RECT | `RECT x y width height r g b` | Draw filled rectangle |
| TEXT | `TEXT x y text...` | Draw text using host default foreground |

Coordinates are signed decimal integers; width and height are 0..4096. Color components are clamped to 0..255. Text is limited to 120 bytes. The current parser rejects unknown opcodes and malformed operands.

## Compatibility rules

- Opcodes are case-sensitive.
- An unknown opcode is a hard error in v1.
- Do not silently reinterpret an existing opcode.
- New required semantics need a new major VM version or an explicit negotiated capability.
- No jumps, file I/O, native calls, networking, threads or arbitrary memory access exist in v1.
- The current interpreter is a minimal rendering proof, not a complete game engine.
