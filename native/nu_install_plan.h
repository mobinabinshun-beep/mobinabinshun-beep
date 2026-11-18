#ifndef NU_INSTALL_PLAN_H
#define NU_INSTALL_PLAN_H
#include <stddef.h>
#include <stdint.h>
#define NU_INSTALL_MAX_COMPONENTS 64u
#define NU_INSTALL_ID_SIZE 64u
#define NU_INSTALL_VERSION_SIZE 32u
typedef struct NU_InstallComponent {
 char id[NU_INSTALL_ID_SIZE];
 char version[NU_INSTALL_VERSION_SIZE];
 uint8_t required;
} NU_InstallComponent;
typedef enum NU_InstallAction {
 NU_INSTALL_KEEP=0, NU_INSTALL_ADD=1, NU_INSTALL_UPDATE=2
} NU_InstallAction;
typedef struct NU_InstallPlanEntry {
 uint8_t target_index;
 int16_t installed_index;
 uint8_t action;
} NU_InstallPlanEntry;
typedef struct NU_InstallPlan {
 uint32_t keep_count;
 uint32_t add_count;
 uint32_t update_count;
 uint32_t untouched_installed_count;
 size_t entry_count;
} NU_InstallPlan;
/* Full-pack reconciliation: target components are compared by stable ID.
   Missing items are added, changed versions updated, equal versions kept.
   Installed components absent from the full pack are left untouched. */
int NU_InstallPlanBuild(const NU_InstallComponent *, size_t,
                        const NU_InstallComponent *, size_t,
                        NU_InstallPlanEntry *, size_t, NU_InstallPlan *);
typedef enum NU_InstallJournalState {
 NU_JOURNAL_EMPTY=0, NU_JOURNAL_PREPARED=1, NU_JOURNAL_STAGING=2,
 NU_JOURNAL_VERIFIED=3, NU_JOURNAL_ACTIVATED=4,
 NU_JOURNAL_ROLLBACK_REQUIRED=5, NU_JOURNAL_ROLLED_BACK=6
} NU_InstallJournalState;
typedef struct NU_InstallJournal {
 uint32_t transaction_id;
 uint32_t total_items;
 uint32_t completed_items;
 uint8_t state;
} NU_InstallJournal;
int NU_InstallJournalInit(NU_InstallJournal *, uint32_t, uint32_t);
int NU_InstallJournalAdvance(NU_InstallJournal *, NU_InstallJournalState,
                             uint32_t);
#define NU_INSTALL_JOURNAL_DISK_SIZE 24u
size_t NU_InstallJournalEncode(const NU_InstallJournal *, uint8_t *, size_t);
int NU_InstallJournalDecode(const uint8_t *, size_t, NU_InstallJournal *);
#endif
