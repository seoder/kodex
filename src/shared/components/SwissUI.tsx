import React from 'react';
import {
  Pressable,
  ScrollView,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import { useTheme } from '../../core/theme/ThemeContext';
import { RADIUS, SPACING, TYPOGRAPHY } from '../../core/theme/tokens';
import { SqlTableSample, TestCaseIO, TopicId } from '../../data/curriculum/types';

export const TOPIC_LABELS: Record<TopicId, string> = {
  nodejs: 'Node.js',
  typescript: 'TypeScript',
  sql: 'SQL',
  drizzle: 'Drizzle ORM',
  architecture: 'Mimari',
};

export function SurfaceCard({
  children,
  style,
  elevated = false,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  elevated?: boolean;
}) {
  const { palette } = useTheme();
  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: elevated ? palette.surfaceElevated : palette.surface,
          borderColor: palette.border,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

export function PrimaryButton({
  label,
  onPress,
  variant = 'solid',
  disabled = false,
  style,
  leftIcon,
}: {
  label: string;
  onPress: () => void;
  variant?: 'solid' | 'outline' | 'ghost';
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  leftIcon?: React.ReactNode;
}) {
  const { palette } = useTheme();
  const bg =
    variant === 'solid'
      ? palette.accent
      : variant === 'outline'
        ? 'transparent'
        : 'transparent';
  const borderColor =
    variant === 'solid'
      ? palette.accent
      : variant === 'outline'
        ? palette.borderStrong
        : 'transparent';
  const textColor = variant === 'solid' ? palette.accentText : palette.textPrimary;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: bg,
          borderColor,
          opacity: disabled ? 0.38 : pressed ? 0.82 : 1,
        },
        style,
      ]}
    >
      {leftIcon ? <View style={{ marginRight: 8 }}>{leftIcon}</View> : null}
      <Text style={[TYPOGRAPHY.bodyStrong, { color: textColor }]}>{label}</Text>
    </Pressable>
  );
}

export function TagBadge({
  label,
  tone = 'neutral',
}: {
  label: string;
  tone?: 'neutral' | 'success' | 'error' | 'warning' | 'inverse';
}) {
  const { palette } = useTheme();
  const map = {
    neutral: { bg: palette.surface, border: palette.border, text: palette.textSecondary },
    success: { bg: palette.successBg, border: palette.successBorder, text: palette.success },
    error: { bg: palette.errorBg, border: palette.errorBorder, text: palette.error },
    warning: { bg: palette.warningBg, border: palette.warningBorder, text: palette.warning },
    inverse: { bg: palette.accent, border: palette.accent, text: palette.accentText },
  }[tone];

  return (
    <View style={[styles.badge, { backgroundColor: map.bg, borderColor: map.border }]}>
      <Text style={[TYPOGRAPHY.micro, { color: map.text }]}>{label.toUpperCase()}</Text>
    </View>
  );
}

export function ProgressBar({
  progress,
  height = 4,
}: {
  progress: number;
  height?: number;
}) {
  const { palette } = useTheme();
  const clamped = Math.max(0, Math.min(1, progress));
  return (
    <View
      style={{
        height,
        width: '100%',
        backgroundColor: palette.border,
        borderRadius: RADIUS.full,
        overflow: 'hidden',
      }}
    >
      <View
        style={{
          height: '100%',
          width: `${Math.round(clamped * 100)}%`,
          backgroundColor: palette.accent,
        }}
      />
    </View>
  );
}

