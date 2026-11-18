#include "nu_manifest.h"
#include <string.h>
#include <limits.h>
static int nu_digit(char c) { return c >= '0' && c <= '9'; }
static int nu_lower(char c) { return c >= 'a' && c <= 'z'; }
static int nu_hex(char c) { return nu_digit(c) || (c >= 'a' && c <= 'f'); }
static int nu_id_char(char c) { return nu_lower(c) || nu_digit(c) || c == '-' || c == '.'; }
static int nu_file_char(char c) {
 return (c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z') ||
        nu_digit(c) || c == '.' || c == '_' || c == '-';
}
static int nu_key_char(char c) { return nu_id_char(c) || c == '_'; }
static int nu_copy_value(char *dst, size_t cap, const char *src, size_t n) {
 if (!n || n >= cap) return 0;
 memcpy(dst, src, n); dst[n] = '\0'; return 1;
}
static int nu_parse_u32(const char *s, size_t n, uint32_t *out) {
 size_t i; uint32_t v = 0u;
 if (!n || (n > 1u && s[0] == '0')) return 0;
 for (i = 0u; i < n; ++i) {
  uint32_t d;
  if (!nu_digit(s[i])) return 0;
  d = (uint32_t)(s[i] - '0');
  if (v > (UINT32_MAX - d) / 10u) return 0;
  v = v * 10u + d;
 }
 *out = v; return 1;
}
static int nu_line(const uint8_t *p, size_t n, size_t *pos,
                   const char *prefix, const char **value, size_t *value_len) {
 size_t start = *pos, end = start, plen = strlen(prefix);
 while (end < n && p[end] != (uint8_t)'\n') {
  if (p[end] == 0u || p[end] == (uint8_t)'\r' || p[end] > 0x7fu) return 0;
  ++end;
 }
 if (end >= n || end - start < plen || memcmp(p + start, prefix, plen) != 0) return 0;
 *value = (const char *)(p + start + plen);
 *value_len = end - start - plen;
 *pos = end + 1u;
 return 1;
}
int NU_ManifestParse(const uint8_t *text, size_t length, NU_Manifest *m) {
 size_t pos = 0u, n, i; const char *v; size_t vn;
 if (!text || !m || !length || length > NU_MANIFEST_MAX_SIZE ||
     text[length - 1u] != (uint8_t)'\n') return 0;
 memset(m, 0, sizeof(*m));
 if (!nu_line(text, length, &pos, "", &v, &vn) ||
     vn != 13u || memcmp(v, "NU-MANIFEST/1", 13u) != 0) return 0;
 if (!nu_line(text, length, &pos, "id=", &v, &vn) ||
     !nu_copy_value(m->id, sizeof(m->id), v, vn)) return 0;
 if (!nu_lower(m->id[0]) && !nu_digit(m->id[0])) return 0;
 for (i = 0u; i < vn; ++i) if (!nu_id_char(m->id[i])) return 0;
 if (!nu_line(text, length, &pos, "generation=", &v, &vn) ||
     !nu_parse_u32(v, vn, &m->generation) || m->generation != 1u) return 0;
 if (!nu_line(text, length, &pos, "abi=", &v, &vn)) return 0;
 for (n = 0u; n < vn && v[n] != '.'; ++n) {}
 if (n == vn || !nu_parse_u32(v, n, &m->abi_major) ||
     !nu_parse_u32(v + n + 1u, vn - n - 1u, &m->abi_minor) ||
     m->abi_major != 1u || m->abi_minor > 0u) return 0;
 if (!nu_line(text, length, &pos, "package=", &v, &vn) ||
     !nu_copy_value(m->package, sizeof(m->package), v, vn)) return 0;
 for (i = 0u; i < vn; ++i) if (!nu_file_char(m->package[i])) return 0;
 if (strstr(m->package, "..") != NULL || vn < 5u ||
     strcmp(m->package + vn - 4u, ".nup") != 0) return 0;
 if (!nu_line(text, length, &pos, "package_size=", &v, &vn) ||
     !nu_parse_u32(v, vn, &m->package_size) ||
     m->package_size < 17u || m->package_size > 1048592u) return 0;
 if (!nu_line(text, length, &pos, "sha256=", &v, &vn) || vn != 64u) return 0;
 for (i = 0u; i < vn; ++i) if (!nu_hex(v[i])) return 0;
 if (!nu_copy_value(m->sha256_hex, sizeof(m->sha256_hex), v, vn)) return 0;
 if (!nu_line(text, length, &pos, "key_id=", &v, &vn) ||
     !nu_copy_value(m->key_id, sizeof(m->key_id), v, vn)) return 0;
 if (strcmp(m->key_id, "none") != 0)
  for (i = 0u; i < vn; ++i) if (!nu_key_char(m->key_id[i])) return 0;
 if (!nu_line(text, length, &pos, "signature=", &v, &vn) ||
     !nu_copy_value(m->signature, sizeof(m->signature), v, vn)) return 0;
 if (strcmp(m->signature, "unsigned") != 0) {
  if (vn < 16u) return 0;
  for (i = 0u; i < vn; ++i) {
   char ch = m->signature[i];
   if (!((ch >= 'A' && ch <= 'Z') || (ch >= 'a' && ch <= 'z') ||
         nu_digit(ch) || ch == '+' || ch == '/' || ch == '=')) return 0;
  }
  if (strcmp(m->key_id, "none") == 0) return 0;
 } else if (strcmp(m->key_id, "none") != 0) return 0;
 return pos == length;
}
int NU_ManifestVerify(const NU_Manifest *m, const uint8_t *package,
                      size_t package_size, NU_ManifestVerifyProvider provider,
                      void *context) {
 if (!m || !package || !provider || !package_size ||
     package_size != (size_t)m->package_size ||
     strcmp(m->signature, "unsigned") == 0 ||
     strcmp(m->key_id, "none") == 0) return 0;
 return provider(m, package, package_size, context) ? 1 : 0;
}
