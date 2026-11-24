import React, { useEffect, useState } from 'react';
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
  BookOpen,
  CheckCircle2,
  HelpCircle,
  Layers,
  Play,
  RotateCcw,
  X,
} from 'lucide-react-native';
import { useTheme } from '../../core/theme/ThemeContext';
import { RADIUS, SPACING, TYPOGRAPHY } from '../../core/theme/tokens';
import { useProgress } from '../../core/storage/progressStore';
import { validateCodeSubmission, ValidationResult } from '../../core/engine/validator';
import {
  ArchitectureSortStep,
  CodeWriteStep,
  LessonStep,
  ModuleItem,
  MultipleChoiceStep,
  OutputPredictStep,
  SqlWriteStep,
} from '../../data/curriculum';
import {
  CodeBlock,
  IOComparisonBox,
  PrimaryButton,
  ProgressBar,
  SqlTablePreview,
  SurfaceCard,
  TagBadge,
  TOPIC_LABELS,
} from '../../shared/components/SwissUI';

interface LessonPlayerScreenProps {
  module: ModuleItem;
  onExit: () => void;
}

const STEP_KIND_LABEL: Record<LessonStep['kind'], string> = {
  concept: 'KONSEPT',
  multiple_choice: 'SORU / ANALİZ',
  output_predict: 'ÇIKTI TAHMİNİ',
  code_write: 'KOD YAZ',
  sql_write: 'SQL YAZ',
  architecture_sort: 'MİMARİ KATMAN',
};

