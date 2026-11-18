#include <assert.h>
#include <stdio.h>
#include <string.h>
#include "../nu_runtime.h"
#include "../nu_cache.h"
#include "../nu_translator.h"
#include "../nu_package.h"
#include "../nu_manifest.h"
#include "../nu_dependency.h"
int main(void){
 NU_Budget b;uint8_t code[]={1,0,42,0,0,0,1,1,8,0,0,0,3,0,1,0};
 uint8_t pkg[16+sizeof(code)];NU_PackageView view;NU_VM vm;int result;unsigned int i;
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

 assert(NU_PackageValidate(pkg,sizeof(pkg),&view));NU_VMInit(&vm,view.code,view.code_size,100u);
 result=1;for(i=0u;i<20u&&result>0;++i)result=NU_VMStep(&vm);
 assert(vm.halted&&vm.registers[0]==50u);
 pkg[16u]^=1u;assert(!NU_PackageValidate(pkg,sizeof(pkg),&view));pkg[16u]^=1u;
 pkg[5u]=1u;assert(!NU_PackageValidate(pkg,sizeof(pkg),&view));pkg[5u]=0u;
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
 puts("N.U native runtime tests passed");return 0;
}
