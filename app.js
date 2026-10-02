'use strict';

(() => {
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
  const stageCard = (stage,index,link=true) => {const s=stats(stageTasks(stage));return `<${link?'a':'div'} ${link?`href="#progress/${esc(stage.id)}"`:''} class="stage-card card ${stage.status==='active'?'active':''}"><div class="stage-top"><span class="stage-number">0${index+1} / ${icon(stageIcons[index])}</span>${badge(stage.status)}</div><h3>${esc(stage.title)}</h3><span class="stage-en">${esc(stage.english)}</span><p class="stage-desc">${esc(stage.description)}</p><div class="stage-progress"><span>${s.done} / ${s.total} 마일스톤</span><strong>${s.percent}%</strong></div><div class="progress-track" aria-hidden="true"><div class="progress-fill" style="width:${s.percent}%"></div></div></${link?'a':'div'}>`;};
  const tabs = (kind,selected,includeAll=true) => `<div class="tabs" aria-label="단계 선택">${includeAll?`<button type="button" class="tab" data-${kind}="all" aria-pressed="${selected==='all'}">전체</button>`:''}${data.stages.map(stage=>`<button type="button" class="tab" data-${kind}="${esc(stage.id)}" aria-pressed="${selected===stage.id}">${esc(stage.title)}</button>`).join('')}</div>`;

  function renderHome(){
    const overall=stats(data.milestones);
    const next=data.milestones.filter(item=>item.status!=='done').slice(0,3);
    const featured=data.deliverables.find(item=>item.image)||data.deliverables[0];
    main.innerHTML=`<section class="home-intro"><div class="intro-copy"><span class="eyebrow">Wearable demonstration · Robot learning</span><h1>사람의 행동에서,<br>로봇의 학습으로.</h1><p>${esc(data.project.description)}</p><div class="button-row"><a class="button button-primary" href="#progress">${icon('chart')}프로젝트 진행 현황</a><a class="button" href="#about">프로젝트 소개</a></div></div><div class="overall card">${ring(overall,'등록 마일스톤')}<div><h2>프로젝트 진행도</h2><p class="overall-count"><strong>${overall.done}</strong> / ${overall.total} 마일스톤 완료</p><p class="progress-note">등록된 완료 기준으로 집계<br>자료 정리일 ${dateLabel(data.project.updatedAt)}</p><a class="text-link" href="#progress" style="margin-top:8px;font-size:.72rem">계산 기준 보기</a></div></div></section>
      <section class="pipeline-section" aria-labelledby="pipeline-title"><div class="section-heading"><h2 id="pipeline-title">프로젝트 프레임워크<span class="tiny-number">4 STAGES</span></h2><span>단계를 선택해 세부 현황 확인</span></div><div class="pipeline">${data.stages.map((stage,i)=>stageCard(stage,i)).join('')}</div></section>
      <div class="dashboard-lower"><section class="milestone-panel card"><div class="section-heading"><h2>다음 마일스톤</h2><a class="text-link" href="#progress">전체 일정 보기</a></div><ol class="milestone-list">${next.map(item=>`<li class="milestone-item"><span class="milestone-dot">${icon('clock')}</span><div><h3>${esc(item.title)}</h3><div class="milestone-meta"><span>${esc(stageName(item.stageId))}</span><span>·</span><span>${dateLabel(item.date)}</span></div></div>${badge(item.status)}</li>`).join('')}</ol></section><section class="prototype-feature card">${featured?`<div class="prototype-image">${featured.image?`<img src="${esc(featured.image)}" alt="${esc(featured.title)} 설계 렌더링" loading="lazy">`:icon('chip')}</div><div class="prototype-copy"><span class="eyebrow">Featured deliverable</span>${badge(featured.status,featured.statusLabel)}<h2>${esc(featured.title)}</h2><p>${esc(featured.summary)}</p><button class="text-link" style="background:transparent;padding:0" data-detail="${esc(featured.id)}">성과물 자세히 보기</button></div>`:''}</section></div>
      <section class="updates-panel"><div class="section-heading"><h2>최근 기록</h2><a class="text-link" href="#files">관련 자료 보기</a></div><div class="updates-list">${data.updates.slice(0,3).map(item=>`<article class="update-card card"><time ${item.date?`datetime="${esc(item.date)}"`:''}>${item.date?dateLabel(item.date):'기존 자료 기록'}</time><h3>${esc(item.title)}</h3><p>${esc(item.description||item.summary)}</p>${item.url?external(item.url,'근거 문서'):''}</article>`).join('')}</div></section>`;
  }

  function renderProgress(){
    const overall=stats(data.milestones);
    const stages=progressStage==='all'?data.stages:data.stages.filter(stage=>stage.id===progressStage);
    main.innerHTML=`${heading('Progress & roadmap','진행 현황·일정','완료 기준과 근거 문서를 함께 확인합니다. 목표일과 담당자는 확정 후 등록합니다.')}<div class="progress-summary card">${ring(overall)}<div><h2>${overall.done} / ${overall.total} 등록 마일스톤 완료</h2><p>하드웨어 설계부터 로봇 학습까지, 단계별 완료 여부를 기준으로 집계합니다.</p><details class="method-details"><summary>진행도 계산 기준</summary><p>${esc(data.project.progressBasis)} 완료된 마일스톤 수 ÷ 등록된 전체 마일스톤 수 × 100. 진행 중·검증 중 항목은 완료에 포함하지 않습니다. 전체 연구의 공식 달성률과는 구분합니다.</p></details></div></div><div class="toolbar">${tabs('progress-stage',progressStage)}</div>${stages.map(stage=>{const s=stats(stageTasks(stage));return `<section class="stage-detail card"><div class="stage-detail-head"><div><h2>${esc(stage.title)}</h2><p>${esc(stage.description)}</p></div><div>${badge(stage.status)} <span class="version">${s.done}/${s.total} 완료</span></div></div><div class="table-wrap"><table class="data-table task-table"><thead><tr><th scope="col">마일스톤 / 완료 기준</th><th scope="col">상태</th><th scope="col">목표일</th><th scope="col">담당자</th><th scope="col">근거</th></tr></thead><tbody>${stageTasks(stage).map(task=>`<tr><td><span class="cell-title">${esc(task.title)}</span><span class="cell-description">${esc(task.criteria)}</span></td><td>${badge(task.status)}</td><td class="nowrap subtle">${dateLabel(task.date)}</td><td class="subtle nowrap">${esc(task.owner||'미정')}</td><td class="nowrap">${task.evidence?external(typeof task.evidence==='string'?task.evidence:task.evidence.url,'문서'):'<span class="subtle">—</span>'}</td></tr>`).join('')}</tbody></table></div></section>`;}).join('')}<section class="timeline-card card"><div class="section-heading"><h2>단계별 로드맵</h2><span>목표 일정 확정 전 · 의존 관계 기준</span></div><div class="timeline">${data.stages.map((stage,i)=>`<div class="timeline-step"><span>PHASE 0${i+1}</span><h3>${esc(stage.title)}</h3><p>${esc(stageTasks(stage).find(task=>task.status!=='done')?.title||'등록 기준 완료')}</p></div>`).join('')}</div></section>`;
  }

  function deliverableCard(item){const index=data.stages.findIndex(stage=>stage.id===item.stageId);return `<article class="deliverable-card card"><div class="deliverable-visual ${item.image?'':'no-image'}">${item.image?`<img src="${esc(item.image)}" alt="${esc(item.title)}" loading="lazy">`:icon(stageIcons[index]||'layers')}</div><div class="deliverable-body"><div class="deliverable-meta"><span>${esc(stageName(item.stageId))}</span><span>·</span><span>${esc(item.version||'버전 미정')}</span></div>${badge(item.status,item.statusLabel)}<h2>${esc(item.title)}</h2><p>${esc(item.summary)}</p><button type="button" class="button" data-detail="${esc(item.id)}">성과물 상세 보기</button></div></article>`;}
  function renderDeliverables(){
    const items=data.deliverables.filter(item=>deliverableStage==='all'||item.stageId===deliverableStage);
    main.innerHTML=`${heading('Project deliverables','성과물 소개','설계, 수집 도구, 데이터와 모델을 단계별로 살펴봅니다. 구현과 검증의 상태를 구분해 표시합니다.')}<div class="toolbar">${tabs('deliverable-stage',deliverableStage)}<span class="result-count">${items.length}개 성과물·계획</span></div>${items.length?`<div class="deliverable-grid">${items.map(deliverableCard).join('')}</div>`:'<div class="empty-state card">이 단계에 등록된 성과물이 없습니다.</div>'}<p class="notice">설계 자료 확보와 실물 제작·성능 검증은 별도의 상태로 관리합니다. 계획 항목은 공개된 결과물로 집계하지 않습니다.</p>`;
  }

  function renderFiles(){
    const types=[...new Set(data.files.map(file=>file.type))];
    main.innerHTML=`${heading('Project resource library','파일 공유','설계·코드·데이터·문서의 원본을 연결합니다. GitHub와 Google Drive 자료를 한곳에서 찾을 수 있습니다.')}<div class="toolbar"><label class="searchbox">${icon('search')}<input id="file-search" type="search" placeholder="자료명, 설명, 버전 검색" aria-label="자료 검색" value="${esc(fileQuery)}"></label><label><select id="file-stage" class="filter-select" aria-label="자료 단계"><option value="all">모든 단계</option>${data.stages.map(stage=>`<option value="${esc(stage.id)}" ${fileStage===stage.id?'selected':''}>${esc(stage.title)}</option>`).join('')}</select></label><label><select id="file-type" class="filter-select" aria-label="파일 유형"><option value="all">모든 유형</option>${types.map(type=>`<option value="${esc(type)}" ${fileType===type?'selected':''}>${esc(type)}</option>`).join('')}</select></label><span id="file-count" class="result-count" role="status"></span></div><div class="table-wrap card"><table class="data-table file-table"><thead><tr><th scope="col">자료</th><th scope="col">단계 / 유형</th><th scope="col">버전</th><th scope="col">원본 접근</th></tr></thead><tbody id="file-results"></tbody></table><div id="file-empty" class="empty-state" hidden>검색 조건에 맞는 자료가 없습니다.</div></div><p class="notice">원본 링크는 새 창에서 열립니다. GitHub 저장소와 Google Drive 자료는 각 서비스의 접근 권한에 따라 로그인이 필요할 수 있습니다.</p>`;
    filterFiles();
  }
  function filterFiles(){
    const query=fileQuery.trim().toLocaleLowerCase('ko');
    const items=data.files.filter(file=>(fileStage==='all'||file.stageId===fileStage)&&(fileType==='all'||file.type===fileType)&&`${file.title||file.name} ${file.description||''} ${file.version||''} ${file.type}`.toLocaleLowerCase('ko').includes(query));
    document.getElementById('file-results').innerHTML=items.map(file=>`<tr><td><div class="file-type">${icon('file')}<div><span class="cell-title">${esc(file.title||file.name)}</span><span class="cell-description">${esc(file.description)}</span></div></div></td><td><span class="cell-title" style="font-weight:400">${esc(stageName(file.stageId))}</span><span class="cell-description">${esc(file.type)}</span></td><td class="nowrap"><span class="version">${esc(file.version||'—')}</span>${file.updatedAt?`<span class="cell-description">${dateLabel(file.updatedAt)}</span>`:''}</td><td class="nowrap">${external(file.url,file.provider||(/drive.google/.test(file.url)?'Drive':'GitHub'))}<span class="cell-description">${esc(file.access||'원본 권한 적용')}</span></td></tr>`).join('');
    document.getElementById('file-count').textContent=`${items.length} / ${data.files.length}개 자료`;
    document.getElementById('file-empty').hidden=items.length>0;
  }

  function renderAbout(){
    main.innerHTML=`${heading('About WEAVE','프로젝트 소개',data.project.title)}<div class="about-grid"><section class="about-card card"><span class="eyebrow">Project mission</span><h2>사람의 시연을 재현 가능한 학습 데이터로</h2><p>${esc(data.project.description)}</p><p>웨어러블 장치, 수집 도구, 작업 분해와 데이터 정제, 로봇 학습을 하나의 흐름으로 연결합니다. 각 실험의 하드웨어·데이터·주석·모델 버전을 함께 기록하여 결과를 추적할 수 있도록 합니다.</p><ul><li>사람의 작업을 기록하기 위한 웨어러블 기기 개발</li><li>센서 데이터 수집과 시간 동기화·품질 검증</li><li>디컴포지션을 통한 작업 분할·주석·정제</li><li>정제된 데이터 기반 로봇 모델 학습과 평가</li></ul></section><section class="about-card card"><span class="eyebrow">Project facts</span><h2>프로젝트 정보</h2><dl><dt>프로젝트</dt><dd>WEAVE Robot Learning</dd><dt>현재 기반 자료</dt><dd>V10 웨어러블 설계 · Astra 수집 프로그램</dd><dt>저장소</dt><dd>${external(data.project.repositoryUrl,'WEAVE-Robot-Learning-Drive')}</dd><dt>대용량 자료</dt><dd>${external(data.project.driveUrl,'Google Drive 자료 폴더')}</dd><dt>자료 정리일</dt><dd>${dateLabel(data.project.updatedAt)}</dd></dl></section></div><section class="about-pipeline card"><h2>프레임워크 구성</h2><div class="pipeline">${data.stages.map((stage,i)=>stageCard(stage,i)).join('')}</div></section><section class="source-list card"><h2>관련 문서</h2>${data.sources.map(source=>external(source.url,source.title||source.label)).join('')}</section>`;
  }

  function showDetail(id,trigger){
    const item=data.deliverables.find(entry=>entry.id===id);if(!item)return;
    lastDialogTrigger=trigger;
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
    const detail=event.target.closest('[data-detail]');if(detail){showDetail(detail.dataset.detail,detail);return;}
    if(event.target.closest('[data-close-dialog]')){dialog.close();return;}
    const progress=event.target.closest('[data-progress-stage]');if(progress){const id=progress.dataset.progressStage;const newHash=id==='all'?'#progress':`#progress/${id}`;if(location.hash===newHash){progressStage=id;renderProgress();}else location.hash=newHash;return;}
    const deliverable=event.target.closest('[data-deliverable-stage]');if(deliverable){deliverableStage=deliverable.dataset.deliverableStage;renderDeliverables();main.querySelector(`[data-deliverable-stage="${deliverableStage}"]`)?.focus();}
  });
  document.addEventListener('input',event=>{if(event.target.id==='file-search'){fileQuery=event.target.value;filterFiles();}});
  document.addEventListener('change',event=>{if(event.target.id==='file-stage'){fileStage=event.target.value;filterFiles();}if(event.target.id==='file-type'){fileType=event.target.value;filterFiles();}});
  dialog.addEventListener('close',()=>{lastDialogTrigger?.isConnected&&lastDialogTrigger.focus();});
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
