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
import Svg, { Path } from 'react-native-svg';
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

export function SoftCard({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  const { palette } = useTheme();
  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: palette.surface,
          borderColor: palette.borderSubtle,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

/** Alias kept for clean imports */
export const SurfaceCard = SoftCard;

export function PillButton({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
  style,
  leftIcon,
  compact = false,
}: {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'soft' | 'outline' | 'light';
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  leftIcon?: React.ReactNode;
  compact?: boolean;
}) {
  const { palette } = useTheme();
  const bg =
    variant === 'primary'
      ? palette.primary
      : variant === 'soft'
        ? palette.sageBg
        : variant === 'light'
          ? '#FFFFFF'
          : 'transparent';
  const borderColor =
    variant === 'outline' ? palette.border : 'transparent';
  const textColor =
    variant === 'primary'
      ? palette.primaryText
      : variant === 'soft'
        ? palette.sageText
        : variant === 'light'
          ? '#1E4D3B'
          : palette.textPrimary;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.pillBtn,
        compact && styles.pillBtnCompact,
        {
          backgroundColor: bg,
          borderColor,
          borderWidth: variant === 'outline' ? 1 : 0,
          opacity: disabled ? 0.4 : pressed ? 0.84 : 1,
        },
        style,
      ]}
    >
      {leftIcon ? <View style={{ marginRight: 7 }}>{leftIcon}</View> : null}
      <Text style={[compact ? TYPOGRAPHY.caption : TYPOGRAPHY.bodyStrong, { color: textColor, fontWeight: '600' }]}>
        {label}
      </Text>
    </Pressable>
  );
}

export const PrimaryButton = PillButton;

export function SoftBadge({
  label,
  tone = 'sage',
}: {
  label: string;
  tone?: 'sage' | 'peach' | 'sand' | 'slate' | 'neutral' | 'success' | 'error';
}) {
  const { palette } = useTheme();
  const colors = {
    sage: { bg: palette.sageBg, text: palette.sageText },
    peach: { bg: palette.peachBg, text: palette.peachText },
    sand: { bg: palette.sandBg, text: palette.sandText },
    slate: { bg: palette.slateBg, text: palette.slateText },
    neutral: { bg: palette.surfaceSoft, text: palette.textSecondary },
    success: { bg: palette.successBg, text: palette.success },
    error: { bg: palette.errorBg, text: palette.error },
  }[tone];

  return (
    <View style={[styles.badge, { backgroundColor: colors.bg }]}>
      <Text style={[TYPOGRAPHY.micro, { color: colors.text }]}>{label}</Text>
    </View>
  );
}

export function getTopicTone(topic: TopicId): 'sage' | 'peach' | 'sand' | 'slate' {
  switch (topic) {
    case 'nodejs':
      return 'sage';
    case 'sql':
      return 'peach';
    case 'drizzle':
      return 'sand';
    case 'typescript':
    case 'architecture':
      return 'slate';
  }
}

export function ProgressBar({
  progress,
  height = 6,
  color,
}: {
  progress: number;
  height?: number;
  color?: string;
}) {
  const { palette } = useTheme();
  const clamped = Math.max(0, Math.min(1, progress));
  return (
    <View
      style={{
        height,
        width: '100%',
        backgroundColor: palette.surfaceSoft,
        borderRadius: RADIUS.pill,
        overflow: 'hidden',
      }}
    >
      <View
        style={{
          height: '100%',
          width: `${Math.round(clamped * 100)}%`,
          backgroundColor: color ?? palette.primary,
          borderRadius: RADIUS.pill,
        }}
      />
    </View>
  );
}

/**
 * Wellywise-inspired semi-circular SVG goal arc gauge.
 */
