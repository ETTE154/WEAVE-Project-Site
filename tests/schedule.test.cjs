'use strict';

const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const schedule = require('../app.js');
const data = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/project.json'), 'utf8'));

test('rejects impossible, missing, and non-ISO dates', () => {
  for (const value of [null, '', '2026-02-29', '2026-13-01', '2026-10-32', '2026-2-01', '2026-10-18T00:00:00Z']) {
    assert.equal(schedule.parseDate(value), null);
  }
  assert.equal(schedule.isoDate(schedule.parseDate('2024-02-29')), '2024-02-29');
});

test('timeline includes both boundary dates and rejects reversed bounds', () => {
  const period = schedule.timeline(data.project);
  assert.equal(data.project.scheduleStart, '2026-09-14');
  assert.equal(data.project.scheduleEnd, '2026-12-31');
  assert.equal(period.days, 109);
  assert.equal(schedule.timeline({scheduleStart: '2026-12-31', scheduleEnd: '2026-09-01'}), null);
  assert.equal(schedule.timeline({}), null);
});

test('actual completion remains a point even if a planned range is present', () => {
  const actual = schedule.taskRange({status: 'done', completedAt: '2026-09-17', startDate: '2026-09-01', date: '2026-10-31'});
  assert.equal(actual.start, schedule.parseDate('2026-09-17'));
  assert.equal(actual.start, actual.end);
  assert.equal(actual.recorded, true);
  assert.equal(schedule.taskRange({status: 'planned', startDate: '2026-10-30', date: '2026-10-19'}), null);
});

test('inclusive bars and partial ranges remain inside the chart', () => {
  const period = schedule.timeline({scheduleStart: '2026-12-01', scheduleEnd: '2026-12-31'});
  const full = schedule.position({start: period.start, end: period.end}, period);
  assert.equal(full.left, 0);
  assert.equal(full.width, 100);
  const last = schedule.position({start: period.end, end: period.end}, period);
  assert.ok(Math.abs(last.left + last.width - 100) < 1e-10);
  const clipped = schedule.position({start: period.start - schedule.DAY, end: period.start}, period);
  assert.equal(clipped.left, 0);
  assert.ok(clipped.width > 0 && clipped.width < 100);
  assert.equal(schedule.position({start: period.end + schedule.DAY, end: period.end + schedule.DAY}, period), null);
});

test('month and Monday ticks cover September through December without drift', () => {
  const period = schedule.timeline(data.project);
  const months = schedule.months(period);
  assert.deepEqual(months.map(item => item.label), ['9월', '10월', '11월', '12월']);
  assert.ok(Math.abs(months.reduce((total, item) => total + item.width, 0) - 100) < 1e-10);
  const weeks = schedule.weeks(period);
  assert.equal(weeks[0].date, '2026-09-14');
  for (const tick of weeks.slice(1)) assert.equal(new Date(tick.date + 'T00:00:00Z').getUTCDay(), 1);
  assert.ok(weeks.every(tick => tick.left >= 0 && tick.left < 100));
});

test('today uses Korean time at the UTC day boundary', () => {
  assert.equal(schedule.todayInSeoul(new Date('2026-10-18T14:59:59Z')), '2026-10-18');
  assert.equal(schedule.todayInSeoul(new Date('2026-10-18T15:00:00Z')), '2026-10-19');
});

test('all forty-two tasks have a range and proposals finish within December', () => {
  assert.equal(data.milestones.length, 42);
  assert.equal(new Set(data.milestones.map(task => task.id)).size, 42);
  const period = schedule.timeline(data.project);
  const done = data.milestones.filter(task => task.status === 'done');
  assert.equal(done.length, 2);
  assert.deepEqual(Object.fromEntries(done.map(task => [task.id, task.completedAt])), {
    'hardware-design': '2026-09-29',
    'capture-legacy': '2026-09-17'
  });
  assert.equal(data.milestones.filter(task => task.scheduleStatus === 'proposed').length, 40);
  for (const task of data.milestones) {
    const range = schedule.taskRange(task);
    assert.ok(range, task.id);
    assert.ok(range.start >= period.start && range.end <= period.end, task.id);
    assert.equal(task.scheduleStatus, range.recorded ? 'recorded' : 'proposed');
    if (range.recorded) {
      assert.equal(range.start, range.end, task.id);
      assert.equal(schedule.isoDate(range.start), task.completedAt, task.id);
    } else {
      assert.ok(task.startDate >= '2026-10-19', task.id);
      assert.equal(task.completedAt, null, task.id);
    }
  }
  assert.equal(data.project.baselineDate, '2026-09-29');
  assert.equal(data.project.updatedAt, '2026-10-19');
  assert.equal(data.project.scheduleUpdatedAt, '2026-10-18');
});

