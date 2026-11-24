export type TopicId = 'nodejs' | 'typescript' | 'sql' | 'drizzle' | 'architecture';

export type LevelNumber = 1 | 2 | 3;

export type ExerciseKind =
  | 'concept'
  | 'multiple_choice'
  | 'output_predict'
  | 'code_write'
  | 'sql_write'
  | 'architecture_sort';

export interface SqlTableSample {
  tableName: string;
  columns: string[];
  rows: string[][];
}

export interface TestCaseIO {
  label: string;
  input: string;
  expectedOutput: string;
}

export interface BaseStep {
  id: string;
  kind: ExerciseKind;
  title: string;
  xp: number;
  interviewNote?: string;
}

export interface ConceptStep extends BaseStep {
  kind: 'concept';
  body: string;
  keyPoints: string[];
  code?: string;
  codeLanguage?: string;
  ioExample?: TestCaseIO;
}

export interface MultipleChoiceStep extends BaseStep {
  kind: 'multiple_choice';
  prompt: string;
  code?: string;
  codeLanguage?: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface OutputPredictStep extends BaseStep {
  kind: 'output_predict';
  prompt: string;
  code: string;
  codeLanguage: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface CodeWriteStep extends BaseStep {
  kind: 'code_write';
  prompt: string;
  language: 'typescript' | 'nodejs' | 'drizzle';
  starterCode: string;
  placeholder: string;
  hint: string;
  solution: string;
  quickTokens: string[];
  /** Each group is an array of acceptable regex/substrings; ALL groups must match */
  requiredGroups: string[][];
  forbiddenPatterns?: string[];
  testCases: TestCaseIO[];
  explanation: string;
}

export interface SqlWriteStep extends BaseStep {
  kind: 'sql_write';
  prompt: string;
  tables: SqlTableSample[];
  expectedTable: SqlTableSample;
  starterSql: string;
  hint: string;
  solution: string;
  quickTokens: string[];
  requiredGroups: string[][];
  forbiddenPatterns?: string[];
  explanation: string;
}

export interface ArchitectureSortStep extends BaseStep {
  kind: 'architecture_sort';
  prompt: string;
  scenario: string;
  items: { id: string; label: string; detail: string }[];
  layers: { id: string; name: string; description: string }[];
  /** Map of item.id -> expected layer.id */
  expectedMapping: Record<string, string>;
  explanation: string;
}

export type LessonStep =
  | ConceptStep
  | MultipleChoiceStep
  | OutputPredictStep
  | CodeWriteStep
  | SqlWriteStep
  | ArchitectureSortStep;

export interface ModuleItem {
  id: string;
  level: LevelNumber;
  order: number;
  topic: TopicId;
  title: string;
  subtitle: string;
  durationMin: number;
  steps: LessonStep[];
}

export interface SandboxChallenge {
  id: string;
  topic: TopicId;
  difficulty: 'Temel' | 'Orta' | 'Senior';
  title: string;
  prompt: string;
  language: 'sql' | 'drizzle' | 'typescript' | 'nodejs';
  starterCode: string;
  quickTokens: string[];
  tables?: SqlTableSample[];
  expectedTable?: SqlTableSample;
  testCases: TestCaseIO[];
  requiredGroups: string[][];
  forbiddenPatterns?: string[];
  hint: string;
  solution: string;
  explanation: string;
  xp: number;
}

export interface InterviewQuestion {
  id: string;
  topic: TopicId;
  level: 'Mid' | 'Senior' | 'Staff';
  question: string;
  contextCode?: string;
  rubricPoints: string[];
  modelAnswer: string;
  trapWarning: string;
  followUp: string;
}
