import React, { useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Check, ChevronRight, Flame, Moon, Sun } from 'lucide-react-native';
import { useTheme } from '../../core/theme/ThemeContext';
import { RADIUS, SPACING, TYPOGRAPHY } from '../../core/theme/tokens';
import { useProgress } from '../../core/storage/progressStore';
import {
  ALL_MODULES,
  getModulesByLevel,
  LEVEL_META,
  LevelNumber,
  ModuleItem,
} from '../../data/curriculum';
import {
  getTopicTone,
  GoalArcGauge,
  PillButton,
  PillTabs,
  SoftBadge,
  SoftCard,
  TOPIC_LABELS,
} from '../../shared/components/SwissUI';
import { getTopicIllustration } from '../../shared/assets';

interface PathScreenProps {
  onStartModule: (moduleId: string) => void;
}

const WEEK_DAYS = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];

export function PathScreen({ onStartModule }: PathScreenProps) {
  const { palette, mode, toggleTheme } = useTheme();
  const { state } = useProgress();
  const [selectedLevel, setSelectedLevel] = useState<LevelNumber>(1);

  const levelModules = useMemo(() => getModulesByLevel(selectedLevel), [selectedLevel]);
  const levelMeta = LEVEL_META[selectedLevel];

  const nextModule = useMemo<ModuleItem>(() => {
    const firstIncomplete = ALL_MODULES.find(
      (mod) => !mod.steps.every((s) => state.completedStepIds.includes(s.id))
    );
    return firstIncomplete ?? ALL_MODULES[0];
  }, [state.completedStepIds]);

  const nextModuleHasProgress = nextModule.steps.some((s) =>
    state.completedStepIds.includes(s.id)
  );
  const totalSteps = ALL_MODULES.reduce((acc, m) => acc + m.steps.length, 0);
  const overallProgress = totalSteps > 0 ? state.completedStepIds.length / totalSteps : 0;
  const dailyProgress = Math.min(1, state.dailyXp / Math.max(1, state.dailyGoal));
  const todayIdx = (new Date().getDay() + 6) % 7;

  const ctaLabel = nextModuleHasProgress
    ? `${nextModule.title} dersine devam et`
    : `${nextModule.title} dersine başla`;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: palette.bg }}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      {/* Minimalist Header */}
      <View style={styles.header}>
        <View style={{ flex: 1, paddingRight: 12 }}>
          <Text style={[TYPOGRAPHY.caption, { color: palette.textMuted }]}>
            Backend & Mülakat
          </Text>
          <Text style={[TYPOGRAPHY.display, { color: palette.textPrimary, marginTop: 2 }]}>
            KODEX
          </Text>
        </View>

        <View style={styles.headerActions}>
          <View
            accessible
            accessibilityLabel={`${state.streak} günlük seri`}
            style={[styles.streakChip, { backgroundColor: palette.surface }]}
          >
            <Flame size={15} color={palette.coral} strokeWidth={2.2} />
            <Text style={[TYPOGRAPHY.caption, { color: palette.textPrimary, fontWeight: '700' }]}>
              {state.streak}g
            </Text>
          </View>
          <Pressable
            onPress={toggleTheme}
            accessibilityRole="button"
            accessibilityLabel={mode === 'dark' ? 'Açık temaya geç' : 'Karanlık temaya geç'}
            style={[styles.circleBtn, { backgroundColor: palette.surface }]}
          >
            {mode === 'dark' ? (
              <Sun size={19} color={palette.textPrimary} strokeWidth={1.9} />
            ) : (
              <Moon size={19} color={palette.textPrimary} strokeWidth={1.9} />
            )}
          </Pressable>
        </View>
      </View>

      {/* Single Primary Focus Card: Goal + Outcome-Predicting Next Action */}
      <SoftCard style={styles.focusCard}>
        <Image
          source={getTopicIllustration(nextModule.topic)}
          style={styles.focusCover}
          resizeMode="cover"
        />

        <View style={styles.focusBody}>
          <View style={styles.focusTopRow}>
            <GoalArcGauge
              progress={Math.max(dailyProgress, overallProgress)}
              centerValue={`%${Math.round(overallProgress * 100)}`}
              centerLabel={`${state.xp} XP`}
            />
            <View style={{ flex: 1 }}>
              <SoftBadge
                label={`Seviye 0${nextModule.level} · ${nextModule.durationMin} dk`}
                tone={getTopicTone(nextModule.topic)}
              />
              <Text style={[TYPOGRAPHY.h3, { color: palette.textPrimary, marginTop: 8 }]}>
                {nextModule.title}
              </Text>
              <Text style={[TYPOGRAPHY.caption, { color: palette.textMuted, marginTop: 4 }]}>
                Bugün {state.dailyXp} / {state.dailyGoal} XP
              </Text>
            </View>
          </View>

          <PillButton
            label={ctaLabel}
            onPress={() => onStartModule(nextModule.id)}
            style={{ marginTop: 18 }}
          />
        </View>
      </SoftCard>

      {/* Quiet 7-Day Rhythm Strip */}
      <SoftCard style={styles.weekCard}>
        <View style={styles.weekRow}>
          {WEEK_DAYS.map((day, idx) => {
            const isToday = idx === todayIdx;
            const isPastDone = idx < todayIdx && idx >= Math.max(0, todayIdx - state.streak + 1);
            const dotBg = isToday
              ? palette.coral
              : isPastDone
                ? palette.primary
                : palette.surfaceSoft;

            return (
              <View
                key={day}
                accessible
                accessibilityLabel={`${day}: ${isToday ? 'Bugün' : isPastDone ? 'Tamamlandı' : 'Bekliyor'}`}
                style={styles.dayCol}
              >
                <Text
                  style={[
                    TYPOGRAPHY.caption,
                    {
                      fontSize: 11,
                      color: isToday ? palette.textPrimary : palette.textMuted,
                      fontWeight: isToday ? '700' : '500',
                      marginBottom: 8,
                    },
                  ]}
                >
                  {day}
                </Text>
                <View style={[styles.dayDot, { backgroundColor: dotBg }]}>
                  {isPastDone ? <Check size={12} color="#FFFFFF" strokeWidth={2.8} /> : null}
                </View>
              </View>
            );
          })}
        </View>
      </SoftCard>

      {/* Progressive 3-Level Curriculum (Flat Grouped List for Effortless Scanning) */}
      <View style={styles.sectionHeader}>
        <Text style={[TYPOGRAPHY.h2, { color: palette.textPrimary }]}>Müfredat</Text>
        <Text style={[TYPOGRAPHY.caption, { color: palette.textMuted }]}>
          {state.completedStepIds.length}/{totalSteps} adım
        </Text>
      </View>

      <PillTabs<LevelNumber>
        value={selectedLevel}
        onChange={setSelectedLevel}
        options={[
          { label: '1. Öğreniş', value: 1 },
          { label: '2. Devam Ediş', value: 2 },
          { label: '3. Mimari', value: 3 },
        ]}
      />

      <Text style={[TYPOGRAPHY.caption, { color: palette.textSecondary, marginTop: 12, marginBottom: 14 }]}>
        {levelMeta.subtitle}
      </Text>

      <View
        style={[
          styles.groupedList,
          { backgroundColor: palette.surface, borderColor: palette.borderSubtle },
        ]}
      >
        {levelModules.map((mod, idx) => {
          const done = mod.steps.filter((s) => state.completedStepIds.includes(s.id)).length;
          const total = mod.steps.length;
          const completed = total > 0 && done === total;
          const isLast = idx === levelModules.length - 1;

          return (
            <Pressable
              key={mod.id}
              onPress={() => onStartModule(mod.id)}
              accessibilityRole="button"
              accessibilityLabel={`${mod.title}, ${TOPIC_LABELS[mod.topic]}, ${done}/${total} adım, ${completed ? 'tamamlandı' : 'başla'}`}
              style={({ pressed }) => [
                styles.listRow,
                !isLast && { borderBottomWidth: 1, borderBottomColor: palette.borderSubtle },
                pressed && { backgroundColor: palette.surfacePressed },
              ]}
            >
              <Image
                source={getTopicIllustration(mod.topic)}
                style={styles.rowThumb}
                resizeMode="cover"
              />

              <View style={{ flex: 1, paddingRight: 10 }}>
                <Text style={[TYPOGRAPHY.h3, { color: palette.textPrimary }]}>
                  {mod.title}
                </Text>
                <Text style={[TYPOGRAPHY.caption, { color: palette.textMuted, marginTop: 4 }]}>
                  {TOPIC_LABELS[mod.topic]} · {done}/{total} adım · {mod.durationMin} dk
                </Text>
              </View>

              <View
                style={[
                  styles.statusCircle,
                  { backgroundColor: completed ? palette.primary : palette.surfaceSoft },
                ]}
              >
                {completed ? (
                  <Check size={16} color={palette.primaryText} strokeWidth={2.6} />
                ) : (
                  <ChevronRight size={17} color={palette.textSecondary} strokeWidth={2} />
                )}
              </View>
            </Pressable>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: 36,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  streakChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    minHeight: 48,
    borderRadius: RADIUS.pill,
  },
  circleBtn: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  focusCard: {
    padding: 0,
    overflow: 'hidden',
  },
  focusCover: {
    width: '100%',
    height: 124,
  },
  focusBody: {
    padding: SPACING.lg,
  },
  focusTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  weekCard: {
    marginTop: 14,
    paddingVertical: 16,
    paddingHorizontal: 14,
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayCol: {
    alignItems: 'center',
    flex: 1,
  },
  dayDot: {
    width: 26,
    height: 26,
    borderRadius: RADIUS.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginTop: 26,
    marginBottom: 12,
  },
  groupedList: {
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    minHeight: 80,
    gap: 14,
  },
  rowThumb: {
    width: 52,
    height: 52,
    borderRadius: RADIUS.sm,
  },
  statusCircle: {
    width: 34,
    height: 34,
    borderRadius: RADIUS.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
