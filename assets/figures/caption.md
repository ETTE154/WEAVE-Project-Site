# WEAVE Figure 1

## English caption

**Figure 1. Proposed WEAVE framework for connecting wearable human demonstrations to robot learning.** (a) A wearable platform integrates a head-mounted RGB-D camera with on-body computing and power; the images show V10 CAD references rather than a fabricated or validated device. (b) Demonstration capture produces time-aligned RGB-D sessions with timestamps, calibration information, and hardware/session metadata. (c) Hand and object pose extraction, temporal segmentation and annotation, cleaning, and human-to-robot retargeting produce a versioned robot-ready dataset. (d) Policy training is followed by simulation-based checkpoint selection and real-robot evaluation. A fixed-camera bench pilot enables early data collection through the same processing pathway before wearable completion. Public data support learning-pipeline smoke tests; final evaluation is planned to include a robot-data baseline. Evaluation failures feed back into collection and data refinement, while artifact identities preserve reproducibility across the pipeline. The robot is schematic and its platform remains to be determined. The figure describes the proposed workflow, not experimental results.

## 국문 캡션

**그림 1. 웨어러블 기반 사람 시연을 로봇 학습으로 연결하는 WEAVE 프레임워크의 제안 구조.** (a) 헤드 장착 RGB-D 카메라, 신체 장착 컴퓨팅·전원 모듈을 갖춘 웨어러블 플랫폼이다. 장치 이미지는 V10 CAD 참조이며 실물 검증 결과가 아니다. (b) 시각·보정·장치 정보를 연결한 RGB-D 시연 세션을 수집한다. (c) 손·물체 포즈 추출, 시간 구간 분할·주석, 정제와 사람-로봇 리타게팅으로 로봇용 데이터셋을 구성한다. (d) 정책 학습, 시뮬레이션 기반 체크포인트 선정과 실로봇 평가를 수행한다. 고정 거치 벤치 파일럿은 웨어러블 완성 전에도 동일 처리 경로를 거쳐 조기 주석·예비 학습을 지원하며, 공개 데이터는 학습 파이프라인의 선행 동작 점검에 사용한다. 평가 실패는 재수집·데이터 개선으로 환류하고, 장치·세션·데이터·실험 식별자를 연결해 재현성을 확보한다. 로봇은 플랫폼 미정의 개념도이며, 그림 전체는 제안된 처리 구조를 표현한다.

## Figure scope and sources

- The main path follows M1–M4 in the project plan, but omits owners, milestone dates, and completion percentages from the scientific figure.
- The V10 CAD renderings are reused from `WEAVE-Project-Site/assets/wearable-v10-front.png` and `wearable-v10-head.png`, displayed through layout viewports without modifying the original files.
- Stream thumbnails, hand/object poses, temporal segments, and the robot are schematic vector drawings, not recorded data or experimental results. No specific policy architecture, robot brand, benchmark score, or successful real-world deployment is asserted.
- IMU is omitted because its collection/validation is not established by the current evidence. Robot/task selection, synchronization/calibration, retargeting, dataset release, and learning/evaluation remain proposed work.
- The pilot route enters capture and follows decomposition/retargeting; it does not imply that human-to-robot conversion can be skipped.
- Vector source: `WEAVE_Figure1.svg`. Print PDF: `WEAVE_Figure1.pdf` (180 × 114 mm, one page). Raster export: `WEAVE_Figure1.png` (500 dpi). The preview is a rendered PDF image.
