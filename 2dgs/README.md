# ScaleMaster Office 01 — 2DGS

This independent, unlisted experience uses the official [2D Gaussian Splatting](https://github.com/hbb1/2d-gaussian-splatting) implementation at commit `f3e3b9fa67bbd1c75e05167ff37391d8dab2a678`.

30,000 iterations, 560 training and 40 held-out images, 1920×1440 RGB, fixed final Office 01 poses and a 550,000-point RGB-D initialization. No additional depth supervision. Earlier camera bundle adjustment included validation-image features, so this is a photometric held-out comparison, not independently estimated-camera validation.

The web renderer uses GaussianSplats3D 0.4.7 in its actual TwoD ray/surfel mode. The 444,634 learned surfels occupy 32,039,988 bytes in KSplat. Native SH3 is reduced to SH2, with half precision and quantized storage; this is not identical to the native CUDA result. Surface fragments can occlude Dalgu, particularly near the floor. Collision uses the existing RGB-D walk map.

Data: [ScaleMaster Dataset](https://scalemaster-dataset.github.io/), Office 01, ICRA 2026, DGIST APRL. [Dataset paper](https://arxiv.org/abs/2602.18174), [dataset code](https://github.com/JooHyoSeok/ScaleMaster-Dataset), [APRL](https://sites.google.com/view/aprl-dgist). Authors: Hyoseok Ju, Bokeon Suh, Giseop Kim.

Method: *2D Gaussian Splatting for Geometrically Accurate Radiance Fields*. [Project and paper](https://surfsplatting.github.io/). Research implementation terms are reproduced in LICENSE-2DGS.md; the web renderer's MIT license is in vendor/LICENSE.

This page has noindex and no incoming navigation from the main experience. Its address is publicly accessible; no authentication is implemented. Training data and checkpoints are not included in this repository.

## Observed evaluation

Actual browser captures at the same 40 held-out 1920×1440 cameras: PSNR 21.488 dB, SSIM 0.8283, VGG LPIPS 0.4033. Metrics use full-frame RGB, Gaussian 11×11 SSIM and LPIPS inputs in [-1,1].

RTX 4070 Ti SUPER, Chrome 152 / ANGLE D3D11, 1280×720 DPR1, 8-second warm-up then the same 30-second calm-tour segment: 102.75 FPS (browser rAF cadence). Local cold-origin model readiness including Dalgu was 1.00s; this is not internet download timing. Mobile performance is not established.
