#ifndef NU_VM_H
#define NU_VM_H

#define NU_VM_MAX_TEXT 16
#define NU_VM_TEXT_LENGTH 160

typedef struct NU_VM_PROGRAM {
    int generation;
    int host_api;
    int text_count;
    int ended;
    char title[96];
    char text[NU_VM_MAX_TEXT][NU_VM_TEXT_LENGTH];
} NU_VM_PROGRAM;

/* Loads a bounded, declarative N.U module. It never loads native code. */
int nu_vm_load(const char *path, int host_generation, int host_api, NU_VM_PROGRAM *out_program);
const char *nu_vm_error(void);

#endif
