import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Briefcase, Code2, Home, User } from 'lucide-react-native';
import { ThemeProvider, useTheme } from '../core/theme/ThemeContext';
import { ProgressProvider, useProgress } from '../core/storage/progressStore';
import { getModuleById } from '../data/curriculum';
import { PathScreen } from '../features/path/PathScreen';
import { LessonPlayerScreen } from '../features/lesson/LessonPlayerScreen';
import { SandboxScreen } from '../features/sandbox/SandboxScreen';
import { InterviewScreen } from '../features/interview/InterviewScreen';
import { ProfileScreen } from '../features/profile/ProfileScreen';
import { RADIUS, TYPOGRAPHY } from '../core/theme/tokens';

type TabKey = 'path' | 'sandbox' | 'interview' | 'profile';

function MainShell() {
  const { palette, mode } = useTheme();
  const [activeTab, setActiveTab] = useState<TabKey>('path');
  const [activeModuleId, setActiveModuleId] = useState<string | null>(null);

  const activeModule = activeModuleId ? getModuleById(activeModuleId) : undefined;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: palette.bg }]} edges={['top', 'bottom']}>
      <StatusBar style={mode === 'dark' ? 'light' : 'dark'} />

      {activeModule ? (
        <LessonPlayerScreen
          module={activeModule}
          onExit={() => setActiveModuleId(null)}
        />
      ) : null}

      {/* Keep tabs mounted when lesson is open or switching tabs so filter, selected level, and scroll position are preserved */}
      <View style={[styles.shell, activeModule ? styles.hidden : null]}>
        <View style={styles.content}>
          <View style={[styles.tabPane, activeTab !== 'path' && styles.hidden]}>
            <PathScreen onStartModule={(id) => setActiveModuleId(id)} />
          </View>
          <View style={[styles.tabPane, activeTab !== 'sandbox' && styles.hidden]}>
            <SandboxScreen />
          </View>
          <View style={[styles.tabPane, activeTab !== 'interview' && styles.hidden]}>
            <InterviewScreen />
          </View>
          <View style={[styles.tabPane, activeTab !== 'profile' && styles.hidden]}>
            <ProfileScreen onStartModule={(id) => setActiveModuleId(id)} />
          </View>
        </View>

        <View
          accessibilityRole="tablist"
          style={[
            styles.tabBar,
            {
              backgroundColor: palette.surface,
              borderTopColor: palette.borderSubtle,
            },
          ]}
        >
          <TabButton
            label="Öğren"
            active={activeTab === 'path'}
            onPress={() => setActiveTab('path')}
            icon={(color) => <Home size={20} color={color} strokeWidth={2} />}
          />
          <TabButton
            label="Kod Lab"
            active={activeTab === 'sandbox'}
            onPress={() => setActiveTab('sandbox')}
            icon={(color) => <Code2 size={20} color={color} strokeWidth={2} />}
          />
          <TabButton
            label="Mülakat"
            active={activeTab === 'interview'}
            onPress={() => setActiveTab('interview')}
            icon={(color) => <Briefcase size={20} color={color} strokeWidth={2} />}
          />
          <TabButton
            label="Profil"
            active={activeTab === 'profile'}
            onPress={() => setActiveTab('profile')}
            icon={(color) => <User size={20} color={color} strokeWidth={2} />}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

function TabButton({
  label,
  active,
  onPress,
  icon,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
  icon: (color: string) => React.ReactNode;
}) {
  const { palette } = useTheme();
  const color = active ? palette.coral : palette.textMuted;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="tab"
      accessibilityLabel={label}
      accessibilityState={{ selected: active }}
      style={styles.tabItem}
    >
      <View
        style={[
          styles.activeBar,
          { backgroundColor: active ? palette.coral : 'transparent' },
        ]}
      />
      {icon(color)}
      <Text
        style={[
          TYPOGRAPHY.caption,
          { color, marginTop: 4, fontSize: 11, fontWeight: active ? '700' : '500' },
        ]}
        numberOfLines={1}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function ThemedRoot() {
  const { state, setThemeMode } = useProgress();
  return (
    <ThemeProvider mode={state.themeMode} onChangeMode={setThemeMode}>
      <MainShell />
    </ThemeProvider>
  );
}

export function AppShell() {
  return (
    <ProgressProvider>
      <ThemedRoot />
    </ProgressProvider>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  shell: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  tabPane: {
    flex: 1,
  },
  hidden: {
    display: 'none',
  },
  tabBar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    paddingBottom: 6,
  },
  tabItem: {
    flex: 1,
    minHeight: 56,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 4,
  },
  activeBar: {
    width: 22,
    height: 3,
    borderRadius: RADIUS.pill,
    marginBottom: 6,
  },
});
