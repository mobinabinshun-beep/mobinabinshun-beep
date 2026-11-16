#include "nu_vm.h"
#include <stdio.h>
#include <string.h>
#include <stdlib.h>

static int write_module(const char *body) {
    FILE *f = fopen("nu_vm_test_module.tmp", "wb");
    size_t n;
    if (!f) return 0;
    n = fwrite(body, 1, strlen(body), f);
    fclose(f);
    return n == strlen(body);
}

int main(void) {
    NU_VM_PROGRAM program;
    const char *valid =
        "NUVM/1\nGENERATION=1\nHOST_API=1\nTITLE=Test\nTEXT=Hello\nEND\n";
    const char *unknown =
        "NUVM/1\nGENERATION=1\nHOST_API=1\nTITLE=Test\nEXEC=cmd.exe\nEND\n";
    int ok = 1;
    if (!write_module(valid) || !nu_vm_load("nu_vm_test_module.tmp", 1, 1, &program))
        ok = 0;
    if (ok && (strcmp(program.title, "Test") != 0 || program.text_count != 1))
        ok = 0;
    if (!write_module(valid) || nu_vm_load("nu_vm_test_module.tmp", 2, 1, &program))
        ok = 0;
    if (!write_module(unknown) || nu_vm_load("nu_vm_test_module.tmp", 1, 1, &program))
        ok = 0;
    remove("nu_vm_test_module.tmp");
    if (!ok) {
        fprintf(stderr, "NUVM/1 conformance test failed: %s\n", nu_vm_error());
        return 1;
    }
    puts("NUVM/1 conformance tests passed");
    return 0;
}
