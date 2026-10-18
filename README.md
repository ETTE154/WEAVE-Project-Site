# WEAVE Project Site

사람 행동 기반 로봇 학습 데이터 수집을 위한 웨어러블 기기 개발 프로젝트의 현황과 성과, 자료를 공유하는 GitHub Pages 사이트입니다. 하드웨어 → 데이터 수집 → 디컴포지션·정제 → 로봇 학습의 네 단계를 연결합니다.

별도의 패키지 설치나 빌드 과정 없이 HTML, CSS, JavaScript, JSON으로 실행합니다. 기존 자료 저장소는 원본 자료를 제공하고, 이 사이트 저장소는 소개와 진행 현황을 관리합니다.

2026-10-18 변경은 **로컬 서버 실행과 UI/UX 검증을 마친 간트 차트·12월 일정의 GitHub Pages 반영**입니다. 첫 화면을 2026년 9~12월 간트 차트로 구성했습니다. Kiro 독립 구현의 비교 범위는 별도 명세에 따라 로컬 실행·UI/UX 샘플 확인으로 유지합니다.

- [WEAVE-Robot-Learning](https://github.com/ETTE154/WEAVE-Robot-Learning)
- [WEAVE-Robot-Learning-Drive](https://github.com/ETTE154/WEAVE-Robot-Learning-Drive)

## 메뉴

| 주소 | 화면 |
| --- | --- |
| `#home` | 9~12월 전체 간트 차트, 마일스톤 진행 요약, 프로젝트 소개와 성과물 |
| `#progress` | 단계별 작업과 완료 기준, 일정·마일스톤 |
| `#deliverables` | 시제품, 프로그램, 데이터, 학습 결과 소개 |
| `#files` | 자료 검색·필터와 원본 저장소·파일 링크 |
| `#about` | 프로젝트 목적, 전체 프레임워크, 저장소 정보 |

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

홈의 첫 핵심 화면은 4단계·12개 마일스톤의 간트 차트입니다. 월·주 눈금, 한국 시간 기준 오늘선, 상태 범례, 시작·종료 날짜를 함께 표시합니다. 마일스톤 이름이나 막대를 선택하면 해당 단계의 완료 기준·근거로 이동합니다. 좁은 화면에서는 차트 내부를 좌우로 스크롤하며 왼쪽 마일스톤 이름은 고정됩니다. `오늘 위치` 버튼으로 현재 날짜를 확인할 수 있습니다.

- 완료 2개는 기존 확인일(2026-09-17, 2026-09-29)에 마커로 표시합니다. 실제 착수일·기간은 추정하지 않습니다.
- 미완료 10개의 기간은 2026-10-19부터 2026-12-30까지 구성한 **제안 일정**입니다. 원본 자료의 실적이나 확정 약속을 뜻하지 않으며 담당자는 미정입니다.
- 수집 검증 이후 정제 파이프라인·품질 평가, 학습·로봇 평가로 이어집니다. 주석 스키마와 학습 설정 정의는 선행 조건을 충족한 뒤 병행합니다.
- `project.scheduleStart` / `scheduleEnd`는 표시 범위(2026-09-01~12-31), `scheduleUpdatedAt`은 계획 갱신일(2026-10-18)입니다. 기존 자료 정리일 `updatedAt=2026-10-02`와 구분합니다.
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

초기 등록 기준은 완료 2개 / 마일스톤 12개(반올림 17%)입니다. 마일스톤 수와 범위가 변경되면 비율도 달라지므로 비교할 때 `progressBasis`와 변경 기록을 함께 남깁니다.

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
