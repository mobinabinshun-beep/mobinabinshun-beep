#include <assert.h>
#include <stdio.h>
#include <string.h>
#include "../nu_runtime.h"
static void put32(uint8_t *p,uint32_t v){p[0]=(uint8_t)v;p[1]=(uint8_t)(v>>8);p[2]=(uint8_t)(v>>16);p[3]=(uint8_t)(v>>24);}
int main(void){
 NU_Budget b;uint8_t code[]={1,0,42,0,0,0,1,1,8,0,0,0,3,0,1,0};
 uint8_t pkg[16+sizeof(code)];NU_PackageView view;NU_VM vm;int result;unsigned int i;
 NU_BudgetInit(&b,1024u*1024u*1024u,1024u*1024u*1024u,1u);
 assert(b.ram_limit_bytes==NU_DEFAULT_RAM_CAP);assert(b.disk_cache_limit_bytes==1024u*1024u*1024u);
 assert(b.short_cache_bytes+b.pattern_cache_bytes==250u*1024u*1024u);
 assert(b.cpu_slot_numerator==1u&&b.cpu_slot_denominator==2u);
 assert(!NU_SchedulerGrantSlot(0u)&&NU_SchedulerGrantSlot(1u));
 memcpy(pkg,"NUVM",4u);pkg[4]=1u;pkg[5]=0u;pkg[6]=1u;pkg[7]=0u;
 put32(pkg+8u,(uint32_t)sizeof(code));memcpy(pkg+16u,code,sizeof(code));put32(pkg+12u,NU_CRC32(code,sizeof(code)));
 assert(NU_PackageValidate(pkg,sizeof(pkg),&view));NU_VMInit(&vm,view.code,view.code_size,100u);
 result=1;for(i=0u;i<20u&&result>0;++i)result=NU_VMStep(&vm);
 assert(vm.halted&&vm.registers[0]==50u);
 pkg[16u]^=1u;assert(!NU_PackageValidate(pkg,sizeof(pkg),&view));
 {uint8_t bad[]={255u};NU_VMInit(&vm,bad,1u,10u);assert(NU_VMStep(&vm)==-1&&vm.fault);}
 puts("N.U native runtime tests passed");return 0;
}
