# ScaleMaster Office 01 — MeshSplatting

Independent, unlisted reconstruction using [MeshSplatting: Differentiable Rendering with Opaque Meshes](https://meshsplatting.github.io/) and the [official implementation](https://github.com/meshsplatting/mesh-splatting), commit `2a810a6c353215685307da3d4cc6ebd73b1c387b`.

The exact source commit is recorded in the study report; see model.json for the actual exported iteration, vertex/triangle counts, native opacity and supersampling, and chunk sizes. Training data and optimizer checkpoints are not published here.

The experiment uses 560 training and 40 held-out images from the same 600-view Office 01 set, fixed final camera poses and RGB at 1920×1440. Initialization is the same 550,000-point training-depth fusion used by the 2DGS experiment. No external depth or normal supervision is added. The official indoor losses and connectivity procedure are retained. Earlier camera bundle adjustment included validation-image features, so held-out image metrics are not an independently estimated-camera benchmark.

Resource deviation: the final internal supersampling is capped at 2× rather than the official 4×. Two attempts at 4× failed during backward on the 16 GB GPU, including an attempt to offload Adam moments to CPU. Ground-truth RGB resolution is unchanged. The bounded restricted-Delaunay helper preserves the official circumcenter and BVH selection; small parity tests match the official face set.

Web storage is lossless gzip of float32 positions, full SH3 appearance and connected uint32 triangle indices. The renderer retains per-vertex view-dependent SH and screen-linear color interpolation. Standard opaque, per-pixel depth testing replaces CUDA depth-sorted soft triangle compositing and alpha capped at 0.999, so visibility and edge appearance can differ. This is not a claim of identical CUDA rendering. Collision reuses the existing RGB-D walk map, not the exported mesh.

Data: [ScaleMaster Dataset](https://scalemaster-dataset.github.io/), Office 01, ICRA 2026, DGIST APRL. [Dataset paper](https://arxiv.org/abs/2602.18174), [dataset code](https://github.com/JooHyoSeok/ScaleMaster-Dataset), [APRL](https://sites.google.com/view/aprl-dgist). Authors: Hyoseok Ju, Bokeon Suh, Giseop Kim. Method licenses are reproduced in LICENSE-MeshSplatting.md and LICENSE-GS.md.

The page has noindex and no incoming navigation from the main experience. Address-based obscurity is not authentication.

## Observed evaluation

Actual browser captures at the same 40 held-out 1920×1440 cameras: PSNR 21.764 dB, SSIM 0.7914, VGG LPIPS 0.4845. Metrics use full-frame RGB, Gaussian 11×11 SSIM and LPIPS inputs in [-1,1].

RTX 4070 Ti SUPER, Chrome 152 / ANGLE D3D11, 1280×720 DPR1, 8-second warm-up then the same 30-second calm-tour segment: 102.85 FPS (browser rAF cadence). Local cold-origin model readiness including Dalgu was 3.84s; this is not internet download timing. Mobile performance is not established.
