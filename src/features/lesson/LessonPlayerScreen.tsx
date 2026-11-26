import React, { useEffect, useState } from 'react';
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
  getTopicTone,
  IOComparisonBox,
  PillButton,
  ProgressBar,
  SoftBadge,
  SoftCard,
  SqlTablePreview,
  TOPIC_LABELS,
} from '../../shared/components/SwissUI';
import { getTopicIllustration } from '../../shared/assets';

interface LessonPlayerScreenProps {
  module: ModuleItem;
  onExit: () => void;
}

const STEP_KIND_LABEL: Record<LessonStep['kind'], string> = {
  concept: 'Konsept',
  multiple_choice: 'Analiz',
  output_predict: 'Çıktı Tahmini',
  code_write: 'Kod Yaz',
  sql_write: 'SQL Yaz',
  architecture_sort: 'Mimari',
};

export function LessonPlayerScreen({ module, onExit }: LessonPlayerScreenProps) {
  const { palette } = useTheme();
  const { recordStepCompleted, recordModuleCompleted, recordMistake } = useProgress();

  const [stepIndex, setStepIndex] = useState(0);
  const [finished, setFinished] = useState(false);
  const [earnedXp, setEarnedXp] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);

  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [codeDraft, setCodeDraft] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [checked, setChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

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

  if (finished) {
    return (
      <View style={[styles.finishScreen, { backgroundColor: palette.bg }]}>
        <View style={[styles.finishCircle, { backgroundColor: palette.sageBg }]}>
          <CheckCircle2 size={42} color={palette.primary} strokeWidth={1.9} />
        </View>
        <SoftBadge label="Modül Tamamlandı" tone="sage" />
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
          İlerlemeniz kaydedildi ve bir sonraki adım açıldı.
        </Text>

        <View style={styles.finishStatsRow}>
          <SoftCard style={styles.finishStatCard}>
            <Text style={[TYPOGRAPHY.caption, { color: palette.textMuted }]}>Kazanılan XP</Text>
            <Text style={[TYPOGRAPHY.display, { color: palette.primary, marginTop: 4 }]}>
              +{earnedXp}
            </Text>
          </SoftCard>
          <SoftCard style={styles.finishStatCard}>
            <Text style={[TYPOGRAPHY.caption, { color: palette.textMuted }]}>Başarı</Text>
            <Text style={[TYPOGRAPHY.display, { color: palette.textPrimary, marginTop: 4 }]}>
              {correctCount}/{module.steps.length}
            </Text>
          </SoftCard>
        </View>

        <PillButton
          label="Ana Sayfaya Dön"
          onPress={onExit}
          style={{ width: '100%', marginTop: 28 }}
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
      {/* Airy Top Header */}
      <View style={styles.header}>
        <Pressable
          onPress={onExit}
          accessibilityRole="button"
          accessibilityLabel="Dersi kapat ve müfredata dön"
          style={[styles.closeCircle, { backgroundColor: palette.surface }]}
          hitSlop={6}
        >
          <X size={20} color={palette.textPrimary} strokeWidth={2} />
        </Pressable>
        <View style={{ flex: 1, marginHorizontal: 14 }}>
          <ProgressBar progress={(stepIndex + 1) / module.steps.length} height={6} />
        </View>
        <Text style={[TYPOGRAPHY.caption, { color: palette.textMuted }]}>
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
          <SoftBadge label={STEP_KIND_LABEL[step.kind]} tone={getTopicTone(module.topic)} />
          <SoftBadge label={TOPIC_LABELS[module.topic]} tone="neutral" />
          <Text style={[TYPOGRAPHY.caption, { color: palette.textMuted, marginLeft: 'auto' }]}>
            +{step.xp} XP
          </Text>
        </View>

        <Text style={[TYPOGRAPHY.h1, { color: palette.textPrimary, marginTop: 14 }]}>
          {step.title}
        </Text>

        {/* CONCEPT STEP */}
        {step.kind === 'concept' ? (
          <View style={styles.sectionStack}>
            {stepIndex === 0 ? (
              <Image
                source={getTopicIllustration(module.topic)}
                style={styles.conceptHeroImg}
                resizeMode="cover"
              />
            ) : null}

            <Text style={[TYPOGRAPHY.body, { color: palette.textSecondary, lineHeight: 23 }]}>
              {step.body}
            </Text>

            <SoftCard>
              <Text style={[TYPOGRAPHY.micro, { color: palette.textMuted, marginBottom: 12 }]}>
                ÖNEMLİ NOKTALAR
              </Text>
              {step.keyPoints.map((pt, idx) => (
                <View key={idx} style={styles.bulletRow}>
                  <View style={[styles.bulletDot, { backgroundColor: palette.primary }]} />
                  <Text style={[TYPOGRAPHY.body, { color: palette.textPrimary, flex: 1 }]}>
                    {pt}
                  </Text>
                </View>
              ))}
            </SoftCard>

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
            onInsertToken={(tok) =>
              setCodeDraft((prev) => (prev.trim() ? `${prev.trimEnd()}\n${tok}` : tok))
            }
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
              { backgroundColor: isCorrect ? palette.successBg : palette.errorBg },
            ]}
          >
            <View style={styles.rowGap}>
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
                {isCorrect ? 'Harika, doğru çözüm' : 'Tekrar deneyelim'}
              </Text>
            </View>
            <Text style={[TYPOGRAPHY.body, { color: palette.textPrimary, marginTop: 8 }]}>
              {step.explanation}
            </Text>
          </View>
        ) : null}

        {/* INTERVIEW NOTE */}
        {step.interviewNote && (step.kind === 'concept' || checked) ? (
          <View style={[styles.noteCard, { backgroundColor: palette.sandBg }]}>
            <View style={styles.rowGap}>
              <BookOpen size={15} color={palette.sandText} strokeWidth={2} />
              <Text style={[TYPOGRAPHY.micro, { color: palette.sandText }]}>
                MÜLAKAT NOTU
              </Text>
            </View>
            <Text style={[TYPOGRAPHY.body, { color: palette.textPrimary, marginTop: 6 }]}>
              {step.interviewNote}
            </Text>
          </View>
        ) : null}
      </ScrollView>

      {/* Clean Sticky Bottom Bar */}
      <View style={[styles.bottomBar, { backgroundColor: palette.bg }]}>
        {step.kind === 'concept' ? (
          <PillButton label="Anladım, Devam Et" onPress={handleCheck} />
        ) : checked && isCorrect ? (
          <PillButton
            label={stepIndex + 1 === module.steps.length ? 'Modülü Tamamla' : 'Sonraki Adım'}
            onPress={handleNext}
          />
        ) : (
          <View style={styles.bottomBtnRow}>
            {checked && !isCorrect ? (
              <PillButton
                label="Geç"
                variant="outline"
                onPress={handleNext}
                style={{ width: 92 }}
              />
            ) : null}
            <PillButton
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
                  <Play size={14} color={palette.primaryText} fill={palette.primaryText} />
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

          const bgColor = isRight
            ? palette.successBg
            : isWrongChoice
              ? palette.errorBg
              : isSelected
                ? palette.sageBg
                : palette.surface;
          const borderColor = isRight
            ? palette.success
            : isWrongChoice
              ? palette.error
              : isSelected
                ? palette.primary
                : palette.borderSubtle;

          return (
            <Pressable
              key={idx}
              onPress={() => onSelect(idx)}
              style={[styles.optionCard, { backgroundColor: bgColor, borderColor }]}
            >
              <View
                style={[
                  styles.optionLetter,
                  { backgroundColor: isSelected ? palette.primary : palette.surfaceSoft },
                ]}
              >
                <Text
                  style={[
                    TYPOGRAPHY.micro,
                    { color: isSelected ? palette.primaryText : palette.textSecondary },
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
            <SqlTablePreview key={i} table={tbl} accentLabel="GİRDİ TABLOSU" />
          ))}
          <SqlTablePreview table={step.expectedTable} accentLabel="BEKLENEN ÇIKTI" />
        </View>
      ) : null}

      <View style={[styles.editorBox, { backgroundColor: palette.codeBg }]}>
        <View style={[styles.editorToolbar, { borderBottomColor: palette.codeBorder }]}>
          <Text style={[TYPOGRAPHY.micro, { color: palette.codeLineNum }]}>
            {step.kind === 'sql_write' ? 'POSTGRESQL' : step.language.toUpperCase()}
          </Text>
          <View style={styles.editorActions}>
            <Pressable onPress={onToggleHint} style={styles.miniAction}>
              <HelpCircle size={13} color={palette.codeLineNum} />
              <Text style={[TYPOGRAPHY.micro, { color: palette.codeLineNum }]}>İpucu</Text>
            </Pressable>
            <Pressable onPress={onReset} style={styles.miniAction}>
              <RotateCcw size={13} color={palette.codeLineNum} />
              <Text style={[TYPOGRAPHY.micro, { color: palette.codeLineNum }]}>Sıfırla</Text>
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
          placeholderTextColor={palette.codeLineNum}
        />
      </View>

      <View>
        <Text style={[TYPOGRAPHY.caption, { color: palette.textMuted, marginBottom: 8 }]}>
          Hızlı ekle
        </Text>
        <View style={styles.tokenWrap}>
          {step.quickTokens.map((tok, i) => (
            <Pressable
              key={i}
              onPress={() => onInsertToken(tok)}
              style={({ pressed }) => [
                styles.tokenChip,
                { backgroundColor: pressed ? palette.surfacePressed : palette.surface },
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
        <View style={[styles.noteCard, { backgroundColor: palette.sandBg }]}>
          <Text style={[TYPOGRAPHY.micro, { color: palette.sandText }]}>İPUCU</Text>
          <Text style={[TYPOGRAPHY.body, { color: palette.textPrimary, marginTop: 4 }]}>
            {step.hint}
          </Text>
          <Pressable onPress={onFillSolution} style={{ marginTop: 10 }}>
            <Text style={[TYPOGRAPHY.caption, { color: palette.primary, fontWeight: '700' }]}>
              Referans çözümü editöre yerleştir
            </Text>
          </Pressable>
        </View>
      ) : null}

      {validation ? (
        <SoftCard>
          <Text style={[TYPOGRAPHY.micro, { color: palette.textMuted, marginBottom: 6 }]}>
            TEST SONUÇLARI ({validation.matchedCount}/{validation.totalGroups})
          </Text>
          {validation.testResults.map((tr, i) => (
            <View key={i} style={[styles.testRow, { borderTopColor: palette.borderSubtle }]}>
              <View style={styles.rowGap}>
                {tr.passed ? (
                  <CheckCircle2 size={14} color={palette.success} />
                ) : (
                  <AlertCircle size={14} color={palette.error} />
                )}
                <Text style={[TYPOGRAPHY.caption, { color: palette.textPrimary, fontWeight: '600' }]}>
                  {tr.label}
                </Text>
              </View>
              <Text style={[TYPOGRAPHY.code, { fontSize: 11, color: palette.textMuted, marginTop: 4 }]}>
                IN: {tr.input}
              </Text>
              <Text style={[TYPOGRAPHY.code, { fontSize: 11, color: palette.textSecondary }]}>
                OUT: {tr.expectedOutput}
              </Text>
            </View>
          ))}
        </SoftCard>
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

      <Text style={[TYPOGRAPHY.caption, { color: palette.textMuted }]}>1. Dosyayı seçin</Text>
      <View style={{ gap: 10 }}>
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
                  backgroundColor: isActive ? palette.sageBg : palette.surface,
                  borderColor: isWrong
                    ? palette.error
                    : isRight
                      ? palette.success
                      : isActive
                        ? palette.primary
                        : palette.borderSubtle,
                },
              ]}
            >
              <View style={{ flex: 1 }}>
                <Text style={[TYPOGRAPHY.code, { fontWeight: '700', color: palette.textPrimary }]}>
                  {item.label}
                </Text>
                <Text style={[TYPOGRAPHY.caption, { color: palette.textMuted, marginTop: 3 }]}>
                  {item.detail}
                </Text>
              </View>
              <SoftBadge
                label={assigned ? `${assigned}/` : 'Seç'}
                tone={assigned ? 'sage' : 'neutral'}
              />
            </Pressable>
          );
        })}
      </View>

      <Text style={[TYPOGRAPHY.caption, { color: palette.textMuted, marginTop: 4 }]}>
        2. Hedef katmana dokunun
      </Text>
      <View style={styles.layerGrid}>
        {step.layers.map((layer) => (
          <Pressable
            key={layer.id}
            onPress={() => onAssignLayer(layer.id)}
            style={({ pressed }) => [
              styles.layerCard,
              { backgroundColor: pressed ? palette.sageBg : palette.surface },
            ]}
          >
            <View style={styles.rowGap}>
              <Layers size={14} color={palette.primary} />
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
  },
  closeCircle: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingTop: 4,
    paddingBottom: 36,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionStack: {
    marginTop: 18,
    gap: 16,
  },
  conceptHeroImg: {
    width: '100%',
    height: 156,
    borderRadius: RADIUS.lg,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 10,
  },
  bulletDot: {
    width: 7,
    height: 7,
    borderRadius: RADIUS.pill,
    marginTop: 7,
  },
  optionCard: {
    borderWidth: 1.5,
    borderRadius: RADIUS.md,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  optionLetter: {
    width: 26,
    height: 26,
    borderRadius: RADIUS.pill,
    alignItems: 'center',
    justifyContent: 'center',
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
  editorActions: {
    flexDirection: 'row',
    gap: 16,
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
    minHeight: 136,
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
  testRow: {
    borderTopWidth: 1,
    paddingTop: 10,
    marginTop: 8,
  },
  archItemCard: {
    borderWidth: 1.5,
    borderRadius: RADIUS.md,
    padding: 16,
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
    borderRadius: RADIUS.md,
    padding: 14,
  },
  feedbackBox: {
    marginTop: 18,
    borderRadius: RADIUS.md,
    padding: 16,
  },
  noteCard: {
    marginTop: 14,
    borderRadius: RADIUS.md,
    padding: 16,
  },
  rowGap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  bottomBar: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: 14,
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
  finishCircle: {
    width: 84,
    height: 84,
    borderRadius: RADIUS.pill,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  finishStatsRow: {
    flexDirection: 'row',
    gap: 14,
    width: '100%',
    marginTop: 28,
  },
  finishStatCard: {
    flex: 1,
    alignItems: 'center',
  },
});
