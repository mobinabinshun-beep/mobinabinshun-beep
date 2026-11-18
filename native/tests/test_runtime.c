#include <assert.h>
#include <stdio.h>
#include <string.h>
#include "../nu_runtime.h"
#include "../nu_cache.h"
#include "../nu_translator.h"
#include "../nu_package.h"
#include "../nu_manifest.h"
#include "../nu_dependency.h"
#include "../nu_cleanup.h"
#include "../nu_install_plan.h"
#include "../nu_data_bundle.h"
int main(void){
 NU_Budget b;uint8_t code[]={1,0,42,0,0,0,1,1,8,0,0,0,3,0,1,0};
 uint8_t pkg[NU_PACKAGE_HEADER_SIZE+sizeof(code)];
 uint8_t golden_header[NU_PACKAGE_HEADER_SIZE]={0x4eu,0x55u,0x50u,0x4bu,1u,0u,1u,0u,1u,0u,0u,0u,16u,0u,0u,0u,0xe0u,0x82u,0x72u,0x7du};
 NU_PackageView view;NU_VM vm;int result;unsigned int i;
 NU_BudgetInit(&b,1024u*1024u*1024u,1024u*1024u*1024u,1u);
 assert(b.ram_limit_bytes==NU_DEFAULT_RAM_CAP);assert(b.shared_cache_bytes==250u*1024u*1024u);
 assert(b.short_cache_bytes+b.pattern_cache_bytes==b.shared_cache_bytes);
 assert(b.disk_cache_limit_bytes==1024u*1024u*1024u);
 assert(b.ram_reserved_bytes==0u);
 assert(NU_BudgetReserve(&b,100u*1024u*1024u));
 assert(NU_BudgetReserve(&b,150u*1024u*1024u));
 assert(!NU_BudgetReserve(&b,1u));
 NU_BudgetRelease(&b,150u*1024u*1024u);
 assert(b.ram_reserved_bytes==100u*1024u*1024u);
 NU_BudgetRelease(&b,100u*1024u*1024u);
 assert(b.ram_reserved_bytes==0u);
 assert(b.cpu_slot_numerator==1u&&b.cpu_slot_denominator==2u);
 assert(!NU_SchedulerGrantSlot(0u)&&NU_SchedulerGrantSlot(1u));
 assert(!NU_SchedulerGrantGpuSlot(0u)&&NU_SchedulerGrantGpuSlot(1u));
 assert(NU_PackageBuild(code,sizeof(code),pkg,sizeof(pkg))==sizeof(pkg));
 assert(memcmp(pkg,golden_header,sizeof(golden_header))==0);
 assert(!NU_PackageValidate(pkg,NU_PACKAGE_HEADER_SIZE-1u,&view));

 assert(NU_PackageValidate(pkg,sizeof(pkg),&view));NU_VMInit(&vm,view.code,view.code_size,100u);
 result=1;for(i=0u;i<20u&&result>0;++i)result=NU_VMStep(&vm);
 assert(vm.halted&&vm.registers[0]==50u);
 pkg[NU_PACKAGE_HEADER_SIZE]^=1u;assert(!NU_PackageValidate(pkg,sizeof(pkg),&view));pkg[NU_PACKAGE_HEADER_SIZE]^=1u;
 pkg[4u]=2u;assert(!NU_PackageValidate(pkg,sizeof(pkg),&view));pkg[4u]=1u;
 pkg[5u]=1u;assert(!NU_PackageValidate(pkg,sizeof(pkg),&view));pkg[5u]=0u;
 pkg[6u]=2u;assert(!NU_PackageValidate(pkg,sizeof(pkg),&view));pkg[6u]=1u;
 pkg[7u]=1u;assert(!NU_PackageValidate(pkg,sizeof(pkg),&view));pkg[7u]=0u;
 pkg[11u]=1u;assert(!NU_PackageValidate(pkg,sizeof(pkg),&view));pkg[11u]=0u;
 pkg[0]='N';pkg[1]='U';pkg[2]='V';pkg[3]='M';assert(!NU_PackageValidate(pkg,sizeof(pkg),&view));
 pkg[0]='N';pkg[1]='U';pkg[2]='P';pkg[3]='K';
 {uint8_t bad[]={255u};NU_VMInit(&vm,bad,1u,10u);assert(NU_VMStep(&vm)==-1&&vm.fault);}
 {
  NU_DiskCache cache;NU_IRInstruction ir[4];uint8_t translated[64];size_t translated_size;uint8_t first[]={1u,2u,3u,4u};uint8_t second[]={9u,8u,7u};uint8_t output[16];uint32_t output_size;FILE *probe;uint8_t staged[sizeof(pkg)];uint32_t staged_size;FILE *source;
  ir[0].operation=NU_IR_LOAD_IMM;ir[0].a=0u;ir[0].immediate=42u;
  ir[1].operation=NU_IR_LOAD_IMM;ir[1].a=1u;ir[1].immediate=8u;
  ir[2].operation=NU_IR_ADD;ir[2].a=0u;ir[2].b=1u;
  ir[3].operation=NU_IR_HALT;ir[3].a=0u;ir[3].b=0u;
  translated_size=NU_TranslateGen1(ir,4u,translated,sizeof(translated));
  assert(translated_size>0u);NU_VMInit(&vm,translated,(uint32_t)translated_size,100u);
  result=1;while(result>0)result=NU_VMStep(&vm);assert(vm.halted&&vm.registers[0]==50u);
  assert(NU_TranslateGen1(ir,4u,translated,1u)==0u);
  NU_CacheInit(&cache,"nu-cache-test.bin",64u);
  assert(NU_CachePush(&cache,first,4u));assert(NU_CachePush(&cache,second,3u));
  assert(cache.queued_items==2u);
  assert(NU_CachePop(&cache,output,sizeof(output),&output_size)==1);
  assert(output_size==4u&&memcmp(output,first,4u)==0&&cache.queued_items==1u);
  assert(NU_CachePop(&cache,output,sizeof(output),&output_size)==1);
  assert(output_size==3u&&memcmp(output,second,3u)==0&&cache.queued_items==0u);
  probe=fopen("nu-cache-test.bin","rb");assert(probe==NULL);
  assert(NU_CachePush(&cache,first,4u));assert(!NU_CachePush(&cache,first,60u));
  NU_CacheClear(&cache);
  assert(NU_PackageBuild(code,sizeof(code),pkg,sizeof(pkg))==sizeof(pkg));
  source=fopen("nu-stage-test.nup","wb");assert(source!=NULL);
  assert(fwrite(pkg,1u,sizeof(pkg),source)==sizeof(pkg));assert(fclose(source)==0);
  assert(NU_CacheInit(&cache,"nu-stage-cache.bin",1024u));
  assert(NU_CacheStageFile(&cache,"nu-stage-test.nup")==sizeof(pkg));
  assert(NU_CacheLoadAll(&cache,staged,(uint32_t)sizeof(staged)-1u,&staged_size)==-2);
  assert(cache.queued_items>0u);
  assert(NU_CacheLoadAll(&cache,staged,(uint32_t)sizeof(staged),&staged_size)==1);
  assert(staged_size==sizeof(pkg)&&NU_PackageValidate(staged,staged_size,&view));
  remove("nu-stage-test.nup");
 }
 {
  static const uint8_t manifest_text[] =
   "NU-MANIFEST/1\n"
   "id=bubble-hunt\n"
   "generation=1\n"
   "abi=1.0\n"
   "package=bubble-hunt.nup\n"
   "package_size=32\n"
   "sha256=0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef\n"
   "key_id=none\n"
   "signature=unsigned\n";
  static const uint8_t bad_manifest[] =
   "NU-MANIFEST/1\n"
   "id=bubble-hunt\n"
   "generation=2\n"
   "abi=1.0\n"
   "package=bubble-hunt.nup\n"
   "package_size=32\n"
   "sha256=0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef\n"
   "key_id=none\n"
   "signature=unsigned\n";
  NU_Manifest manifest;
  assert(NU_ManifestParse(manifest_text,sizeof(manifest_text)-1u,&manifest));
  assert(strcmp(manifest.id,"bubble-hunt")==0);
  assert(manifest.generation==1u && manifest.package_size==32u);
  assert(!NU_ManifestVerify(&manifest,pkg,32u,(NU_ManifestVerifyProvider)0,0));
  assert(!NU_ManifestParse(bad_manifest,sizeof(bad_manifest)-1u,&manifest));
 }
 {
  NU_DependencyNode nodes[3]={{1u,1u,0u},{1u,1u,0u},{1u,1u,0u}};
  uint8_t graph[9]={0u,1u,0u, 0u,0u,1u, 0u,0u,0u};
  uint8_t order[3];
  assert(NU_DependencyResolve(nodes,3u,graph,sizeof(graph),order,3u));
  assert(order[0]==2u && order[1]==1u && order[2]==0u);
  graph[6]=1u;
  assert(!NU_DependencyResolve(nodes,3u,graph,sizeof(graph),order,3u));
  graph[6]=0u;nodes[1].generation=2u;
  assert(!NU_DependencyResolve(nodes,3u,graph,sizeof(graph),order,3u));
 }

 {
  NU_CleanupItem items[8]={{NU_DATA_CORE,100u},{NU_DATA_MODULE,200u},
   {NU_DATA_CACHE,300u},{NU_DATA_SAVE,400u},{NU_DATA_WALLET,500u},
   {NU_DATA_ASSET,600u},{NU_DATA_PROFILE,700u},{NU_DATA_INSTALLER,800u}};
  NU_CleanupPlan plan;
  uint32_t remove_mask=(1u<<NU_DATA_CORE)|(1u<<NU_DATA_MODULE)|
   (1u<<NU_DATA_CACHE)|(1u<<NU_DATA_PROFILE);
  assert(NU_CleanupPlanBuild(items,8u,remove_mask,0,&plan));
  assert(plan.delete_count==4u && plan.delete_bytes==1300u);
  assert(plan.preserve_count==4u && plan.preserve_bytes==2300u);
  assert(plan.installer_preserved==1u && plan.installer_bytes==800u);
  assert(NU_CleanupPlanBuild(items,8u,remove_mask,1,&plan));
  assert(plan.installer_preserved==0u && plan.installer_bytes==800u);
  assert(plan.delete_count==5u && plan.delete_bytes==2100u);
  assert(!NU_CleanupPlanBuild(items,8u,0x80000000u,0,&plan));
  assert(!NU_CleanupPlanBuild(items,8u,remove_mask,2,&plan));
  items[0].data_class=99u;
  assert(!NU_CleanupPlanBuild(items,8u,remove_mask,0,&plan));
 }

 {
  NU_InstallComponent target[3]={{"nu-core","1.0.0",1u},
   {"bubble-hunt","1.0.0",1u},{"mana-collector","1.0.0",0u}};
  NU_InstallComponent installed[3]={{"nu-core","1.0.0",1u},
   {"bubble-hunt","0.9.0",1u},{"legacy-addon","2.0.0",0u}};
  NU_InstallPlanEntry entries[3]; NU_InstallPlan plan;
  NU_InstallJournal journal;
  assert(NU_InstallPlanBuild(target,3u,0,0u,entries,3u,&plan));
  assert(plan.keep_count==0u && plan.update_count==0u && plan.add_count==3u);
  assert(NU_InstallPlanBuild(target,3u,installed,3u,entries,3u,&plan));
  assert(plan.keep_count==1u && plan.update_count==1u && plan.add_count==1u);
  assert(plan.untouched_installed_count==1u);
  assert(entries[0].action==NU_INSTALL_KEEP);
  assert(entries[1].action==NU_INSTALL_UPDATE);
  assert(entries[2].action==NU_INSTALL_ADD);
  target[1].id[0]='N';
  assert(!NU_InstallPlanBuild(target,3u,installed,3u,entries,3u,&plan));
  target[1].id[0]='b';
  assert(NU_InstallJournalInit(&journal,7u,2u));
  assert(!NU_InstallJournalAdvance(&journal,NU_JOURNAL_VERIFIED,0u));
  assert(NU_InstallJournalAdvance(&journal,NU_JOURNAL_STAGING,1u));
  assert(!NU_InstallJournalAdvance(&journal,NU_JOURNAL_VERIFIED,1u));
  assert(NU_InstallJournalAdvance(&journal,NU_JOURNAL_VERIFIED,2u));
  assert(NU_InstallJournalAdvance(&journal,NU_JOURNAL_ACTIVATED,2u));
  assert(NU_InstallJournalAdvance(&journal,NU_JOURNAL_ROLLBACK_REQUIRED,2u));
  assert(NU_InstallJournalAdvance(&journal,NU_JOURNAL_ROLLED_BACK,2u));
 }

 {
  static const uint8_t save_data[]={1u,2u,3u,4u,5u};
  static const uint8_t wallet_data[]={9u,8u,7u};
  NU_BundleEntry entries[2];NU_BundleView view;
  uint8_t bundle[256];size_t bundle_size;
  memset(entries,0,sizeof(entries));
  entries[0].data_class=NU_BUNDLE_SAVE;entries[0].schema_major=1u;entries[0].schema_minor=0u;
  strcpy(entries[0].id,"game.bubble-hunt.save");
  entries[0].data=save_data;entries[0].size=(uint32_t)sizeof(save_data);
  entries[1].data_class=NU_BUNDLE_WALLET;entries[1].schema_major=1u;entries[1].schema_minor=0u;
  strcpy(entries[1].id,"wallet.shared");
  entries[1].data=wallet_data;entries[1].size=(uint32_t)sizeof(wallet_data);
  bundle_size=NU_BundleBuild(entries,2u,bundle,sizeof(bundle));
  assert(bundle_size>NU_BUNDLE_HEADER_SIZE);
  assert(memcmp(bundle,"NUDB",4u)==0);
  assert(NU_BundleParse(bundle,bundle_size,&view));
  assert(view.count==2u);
  assert(view.entries[0].data_class==NU_BUNDLE_SAVE);
  assert(view.entries[0].schema_major==1u&&view.entries[0].schema_minor==0u);
  assert(strcmp(view.entries[0].id,"game.bubble-hunt.save")==0);
  assert(view.entries[0].size==sizeof(save_data));
  assert(memcmp(view.entries[0].data,save_data,sizeof(save_data))==0);
  assert(view.entries[1].data_class==NU_BUNDLE_WALLET);
  assert(view.entries[1].schema_major==1u&&view.entries[1].schema_minor==0u);
  assert(memcmp(view.entries[1].data,wallet_data,sizeof(wallet_data))==0);
  bundle[4u]=2u;assert(!NU_BundleParse(bundle,bundle_size,&view));bundle[4u]=1u;
  bundle[16u]^=1u;assert(!NU_BundleParse(bundle,bundle_size,&view));bundle[16u]^=1u;
  bundle[bundle_size-1u]^=1u;
  assert(!NU_BundleParse(bundle,bundle_size,&view));
  bundle[bundle_size-1u]^=1u;
  strcpy(entries[1].id,entries[0].id);
  assert(NU_BundleBuild(entries,2u,bundle,sizeof(bundle))==0u);
  strcpy(entries[1].id,"../outside");
  assert(NU_BundleBuild(entries,2u,bundle,sizeof(bundle))==0u);
  entries[1].data_class=99u;
  strcpy(entries[1].id,"wallet.shared");
  assert(NU_BundleBuild(entries,2u,bundle,sizeof(bundle))==0u);
  entries[1].data_class=NU_BUNDLE_WALLET;entries[1].schema_major=0u;
  assert(NU_BundleBuild(entries,2u,bundle,sizeof(bundle))==0u);
 }
 puts("N.U native runtime tests passed");return 0;
}
