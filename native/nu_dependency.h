#ifndef NU_DEPENDENCY_H
#define NU_DEPENDENCY_H
#include <stddef.h>
#include <stdint.h>
#define NU_DEPENDENCY_MAX_MODULES 64u
typedef struct NU_DependencyNode {
 uint8_t generation;
 uint8_t abi_major;
 uint8_t abi_minor;
} NU_DependencyNode;
/* Row-major matrix: module -> required dependency. Output is dependency-first.
   Rejects unsupported contracts, self-edges, malformed entries and cycles. */
int NU_DependencyResolve(const NU_DependencyNode *, size_t, const uint8_t *,
                         size_t, uint8_t *, size_t);
#endif
