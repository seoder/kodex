import React from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { AlertCircle, Flame, Moon, RotateCcw, Sun, Zap } from 'lucide-react-native';
import { useTheme } from '../../core/theme/ThemeContext';
import { RADIUS, SPACING, TYPOGRAPHY } from '../../core/theme/tokens';
import { useProgress } from '../../core/storage/progressStore';
import {
  ALL_MODULES,
  getAllSteps,
  getTopicStats,
  INTERVIEW_BANK,
  SANDBOX_CHALLENGES,
} from '../../data/curriculum';
import {
  ProgressBar,
  SegmentControl,
  SurfaceCard,
  TagBadge,
  TOPIC_LABELS,
} from '../../shared/components/SwissUI';
import { ThemeMode } from '../../core/theme/tokens';

interface ProfileScreenProps {
  onStartModule: (moduleId: string) => void;
}

export function ProfileScreen({ onStartModule }: ProfileScreenProps) {
  const { palette, mode, setThemeMode } = useTheme();
  const { state, resetProgress } = useProgress();

  const topicStats = getTopicStats(state.completedStepIds);
  const allSteps = getAllSteps();
  const mistakeEntries = allSteps.filter(({ step }) =>
    state.mistakeStepIds.includes(step.id)
  );

  const totalCurriculumSteps = allSteps.length;
  const readinessScore = Math.round(
    ((state.completedStepIds.length / Math.max(1, totalCurriculumSteps)) * 0.5 +
      (state.completedSandboxIds.length / Math.max(1, SANDBOX_CHALLENGES.length)) * 0.25 +
      (state.masteredInterviewIds.length / Math.max(1, INTERVIEW_BANK.length)) * 0.25) *
      100
  );

  const confirmReset = () => {
    Alert.alert(
      'İlerlemeyi Sıfırla',
      'Tüm XP, tamamlanan dersler ve mülakat işaretleri sıfırlanacak. Emin misiniz?',
      [
        { text: 'Vazgeç', style: 'cancel' },
        { text: 'Sıfırla', style: 'destructive', onPress: resetProgress },
      ]
    );
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: palette.bg }}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[TYPOGRAPHY.micro, { color: palette.textMuted }]}>PROFİL & ANALİTİK</Text>
      <Text style={[TYPOGRAPHY.display, { color: palette.textPrimary, marginTop: 4 }]}>
        Gelişim Özeti
      </Text>

      {/* KPI Grid */}
      <View style={styles.kpiGrid}>
        <SurfaceCard style={styles.kpiCard}>
          <View style={styles.kpiTop}>
            <Text style={[TYPOGRAPHY.micro, { color: palette.textMuted }]}>SERİ</Text>
            <Flame size={14} color={palette.textPrimary} />
          </View>
          <Text style={[TYPOGRAPHY.display, { color: palette.textPrimary, marginTop: 6 }]}>
            {state.streak} gün
          </Text>
        </SurfaceCard>
        <SurfaceCard style={styles.kpiCard}>
          <View style={styles.kpiTop}>
            <Text style={[TYPOGRAPHY.micro, { color: palette.textMuted }]}>TOPLAM XP</Text>
            <Zap size={14} color={palette.textPrimary} />
          </View>
          <Text style={[TYPOGRAPHY.display, { color: palette.textPrimary, marginTop: 6 }]}>
            {state.xp}
          </Text>
        </SurfaceCard>
      </View>

      {/* Readiness Score */}
      <SurfaceCard elevated style={{ marginTop: 12 }}>
        <View style={styles.kpiTop}>
          <Text style={[TYPOGRAPHY.micro, { color: palette.textMuted }]}>
            SENIOR MÜLAKAT HAZIRLIK SKORU
          </Text>
          <TagBadge label={`%${readinessScore}`} tone="inverse" />
        </View>
        <View style={{ marginTop: 12 }}>
          <ProgressBar progress={readinessScore / 100} height={6} />
        </View>
        <View style={styles.breakdownRow}>
          <Text style={[TYPOGRAPHY.caption, { color: palette.textSecondary }]}>
            Ders: {state.completedStepIds.length}/{totalCurriculumSteps}
          </Text>
          <Text style={[TYPOGRAPHY.caption, { color: palette.textSecondary }]}>
            Lab: {state.completedSandboxIds.length}/{SANDBOX_CHALLENGES.length}
          </Text>
          <Text style={[TYPOGRAPHY.caption, { color: palette.textSecondary }]}>
            Mülakat: {state.masteredInterviewIds.length}/{INTERVIEW_BANK.length}
          </Text>
        </View>
      </SurfaceCard>

      {/* Topic Mastery */}
      <SurfaceCard style={{ marginTop: 16 }}>
        <Text style={[TYPOGRAPHY.micro, { color: palette.textMuted, marginBottom: 14 }]}>
          KONU BAZLI USTALIK
        </Text>
        <View style={{ gap: 14 }}>
          {topicStats.map((stat) => (
            <View key={stat.topic}>
              <View style={styles.kpiTop}>
                <Text style={[TYPOGRAPHY.bodyStrong, { color: palette.textPrimary }]}>
                  {TOPIC_LABELS[stat.topic]}
                </Text>
                <Text
                  style={[
                    TYPOGRAPHY.caption,
                    { color: palette.textMuted, fontFamily: TYPOGRAPHY.mono },
                  ]}
                >
                  {stat.completed}/{stat.total} (%{Math.round(stat.ratio * 100)})
                </Text>
              </View>
              <View style={{ marginTop: 6 }}>
                <ProgressBar progress={stat.ratio} height={4} />
              </View>
            </View>
          ))}
        </View>
      </SurfaceCard>

      {/* Mistakes to Review */}
      {mistakeEntries.length > 0 ? (
        <SurfaceCard style={{ marginTop: 16 }}>
          <View style={[styles.kpiTop, { marginBottom: 10 }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <AlertCircle size={15} color={palette.error} />
              <Text style={[TYPOGRAPHY.micro, { color: palette.error }]}>
                TEKRAR EDİLECEK HATALAR ({mistakeEntries.length})
              </Text>
            </View>
          </View>
          <View style={{ gap: 8 }}>
            {mistakeEntries.slice(0, 5).map(({ module, step }) => (
              <Pressable
                key={step.id}
                onPress={() => onStartModule(module.id)}
                style={[
                  styles.mistakeRow,
                  { borderColor: palette.border, backgroundColor: palette.surfaceElevated },
                ]}
              >
                <View style={{ flex: 1 }}>
                  <Text style={[TYPOGRAPHY.bodyStrong, { color: palette.textPrimary }]}>
                    {step.title}
                  </Text>
                  <Text style={[TYPOGRAPHY.caption, { color: palette.textMuted }]}>
                    {module.title}
                  </Text>
                </View>
                <TagBadge label="TEKRAR" />
              </Pressable>
            ))}
          </View>
        </SurfaceCard>
      ) : null}

      {/* Appearance */}
      <SurfaceCard style={{ marginTop: 16 }}>
        <View style={[styles.kpiTop, { marginBottom: 12 }]}>
          <Text style={[TYPOGRAPHY.micro, { color: palette.textMuted }]}>GÖRÜNÜM (TEMA)</Text>
          {mode === 'dark' ? (
            <Moon size={15} color={palette.textPrimary} />
          ) : (
            <Sun size={15} color={palette.textPrimary} />
          )}
        </View>
        <SegmentControl<ThemeMode>
          value={mode}
          onChange={setThemeMode}
          options={[
            { label: 'Beyaz (Light)', value: 'light' },
            { label: 'Karanlık (Dark)', value: 'dark' },
          ]}
        />
      </SurfaceCard>

      {/* Reset & App Info */}
      <View style={styles.footerSection}>
        <Pressable
          onPress={confirmReset}
          style={[styles.resetBtn, { borderColor: palette.border }]}
        >
          <RotateCcw size={15} color={palette.error} />
          <Text style={[TYPOGRAPHY.bodyStrong, { color: palette.error }]}>
            İlerlemeyi Sıfırla
          </Text>
        </Pressable>

        <Text
          style={[
            TYPOGRAPHY.micro,
            { color: palette.textMuted, textAlign: 'center', marginTop: 16 },
          ]}
        >
          KODEX v1.0.0 · {ALL_MODULES.length} MODÜL · SWISS MINIMALIST EDITION
        </Text>
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
  kpiGrid: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 18,
  },
  kpiCard: {
    flex: 1,
  },
  kpiTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  mistakeRow: {
    borderWidth: 1,
    borderRadius: RADIUS.sm,
    padding: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  footerSection: {
    marginTop: 20,
  },
  resetBtn: {
    borderWidth: 1,
    borderRadius: RADIUS.sm,
    paddingVertical: 13,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
});
