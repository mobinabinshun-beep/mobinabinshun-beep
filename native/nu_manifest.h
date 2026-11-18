#ifndef NU_MANIFEST_H
#define NU_MANIFEST_H
#include <stddef.h>
#include <stdint.h>
#define NU_MANIFEST_MAX_SIZE 2048u
#define NU_MANIFEST_ID_SIZE 64u
#define NU_MANIFEST_PACKAGE_SIZE 128u
#define NU_MANIFEST_KEY_ID_SIZE 64u
#define NU_MANIFEST_SIGNATURE_SIZE 513u
typedef struct NU_Manifest {
 char id[NU_MANIFEST_ID_SIZE];
 char package[NU_MANIFEST_PACKAGE_SIZE];
 char sha256_hex[65];
 char key_id[NU_MANIFEST_KEY_ID_SIZE];
 char signature[NU_MANIFEST_SIGNATURE_SIZE];
 uint32_t generation;
 uint32_t abi_major;
 uint32_t abi_minor;
 uint32_t package_size;
} NU_Manifest;
/* Strict canonical ASCII parser. Input must end with LF and contain no CR/NUL. */
int NU_ManifestParse(const uint8_t *text, size_t length, NU_Manifest *manifest);
/* A platform crypto provider must verify SHA-256 and the detached publisher signature. */
typedef int (*NU_ManifestVerifyProvider)(const NU_Manifest *, const uint8_t *, size_t, void *);
/* Fails closed when no provider exists, or for unsigned development manifests. */
int NU_ManifestVerify(const NU_Manifest *, const uint8_t *, size_t,
                      NU_ManifestVerifyProvider, void *);
#endif
