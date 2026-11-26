#ifndef NU_TRANSLATOR_H
#define NU_TRANSLATOR_H
#include <stdint.h>
#include <stddef.h>
#define NU_IR_LOAD_IMM 1u
#define NU_IR_MOVE 2u
#define NU_IR_ADD 3u
#define NU_IR_SUB 4u
#define NU_IR_XOR 5u
#define NU_IR_STORE8 6u
#define NU_IR_LOAD8 7u
#define NU_IR_JUMP 8u
#define NU_IR_JUMP_ZERO 9u
#define NU_IR_HALT 10u
typedef struct NU_IRInstruction {
 uint8_t operation;
 uint8_t a;
 uint8_t b;
 uint16_t address;
 uint32_t immediate;
} NU_IRInstruction;
/* Returns emitted byte count; zero means invalid input or insufficient output. */
size_t NU_TranslateGen1(const NU_IRInstruction *ir,size_t count,uint8_t *output,size_t capacity);
#endif
