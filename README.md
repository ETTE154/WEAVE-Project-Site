# WEAVE Project Site

사람 행동 기반 로봇 학습 데이터 수집을 위한 웨어러블 기기 개발 프로젝트의 현황과 성과, 자료를 공유하는 GitHub Pages 사이트입니다. 하드웨어 → 데이터 수집 → 디컴포지션·정제 → 로봇 학습의 네 단계를 연결합니다.

별도의 패키지 설치나 빌드 과정 없이 HTML, CSS, JavaScript, JSON으로 실행합니다. 기존 자료 저장소는 원본 자료를 제공하고, 이 사이트 저장소는 소개와 진행 현황을 관리합니다.

2026-10-19 변경은 **Figure 1 한글판과 한글·영문 전환 기능 추가**입니다. 홈은 간트 차트로 시작하며, 상단의 ‘전체 흐름 보기’로 그림에 바로 이동할 수 있습니다. 홈·프로젝트 소개·확대 창에서 ‘한글 / English’를 선택하면 그림, 캡션, 다운로드가 같은 언어로 전환됩니다. 기본은 한글이며, 선택은 현재 브라우저에 저장됩니다(저장소 접근이 차단되어도 전환은 동작합니다). SVG 미리보기와 원본 크기·화면 맞춤 전환, 언어별 PNG(500 dpi)·PDF 다운로드를 제공합니다. M1–M4의 42개 작업 일정과 담당자 배정은 유지합니다. Kiro 독립 구현의 비교 범위는 별도 명세에 따라 로컬 실행·UI/UX 샘플 확인으로 유지합니다.

