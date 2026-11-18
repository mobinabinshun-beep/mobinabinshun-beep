#include "nu_package.h"
#include "nu_runtime.h"
static void nu_package_put16(uint8_t *p,uint16_t v){
 p[0]=(uint8_t)v;p[1]=(uint8_t)(v>>8);
}
static void nu_package_put32(uint8_t *p,uint32_t v){
 p[0]=(uint8_t)v;p[1]=(uint8_t)(v>>8);
 p[2]=(uint8_t)(v>>16);p[3]=(uint8_t)(v>>24);
}
size_t NU_PackageBuild(const uint8_t *code,size_t size,uint8_t *out,size_t capacity){
 size_t total;
 if(!code||!out||!size||size>(size_t)NU_PACKAGE_MAX_CODE)return 0u;
 total=(size_t)NU_PACKAGE_HEADER_SIZE+size;
 if(capacity<total)return 0u;
 out[0]='N';out[1]='U';out[2]='P';out[3]='K';
 out[4]=(uint8_t)NU_PACKAGE_CONTAINER_MAJOR;
 out[5]=(uint8_t)NU_PACKAGE_CONTAINER_MINOR;
 out[6]=(uint8_t)NU_GENERATION;out[7]=0u;
 nu_package_put16(out+8u,(uint16_t)NU_ABI_MAJOR);
 nu_package_put16(out+10u,(uint16_t)NU_ABI_MINOR);
 nu_package_put32(out+12u,(uint32_t)size);
 nu_package_put32(out+16u,NU_CRC32(code,size));
 {
  size_t i;for(i=0u;i<size;++i)out[NU_PACKAGE_HEADER_SIZE+i]=code[i];
 }
 return total;
}
