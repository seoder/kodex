import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import {
  AlertTriangle,
  Check,
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
  getTopicTone,
  PillButton,
  ProgressBar,
  SoftBadge,
  SoftCard,
  TOPIC_LABELS,
} from '../../shared/components/SwissUI';

type TopicFilter = 'all' | TopicId;
const ROUND_SECONDS = 180;

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
          <Text style={[TYPOGRAPHY.body, { color: palette.textMuted }]}>Mülakat Simülatörü</Text>
          <Text style={[TYPOGRAPHY.display, { color: palette.textPrimary, marginTop: 2 }]}>
            Senior Hazırlık
          </Text>
        </View>
        <SoftBadge label={`${masteredCount}/${INTERVIEW_BANK.length} Hazır`} tone="sage" />
      </View>

      <View style={{ marginTop: 14 }}>
        <ProgressBar progress={masteredCount / Math.max(1, INTERVIEW_BANK.length)} height={6} />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ marginTop: 18 }}
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
                { backgroundColor: active ? palette.primary : palette.surface },
              ]}
            >
              <Text
                style={[
                  TYPOGRAPHY.caption,
                  { color: active ? palette.primaryText : palette.textSecondary, fontWeight: '600' },
                ]}
              >
                {f.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Clean Calm Timer Strip */}
      <SoftCard style={styles.timerCard}>
        <View style={styles.timerRow}>
          <View>
            <Text style={[TYPOGRAPHY.caption, { color: palette.textMuted }]}>
              Cevap Süresi (3 dk)
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
              style={[styles.circleBtn, { backgroundColor: palette.primary }]}
            >
              {timerRunning ? (
                <Pause size={16} color={palette.primaryText} />
              ) : (
                <Play size={16} color={palette.primaryText} fill={palette.primaryText} />
              )}
            </Pressable>
            <Pressable
              onPress={() => {
                setTimerRunning(false);
                setSecondsLeft(ROUND_SECONDS);
              }}
              style={[styles.circleBtn, { backgroundColor: palette.surfaceSoft }]}
            >
              <RotateCcw size={16} color={palette.textPrimary} />
            </Pressable>
          </View>
        </View>
      </SoftCard>

      {current ? (
        <SoftCard style={{ marginTop: 16 }}>
          <View style={styles.qTopRow}>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <SoftBadge label={TOPIC_LABELS[current.topic]} tone={getTopicTone(current.topic)} />
              <SoftBadge label={current.level} tone="neutral" />
            </View>
            <Text style={[TYPOGRAPHY.caption, { color: palette.textMuted }]}>
              {safeIndex + 1}/{questions.length}
            </Text>
          </View>

          <Text style={[TYPOGRAPHY.h2, { color: palette.textPrimary, marginTop: 16, lineHeight: 26 }]}>
            {current.question}
          </Text>

          {current.contextCode ? (
            <View style={{ marginTop: 16 }}>
              <CodeBlock code={current.contextCode} language="sql" />
            </View>
          ) : null}

          <View style={[styles.rubricSection, { borderTopColor: palette.borderSubtle }]}>
            <Text style={[TYPOGRAPHY.micro, { color: palette.textMuted, marginBottom: 12 }]}>
              KENDİNİ DEĞERLENDİRME KRİTERLERİ
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
                        backgroundColor: checked ? palette.primary : palette.surfaceSoft,
                      },
                    ]}
                  >
                    {checked ? <Check size={12} color={palette.primaryText} strokeWidth={3} /> : null}
                  </View>
                  <Text style={[TYPOGRAPHY.body, { color: palette.textPrimary, flex: 1 }]}>
                    {pt}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <PillButton
            label={revealAnswer ? 'Model Cevabı Gizle' : 'Senior Model Cevabı Göster'}
            variant="soft"
            onPress={() => setRevealAnswer((v) => !v)}
            style={{ marginTop: 12 }}
            leftIcon={
              revealAnswer ? (
                <EyeOff size={15} color={palette.sageText} />
              ) : (
                <Eye size={15} color={palette.sageText} />
              )
            }
          />

          {revealAnswer ? (
            <View style={styles.answerReveal}>
              <Text style={[TYPOGRAPHY.micro, { color: palette.textMuted }]}>
                MODEL SENIOR CEVABI
              </Text>
              <Text style={[TYPOGRAPHY.body, { color: palette.textPrimary }]}>
                {current.modelAnswer}
              </Text>

              <View style={[styles.trapBox, { backgroundColor: palette.peachBg }]}>
                <View style={styles.rowGap}>
                  <AlertTriangle size={15} color={palette.peachText} />
                  <Text style={[TYPOGRAPHY.micro, { color: palette.peachText }]}>
                    MÜLAKAT TUZAĞI
                  </Text>
                </View>
                <Text style={[TYPOGRAPHY.body, { color: palette.textPrimary, marginTop: 6 }]}>
                  {current.trapWarning}
                </Text>
              </View>

              <View style={[styles.followUpBox, { backgroundColor: palette.surfaceSoft }]}>
                <Text style={[TYPOGRAPHY.micro, { color: palette.textMuted }]}>
                  TAKİP SORUSU
                </Text>
                <Text style={[TYPOGRAPHY.bodyStrong, { color: palette.textPrimary, marginTop: 4 }]}>
                  {current.followUp}
                </Text>
              </View>
            </View>
          ) : null}

          <View style={styles.actionRow}>
            <PillButton
              label={isMastered ? 'Hazırım ✓' : 'Hazırım'}
              variant={isMastered ? 'primary' : 'outline'}
              onPress={() => toggleInterviewMastered(current.id)}
              style={{ flex: 1 }}
            />
            <PillButton
              label="Sonraki"
              onPress={goNext}
              style={{ width: 120 }}
              leftIcon={<ChevronRight size={15} color={palette.primaryText} />}
            />
          </View>
        </SoftCard>
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
    alignItems: 'center',
  },
  filterPill: {
    borderRadius: RADIUS.pill,
    paddingHorizontal: 16,
    paddingVertical: 9,
  },
  timerCard: {
    marginTop: 18,
    paddingVertical: 14,
  },
  timerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timerControls: {
    flexDirection: 'row',
    gap: 10,
  },
  circleBtn: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.pill,
    alignItems: 'center',
    justifyContent: 'center',
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
    gap: 12,
    marginBottom: 12,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: RADIUS.pill,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  answerReveal: {
    marginTop: 18,
    gap: 12,
  },
  trapBox: {
    borderRadius: RADIUS.md,
    padding: 14,
  },
  followUpBox: {
    borderRadius: RADIUS.md,
    padding: 14,
  },
  rowGap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 20,
  },
});
