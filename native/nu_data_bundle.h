#ifndef NU_DATA_BUNDLE_H
#define NU_DATA_BUNDLE_H
#include <stddef.h>
#include "nu_runtime.h"

#define NU_BUNDLE_MAX_ENTRIES 32u
#define NU_BUNDLE_ID_SIZE 64u
#define NU_BUNDLE_MAX_ENTRY_SIZE (16u * 1024u * 1024u)
#define NU_BUNDLE_MAX_SIZE (64u * 1024u * 1024u)
#define NU_BUNDLE_HEADER_SIZE 20u
#define NU_BUNDLE_ENTRY_HEADER_SIZE 12u

typedef enum NU_BundleDataClass {
 NU_BUNDLE_SAVE=1,
 NU_BUNDLE_WALLET=2,
 NU_BUNDLE_PROFILE=3,
 NU_BUNDLE_ASSET=4,
 NU_BUNDLE_SETTINGS=5
} NU_BundleDataClass;

typedef struct NU_BundleEntry {
 uint8_t data_class;
 char id[NU_BUNDLE_ID_SIZE];
 const uint8_t *data;
 uint32_t size;
} NU_BundleEntry;

typedef struct NU_BundleView {
 size_t count;
 NU_BundleEntry entries[NU_BUNDLE_MAX_ENTRIES];
} NU_BundleView;

/* Builds a non-executable user-data bundle. CRC32 detects corruption only. */
size_t NU_BundleBuild(const NU_BundleEntry *, size_t, uint8_t *, size_t);
/* Validates the complete bundle before exposing any entry pointers. */
int NU_BundleParse(const uint8_t *, size_t, NU_BundleView *);

#endif
