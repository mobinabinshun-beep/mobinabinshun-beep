#ifndef NU_PACKAGE_H
#define NU_PACKAGE_H
#include <stddef.h>
#include <stdint.h>
/* Build a NUPK/1 container carrying NUVM/1 bytecode. CRC32 is not authentication. */
size_t NU_PackageBuild(const uint8_t *code, size_t code_size, uint8_t *output, size_t capacity);
#endif
