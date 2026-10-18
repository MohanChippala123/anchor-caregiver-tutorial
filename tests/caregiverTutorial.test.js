const test = require('node:test');
const assert = require('node:assert/strict');
const { LESSONS, TUTORIAL_VERSION, needsCaregiverTutorial, tutorialProgress } = require('../lib/caregiverTutorial');
const { initialDestination } = require('../lib/startup');

const newCaregiver = { id: 'new-caregiver', user_metadata: { caregiver_tutorial_version: TUTORIAL_VERSION, caregiver_tutorial_completed: false } };

test('only newly enrolled, unfinished caregiver accounts require the tutorial', () => {
  assert.equal(needsCaregiverTutorial(newCaregiver), true);
  assert.equal(needsCaregiverTutorial({ ...newCaregiver, user_metadata: { caregiver_tutorial_version: TUTORIAL_VERSION } }), true);
  assert.equal(needsCaregiverTutorial({ ...newCaregiver, user_metadata: { ...newCaregiver.user_metadata, caregiver_tutorial_completed: true } }), false);
  assert.equal(needsCaregiverTutorial({ id: 'existing', user_metadata: {} }), false);
  assert.equal(needsCaregiverTutorial({ ...newCaregiver, is_anonymous: true }), false);
  assert.equal(needsCaregiverTutorial(null), false);
});

test('tutorial enrollment survives confirmed-email login and normal startup', async () => {
  const client = { from: () => ({ select() { return this; }, eq() { return this; }, async maybeSingle() { return { data: { role: 'caregiver' } }; } }) };
  assert.deepEqual(await initialDestination(client, { user: newCaregiver }), { route: 'CaregiverTutorial', patientId: null });
  assert.deepEqual(await initialDestination(client, { user: { ...newCaregiver, user_metadata: { ...newCaregiver.user_metadata, caregiver_tutorial_completed: true } } }), { route: 'CaregiverHome', patientId: null });
  assert.deepEqual(await initialDestination(client, { user: { id: 'existing' } }), { route: 'CaregiverHome', patientId: null });
});

test('saved tutorial progress rejects corrupt and out-of-range values', () => {
  assert.equal(tutorialProgress('5'), 5);
  for (const value of ['oops', '-1', '1.5', String(LESSONS.length), undefined]) assert.equal(tutorialProgress(value), 0);
});

test('the guide covers care-plan tabs, pairing, safety and family with valid knowledge checks', () => {
  const ids = new Set(LESSONS.map(lesson => lesson.id));
  assert.equal(ids.size, LESSONS.length);
  for (const id of ['settings', 'patient', 'pairing', 'medications', 'tasks', 'schedule', 'notes', 'records', 'safety', 'family', 'ready']) assert.ok(ids.has(id));
  for (const lesson of LESSONS.filter(item => item.question)) assert.ok(Number.isInteger(lesson.answer) && lesson.choices[lesson.answer]);
});
