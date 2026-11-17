#include <assert.h>
#include <stdio.h>
#include "../nu-core/nuvm.h"
static nuvm_result run(const uint8_t *p,size_t n,uint32_t b,uint32_t s){
    nuvm_config c;c.abi_version=NUVM_ABI_VERSION;c.instruction_budget=b;c.stack_limit=s;return nuvm_execute(p,n,&c);
}
int main(void){
    static const uint8_t add[]={NU_OP_PUSH_I32,19,0,0,0,NU_OP_PUSH_I32,23,0,0,0,NU_OP_ADD,NU_OP_HALT};
    static const uint8_t under[]={NU_OP_ADD,NU_OP_HALT};
    static const uint8_t div0[]={NU_OP_PUSH_I32,1,0,0,0,NU_OP_PUSH_I32,0,0,0,0,NU_OP_DIV,NU_OP_HALT};
    static const uint8_t bad[]={255,NU_OP_HALT},trunc[]={NU_OP_PUSH_I32,1,2},nohalt[]={NU_OP_PUSH_I32,7,0,0,0};
    nuvm_result r;
    r=run(add,sizeof(add),32,16);assert(r.status==NU_OK&&r.result==42);
    r=run(under,sizeof(under),32,16);assert(r.status==NU_ERR_STACK_UNDERFLOW);
    r=run(div0,sizeof(div0),32,16);assert(r.status==NU_ERR_DIV_ZERO);
    r=run(bad,sizeof(bad),32,16);assert(r.status==NU_ERR_OPCODE);
    r=run(trunc,sizeof(trunc),32,16);assert(r.status==NU_ERR_TRUNCATED);
    r=run(add,sizeof(add),1,16);assert(r.status==NU_ERR_BUDGET);
    r=run(add,sizeof(add),32,1);assert(r.status==NU_ERR_STACK_OVERFLOW);
    r=run(nohalt,sizeof(nohalt),32,16);assert(r.status==NU_ERR_NO_HALT);
    puts("N.U VM tests: 8/8 passed");return 0;
}
