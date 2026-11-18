#include "nu_data_bundle.h"
#include <string.h>

#define NU_BUNDLE_PRODUCT_TAG 0x2e552e4eu /* little-endian bytes: N.U. */

static void nu_bundle_put32(uint8_t *p,uint32_t v){
 p[0]=(uint8_t)v;p[1]=(uint8_t)(v>>8);
 p[2]=(uint8_t)(v>>16);p[3]=(uint8_t)(v>>24);
}
static uint32_t nu_bundle_read32(const uint8_t *p){
 return (uint32_t)p[0]|((uint32_t)p[1]<<8)|
        ((uint32_t)p[2]<<16)|((uint32_t)p[3]<<24);
}
static int nu_bundle_class_valid(uint8_t c){
 return c>=NU_BUNDLE_SAVE&&c<=NU_BUNDLE_SETTINGS;
}
static int nu_bundle_id_length(const char *s,size_t *length){
 size_t n=0u;
 if(!s)return 0;
 while(n<NU_BUNDLE_ID_SIZE&&s[n]!='\0'){
  char ch=s[n];
  if(!((ch>='a'&&ch<='z')||(ch>='0'&&ch<='9')||
       ch=='.'||ch=='-'||ch=='_'))return 0;
  ++n;
 }
 if(n==0u||n>=NU_BUNDLE_ID_SIZE)return 0;
 if(n>=2u&&s[0]=='.'&&s[1]=='.')return 0;
 *length=n;return 1;
}
static int nu_bundle_duplicate(const NU_BundleEntry *e,size_t index){
 size_t i;
 for(i=0u;i<index;++i)
  if(e[i].data_class==e[index].data_class&&
     strcmp(e[i].id,e[index].id)==0)return 1;
 return 0;
}
size_t NU_BundleBuild(const NU_BundleEntry *entries,size_t count,
                      uint8_t *out,size_t capacity){
 size_t i,total=NU_BUNDLE_HEADER_SIZE,pos,id_length;
 uint32_t payload_crc;
 if(!entries||!out||count==0u||count>NU_BUNDLE_MAX_ENTRIES)return 0u;
 for(i=0u;i<count;++i){
  if(!nu_bundle_class_valid(entries[i].data_class)||
     !nu_bundle_id_length(entries[i].id,&id_length)||
     entries[i].schema_major==0u||
     (!entries[i].data&&entries[i].size!=0u)||
     entries[i].size>NU_BUNDLE_MAX_ENTRY_SIZE||
     nu_bundle_duplicate(entries,i))return 0u;
  if(total>NU_BUNDLE_MAX_SIZE-NU_BUNDLE_ENTRY_HEADER_SIZE-id_length||
     entries[i].size>NU_BUNDLE_MAX_SIZE-total-
       NU_BUNDLE_ENTRY_HEADER_SIZE-id_length)return 0u;
  total+=NU_BUNDLE_ENTRY_HEADER_SIZE+id_length+entries[i].size;
 }
 if(capacity<total)return 0u;
 out[0]='N';out[1]='U';out[2]='D';out[3]='B';
 out[4]=1u;out[5]=0u;out[6]=(uint8_t)count;out[7]=0u;
 nu_bundle_put32(out+8u,(uint32_t)(total-NU_BUNDLE_HEADER_SIZE));
 nu_bundle_put32(out+12u,0u);
 nu_bundle_put32(out+16u,NU_BUNDLE_PRODUCT_TAG);
 pos=NU_BUNDLE_HEADER_SIZE;
 for(i=0u;i<count;++i){
  nu_bundle_id_length(entries[i].id,&id_length);
  out[pos]=entries[i].data_class;out[pos+1u]=(uint8_t)id_length;
  out[pos+2u]=entries[i].schema_major;out[pos+3u]=entries[i].schema_minor;
  nu_bundle_put32(out+pos+4u,entries[i].size);
  nu_bundle_put32(out+pos+8u,
      NU_CRC32(entries[i].data,(size_t)entries[i].size));
  pos+=NU_BUNDLE_ENTRY_HEADER_SIZE;
  memcpy(out+pos,entries[i].id,id_length);pos+=id_length;
  if(entries[i].size){
   memcpy(out+pos,entries[i].data,(size_t)entries[i].size);
   pos+=(size_t)entries[i].size;
  }
 }
 payload_crc=NU_CRC32(out+NU_BUNDLE_HEADER_SIZE,
                      total-NU_BUNDLE_HEADER_SIZE);
 nu_bundle_put32(out+12u,payload_crc);
 return total;
}
int NU_BundleParse(const uint8_t *data,size_t length,NU_BundleView *view){
 NU_BundleView parsed;size_t pos,i,j,id_length;uint32_t payload_size;
 uint32_t entry_size,entry_crc;
 if(!data||!view||length<NU_BUNDLE_HEADER_SIZE||
    length>NU_BUNDLE_MAX_SIZE)return 0;
 if(data[0]!='N'||data[1]!='U'||data[2]!='D'||data[3]!='B'||
    data[4]!=1u||data[5]!=0u||data[7]!=0u||
    data[6]==0u||data[6]>NU_BUNDLE_MAX_ENTRIES||
    nu_bundle_read32(data+16u)!=NU_BUNDLE_PRODUCT_TAG)return 0;
 payload_size=nu_bundle_read32(data+8u);
 if((size_t)payload_size!=length-NU_BUNDLE_HEADER_SIZE||
    NU_CRC32(data+NU_BUNDLE_HEADER_SIZE,(size_t)payload_size)!=
       nu_bundle_read32(data+12u))return 0;
 memset(&parsed,0,sizeof(parsed));parsed.count=(size_t)data[6];
 pos=NU_BUNDLE_HEADER_SIZE;
 for(i=0u;i<parsed.count;++i){
  NU_BundleEntry *entry=&parsed.entries[i];
  if(pos>length||length-pos<NU_BUNDLE_ENTRY_HEADER_SIZE)return 0;
  entry->data_class=data[pos];id_length=(size_t)data[pos+1u];
  if(!nu_bundle_class_valid(entry->data_class)||id_length==0u||
     id_length>=NU_BUNDLE_ID_SIZE||data[pos+2u]==0u)return 0;
  entry->schema_major=data[pos+2u];entry->schema_minor=data[pos+3u];
  entry_size=nu_bundle_read32(data+pos+4u);
  entry_crc=nu_bundle_read32(data+pos+8u);
  pos+=NU_BUNDLE_ENTRY_HEADER_SIZE;
  if(id_length>length-pos)return 0;
  for(j=0u;j<id_length;++j){
   uint8_t ch=data[pos+j];
   if(!((ch>=(uint8_t)'a'&&ch<=(uint8_t)'z')||
        (ch>=(uint8_t)'0'&&ch<=(uint8_t)'9')||
        ch==(uint8_t)'.'||ch==(uint8_t)'-'||ch==(uint8_t)'_'))return 0;
   entry->id[j]=(char)ch;
  }
  entry->id[id_length]='\0';
  if(id_length>=2u&&entry->id[0]=='.'&&entry->id[1]=='.')return 0;
  pos+=id_length;
  if(entry_size>NU_BUNDLE_MAX_ENTRY_SIZE||
     (size_t)entry_size>length-pos)return 0;
  entry->data=data+pos;entry->size=entry_size;
  if(NU_CRC32(entry->data,(size_t)entry->size)!=entry_crc)return 0;
  pos+=(size_t)entry->size;
  for(j=0u;j<i;++j)
   if(parsed.entries[j].data_class==entry->data_class&&
      strcmp(parsed.entries[j].id,entry->id)==0)return 0;
 }
 if(pos!=length)return 0;
 *view=parsed;return 1;
}
