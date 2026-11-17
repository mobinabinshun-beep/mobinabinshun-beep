# N.U Generation 1 Module Contract (NUVM/1)

Status: experimental, source-candidate.

## Manifest
A UTF-8 .numod file contains a [Module] section with:
- id: reverse-DNS identifier, required.
- generation: integer 1.
- entry: relative path to a .nuvm program, no absolute paths and no ...

## VM instructions
- CLEAR r g b
- RECT x y width height r g b
- TEXT x y message

All numeric color channels are clamped to 0–255. Rectangles are limited to 4096×4096. Programs are limited to 4096 instructions and 512 bytes per line. The VM is single-threaded and executes instructions in source order. Unknown opcodes fail closed.

## Compatibility
A future module may declare a higher generation, but this host must reject it explicitly. Translators for later generations must be separately versioned adapters; they must not silently reinterpret unknown instructions.

## Security
This contract does not permit native DLLs, shell commands, scripts, network access, filesystem writes, or process creation. A signed package manager and sandbox are prerequisites for relaxing these restrictions.
