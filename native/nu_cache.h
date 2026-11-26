#ifndef NU_CACHE_H
#define NU_CACHE_H
#include <stddef.h>
#include <stdint.h>
#include <stdio.h>
#define NU_CACHE_MAX_CHUNK (64u * 1024u)
typedef struct NU_DiskCache {
 FILE *file;
 char path[260];
 uint64_t disk_limit_bytes;
 uint64_t write_offset;
 uint64_t read_offset;
 uint32_t queued_items;
} NU_DiskCache;
int NU_CacheInit(NU_DiskCache *cache, const char *path, uint64_t disk_limit_bytes);
int NU_CachePush(NU_DiskCache *cache, const uint8_t *data, uint32_t length);
int NU_CachePop(NU_DiskCache *cache, uint8_t *buffer, uint32_t capacity, uint32_t *length);
/* Stage a file as <=64 KiB CRC-protected records; returns bytes staged, zero on failure. */
uint64_t NU_CacheStageFile(NU_DiskCache *cache, const char *source_path);
/* Drain records in order into one caller-owned module buffer. */
int NU_CacheLoadAll(NU_DiskCache *cache, uint8_t *output, uint32_t capacity, uint32_t *length);
void NU_CacheClear(NU_DiskCache *cache);
#endif
