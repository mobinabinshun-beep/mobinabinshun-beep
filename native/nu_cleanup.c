#include "nu_cleanup.h"
#include <string.h>
#include <limits.h>
int NU_CleanupPlanBuild(const NU_CleanupItem *items, size_t count,
                        uint32_t remove_mask, int delete_installer,
                        NU_CleanupPlan *plan) {
 size_t i;
 NU_CleanupPlan p;
 if (!items || !plan || count > NU_CLEANUP_MAX_ITEMS ||
     (remove_mask & 0xffffff80u) != 0u) return 0;
 memset(&p, 0, sizeof(p));
 for (i = 0u; i < count; ++i) {
  uint32_t cls = items[i].data_class;
  int remove_item;
  if (cls > (uint32_t)NU_DATA_INSTALLER) return 0;
  remove_item = cls == (uint32_t)NU_DATA_INSTALLER ?
                (delete_installer ? 1 : 0) :
                ((remove_mask & (1u << cls)) != 0u);
  if (remove_item) {
   if (p.delete_count == UINT32_MAX ||
       UINT64_MAX - p.delete_bytes < items[i].size_bytes) return 0;
   ++p.delete_count;
   p.delete_bytes += items[i].size_bytes;
   if (cls == (uint32_t)NU_DATA_INSTALLER)
    p.installer_bytes += items[i].size_bytes;
  } else {
   if (p.preserve_count == UINT32_MAX ||
       UINT64_MAX - p.preserve_bytes < items[i].size_bytes) return 0;
   ++p.preserve_count;
   p.preserve_bytes += items[i].size_bytes;
   if (cls == (uint32_t)NU_DATA_INSTALLER) {
    p.installer_preserved = 1u;
    p.installer_bytes += items[i].size_bytes;
   }
  }
 }
 *plan = p;
 return 1;
}