export function CodeBlock({
  code,
  language,
  title,
}: {
  code: string;
  language?: string;
  title?: string;
}) {
  const { palette } = useTheme();
  const lines = code.trimEnd().split('\n');

  return (
    <View
      style={[
        styles.codeWrapper,
        { backgroundColor: palette.codeBg, borderColor: palette.codeBorder },
      ]}
    >
      {language || title ? (
        <View style={[styles.codeHeader, { borderBottomColor: palette.codeBorder }]}>
          <Text style={[TYPOGRAPHY.micro, { color: palette.textMuted }]}>
            {(title ?? language ?? 'CODE').toUpperCase()}
          </Text>
          <Text style={[TYPOGRAPHY.micro, { color: palette.textMuted }]}>
            {lines.length} SATIR
          </Text>
        </View>
      ) : null}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.codeBody}>
          {lines.map((line, i) => (
            <View key={i} style={styles.codeLine}>
              <Text style={[styles.lineNum, { color: palette.codeLineNum }]}>
                {String(i + 1).padStart(2, ' ')}
              </Text>
              <Text style={[TYPOGRAPHY.code, { color: palette.codeText }]}>{line || ' '}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

export function SqlTablePreview({
  table,
  accentLabel,
}: {
  table: SqlTableSample;
  accentLabel?: string;
}) {
  const { palette } = useTheme();
  return (
    <View
      style={[
        styles.tableWrapper,
        { backgroundColor: palette.codeBg, borderColor: palette.codeBorder },
      ]}
    >
      <View style={[styles.tableHeaderBar, { borderBottomColor: palette.codeBorder }]}>
        <Text style={[TYPOGRAPHY.micro, { color: palette.textPrimary }]}>
          {table.tableName}
        </Text>
        {accentLabel ? (
          <Text style={[TYPOGRAPHY.micro, { color: palette.textMuted }]}>{accentLabel}</Text>
        ) : null}
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View>
          <View style={[styles.tableRow, { borderBottomColor: palette.codeBorder }]}>
            {table.columns.map((col, idx) => (
              <Text
                key={idx}
                style={[styles.tableCellHeader, { color: palette.textMuted }]}
              >
                {col}
              </Text>
            ))}
          </View>
          {table.rows.map((row, rIdx) => (
            <View
              key={rIdx}
              style={[
                styles.tableRow,
                {
                  borderBottomColor:
                    rIdx === table.rows.length - 1 ? 'transparent' : palette.codeBorder,
                },
              ]}
            >
              {row.map((cell, cIdx) => (
                <Text
                  key={cIdx}
                  style={[styles.tableCell, { color: palette.codeText }]}
                >
                  {cell}
                </Text>
              ))}
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

export function IOComparisonBox({ io }: { io: TestCaseIO }) {
  const { palette } = useTheme();
  return (
    <View
      style={[
        styles.ioBox,
        { backgroundColor: palette.codeBg, borderColor: palette.codeBorder },
      ]}
    >
      <Text style={[TYPOGRAPHY.micro, { color: palette.textMuted, marginBottom: 8 }]}>
        {io.label.toUpperCase()}
      </Text>
      <View style={styles.ioRow}>
        <Text style={[styles.ioKey, { color: palette.textMuted }]}>INPUT</Text>
        <Text style={[TYPOGRAPHY.code, { color: palette.codeText, flex: 1 }]}>{io.input}</Text>
      </View>
      <View style={[styles.ioDivider, { backgroundColor: palette.codeBorder }]} />
      <View style={styles.ioRow}>
        <Text style={[styles.ioKey, { color: palette.success }]}>OUTPUT</Text>
        <Text style={[TYPOGRAPHY.code, { color: palette.codeText, flex: 1 }]}>
          {io.expectedOutput}
        </Text>
      </View>
    </View>
  );
}

export function SegmentControl<T extends string | number>({
  options,
  value,
  onChange,
}: {
  options: { label: string; value: T }[];
  value: T;
  onChange: (next: T) => void;
}) {
  const { palette } = useTheme();
  return (
    <View
      style={[
        styles.segmentContainer,
        { backgroundColor: palette.surface, borderColor: palette.border },
      ]}
    >
      {options.map((opt) => {
        const selected = opt.value === value;
        return (
          <Pressable
            key={String(opt.value)}
            onPress={() => onChange(opt.value)}
            style={[
              styles.segmentItem,
              selected && { backgroundColor: palette.accent },
            ]}
          >
            <Text
              style={[
                TYPOGRAPHY.caption,
                {
                  color: selected ? palette.accentText : palette.textSecondary,
                  fontWeight: selected ? '700' : '500',
                },
              ]}
              numberOfLines={1}
            >
              {opt.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: RADIUS.md,
    padding: SPACING.lg,
  },
  button: {
    minHeight: 48,
    borderWidth: 1,
    borderRadius: RADIUS.sm,
    paddingHorizontal: SPACING.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    borderWidth: 1,
    borderRadius: RADIUS.xs,
    paddingHorizontal: 7,
    paddingVertical: 3,
    alignSelf: 'flex-start',
  },
  codeWrapper: {
    borderWidth: 1,
    borderRadius: RADIUS.sm,
    overflow: 'hidden',
  },
  codeHeader: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  codeBody: {
    padding: SPACING.md,
    minWidth: '100%',
  },
  codeLine: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  lineNum: {
    width: 26,
    fontSize: 12,
    fontFamily: 'monospace',
    lineHeight: 20,
    marginRight: 8,
    textAlign: 'right',
  },
  tableWrapper: {
    borderWidth: 1,
    borderRadius: RADIUS.sm,
    overflow: 'hidden',
  },
  tableHeaderBar: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
  },
  tableCellHeader: {
    minWidth: 96,
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    fontSize: 11,
    fontWeight: '700',
    fontFamily: 'monospace',
  },
  tableCell: {
    minWidth: 96,
    paddingHorizontal: SPACING.md,
    paddingVertical: 7,
    fontSize: 12,
    fontFamily: 'monospace',
  },
  ioBox: {
    borderWidth: 1,
    borderRadius: RADIUS.sm,
    padding: SPACING.md,
  },
  ioRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  ioKey: {
    width: 56,
    fontSize: 11,
    fontWeight: '700',
    fontFamily: 'monospace',
    paddingTop: 3,
  },
  ioDivider: {
    height: 1,
    marginVertical: 8,
  },
  segmentContainer: {
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: RADIUS.sm,
    padding: 3,
    gap: 3,
  },
  segmentItem: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: RADIUS.xs + 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
