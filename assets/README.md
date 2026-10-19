# 사이트 이미지 출처

## Figure 1 · 전체 프레임워크

웹 미리보기와 확대 창에서 같은 구성의 한글·영문 벡터 그림을 전환합니다. 선택한 언어의 PNG(500 dpi)와 PDF(1페이지, 180 × 114 mm)를 다운로드용으로 제공합니다. 국·영문 캡션과 범위 설명은 `figures/caption.md`에 있습니다.

| 언어 | SVG / PNG / PDF 파일명 |
| --- | --- |
| 한글 | `figures/WEAVE_Figure1_ko.*` |
| 영문 | `figures/WEAVE_Figure1.*` |

한글 원본은 2026-10-19에 만든 `output/pdf/weave-figure1-ko-v1/`입니다. 한글 SVG의 글자는 벡터 윤곽선으로 저장하여 기기의 글꼴 설치 상태에 영향을 받지 않습니다. 한글 PDF에는 맑은 고딕의 사용 글자만 포함되며 텍스트 검색을 지원합니다. 두 언어는 장치 이미지·화살표·배치가 동일하고 레이블만 번역했습니다.

2026-10-18에 만든 `output/pdf/weave-figure1-v1/`의 원본을 그대로 복사했습니다. V10 CAD 참조와 제안된 데이터 처리·학습 흐름을 담고 있으며, 로봇은 플랫폼 미정의 개념도입니다. RGB-D 예시, 포즈·분할·로봇 도형은 실제 수집 결과가 아닌 벡터 개념도입니다. CAD 이미지의 출처·이용 조건은 아래 고지를 따릅니다.

## V10 CAD 참조

두 PNG는 WEAVE V10 설계 패키지에서 생성한 CAD 렌더이며 실물 사진이 아닙니다. 원본을 수정하지 않고 복사했습니다.

| 사이트 파일 | 원본 경로 | SHA-256 |
|---|---|---|
| `wearable-v10-front.png` | `hardware/wearable/prototypes/wearable_prototype_v10/renders/cad_front.png` | `f45a70622d3b80ea66d420df99f9929ebfc8fc8e705a9f6b950d4d6bf873f455` |
| `wearable-v10-head.png` | `hardware/wearable/prototypes/wearable_prototype_v10/renders/cad_head.png` | `e8bb72629cb69334993ebf701725a1b073422219703da913d4fd5aabd17f6bf2` |

원본 경로·크기·해시는 [자산 매니페스트](https://github.com/ETTE154/WEAVE-Robot-Learning-Drive/blob/HEAD/assets/manifest.json)의 기록과 일치합니다. 원본 렌더는 매니페스트의 `weave-wearable-assets-2026-09-29` Drive 자산에 포함됩니다.

렌더에 사용한 인체 기준 모델과 장치 형상의 출처는 기존 설계 패키지에 보존되어 있습니다.

- [MakeHuman 인체 기준 모델](https://github.com/ETTE154/WEAVE-Robot-Learning-Drive/blob/HEAD/hardware/wearable/prototypes/wearable_prototype_v10/reference/human_makehuman/README.md)
- [인체 자산 CC0 고지](https://github.com/ETTE154/WEAVE-Robot-Learning-Drive/blob/HEAD/hardware/wearable/prototypes/wearable_prototype_v10/reference/human_makehuman/LICENSE.ASSETS.md)
- [Orbbec Gemini 336 공식 참조 기록](https://github.com/ETTE154/WEAVE-Robot-Learning-Drive/blob/HEAD/hardware/wearable/prototypes/wearable_prototype_v10/reference/ORBBEC_SOURCES.md)
- [Seeed reComputer J4012 공식 참조 기록](https://github.com/ETTE154/WEAVE-Robot-Learning-Drive/blob/HEAD/hardware/wearable/prototypes/wearable_prototype_v10/reference/recomputer_official/SOURCES.md)
- [기존 저장소의 외부 자산 출처 안내](https://github.com/ETTE154/WEAVE-Robot-Learning-Drive/blob/HEAD/docs/third-party-assets.md)

사이트 전체나 제조사 참조 형상에 새로운 일괄 라이선스를 부여하지 않습니다. 각 출처의 고지와 이용 조건은 원본 자료를 따릅니다.

