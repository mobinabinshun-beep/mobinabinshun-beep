# N.U Hardware, Rendering and Sound Architecture

- Document ID: NU-HTL-RENDER-SOUND-ARCH
- Date: 2026-11-20
- Status: **PROPOSED ARCHITECTURE / NOT IMPLEMENTED**
- Scope: Generation 1 architecture contracts for graphics/hardware adaptation and audio playback
- Target baseline: portable C90 core; 32-bit Windows XP first native host
- Related baseline: [NU-GEN1-UNIFIED-ENGINEERING-SPEC.md](./NU-GEN1-UNIFIED-ENGINEERING-SPEC.md)

> This document defines contracts and implementation order. It does not claim that a GPU renderer, audio engine, codec, speech recognizer or hardware driver already exists.

## 1. Goals and non-goals

N.U owns its module-facing APIs, command semantics, resource budgets, capability negotiation and translation policy. Platform backends adapt those stable commands to OS/driver services. Game modules must not depend directly on DirectX, WinMM, GDI, OpenGL or vendor-specific APIs.

Goals:
- Keep game/module ABI independent of a particular graphics or audio API.
- Support a low-cost Generation-1 baseline and optional capability-based enhancements.
- Fail closed for malformed, unsupported or over-budget commands/assets.
- Keep platform-specific code behind narrow host adapters.
- Preserve offline operation and bounded memory/CPU use.

Non-goals for this increment:
- Replacing OS device drivers or directly programming every GPU/audio device.
- A general-purpose GPU driver, universal console-binary translator or arbitrary codec framework.
- Speech recognition, speech synthesis, real-time voice chat or human-language translation.
- A promise of hardware acceleration on every Windows 98/XP machine.

## 2. Proposed component map

| Component | Owns | Status |
|---|---|---|
| N.U Core | Lifecycle, sessions, module registry, scheduler and policy | Existing candidate |
| NUVM | Bounded module bytecode execution | Existing candidate |
| N.U Translator | Generation-specific neutral IR to NUVM ABI | Limited CPU-side subset exists |
| NUHTL — N.U Hardware Translation Layer | Capability model, normalized hardware-facing commands, backend selection and translation | Proposed |
| NURender | N.U-owned 2D/pixel rendering API, surfaces, sprites and frame composition | Proposed; no native renderer yet |
| NUSound | Stable audio API, voice/channel lifecycle, volume and playback policy | Proposed |
| NUSound Translator | N.U audio command/asset adaptation to an available platform audio backend | Proposed |
| NUInput | Normalized input events and device capability contract | Host input work remains separate |
| NUAdaptive | Capability sampling and quality/resource adaptation | Existing candidate mechanisms; no hard global quotas |
| Native Platform Host | Window, clock, files and OS/driver service adapters | Minimal Win32/GDI host candidate exists |

## 3. Hardware abstraction and graphics path

### 3.1 Ownership

NUHTL is an abstraction and translation layer, not a device driver. It owns:
- a versioned, vendor-neutral capability description;
- stable N.U command and resource descriptors;
- backend selection and compatibility checks;
- command validation, bounds checking and app-owned resource admission;
- fallback decisions and diagnostics.

The operating system and vendor driver remain responsible for device-specific execution. N.U may avoid a *direct module dependency* on DirectX while a particular optional backend may use an OS graphics API internally. No backend may leak its API types into the module ABI.

### 3.2 Proposed graphics pipeline

`Game Module → N.U Core / NUVM → NURender Commands → NUHTL → Graphics Backend → OS / Driver → GPU or CPU`

Initial backend order:
1. **Win32 GDI software-friendly fallback** for the existing XP-targeted host and basic 2D presentation.
2. A separately versioned optional accelerated backend only after its API availability, driver behavior, build/import requirements and real hardware tests are proven.
3. Additional backends may be added without changing module-facing commands.

GDI is an OS drawing API; its use does not prove GPU acceleration. The existing `StretchBlt` background presentation is not a complete game renderer.

### 3.3 Generation-1 rendering profile

- Prioritize pixel/2D surfaces, sprites, simple transforms and bounded frame composition.
- Treat 640×480 at 30 FPS as a target to measure, not a guaranteed frame rate or GPU quota.
- Keep effects optional and degrade to static/simple rendering.
- Avoid mandatory shaders, browser engines, WebGL, large texture atlases and dedicated GPU features.
- Bound surface dimensions, total pixel memory, command count and per-frame work.
- Preserve a software/GDI fallback when acceleration is absent or unreliable.

## 4. NUSound and audio translation

### 4.1 Separate API from translator

**NUSound** is the module-facing playback contract. It describes *what* should play: asset ID, playback mode, volume, pan, loop policy and priority.

