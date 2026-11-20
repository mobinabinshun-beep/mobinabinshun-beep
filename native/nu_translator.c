#include "nu_translator.h"
#include "nu_runtime.h"
static void nu_put16(uint8_t *p,uint16_t v){p[0]=(uint8_t)v;p[1]=(uint8_t)(v>>8);}
static void nu_put32(uint8_t *p,uint32_t v){p[0]=(uint8_t)v;p[1]=(uint8_t)(v>>8);p[2]=(uint8_t)(v>>16);p[3]=(uint8_t)(v>>24);}
size_t NU_TranslateGen1(const NU_IRInstruction *ir,size_t count,uint8_t *out,size_t cap){
 size_t i,pos=0u,need;uint8_t op;
 if(!ir||!out||!count||count>NU_PACKAGE_MAX_CODE)return 0u;
 for(i=0u;i<count;++i){
  op=ir[i].operation;
  if(op==NU_IR_LOAD_IMM)need=6u;
  else if(op>=NU_IR_MOVE&&op<=NU_IR_XOR)need=3u;
  else if(op==NU_IR_STORE8||op==NU_IR_LOAD8||op==NU_IR_JUMP_ZERO)need=4u;
  else if(op==NU_IR_JUMP)need=3u;
  else if(op==NU_IR_HALT)need=1u;
  else return 0u;
  if(pos>cap||need>cap-pos)return 0u;
  if(op==NU_IR_LOAD_IMM){
   if(ir[i].a>=NU_VM_REGISTER_COUNT)return 0u;
   out[pos++]=0x01u;out[pos++]=ir[i].a;nu_put32(out+pos,ir[i].immediate);pos+=4u;
  }else if(op>=NU_IR_MOVE&&op<=NU_IR_XOR){
   if(ir[i].a>=NU_VM_REGISTER_COUNT||ir[i].b>=NU_VM_REGISTER_COUNT)return 0u;
   out[pos++]=op;out[pos++]=ir[i].a;out[pos++]=ir[i].b;
  }else if(op==NU_IR_STORE8||op==NU_IR_LOAD8){
   if(ir[i].a>=NU_VM_REGISTER_COUNT||ir[i].address>=NU_VM_MEMORY_SIZE)return 0u;
   out[pos++]=op;out[pos++]=ir[i].a;nu_put16(out+pos,ir[i].address);pos+=2u;
  }else if(op==NU_IR_JUMP){
   out[pos++]=0x08u;nu_put16(out+pos,ir[i].address);pos+=2u;
  }else if(op==NU_IR_JUMP_ZERO){
   if(ir[i].a>=NU_VM_REGISTER_COUNT)return 0u;
   out[pos++]=0x09u;out[pos++]=ir[i].a;nu_put16(out+pos,ir[i].address);pos+=2u;
  }else out[pos++]=0x00u;
 }
 return pos;
}
