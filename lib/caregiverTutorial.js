const TUTORIAL_VERSION = 1;
const LESSONS = [
  {
    id: 'welcome', icon: 'compass-outline', title: 'A confident start with Anchor',
    summary: 'Learn the caregiver side, then see how the patient uses the care plan. Allow about ten minutes.',
    steps: ['Set up your contact details and connect a patient.', 'Build and maintain a care plan, then review check-ins and records.', 'Learn the difference between patient pairing, family access, and help notifications.'],
    tip: 'Practice examples in this guide never create patients, send messages, or change care records.',
  },
  {
    id: 'settings', icon: 'settings-outline', title: 'Make yourself reachable',
    summary: 'Start at the gear icon on your caregiver home screen.',
    steps: ['Open Settings and enter your name so your home greeting feels familiar.', 'Set Phone for caregiver calls, then tap Save changes. This is the number used by the patient’s Call Caregiver button.', 'Use Enable help notifications on each phone where you want to receive help requests.'],
    tip: 'Phone calls and push notifications are separate. Saving a phone number does not enable notifications. Push notifications need an installed Anchor build, not the browser or Expo Go.',
  },
  {
    id: 'patient', icon: 'person-add-outline', title: 'Add someone you care for', practice: 'patient',
    summary: 'Each person has their own care plan and pairing code.',
    steps: ['Tap + on caregiver home, then enter the patient’s name. Birthday and emergency contact are optional.', 'Choose Add Patient. Anchor creates the care plan and shows an eight-digit pairing code.', 'Tap the person’s card to open their medications, tasks, schedule, notes, vitals, appointments, mood, and report.'],
    tip: 'The home calendar shows the next seven days of medicines, tasks, and appointments. Tapping an entry opens the relevant care-plan area.',
  },
  {
    id: 'pairing', icon: 'key-outline', title: 'Connect the patient’s phone',
    summary: 'Patient pairing is done on the patient’s device.',
    steps: ['Open Anchor’s welcome screen on the patient’s phone and enter the eight-digit code.', 'Tap Continue. Your caregiver home card will show Connected after you refresh.', 'An unused pairing code lasts 24 hours. Get a new pairing code replaces an expired or unusable code for an unconnected patient.'],
    tip: 'Keep your caregiver account on your own device. Patient pairing codes and family codes serve different purposes.',
    question: 'Where does the patient enter their pairing code?',
    choices: ['The welcome screen on their own phone', 'The caregiver login password box', 'The Join family page'], answer: 0,
    explanation: 'The patient uses the welcome screen and Continue. Join family is for a separate, limited family view.',
  },
  {
    id: 'medications', icon: 'medical-outline', title: 'Keep medicines accurate', practice: 'medication',
    summary: 'Open a person’s care plan, then Medications.',
    steps: ['Choose + Add and enter the name, dosage, instructions, and weekdays. A medicine for specific weekdays needs a time.', 'Use ⋯ → Edit medication to make corrections. If there are multiple dose times, choose which dose to edit.', 'Use Pills remaining to enter a corrected count. Refill to full fills the count; Save count commits it.'],
    tip: 'Taken, Skipped, and Missed record different outcomes. Check your selection before recording it. On the patient side, the immediate confirmation offers Undo. Automatic pill deduction depends on the stock-counting database setup.',
  },
  {
    id: 'tasks', icon: 'checkbox-outline', title: 'Build repeatable routines', practice: 'days',
    summary: 'Tasks are recurring reminders, such as a morning walk or a daily routine.',
    steps: ['In Tasks, choose + Add. Give the task a title, optional details, weekdays, and an optional time.', 'Edit changes an existing task. Delete asks you to confirm removal.', 'The patient marks a task Done or Skipped from their home routine. The caregiver home card and Report summarize progress.'],
    tip: 'Weekdays control when the task appears. A task without a time is still due on its selected days.',
  },
  {
    id: 'schedule', icon: 'calendar-outline', title: 'Shape today’s activities', practice: 'activity',
    summary: 'Schedule is today’s activity plan. Tasks are the recurring routine.',
    steps: ['The patient’s morning check-in can generate today’s schedule. Caregivers can also use Schedule → + Add, even before a plan exists.', 'Enter an activity name, start time, and duration. Edit changes an activity; + and − adjust its duration by 15 minutes.', 'Delete activity asks for confirmation. These schedule changes apply to today only and do not change medication dose reminders.'],
    tip: 'For location check-ins, add a place under Places & NFC stickers, write a sticker, and assign the place to an activity. NFC needs a supported phone and an installed Anchor build.',
  },
  {
    id: 'notes', icon: 'document-text-outline', title: 'Leave a clear care note', practice: 'pin',
    summary: 'Notes keep instructions and updates alongside the care plan.',
    steps: ['Open Notes → + Add, then write a title and message.', 'Use Edit to update the same note. Pin puts an important note above unpinned notes; Unpin removes that priority.', 'The patient home screen highlights the top note. Delete asks you to confirm before removing it.'],
    tip: 'Keep the most useful instruction at the top, especially when the patient will see only the highlighted note on home.',
  },
  {
    id: 'records', icon: 'analytics-outline', title: 'Review visits and records',
    summary: 'The other care-plan tabs help you follow what has happened.',
    steps: ['Vitals and Mood show readings and check-ins recorded by the patient. Pull down or use Refresh care plan for the latest information.', 'Appointments opens the appointment list. Choose + Add there to enter a visit, date, time, location, and notes. Done moves a visit to Past; press and hold an upcoming visit to delete it.', 'Report shows medication and task completion over the last seven days. Caregiver home also highlights low pill stock and recorded missed doses.'],
    tip: 'A saved record is not a live connection. Refresh when checking for a recent patient action or caregiver change.',
  },
  {
    id: 'safety', icon: 'hand-left-outline', title: 'Understand help requests',
    summary: 'The patient can send I am okay, I need help, or Urgent help from their safety check-in.',
    steps: ['Caregiver home displays the latest help request. Refresh if you are expecting an update.', 'Enable help notifications from Settings on a physical phone running an installed Anchor build, and allow notification permission.', 'Call Caregiver opens the saved phone number. Emergency, call 911 opens a separate call confirmation.'],
    tip: 'A help check-in saves a request in Anchor. It does not place a phone call, and push notification delivery is not guaranteed.',
    question: 'Does tapping I need help automatically call the caregiver?',
    choices: ['Yes, it places a call', 'No, it saves a help request; calling is a separate action'], answer: 1,
    explanation: 'The request appears in Anchor. The patient uses Call Caregiver separately when they want to place a call.',
  },
  {
    id: 'family', icon: 'people-outline', title: 'Share the right kind of access',
    summary: 'Family access is a limited update view, separate from patient pairing.',
    steps: ['As the care-plan owner, open Settings and choose Make code for the person you want to share.', 'Have the family member sign in, open Family updates / Join family, and enter that eight-digit family code.', 'Family codes last seven days and can be claimed once. Family updates show medication status and care updates, without care-plan editing.'],
    tip: 'Share a family code for family updates. Share a patient pairing code only with the patient’s device.',
    question: 'What should you share with someone who only needs family updates?',
    choices: ['Your caregiver password', 'The patient’s pairing code', 'A family code made in Settings'], answer: 2,
    explanation: 'A family code provides the limited family view without sharing your account or pairing another patient device.',
  },
  {
    id: 'ready', icon: 'checkmark-circle-outline', title: 'You’re ready to build a care plan',
    summary: 'Your next steps happen in the real app. Nothing from practice is saved as care data.',
    steps: ['Save your name and caregiver call number in Settings.', 'Add a person, set up their medicines and routine, and pair their phone.', 'Review their check-ins regularly, refresh for updates, and enable help notifications on your installed phone app.'],
    tip: 'You can open this entire guide again from Settings → Caregiver tutorial.',
  },
];

function needsCaregiverTutorial(user) {
  return !!user && !user.is_anonymous && user.user_metadata?.caregiver_tutorial_version === TUTORIAL_VERSION && user.user_metadata?.caregiver_tutorial_completed !== true;
}

function tutorialProgress(value) {
  const number = Number(value);
  return Number.isInteger(number) && number >= 0 && number < LESSONS.length ? number : 0;
}

module.exports = { TUTORIAL_VERSION, LESSONS, needsCaregiverTutorial, tutorialProgress };