**NUSound Translator** resolves and validates the asset, converts supported N.U audio metadata into a normalized PCM stream/descriptor, then maps the playback request to a selected backend. It describes *how* the host can play it.

The translator is not a speech translator and does not translate spoken language. If N.U later needs speech-to-text, text-to-speech or live language translation, that is a distinct opt-in subsystem (candidate name: NUSpeech) with separate models, privacy, storage and compute requirements. It is not part of this Generation-1 audio baseline.

### 4.2 Proposed audio pipeline

`Game Module → NUSound API → NUSound Translator → Normalized PCM / Voice Queue → Audio Backend Adapter → OS Audio Service / Driver → Audio Device`

The module ABI must not expose `waveOut`, DirectSound, DirectX, ALSA or vendor APIs. The host adapter owns device handles and asynchronous buffer completion. The translator validates before enqueueing and never executes embedded code from an audio asset.

### 4.3 Generation-1 asset support

Initial supported input:
- RIFF/WAVE container with PCM format only.
- 8-bit unsigned or 16-bit signed PCM.
- Mono or stereo.
- Initial sample-rate allow-list: 11025, 22050 and 44100 Hz.
- Bounded file size, duration, channel count, sample rate and decoded byte count.
- Explicit asset metadata; no implicit network fetch.

Initial exclusions:
- MP3, AAC, FLAC, Ogg/Vorbis, Opus and proprietary codecs.
- Compressed or encrypted audio payloads.
- Runtime recording, microphone capture, speech recognition and synthesis.
- Unbounded streaming or automatic download.

The first implementation should pass validated PCM through unchanged when the backend supports its format. Resampling or channel conversion is a later explicit translator feature, not an assumed capability.

### 4.4 First Windows XP backend

Candidate backend: **WinMM waveOut** through the Windows Multimedia API (`waveOutOpen`, `waveOutPrepareHeader`, `waveOutWrite`, `waveOutUnprepareHeader`, `waveOutClose`). This is an OS-provided audio service and does not require a direct DirectX dependency.

Before adoption:
- Verify the MinGW/toolchain headers and `winmm` link dependency on the actual build.
- Keep WinMM types and callbacks inside the Win32 adapter.
- Use a small fixed number of reusable PCM buffers and bounded queue depth.
- Handle asynchronous completion, shutdown and device-open failure safely.
- Test on real 32-bit Windows XP SP3 and the declared low-end reference hardware.
- If the backend is unavailable, return a structured unsupported/device-unavailable result; do not crash or silently claim playback.

No WinMM implementation or link dependency is claimed by this document.

### 4.5 Initial NUSound command contract

Illustrative C90-facing API (names and ABI are proposed; do not ship until reviewed and versioned):

```c
typedef unsigned long NU_SoundHandle;
typedef unsigned long NU_SoundResult;

#define NU_SOUND_OK                 0UL
#define NU_SOUND_UNSUPPORTED        1UL
#define NU_SOUND_INVALID_ASSET      2UL
#define NU_SOUND_BUDGET_EXCEEDED    3UL
#define NU_SOUND_DEVICE_UNAVAILABLE 4UL

typedef struct NU_SoundPlayDesc {
    unsigned long struct_size;
    unsigned long asset_id;
    unsigned long volume_0_1000;
    long pan_minus_1000_to_1000;
    unsigned long flags; /* loop, priority; reserved bits must be zero */
} NU_SoundPlayDesc;

NU_SoundResult NU_SoundPlay(const NU_SoundPlayDesc *desc,
                            NU_SoundHandle *out_handle);
NU_SoundResult NU_SoundStop(NU_SoundHandle handle);
NU_SoundResult NU_SoundSetMasterVolume(unsigned long volume_0_1000);
void NU_SoundStopAll(void);
```

Contract rules:
- Validate pointer, structure size, reserved bits, handle and asset ID.
- Volume and pan are clamped or rejected according to one versioned rule; no backend-specific interpretation.
- Asset IDs resolve only through the N.U package/asset registry, not arbitrary module-provided filesystem paths.
- Queue capacity, simultaneous voices and decoded bytes are bounded by NUAdaptive/host policy.
- A module cannot allocate unlimited voices or monopolize the device.
- Stop/close must be idempotent; device loss must invalidate or safely retire affected handles.
- Errors are explicit; unsupported format/backend never falls back to fabricated silence while reporting success.

### 4.6 Resource policy

