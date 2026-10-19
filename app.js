'use strict';

const WEAVE_SCHEDULE = (() => {
  const DAY = 86400000;
  const isoDate = value => new Date(value).toISOString().slice(0, 10);
  function parseDate(value) {
    if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
    const result = Date.parse(`${value}T00:00:00Z`);
    return Number.isFinite(result) && isoDate(result) === value ? result : null;
  }
  function timeline(project) {
    const start = parseDate(project.scheduleStart), end = parseDate(project.scheduleEnd);
    return start !== null && end !== null && end >= start ? {start, end, days: (end - start) / DAY + 1} : null;
  }
  function taskRange(task) {
    const completed = parseDate(task.completedAt);
    if (task.status === 'done' && completed !== null) return {start: completed, end: completed, recorded: true};
    const start = parseDate(task.startDate), end = parseDate(task.date);
    return start !== null && end !== null && end >= start ? {start, end, recorded: false} : null;
  }
  function position(range, period) {
    if (!range || !period || range.end < period.start || range.start > period.end) return null;
    const start = Math.max(range.start, period.start), end = Math.min(range.end, period.end);
    return {left: (start - period.start) / DAY / period.days * 100,
      width: ((end - start) / DAY + 1) / period.days * 100,
      center: ((start - period.start) / DAY + 0.5) / period.days * 100};
  }
  function months(period) {
    if (!period) return [];
    const first = new Date(period.start), result = [];
    let cursor = Date.UTC(first.getUTCFullYear(), first.getUTCMonth(), 1);
    while (cursor <= period.end) {
      const date = new Date(cursor), next = Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 1);
      const range = {start: cursor, end: next - DAY};
      result.push({label: `${date.getUTCMonth() + 1}월`, ...position(range, period)});
      cursor = next;
    }
    return result;
  }
  function weeks(period) {
    if (!period) return [];
    const result = [];
    for (let day = period.start; day <= period.end; day += DAY) {
      if (day !== period.start && new Date(day).getUTCDay() !== 1) continue;
      result.push({date: isoDate(day), label: new Date(day).getUTCDate(), left: (day - period.start) / DAY / period.days * 100});
    }
    return result;
  }
  function todayInSeoul(now = new Date()) {
    const parts = Object.fromEntries(new Intl.DateTimeFormat('en-CA', {timeZone: 'Asia/Seoul', year: 'numeric', month: '2-digit', day: '2-digit'}).formatToParts(now).map(part => [part.type, part.value]));
    return `${parts.year}-${parts.month}-${parts.day}`;
  }
  return {DAY, isoDate, parseDate, timeline, taskRange, position, months, weeks, todayInSeoul};
})();
if (typeof module !== 'undefined' && module.exports) module.exports = WEAVE_SCHEDULE;