export function LessonPlayerScreen({ module, onExit }: LessonPlayerScreenProps) {
  const { palette } = useTheme();
  const { recordStepCompleted, recordModuleCompleted, recordMistake } = useProgress();

  const [stepIndex, setStepIndex] = useState(0);
  const [finished, setFinished] = useState(false);
  const [earnedXp, setEarnedXp] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);

  // Per-step interactive state
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [codeDraft, setCodeDraft] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [checked, setChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  // Architecture sort state
  const [activeArchItemId, setActiveArchItemId] = useState<string | null>(null);
  const [archMapping, setArchMapping] = useState<Record<string, string>>({});

  const step = module.steps[stepIndex];

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      onExit();
      return true;
    });
    return () => sub.remove();
  }, [onExit]);

  useEffect(() => {
    if (!step) return;
    setSelectedOption(null);
    setShowHint(false);
    setValidation(null);
    setChecked(false);
    setIsCorrect(false);
    setArchMapping({});

    if (step.kind === 'code_write') {
      setCodeDraft(step.starterCode);
    } else if (step.kind === 'sql_write') {
      setCodeDraft(step.starterSql);
    } else if (step.kind === 'architecture_sort') {
      setActiveArchItemId(step.items[0]?.id ?? null);
    } else {
      setCodeDraft('');
    }
  }, [stepIndex, step]);

  const triggerHaptic = (success: boolean) => {
    Haptics.notificationAsync(
      success ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Error
    ).catch(() => {});
  };

  const handleCheck = () => {
    if (!step) return;

    if (step.kind === 'concept') {
      recordStepCompleted(step.id, step.xp);
      setEarnedXp((prev) => prev + step.xp);
      setCorrectCount((prev) => prev + 1);
      handleNext();
      return;
    }

    if (step.kind === 'multiple_choice' || step.kind === 'output_predict') {
      if (selectedOption === null) return;
      const ok = selectedOption === step.correctIndex;
      setChecked(true);
      setIsCorrect(ok);
      triggerHaptic(ok);
      if (ok) {
        recordStepCompleted(step.id, step.xp);
        setEarnedXp((prev) => prev + step.xp);
        setCorrectCount((prev) => prev + 1);
      } else {
        recordMistake(step.id);
      }
      return;
    }

    if (step.kind === 'code_write' || step.kind === 'sql_write') {
      const result = validateCodeSubmission({
        userInput: codeDraft,
        language: step.kind === 'sql_write' ? 'sql' : step.language,
        requiredGroups: step.requiredGroups,
        forbiddenPatterns: step.forbiddenPatterns,
        testCases:
          step.kind === 'code_write'
            ? step.testCases
            : [
                {
                  label: 'SQL Sonuç Doğrulaması',
                  input: step.tables.map((t) => t.tableName).join(', '),
                  expectedOutput: `${step.expectedTable.rows.length} satır (${step.expectedTable.columns.join(', ')})`,
                },
              ],
      });
      setValidation(result);
      setChecked(true);
      setIsCorrect(result.passed);
      triggerHaptic(result.passed);
      if (result.passed) {
        recordStepCompleted(step.id, step.xp);
        setEarnedXp((prev) => prev + step.xp);
        setCorrectCount((prev) => prev + 1);
      } else {
        recordMistake(step.id);
      }
      return;
    }

    if (step.kind === 'architecture_sort') {
      const allMatched = Object.entries(step.expectedMapping).every(
        ([itemId, expectedLayer]) => archMapping[itemId] === expectedLayer
      );
      setChecked(true);
      setIsCorrect(allMatched);
      triggerHaptic(allMatched);
      if (allMatched) {
        recordStepCompleted(step.id, step.xp);
        setEarnedXp((prev) => prev + step.xp);
        setCorrectCount((prev) => prev + 1);
      } else {
        recordMistake(step.id);
      }
    }
  };

  const handleNext = () => {
    if (stepIndex + 1 < module.steps.length) {
      setStepIndex((i) => i + 1);
    } else {
      recordModuleCompleted(module.id);
      setEarnedXp((prev) => prev + 25);
      setFinished(true);
    }
  };

  const handleInsertToken = (token: string) => {
    setCodeDraft((prev) => {
      const trimmed = prev.trimEnd();
      return trimmed.length === 0 ? token : `${trimmed}\n${token}`;
    });
  };

  if (finished) {
    return (
      <View style={[styles.finishScreen, { backgroundColor: palette.bg }]}>
        <View style={[styles.finishIconBox, { borderColor: palette.borderStrong }]}>
          <CheckCircle2 size={36} color={palette.textPrimary} strokeWidth={1.8} />
        </View>
        <TagBadge label="MODÜL TAMAMLANDI" tone="inverse" />
        <Text
          style={[
            TYPOGRAPHY.display,
            { color: palette.textPrimary, textAlign: 'center', marginTop: 14 },
          ]}
        >
          {module.title}
        </Text>
        <Text
          style={[
            TYPOGRAPHY.body,
            { color: palette.textSecondary, textAlign: 'center', marginTop: 8 },
          ]}
        >
          Adımlar işlendi ve ilerlemeniz kaydedildi.
        </Text>

        <View style={styles.finishStatsRow}>
          <SurfaceCard style={styles.finishStatCard}>
            <Text style={[TYPOGRAPHY.micro, { color: palette.textMuted }]}>KAZANILAN XP</Text>
            <Text style={[TYPOGRAPHY.display, { color: palette.textPrimary, marginTop: 4 }]}>
              +{earnedXp}
            </Text>
          </SurfaceCard>
          <SurfaceCard style={styles.finishStatCard}>
            <Text style={[TYPOGRAPHY.micro, { color: palette.textMuted }]}>BAŞARI</Text>
            <Text style={[TYPOGRAPHY.display, { color: palette.textPrimary, marginTop: 4 }]}>
              {correctCount}/{module.steps.length}
            </Text>
          </SurfaceCard>
        </View>

        <PrimaryButton
          label="Öğrenme Yoluna Dön"
          onPress={onExit}
          style={{ width: '100%', marginTop: 24 }}
        />
      </View>
    );
  }

  const canSubmit =
    step.kind === 'concept' ||
    ((step.kind === 'multiple_choice' || step.kind === 'output_predict') &&
      selectedOption !== null) ||
    ((step.kind === 'code_write' || step.kind === 'sql_write') && codeDraft.trim().length > 0) ||
    (step.kind === 'architecture_sort' &&
      Object.keys(archMapping).length === step.items.length);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: palette.bg }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Top Progress Header */}
      <View style={[styles.header, { borderBottomColor: palette.border }]}>
        <Pressable onPress={onExit} style={styles.closeBtn} hitSlop={8}>
          <X size={20} color={palette.textPrimary} strokeWidth={2} />
        </Pressable>
        <View style={{ flex: 1, marginHorizontal: 12 }}>
          <ProgressBar progress={(stepIndex + 1) / module.steps.length} height={4} />
        </View>
        <Text style={[TYPOGRAPHY.micro, { color: palette.textMuted, fontFamily: TYPOGRAPHY.mono }]}>
          {stepIndex + 1}/{module.steps.length}
        </Text>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.metaRow}>
          <TagBadge label={STEP_KIND_LABEL[step.kind]} tone="inverse" />
          <TagBadge label={TOPIC_LABELS[module.topic]} />
          <Text style={[TYPOGRAPHY.micro, { color: palette.textMuted, marginLeft: 'auto' }]}>
            +{step.xp} XP
          </Text>
        </View>

        <Text style={[TYPOGRAPHY.h1, { color: palette.textPrimary, marginTop: 12 }]}>
          {step.title}
        </Text>

        {/* CONCEPT STEP */}
        {step.kind === 'concept' ? (
          <View style={styles.sectionStack}>
            <Text style={[TYPOGRAPHY.body, { color: palette.textSecondary, lineHeight: 22 }]}>
              {step.body}
            </Text>

            <SurfaceCard>
              <Text style={[TYPOGRAPHY.micro, { color: palette.textMuted, marginBottom: 10 }]}>
                KRİTİK NOKTALAR
              </Text>
              {step.keyPoints.map((pt, idx) => (
                <View key={idx} style={styles.bulletRow}>
                  <Text
                    style={[
                      TYPOGRAPHY.micro,
                      { color: palette.textPrimary, fontFamily: TYPOGRAPHY.mono, width: 20 },
                    ]}
                  >
                    {String(idx + 1).padStart(2, '0')}
                  </Text>
                  <Text style={[TYPOGRAPHY.body, { color: palette.textPrimary, flex: 1 }]}>
                    {pt}
                  </Text>
                </View>
              ))}
            </SurfaceCard>

            {step.code ? <CodeBlock code={step.code} language={step.codeLanguage} /> : null}
            {step.ioExample ? <IOComparisonBox io={step.ioExample} /> : null}
          </View>
        ) : null}

        {/* MULTIPLE CHOICE & OUTPUT PREDICT */}
        {step.kind === 'multiple_choice' || step.kind === 'output_predict' ? (
          <ChoiceExerciseView
            step={step}
            selectedOption={selectedOption}
            checked={checked}
            onSelect={(idx) => {
              if (!checked) setSelectedOption(idx);
            }}
          />
        ) : null}

        {/* CODE WRITE & SQL WRITE */}
        {step.kind === 'code_write' || step.kind === 'sql_write' ? (
          <EditorExerciseView
            step={step}
            codeDraft={codeDraft}
            onChangeCode={(text) => {
              setCodeDraft(text);
              if (checked && !isCorrect) setChecked(false);
            }}
            onInsertToken={handleInsertToken}
            onReset={() => {
              setCodeDraft(step.kind === 'sql_write' ? step.starterSql : step.starterCode);
              setChecked(false);
              setValidation(null);
            }}
            showHint={showHint}
            onToggleHint={() => setShowHint((h) => !h)}
            onFillSolution={() => setCodeDraft(step.solution)}
            validation={validation}
          />
        ) : null}

        {/* ARCHITECTURE SORT */}
        {step.kind === 'architecture_sort' ? (
          <ArchitectureExerciseView
            step={step}
            activeItemId={activeArchItemId}
            mapping={archMapping}
            checked={checked}
            onSelectItem={setActiveArchItemId}
            onAssignLayer={(layerId) => {
              if (!activeArchItemId || (checked && isCorrect)) return;
              const nextMap = { ...archMapping, [activeArchItemId]: layerId };
              setArchMapping(nextMap);
              if (checked) setChecked(false);
              const nextUnassigned = step.items.find((it) => !nextMap[it.id]);
              if (nextUnassigned) setActiveArchItemId(nextUnassigned.id);
            }}
          />
        ) : null}

        {/* FEEDBACK PANEL */}
        {checked && step.kind !== 'concept' ? (
          <View
            style={[
              styles.feedbackBox,
              {
                backgroundColor: isCorrect ? palette.successBg : palette.errorBg,
                borderColor: isCorrect ? palette.successBorder : palette.errorBorder,
              },
            ]}
          >
            <View style={styles.feedbackTitleRow}>
              {isCorrect ? (
                <CheckCircle2 size={18} color={palette.success} strokeWidth={2.2} />
              ) : (
                <AlertCircle size={18} color={palette.error} strokeWidth={2.2} />
              )}
              <Text
                style={[
                  TYPOGRAPHY.bodyStrong,
                  { color: isCorrect ? palette.success : palette.error },
                ]}
              >
                {isCorrect ? 'Doğru Çözüm' : 'Tekrar İnceleyin'}
              </Text>
            </View>
            <Text style={[TYPOGRAPHY.body, { color: palette.textPrimary, marginTop: 6 }]}>
              {step.explanation}
            </Text>
          </View>
        ) : null}

        {/* INTERVIEW NOTE */}
        {step.interviewNote && (step.kind === 'concept' || checked) ? (
          <SurfaceCard style={styles.interviewNoteCard}>
            <View style={styles.feedbackTitleRow}>
              <BookOpen size={15} color={palette.textPrimary} strokeWidth={2} />
              <Text style={[TYPOGRAPHY.micro, { color: palette.textPrimary }]}>
                SENIOR MÜLAKAT NOTU
              </Text>
            </View>
            <Text style={[TYPOGRAPHY.body, { color: palette.textSecondary, marginTop: 6 }]}>
              {step.interviewNote}
            </Text>
          </SurfaceCard>
        ) : null}
      </ScrollView>

      {/* Sticky Bottom Action Bar */}
      <View
        style={[
          styles.bottomBar,
          { backgroundColor: palette.bg, borderTopColor: palette.border },
        ]}
      >
        {step.kind === 'concept' ? (
          <PrimaryButton label="Anladım, Devam Et" onPress={handleCheck} />
        ) : checked && isCorrect ? (
          <PrimaryButton
            label={stepIndex + 1 === module.steps.length ? 'Modülü Tamamla' : 'Sonraki Adım'}
            onPress={handleNext}
          />
        ) : (
          <View style={styles.bottomBtnRow}>
            {checked && !isCorrect ? (
              <PrimaryButton
                label="Geç"
                variant="outline"
                onPress={handleNext}
                style={{ width: 96 }}
              />
            ) : null}
            <PrimaryButton
              label={
                step.kind === 'code_write' || step.kind === 'sql_write'
                  ? 'Çalıştır & Doğrula'
                  : 'Kontrol Et'
              }
              onPress={handleCheck}
              disabled={!canSubmit}
              style={{ flex: 1 }}
              leftIcon={
                step.kind === 'code_write' || step.kind === 'sql_write' ? (
                  <Play size={15} color={palette.accentText} strokeWidth={2.2} />
                ) : undefined
              }
            />
          </View>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

function ChoiceExerciseView({
  step,
  selectedOption,
  checked,
  onSelect,
}: {
  step: MultipleChoiceStep | OutputPredictStep;
  selectedOption: number | null;
  checked: boolean;
  onSelect: (idx: number) => void;
}) {
  const { palette } = useTheme();
  const letters = ['A', 'B', 'C', 'D'];

  return (
    <View style={styles.sectionStack}>
      <Text style={[TYPOGRAPHY.body, { color: palette.textSecondary }]}>{step.prompt}</Text>
      {step.code ? <CodeBlock code={step.code} language={step.codeLanguage} /> : null}
      <View style={{ gap: 10 }}>
        {step.options.map((opt, idx) => {
          const isSelected = selectedOption === idx;
          const isRight = checked && idx === step.correctIndex;
          const isWrongChoice = checked && isSelected && idx !== step.correctIndex;

          const borderColor = isRight
            ? palette.success
            : isWrongChoice
              ? palette.error
              : isSelected
                ? palette.borderStrong
                : palette.border;
          const bgColor = isRight
            ? palette.successBg
            : isWrongChoice
              ? palette.errorBg
              : isSelected
                ? palette.surface
                : palette.surfaceElevated;

          return (
            <Pressable
              key={idx}
              onPress={() => onSelect(idx)}
              style={[styles.optionCard, { borderColor, backgroundColor: bgColor }]}
            >
              <View
                style={[
                  styles.optionLetter,
                  {
                    borderColor: isSelected ? palette.borderStrong : palette.border,
                    backgroundColor: isSelected ? palette.accent : 'transparent',
                  },
                ]}
              >
                <Text
                  style={[
                    TYPOGRAPHY.micro,
                    { color: isSelected ? palette.accentText : palette.textMuted },
                  ]}
                >
                  {letters[idx]}
                </Text>
              </View>
              <Text style={[TYPOGRAPHY.body, { color: palette.textPrimary, flex: 1 }]}>
                {opt}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function EditorExerciseView({
  step,
  codeDraft,
  onChangeCode,
  onInsertToken,
  onReset,
  showHint,
  onToggleHint,
  onFillSolution,
  validation,
}: {
  step: CodeWriteStep | SqlWriteStep;
  codeDraft: string;
  onChangeCode: (v: string) => void;
  onInsertToken: (t: string) => void;
  onReset: () => void;
  showHint: boolean;
  onToggleHint: () => void;
  onFillSolution: () => void;
  validation: ValidationResult | null;
}) {
  const { palette } = useTheme();

  return (
    <View style={styles.sectionStack}>
      <Text style={[TYPOGRAPHY.body, { color: palette.textSecondary }]}>{step.prompt}</Text>

      {step.kind === 'sql_write' ? (
        <View style={{ gap: 10 }}>
          {step.tables.map((tbl, i) => (
            <SqlTablePreview key={i} table={tbl} accentLabel="INPUT TABLE" />
          ))}
          <SqlTablePreview table={step.expectedTable} accentLabel="BEKLENEN ÇIKTI" />
        </View>
      ) : null}

      {/* Editor Box */}
      <View
        style={[
          styles.editorBox,
          { backgroundColor: palette.codeBg, borderColor: palette.borderStrong },
        ]}
      >
        <View style={[styles.editorToolbar, { borderBottomColor: palette.codeBorder }]}>
          <Text style={[TYPOGRAPHY.micro, { color: palette.textMuted }]}>
            {step.kind === 'sql_write' ? 'POSTGRESQL EDITOR' : `${step.language.toUpperCase()} EDITOR`}
          </Text>
          <View style={styles.editorActions}>
            <Pressable onPress={onToggleHint} style={styles.miniAction}>
              <HelpCircle size={13} color={palette.textMuted} />
              <Text style={[TYPOGRAPHY.micro, { color: palette.textMuted }]}>İPUCU</Text>
            </Pressable>
            <Pressable onPress={onReset} style={styles.miniAction}>
              <RotateCcw size={13} color={palette.textMuted} />
              <Text style={[TYPOGRAPHY.micro, { color: palette.textMuted }]}>SIFIRLA</Text>
            </Pressable>
          </View>
        </View>
        <TextInput
          value={codeDraft}
          onChangeText={onChangeCode}
          multiline
          autoCapitalize="none"
          autoCorrect={false}
          spellCheck={false}
          textAlignVertical="top"
          style={[styles.editorInput, { color: palette.codeText }]}
          placeholder="Kodunuzu buraya yazın..."
          placeholderTextColor={palette.textMuted}
        />
      </View>

      {/* Quick Insert Tokens */}
      <View>
        <Text style={[TYPOGRAPHY.micro, { color: palette.textMuted, marginBottom: 8 }]}>
          HIZLI EKLE (DOKUN)
        </Text>
        <View style={styles.tokenWrap}>
          {step.quickTokens.map((tok, i) => (
            <Pressable
              key={i}
              onPress={() => onInsertToken(tok)}
              style={({ pressed }) => [
                styles.tokenChip,
                {
                  backgroundColor: pressed ? palette.surfacePressed : palette.surface,
                  borderColor: palette.border,
                },
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
        <SurfaceCard>
          <Text style={[TYPOGRAPHY.micro, { color: palette.warning }]}>İPUCU</Text>
          <Text style={[TYPOGRAPHY.body, { color: palette.textPrimary, marginTop: 4 }]}>
            {step.hint}
          </Text>
          <Pressable onPress={onFillSolution} style={{ marginTop: 10 }}>
            <Text
              style={[
                TYPOGRAPHY.caption,
                { color: palette.textMuted, textDecorationLine: 'underline' },
              ]}
            >
              Referans çözümü editöre doldur
            </Text>
          </Pressable>
        </SurfaceCard>
      ) : null}

      {/* Test Case Results */}
      {validation ? (
        <SurfaceCard>
          <Text style={[TYPOGRAPHY.micro, { color: palette.textMuted, marginBottom: 8 }]}>
            TEST SENARYOLARI ({validation.matchedCount}/{validation.totalGroups} KONTROL)
          </Text>
          <Text style={[TYPOGRAPHY.body, { color: palette.textSecondary, marginBottom: 10 }]}>
            {validation.message}
          </Text>
          {validation.testResults.map((tr, i) => (
            <View
              key={i}
              style={[
                styles.testCaseRow,
                { borderTopColor: palette.border },
              ]}
            >
              <View style={styles.feedbackTitleRow}>
                {tr.passed ? (
                  <CheckCircle2 size={14} color={palette.success} />
                ) : (
                  <AlertCircle size={14} color={palette.error} />
                )}
                <Text style={[TYPOGRAPHY.caption, { color: palette.textPrimary, fontWeight: '700' }]}>
                  {tr.label}
                </Text>
              </View>
              <Text style={[TYPOGRAPHY.code, { fontSize: 11, color: palette.textMuted, marginTop: 3 }]}>
                IN: {tr.input}
              </Text>
              <Text style={[TYPOGRAPHY.code, { fontSize: 11, color: palette.textSecondary }]}>
                OUT: {tr.expectedOutput}
              </Text>
            </View>
          ))}
        </SurfaceCard>
      ) : null}
    </View>
  );
}

function ArchitectureExerciseView({
  step,
  activeItemId,
  mapping,
  checked,
  onSelectItem,
  onAssignLayer,
}: {
  step: ArchitectureSortStep;
  activeItemId: string | null;
  mapping: Record<string, string>;
  checked: boolean;
  onSelectItem: (id: string) => void;
  onAssignLayer: (layerId: string) => void;
}) {
  const { palette } = useTheme();

  return (
    <View style={styles.sectionStack}>
      <Text style={[TYPOGRAPHY.body, { color: palette.textSecondary }]}>{step.prompt}</Text>
      <TagBadge label={step.scenario} />

      <Text style={[TYPOGRAPHY.micro, { color: palette.textMuted }]}>
        1. DOSYAYI SEÇİN
      </Text>
      <View style={{ gap: 8 }}>
        {step.items.map((item) => {
          const isActive = activeItemId === item.id;
          const assigned = mapping[item.id];
          const isWrong = checked && assigned !== step.expectedMapping[item.id];
          const isRight = checked && assigned === step.expectedMapping[item.id];

          return (
            <Pressable
              key={item.id}
              onPress={() => onSelectItem(item.id)}
              style={[
                styles.archItemCard,
                {
                  backgroundColor: isActive ? palette.surface : palette.surfaceElevated,
                  borderColor: isWrong
                    ? palette.error
                    : isRight
                      ? palette.success
                      : isActive
                        ? palette.borderStrong
                        : palette.border,
                },
              ]}
            >
              <View style={{ flex: 1 }}>
                <Text style={[TYPOGRAPHY.code, { fontWeight: '700', color: palette.textPrimary }]}>
                  {item.label}
                </Text>
                <Text style={[TYPOGRAPHY.caption, { color: palette.textMuted, marginTop: 2 }]}>
                  {item.detail}
                </Text>
              </View>
              <TagBadge
                label={assigned ? `${assigned}/` : 'SEÇİLMEDİ'}
                tone={assigned ? 'inverse' : 'neutral'}
              />
            </Pressable>
          );
        })}
      </View>

      <Text style={[TYPOGRAPHY.micro, { color: palette.textMuted, marginTop: 6 }]}>
        2. HEDEF KATMANA YERLEŞTİRİN
      </Text>
      <View style={styles.layerGrid}>
        {step.layers.map((layer) => (
          <Pressable
            key={layer.id}
            onPress={() => onAssignLayer(layer.id)}
            style={({ pressed }) => [
              styles.layerCard,
              {
                backgroundColor: pressed ? palette.surfacePressed : palette.surface,
                borderColor: palette.borderStrong,
              },
            ]}
          >
            <View style={styles.feedbackTitleRow}>
              <Layers size={14} color={palette.textPrimary} />
              <Text style={[TYPOGRAPHY.code, { fontWeight: '700', color: palette.textPrimary }]}>
                {layer.name}
              </Text>
            </View>
            <Text style={[TYPOGRAPHY.caption, { color: palette.textMuted, marginTop: 4 }]}>
              {layer.description}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
  },
  closeBtn: {
    padding: 4,
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: 36,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionStack: {
    marginTop: SPACING.lg,
    gap: SPACING.md,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 8,
  },
  optionCard: {
    borderWidth: 1.5,
    borderRadius: RADIUS.sm,
    padding: SPACING.md,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  optionLetter: {
    width: 24,
    height: 24,
    borderRadius: RADIUS.xs,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
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
  editorActions: {
    flexDirection: 'row',
    gap: 14,
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
    minHeight: 132,
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
  testCaseRow: {
    borderTopWidth: 1,
    paddingTop: 10,
    marginTop: 8,
  },
  archItemCard: {
    borderWidth: 1.5,
    borderRadius: RADIUS.sm,
    padding: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  layerGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  layerCard: {
    width: '48%',
    borderWidth: 1,
    borderRadius: RADIUS.sm,
    padding: SPACING.md,
  },
  feedbackBox: {
    marginTop: SPACING.lg,
    borderWidth: 1,
    borderRadius: RADIUS.sm,
    padding: SPACING.md,
  },
  feedbackTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  interviewNoteCard: {
    marginTop: SPACING.md,
  },
  bottomBar: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderTopWidth: 1,
  },
  bottomBtnRow: {
    flexDirection: 'row',
    gap: 10,
  },
  finishScreen: {
    flex: 1,
    padding: SPACING.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  finishIconBox: {
    width: 72,
    height: 72,
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  finishStatsRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
    marginTop: 28,
  },
  finishStatCard: {
    flex: 1,
    alignItems: 'center',
  },
});
