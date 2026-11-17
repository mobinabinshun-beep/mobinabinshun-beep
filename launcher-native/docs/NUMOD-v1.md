# NUMOD package manifest v1

A package is a directory. The manifest is UTF-8 INI-like text named `<id>.numod`. Paths are relative to the manifest directory. Do not use absolute paths, drive letters, parent traversal, symlinks or path separators that escape the package root.

```ini
[Module]
format=NUMOD
format_version=1
id=org.example.game
generation=1
entry=main.nuvm
runtime=NUVM
runtime_version=1
display_name=Example Game
author=Example Studio
memory_mb=32
```

## Required keys

| Key | Rule |
|---|---|
| format | exactly NUMOD |
| format_version | integer major version; currently 1 |
| id | reverse-DNS-like stable identifier, 3–128 ASCII chars |
| generation | runtime generation; current host accepts 1 only |
| entry | relative path to an NUVM v1 file ending in .nuvm |
| runtime | exactly NUVM for this host |
| runtime_version | currently 1 |

Optional keys must not change package semantics unless negotiated by a capability. The current G1 host accepts the legacy subset `id`, `generation`, `entry`; it ignores additional keys. This document defines the forward contract, not a claim that every key is enforced by today's binary.

## Security

Treat packages as untrusted. Parse into a temporary structure, validate all fields and limits, then commit the loaded package atomically. Never execute native code from a package. Future asset paths must be canonicalized and checked against the package root after normalization. Signatures and hashes are future requirements, not yet implemented.
