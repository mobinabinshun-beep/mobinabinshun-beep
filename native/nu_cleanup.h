#ifndef NU_CLEANUP_H
#define NU_CLEANUP_H
#include <stddef.h>
#include <stdint.h>
#define NU_CLEANUP_MAX_ITEMS 256u
typedef enum NU_DataClass {
 NU_DATA_CORE=0, NU_DATA_MODULE=1, NU_DATA_CACHE=2,
 NU_DATA_SAVE=3, NU_DATA_WALLET=4, NU_DATA_ASSET=5,
 NU_DATA_PROFILE=6, NU_DATA_INSTALLER=7
} NU_DataClass;
typedef struct NU_CleanupItem {
 uint32_t data_class;
 uint64_t size_bytes;
} NU_CleanupItem;
typedef struct NU_CleanupPlan {
 uint32_t delete_count;
 uint32_t preserve_count;
 uint32_t installer_preserved;
 uint64_t delete_bytes;
 uint64_t preserve_bytes;
 uint64_t installer_bytes;
} NU_CleanupPlan;
/* remove_mask selects data classes 0..6. Installer is never selected by this mask. */
int NU_CleanupPlanBuild(const NU_CleanupItem *, size_t, uint32_t,
                        int, NU_CleanupPlan *);
#endif
