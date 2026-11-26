#include "nu_dependency.h"
#include <string.h>
int NU_DependencyResolve(const NU_DependencyNode *nodes, size_t count,
                         const uint8_t *matrix, size_t matrix_size,
                         uint8_t *order, size_t capacity) {
 uint8_t emitted[NU_DEPENDENCY_MAX_MODULES];
 size_t i, j, pass, out = 0u;
 if (!nodes || !matrix || !order || count == 0u ||
     count > NU_DEPENDENCY_MAX_MODULES || capacity < count ||
     count > ((size_t)-1) / count || matrix_size != count * count) return 0;
 memset(emitted, 0, sizeof(emitted));
 for (i = 0u; i < count; ++i) {
  if (nodes[i].generation != 1u || nodes[i].abi_major != 1u ||
      nodes[i].abi_minor != 0u || matrix[i * count + i] != 0u) return 0;
  for (j = 0u; j < count; ++j)
   if (matrix[i * count + j] > 1u) return 0;
 }
 for (pass = 0u; pass < count; ++pass) {
  int progress = 0;
  for (i = 0u; i < count; ++i) {
   int ready = 1;
   if (emitted[i]) continue;
   for (j = 0u; j < count; ++j)
    if (matrix[i * count + j] && !emitted[j]) { ready = 0; break; }
   if (ready) { emitted[i] = 1u; order[out++] = (uint8_t)i; progress = 1; }
  }
  if (!progress) break;
 }
 return out == count ? 1 : 0;
}
