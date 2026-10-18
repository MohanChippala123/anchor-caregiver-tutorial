import React, { useEffect, useRef, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { usePreventRemove } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';
import { signOutWithCleanup } from '../lib/session';
import Button from '../components/Button';
import WeekdaySelector from '../components/WeekdaySelector';
import { CareCard, CareBody, CareInset, CareAction, CareError } from '../components/CarePlanUI';
import { NAVY, WHITE, SURFACE, BORDER, MUTED, SUCCESS_BG } from '../theme/colors';
const { LESSONS, TUTORIAL_VERSION, needsCaregiverTutorial, tutorialProgress } = require('../lib/caregiverTutorial');
const { withTimeout } = require('../lib/startup');

const inputStyle = { borderWidth: 1, borderColor: BORDER, borderRadius: 8, padding: 14, fontFamily: 'DMSans_400Regular', fontSize: 16, color: NAVY, marginBottom: 12 };

export default function CaregiverTutorialScreen({ navigation, route }) {
  const [step, setStep] = useState(0);
  const [userId, setUserId] = useState(null);
  const [review, setReview] = useState(false);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [answer, setAnswer] = useState(null);
  const [practice, setPractice] = useState(false);
  const [sampleName, setSampleName] = useState('');
  const [sampleDays, setSampleDays] = useState([]);
  const [sampleInstructions, setSampleInstructions] = useState('Take with food');
  const [demoEditor, setDemoEditor] = useState(false);
  const [showLessons, setShowLessons] = useState(false);
  const scroll = useRef(null);
  const finished = useRef(false);
  const mounted = useRef(true);
  const lesson = LESSONS[step];
  const progressKey = `anchor.caregiver-tutorial.${TUTORIAL_VERSION}.${userId}`;
  const finalStep = step === LESSONS.length - 1;

  const load = async () => {
    setError('');
    setReady(false);
    try {
      const { data: { user }, error: userError } = await withTimeout(() => supabase.auth.getUser());
      if (userError || !user || user.is_anonymous) throw new Error('Please sign in with your caregiver account to open this guide.');
      const replay = !!route?.params?.review && !needsCaregiverTutorial(user);
      const saved = replay ? null : await AsyncStorage.getItem(`anchor.caregiver-tutorial.${TUTORIAL_VERSION}.${user.id}`);
      if (!mounted.current) return;
      setUserId(user.id);
      setReview(replay);
      setStep(replay ? 0 : tutorialProgress(saved));
      setReady(true);
    } catch (err) { if (mounted.current) setError(err.message || 'Could not open the guide. Please try again.'); }
  };

  useEffect(() => { mounted.current = true; load(); return () => { mounted.current = false; }; }, []);
  usePreventRemove(!review, ({ data }) => {
    if (finished.current) navigation.dispatch(data.action);
    else setError('Complete the guide to start using Anchor. You can sign out or return later without losing your place.');
  });
  useEffect(() => {
    setAnswer(null); setPractice(false); setSampleName(''); setSampleDays([]);
    setSampleInstructions('Take with food'); setDemoEditor(false);
    scroll.current?.scrollTo({ y: 0, animated: false });
  }, [step]);

  const move = async next => {
    if (busy) return;
    setBusy(true); setError('');
    try {
      if (!review) await AsyncStorage.setItem(progressKey, String(next));
      setStep(next);
    } catch { setError('Could not save your place. Please try again.'); }
    finally { setBusy(false); }
  };

  const finish = async () => {
    if (busy) return;
    setBusy(true); setError('');
    try {
      if (!review) {
        const { data: { user }, error: userError } = await withTimeout(() => supabase.auth.getUser());
        if (userError || user?.id !== userId) throw new Error('Your session changed. Sign in again to finish the guide.');
        const { error: saveError } = await withTimeout(() => supabase.auth.updateUser({ data: { caregiver_tutorial_completed: true } }));
        if (saveError) throw saveError;
        finished.current = true;
        await AsyncStorage.removeItem(progressKey).catch(() => {});
      }
      if (review && navigation.canGoBack()) navigation.goBack();
      else navigation.reset({ index: 0, routes: [{ name: 'CaregiverHome' }] });
    } catch (err) { setError(err.message || 'Could not finish the guide. Your progress is saved; please try again.'); }
    finally { setBusy(false); }
  };

  const signOut = async () => {
    if (busy) return;
    setBusy(true); setError('');
    try {
      await signOutWithCleanup(); finished.current = true;
      navigation.reset({ index: 0, routes: [{ name: 'Landing' }] });
    } catch (err) { setError(err.message || 'Could not sign out. Please try again.'); }
    finally { setBusy(false); }
  };

  let canContinue = true;
  if (lesson.question) canContinue = answer === lesson.answer;
  if (lesson.practice === 'patient') canContinue = sampleName.trim().length > 0;
  if (lesson.practice === 'days') canContinue = sampleDays.length > 0;
  if (['medication', 'activity', 'pin'].includes(lesson.practice) || finalStep) canContinue = practice;

  return <KeyboardAvoidingView style={{ flex: 1, backgroundColor: WHITE }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
    <View style={{ paddingHorizontal: 22, paddingTop: 12, width: '100%', maxWidth: 720, alignSelf: 'center' }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Text accessibilityRole="header" style={{ flex: 1, fontFamily: 'DMSans_700Bold', fontSize: 22, color: NAVY }}>Caregiver tutorial</Text>
        <CareAction label={review ? 'Close' : 'Sign out'} onPress={review ? () => navigation.goBack() : signOut} disabled={busy} />
      </View>
      {ready && <><Text style={{ color: MUTED, fontFamily: 'DMSans_500Medium', fontSize: 13, marginBottom: 8 }}>Lesson {step + 1} of {LESSONS.length}{review ? ' · Review' : ' · Your place is saved'}</Text>
        <View accessibilityRole="progressbar" accessibilityLabel="Tutorial progress" accessibilityValue={{ min: 0, max: LESSONS.length, now: step + 1 }} style={{ height: 6, backgroundColor: SURFACE, borderRadius: 3 }}><View style={{ height: 6, width: `${((step + 1) / LESSONS.length) * 100}%`, backgroundColor: NAVY, borderRadius: 3 }} /></View></>}
      <CareError message={error} />
    </View>
    <ScrollView ref={scroll} keyboardShouldPersistTaps="handled" contentContainerStyle={{ padding: 22, width: '100%', maxWidth: 720, alignSelf: 'center' }}>
      {!ready ? error ? <Button title="Retry opening guide" onPress={load} /> : <ActivityIndicator color={NAVY} /> : <>
        {review && <><CareAction label={showLessons ? 'Hide lessons' : 'Choose a lesson'} onPress={() => setShowLessons(!showLessons)} />{showLessons && LESSONS.map((item, index) => <CareAction key={item.id} label={`${index + 1}. ${item.title}`} onPress={() => { setShowLessons(false); move(index); }} disabled={busy} />)}</>}
        <View style={{ width: 52, height: 52, backgroundColor: SURFACE, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginBottom: 16 }}><Ionicons name={lesson.icon} size={28} color={NAVY} /></View>
        <Text accessibilityRole="header" style={{ fontFamily: 'DMSans_700Bold', fontSize: 28, lineHeight: 35, color: NAVY, marginBottom: 12 }}>{lesson.title}</Text>
        <Text style={{ fontFamily: 'DMSans_400Regular', fontSize: 16, lineHeight: 25, color: MUTED, marginBottom: 22 }}>{lesson.summary}</Text>
        <CareCard>{lesson.steps.map((text, index) => <View key={text} style={{ flexDirection: 'row', gap: 12, marginBottom: index === lesson.steps.length - 1 ? 0 : 18 }}><Text style={{ fontFamily: 'DMSans_700Bold', color: NAVY, fontSize: 16 }}>{index + 1}.</Text><Text style={{ flex: 1, fontFamily: 'DMSans_400Regular', color: NAVY, fontSize: 15, lineHeight: 24 }}>{text}</Text></View>)}</CareCard>
        <CareInset><Text style={{ color: NAVY, fontFamily: 'DMSans_500Medium', fontSize: 14, lineHeight: 22 }}>{lesson.tip}</Text></CareInset>
        {!!lesson.practice && <View style={{ marginTop: 22 }}><CareCard>
          <Text style={{ color: NAVY, fontFamily: 'DMSans_700Bold', fontSize: 18, marginBottom: 6 }}>Try it safely</Text>
          <CareBody>Practice only. These examples do not change a real care plan.</CareBody>
          {lesson.practice === 'patient' && <><Text style={{ color: NAVY, marginBottom: 8 }}>Give your sample person a name</Text><TextInput accessibilityLabel="Sample patient name" placeholder="e.g. Alex" value={sampleName} onChangeText={setSampleName} maxLength={60} style={inputStyle} /><CareInset><Text style={{ color: NAVY, fontFamily: 'DMSans_700Bold', fontSize: 17 }}>{sampleName.trim() || 'Your sample person'}</Text><Text style={{ color: MUTED }}>Example pairing code: 12345678</Text></CareInset></>}
          {lesson.practice === 'medication' && <><View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}><Text style={{ color: NAVY, fontFamily: 'DMSans_700Bold' }}>Example medicine</Text><CareAction label="⋯" accessibilityLabel="Edit example medication" onPress={() => setDemoEditor(true)} /></View>{demoEditor ? <><Text style={{ color: MUTED, marginBottom: 8 }}>Change the sample instructions, then save.</Text><TextInput accessibilityLabel="Sample medication instructions" value={sampleInstructions} onChangeText={value => { setSampleInstructions(value); setPractice(false); }} style={inputStyle} /><Button title="Save example" disabled={!sampleInstructions.trim() || sampleInstructions.trim() === 'Take with food'} onPress={() => { setPractice(true); setDemoEditor(false); }} /></> : <><CareBody>{sampleInstructions}</CareBody><Text style={{ color: MUTED }}>{practice ? 'Saved in this practice example.' : 'Tap ⋯ to practice editing.'}</Text></>}</>}
          {lesson.practice === 'days' && <WeekdaySelector value={sampleDays} onChange={setSampleDays} itemLabel="sample task" />}
          {lesson.practice === 'activity' && <>{!practice ? <Button title="Add sample activity" onPress={() => setPractice(true)} /> : <CareInset><Text style={{ color: NAVY, fontFamily: 'DMSans_700Bold', fontSize: 17 }}>Afternoon walk</Text><Text style={{ color: MUTED }}>2:00 PM · 20 minutes · Today only</Text></CareInset>}</>}
          {lesson.practice === 'pin' && <><View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}><Text style={{ flex: 1, color: NAVY, fontFamily: 'DMSans_700Bold' }}>Remember your water bottle</Text><CareAction label={practice ? 'Unpin' : 'Pin'} onPress={() => setPractice(!practice)} /></View><Text style={{ color: MUTED }}>{practice ? 'Pinned: this sample note has priority.' : 'Pin the sample note to give it priority.'}</Text></>}
          {canContinue && <Text accessibilityLiveRegion="polite" style={{ color: NAVY, backgroundColor: SUCCESS_BG, padding: 12, borderRadius: 8, marginTop: 14 }}>Practice complete. You can continue.</Text>}
        </CareCard></View>}
        {!!lesson.question && <View style={{ marginTop: 22 }}><CareCard><Text style={{ color: NAVY, fontFamily: 'DMSans_700Bold', fontSize: 18, lineHeight: 26, marginBottom: 12 }}>Quick check: {lesson.question}</Text>{lesson.choices.map((choice, index) => <TouchableOpacity key={choice} accessibilityRole="radio" accessibilityState={{ checked: answer === index }} onPress={() => setAnswer(index)} style={{ minHeight: 48, padding: 14, backgroundColor: answer === index ? NAVY : SURFACE, borderRadius: 8, marginBottom: 8 }}><Text style={{ color: answer === index ? WHITE : NAVY, fontFamily: 'DMSans_500Medium', fontSize: 15, lineHeight: 23 }}>{choice}</Text></TouchableOpacity>)}{answer !== null && <Text accessibilityLiveRegion="polite" style={{ color: NAVY, fontSize: 14, lineHeight: 23, marginTop: 8 }}>{answer === lesson.answer ? 'That’s right. ' : 'Try another answer. '}{lesson.explanation}</Text>}</CareCard></View>}
        {finalStep && <TouchableOpacity onPress={() => setPractice(!practice)} accessibilityRole="checkbox" accessibilityLabel="I am ready to use Anchor" accessibilityState={{ checked: practice }} style={{ marginTop: 22, backgroundColor: SURFACE, padding: 18, borderRadius: 8, flexDirection: 'row', alignItems: 'center', gap: 12 }}><Ionicons name={practice ? 'checkbox' : 'square-outline'} size={26} color={NAVY} /><Text style={{ flex: 1, fontFamily: 'DMSans_500Medium', color: NAVY, fontSize: 16, lineHeight: 24 }}>I know how to connect a patient, manage a care plan, and find help in Anchor.</Text></TouchableOpacity>}
        {!review && <Text style={{ color: MUTED, fontSize: 12, lineHeight: 19, marginTop: 22 }}>Need a break? Close Anchor and return later. The guide resumes at this lesson.</Text>}
      </>}
    </ScrollView>
    {ready && <View style={{ borderTopWidth: 1, borderColor: BORDER, backgroundColor: WHITE, padding: 18 }}><View style={{ width: '100%', maxWidth: 676, alignSelf: 'center', flexDirection: 'row', gap: 12, alignItems: 'center' }}>
      {step > 0 && <CareAction label="Back" onPress={() => move(step - 1)} disabled={busy} />}
      <Button title={finalStep ? review ? 'Finish review' : 'Start using Anchor' : 'Continue'} onPress={finalStep ? finish : () => move(step + 1)} disabled={busy || !canContinue} loading={busy} style={{ flex: 1, borderRadius: 8 }} />
    </View></View>}
  </KeyboardAvoidingView>;
}
