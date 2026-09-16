# ScaleMaster Office 01 — LingBot initialization → 2DGS

An independent, unlisted experiment. No navigation is added to the original experiences. This page uses noindex; its address remains public, without authentication.

## Reconstruction

Same fixed Office 01 camera poses, PINHOLE intrinsics, 560 train / 40 held-out RGB images at 1920×1440. Official 2DGS commit `f3e3b9fa67bbd1c75e05167ff37391d8dab2a678`, 30,000 iterations, SH3, normal loss 0.05 after 7k, distortion loss 0, no additional depth supervision. This run resumed at 7k; the official checkpoint does not preserve camera sampling stack/RNG. The sensor-initialized reference also has a prior restart history.

Initialization uses [LingBot-Map](https://github.com/Robbyant/lingbot-map) with the official balanced [checkpoint](https://huggingface.co/robbyant/lingbot-map). Only the 560 training RGB images are inferred at 518×392. No sensor depth, sensor points, or validation RGB is used for this seed. Predictions are processed in 32-frame sections with 8-frame context on either side. A camera-centre Sim(3) fit supplies the metric scale; predicted depth is unprojected with calibrated intrinsics and the existing fixed camera poses. Confidence and neighbouring predicted-depth consistency filters precede a 2cm voxel sample capped at 550,000 points.

The previous sensor seed used 361 earlier training views, 256×192 measured depth, 3.5cm voxels and a 0.3–6m range. This learned seed uses 560 views and 0.2–15m. Thus this compares practical initialization pipelines, not a perfectly isolated depth-estimator ablation. Earlier camera BA included validation-image features, so camera estimation is not independent of validation. This is not a geometry ground-truth benchmark.

## Native evaluation — 40 identical held-out cameras

| Initialization | PSNR | SSIM | LPIPS VGG |
|---|---:|---:|---:|
| Sensor RGB-D | 22.377 | 0.8372 | 0.3777 |
| LingBot | 22.563 | 0.8383 | 0.3773 |

Full-resolution native float32 RGB clamped to [0,1], 11×11 Gaussian SSIM, VGG LPIPS v0.1 on [-1,1]. These are **native renderer metrics, not browser metrics**. No hyperparameters were tuned against these views.

## Web representation and limitations

441,428 actual 2D surfels, 31,808,992 bytes KSplat. Same GaussianSplats3D 0.4.7 perspective-correct TwoD renderer as the prior 2DGS experiment. SH3 is truncated to SH2, with half-precision/quantized storage. This is lossy and does not reproduce native CUDA compositing exactly. Thin structures and floor fragments can still be imperfect; a better average image score does not establish better walkable geometry. Browser measurements for this variant are reported below, separately from native metrics.

Dalgu uses the existing RGB-D collision map, **not LingBot-derived collision geometry**. Defaults and controls are preserved. Original root, 2DGS and MeshSplatting assets are not replaced.

## Credits

Data: [ScaleMaster Dataset](https://scalemaster-dataset.github.io/), Office 01, ICRA 2026, DGIST APRL; Hyoseok Ju, Bokeon Suh, Giseop Kim. [Dataset paper](https://arxiv.org/abs/2602.18174), [dataset code](https://github.com/JooHyoSeok/ScaleMaster-Dataset), [APRL](https://sites.google.com/view/aprl-dgist).

Method: [2D Gaussian Splatting for Geometrically Accurate Radiance Fields](https://surfsplatting.github.io/), [official code](https://github.com/hbb1/2d-gaussian-splatting). Initialization: [LingBot-Map: Geometric Context Transformer for Streaming 3D Reconstruction](https://github.com/Robbyant/lingbot-map), Robbyant Team. The renderer license and 2DGS research terms are included. Source photographs, prediction caches and training checkpoints are not uploaded.

## Actual browser measurements

40 identical held-out 1920×1440 browser PNGs: PSNR 21.684 dB, SSIM 0.8285, VGG LPIPS 0.4007. The same metric definitions as above are used, with 8-bit browser captures rather than native float32 images. The previous sensor-seeded 2DGS browser result was 21.488 dB / 0.8283 / 0.4033. Native-to-web differences include SH3→SH2, quantization and renderer/compositing differences.

RTX 4070 Ti SUPER, Chrome152 / ANGLE D3D11, 1280×720 DPR1, original calm-tour speed from route65, 8s warm-up then30s: 102.86 FPS (rAF cadence), p95 10.10ms. Local fresh-origin model readiness including Dalgu: 1.004s, not internet/CDN download timing. Training had finished before measurement. This browser is near its frame-cadence ceiling; the measurement is not maximum GPU rendering throughput or a mobile-performance claim.

Default follow view and local synthetic W/arrow movement, view switching, double jump, reset and mini-map checks passed. Hardware pointer lock is not certified in the embedded browser because of focus restrictions. Surface fragments still visibly occlude part of Dalgu at the starting viewpoint.
