import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BookOpen, Briefcase, Code2, User } from 'lucide-react-native';
import { ThemeProvider, useTheme } from '../core/theme/ThemeContext';
import { ProgressProvider, useProgress } from '../core/storage/progressStore';
import { getModuleById } from '../data/curriculum';
import { PathScreen } from '../features/path/PathScreen';
import { LessonPlayerScreen } from '../features/lesson/LessonPlayerScreen';
import { SandboxScreen } from '../features/sandbox/SandboxScreen';
import { InterviewScreen } from '../features/interview/InterviewScreen';
import { ProfileScreen } from '../features/profile/ProfileScreen';
import { TYPOGRAPHY } from '../core/theme/tokens';

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
      ) : (
        <>
          <View style={styles.content}>
            {activeTab === 'path' ? (
              <PathScreen onStartModule={(id) => setActiveModuleId(id)} />
            ) : null}
            {activeTab === 'sandbox' ? <SandboxScreen /> : null}
            {activeTab === 'interview' ? <InterviewScreen /> : null}
            {activeTab === 'profile' ? (
              <ProfileScreen onStartModule={(id) => setActiveModuleId(id)} />
            ) : null}
          </View>

          <View
            style={[
              styles.tabBar,
              { backgroundColor: palette.bg, borderTopColor: palette.border },
            ]}
          >
            <TabButton
              label="Yol"
              active={activeTab === 'path'}
              onPress={() => setActiveTab('path')}
              icon={(color) => <BookOpen size={20} color={color} strokeWidth={1.9} />}
            />
            <TabButton
              label="Lab"
              active={activeTab === 'sandbox'}
              onPress={() => setActiveTab('sandbox')}
              icon={(color) => <Code2 size={20} color={color} strokeWidth={1.9} />}
            />
            <TabButton
              label="Mülakat"
              active={activeTab === 'interview'}
              onPress={() => setActiveTab('interview')}
              icon={(color) => <Briefcase size={20} color={color} strokeWidth={1.9} />}
            />
            <TabButton
              label="Profil"
              active={activeTab === 'profile'}
              onPress={() => setActiveTab('profile')}
              icon={(color) => <User size={20} color={color} strokeWidth={1.9} />}
            />
          </View>
        </>
      )}
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
  const color = active ? palette.textPrimary : palette.textMuted;

  return (
    <Pressable onPress={onPress} style={styles.tabItem}>
      <View
        style={[
          styles.activeIndicator,
          { backgroundColor: active ? palette.accent : 'transparent' },
        ]}
      />
      {icon(color)}
      <Text
        style={[
          TYPOGRAPHY.micro,
          { color, marginTop: 4, fontWeight: active ? '700' : '500' },
        ]}
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
  content: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    paddingBottom: 4,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  activeIndicator: {
    width: 24,
    height: 2,
    marginBottom: 6,
  },
});
