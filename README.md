# ScaleMaster Office — Gaussian Splatting Tour

**[Open the interactive experience](https://gisbi-kim.github.io/scalemaster-office/)**

Explore **Office 01 from the ScaleMaster Dataset**, the ICRA 2026 work of the Autonomy and Perceptual Robotics Lab (APRL), DGIST. Walk with Dalgu, explore freely, or take a smooth guided camera tour. The Gaussian scene itself is **19.37 MB**.

## Dataset and paper attribution

**Have We Mastered Scale in Deep Monocular Visual SLAM? The ScaleMaster Dataset and Benchmark**  
**Hyoseok Ju, Bokeon Suh, Giseop Kim — ICRA 2026, DGIST**

- [Official ScaleMaster project](https://scalemaster-dataset.github.io/)
- [Paper — arXiv:2602.18174](https://arxiv.org/abs/2602.18174)
- [Original dataset repository](https://github.com/JooHyoSeok/ScaleMaster-Dataset)
- [APRL](https://sites.google.com/view/aprl-dgist)

ScaleMaster studies scale consistency of monocular visual SLAM in complex indoor environments. This experience uses the **Office 01** sequence. The Gaussian model is a separately reconstructed and compressed visualization; it is **not the paper's ground-truth map or a reported benchmark result**. Please credit ScaleMaster and cite the paper when using this scene or dataset.

## 체험 안내

이 사이트는 우리 연구실의 **ScaleMaster Dataset (ICRA 2026)** 중 **Office 01** 데이터를 Gaussian Splatting으로 재구성한 공간 체험입니다. 공식 프로젝트·논문·원본 데이터 링크는 화면 메뉴에도 있습니다.

- **기본 시작 화면:** 처음 접속하거나 새로고침하면 DGIST 로비 입구에서 달구의 뒷모습이 보이는 따라가기 모드로 시작합니다(시야 높이 1.10m). 화면을 클릭하면 마우스로 조종할 수 있습니다.
- **편안한 투어:** 촬영 경로의 흔들림과 기울기를 줄이고 부드럽게 이동합니다.
- **달구 시점 / 따라가기:** WASD 또는 방향키 이동, 마우스 시선 회전, Space 점프. 화면을 클릭해 마우스를 고정하고 Esc로 해제합니다.
- **자유 탐색:** 드래그 회전, 우클릭 이동, 휠 확대. 장소 버튼으로 휴게공간·로비·복도·사무실로 이동합니다.
- 데스크톱 WebGL2 브라우저 권장. 충돌 지도는 체험용 근사치이며 실제 로봇 내비게이션용 지도가 아닙니다.

## Reconstruction and compression

| Item | Value |
| --- | --- |
| Selected RGB views | 600: 560 training + 40 held-out |
| Image resolution | 1920 × 1440 |
| Reconstruction | RGB-D initialization, pose refinement, AbsGS-style refinement using gsplat |
| Original Gaussians | 1,846,551 |
| Published Gaussians | 1,250,000, SH degree 3 |
| Published format | SOG v2 |
| GS bytes | **19,368,942** (19.37 MB / 18.47 MiB) |
| Original PLY bytes | 457,946,180 |
| Full-resolution PSNR | 23.1607 → 23.0420 dB |

The PSNR comparison uses the actual decoded SOG against the original PLY, rendered with gsplat at the same 40 fixed held-out camera poses and original image resolution. It includes merging and codec losses. These are reconstruction diagnostics for this demo, not the ScaleMaster paper's SLAM benchmark metrics. Earlier camera calibration used image features including validation views, so this is not an independently estimated-camera benchmark. See [validation JSON](compression-validation.json) and [visual comparison](https://gisbi-kim.github.io/scalemaster-office/compression-comparison.html).

The 401-pose viewer trajectory is a navigation reference, separate from the 600-image training selection. The calm tour uses a smoothed presentation path. Source PLY, checkpoints and original RGB-D archives are not included. Viewer assets including Dalgu bring the uncompressed runtime payload to approximately 35.3 MB; **19.37 MB refers to the GS file alone**. Comparison images load only on their comparison page.

## Local preview and hosting

```sh
git clone https://github.com/gisbi-kim/scalemaster-office.git
cd scalemaster-office
python -m http.server 8771 --bind 127.0.0.1
```

Open http://127.0.0.1:8771/. This is a static website with no server-side model inference. GitHub Pages serves the root of `main`; pushing updates redeploys it. Assets use relative paths for project-site hosting.

Compression can be reproduced from the original trained PLY with `@playcanvas/splat-transform@3.4.2`:

```sh
npx @playcanvas/splat-transform@3.4.2 office.ply --decimate-adaptive 1250000 compact.ply
npx @playcanvas/splat-transform@3.4.2 -g 0 -i 20 compact.ply office.sog
```

## Credits and reuse

- **Data and research:** ScaleMaster authors / DGIST APRL; use the official links above for dataset access and terms. This repository does not relicense the dataset or derived scene.
- **Rendering:** [Spark](https://sparkjs.dev/) by World Labs and [Three.js](https://threejs.org/), with bundled MIT notices in `vendor/SPARK-LICENSE.txt` and `vendor/LICENSE.txt`.
- **Compression:** [PlayCanvas SplatTransform](https://github.com/playcanvas/splat-transform), adaptive Gaussian merging and SOG encoding.
- **Dalgu:** asset and walk-mode design adapted from the lab's [APRL 610 viewer](https://github.com/gisbi-kim/aprl-610). Character and scene rights remain with their respective owners.
- **Training renderer:** [gsplat](https://github.com/nerfstudio-project/gsplat).

## Citation

```bibtex
@inproceedings{ju2026scalemaster,
  title={Have We Mastered Scale in Deep Monocular Visual SLAM? The ScaleMaster Dataset and Benchmark},
  author={Ju, Hyoseok and Suh, Bokeon and Kim, Giseop},
  booktitle={Proceedings of the IEEE International Conference on Robotics and Automation (ICRA)},
  year={2026},
  url={https://arxiv.org/abs/2602.18174}
}
```
