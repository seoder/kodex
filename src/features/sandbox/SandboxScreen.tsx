import React, { useEffect, useMemo, useState } from 'react';
import {
  BackHandler,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  HelpCircle,
  Play,
  RotateCcw,
} from 'lucide-react-native';
import { useTheme } from '../../core/theme/ThemeContext';
import { RADIUS, SPACING, TYPOGRAPHY } from '../../core/theme/tokens';
import { useProgress } from '../../core/storage/progressStore';
import { validateCodeSubmission, ValidationResult } from '../../core/engine/validator';
import { SANDBOX_CHALLENGES, SandboxChallenge, TopicId } from '../../data/curriculum';
import {
  getTopicTone,
  PillButton,
  SoftBadge,
  SqlTablePreview,
  TOPIC_LABELS,
} from '../../shared/components/SwissUI';
import { ILLUSTRATIONS } from '../../shared/assets';

type FilterTopic = 'all' | TopicId;

export function SandboxScreen() {
  const { palette } = useTheme();
  const { state, recordSandboxSolved } = useProgress();

  const [filter, setFilter] = useState<FilterTopic>('all');
  const [activeChallenge, setActiveChallenge] = useState<SandboxChallenge | null>(null);
  const [draft, setDraft] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [result, setResult] = useState<ValidationResult | null>(null);

  useEffect(() => {
    if (!activeChallenge) return;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      setActiveChallenge(null);
      return true;
    });
    return () => sub.remove();
  }, [activeChallenge]);

  const challenges = useMemo(
    () =>
      filter === 'all'
        ? SANDBOX_CHALLENGES
        : SANDBOX_CHALLENGES.filter((c) => c.topic === filter),
    [filter]
  );

  const openChallenge = (challenge: SandboxChallenge) => {
    setActiveChallenge(challenge);
    setDraft(challenge.starterCode);
    setShowHint(false);
    setResult(null);
  };

  const runCheck = () => {
    if (!activeChallenge) return;
    const res = validateCodeSubmission({
      userInput: draft,
      language: activeChallenge.language,
      requiredGroups: activeChallenge.requiredGroups,
      forbiddenPatterns: activeChallenge.forbiddenPatterns,
      testCases: activeChallenge.testCases,
    });
    setResult(res);
    Haptics.notificationAsync(
      res.passed
        ? Haptics.NotificationFeedbackType.Success
        : Haptics.NotificationFeedbackType.Error
    ).catch(() => {});
    if (res.passed) {
      recordSandboxSolved(activeChallenge.id, activeChallenge.xp);
    }
  };

  if (activeChallenge) {
    return (
      <KeyboardAvoidingView
        style={{ flex: 1, backgroundColor: palette.bg }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.editorHeader}>
          <Pressable
            onPress={() => setActiveChallenge(null)}
            style={[styles.backCircle, { backgroundColor: palette.surface }]}
            hitSlop={8}
          >
            <ArrowLeft size={18} color={palette.textPrimary} strokeWidth={2} />
          </Pressable>
          <Text style={[TYPOGRAPHY.h3, { color: palette.textPrimary, flex: 1, marginLeft: 12 }]} numberOfLines={1}>
            Kod Lab
          </Text>
          <SoftBadge label={`+${activeChallenge.xp} XP`} tone="sage" />
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.editorScroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={[TYPOGRAPHY.h1, { color: palette.textPrimary }]}>
            {activeChallenge.title}
          </Text>
          <Text style={[TYPOGRAPHY.body, { color: palette.textSecondary, marginTop: 8 }]}>
            {activeChallenge.prompt}
          </Text>

          {activeChallenge.tables ? (
            <View style={{ gap: 10, marginTop: 16 }}>
              {activeChallenge.tables.map((t, idx) => (
                <SqlTablePreview key={idx} table={t} accentLabel="GİRDİ" />
              ))}
              {activeChallenge.expectedTable ? (
                <SqlTablePreview table={activeChallenge.expectedTable} accentLabel="BEKLENEN" />
              ) : null}
            </View>
          ) : null}

          <View style={[styles.editorBox, { backgroundColor: palette.codeBg, marginTop: 18 }]}>
            <View style={[styles.editorToolbar, { borderBottomColor: palette.codeBorder }]}>
              <Text style={[TYPOGRAPHY.micro, { color: palette.codeLineNum }]}>
                {activeChallenge.language.toUpperCase()}
              </Text>
              <View style={{ flexDirection: 'row', gap: 16 }}>
                <Pressable onPress={() => setShowHint((h) => !h)} style={styles.miniAction}>
                  <HelpCircle size={13} color={palette.codeLineNum} />
                  <Text style={[TYPOGRAPHY.micro, { color: palette.codeLineNum }]}>İpucu</Text>
                </Pressable>
                <Pressable
                  onPress={() => {
                    setDraft(activeChallenge.starterCode);
                    setResult(null);
                  }}
                  style={styles.miniAction}
                >
                  <RotateCcw size={13} color={palette.codeLineNum} />
                  <Text style={[TYPOGRAPHY.micro, { color: palette.codeLineNum }]}>Sıfırla</Text>
                </Pressable>
              </View>
            </View>
            <TextInput
              value={draft}
              onChangeText={setDraft}
              multiline
              autoCapitalize="none"
              autoCorrect={false}
              spellCheck={false}
              textAlignVertical="top"
              style={[styles.editorInput, { color: palette.codeText }]}
            />
          </View>

          <View style={{ marginTop: 16 }}>
            <Text style={[TYPOGRAPHY.caption, { color: palette.textMuted, marginBottom: 8 }]}>
              Hızlı ekle
            </Text>
            <View style={styles.tokenWrap}>
              {activeChallenge.quickTokens.map((tok, i) => (
                <Pressable
                  key={i}
                  onPress={() =>
                    setDraft((prev) => (prev.trim() ? `${prev.trimEnd()}\n${tok}` : tok))
                  }
                  style={[styles.tokenChip, { backgroundColor: palette.surface }]}
                >
                  <Text style={[TYPOGRAPHY.code, { fontSize: 12, color: palette.textPrimary }]}>
                    {tok}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {showHint ? (
            <View style={[styles.hintBox, { backgroundColor: palette.sandBg }]}>
              <Text style={[TYPOGRAPHY.micro, { color: palette.sandText }]}>İPUCU</Text>
              <Text style={[TYPOGRAPHY.body, { color: palette.textPrimary, marginTop: 4 }]}>
                {activeChallenge.hint}
              </Text>
              <Pressable onPress={() => setDraft(activeChallenge.solution)} style={{ marginTop: 10 }}>
                <Text style={[TYPOGRAPHY.caption, { color: palette.primary, fontWeight: '700' }]}>
                  Referans çözümü editöre yerleştir
                </Text>
              </Pressable>
            </View>
          ) : null}

          {result ? (
            <View
              style={[
                styles.resultCard,
                { backgroundColor: result.passed ? palette.successBg : palette.errorBg },
              ]}
            >
              <View style={styles.rowGap}>
                {result.passed ? (
                  <CheckCircle2 size={18} color={palette.success} />
                ) : (
                  <AlertCircle size={18} color={palette.error} />
                )}
                <Text
                  style={[
                    TYPOGRAPHY.bodyStrong,
                    { color: result.passed ? palette.success : palette.error },
                  ]}
                >
                  {result.passed ? 'Tüm testler geçti' : 'Tekrar kontrol edin'}
                </Text>
              </View>
              <Text style={[TYPOGRAPHY.body, { color: palette.textPrimary, marginTop: 6 }]}>
                {result.passed ? activeChallenge.explanation : result.message}
              </Text>
            </View>
          ) : null}
        </ScrollView>

        <View style={[styles.bottomBar, { backgroundColor: palette.bg }]}>
          <PillButton
            label="Çalıştır & Test Et"
            onPress={runCheck}
            leftIcon={<Play size={14} color={palette.primaryText} fill={palette.primaryText} />}
          />
        </View>
      </KeyboardAvoidingView>
    );
  }

  const filters: { label: string; value: FilterTopic }[] = [
    { label: 'Tümü', value: 'all' },
    { label: 'SQL', value: 'sql' },
    { label: 'Drizzle', value: 'drizzle' },
    { label: 'TypeScript', value: 'typescript' },
    { label: 'Node.js', value: 'nodejs' },
  ];

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: palette.bg }}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[TYPOGRAPHY.body, { color: palette.textMuted }]}>Pratik Laboratuvarı</Text>
      <Text style={[TYPOGRAPHY.display, { color: palette.textPrimary, marginTop: 2 }]}>
        Kod & SQL Yaz
      </Text>

      {/* Clean Visual Header Card */}
      <View style={[styles.heroBanner, { backgroundColor: palette.surface }]}>
        <Image source={ILLUSTRATIONS.sql} style={styles.heroImg} resizeMode="cover" />
        <View style={styles.heroBody}>
          <Text style={[TYPOGRAPHY.h3, { color: palette.textPrimary }]}>
            Gerçek Senaryolarla Pratik
          </Text>
          <Text style={[TYPOGRAPHY.caption, { color: palette.textSecondary, marginTop: 4 }]}>
            {state.completedSandboxIds.length}/{SANDBOX_CHALLENGES.length} problem çözüldü
          </Text>
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ marginTop: 20 }}
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

      <View style={{ gap: 12, marginTop: 18 }}>
        {challenges.map((ch) => {
          const solved = state.completedSandboxIds.includes(ch.id);
          return (
            <Pressable
              key={ch.id}
              onPress={() => openChallenge(ch)}
              style={({ pressed }) => [
                styles.challengeCard,
                { backgroundColor: pressed ? palette.surfacePressed : palette.surface },
              ]}
            >
              <View style={{ flex: 1, paddingRight: 12 }}>
                <View style={styles.rowGap}>
                  <SoftBadge label={TOPIC_LABELS[ch.topic]} tone={getTopicTone(ch.topic)} />
                  <Text style={[TYPOGRAPHY.caption, { color: palette.textMuted }]}>
                    {ch.difficulty} · +{ch.xp} XP
                  </Text>
                </View>
                <Text style={[TYPOGRAPHY.h3, { color: palette.textPrimary, marginTop: 10 }]}>
                  {ch.title}
                </Text>
                <Text
                  style={[TYPOGRAPHY.caption, { color: palette.textSecondary, marginTop: 4 }]}
                  numberOfLines={2}
                >
                  {ch.prompt}
                </Text>
              </View>

              <View
                style={[
                  styles.iconCircle,
                  { backgroundColor: solved ? palette.sageBg : palette.surfaceSoft },
                ]}
              >
                {solved ? (
                  <CheckCircle2 size={18} color={palette.primary} strokeWidth={2.2} />
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
  heroBanner: {
    marginTop: 18,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
  },
  heroImg: {
    width: '100%',
    height: 130,
  },
  heroBody: {
    padding: 16,
  },
  filterPill: {
    borderRadius: RADIUS.pill,
    paddingHorizontal: 16,
    paddingVertical: 9,
  },
  challengeCard: {
    borderRadius: RADIUS.lg,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: RADIUS.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowGap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  editorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  backCircle: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editorScroll: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: 36,
  },
  editorBox: {
    borderRadius: RADIUS.md,
    overflow: 'hidden',
  },
  editorToolbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  miniAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  editorInput: {
    fontFamily: 'monospace',
    fontSize: 13,
    lineHeight: 20,
    minHeight: 140,
    padding: 16,
  },
  tokenWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tokenChip: {
    borderRadius: RADIUS.pill,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  hintBox: {
    marginTop: 16,
    borderRadius: RADIUS.md,
    padding: 16,
  },
  resultCard: {
    marginTop: 16,
    borderRadius: RADIUS.md,
    padding: 16,
  },
  bottomBar: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: 14,
  },
});
