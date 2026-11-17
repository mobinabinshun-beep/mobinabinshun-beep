#include "nuvm.h"
static int32_t read_i32_le(const uint8_t *p) {
    uint32_t v=(uint32_t)p[0]|((uint32_t)p[1]<<8)|((uint32_t)p[2]<<16)|((uint32_t)p[3]<<24);
    return (int32_t)v;
}
nuvm_result nuvm_execute(const uint8_t *program,size_t length,const nuvm_config *config) {
    int32_t stack[NUVM_MAX_STACK]; uint32_t sp=0u,steps=0u,limit,budget; size_t pc=0u; nuvm_result out;
    out.status=NU_ERR_ARGUMENT; out.instructions_executed=0u; out.stack_depth=0u; out.result=0;
    if(program==0||config==0||config->abi_version!=NUVM_ABI_VERSION) return out;
    if(length==0u||length>NUVM_MAX_PROGRAM){out.status=NU_ERR_PROGRAM_SIZE;return out;}
    budget=config->instruction_budget; limit=config->stack_limit;
    if(budget==0u||limit==0u||limit>NUVM_MAX_STACK) return out;
    while(pc<length) {
        uint8_t op; int32_t a,b;
        if(steps>=budget){out.status=NU_ERR_BUDGET;break;}
        op=program[pc++]; ++steps;
        if(op==NU_OP_HALT){out.status=NU_OK;break;}
        if(op==NU_OP_PUSH_I32){
            if(length-pc<4u){out.status=NU_ERR_TRUNCATED;break;}
            if(sp>=limit){out.status=NU_ERR_STACK_OVERFLOW;break;}
            stack[sp++]=read_i32_le(program+pc); pc+=4u;
        } else if(op==NU_OP_DUP){
            if(sp==0u){out.status=NU_ERR_STACK_UNDERFLOW;break;}
            if(sp>=limit){out.status=NU_ERR_STACK_OVERFLOW;break;}
            stack[sp]=stack[sp-1u]; ++sp;
        } else if(op==NU_OP_DROP){
            if(sp==0u){out.status=NU_ERR_STACK_UNDERFLOW;break;} --sp;
        } else if(op==NU_OP_ADD||op==NU_OP_SUB||op==NU_OP_MUL||op==NU_OP_DIV){
            if(sp<2u){out.status=NU_ERR_STACK_UNDERFLOW;break;}
            b=stack[--sp]; a=stack[--sp];
            if(op==NU_OP_ADD) stack[sp++]=(int32_t)((uint32_t)a+(uint32_t)b);
            else if(op==NU_OP_SUB) stack[sp++]=(int32_t)((uint32_t)a-(uint32_t)b);
            else if(op==NU_OP_MUL) stack[sp++]=(int32_t)((uint32_t)a*(uint32_t)b);
            else { if(b==0){out.status=NU_ERR_DIV_ZERO;break;}
                if(a==(-2147483647-1)&&b==-1) stack[sp++]=a; else stack[sp++]=a/b; }
        } else {out.status=NU_ERR_OPCODE;break;}
    }
    if(out.status==NU_ERR_ARGUMENT) out.status=NU_ERR_NO_HALT;
    out.instructions_executed=steps; out.stack_depth=sp; if(sp!=0u) out.result=stack[sp-1u];
    return out;
}
const char *nuvm_status_string(nu_status s) {
    switch(s){
    case NU_OK:return "ok"; case NU_ERR_ARGUMENT:return "invalid argument or ABI";
    case NU_ERR_PROGRAM_SIZE:return "invalid program size"; case NU_ERR_OPCODE:return "unknown opcode";
    case NU_ERR_TRUNCATED:return "truncated immediate"; case NU_ERR_STACK_OVERFLOW:return "stack limit exceeded";
    case NU_ERR_STACK_UNDERFLOW:return "stack underflow"; case NU_ERR_DIV_ZERO:return "division by zero";
    case NU_ERR_BUDGET:return "instruction budget exceeded"; case NU_ERR_NO_HALT:return "program ended without HALT";
    default:return "unknown status"; }
}
