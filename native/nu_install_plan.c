#include "nu_install_plan.h"
#include <string.h>
static int nu_component_id_valid(const char *s) {
 size_t i;
 if (!s || !s[0]) return 0;
 for (i=0u; i<NU_INSTALL_ID_SIZE; ++i) {
  char ch=s[i];
  if (ch=='\0') return i>0u;
  if (!((ch>='a'&&ch<='z')||(ch>='0'&&ch<='9')||ch=='-'||ch=='.'))
   return 0;
 }
 return 0;
}
static int nu_version_valid(const char *s) {
 size_t i; int digit=0;
 if (!s || !s[0]) return 0;
 for (i=0u; i<NU_INSTALL_VERSION_SIZE; ++i) {
  char ch=s[i];
  if (ch=='\0') return digit;
  if (ch>='0'&&ch<='9') digit=1;
  else if (ch=='.' && digit) digit=0;
  else return 0;
 }
 return 0;
}
static int nu_unique(const NU_InstallComponent *items, size_t count) {
 size_t i,j;
 for(i=0u;i<count;++i) {
  if (!nu_component_id_valid(items[i].id) ||
      !nu_version_valid(items[i].version) || items[i].required>1u)
   return 0;
  for(j=0u;j<i;++j)
   if (strcmp(items[i].id,items[j].id)==0) return 0;
 }
 return 1;
}
int NU_InstallPlanBuild(const NU_InstallComponent *target, size_t target_count,
                        const NU_InstallComponent *installed, size_t installed_count,
                        NU_InstallPlanEntry *entries, size_t capacity,
                        NU_InstallPlan *plan) {
 size_t i,j; NU_InstallPlan p;
 if (!target || (!installed && installed_count != 0u) || !entries || !plan ||
     target_count==0u || target_count>NU_INSTALL_MAX_COMPONENTS ||
     installed_count>NU_INSTALL_MAX_COMPONENTS ||
     capacity<target_count || !nu_unique(target,target_count) ||
     !nu_unique(installed,installed_count)) return 0;
 memset(&p,0,sizeof(p));
 for(i=0u;i<target_count;++i) {
  int found=-1;
  for(j=0u;j<installed_count;++j)
   if(strcmp(target[i].id,installed[j].id)==0) { found=(int)j; break; }
  entries[i].target_index=(uint8_t)i;
  entries[i].installed_index=(int16_t)found;
  if(found<0) { entries[i].action=(uint8_t)NU_INSTALL_ADD; ++p.add_count; }
  else if(strcmp(target[i].version,installed[found].version)==0) {
   entries[i].action=(uint8_t)NU_INSTALL_KEEP; ++p.keep_count;
  } else { entries[i].action=(uint8_t)NU_INSTALL_UPDATE; ++p.update_count; }
 }
 for(j=0u;j<installed_count;++j) {
  int found=0;
  for(i=0u;i<target_count;++i)
   if(strcmp(installed[j].id,target[i].id)==0) { found=1; break; }
  if(!found) ++p.untouched_installed_count;
 }
 p.entry_count=target_count; *plan=p; return 1;
}
int NU_InstallJournalInit(NU_InstallJournal *j,uint32_t id,uint32_t total) {
 if(!j||id==0u||total==0u) return 0;
 j->transaction_id=id; j->total_items=total; j->completed_items=0u;
 j->state=(uint8_t)NU_JOURNAL_PREPARED; return 1;
}
int NU_InstallJournalAdvance(NU_InstallJournal *j,NU_InstallJournalState next,
                             uint32_t completed) {
 int allowed=0;
 if(!j||j->state==NU_JOURNAL_EMPTY||completed>j->total_items||
    completed<j->completed_items) return 0;
 if(next==NU_JOURNAL_ROLLBACK_REQUIRED &&
    j->state>=NU_JOURNAL_PREPARED && j->state<=NU_JOURNAL_ACTIVATED)
  allowed=1;
 else if(next==NU_JOURNAL_ROLLED_BACK &&
         j->state==NU_JOURNAL_ROLLBACK_REQUIRED) allowed=1;
 else if(next==(NU_InstallJournalState)(j->state+1u) &&
         j->state>=NU_JOURNAL_PREPARED && j->state<NU_JOURNAL_ACTIVATED)
  allowed=1;
 if(!allowed) return 0;
 if(next==NU_JOURNAL_VERIFIED && completed!=j->total_items) return 0;
 if(next==NU_JOURNAL_ACTIVATED && j->state!=NU_JOURNAL_VERIFIED) return 0;
 j->completed_items=completed; j->state=(uint8_t)next; return 1;
}
