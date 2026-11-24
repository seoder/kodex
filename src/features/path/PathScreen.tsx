import React, { useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import {
  Briefcase,
  Check,
  ChevronRight,
  Code2,
  Flame,
  Layers,
  Moon,
  Play,
  Sun,
} from 'lucide-react-native';
import { useTheme } from '../../core/theme/ThemeContext';
import { RADIUS, SPACING, TYPOGRAPHY } from '../../core/theme/tokens';
import { useProgress } from '../../core/storage/progressStore';
import {
  ALL_MODULES,
  getModulesByLevel,
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
import { ILLUSTRATIONS } from '../../shared/assets';

interface PathScreenProps {
  onStartModule: (moduleId: string) => void;
  onNavigateTab: (tab: 'sandbox' | 'interview') => void;
}

const WEEK_DAYS = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];

export function PathScreen({ onStartModule, onNavigateTab }: PathScreenProps) {
  const { palette, mode, toggleTheme } = useTheme();
  const { state } = useProgress();
  const [selectedLevel, setSelectedLevel] = useState<LevelNumber>(1);

  const levelModules = useMemo(() => getModulesByLevel(selectedLevel), [selectedLevel]);

  const nextModule = useMemo<ModuleItem>(() => {
    const firstIncomplete = ALL_MODULES.find(
      (mod) => !mod.steps.every((s) => state.completedStepIds.includes(s.id))
    );
    return firstIncomplete ?? ALL_MODULES[0];
  }, [state.completedStepIds]);

  const totalSteps = ALL_MODULES.reduce((acc, m) => acc + m.steps.length, 0);
  const overallProgress = totalSteps > 0 ? state.completedStepIds.length / totalSteps : 0;
  const dailyProgress = Math.min(1, state.dailyXp / Math.max(1, state.dailyGoal));

  const todayIdx = (new Date().getDay() + 6) % 7; // Mon=0 .. Sun=6

  const featuredCards = [
    {
      moduleId: 'l1-nodejs-eventloop',
      image: ILLUSTRATIONS.nodejs,
      title: 'Event Loop & Async Çalışma Mantığı',
      category: 'Node.js · Seviye 1',
    },
    {
      moduleId: 'l2-sql-advanced',
      image: ILLUSTRATIONS.sql,
      title: 'Window Functions & Atomic SQL',
      category: 'PostgreSQL · Seviye 2',
    },
    {
      moduleId: 'l3-clean-arch',
      image: ILLUSTRATIONS.architecture,
      title: 'Clean Architecture & Klasör Düzeni',
      category: 'Mimari · Seviye 3',
    },
  ];

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: palette.bg }}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      {/* Clean Airy Greeting Header */}
      <View style={styles.header}>
        <View>
          <Text style={[TYPOGRAPHY.body, { color: palette.textMuted }]}>
            Tekrar hoş geldin
          </Text>
          <Text style={[TYPOGRAPHY.display, { color: palette.textPrimary, marginTop: 2 }]}>
            KODEX
          </Text>
        </View>

        <View style={styles.headerActions}>
          <View style={[styles.streakChip, { backgroundColor: palette.surface }]}>
            <Flame size={15} color={palette.coral} strokeWidth={2.2} />
            <Text style={[TYPOGRAPHY.caption, { color: palette.textPrimary, fontWeight: '700' }]}>
              {state.streak}g
            </Text>
          </View>
          <Pressable
            onPress={toggleTheme}
            style={[styles.circleBtn, { backgroundColor: palette.surface }]}
            accessibilityLabel="Tema değiştir"
          >
            {mode === 'dark' ? (
              <Sun size={18} color={palette.textPrimary} strokeWidth={1.9} />
            ) : (
              <Moon size={18} color={palette.textPrimary} strokeWidth={1.9} />
            )}
          </Pressable>
        </View>
      </View>

      {/* Section 1: My Goal Arc Card */}
      <Text style={[TYPOGRAPHY.h3, { color: palette.textPrimary, marginBottom: 12 }]}>
        Hedefim
      </Text>
      <SoftCard style={styles.goalCard}>
        <View style={styles.goalRow}>
          <GoalArcGauge
            progress={Math.max(dailyProgress, overallProgress)}
            centerValue={`%${Math.round(overallProgress * 100)}`}
            centerLabel={`${state.xp} XP`}
          />
          <View style={styles.goalInfo}>
            <Text style={[TYPOGRAPHY.h3, { color: palette.textPrimary }]}>
              Backend Ustalığı
            </Text>
            <Text style={[TYPOGRAPHY.caption, { color: palette.textMuted, marginTop: 4 }]}>
              Bugün {state.dailyXp} / {state.dailyGoal} XP
            </Text>
            <Text style={[TYPOGRAPHY.caption, { color: palette.primary, marginTop: 8, fontWeight: '600' }]}>
              {state.completedStepIds.length}/{totalSteps} adım tamamlandı
            </Text>
          </View>
        </View>
      </SoftCard>

      {/* Section 2: Weekly Rhythm & Today's Lesson */}
      <View style={styles.sectionHeader}>
        <Text style={[TYPOGRAPHY.h3, { color: palette.textPrimary }]}>
          Günlük Ritim
        </Text>
        <Text style={[TYPOGRAPHY.caption, { color: palette.textMuted }]}>
          Seviye 0{nextModule.level}
        </Text>
      </View>

      <SoftCard>
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
              <View key={day} style={styles.dayCol}>
                <Text
                  style={[
                    TYPOGRAPHY.micro,
                    { color: isToday ? palette.textPrimary : palette.textMuted, marginBottom: 8 },
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

        <View style={[styles.divider, { backgroundColor: palette.borderSubtle }]} />

        <Pressable
          onPress={() => onStartModule(nextModule.id)}
          style={({ pressed }) => [
            styles.todayLessonBox,
            { backgroundColor: pressed ? palette.surfacePressed : palette.bg },
          ]}
        >
          <View style={{ flex: 1 }}>
            <Text style={[TYPOGRAPHY.micro, { color: palette.textMuted }]}>
              SIRADAKİ DERS · {nextModule.durationMin} DK
            </Text>
            <Text style={[TYPOGRAPHY.h3, { color: palette.textPrimary, marginTop: 3 }]}>
              {nextModule.title}
            </Text>
          </View>
          <View style={[styles.playCircle, { backgroundColor: palette.primary }]}>
            <Play size={15} color={palette.primaryText} fill={palette.primaryText} />
          </View>
        </Pressable>
      </SoftCard>

      {/* Section 3: Pastel Quick Actions (3-Tile Row) */}
      <Text style={[TYPOGRAPHY.h3, { color: palette.textPrimary, marginTop: 26, marginBottom: 12 }]}>
        Hızlı Erişim
      </Text>
      <View style={styles.quickGrid}>
        <Pressable
          onPress={() => onNavigateTab('sandbox')}
          style={[styles.quickTile, { backgroundColor: palette.sageBg }]}
        >
          <View style={[styles.quickIcon, { backgroundColor: palette.surface }]}>
            <Code2 size={18} color={palette.sageText} strokeWidth={2} />
          </View>
          <Text style={[TYPOGRAPHY.bodyStrong, { color: palette.sageText, marginTop: 14 }]}>
            SQL & Kod{'\n'}Lab
          </Text>
        </Pressable>

        <Pressable
          onPress={() => onNavigateTab('interview')}
          style={[styles.quickTile, { backgroundColor: palette.peachBg }]}
        >
          <View style={[styles.quickIcon, { backgroundColor: palette.surface }]}>
            <Briefcase size={18} color={palette.peachText} strokeWidth={2} />
          </View>
          <Text style={[TYPOGRAPHY.bodyStrong, { color: palette.peachText, marginTop: 14 }]}>
            Mülakat{'\n'}Simülatörü
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setSelectedLevel(3)}
          style={[styles.quickTile, { backgroundColor: palette.sandBg }]}
        >
          <View style={[styles.quickIcon, { backgroundColor: palette.surface }]}>
            <Layers size={18} color={palette.sandText} strokeWidth={2} />
          </View>
          <Text style={[TYPOGRAPHY.bodyStrong, { color: palette.sandText, marginTop: 14 }]}>
            Clean{'\n'}Mimari
          </Text>
        </Pressable>
      </View>

      {/* Section 4: Dark Forest Featured Banner */}
      <View style={[styles.bannerCard, { backgroundColor: palette.bannerBg }]}>
        <Image source={ILLUSTRATIONS.interview} style={styles.bannerImage} resizeMode="cover" />
        <View style={styles.bannerContent}>
          <Text style={[TYPOGRAPHY.h3, { color: palette.bannerText }]}>
            Senior Mülakat Kampı
          </Text>
          <Text style={[TYPOGRAPHY.caption, { color: palette.bannerMuted, marginTop: 4 }]}>
            Zamanlayıcı ve rubrikle gerçek teknik sorulara hazırlan.
          </Text>
          <View style={{ marginTop: 12, alignSelf: 'flex-start' }}>
            <PillButton
              label="Başla"
              variant="light"
              compact
              onPress={() => onNavigateTab('interview')}
            />
          </View>
        </View>
      </View>

      {/* Section 5: Visual Editorial Cards (Horizontal Scroll) */}
      <View style={styles.sectionHeader}>
        <Text style={[TYPOGRAPHY.h3, { color: palette.textPrimary }]}>
          Öne Çıkan Konular
        </Text>
        <Text style={[TYPOGRAPHY.caption, { color: palette.textMuted }]}>
          Görsel rehber
        </Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.featuredScroll}
      >
        {featuredCards.map((item) => (
          <Pressable
            key={item.moduleId}
            onPress={() => onStartModule(item.moduleId)}
            style={[styles.articleCard, { backgroundColor: palette.surface }]}
          >
            <Image source={item.image} style={styles.articleImg} resizeMode="cover" />
            <View style={styles.articleBody}>
              <Text
                style={[TYPOGRAPHY.bodyStrong, { color: palette.textPrimary }]}
                numberOfLines={2}
              >
                {item.title}
              </Text>
              <Text style={[TYPOGRAPHY.caption, { color: palette.textMuted, marginTop: 6 }]}>
                {item.category}
              </Text>
            </View>
          </Pressable>
        ))}
      </ScrollView>

      {/* Section 6: Clean 3-Level Path */}
      <Text style={[TYPOGRAPHY.h3, { color: palette.textPrimary, marginTop: 28, marginBottom: 12 }]}>
        Öğrenme Yolu
      </Text>

      <PillTabs<LevelNumber>
        value={selectedLevel}
        onChange={setSelectedLevel}
        options={[
          { label: '1. Öğreniş', value: 1 },
          { label: '2. Devam Ediş', value: 2 },
          { label: '3. Mimari', value: 3 },
        ]}
      />

      <View style={styles.moduleList}>
        {levelModules.map((mod) => {
          const done = mod.steps.filter((s) => state.completedStepIds.includes(s.id)).length;
          const total = mod.steps.length;
          const completed = total > 0 && done === total;

          return (
            <Pressable
              key={mod.id}
              onPress={() => onStartModule(mod.id)}
              style={({ pressed }) => [
                styles.moduleRowCard,
                {
                  backgroundColor: pressed ? palette.surfacePressed : palette.surface,
                },
              ]}
            >
              <View style={{ flex: 1, paddingRight: 12 }}>
                <View style={styles.moduleMeta}>
                  <SoftBadge label={TOPIC_LABELS[mod.topic]} tone={getTopicTone(mod.topic)} />
                  <Text style={[TYPOGRAPHY.caption, { color: palette.textMuted }]}>
                    {done}/{total} adım · {mod.durationMin} dk
                  </Text>
                </View>
                <Text style={[TYPOGRAPHY.h3, { color: palette.textPrimary, marginTop: 10 }]}>
                  {mod.title}
                </Text>
                <Text
                  style={[TYPOGRAPHY.caption, { color: palette.textSecondary, marginTop: 4 }]}
                  numberOfLines={2}
                >
                  {mod.subtitle}
                </Text>
              </View>

              <View
                style={[
                  styles.statusCircle,
                  {
                    backgroundColor: completed ? palette.primary : palette.surfaceSoft,
                  },
                ]}
              >
                {completed ? (
                  <Check size={16} color={palette.primaryText} strokeWidth={2.5} />
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
    marginBottom: 24,
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
    height: 40,
    borderRadius: RADIUS.pill,
  },
  circleBtn: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  goalCard: {
    paddingVertical: 20,
    paddingHorizontal: 18,
  },
  goalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
  },
  goalInfo: {
    flex: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 26,
    marginBottom: 12,
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayCol: {
    alignItems: 'center',
  },
  dayDot: {
    width: 26,
    height: 26,
    borderRadius: RADIUS.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: {
    height: 1,
    marginVertical: 18,
  },
  todayLessonBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: RADIUS.md,
    gap: 12,
  },
  playCircle: {
    width: 38,
    height: 38,
    borderRadius: RADIUS.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  quickTile: {
    flex: 1,
    borderRadius: RADIUS.md,
    padding: 14,
    minHeight: 118,
    justifyContent: 'space-between',
  },
  quickIcon: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerCard: {
    marginTop: 24,
    borderRadius: RADIUS.lg,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  bannerImage: {
    width: 88,
    height: 88,
    borderRadius: RADIUS.md,
  },
  bannerContent: {
    flex: 1,
  },
  featuredScroll: {
    gap: 14,
    paddingRight: 8,
  },
  articleCard: {
    width: 214,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
  },
  articleImg: {
    width: '100%',
    height: 116,
  },
  articleBody: {
    padding: 14,
  },
  moduleList: {
    marginTop: 14,
    gap: 12,
  },
  moduleRowCard: {
    borderRadius: RADIUS.lg,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
  },
  moduleMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  statusCircle: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