(() => {
  if (typeof document === 'undefined') return;
  const icons = {
    grid:'<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
    chart:'<path d="M4 3v17h17M8 15v-4m5 4V7m5 8V4"/>',
    layers:'<path d="m12 3 10 5-10 5L2 8l10-5Zm-9 10 9 5 9-5M3 18l9 5 9-5"/>',
    folder:'<path d="M3 7V5a2 2 0 0 1 2-2h5l2 3h7a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z"/>',
    info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v6m0-10v.1"/>',
    github:'<path d="M9 19c-4 1-4-2-6-2m12 5v-4a3.5 3.5 0 0 0-1-2.7c3.3-.4 6.8-1.6 6.8-7.3a5.7 5.7 0 0 0-1.5-4 5.2 5.2 0 0 0-.1-4s-1.3-.4-4.2 1.5a14.5 14.5 0 0 0-7.6 0C4.5-.4 3.2 0 3.2 0a5.2 5.2 0 0 0-.1 4 5.7 5.7 0 0 0-1.5 4c0 5.7 3.5 6.9 6.8 7.3A3.5 3.5 0 0 0 7.4 18v4" transform="translate(1 1) scale(.9)"/>',
    external:'<path d="M14 3h7v7m0-7L10 14M10 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5"/>',
    file:'<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Z"/><path d="M14 2v6h6M8 13h8m-8 4h5"/>',
    check:'<path d="m5 12 4 4L19 6"/>',
    clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    search:'<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>',
    close:'<path d="m6 6 12 12M18 6 6 18"/>',
    chip:'<rect x="6" y="6" width="12" height="12" rx="2"/><path d="M9 1v5m6-5v5M9 18v5m6-5v5M1 9h5m-5 6h5m12-6h5m-5 6h5"/><rect x="9" y="9" width="6" height="6" rx="1"/>',
    camera:'<path d="M3 7h4l2-3h6l2 3h4v14H3V7Z"/><circle cx="12" cy="13" r="4"/>',
    split:'<path d="M12 3v6m0 0H5v9m7-9h7v9"/><rect x="2" y="18" width="6" height="4" rx="1"/><rect x="16" y="18" width="6" height="4" rx="1"/>',
    robot:'<rect x="4" y="7" width="16" height="14" rx="3"/><path d="M12 7V3m-3 9v2m6-2v2m-6 4h6M1 12v5m22-5v5"/><circle cx="12" cy="2" r="1"/>'
  };
  const icon = name => `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name] || icons.file}</svg>`;
  const esc = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const safeUrl = value => /^https:\/\//i.test(String(value ?? '')) ? esc(value) : '#';
  const external = (url,label,classes='text-link') => `<a class="${classes}" href="${safeUrl(url)}" target="_blank" rel="noopener noreferrer">${esc(label)}${icon('external')}</a>`;
  const statuses = {done:'완료',active:'진행 중',planned:'예정',review:'검증 중'};
  const badge = (status,label) => `<span class="badge badge-${Object.hasOwn(statuses,status) ? status : 'planned'}">${esc(label || statuses[status] || '현황 미등록')}</span>`;
  const routeNames = {home:'프로젝트 홈',progress:'진행 현황·일정',deliverables:'성과물 소개',files:'파일 공유',about:'프로젝트 소개'};
  const stageIcons = ['chip','camera','split','robot'];
  let data;
  let fileStage='all',fileType='all',fileQuery='',progressStage='all',deliverableStage='all';
  const main=document.getElementById('main-content');
  const dialog=document.getElementById('detail-dialog');
  let lastDialogTrigger=null;
  document.querySelectorAll('[data-icon]').forEach(element => {element.innerHTML=icon(element.dataset.icon);});
  const stageName = id => id == null ? '공통' : data.stages.find(stage=>stage.id===id)?.title || id;
  const stageTasks = stage => data.milestones.filter(task=>task.stageId===stage.id);
  const stats = tasks => { const done=tasks.filter(task=>task.status==='done').length;return {done,total:tasks.length,percent:tasks.length?Math.round(done/tasks.length*100):0}; };
  const dateLabel = date => date ? esc(date.replaceAll('-','.')) : '일정 미정';
  const ring = ({percent},label='완료 기준') => `<div class="progress-ring" style="--progress:${percent}%" role="img" aria-label="${esc(label)} ${percent}%"><div class="ring-center"><strong>${percent}<span style="font-size:.6em">%</span></strong><small>${esc(label)}</small></div></div>`;
  const heading = (eyebrow,title,description) => `<div class="page-intro"><div><span class="eyebrow">${eyebrow}</span><h1>${title}</h1><p>${esc(description)}</p></div><span class="date-note">자료 정리일 ${dateLabel(data.project.updatedAt)}</span></div>`;
  const stageCard = (stage,index,overview=true) => {
    const s=stats(stageTasks(stage));
    return `<a href="#progress/${esc(stage.id)}" class="stage-card card ${stage.status==='active'?'active':''}">
      <div class="stage-top"><span class="stage-number">${icon(stageIcons[index])} 단계 0${index+1}</span>${badge(stage.status)}</div>
      <h3>${esc(stage.title)}</h3>
      <p class="stage-current">${esc(overview?stage.currentState:stage.description)}</p>
      <div class="stage-next"><span>다음 할 일</span><p>${esc(stage.nextAction)}</p></div>
      <div class="stage-footer"><div class="stage-progress"><span>${s.done} / ${s.total} 작업 완료</span><strong>${s.percent}%</strong></div><div class="progress-track" aria-hidden="true"><div class="progress-fill" style="width:${s.percent}%"></div></div></div>
    </a>`;
  };
  const tabs = (kind,selected,includeAll=true) => `<div class="tabs" aria-label="단계 선택">${includeAll?`<button type="button" class="tab" data-${kind}="all" aria-pressed="${selected==='all'}">전체</button>`:''}${data.stages.map(stage=>`<button type="button" class="tab" data-${kind}="${esc(stage.id)}" aria-pressed="${selected===stage.id}">${esc(stage.title)}</button>`).join('')}</div>`;

  function scheduleDates(task) {
    const range = WEAVE_SCHEDULE.taskRange(task);
    if (!range) return '일정 미정';
    const start = WEAVE_SCHEDULE.isoDate(range.start), end = WEAVE_SCHEDULE.isoDate(range.end);
    return range.recorded ? `완료 확인 ${dateLabel(end)}` : `${dateLabel(start)} ~ ${dateLabel(end)} · 제안`;
  }

  function renderGantt() {
    const period = WEAVE_SCHEDULE.timeline(data.project);
    if (!period) return '<section class="gantt-section card"><div class="empty-state">간트 차트의 시작일과 종료일을 등록해 주세요.</div></section>';
    const ticks = WEAVE_SCHEDULE.weeks(period);
    const today = WEAVE_SCHEDULE.todayInSeoul();
    const todayValue = WEAVE_SCHEDULE.parseDate(today);
    const todayPosition = WEAVE_SCHEDULE.position({start: todayValue, end: todayValue}, period);
    const lines = ticks.map(tick => `<span class="gantt-grid-line" style="left:${tick.left}%" aria-hidden="true"></span>`).join('');
    const todayLine = todayPosition ? `<span class="gantt-today-line" style="left:${todayPosition.center}%" aria-hidden="true"></span>` : '';
    const todayLabel = todayPosition ? `<span class="gantt-today-tag" style="left:${todayPosition.center}%" aria-hidden="true">오늘 ${esc(today.slice(5).replace('-', '/'))}</span>` : '';
    const groups = data.stages.map((stage, index) => {
      const tasks = stageTasks(stage);
      return `<div role="rowgroup" class="stage-${esc(stage.id)}"><div role="row" class="gantt-row gantt-stage-row"><div role="rowheader" class="gantt-label"><a class="gantt-stage-name" href="#progress/${esc(stage.id)}">${icon(stageIcons[index])}${esc(stage.title)}</a><span class="gantt-stage-count">${tasks.length}개</span></div><div role="cell" class="gantt-track gantt-stage-track">${lines}${todayLine}</div></div>${tasks.map(task => {
        const range = WEAVE_SCHEDULE.taskRange(task), placement = WEAVE_SCHEDULE.position(range, period);
        const description = `${task.title}, ${statuses[task.status] || '현황 미등록'}, ${scheduleDates(task)}, 담당 ${task.owner || '미정'}`;
        const href = `#progress/${esc(stage.id)}`;
        const bar = !placement ? '<span class="gantt-unscheduled">일정 미정 또는 표시 범위 밖</span>' : range.recorded
          ? `<a class="gantt-milestone" href="${href}" style="left:calc(${placement.center}% - 22px)" title="${esc(description)}" aria-label="${esc(description)}"><span class="gantt-diamond" aria-hidden="true"></span><span class="gantt-completed-label" aria-hidden="true">완료</span></a>`
          : `<a class="gantt-bar ${task.status === 'active' || task.status === 'review' ? 'is-active' : 'is-planned'}" href="${href}" style="left:${placement.left}%;width:${placement.width}%" title="${esc(description)}" aria-label="${esc(description)}"><span class="gantt-bar-label" aria-hidden="true">${Math.round((range.end-range.start)/WEAVE_SCHEDULE.DAY)+1}일</span></a>`;
        return `<div role="row" class="gantt-row gantt-task-row"><div role="rowheader" class="gantt-label"><a class="gantt-task-link" href="${href}"><span class="gantt-task-title">${esc(task.title)}</span><span class="gantt-task-date">${esc(statuses[task.status] || '현황 미등록')} · ${scheduleDates(task)}<span class="gantt-task-owner">담당 ${esc(task.owner || '미정')}</span></span></a></div><div role="cell" class="gantt-track gantt-task-track">${lines}${todayLine}${bar}</div></div>`;
      }).join('')}</div>`;
    }).join('');
    return `<section class="gantt-section card" aria-labelledby="gantt-title"><div class="gantt-heading"><div><h2 id="gantt-title">M1–M4 세부 작업 일정</h2><p>${dateLabel(data.project.scheduleStart)} — ${dateLabel(data.project.scheduleEnd)} · ${data.stages.length}개 마일스톤 / ${data.milestones.length}개 작업·완료기록</p></div><div class="gantt-tools"><button type="button" class="button" data-gantt-today="${todayPosition ? todayPosition.center : ''}" ${todayPosition ? '' : 'disabled'}>오늘 위치</button><a class="text-link" href="#progress">완료 기준·근거 보기 ${icon('external')}</a></div></div><div class="gantt-legend" aria-label="차트 범례"><span><i class="legend-swatch is-complete" aria-hidden="true"></i>완료 확인일</span><span><i class="legend-swatch is-active" aria-hidden="true"></i>진행 중 · 제안 기간</span><span><i class="legend-swatch is-planned" aria-hidden="true"></i>예정 · 제안 기간</span><span><i class="legend-swatch is-today" aria-hidden="true"></i>오늘 (한국 시간)</span></div><p class="gantt-scroll-hint" id="gantt-scroll-help">차트 안에서 가로·세로로 스크롤하세요. 날짜 머리글과 작업 이름은 고정됩니다.</p><div class="gantt-scroll" tabindex="0" role="region" aria-label="세부 작업 간트 차트, 가로·세로 스크롤 가능" aria-describedby="gantt-scroll-help"><div class="gantt-table" role="table" aria-label="2026년 9월부터 12월까지 세부 작업 일정"><div role="rowgroup" class="gantt-head-group"><div role="row" class="gantt-row gantt-header"><div role="columnheader" class="gantt-label">세부 작업 <span>상태 · 실적 또는 제안 기간</span></div><div role="columnheader" class="gantt-axis gantt-track" aria-label="2026년 월별·월요일 기준 주간 눈금">${WEAVE_SCHEDULE.months(period).map(month => `<span class="gantt-month" style="left:${month.left}%;width:${month.width}%">${month.label}</span>`).join('')}${ticks.map(tick => `<span class="gantt-week" style="left:${tick.left}%" title="${esc(tick.date)}">${tick.label}</span>`).join('')}${todayLine}${todayLabel}</div></div></div>${groups}</div></div><div class="gantt-footnote"><p>${esc(data.project.scheduleNote)}</p><p>◆ 완료 항목은 실제 시작 기간을 추정하지 않고 확인일 하루로 표시합니다. 기간 막대와 이름을 선택하면 단계별 완료 기준·근거를 확인할 수 있습니다.</p></div></section>`;
  }

  const frameworkVariants = {
    ko: {
      path: 'assets/figures/WEAVE_Figure1_ko', label: '한글', figureLabel: '그림 1.',
      alt: 'WEAVE 전체 프레임워크 한글판. 웨어러블 RGB-D 시연 수집, 동기화·보정, 손·물체 포즈 추출과 구간 분할·정제·리타게팅, 로봇 정책 학습·시뮬레이션·실로봇 평가를 연결합니다. 벤치 파일럿과 공개 데이터 선행 점검, 평가 피드백과 버전 추적을 포함한 제안 구조입니다.',
      caption: '웨어러블 → RGB-D 수집 → 디컴포지션·정제·리타게팅 → 로봇 학습·평가. 벤치 파일럿과 공개 데이터로 선행 작업을 준비하고, 평가 결과를 재수집·개선으로 연결합니다.',
      scope: '장치 이미지는 V10 CAD 참조이며, 전체 흐름은 제안 구조입니다. 로봇 플랫폼은 미정입니다.'
    },
    en: {
      path: 'assets/figures/WEAVE_Figure1', label: '영문', figureLabel: 'Figure 1.',
      alt: 'Proposed WEAVE framework: wearable RGB-D demonstrations, synchronization and calibration, hand and object poses, segmentation, cleaning and retargeting, policy training, simulation and real-robot evaluation. Includes a bench pilot, public-data pipeline checks, evaluation feedback and artifact tracking.',
      caption: 'Wearable demonstrations → RGB-D capture → decomposition, cleaning and retargeting → robot learning and evaluation. Bench-pilot capture and public-data checks support parallel preparation; evaluation failures guide recollection and refinement.',
      scope: 'Device images are V10 CAD references. The workflow is proposed; the robot platform remains to be determined.'
    }
  };
  let frameworkLanguage = 'ko';
  try { const saved = localStorage.getItem('weave-framework-language'); if (Object.hasOwn(frameworkVariants, saved)) frameworkLanguage = saved; } catch {}
  const frameworkLanguages = () => `<div class="framework-languages" role="group" aria-label="그림 언어"><button type="button" lang="ko" data-framework-language="ko" aria-pressed="${frameworkLanguage==='ko'}">한글</button><button type="button" lang="en" data-framework-language="en" aria-pressed="${frameworkLanguage==='en'}">English</button></div>`;
  const frameworkDownloads = () => {
    const figure = frameworkVariants[frameworkLanguage];
    return `<a class="button" data-framework-download="png" href="${figure.path}.png" download>PNG 다운로드 · ${figure.label}</a><a class="button" data-framework-download="pdf" href="${figure.path}.pdf" download>논문용 PDF · ${figure.label}</a><a class="text-link" data-framework-download="svg" href="${figure.path}.svg" target="_blank" rel="noopener noreferrer">SVG 원본 · ${figure.label}${icon('external')}</a>`;
  };
  function setFrameworkLanguage(language){
    if (!Object.hasOwn(frameworkVariants, language)) return;
    frameworkLanguage = language;
    const figure = frameworkVariants[language];
    try { localStorage.setItem('weave-framework-language', language); } catch {}
    document.querySelectorAll('[data-framework-language]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.frameworkLanguage===language)));
    document.querySelectorAll('[data-framework-image]').forEach(img => { img.src = `${figure.path}.svg`; img.alt = figure.alt; img.lang = language; });
    document.querySelectorAll('[data-framework-figure-label]').forEach(label => { label.textContent = figure.figureLabel; label.lang = language; });
    document.querySelectorAll('[data-framework-caption]').forEach(caption => { caption.textContent = figure.caption; caption.lang = language; });
    document.querySelectorAll('[data-framework-scope]').forEach(scope => { scope.textContent = figure.scope; scope.lang = language; });
    document.querySelectorAll('[data-framework-download]').forEach(link => {
      const format = link.dataset.frameworkDownload;
      link.href = `${figure.path}.${format}`;
      if (format==='svg') link.innerHTML = `SVG 원본 · ${figure.label}${icon('external')}`;
      else link.textContent = `${format==='png'?'PNG 다운로드':'논문용 PDF'} · ${figure.label}`;
    });
  }
  function renderFramework(){
    const figure = frameworkVariants[frameworkLanguage];
    return `<section id="framework-section" class="framework-section card" aria-labelledby="framework-heading" tabindex="-1"><div class="framework-heading"><div><span class="eyebrow">FIGURE 1 · WEAVE FRAMEWORK</span><h2 id="framework-heading">프로젝트 전체 흐름</h2><p>웨어러블에서 로봇 학습까지, 네 단계와 병렬 준비 경로를 한눈에 확인합니다.</p></div><div class="framework-actions">${frameworkLanguages()}<button type="button" class="button" data-framework-open>${icon('search')}확대 보기</button></div></div><figure class="framework-figure"><button type="button" class="framework-preview" data-framework-open aria-label="WEAVE 전체 프레임워크 그림 확대 보기" aria-describedby="framework-caption"><img data-framework-image src="${figure.path}.svg" width="1800" height="1140" lang="${frameworkLanguage}" alt="${figure.alt}" loading="lazy" decoding="async"></button><figcaption id="framework-caption"><strong data-framework-figure-label lang="${frameworkLanguage}">${figure.figureLabel}</strong> <span data-framework-caption lang="${frameworkLanguage}">${figure.caption}</span><span class="framework-scope" data-framework-scope lang="${frameworkLanguage}">${figure.scope}</span></figcaption></figure><div class="framework-downloads button-row">${frameworkDownloads()}<span class="framework-resolution">PNG 500 dpi · 벡터 PDF / SVG</span></div></section>`;
  }
  function showFramework(trigger){
    const figure = frameworkVariants[frameworkLanguage];
    lastDialogTrigger=trigger;
    dialog.classList.add('framework-dialog');
    document.getElementById('detail-content').innerHTML=`<div class="dialog-header"><div><span class="eyebrow">FIGURE 1</span><h2 id="detail-title">WEAVE 프로젝트 전체 흐름</h2></div><button type="button" class="close-button" data-close-dialog aria-label="상세 창 닫기">${icon('close')}</button></div><div class="framework-viewer-tools">${frameworkLanguages()}<button type="button" class="button" data-framework-zoom aria-pressed="false" aria-controls="framework-viewport">원본 크기로 확대</button><span id="framework-viewer-hint">그림을 화면 너비에 맞춰 표시합니다.</span></div><div id="framework-viewport" class="framework-viewport" role="region" aria-label="프레임워크 그림, 확대 시 가로·세로 스크롤 가능" tabindex="0"><img data-framework-image src="${figure.path}.svg" width="1800" height="1140" lang="${frameworkLanguage}" alt="${figure.alt}"></div><div class="framework-dialog-footer"><p data-framework-scope lang="${frameworkLanguage}">${figure.scope}</p><div class="button-row">${frameworkDownloads()}</div></div>`;
    dialog.showModal();
  }

  function renderHome(){
    const overall=stats(data.milestones);
    const next=data.milestones.filter(item=>item.status!=='done').sort((a,b)=>(a.date||'9999-12-31').localeCompare(b.date||'9999-12-31')).slice(0,3);
    const ownerNames=[...new Set(data.milestones.map(item=>item.owner).filter(Boolean))];
    const unassignedCount=data.milestones.filter(item=>!item.owner).length;
    const robotDecision=data.milestones.find(item=>item.id==='m4-01');
    const featured=data.deliverables.find(item=>item.image)||data.deliverables[0];
    main.innerHTML=`<section class="schedule-intro"><div><span class="eyebrow">WEAVE · PROJECT SCHEDULE</span><h1>프로젝트 일정</h1><p>M1–M4의 세부 작업과 담당자, 12월까지의 병렬 일정을 확인합니다.</p></div><div class="schedule-intro-actions"><span class="date-note">계획 갱신 ${dateLabel(data.project.scheduleUpdatedAt)}</span><button type="button" class="button" data-framework-scroll>${icon('layers')}전체 흐름 보기</button><a class="button" href="#files">${icon('folder')}프로젝트 자료</a></div></section><div class="schedule-summary"><div class="schedule-stat"><span>등록 작업 완료</span><strong>${overall.done} <small>/ ${overall.total}개 · ${overall.percent}%</small></strong><small>완료 실적을 포함한 작업 수 기준</small></div><div class="schedule-stat"><span>계획 종료</span><strong>${dateLabel(data.project.scheduleEnd)}</strong><small>최종 결과 정리 ${dateLabel(data.milestones.find(item=>item.id==='learning-evaluate')?.date)}</small><small>실로봇 평가 ${dateLabel(data.milestones.find(item=>item.id==='m4-09')?.date)}</small></div><div class="schedule-stat"><span>담당자 배정</span><strong>${ownerNames.length}명</strong><small>${ownerNames.map(owner=>esc(owner)).join(' · ')}</small><small>${unassignedCount ? unassignedCount+'개 작업 미정' : '전체 작업 배정 완료'}</small></div></div>${robotDecision ? `<p class="notice schedule-notice">${icon('info')}<span><strong>우선 결정 · ${esc(robotDecision.title)}</strong>목표 ${dateLabel(robotDecision.date)} · 담당 ${esc(robotDecision.owner || '미정')} · 수집 프로토콜과 리타게팅의 선행 조건입니다.</span></p>` : ''}${renderGantt()}${renderFramework()}
      <section class="home-intro home-context"><div class="intro-copy"><span class="eyebrow">웨어러블 데이터 · 로봇 학습</span><h2>사람의 행동에서,<br>로봇의 학습으로.</h2><p>${esc(data.project.description)}</p><div class="button-row"><a class="button button-primary" href="#progress">${icon('chart')}프로젝트 진행 현황</a><a class="button" href="#about">프로젝트 소개</a></div></div><div class="overall card">${ring(overall,'작업 완료')}<div><h2>프로젝트 진행도</h2><p class="overall-count"><strong>${overall.done}</strong> / ${overall.total} 작업 완료</p><p class="progress-note">등록된 완료 기준으로 집계<br>자료 정리일 ${dateLabel(data.project.updatedAt)}</p><a class="text-link calculation-link" href="#progress">계산 기준 보기</a></div></div></section>
      <section class="pipeline-section" aria-labelledby="pipeline-title"><div class="section-heading"><h2 id="pipeline-title">단계별 진행 현황<span class="tiny-number">4단계</span></h2><span>단계를 선택하면 세부 현황이 열립니다</span></div><div class="pipeline">${data.stages.map((stage,i)=>stageCard(stage,i)).join('')}</div></section>
      <div class="dashboard-lower"><section class="milestone-panel card"><div class="section-heading"><h2>가까운 작업 마감</h2><a class="text-link" href="#progress">전체 일정 보기</a></div><p class="panel-note">2026년 12월까지의 제안 일정이며, 가까운 마감일순으로 표시합니다.</p><ol class="milestone-list">${next.map(item=>`<li class="milestone-item"><span class="milestone-dot">${icon('clock')}</span><div><h3>${esc(item.title)}</h3><div class="milestone-meta"><span>${esc(stageName(item.stageId))}</span><span>·</span><span>목표 ${dateLabel(item.date)} · 제안</span></div></div>${badge(item.status)}</li>`).join('')}</ol></section><section class="prototype-feature card">${featured?`<div class="prototype-image">${featured.image?`<img src="${esc(data.project.heroImage||featured.image)}" alt="${esc(data.project.heroImageAlt||featured.title)}" loading="lazy"><span class="image-caption">V10 헤드기어 설계</span>`:icon('chip')}</div><div class="prototype-copy"><span class="eyebrow">대표 성과물</span>${badge(featured.status,featured.statusLabel)}<h2>${esc(featured.title)}</h2><p>${esc(featured.summary)}</p><button class="text-link" data-detail="${esc(featured.id)}">성과물 자세히 보기</button></div>`:''}</section></div>
      <section class="updates-panel"><div class="section-heading"><h2>최근 기록</h2><a class="text-link" href="#files">관련 자료 보기</a></div><div class="updates-list">${data.updates.slice(0,3).map(item=>`<article class="update-card card"><time ${item.date?`datetime="${esc(item.date)}"`:''}>${item.date?dateLabel(item.date):'기존 자료 기록'}</time><h3>${esc(item.title)}</h3><p>${esc(item.description||item.summary)}</p>${item.url?external(item.url,'근거 문서'):''}</article>`).join('')}</div></section>`;
  }

  function renderProgress(){
    const overall=stats(data.milestones);
    const stages=progressStage==='all'?data.stages:data.stages.filter(stage=>stage.id===progressStage);
    main.innerHTML=`${heading('단계별 계획과 완료 기준','진행 현황·일정','완료 기준과 근거 문서를 함께 확인합니다.')}
      <div class="progress-summary card">${ring(overall)}<div><h2>${overall.done} / ${overall.total} 등록 작업 완료</h2><p>하드웨어 설계부터 로봇 학습까지, 단계별 완료 여부를 기준으로 집계합니다.</p><details class="method-details"><summary>진행도 계산 기준</summary><p>${esc(data.project.progressBasis)} 진행 중·검증 중 항목은 완료에 포함하지 않습니다.</p></details></div></div>
      <p class="notice schedule-notice">${icon('clock')}<span><strong>2026년 12월까지의 제안 일정</strong>${esc(data.project.scheduleNote)}</span></p>
      <div class="toolbar">${tabs('progress-stage',progressStage)}</div>
      ${stages.map(stage=>{const s=stats(stageTasks(stage));return `<section class="stage-detail card">
        <div class="stage-detail-head"><div><h2>${esc(stage.title)}</h2><p>${esc(stage.description)}</p></div><div class="stage-detail-status">${badge(stage.status)} <span class="version">${s.done}/${s.total} 완료</span></div></div>
        <div class="table-wrap"><table class="data-table task-table" role="table"><thead role="rowgroup"><tr role="row"><th role="columnheader" scope="col">세부 작업 / 완료 기준</th><th role="columnheader" scope="col">상태</th><th role="columnheader" scope="col">일정</th><th role="columnheader" scope="col">담당자</th><th role="columnheader" scope="col">근거</th></tr></thead><tbody role="rowgroup">
          ${stageTasks(stage).map(task=>`<tr role="row"><td role="cell"><span class="cell-title">${esc(task.title)}</span><span class="cell-description">${esc(task.criteria)}</span></td><td role="cell"><span class="mobile-cell-label" aria-hidden="true">상태</span>${badge(task.status)}</td><td role="cell" class="subtle"><span class="cell-kicker">${task.status==='done'&&task.completedAt?'완료 실적':'계획 기간 · 제안'}</span>${scheduleDates(task)}</td><td role="cell" class="subtle nowrap"><span class="mobile-cell-label" aria-hidden="true">담당자</span>${esc(task.owner||'미정')}</td><td role="cell" class="nowrap"><span class="mobile-cell-label" aria-hidden="true">근거</span>${task.evidence?external(typeof task.evidence==='string'?task.evidence:task.evidence.url,'문서'):'<span class="subtle">미등록</span>'}</td></tr>`).join('')}
        </tbody></table></div></section>`;}).join('')}
      <section class="timeline-card card"><div class="section-heading"><h2>단계별 로드맵</h2><span>2026년 12월까지의 제안 계획 · 선후 관계 반영</span></div><div class="timeline">${data.stages.map((stage,i)=>`<div class="timeline-step"><span>단계 0${i+1}</span><h3>${esc(stage.title)}</h3><p>${esc(stageTasks(stage).find(task=>task.status!=='done')?.title||'등록 기준 완료')}</p></div>`).join('')}</div></section>`;
  }

  function deliverableCard(item){const index=data.stages.findIndex(stage=>stage.id===item.stageId);return `<article class="deliverable-card card"><div class="deliverable-visual ${item.image?'':'no-image'}">${item.image?`<img src="${esc(item.image)}" alt="${esc(item.title)}" loading="lazy">`:icon(stageIcons[index]||'layers')}</div><div class="deliverable-body"><div class="deliverable-meta"><span>${esc(stageName(item.stageId))}</span><span>·</span><span>${esc(item.version||'버전 미정')}</span></div>${badge(item.status,item.statusLabel)}<h2>${esc(item.title)}</h2><p>${esc(item.summary)}</p><button type="button" class="button" data-detail="${esc(item.id)}">성과물 상세 보기</button></div></article>`;}
  function renderDeliverables(){
    const items=data.deliverables.filter(item=>deliverableStage==='all'||item.stageId===deliverableStage);
    main.innerHTML=`${heading('설계와 구현 결과','성과물 소개','설계, 수집 도구, 데이터와 모델을 단계별로 살펴봅니다. 구현과 검증의 상태를 구분해 표시합니다.')}<div class="toolbar">${tabs('deliverable-stage',deliverableStage)}<span class="result-count">${items.length}개 성과물·계획</span></div>${items.length?`<div class="deliverable-grid">${items.map(deliverableCard).join('')}</div>`:'<div class="empty-state card">이 단계에 등록된 성과물이 없습니다.</div>'}<p class="notice">설계 자료 확보와 실물 제작·성능 검증은 별도의 상태로 관리합니다. 계획 항목은 공개된 결과물로 집계하지 않습니다.</p>`;
  }

  function renderFiles(){
    const types=[...new Set(data.files.map(file=>file.type))];
    main.innerHTML=`${heading('프로젝트 자료실','파일 공유','설계·코드·데이터·문서의 원본을 연결합니다. GitHub와 Google Drive 자료를 한곳에서 찾을 수 있습니다.')}<div class="toolbar file-toolbar"><label class="searchbox">${icon('search')}<input id="file-search" type="search" placeholder="자료명, 설명, 버전 검색" aria-label="자료 검색" value="${esc(fileQuery)}"></label><label class="field-filter"><span>단계</span><select id="file-stage" class="filter-select" aria-label="자료 단계"><option value="all">모든 단계</option>${data.stages.map(stage=>`<option value="${esc(stage.id)}" ${fileStage===stage.id?'selected':''}>${esc(stage.title)}</option>`).join('')}</select></label><label class="field-filter"><span>유형</span><select id="file-type" class="filter-select" aria-label="파일 유형"><option value="all">모든 유형</option>${types.map(type=>`<option value="${esc(type)}" ${fileType===type?'selected':''}>${esc(type)}</option>`).join('')}</select></label><span id="file-count" class="result-count" role="status"></span></div><div class="table-wrap card"><table class="data-table file-table" role="table"><thead role="rowgroup"><tr role="row"><th role="columnheader" scope="col">자료</th><th role="columnheader" scope="col">단계 / 유형</th><th role="columnheader" scope="col">버전</th><th role="columnheader" scope="col">원본 접근</th></tr></thead><tbody id="file-results" role="rowgroup"></tbody></table><div id="file-empty" class="empty-state" hidden>검색 조건에 맞는 자료가 없습니다.</div></div><p class="notice">원본 링크는 새 창에서 열립니다. GitHub 저장소와 Google Drive 자료는 각 서비스의 접근 권한에 따라 로그인이 필요할 수 있습니다.</p>`;
    filterFiles();
  }
  function filterFiles(){
    const query=fileQuery.trim().toLocaleLowerCase('ko');
    const items=data.files.filter(file=>(fileStage==='all'||file.stageId===fileStage)&&(fileType==='all'||file.type===fileType)&&`${file.title||file.name} ${file.description||''} ${file.version||''} ${file.type}`.toLocaleLowerCase('ko').includes(query));
    document.getElementById('file-results').innerHTML=items.map(file=>`<tr role="row"><td role="cell"><div class="file-type">${icon('file')}<div><span class="cell-title">${esc(file.title||file.name)}</span><span class="cell-description">${esc(file.description)}</span></div></div></td><td role="cell"><span class="mobile-cell-label" aria-hidden="true">단계 / 유형</span><span class="cell-title regular-weight">${esc(stageName(file.stageId))}</span><span class="cell-description">${esc(file.type)}</span></td><td role="cell" class="nowrap"><span class="mobile-cell-label" aria-hidden="true">버전</span><span class="version">${esc(file.version||'—')}</span>${file.updatedAt?`<span class="cell-description">${dateLabel(file.updatedAt)}</span>`:''}</td><td role="cell" class="nowrap"><span class="mobile-cell-label" aria-hidden="true">원본 접근</span>${external(file.url,file.provider||(/drive.google/.test(file.url)?'Drive':'GitHub'))}<span class="cell-description">${esc(file.access||'원본 권한 적용')}</span></td></tr>`).join('');
    document.getElementById('file-count').textContent=`${items.length} / ${data.files.length}개 자료`;
    document.getElementById('file-empty').hidden=items.length>0;
  }

  function renderAbout(){
    main.innerHTML=`${heading('WEAVE 프레임워크','프로젝트 소개',data.project.title)}${renderFramework()}<div class="about-grid"><section class="about-card card"><span class="eyebrow">프로젝트 목표</span><h2>사람의 시연을 재현 가능한 학습 데이터로</h2><p>${esc(data.project.description)}</p><p>웨어러블 장치, 수집 도구, 작업 분해와 데이터 정제, 로봇 학습을 하나의 흐름으로 연결합니다. 각 실험의 하드웨어·데이터·주석·모델 버전을 함께 기록하여 결과를 추적할 수 있도록 합니다.</p><ul><li>사람의 작업을 기록하기 위한 웨어러블 기기 개발</li><li>센서 데이터 수집과 시간 동기화·품질 검증</li><li>디컴포지션을 통한 작업 분할·주석·정제</li><li>정제된 데이터 기반 로봇 모델 학습과 평가</li></ul></section><section class="about-card card"><span class="eyebrow">기반 자료와 연결</span><h2>프로젝트 정보</h2><dl><dt>프로젝트</dt><dd>WEAVE Robot Learning</dd><dt>현재 기반 자료</dt><dd>V10 웨어러블 설계 · Astra 수집 프로그램</dd><dt>저장소</dt><dd>${external(data.project.repositoryUrl,'WEAVE-Robot-Learning-Drive')}</dd><dt>대용량 자료</dt><dd>${external(data.project.driveUrl,'Google Drive 자료 폴더')}</dd><dt>자료 정리일</dt><dd>${dateLabel(data.project.updatedAt)}</dd></dl></section></div><section class="about-pipeline card"><h2>프레임워크 구성</h2><div class="pipeline">${data.stages.map((stage,i)=>stageCard(stage,i,false)).join('')}</div></section><section class="source-list card"><h2>관련 문서</h2>${data.sources.map(source=>external(source.url,source.title||source.label)).join('')}</section>`;
  }

  function showDetail(id,trigger){
    const item=data.deliverables.find(entry=>entry.id===id);if(!item)return;
    lastDialogTrigger=trigger;
    dialog.classList.remove('framework-dialog');
    document.getElementById('detail-content').innerHTML=`<div class="dialog-header"><div>${badge(item.status,item.statusLabel)}<h2 id="detail-title">${esc(item.title)}</h2><span class="version">${esc(stageName(item.stageId))} · ${esc(item.version||'버전 미정')}</span></div><button type="button" class="close-button" data-close-dialog aria-label="상세 창 닫기">${icon('close')}</button></div><div class="dialog-body">${item.image?`<img class="dialog-image" src="${esc(item.image)}" alt="${esc(item.title)}">`:''}<p>${esc(item.summary)}</p>${item.details?.length?`<h3>확보한 내용</h3><ul>${item.details.map(detail=>`<li>${esc(detail)}</li>`).join('')}</ul>`:''}${item.limitations?.length?`<h3>남은 과제</h3><ul>${item.limitations.map(detail=>`<li>${esc(detail)}</li>`).join('')}</ul>`:''}<div class="button-row">${(item.links||[]).map(link=>external(link.url,link.label,'button')).join('')}</div></div>`;
    dialog.showModal();
  }
  function renderRoute(moveFocus=false){
    const [requested,stage]=location.hash.slice(1).split('/');
    const route=Object.hasOwn(routeNames,requested)?requested:'home';
    if(route==='progress')progressStage=data.stages.some(item=>item.id===stage)?stage:'all';
    document.getElementById('page-label').textContent=routeNames[route];
    document.title=`${routeNames[route]} · WEAVE`;
    document.querySelectorAll('[data-route]').forEach(link=>{if(link.dataset.route===route)link.setAttribute('aria-current','page');else link.removeAttribute('aria-current');});
    ({home:renderHome,progress:renderProgress,deliverables:renderDeliverables,files:renderFiles,about:renderAbout})[route]();
    if(dialog.open)dialog.close();
    if(moveFocus){window.scrollTo({top:0,behavior:'instant'});main.focus({preventScroll:true});}
  }
  document.addEventListener('click',event=>{
    const skip=event.target.closest('.skip-link');if(skip){event.preventDefault();main.focus({preventScroll:true});main.scrollIntoView({behavior:'instant'});return;}
    const frameworkJump=event.target.closest('[data-framework-scroll]');if(frameworkJump){const section=document.getElementById('framework-section');section?.scrollIntoView({behavior:'instant',block:'start'});section?.focus({preventScroll:true});return;}
    const frameworkLanguageButton=event.target.closest('[data-framework-language]');if(frameworkLanguageButton){setFrameworkLanguage(frameworkLanguageButton.dataset.frameworkLanguage);return;}
    const frameworkOpen=event.target.closest('[data-framework-open]');if(frameworkOpen){showFramework(frameworkOpen);return;}
    const frameworkZoom=event.target.closest('[data-framework-zoom]');if(frameworkZoom){const viewport=document.getElementById('framework-viewport');const zoomed=viewport.classList.toggle('is-zoomed');frameworkZoom.setAttribute('aria-pressed',String(zoomed));frameworkZoom.textContent=zoomed?'화면에 맞추기':'원본 크기로 확대';document.getElementById('framework-viewer-hint').textContent=zoomed?'가로·세로로 스크롤하여 세부 내용을 확인하세요.':'그림을 화면 너비에 맞춰 표시합니다.';viewport.scrollTo({left:0,top:0,behavior:'instant'});return;}
    const todayButton=event.target.closest('[data-gantt-today]');if(todayButton){const scroller=main.querySelector('.gantt-scroll'),table=main.querySelector('.gantt-table'),label=main.querySelector('.gantt-label');if(scroller&&table&&label&&todayButton.dataset.ganttToday){const labelWidth=label.getBoundingClientRect().width;const point=labelWidth+(table.scrollWidth-labelWidth)*Number(todayButton.dataset.ganttToday)/100;scroller.scrollTo({left:Math.max(0,point-labelWidth-(scroller.clientWidth-labelWidth)/2),behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});}return;}
    const detail=event.target.closest('[data-detail]');if(detail){showDetail(detail.dataset.detail,detail);return;}
    if(event.target.closest('[data-close-dialog]')){dialog.close();return;}
    const progress=event.target.closest('[data-progress-stage]');if(progress){const id=progress.dataset.progressStage;const newHash=id==='all'?'#progress':`#progress/${id}`;if(location.hash===newHash){progressStage=id;renderProgress();}else location.hash=newHash;return;}
    const deliverable=event.target.closest('[data-deliverable-stage]');if(deliverable){deliverableStage=deliverable.dataset.deliverableStage;renderDeliverables();main.querySelector(`[data-deliverable-stage="${deliverableStage}"]`)?.focus();}
  });
  document.addEventListener('input',event=>{if(event.target.id==='file-search'){fileQuery=event.target.value;filterFiles();}});
  document.addEventListener('focusin',event=>{
    const marker=event.target.closest('.gantt-bar, .gantt-milestone, .gantt-task-link, .gantt-stage-name');
    if(!marker)return;
    requestAnimationFrame(()=>{
      if(!marker.isConnected||document.activeElement!==marker)return;
      const scroller=marker.closest('.gantt-scroll');
      const label=marker.closest('.gantt-row').querySelector('.gantt-label');
      let viewport=scroller.getBoundingClientRect();
      const topInset=window.matchMedia('(max-width:700px)').matches?document.querySelector('.sidebar').getBoundingClientRect().bottom:0;
      if(viewport.top<topInset+8)window.scrollBy({top:viewport.top-topInset-8,behavior:'instant'});
      else if(viewport.bottom>window.innerHeight-8){
        const offset=viewport.height<=window.innerHeight-topInset-16?viewport.bottom-window.innerHeight+8:viewport.top-topInset-8;
        window.scrollBy({top:offset,behavior:'instant'});
      }
      viewport=scroller.getBoundingClientRect();
      const bounds=marker.getBoundingClientRect();
      let left=scroller.scrollLeft, top=scroller.scrollTop;
      if(marker.matches('.gantt-bar, .gantt-milestone')){
        const visibleStart=viewport.left+label.getBoundingClientRect().width+8, visibleEnd=viewport.left+scroller.clientWidth-8;
        if(bounds.left<visibleStart)left+=bounds.left-visibleStart;
        else if(bounds.right>visibleEnd)left+=bounds.right-visibleEnd;
      }
      const headerHeight=scroller.querySelector('.gantt-head-group').getBoundingClientRect().height;
      const visibleTop=Math.max(viewport.top+headerHeight,topInset)+8, visibleBottom=Math.min(viewport.top+scroller.clientHeight,window.innerHeight)-8;
      if(bounds.top<visibleTop)top+=bounds.top-visibleTop;
      else if(bounds.bottom>visibleBottom)top+=bounds.bottom-visibleBottom;
      if(left!==scroller.scrollLeft||top!==scroller.scrollTop)scroller.scrollTo({left,top,behavior:'instant'});
    });
  });
  document.addEventListener('change',event=>{if(event.target.id==='file-stage'){fileStage=event.target.value;filterFiles();}if(event.target.id==='file-type'){fileType=event.target.value;filterFiles();}});
  dialog.addEventListener('close',()=>{dialog.classList.remove('framework-dialog');lastDialogTrigger?.isConnected&&lastDialogTrigger.focus();});
  dialog.addEventListener('click',event=>{if(event.target===dialog){const rect=dialog.getBoundingClientRect();if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)dialog.close();}});
  window.addEventListener('hashchange',()=>{if(data)renderRoute(true);});
  async function load(){try{
    const response=await fetch('data/project.json',{cache:'no-cache'});if(!response.ok)throw new Error('Project data unavailable');
    data=await response.json();
    if(!data.project||!Array.isArray(data.stages)||!Array.isArray(data.milestones)||!Array.isArray(data.files)||!Array.isArray(data.deliverables))throw new Error('Invalid project data');
    document.getElementById('footer-date').textContent=`자료 정리일 ${data.project.updatedAt.replaceAll('-','.')}`;
    renderRoute();
  }catch(error){console.error(error);main.innerHTML=`<div class="error-state card"><h1>프로젝트 자료를 불러오지 못했습니다.</h1><p>페이지를 새로고침해 주세요. 로컬에서는 README의 미리보기 서버 실행 방법을 이용하면 됩니다.</p><div class="button-row"><button class="button button-primary" id="retry-load">다시 불러오기</button>${external('https://github.com/ETTE154/WEAVE-Robot-Learning-Drive','GitHub 문서','button')}</div></div>`;document.getElementById('retry-load').addEventListener('click',load);}}
  load();
})();