- [WEAVE-Robot-Learning](https://github.com/ETTE154/WEAVE-Robot-Learning)
- [WEAVE-Robot-Learning-Drive](https://github.com/ETTE154/WEAVE-Robot-Learning-Drive)

## 메뉴

| 주소 | 화면 |
| --- | --- |
| `#home` | M1–M4·42개 작업 간트 차트, 완료율·담당자, Figure 1, 프로젝트 소개와 성과물 |
| `#progress` | 단계별 작업과 완료 기준, 일정·마일스톤 |
| `#deliverables` | 시제품, 프로그램, 데이터, 학습 결과 소개 |
| `#files` | 자료 검색·필터와 원본 저장소·파일 링크 |
| `#about` | 프로젝트 목적, Figure 1과 전체 프레임워크, 저장소 정보 |

해시 기반 주소를 사용하므로 각 메뉴 링크를 새로 열거나 새로고침해도 GitHub Pages에서 처리할 수 있습니다. 파일 경로는 프로젝트 사이트 하위 경로에서도 실행하도록 상대 경로를 사용합니다.

## 파일 구성

```text
WEAVE-Project-Site/
├── index.html
├── styles.css
├── app.js
├── data/
│   └── project.json
├── assets/                     # 사용 중인 정적 이미지 등이 있으면 포함
├── .github/workflows/pages.yml
├── .nojekyll
├── .gitignore
└── README.md
```

`data/project.json`은 화면에 사용하는 현황과 성과물, 자료 링크의 원본입니다. 화면 구성 변경은 `index.html`, `styles.css`, `app.js`에서 처리합니다. 배포 워크플로는 이 공개 파일들만 `_site/`에 복사해 배포합니다.

## 로컬 실행 및 검증

사이트 폴더에서 다음 명령을 실행합니다.

```powershell
python -m http.server 4173 --bind 127.0.0.1
```

브라우저에서 <http://127.0.0.1:4173/>를 엽니다. JSON을 HTTP로 읽으므로 `index.html`을 직접 더블클릭하는 대신 로컬 서버를 사용합니다. 종료는 서버 터미널에서 `Ctrl+C`를 누릅니다.

간단한 구문 검증:

```powershell
node --check app.js
python -m json.tool data/project.json > $null
node --test tests/schedule.test.cjs
```

브라우저에서는 다섯 메뉴, 진행 단계 선택, 검색·필터, 외부 링크, 모바일 화면, 해시 주소 새로고침을 확인합니다. 개발자 도구 Console과 Network에서 오류·404가 없는지도 확인합니다.

### 간트 차트와 12월까지의 제안 일정

홈의 첫 핵심 화면은 M1–M4 아래의 세부 작업 40개와 기존 완료 기록 2개를 표시하는 간트 차트입니다. 월·주 눈금, 한국 시간 기준 오늘선, 상태 범례, 시작·종료 날짜와 담당자를 함께 표시합니다. 작업 이름이나 막대를 선택하면 해당 단계의 완료 기준·근거로 이동합니다. 차트 안에서 가로·세로로 스크롤하며 날짜 머리글과 왼쪽 작업명은 고정됩니다. `오늘 위치` 버튼으로 현재 날짜를 확인할 수 있습니다.

- 완료 2개는 기존 확인일(2026-09-17, 2026-09-29)에 마커로 표시합니다. 실제 착수일·기간은 추정하지 않습니다.
- 미완료 40개의 기간은 2026-10-19부터 2026-12-30까지의 **제안 일정**입니다. 원본 자료의 완료 실적을 뜻하지 않습니다. M1·M2에는 각각 기존 완료 기록 1개가 더해져 11개씩, M3·M4에는 10개씩 표시됩니다.
- 공개 데이터로 학습 파이프라인을 미리 구성하고, 11월 중순 벤치 파일럿 v0부터 분할·학습을 병행합니다. 게이트는 M1 11/20, M2 11/27, M3 12/11, M4 12/30이며 실로봇 평가는 12/21~24입니다.
- 전채욱: 하드웨어 설계·선정/발주·본 출력·실측 반영·제작/조립·M1 결과/BOM 정리와 M3 디컴포지션·데이터셋 작업. 최경철: 시험편/공차 검증·전원/발열·하중·착용 시험과 M2 수집 시스템·M4 학습/평가. `owner`는 현재 배정 책임이며 기존 완료 기록의 실제 수행자를 새로 입증하는 필드는 아닙니다.
- `project.scheduleStart` / `scheduleEnd`는 표시 범위(2026-09-14~12-31), `scheduleUpdatedAt`은 계획·담당자 갱신일(2026-10-18)입니다. 기존 자료 근거 정리일 `updatedAt=2026-10-02`와 구분합니다.
- 마일스톤의 `startDate`는 제안 착수일, `date`는 제안 종료일, `completedAt`은 실제 완료 확인일입니다. 완료 항목은 `completedAt`이 우선입니다. `scheduleStatus`는 `proposed` 또는 `recorded`, `dependencies`는 먼저 끝나야 할 마일스톤 ID 배열입니다. 기존 `targetDate`는 보존만 하며 표시·계산에 사용하지 않습니다.

날짜를 변경하면 시작일 ≤ 종료일, 선행 항목 종료일 < 후속 항목 시작일, 12월 말 이내 종료 조건을 확인합니다. 날짜 누락·역전·범위 밖 항목은 정상 막대로 그리지 않고 미정 또는 범위 밖 안내를 표시합니다.

## 현황 데이터 수정

1. `data/project.json`에서 제목·소개, 단계와 마일스톤, 성과물, 파일 항목을 수정합니다. 기존 키와 자료형을 유지합니다.
2. 실제 확인된 완료 상태와 검증 결과를 입력합니다. 예정일과 계획 항목은 완료 실적과 구별합니다. 확인되지 않은 일정은 확정 일정으로 표시하지 않습니다.
3. 자료에 버전, 설명, 원본 URL을 기록합니다. 이미지가 필요한 경우 `assets/`에 넣고 JSON에서 상대 경로로 참조합니다.
4. 현황의 갱신일을 수정하고 위 구문 검증과 브라우저 확인을 진행합니다.
5. 수정 내용을 커밋하고 `main`에 푸시하면 Pages 배포가 실행됩니다.

현재 내용은 기존 저장소에서 확인 가능한 하드웨어·수집 도구를 중심으로 구성합니다. 로봇 학습 등 후속 단계는 근거 있는 완료 결과가 등록될 때 상태를 갱신합니다. 사이트에는 사용자 인증이나 원격 데이터 수정 기능이 없으며, 관리자는 GitHub에서 JSON을 편집하고 배포합니다.

### 데이터 항목

| 항목 | 수정 내용 |
| --- | --- |
| `project` | 프로젝트 소개, 저장소·Drive 링크, 자료 정리일과 집계 기준 |
| `stages` | 네 단계의 이름·설명·현재 상태 |
| `milestones` | 진행도 계산의 단일 원본. 완료 기준, 상태, 목표일, 담당자, 근거 문서 |
| `deliverables` | 성과물 설명, 이미지, 확보 내용, 남은 과제, 관련 링크 |
| `files` | 자료 목록, 단계·유형·버전·원본 URL·접근 안내 |
| `updates` / `sources` | 날짜별 기록과 근거 문서 |

`status` 값은 `done`(완료), `active`(진행 중), `review`(검증 중), `planned`(예정) 중 하나입니다. 성과물은 `statusLabel`에 구체적인 상태 문구를 적을 수 있습니다. 목표일은 `date`에 `YYYY-MM-DD` 형식으로 기록하고, 실제 완료일은 `completedAt`에 따로 기록합니다. 미정 값은 `null`을 사용합니다. 공통 자료는 `stageId: null`로 분류합니다.

현재 집계는 완료 2개 / 작업·완료기록 42개(반올림 5%)입니다. 기존 2/12(17%)에서 2/42(5%)로 바뀐 것은 작업 세분화에 따른 분모 변경이며 실적 감소를 뜻하지 않습니다. 진행 중인 작업의 부분 완료율·시간 가중치는 이번 입력에 없으므로 계산하지 않습니다. 비교할 때 `progressBasis`와 변경 기록을 함께 남깁니다.

## 새 공개 저장소와 GitHub Pages 설정

1. GitHub 계정 `ETTE154`에서 새 **Public** 저장소 `WEAVE-Project-Site`를 생성합니다. 이 로컬 폴더의 내용을 저장소 루트로 업로드합니다.
2. 기본 브랜치를 `main`으로 사용합니다. 다른 브랜치를 사용할 경우 `.github/workflows/pages.yml`의 `on.push.branches`도 변경합니다.
3. 저장소 **Settings → Pages → Build and deployment → Source**에서 **GitHub Actions**를 선택합니다.
4. **Actions → Deploy GitHub Pages → Run workflow**를 실행하거나 `main`에 변경을 푸시합니다.
5. 작업이 성공하면 **Settings → Pages** 또는 `github-pages` 배포 환경에서 실제 사이트 주소를 확인합니다.

위 계정과 저장소명을 사용하면 예상 주소는 `https://ette154.github.io/WEAVE-Project-Site/`입니다. 이 주소는 배포 성공 전에는 동작이 보장되지 않습니다.

워크플로는 공식 Pages Actions를 사용합니다. 소스 패키징에는 `contents: read`와 `pages: read`, 배포 작업에는 `pages: write`와 `id-token: write`를 부여하고 `github-pages` 환경에 배포합니다. GitHub의 [사용자 정의 Pages 워크플로 문서](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)를 기준으로 작성했습니다.

## 공개 운영 후 비공개 저장소 전환

현재는 공개 가능한 자료로 Public 저장소와 공개 페이지를 운영합니다. GitHub Pro 전환이 완료된 뒤 저장소를 Private으로 변경해도 Pro에서는 비공개 저장소의 Pages 배포를 사용할 수 있습니다. 자세한 플랜 지원 범위는 [GitHub Pages 안내](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages)를 확인합니다.

**저장소를 Private으로 바꾸는 것과 사이트 방문을 제한하는 것은 별도입니다. GitHub Pro의 Pages 사이트는 공개됩니다.** 방문 제한이 있는 비공개 프로젝트 Pages에는 GitHub Enterprise Cloud 조직의 접근 제어가 필요합니다. 페이지 자체의 비공개 운영이 목표라면 접근 제어가 가능한 환경을 선택해야 합니다. [Pages 공개 범위·접근 제어 문서](https://docs.github.com/en/enterprise-cloud@latest/pages/getting-started-with-github-pages/changing-the-visibility-of-your-github-pages-site)

Private 전환 후에는 Pages 배포와 외부 링크를 다시 확인합니다. 원본 자료 저장소가 비공개라면 해당 저장소 권한이 있는 사용자만 파일 링크를 열 수 있습니다. 페이지에 직접 배포한 JSON과 이미지 등은 공개 사이트에서 내려받을 수 있으므로 공개 가능한 내용으로 유지합니다.
