import React from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { AlertCircle, Flame, Moon, RotateCcw, Sun, Zap } from 'lucide-react-native';
import { useTheme } from '../../core/theme/ThemeContext';
import { RADIUS, SPACING, ThemeMode, TYPOGRAPHY } from '../../core/theme/tokens';
import { useProgress } from '../../core/storage/progressStore';
import {
  ALL_MODULES,
  getAllSteps,
  getTopicStats,
  INTERVIEW_BANK,
  SANDBOX_CHALLENGES,
} from '../../data/curriculum';
import {
  GoalArcGauge,
  PillTabs,
  ProgressBar,
  SoftBadge,
  SoftCard,
  TOPIC_LABELS,
} from '../../shared/components/SwissUI';

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
      <Text style={[TYPOGRAPHY.body, { color: palette.textMuted }]}>Profil & Analitik</Text>
      <Text style={[TYPOGRAPHY.display, { color: palette.textPrimary, marginTop: 2 }]}>
        Gelişim Özeti
      </Text>

      {/* Pastel Stat Row */}
      <View style={styles.kpiGrid}>
        <View style={[styles.kpiTile, { backgroundColor: palette.peachBg }]}>
          <Flame size={18} color={palette.peachText} />
          <Text style={[TYPOGRAPHY.h1, { color: palette.peachText, marginTop: 10 }]}>
            {state.streak} gün
          </Text>
          <Text style={[TYPOGRAPHY.caption, { color: palette.peachText, opacity: 0.8 }]}>
            Günlük Seri
          </Text>
        </View>
        <View style={[styles.kpiTile, { backgroundColor: palette.sageBg }]}>
          <Zap size={18} color={palette.sageText} />
          <Text style={[TYPOGRAPHY.h1, { color: palette.sageText, marginTop: 10 }]}>
            {state.xp} XP
          </Text>
          <Text style={[TYPOGRAPHY.caption, { color: palette.sageText, opacity: 0.8 }]}>
            Toplam Puan
          </Text>
        </View>
      </View>

      {/* Senior Readiness Card */}
      <SoftCard style={{ marginTop: 16 }}>
        <View style={styles.readinessRow}>
          <GoalArcGauge
            progress={readinessScore / 100}
            centerValue={`%${readinessScore}`}
            centerLabel="Hazırlık"
          />
          <View style={{ flex: 1 }}>
            <Text style={[TYPOGRAPHY.h3, { color: palette.textPrimary }]}>
              Mülakat Hazırlığı
            </Text>
            <Text style={[TYPOGRAPHY.caption, { color: palette.textSecondary, marginTop: 6 }]}>
              Dersler: {state.completedStepIds.length}/{totalCurriculumSteps}
            </Text>
            <Text style={[TYPOGRAPHY.caption, { color: palette.textSecondary, marginTop: 2 }]}>
              Kod Lab: {state.completedSandboxIds.length}/{SANDBOX_CHALLENGES.length}
            </Text>
            <Text style={[TYPOGRAPHY.caption, { color: palette.textSecondary, marginTop: 2 }]}>
              Mülakat: {state.masteredInterviewIds.length}/{INTERVIEW_BANK.length}
            </Text>
          </View>
        </View>
      </SoftCard>

      {/* Topic Mastery */}
      <SoftCard style={{ marginTop: 16 }}>
        <Text style={[TYPOGRAPHY.h3, { color: palette.textPrimary, marginBottom: 16 }]}>
          Konu Ustalığı
        </Text>
        <View style={{ gap: 16 }}>
          {topicStats.map((stat) => (
            <View key={stat.topic}>
              <View style={styles.rowBetween}>
                <Text style={[TYPOGRAPHY.bodyStrong, { color: palette.textPrimary }]}>
                  {TOPIC_LABELS[stat.topic]}
                </Text>
                <Text style={[TYPOGRAPHY.caption, { color: palette.textMuted }]}>
                  %{Math.round(stat.ratio * 100)}
                </Text>
              </View>
              <View style={{ marginTop: 7 }}>
                <ProgressBar progress={stat.ratio} height={6} />
              </View>
            </View>
          ))}
        </View>
      </SoftCard>

      {/* Mistakes to Review */}
      {mistakeEntries.length > 0 ? (
        <SoftCard style={{ marginTop: 16 }}>
          <View style={[styles.rowBetween, { marginBottom: 12 }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <AlertCircle size={16} color={palette.error} />
              <Text style={[TYPOGRAPHY.h3, { color: palette.textPrimary }]}>
                Tekrar Edilecekler ({mistakeEntries.length})
              </Text>
            </View>
          </View>
          <View style={{ gap: 10 }}>
            {mistakeEntries.slice(0, 5).map(({ module, step }) => (
              <Pressable
                key={step.id}
                onPress={() => onStartModule(module.id)}
                style={[styles.mistakeRow, { backgroundColor: palette.bg }]}
              >
                <View style={{ flex: 1 }}>
                  <Text style={[TYPOGRAPHY.bodyStrong, { color: palette.textPrimary }]}>
                    {step.title}
                  </Text>
                  <Text style={[TYPOGRAPHY.caption, { color: palette.textMuted }]}>
                    {module.title}
                  </Text>
                </View>
                <SoftBadge label="Tekrar" tone="peach" />
              </Pressable>
            ))}
          </View>
        </SoftCard>
      ) : null}

      {/* Appearance */}
      <SoftCard style={{ marginTop: 16 }}>
        <View style={[styles.rowBetween, { marginBottom: 14 }]}>
          <Text style={[TYPOGRAPHY.h3, { color: palette.textPrimary }]}>Tema</Text>
          {mode === 'dark' ? (
            <Moon size={16} color={palette.textSecondary} />
          ) : (
            <Sun size={16} color={palette.textSecondary} />
          )}
        </View>
        <PillTabs<ThemeMode>
          value={mode}
          onChange={setThemeMode}
          options={[
            { label: 'Açık Tema', value: 'light' },
            { label: 'Karanlık Tema', value: 'dark' },
          ]}
        />
      </SoftCard>

      <Pressable
        onPress={confirmReset}
        style={[styles.resetBtn, { backgroundColor: palette.surface }]}
      >
        <RotateCcw size={15} color={palette.error} />
        <Text style={[TYPOGRAPHY.bodyStrong, { color: palette.error }]}>
          İlerlemeyi Sıfırla
        </Text>
      </Pressable>

      <Text
        style={[
          TYPOGRAPHY.caption,
          { color: palette.textMuted, textAlign: 'center', marginTop: 18 },
        ]}
      >
        KODEX v2.0.1 · {ALL_MODULES.length} Modül
      </Text>
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
    marginTop: 20,
  },
  kpiTile: {
    flex: 1,
    borderRadius: RADIUS.lg,
    padding: 18,
  },
  readinessRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  mistakeRow: {
    borderRadius: RADIUS.md,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  resetBtn: {
    marginTop: 18,
    borderRadius: RADIUS.pill,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
});
