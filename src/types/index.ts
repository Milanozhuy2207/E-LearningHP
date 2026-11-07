export type ClassType = 'Python' | 'Web' | 'Unity' | 'Robotics';

export interface ClassInfo {
  id: ClassType;
  name: string;
  icon: string;
  description: string;
  studentCount?: number;
}

export interface TestCase {
  id: string;
  name: string;
  type: 'output_contains' | 'variable_type' | 'variable_value' | 'function_call' | 'custom_eval';
  expected?: string;
  varName?: string;
  expectedType?: string;
  expectedValue?: any;
  funcName?: string;
  args?: any[];
  expression?: string;
}

export interface VocabItem {
  word: string;
  meaning: string;
  example?: string;
}

export interface KidQuizQuestion {
  id: string;
  prompt: string;
  options: string[];
  answer: string;
}

export interface BlockPuzzleConfig {
  instruction: string;
  blockColor: 'motion' | 'event' | 'control' | 'sensor' | 'magnet';
  prefix?: string;
  suffix?: string;
  slotsCount: number;
  wordBank: string[];
  expectedBlocks: string[];
  robotDemo?: 'drive_forward' | 'velocity_spin' | 'turn_right' | 'bumper_start' | 'magnet_boost' | 'forever_object' | 'full_mission';
}

export interface Lesson {
  id: string;
  order: number;
  classId?: ClassType;
  title: string;
  category: string;
  theory: string;
  task: string;
  initialCode: string;
  hint: string;
  vocab?: VocabItem[];
  kidQuiz?: KidQuizQuestion[];
  blockPuzzle?: BlockPuzzleConfig;
  testCases: TestCase[];
}

export interface LessonProgress {
  status: 'passed' | 'failed' | 'in_progress';
  code: string;
  attempts: number;
  passedAt: string | null;
  lastSubmittedAt?: string;
}

export interface Student {
  id: string;
  name: string;
  classId: ClassType;
  teacherId?: string;
  teacherName?: string;
  avatar: string;
  createdAt: string;
  lastActive: string;
  progress: Record<string, LessonProgress>;
}

export interface StudentStats extends Student {
  passedCount: number;
  totalLessons: number;
  percent: number;
}

export interface LoginRequestBody {
  studentId?: string;
  name?: string;
  classId?: ClassType;
  teacherId?: string;
  teacherName?: string;
}

export interface CreateStudentRequestBody {
  name: string;
  classId: ClassType;
  teacherId?: string;
  teacherName?: string;
}

export interface SubmissionRequestBody {
  studentId: string;
  lessonId: string;
  code: string;
  status: 'passed' | 'failed';
}
