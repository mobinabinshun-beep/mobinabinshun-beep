#include "nu_runtime.h"
#include <string.h>
static uint32_t nu_read_u32(const uint8_t *p) { return (uint32_t)p[0] | ((uint32_t)p[1]<<8) | ((uint32_t)p[2]<<16) | ((uint32_t)p[3]<<24); }
static uint16_t nu_read_u16(const uint8_t *p) { return (uint16_t)((uint16_t)p[0] | ((uint16_t)p[1]<<8)); }
void NU_BudgetInit(NU_Budget *b,uint64_t physical,uint64_t available,uint32_t processors) {
 uint64_t a,c;
 if(!b)return;
 a=physical/2u;c=available/2u;b->ram_limit_bytes=a<c?a:c;
 if(b->ram_limit_bytes>(uint64_t)NU_DEFAULT_RAM_CAP)b->ram_limit_bytes=(uint64_t)NU_DEFAULT_RAM_CAP;
 b->shared_cache_bytes=b->ram_limit_bytes;
 b->short_cache_bytes=b->shared_cache_bytes/2u;
 b->pattern_cache_bytes=b->shared_cache_bytes-b->short_cache_bytes;
 b->disk_cache_limit_bytes=(uint64_t)NU_DEFAULT_DISK_CACHE;
 b->cpu_slot_numerator=1u;b->cpu_slot_denominator=2u;
 b->render_width=640u;b->render_height=480u;b->target_fps=30u;
 b->logical_processors=processors?processors:1u;
}
int NU_SchedulerGrantSlot(uint32_t slot) { return (slot&1u)!=0u; }
int NU_SchedulerGrantGpuSlot(uint32_t nu_slot) { return (nu_slot&1u)!=0u; }
uint32_t NU_CRC32(const uint8_t *data,size_t length) {
 uint32_t crc=0xFFFFFFFFu;size_t i;unsigned int bit;
 if(!data&&length)return 0u;
 for(i=0u;i<length;++i){crc^=(uint32_t)data[i];for(bit=0u;bit<8u;++bit){if(crc&1u)crc=(crc>>1)^0xEDB88320u;else crc>>=1;}}
 return crc^0xFFFFFFFFu;
}
int NU_PackageValidate(const uint8_t *data,size_t length,NU_PackageView *view) {
 uint32_t n,crc;
 if(!data||!view||length<16u)return 0;
 if(data[0]!='N'||data[1]!='U'||data[2]!='V'||data[3]!='M')return 0;
 if(data[4]!=NU_ABI_MAJOR||data[5]!=NU_ABI_MINOR||data[6]!=NU_GENERATION||data[7]!=0u)return 0;
 n=nu_read_u32(data+8u);crc=nu_read_u32(data+12u);
 if(!n||n>NU_PACKAGE_MAX_CODE||length!=(size_t)16u+(size_t)n)return 0;
 if(NU_CRC32(data+16u,(size_t)n)!=crc)return 0;
 view->code=data+16u;view->code_size=n;view->abi_major=data[4];view->abi_minor=data[5];view->generation=data[6];
 return 1;
}
void NU_VMInit(NU_VM *vm,const uint8_t *code,uint32_t size,uint32_t limit) {
 if(!vm)return;
 memset(vm,0,sizeof(*vm));vm->code=code;vm->code_size=size;vm->step_limit=limit?limit:100000u;
 if(!code||!size)vm->fault=1;
}
int NU_VMStep(NU_VM *v) {
 uint8_t op,a,b;uint16_t addr;uint32_t imm;
 if(!v||v->fault)return -1;
 if(v->halted)return 0;
 if(v->steps>=v->step_limit||v->ip>=v->code_size){v->fault=1;return -1;}
 op=v->code[v->ip++];++v->steps;
 switch(op){
 case 0x00:v->halted=1;return 0;
 case 0x01:
  if(v->ip+5u>v->code_size)break;
  a=v->code[v->ip++];imm=nu_read_u32(v->code+v->ip);v->ip+=4u;
  if(a>=NU_VM_REGISTER_COUNT)break;
  v->registers[a]=imm;return 1;
 case 0x02:case 0x03:case 0x04:case 0x05:
  if(v->ip+2u>v->code_size)break;
  a=v->code[v->ip++];b=v->code[v->ip++];
  if(a>=NU_VM_REGISTER_COUNT||b>=NU_VM_REGISTER_COUNT)break;
  if(op==0x02)v->registers[a]=v->registers[b];
  else if(op==0x03)v->registers[a]+=v->registers[b];
  else if(op==0x04)v->registers[a]-=v->registers[b];
  else v->registers[a]^=v->registers[b];
  return 1;
 case 0x06:case 0x07:
  if(v->ip+3u>v->code_size)break;
  a=v->code[v->ip++];addr=nu_read_u16(v->code+v->ip);v->ip+=2u;
  if(a>=NU_VM_REGISTER_COUNT||addr>=NU_VM_MEMORY_SIZE)break;
  if(op==0x06)v->memory[addr]=(uint8_t)(v->registers[a]&255u);
  else v->registers[a]=(uint32_t)v->memory[addr];
  return 1;
 case 0x08:
  if(v->ip+2u>v->code_size)break;
  addr=nu_read_u16(v->code+v->ip);
  if((uint32_t)addr>=v->code_size)break;
  v->ip=(uint32_t)addr;return 1;
 case 0x09:
  if(v->ip+3u>v->code_size)break;
  a=v->code[v->ip++];addr=nu_read_u16(v->code+v->ip);v->ip+=2u;
  if(a>=NU_VM_REGISTER_COUNT||(uint32_t)addr>=v->code_size)break;
  if(v->registers[a]==0u)v->ip=(uint32_t)addr;
  return 1;
 default:break;
 }
 v->fault=1;return -1;
}
