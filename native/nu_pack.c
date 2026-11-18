#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include "nu_package.h"
#include "nu_runtime.h"
int main(int argc,char **argv){
 FILE *in,*out;long end;size_t n,total;uint8_t *code,*package;
 if(argc!=3){fprintf(stderr,"usage: nu_pack input.bytecode output.nup\n");return 2;}
 in=fopen(argv[1],"rb");if(!in){perror("input");return 1;}
 if(fseek(in,0L,SEEK_END)!=0||(end=ftell(in))<=0L||(unsigned long)end>NU_PACKAGE_MAX_CODE||fseek(in,0L,SEEK_SET)!=0){fclose(in);fprintf(stderr,"input size invalid (1..1 MiB required)\n");return 1;}
 n=(size_t)end;code=(uint8_t*)malloc(n);package=(uint8_t*)malloc(n+16u);
 if(!code||!package){free(code);free(package);fclose(in);fprintf(stderr,"out of memory\n");return 1;}
 if(fread(code,1u,n,in)!=n){free(code);free(package);fclose(in);fprintf(stderr,"input read failed\n");return 1;}
 fclose(in);total=NU_PackageBuild(code,n,package,n+16u);free(code);
 if(!total){free(package);fprintf(stderr,"package build rejected\n");return 1;}
 out=fopen(argv[2],"wb");if(!out){free(package);perror("output");return 1;}
 if(fwrite(package,1u,total,out)!=total||fclose(out)!=0){free(package);fprintf(stderr,"output write failed\n");return 1;}
 free(package);
 printf("N.U Generation 1 package created: %lu bytes (unsigned; CRC32 only)\n",(unsigned long)total);
 return 0;
}
