#ifndef NU_RUNTIME_H
#define NU_RUNTIME_H
#include <stddef.h>
#if defined(_MSC_VER) && _MSC_VER < 1600
typedef unsigned char uint8_t;
typedef unsigned short uint16_t;
typedef unsigned long uint32_t;
typedef unsigned __int64 uint64_t;
#else
#include <stdint.h>
#endif
#define NU_ABI_MAJOR 1u
#define NU_ABI_MINOR 0u
#define NU_GENERATION 1u
#define NU_PACKAGE_MAX_CODE (1024u * 1024u)
#define NU_VM_MEMORY_SIZE 4096u
#define NU_VM_REGISTER_COUNT 8u
#define NU_DEFAULT_RAM_CAP (250u * 1024u * 1024u)
#define NU_DEFAULT_DISK_CACHE (1024u * 1024u * 1024u)
typedef struct NU_Budget {
 uint64_t ram_limit_bytes, shared_cache_bytes, disk_cache_limit_bytes;
 uint64_t short_cache_bytes, pattern_cache_bytes;\n uint64_t ram_reserved_bytes;
 uint32_t cpu_slot_numerator, cpu_slot_denominator;
 uint32_t render_width, render_height, target_fps, logical_processors;
} NU_Budget;
typedef struct NU_PackageView {
 const uint8_t *code; uint32_t code_size;
 uint8_t generation, abi_major, abi_minor;
} NU_PackageView;
typedef struct NU_VM {
 uint32_t registers[NU_VM_REGISTER_COUNT];
 uint8_t memory[NU_VM_MEMORY_SIZE];
 const uint8_t *code; uint32_t code_size, ip, steps, step_limit;
 int halted, fault;
} NU_VM;
void NU_BudgetInit(NU_Budget *, uint64_t, uint64_t, uint32_t);\nint NU_BudgetReserve(NU_Budget *, uint64_t);\nvoid NU_BudgetRelease(NU_Budget *, uint64_t);
int NU_SchedulerGrantSlot(uint32_t);
int NU_SchedulerGrantGpuSlot(uint32_t);
uint32_t NU_CRC32(const uint8_t *, size_t);
int NU_PackageValidate(const uint8_t *, size_t, NU_PackageView *);
void NU_VMInit(NU_VM *, const uint8_t *, uint32_t, uint32_t);
int NU_VMStep(NU_VM *);
#endif
