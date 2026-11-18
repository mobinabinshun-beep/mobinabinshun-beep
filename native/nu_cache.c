#include "nu_cache.h"
#include "nu_runtime.h"
#include <string.h>
#include <limits.h>
#include <stdlib.h>
static void nu_cache_put32(uint8_t *p, uint32_t v) {
 p[0]=(uint8_t)v; p[1]=(uint8_t)(v>>8); p[2]=(uint8_t)(v>>16); p[3]=(uint8_t)(v>>24);
}
static uint32_t nu_cache_get32(const uint8_t *p) {
 return (uint32_t)p[0] | ((uint32_t)p[1]<<8) | ((uint32_t)p[2]<<16) | ((uint32_t)p[3]<<24);
}
static int nu_cache_open(NU_DiskCache *c) {
 if(c->file)return 1;
 c->file=fopen(c->path,"w+b");
 return c->file!=NULL;
}
int NU_CacheInit(NU_DiskCache *c,const char *path,uint64_t limit) {
 size_t n;
 if(!c||!path||!limit)return 0;
 n=strlen(path);
 if(n==0u||n>=sizeof(c->path))return 0;
 memset(c,0,sizeof(*c));
 memcpy(c->path,path,n+1u);
 c->disk_limit_bytes=limit;
 return 1;
}
int NU_CachePush(NU_DiskCache *c,const uint8_t *data,uint32_t length) {
 uint8_t header[8];
 uint64_t record_size;
 if(!c||!data||!length||length>NU_CACHE_MAX_CHUNK)return 0;
 record_size=(uint64_t)length+8u;
 if(record_size>c->disk_limit_bytes-c->write_offset)return 0;
 if(!nu_cache_open(c))return 0;
 if(fseek(c->file,0L,SEEK_END)!=0)return 0;
 nu_cache_put32(header,length);
 nu_cache_put32(header+4u,NU_CRC32(data,(size_t)length));
 if(fwrite(header,1u,8u,c->file)!=8u)return 0;
 if(fwrite(data,1u,(size_t)length,c->file)!=(size_t)length)return 0;
 if(fflush(c->file)!=0)return 0;
 c->write_offset+=record_size;
 ++c->queued_items;
 return 1;
}
int NU_CachePop(NU_DiskCache *c,uint8_t *buffer,uint32_t capacity,uint32_t *length) {
 uint8_t header[8];
 uint32_t n,crc;
 if(length)*length=0u;
 if(!c||!buffer||!length)return -1;
 if(!c->queued_items||!c->file)return 0;
 if(c->read_offset>(uint64_t)LONG_MAX||fseek(c->file,(long)c->read_offset,SEEK_SET)!=0)return -1;
 if(fread(header,1u,8u,c->file)!=8u)return -1;
 n=nu_cache_get32(header);crc=nu_cache_get32(header+4u);
 if(!n||n>NU_CACHE_MAX_CHUNK)return -3;
 if(n>capacity)return -2;
 if(fread(buffer,1u,(size_t)n,c->file)!=(size_t)n)return -1;
 if(NU_CRC32(buffer,(size_t)n)!=crc)return -3;
 c->read_offset+=(uint64_t)n+8u;
 --c->queued_items;
 *length=n;
 if(!c->queued_items) {
  fclose(c->file); c->file=NULL;
  if(remove(c->path)!=0)return -1;
  c->read_offset=0u; c->write_offset=0u;
 }
 return 1;
}
void NU_CacheClear(NU_DiskCache *c) {
 if(!c)return;
 if(c->file){fclose(c->file);c->file=NULL;}
 if(c->path[0])remove(c->path);
 c->read_offset=0u;c->write_offset=0u;c->queued_items=0u;
}

uint64_t NU_CacheStageFile(NU_DiskCache *c,const char *source_path) {
 FILE *source;uint8_t chunk[NU_CACHE_MAX_CHUNK];size_t n;uint64_t total=0u;
 if(!c||!source_path)return 0u;
 source=fopen(source_path,"rb");if(!source)return 0u;
 while((n=fread(chunk,1u,sizeof(chunk),source))>0u){
  if(!NU_CachePush(c,chunk,(uint32_t)n)){fclose(source);NU_CacheClear(c);return 0u;}
  total+=(uint64_t)n;
 }
 { int read_error=ferror(source);int close_error=fclose(source);if(read_error||close_error||!total){NU_CacheClear(c);return 0u;} }
 return total;
}
int NU_CacheLoadAll(NU_DiskCache *c,uint8_t *output,uint32_t capacity,uint32_t *length) {
 uint32_t used=0u,n=0u;int result;
 if(length)*length=0u;
 if(!c||!output||!length)return -1;
 while(c->queued_items){
  if(used>=capacity)return -2;
  result=NU_CachePop(c,output+used,capacity-used,&n);
  if(result!=1)return result;
  if(n>capacity-used)return -2;
  used+=n;
 }
 *length=used;return used?1:0;
}
