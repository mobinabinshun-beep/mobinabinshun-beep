#ifndef NUVM_H
#define NUVM_H
#include <stddef.h>
#include <stdint.h>
#define NUVM_ABI_VERSION 1u
#define NUVM_MAX_STACK 256u
#define NUVM_MAX_PROGRAM 65536u
typedef enum { NU_OP_HALT=0, NU_OP_PUSH_I32=1, NU_OP_ADD=2, NU_OP_SUB=3, NU_OP_MUL=4, NU_OP_DIV=5, NU_OP_DUP=6, NU_OP_DROP=7 } nu_opcode;
typedef enum { NU_OK=0, NU_ERR_ARGUMENT, NU_ERR_PROGRAM_SIZE, NU_ERR_OPCODE, NU_ERR_TRUNCATED, NU_ERR_STACK_OVERFLOW, NU_ERR_STACK_UNDERFLOW, NU_ERR_DIV_ZERO, NU_ERR_BUDGET, NU_ERR_NO_HALT } nu_status;
typedef struct { uint32_t abi_version; uint32_t instruction_budget; uint32_t stack_limit; } nuvm_config;
typedef struct { nu_status status; uint32_t instructions_executed; uint32_t stack_depth; int32_t result; } nuvm_result;
nuvm_result nuvm_execute(const uint8_t *program, size_t length, const nuvm_config *config);
const char *nuvm_status_string(nu_status status);
#endif
