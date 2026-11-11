# N.U approved background artwork

## Asset to upload

- Repository path: `assets/niroo-celestial-city.jpg`
- Dimensions: 1536 × 1024
- Format: JPEG (optimized from the supplied PNG, RGB, progressive)
- Size: 400,781 bytes
- SHA-256: `9c711b8ee75fe36cb0505b210c3cb8738a1d8c25c11b3a54d32b031d165025b5`
- Intended use: N.U modular background engine, base scene under composited visual layers.

## Important status

The image binary is **not yet stored in this Git repository**. The GitHub connector available for this task can create UTF-8 text files and Git blobs, but does not expose a binary-file upload action from the uploaded chat attachment. This README records the intended asset and exact target path; it is not proof that the image has been committed.

## Upload using GitHub website

1. Download the optimized file named `niroo-celestial-city.jpg` from this chat.
2. Open the repository's `feature/modular-graphics-runtime-2026-11-11` branch.
3. Open the `assets` folder.
4. Choose **Add file → Upload files**.
5. Select `niroo-celestial-city.jpg` and ensure the final path is exactly `assets/niroo-celestial-city.jpg`.
6. Commit directly to `feature/modular-graphics-runtime-2026-11-11`, not the default/public branch.
7. After upload, verify the image opens at the file URL and compare its SHA-256 with the value above if possible.

Once uploaded, the background engine's existing asset URL will resolve without changing game code. Do not merge or publish the branch until visual QA passes.
