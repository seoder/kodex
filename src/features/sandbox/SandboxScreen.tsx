import React, { useEffect, useMemo, useState } from 'react';
import {
  BackHandler,
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
  Code2,
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
  PrimaryButton,
  SqlTablePreview,
  SurfaceCard,
  TagBadge,
  TOPIC_LABELS,
} from '../../shared/components/SwissUI';

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
        <View style={[styles.editorHeader, { borderBottomColor: palette.border }]}>
          <Pressable
            onPress={() => setActiveChallenge(null)}
            style={styles.backBtn}
            hitSlop={8}
          >
            <ArrowLeft size={20} color={palette.textPrimary} strokeWidth={2} />
            <Text style={[TYPOGRAPHY.bodyStrong, { color: palette.textPrimary }]}>
              Laboratuvar
            </Text>
          </Pressable>
          <TagBadge label={`${activeChallenge.language.toUpperCase()} · +${activeChallenge.xp} XP`} tone="inverse" />
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
          <Text style={[TYPOGRAPHY.body, { color: palette.textSecondary, marginTop: 6 }]}>
            {activeChallenge.prompt}
          </Text>

          {activeChallenge.tables ? (
            <View style={{ gap: 10, marginTop: 14 }}>
              {activeChallenge.tables.map((t, idx) => (
                <SqlTablePreview key={idx} table={t} accentLabel="INPUT" />
              ))}
              {activeChallenge.expectedTable ? (
                <SqlTablePreview
                  table={activeChallenge.expectedTable}
                  accentLabel="EXPECTED"
                />
              ) : null}
            </View>
          ) : null}

          <View
            style={[
              styles.editorBox,
              {
                backgroundColor: palette.codeBg,
                borderColor: palette.borderStrong,
                marginTop: 16,
              },
            ]}
          >
            <View style={[styles.editorToolbar, { borderBottomColor: palette.codeBorder }]}>
              <Text style={[TYPOGRAPHY.micro, { color: palette.textMuted }]}>
                {activeChallenge.language.toUpperCase()} SANDBOX
              </Text>
              <View style={{ flexDirection: 'row', gap: 14 }}>
                <Pressable onPress={() => setShowHint((h) => !h)} style={styles.miniAction}>
                  <HelpCircle size={13} color={palette.textMuted} />
                  <Text style={[TYPOGRAPHY.micro, { color: palette.textMuted }]}>İPUCU</Text>
                </Pressable>
                <Pressable
                  onPress={() => {
                    setDraft(activeChallenge.starterCode);
                    setResult(null);
                  }}
                  style={styles.miniAction}
                >
                  <RotateCcw size={13} color={palette.textMuted} />
                  <Text style={[TYPOGRAPHY.micro, { color: palette.textMuted }]}>SIFIRLA</Text>
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

          <View style={{ marginTop: 14 }}>
            <Text style={[TYPOGRAPHY.micro, { color: palette.textMuted, marginBottom: 8 }]}>
              HIZLI TOKENLAR
            </Text>
            <View style={styles.tokenWrap}>
              {activeChallenge.quickTokens.map((tok, i) => (
                <Pressable
                  key={i}
                  onPress={() =>
                    setDraft((prev) => (prev.trim() ? `${prev.trimEnd()}\n${tok}` : tok))
                  }
                  style={[
                    styles.tokenChip,
                    { backgroundColor: palette.surface, borderColor: palette.border },
                  ]}
                >
                  <Text style={[TYPOGRAPHY.code, { fontSize: 12, color: palette.textPrimary }]}>
                    {tok}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {showHint ? (
            <SurfaceCard style={{ marginTop: 14 }}>
              <Text style={[TYPOGRAPHY.micro, { color: palette.warning }]}>İPUCU</Text>
              <Text style={[TYPOGRAPHY.body, { color: palette.textPrimary, marginTop: 4 }]}>
                {activeChallenge.hint}
              </Text>
              <Pressable
                onPress={() => setDraft(activeChallenge.solution)}
                style={{ marginTop: 10 }}
              >
                <Text
                  style={[
                    TYPOGRAPHY.caption,
                    { color: palette.textMuted, textDecorationLine: 'underline' },
                  ]}
                >
                  Çözümü editöre doldur
                </Text>
              </Pressable>
            </SurfaceCard>
          ) : null}

          {result ? (
            <View
              style={[
                styles.resultCard,
                {
                  backgroundColor: result.passed ? palette.successBg : palette.errorBg,
                  borderColor: result.passed ? palette.successBorder : palette.errorBorder,
                },
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
                  {result.passed ? 'Tüm Testler Geçti' : 'Eksik / Hatalı Yapı'}
                </Text>
              </View>
              <Text style={[TYPOGRAPHY.body, { color: palette.textPrimary, marginTop: 6 }]}>
                {result.passed ? activeChallenge.explanation : result.message}
              </Text>
            </View>
          ) : null}
        </ScrollView>

        <View
          style={[
            styles.bottomBar,
            { backgroundColor: palette.bg, borderTopColor: palette.border },
          ]}
        >
          <PrimaryButton
            label="Çalıştır & Test Et"
            onPress={runCheck}
            leftIcon={<Play size={15} color={palette.accentText} strokeWidth={2.2} />}
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
      <Text style={[TYPOGRAPHY.micro, { color: palette.textMuted }]}>PRATİK LABORATUVARI</Text>
      <Text style={[TYPOGRAPHY.display, { color: palette.textPrimary, marginTop: 4 }]}>
        Kod & SQL Yaz
      </Text>
      <Text style={[TYPOGRAPHY.body, { color: palette.textSecondary, marginTop: 6 }]}>
        Gerçek üretim senaryolarında SQL sorgusu, Drizzle transaction ve tip-güvenli TypeScript yazıp anında doğrulayın.
      </Text>

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

      <View style={{ gap: 12, marginTop: 18 }}>
        {challenges.map((ch) => {
          const solved = state.completedSandboxIds.includes(ch.id);
          return (
            <Pressable
              key={ch.id}
              onPress={() => openChallenge(ch)}
              style={({ pressed }) => [
                styles.challengeCard,
                {
                  backgroundColor: pressed ? palette.surfacePressed : palette.surfaceElevated,
                  borderColor: solved ? palette.borderStrong : palette.border,
                },
              ]}
            >
              <View style={styles.challengeTop}>
                <View style={styles.rowGap}>
                  <TagBadge label={TOPIC_LABELS[ch.topic]} />
                  <TagBadge
                    label={ch.difficulty}
                    tone={ch.difficulty === 'Senior' ? 'inverse' : 'neutral'}
                  />
                </View>
                {solved ? (
                  <CheckCircle2 size={18} color={palette.success} strokeWidth={2.2} />
                ) : (
                  <Code2 size={17} color={palette.textMuted} strokeWidth={2} />
                )}
              </View>

              <Text style={[TYPOGRAPHY.h3, { color: palette.textPrimary, marginTop: 10 }]}>
                {ch.title}
              </Text>
              <Text
                style={[TYPOGRAPHY.body, { color: palette.textSecondary, marginTop: 4 }]}
                numberOfLines={2}
              >
                {ch.prompt}
              </Text>
              <Text style={[TYPOGRAPHY.micro, { color: palette.textMuted, marginTop: 12 }]}>
                +{ch.xp} XP · {ch.testCases.length} TEST SENARYOSU
              </Text>
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
  filterPill: {
    borderWidth: 1,
    borderRadius: RADIUS.sm,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  challengeCard: {
    borderWidth: 1,
    borderRadius: RADIUS.md,
    padding: SPACING.lg,
  },
  challengeTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rowGap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  editorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  editorScroll: {
    padding: SPACING.lg,
    paddingBottom: 36,
  },
  editorBox: {
    borderWidth: 1.5,
    borderRadius: RADIUS.sm,
    overflow: 'hidden',
  },
  editorToolbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
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
    padding: SPACING.md,
  },
  tokenWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tokenChip: {
    borderWidth: 1,
    borderRadius: RADIUS.xs,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  resultCard: {
    marginTop: 16,
    borderWidth: 1,
    borderRadius: RADIUS.sm,
    padding: SPACING.md,
  },
  bottomBar: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderTopWidth: 1,
  },
});