test('each stage retains its detailed task IDs and completed baseline records', () => {
  const expectedStages = {
    hardware: ['hardware-design', ...Array.from({length: 10}, (_, index) => `m1-${String(index + 1).padStart(2, '0')}`)],
    capture: ['capture-legacy', ...Array.from({length: 10}, (_, index) => `m2-${String(index + 1).padStart(2, '0')}`)],
    decomposition: Array.from({length: 10}, (_, index) => `m3-${String(index + 1).padStart(2, '0')}`),
    learning: [...Array.from({length: 9}, (_, index) => `m4-${String(index + 1).padStart(2, '0')}`), 'learning-evaluate']
  };
  assert.deepEqual(data.stages.map(stage => stage.id).sort(), Object.keys(expectedStages).sort());
  for (const [stageId, expectedIds] of Object.entries(expectedStages)) {
    assert.deepEqual(data.milestones.filter(task => task.stageId === stageId).map(task => task.id).sort(), expectedIds.sort(), stageId);
  }
});

test('M1 through M4 gates and real-robot evaluation keep the supplied target dates', () => {
  const byId = new Map(data.milestones.map(task => [task.id, task]));
  const gates = [
    ['M1', 'm1-10', '2026-11-20'],
    ['M2', 'm2-10', '2026-11-27'],
    ['M3', 'm3-10', '2026-12-11'],
    ['M4', 'learning-evaluate', '2026-12-30']
  ];
  for (const [label, id, date] of gates) {
    const task = byId.get(id);
    assert.ok(task, id);
    assert.ok(task.title.startsWith(`${label} 게이트:`), id);
    assert.equal(task.date, date, id);
    assert.equal(task.scheduleStatus, 'proposed', id);
  }
  const evaluation = byId.get('m4-09');
  assert.equal(evaluation.title, '실로봇 평가');
  assert.equal(evaluation.startDate, '2026-12-21');
  assert.equal(evaluation.date, '2026-12-24');
  assert.deepEqual(byId.get('learning-evaluate').dependencies, ['m4-09']);
});

test('dependencies exist, are acyclic, and finish before successors start', () => {
  const byId = new Map(data.milestones.map(task => [task.id, task]));
  const visiting = new Set(), visited = new Set();
  function visit(task) {
    assert.ok(!visiting.has(task.id), `Cycle at ${task.id}`);
    if (visited.has(task.id)) return;
    visiting.add(task.id);
    for (const id of task.dependencies) {
      const previous = byId.get(id);
      assert.ok(previous, `${task.id}: missing ${id}`);
      assert.ok(schedule.taskRange(previous).end < schedule.taskRange(task).start, `${id} must finish before ${task.id}`);
      visit(previous);
    }
    visiting.delete(task.id);
    visited.add(task.id);
  }
  data.milestones.forEach(visit);
});

test('all tasks retain the requested fabrication, testing, data, and learning ownership', () => {
  const byId = new Map(data.milestones.map(task => [task.id, task]));
  for (const id of ['hardware-design', 'm1-01', 'm1-03', 'm1-04', 'm1-05', 'm1-06', 'm1-10']) {
    assert.equal(byId.get(id).owner, '전채욱', id);
  }
  for (const id of ['m1-02', 'm1-07', 'm1-08', 'm1-09']) {
    assert.equal(byId.get(id).owner, '최경철', id);
  }
  for (const task of data.milestones) {
    if (task.stageId === 'decomposition') assert.equal(task.owner, '전채욱', task.id);
    if (task.stageId === 'capture' || task.stageId === 'learning') assert.equal(task.owner, '최경철', task.id);
    assert.ok(['전채욱', '최경철'].includes(task.owner), task.id);
  }
  assert.equal(data.milestones.filter(task => task.owner === '전채욱').length, 17);
  assert.equal(data.milestones.filter(task => task.owner === '최경철').length, 25);
});