export function GoalArcGauge({
  progress,
  centerValue,
  centerLabel,
}: {
  progress: number;
  centerValue: string;
  centerLabel: string;
}) {
  const { palette } = useTheme();
  const clamped = Math.max(0.04, Math.min(1, progress));
  const width = 128;
  const height = 74;
  const radius = 50;
  const cx = 64;
  const cy = 62;
  const circumference = Math.PI * radius;
  const dashOffset = circumference * (1 - clamped);
  const arcPath = `M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`;

  return (
    <View style={{ width, height, alignItems: 'center', justifyContent: 'flex-end' }}>
      <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
        <Path
          d={arcPath}
          stroke={palette.surfaceSoft}
          strokeWidth={11}
          strokeLinecap="round"
          fill="none"
        />
        <Path
          d={arcPath}
          stroke={palette.coral}
          strokeWidth={11}
          strokeLinecap="round"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={dashOffset}
          fill="none"
        />
      </Svg>
      <Text style={[TYPOGRAPHY.h2, { color: palette.textPrimary, fontWeight: '700' }]}>
        {centerValue}
      </Text>
      <Text style={[TYPOGRAPHY.micro, { color: palette.textMuted, marginTop: 1 }]}>
        {centerLabel}
      </Text>
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
    <View style={[styles.codeWrapper, { backgroundColor: palette.codeBg }]}>
      {language || title ? (
        <View style={[styles.codeHeader, { borderBottomColor: palette.codeBorder }]}>
          <Text style={[TYPOGRAPHY.micro, { color: palette.codeLineNum }]}>
            {(title ?? language ?? 'CODE').toUpperCase()}
          </Text>
          <Text style={[TYPOGRAPHY.micro, { color: palette.codeLineNum }]}>
            {lines.length} satır
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
        { backgroundColor: palette.surface, borderColor: palette.border },
      ]}
    >
      <View style={[styles.tableHeaderBar, { backgroundColor: palette.surfaceSoft }]}>
        <Text style={[TYPOGRAPHY.micro, { color: palette.textPrimary, fontFamily: TYPOGRAPHY.mono }]}>
          {table.tableName}
        </Text>
        {accentLabel ? (
          <Text style={[TYPOGRAPHY.micro, { color: palette.textMuted }]}>{accentLabel}</Text>
        ) : null}
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View>
          <View style={[styles.tableRow, { borderBottomColor: palette.border }]}>
            {table.columns.map((col, idx) => (
              <Text key={idx} style={[styles.tableCellHeader, { color: palette.textMuted }]}>
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
                    rIdx === table.rows.length - 1 ? 'transparent' : palette.borderSubtle,
                },
              ]}
            >
              {row.map((cell, cIdx) => (
                <Text key={cIdx} style={[styles.tableCell, { color: palette.textPrimary }]}>
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
    <SoftCard style={{ padding: 16 }}>
      <Text style={[TYPOGRAPHY.micro, { color: palette.textMuted, marginBottom: 10 }]}>
        {io.label}
      </Text>
      <View style={[styles.ioPill, { backgroundColor: palette.surfaceSoft }]}>
        <Text style={[styles.ioKey, { color: palette.textMuted }]}>GİRDİ</Text>
        <Text style={[TYPOGRAPHY.code, { color: palette.textPrimary, flex: 1, fontSize: 12 }]}>
          {io.input}
        </Text>
      </View>
      <View style={[styles.ioPill, { backgroundColor: palette.sageBg, marginTop: 8 }]}>
        <Text style={[styles.ioKey, { color: palette.sageText }]}>ÇIKTI</Text>
        <Text style={[TYPOGRAPHY.code, { color: palette.sageText, flex: 1, fontSize: 12 }]}>
          {io.expectedOutput}
        </Text>
      </View>
    </SoftCard>
  );
}

export function PillTabs<T extends string | number>({
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
    <View style={[styles.tabRow, { backgroundColor: palette.surfaceSoft }]}>
      {options.map((opt) => {
        const selected = opt.value === value;
        return (
          <Pressable
            key={String(opt.value)}
            onPress={() => onChange(opt.value)}
            style={[
              styles.tabPill,
              selected && { backgroundColor: palette.surface },
            ]}
          >
            <Text
              style={[
                TYPOGRAPHY.caption,
                {
                  color: selected ? palette.textPrimary : palette.textMuted,
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

export const SegmentControl = PillTabs;

const styles = StyleSheet.create({
  card: {
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    padding: SPACING.lg,
  },
  pillBtn: {
    minHeight: 50,
    borderRadius: RADIUS.pill,
    paddingHorizontal: 22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillBtnCompact: {
    minHeight: 36,
    paddingHorizontal: 16,
  },
  badge: {
    borderRadius: RADIUS.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  codeWrapper: {
    borderRadius: RADIUS.md,
    overflow: 'hidden',
  },
  codeHeader: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  codeBody: {
    padding: 16,
    minWidth: '100%',
  },
  codeLine: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  lineNum: {
    width: 24,
    fontSize: 12,
    fontFamily: 'monospace',
    lineHeight: 20,
    marginRight: 10,
    textAlign: 'right',
  },
  tableWrapper: {
    borderWidth: 1,
    borderRadius: RADIUS.md,
    overflow: 'hidden',
  },
  tableHeaderBar: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
  },
  tableCellHeader: {
    minWidth: 94,
    paddingHorizontal: 14,
    paddingVertical: 7,
    fontSize: 11,
    fontWeight: '700',
    fontFamily: 'monospace',
  },
  tableCell: {
    minWidth: 94,
    paddingHorizontal: 14,
    paddingVertical: 8,
    fontSize: 12,
    fontFamily: 'monospace',
  },
  ioPill: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    padding: 12,
    borderRadius: RADIUS.sm,
  },
  ioKey: {
    width: 44,
    fontSize: 11,
    fontWeight: '700',
    paddingTop: 2,
  },
  tabRow: {
    flexDirection: 'row',
    borderRadius: RADIUS.pill,
    padding: 4,
    gap: 4,
  },
  tabPill: {
    flex: 1,
    paddingVertical: 9,
    paddingHorizontal: 10,
    borderRadius: RADIUS.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
