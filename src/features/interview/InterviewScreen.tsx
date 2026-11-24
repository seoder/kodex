import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  ChevronRight,
  Eye,
  EyeOff,
  Pause,
  Play,
  RotateCcw,
} from 'lucide-react-native';
import { useTheme } from '../../core/theme/ThemeContext';
import { RADIUS, SPACING, TYPOGRAPHY } from '../../core/theme/tokens';
import { useProgress } from '../../core/storage/progressStore';
import { INTERVIEW_BANK, TopicId } from '../../data/curriculum';
import {
  CodeBlock,
  PrimaryButton,
  ProgressBar,
  SurfaceCard,
  TagBadge,
  TOPIC_LABELS,
} from '../../shared/components/SwissUI';

type TopicFilter = 'all' | TopicId;
const ROUND_SECONDS = 180; // 3 minutes senior answer window

export function InterviewScreen() {
  const { palette } = useTheme();
  const { state, toggleInterviewMastered } = useProgress();

  const [filter, setFilter] = useState<TopicFilter>('all');
  const [index, setIndex] = useState(0);
  const [revealAnswer, setRevealAnswer] = useState(false);
  const [checkedRubric, setCheckedRubric] = useState<Record<number, boolean>>({});
  const [secondsLeft, setSecondsLeft] = useState(ROUND_SECONDS);
  const [timerRunning, setTimerRunning] = useState(false);

  const questions = useMemo(
    () =>
      filter === 'all'
        ? INTERVIEW_BANK
        : INTERVIEW_BANK.filter((q) => q.topic === filter),
    [filter]
  );

  const safeIndex = Math.min(index, Math.max(0, questions.length - 1));
  const current = questions[safeIndex];

  useEffect(() => {
    setIndex(0);
    setRevealAnswer(false);
    setCheckedRubric({});
    setSecondsLeft(ROUND_SECONDS);
    setTimerRunning(false);
  }, [filter]);

  useEffect(() => {
    if (!timerRunning) return;
    const id = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          setTimerRunning(false);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [timerRunning]);

  const goNext = () => {
    setIndex((i) => (i + 1) % questions.length);
    setRevealAnswer(false);
    setCheckedRubric({});
    setSecondsLeft(ROUND_SECONDS);
    setTimerRunning(false);
  };

  const masteredCount = INTERVIEW_BANK.filter((q) =>
    state.masteredInterviewIds.includes(q.id)
  ).length;
  const isMastered = current ? state.masteredInterviewIds.includes(current.id) : false;

  const mins = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
  const secs = String(secondsLeft % 60).padStart(2, '0');

  const filters: { label: string; value: TopicFilter }[] = [
    { label: 'Tümü', value: 'all' },
    { label: 'Node.js', value: 'nodejs' },
    { label: 'TypeScript', value: 'typescript' },
    { label: 'SQL', value: 'sql' },
    { label: 'Drizzle', value: 'drizzle' },
    { label: 'Mimari', value: 'architecture' },
  ];

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: palette.bg }}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.headerRow}>
        <View>
          <Text style={[TYPOGRAPHY.micro, { color: palette.textMuted }]}>
            SENIOR MÜLAKAT SİMÜLATÖRÜ
          </Text>
          <Text style={[TYPOGRAPHY.display, { color: palette.textPrimary, marginTop: 2 }]}>
            Mülakat Hazırlık
          </Text>
        </View>
        <View style={styles.readinessBox}>
          <Text style={[TYPOGRAPHY.micro, { color: palette.textMuted }]}>HAZIRLIK</Text>
          <Text style={[TYPOGRAPHY.h2, { color: palette.textPrimary }]}>
            {masteredCount}/{INTERVIEW_BANK.length}
          </Text>
        </View>
      </View>

      <View style={{ marginTop: 10 }}>
        <ProgressBar progress={masteredCount / Math.max(1, INTERVIEW_BANK.length)} height={4} />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ marginTop: 16 }}
        contentContainerStyle={{ gap: 8 }}
      >
        {filters.map((f) => {
          const active = filter === f.value;
          return (
            <Pressable
              key={f.value}
              onPress={() => setFilter(f.value)}
              style={[
                styles.filterPill,
                {
                  backgroundColor: active ? palette.accent : palette.surface,
                  borderColor: active ? palette.accent : palette.border,
                },
              ]}
            >
              <Text
                style={[
                  TYPOGRAPHY.caption,
                  { color: active ? palette.accentText : palette.textSecondary, fontWeight: '600' },
                ]}
              >
                {f.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Mock Interview Timer */}
      <SurfaceCard style={styles.timerCard}>
        <View style={styles.timerRow}>
          <View>
            <Text style={[TYPOGRAPHY.micro, { color: palette.textMuted }]}>
              CEVAP ZAMANLAYICISI (3 DK)
            </Text>
            <Text
              style={[
                TYPOGRAPHY.h1,
                {
                  color: secondsLeft === 0 ? palette.error : palette.textPrimary,
                  fontFamily: TYPOGRAPHY.mono,
                  marginTop: 2,
                },
              ]}
            >
              {mins}:{secs}
            </Text>
          </View>
          <View style={styles.timerControls}>
            <Pressable
              onPress={() => setTimerRunning((r) => !r)}
              style={[
                styles.timerBtn,
                { backgroundColor: palette.accent, borderColor: palette.accent },
              ]}
            >
              {timerRunning ? (
                <Pause size={16} color={palette.accentText} />
              ) : (
                <Play size={16} color={palette.accentText} />
              )}
            </Pressable>
            <Pressable
              onPress={() => {
                setTimerRunning(false);
                setSecondsLeft(ROUND_SECONDS);
              }}
              style={[
                styles.timerBtn,
                { backgroundColor: palette.surfaceElevated, borderColor: palette.border },
              ]}
            >
              <RotateCcw size={16} color={palette.textPrimary} />
            </Pressable>
          </View>
        </View>
      </SurfaceCard>

      {current ? (
        <SurfaceCard elevated style={styles.questionCard}>
          <View style={styles.qTopRow}>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <TagBadge label={TOPIC_LABELS[current.topic]} />
              <TagBadge label={current.level} tone="inverse" />
            </View>
            <Text style={[TYPOGRAPHY.micro, { color: palette.textMuted, fontFamily: TYPOGRAPHY.mono }]}>
              {safeIndex + 1}/{questions.length}
            </Text>
          </View>

          <Text style={[TYPOGRAPHY.h2, { color: palette.textPrimary, marginTop: 14, lineHeight: 25 }]}>
            {current.question}
          </Text>

          {current.contextCode ? (
            <View style={{ marginTop: 14 }}>
              <CodeBlock code={current.contextCode} language="sql" />
            </View>
          ) : null}

          {/* Rubric Self-Assessment */}
          <View style={[styles.rubricSection, { borderTopColor: palette.border }]}>
            <Text style={[TYPOGRAPHY.micro, { color: palette.textMuted, marginBottom: 10 }]}>
              CEVABINDA OLMASI GEREKEN KRİTERLER (KENDİNİ İŞARETLE)
            </Text>
            {current.rubricPoints.map((pt, rIdx) => {
              const checked = !!checkedRubric[rIdx];
              return (
                <Pressable
                  key={rIdx}
                  onPress={() =>
                    setCheckedRubric((prev) => ({ ...prev, [rIdx]: !prev[rIdx] }))
                  }
                  style={styles.rubricRow}
                >
                  <View
                    style={[
                      styles.checkbox,
                      {
                        backgroundColor: checked ? palette.accent : 'transparent',
                        borderColor: checked ? palette.accent : palette.borderStrong,
                      },
                    ]}
                  >
                    {checked ? <Check size={12} color={palette.accentText} strokeWidth={3} /> : null}
                  </View>
                  <Text style={[TYPOGRAPHY.body, { color: palette.textPrimary, flex: 1 }]}>
                    {pt}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <PrimaryButton
            label={revealAnswer ? 'Model Cevabı Gizle' : 'Senior Model Cevabı Göster'}
            variant="outline"
            onPress={() => setRevealAnswer((v) => !v)}
            style={{ marginTop: 14 }}
            leftIcon={
              revealAnswer ? (
                <EyeOff size={15} color={palette.textPrimary} />
              ) : (
                <Eye size={15} color={palette.textPrimary} />
              )
            }
          />

          {revealAnswer ? (
            <View style={styles.answerReveal}>
              <Text style={[TYPOGRAPHY.micro, { color: palette.textMuted }]}>
                MODEL SENIOR CEVABI
              </Text>
              <Text style={[TYPOGRAPHY.body, { color: palette.textPrimary, marginTop: 6 }]}>
                {current.modelAnswer}
              </Text>

              <View
                style={[
                  styles.trapBox,
                  {
                    backgroundColor: palette.warningBg,
                    borderColor: palette.warningBorder,
                  },
                ]}
              >
                <View style={styles.rowGap}>
                  <AlertTriangle size={15} color={palette.warning} />
                  <Text style={[TYPOGRAPHY.micro, { color: palette.warning }]}>
                    MÜLAKAT TUZAĞI
                  </Text>
                </View>
                <Text style={[TYPOGRAPHY.body, { color: palette.textPrimary, marginTop: 6 }]}>
                  {current.trapWarning}
                </Text>
              </View>

              <View style={[styles.followUpBox, { borderColor: palette.border }]}>
                <Text style={[TYPOGRAPHY.micro, { color: palette.textMuted }]}>
                  MUHTEMEL TAKİP SORUSU (FOLLOW-UP)
                </Text>
                <Text style={[TYPOGRAPHY.bodyStrong, { color: palette.textPrimary, marginTop: 4 }]}>
                  {current.followUp}
                </Text>
              </View>
            </View>
          ) : null}

          <View style={styles.actionRow}>
            <PrimaryButton
              label={isMastered ? 'Hazırım ✓' : 'Hazırım Olarak İşaretle'}
              variant={isMastered ? 'solid' : 'outline'}
              onPress={() => toggleInterviewMastered(current.id)}
              style={{ flex: 1 }}
              leftIcon={
                <CheckCircle2
                  size={15}
                  color={isMastered ? palette.accentText : palette.textPrimary}
                />
              }
            />
            <PrimaryButton
              label="Sonraki"
              onPress={goNext}
              style={{ width: 112 }}
              leftIcon={<ChevronRight size={15} color={palette.accentText} />}
            />
          </View>
        </SurfaceCard>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: 36,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  readinessBox: {
    alignItems: 'flex-end',
  },
  filterPill: {
    borderWidth: 1,
    borderRadius: RADIUS.sm,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  timerCard: {
    marginTop: 16,
    paddingVertical: 12,
  },
  timerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timerControls: {
    flexDirection: 'row',
    gap: 8,
  },
  timerBtn: {
    width: 38,
    height: 38,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  questionCard: {
    marginTop: 14,
  },
  qTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rubricSection: {
    marginTop: 18,
    paddingTop: 16,
    borderTopWidth: 1,
  },
  rubricRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 10,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  answerReveal: {
    marginTop: 18,
    gap: 12,
  },
  trapBox: {
    borderWidth: 1,
    borderRadius: RADIUS.sm,
    padding: SPACING.md,
  },
  followUpBox: {
    borderWidth: 1,
    borderRadius: RADIUS.sm,
    padding: SPACING.md,
  },
  rowGap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 18,
  },
});
