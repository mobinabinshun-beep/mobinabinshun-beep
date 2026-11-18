#ifndef NU_PACKAGE_H
#define NU_PACKAGE_H
#include <stddef.h>
#include <stdint.h>
/* Build a complete NUVM/1 envelope. Returns total bytes, or zero on rejection. */
size_t NU_PackageBuild(const uint8_t *code, size_t code_size, uint8_t *output, size_t capacity);
#endif
