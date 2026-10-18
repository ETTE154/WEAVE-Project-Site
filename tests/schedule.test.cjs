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
  assert.equal(period.days, 122);
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
  assert.equal(weeks[0].date, '2026-09-01');
  for (const tick of weeks.slice(1)) assert.equal(new Date(tick.date + 'T00:00:00Z').getUTCDay(), 1);
  assert.ok(weeks.every(tick => tick.left >= 0 && tick.left < 100));
});

test('today uses Korean time at the UTC day boundary', () => {
  assert.equal(schedule.todayInSeoul(new Date('2026-10-18T14:59:59Z')), '2026-10-18');
  assert.equal(schedule.todayInSeoul(new Date('2026-10-18T15:00:00Z')), '2026-10-19');
});

test('all twelve milestones have a range and proposals finish within December', () => {
  assert.equal(data.milestones.length, 12);
  const period = schedule.timeline(data.project);
  const done = data.milestones.filter(task => task.status === 'done');
  assert.equal(done.length, 2);
  assert.deepEqual(done.map(task => task.completedAt).sort(), ['2026-09-17', '2026-09-29']);
  for (const task of data.milestones) {
    const range = schedule.taskRange(task);
    assert.ok(range, task.id);
    assert.ok(range.start >= period.start && range.end <= period.end, task.id);
    assert.equal(task.scheduleStatus, range.recorded ? 'recorded' : 'proposed');
    if (!range.recorded) assert.ok(task.startDate >= '2026-10-19', task.id);
  }
  assert.equal(data.project.updatedAt, '2026-10-02');
  assert.equal(data.project.scheduleUpdatedAt, '2026-10-18');
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