Initial conservative proposal, to be measured rather than treated as a verified hardware quota:
- Start with a small fixed voice limit (for example 8 concurrent voices); make it configurable by measured profile.
- Prefer short mono 22.05 kHz / 16-bit PCM effects.
- Permit 44.1 kHz stereo music only when the measured budget allows it.
- Use a bounded two- or three-buffer queue per active stream; avoid allocating a full decoded copy for long tracks.
- Stop/release voices when a module exits or loses its session.
- Account N.U-owned buffers through the central reservation ledger once the audio path is integrated.
- Keep music and effects volume controls independent; mute must not destroy playback state.

These are proposed starting points, not implemented limits or benchmark results.

## 5. Versioning, capabilities and failure behavior

- Version NUHTL command contracts, NURender API, NUSound API, translator and each backend independently.
- A backend advertises explicit capabilities (formats, sample rates, channels, max voices, surface formats, dimensions).
- Modules declare required versus optional capabilities in their manifest.
- Unknown required capabilities, ABI-major mismatch, malformed descriptors and resource-budget violations fail closed.
- Optional features may degrade only through documented fallback rules.
- Cache only validated, deterministic translation results; invalidate when module, translator, backend or capability profile changes.
- No backend may elevate its own capability or bypass Core resource admission.

## 6. Security, privacy and data handling

- Treat package and media bytes as untrusted input; validate lengths before allocation or pointer arithmetic.
- Reject malformed RIFF chunk lengths, unsupported format tags, integer overflow and truncated data.
- No audio asset may contain executable code or be interpreted as a module.
- Do not record microphone input in this baseline.
- Keep transient decoded buffers separate from saves, wallet, profile and user data.
- Do not send audio or telemetry over the network without a separately approved feature and explicit user-facing disclosure.

## 7. Implementation phases and acceptance gates

### Phase A — contract and test vectors (documentation only)
- Review this proposal and freeze stable API/ABI names.
- Define golden WAV fixtures: valid PCM variants, truncated headers, oversized chunks, unsupported codecs, invalid rates/channels and integer-overflow cases.
- Define mock backend tests for queue ordering, voice limits, stop/close and device failure.

### Phase B — portable sound core and translator
- Add C90 `nu_sound.h/.c` for validation, voice handles, bounded command queue and backend-neutral descriptors.
- Add `nu_sound_translator.h/.c` for RIFF/WAVE PCM parsing and validated PCM descriptors.
- Keep the portable core independent of Windows headers.
- Run strict C90 warnings-as-errors tests, malformed-input tests and resource-budget tests.

### Phase C — Win32 audio adapter
- Add a WinMM adapter in a separate Win32-only source file and link `winmm` only for the Windows host.
- Exercise asynchronous buffer lifecycle and clean shutdown.
- Confirm XP imports/toolchain compatibility and run actual XP audio playback tests.
- Record device, CPU, RAM and latency observations; do not infer performance from cross-build alone.

### Phase D — module integration
- Add sound asset declarations to the package manifest only after format/version decisions.
- Add one simple effect to Bubble Hunt as the first integration; preserve silent operation when no supported audio device exists if the game declares sound optional.
- Add music and additional effects only after the first module passes deterministic, lifecycle and low-end performance tests.

### Phase E — optional speech subsystem (separate decision)
- Evaluate NUSpeech only if explicitly requested: offline/online modes, language coverage, model size, privacy, CPU/RAM, accessibility and licensing.
- Do not bundle large speech models into the first native pack or make voice input a mandatory capability.

## 8. Current implementation truth

As of this document's date:
- NUVM/1 and a limited CPU-side neutral-IR translator exist in the candidate branch.
- The Win32 host uses GDI for a basic still-image presentation path.
- No NURender engine, NUHTL backend framework, NUSound API, NUSound Translator, WinMM audio adapter, codec implementation or native game audio integration is established by the inspected baseline.
- The browser games and native candidate host must not be described as having native audio support based on this proposal.

## 9. Open decisions before code implementation

1. Approve the component names and API contract version.
2. Confirm whether initial audio should be effects-only or include background music.
3. Confirm the proposed 8-voice starting cap or choose another measured target.
4. Confirm the target WAV subset and whether sample-rate conversion is required in the first increment.
5. Approve WinMM waveOut as the first XP backend after toolchain/import validation.
6. Keep speech/language translation outside this work unless separately authorized.

## 10. Related baseline constraints

The existing Generation-1 engineering specification remains authoritative for NUVM, NUPK, resource policy, package trust and host status. In particular, the existing 250 MiB RAM ceiling is a maximum N.U-owned budget, not a guaranteed allocation; at 128 MiB physical RAM the current formula yields no more than 64 MiB and may yield less. CPU/GPU policies are cooperative/app-owned controls, not hard system-wide quotas. Windows 98 is not validated by the inspected XP-targeted host.
