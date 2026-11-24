import { LEVEL1_MODULES } from './level1-fundamentals';
import { LEVEL2_MODULES } from './level2-intermediate';
import { LEVEL3_MODULES } from './level3-senior-architecture';
import { INTERVIEW_BANK } from './interview-bank';
import { SANDBOX_CHALLENGES } from './sandbox-challenges';
import { LevelNumber, LessonStep, ModuleItem, TopicId } from './types';

export * from './types';
export { INTERVIEW_BANK, SANDBOX_CHALLENGES };

export const ALL_MODULES: ModuleItem[] = [
  ...LEVEL1_MODULES,
  ...LEVEL2_MODULES,
  ...LEVEL3_MODULES,
];

export const LEVEL_META: Record<
  LevelNumber,
  { badge: string; title: string; subtitle: string }
> = {
  1: {
    badge: 'SEVİYE 01',
    title: 'Öğreniş — Çekirdek Temeller',
    subtitle: 'Node.js Event Loop, TypeScript tip daraltma, SQL ve Drizzle temelleri.',
  },
  2: {
    badge: 'SEVİYE 02',
    title: 'Devam Ediş — Üretim Pratiği',
    subtitle: 'Streams, Zod sınırları, Window Functions, Locks ve Drizzle Transactions.',
  },
  3: {
    badge: 'SEVİYE 03',
    title: 'Ustalık — Mimari & Senior Mülakat',
    subtitle: 'Clean Architecture klasör düzeni, Zero-Downtime, Outbox ve N+1 savunması.',
  },
};

export function getModulesByLevel(level: LevelNumber): ModuleItem[] {
  return ALL_MODULES.filter((m) => m.level === level).sort((a, b) => a.order - b.order);
}

export function getModuleById(id: string): ModuleItem | undefined {
  return ALL_MODULES.find((m) => m.id === id);
}

export function getAllSteps(): { module: ModuleItem; step: LessonStep }[] {
  const list: { module: ModuleItem; step: LessonStep }[] = [];
  for (const mod of ALL_MODULES) {
    for (const step of mod.steps) {
      list.push({ module: mod, step });
    }
  }
  return list;
}

export function getTopicStats(completedStepIds: string[]): {
  topic: TopicId;
  completed: number;
  total: number;
  ratio: number;
}[] {
  const topics: TopicId[] = ['nodejs', 'typescript', 'sql', 'drizzle', 'architecture'];
  return topics.map((topic) => {
    const steps = ALL_MODULES.filter((m) => m.topic === topic).flatMap((m) => m.steps);
    const completed = steps.filter((s) => completedStepIds.includes(s.id)).length;
    return {
      topic,
      completed,
      total: steps.length,
      ratio: steps.length > 0 ? completed / steps.length : 0,
    };
  });
}
