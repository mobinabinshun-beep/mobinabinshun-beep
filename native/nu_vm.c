#include "nu_vm.h"
#include <stdio.h>
#include <string.h>
#include <ctype.h>

#define NU_VM_MAX_FILE 16384
#define NU_VM_MAX_LINE 192

static char g_error[160] = "No error";

static void set_error(const char *message) {
    strncpy(g_error, message, sizeof(g_error) - 1);
    g_error[sizeof(g_error) - 1] = 0;
}

const char *nu_vm_error(void) {
    return g_error;
}

static int copy_value(char *target, size_t capacity, const char *value) {
    size_t n = strlen(value);
    if (n == 0 || n >= capacity) return 0;
    memcpy(target, value, n + 1);
    return 1;
}

int nu_vm_load(const char *path, int host_generation, int host_api, NU_VM_PROGRAM *out_program) {
    FILE *file;
    char data[NU_VM_MAX_FILE + 1];
    size_t length;
    char *line;
    int first = 1;
    int have_generation = 0;
    int have_api = 0;
    int have_title = 0;
    int ended = 0;

    if (!path || !out_program) {
        set_error("Invalid loader arguments");
        return 0;
    }

    memset(out_program, 0, sizeof(*out_program));
    file = fopen(path, "rb");
    if (!file) {
        set_error("Module file could not be opened");
        return 0;
    }

    length = fread(data, 1, NU_VM_MAX_FILE + 1, file);
    fclose(file);
    if (length == 0 || length > NU_VM_MAX_FILE) {
        set_error("Module size is empty or exceeds 16 KiB");
        return 0;
    }
    data[length] = 0;

    line = data;
    while (*line) {
        char *end = strchr(line, '\n');
        size_t n;
        if (end) *end = 0;
        n = strlen(line);
        if (n && line[n - 1] == '\r') line[n - 1] = 0;
        if (strlen(line) >= NU_VM_MAX_LINE) {
            set_error("Module instruction exceeds line limit");
            return 0;
        }

        if (first) {
            if (strcmp(line, "NUVM/1") != 0) {
                set_error("Unsupported module bytecode header");
                return 0;
            }
            first = 0;
        } else if (line[0] == 0 || line[0] == '#') {
            /* Blank lines and comments are inert. */
        } else if (strncmp(line, "GENERATION=", 11) == 0) {
            out_program->generation = atoi(line + 11);
            have_generation = 1;
        } else if (strncmp(line, "HOST_API=", 9) == 0) {
            out_program->host_api = atoi(line + 9);
            have_api = 1;
        } else if (strncmp(line, "TITLE=", 6) == 0) {
            if (!copy_value(out_program->title, sizeof(out_program->title), line + 6)) {
                set_error("Invalid module title");
                return 0;
            }
            have_title = 1;
        } else if (strncmp(line, "TEXT=", 5) == 0) {
            if (out_program->text_count >= NU_VM_MAX_TEXT ||
                !copy_value(out_program->text[out_program->text_count],
                            sizeof(out_program->text[0]), line + 5)) {
                set_error("Invalid or excessive TEXT instruction");
                return 0;
            }
            out_program->text_count++;
        } else if (strcmp(line, "END") == 0) {
            ended = 1;
            break;
        } else {
            set_error("Unknown instruction; module rejected");
            return 0;
        }

        if (!end) break;
        line = end + 1;
    }

    if (first || !ended || !have_generation || !have_api || !have_title) {
        set_error("Module is incomplete or missing END");
        return 0;
    }
    if (out_program->generation != host_generation) {
        set_error("No translator is registered for this module generation");
        return 0;
    }
    if (out_program->host_api > host_api || out_program->host_api < 1) {
        set_error("Module requires an unsupported host API");
        return 0;
    }
    out_program->ended = 1;
    set_error("OK");
    return 1;
}
