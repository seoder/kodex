import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import {
  ArrowRight,
  Check,
  Clock,
  Flame,
  Moon,
  Sun,
  Terminal,
  Zap,
} from 'lucide-react-native';
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
  PrimaryButton,
  ProgressBar,
  SegmentControl,
  SurfaceCard,
  TagBadge,
  TOPIC_LABELS,
} from '../../shared/components/SwissUI';

interface PathScreenProps {
  onStartModule: (moduleId: string) => void;
}

export function PathScreen({ onStartModule }: PathScreenProps) {
  const { palette, mode, toggleTheme } = useTheme();
  const { state } = useProgress();
  const [selectedLevel, setSelectedLevel] = useState<LevelNumber>(1);

  const levelModules = useMemo(() => getModulesByLevel(selectedLevel), [selectedLevel]);
  const levelMeta = LEVEL_META[selectedLevel];

  const nextRecommendedModule = useMemo<ModuleItem>(() => {
    const firstIncomplete = ALL_MODULES.find(
      (mod) => !mod.steps.every((s) => state.completedStepIds.includes(s.id))
    );
    return firstIncomplete ?? ALL_MODULES[0];
  }, [state.completedStepIds]);

  const dailyProgress = Math.min(1, state.dailyXp / Math.max(1, state.dailyGoal));
  const totalSteps = ALL_MODULES.reduce((acc, m) => acc + m.steps.length, 0);
  const overallProgress = totalSteps > 0 ? state.completedStepIds.length / totalSteps : 0;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: palette.bg }}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      {/* Top Bar */}
      <View style={styles.topBar}>
        <View style={styles.brandRow}>
          <View
            style={[
              styles.logoBox,
              { backgroundColor: palette.accent },
            ]}
          >
            <Terminal size={16} color={palette.accentText} strokeWidth={2.2} />
          </View>
          <View>
            <Text style={[TYPOGRAPHY.h2, { color: palette.textPrimary, letterSpacing: 1.2 }]}>
              KODEX
            </Text>
            <Text style={[TYPOGRAPHY.micro, { color: palette.textMuted }]}>
              BACKEND & INTERVIEW
            </Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={[styles.statPill, { borderColor: palette.border, backgroundColor: palette.surface }]}>
            <Flame size={14} color={palette.textPrimary} strokeWidth={2} />
            <Text style={[TYPOGRAPHY.caption, { color: palette.textPrimary, fontWeight: '700' }]}>
              {state.streak}g
            </Text>
          </View>
          <View style={[styles.statPill, { borderColor: palette.border, backgroundColor: palette.surface }]}>
            <Zap size={14} color={palette.textPrimary} strokeWidth={2} />
            <Text style={[TYPOGRAPHY.caption, { color: palette.textPrimary, fontWeight: '700' }]}>
              {state.xp}
            </Text>
          </View>
          <Pressable
            onPress={toggleTheme}
            style={[
              styles.iconBtn,
              { borderColor: palette.border, backgroundColor: palette.surface },
            ]}
            accessibilityLabel="Tema değiştir"
          >
            {mode === 'dark' ? (
              <Sun size={16} color={palette.textPrimary} strokeWidth={2} />
            ) : (
              <Moon size={16} color={palette.textPrimary} strokeWidth={2} />
            )}
          </Pressable>
        </View>
      </View>

      {/* Daily Goal & Quick Continue Card */}
      <SurfaceCard style={styles.heroCard}>
        <View style={styles.heroHeader}>
          <Text style={[TYPOGRAPHY.micro, { color: palette.textMuted }]}>GÜNLÜK HEDEF</Text>
          <Text style={[TYPOGRAPHY.caption, { color: palette.textPrimary, fontWeight: '700' }]}>
            {state.dailyXp} / {state.dailyGoal} XP
          </Text>
        </View>
        <View style={{ marginTop: 8, marginBottom: 16 }}>
          <ProgressBar progress={dailyProgress} height={5} />
        </View>

        <View style={[styles.divider, { backgroundColor: palette.border }]} />

        <View style={styles.continueRow}>
          <View style={{ flex: 1 }}>
            <Text style={[TYPOGRAPHY.micro, { color: palette.textMuted }]}>
              SIRADAKİ DERS · SEVİYE 0{nextRecommendedModule.level}
            </Text>
            <Text
              style={[TYPOGRAPHY.h3, { color: palette.textPrimary, marginTop: 4 }]}
              numberOfLines={1}
            >
              {nextRecommendedModule.title}
            </Text>
          </View>
          <Text style={[TYPOGRAPHY.caption, { color: palette.textMuted }]}>
            %{Math.round(overallProgress * 100)}
          </Text>
        </View>

        <PrimaryButton
          label="Derse Devam Et"
          onPress={() => onStartModule(nextRecommendedModule.id)}
          style={{ marginTop: 14 }}
        />
      </SurfaceCard>

      {/* Level Selector */}
      <View style={{ marginTop: SPACING.xl }}>
        <SegmentControl<LevelNumber>
          value={selectedLevel}
          onChange={setSelectedLevel}
          options={[
            { label: '1. Öğreniş', value: 1 },
            { label: '2. Devam Ediş', value: 2 },
            { label: '3. Mimari', value: 3 },
          ]}
        />
      </View>

      {/* Level Header */}
      <View style={styles.levelBanner}>
        <TagBadge label={levelMeta.badge} tone="inverse" />
        <Text style={[TYPOGRAPHY.h1, { color: palette.textPrimary, marginTop: 10 }]}>
          {levelMeta.title}
        </Text>
        <Text style={[TYPOGRAPHY.body, { color: palette.textSecondary, marginTop: 4 }]}>
          {levelMeta.subtitle}
        </Text>
      </View>

      {/* Structured Module Path */}
      <View style={styles.moduleList}>
        {levelModules.map((mod, idx) => {
          const doneCount = mod.steps.filter((s) =>
            state.completedStepIds.includes(s.id)
          ).length;
          const totalCount = mod.steps.length;
          const isCompleted = totalCount > 0 && doneCount === totalCount;
          const progress = totalCount > 0 ? doneCount / totalCount : 0;
          const isLast = idx === levelModules.length - 1;

          return (
            <View key={mod.id} style={styles.timelineRow}>
              {/* Left Rail */}
              <View style={styles.railColumn}>
                <View
                  style={[
                    styles.nodeCircle,
                    {
                      backgroundColor: isCompleted ? palette.accent : palette.bg,
                      borderColor: isCompleted ? palette.accent : palette.borderStrong,
                    },
                  ]}
                >
                  {isCompleted ? (
                    <Check size={14} color={palette.accentText} strokeWidth={2.5} />
                  ) : (
                    <Text
                      style={[
                        TYPOGRAPHY.micro,
                        { color: palette.textPrimary, fontFamily: TYPOGRAPHY.mono },
                      ]}
                    >
                      {String(mod.order).padStart(2, '0')}
                    </Text>
                  )}
                </View>
                {!isLast ? (
                  <View style={[styles.railLine, { backgroundColor: palette.border }]} />
                ) : null}
              </View>

              {/* Module Card */}
              <Pressable
                onPress={() => onStartModule(mod.id)}
                style={({ pressed }) => [
                  styles.moduleCard,
                  {
                    backgroundColor: pressed ? palette.surfacePressed : palette.surfaceElevated,
                    borderColor: isCompleted ? palette.borderStrong : palette.border,
                  },
                ]}
              >
                <View style={styles.moduleTopRow}>
                  <TagBadge label={TOPIC_LABELS[mod.topic]} />
                  <View style={styles.metaInline}>
                    <Clock size={12} color={palette.textMuted} strokeWidth={2} />
                    <Text style={[TYPOGRAPHY.caption, { color: palette.textMuted }]}>
                      {mod.durationMin} dk
                    </Text>
                  </View>
                </View>

                <Text style={[TYPOGRAPHY.h3, { color: palette.textPrimary, marginTop: 10 }]}>
                  {mod.title}
                </Text>
                <Text style={[TYPOGRAPHY.body, { color: palette.textSecondary, marginTop: 4 }]}>
                  {mod.subtitle}
                </Text>

                <View style={styles.moduleFooter}>
                  <View style={{ flex: 1, marginRight: 12 }}>
                    <ProgressBar progress={progress} height={3} />
                  </View>
                  <Text style={[TYPOGRAPHY.micro, { color: palette.textMuted }]}>
                    {doneCount}/{totalCount} ADIM
                  </Text>
                  <ArrowRight size={15} color={palette.textPrimary} strokeWidth={2} />
                </View>
              </Pressable>
            </View>
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
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoBox: {
    width: 34,
    height: 34,
    borderRadius: RADIUS.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
  },
  iconBtn: {
    width: 34,
    height: 34,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroCard: {
    padding: SPACING.lg,
  },
  heroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  divider: {
    height: 1,
    marginBottom: 14,
  },
  continueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  levelBanner: {
    marginTop: SPACING.xl,
    marginBottom: SPACING.lg,
  },
  moduleList: {
    gap: 0,
  },
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  railColumn: {
    width: 34,
    alignItems: 'center',
    marginRight: 10,
  },
  nodeCircle: {
    width: 30,
    height: 30,
    borderRadius: RADIUS.sm,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  railLine: {
    width: 1,
    flex: 1,
    marginVertical: 4,
  },
  moduleCard: {
    flex: 1,
    borderWidth: 1,
    borderRadius: RADIUS.md,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
  },
  moduleTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metaInline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  moduleFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 14,
  },
});
