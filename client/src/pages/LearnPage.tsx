import React, { useEffect, useState, useCallback } from 'react';
import {
  LuArrowLeft,
  LuArrowRight,
  LuBookOpen,
  LuTarget,
  LuRotateCcw,
  LuPlay,
  LuRocket,
  LuTerminal,
  LuFlaskConical,
  LuEraser,
  LuTrophy,
  LuCircleCheck,
  LuCircleX,
  LuFileCode,
  LuBrainCircuit,
  LuClipboardCheck,
  LuVolume2,
  LuShuffle,
  LuRepeat,
  LuLanguages,
  LuListChecks,
  LuSparkles,
  LuLightbulb,
  LuEyeOff,
  LuScale,
  LuThumbsUp,
  LuThumbsDown,
  LuCircleDot,
  LuPuzzle,
  LuPlus,
  LuX,
  LuZap,
  LuMagnet,
  LuFlag,
  LuTriangleAlert
} from 'react-icons/lu';
import { TbCards, TbRobot } from 'react-icons/tb';
import { ClassIcon, StudentAvatarIcon } from '../components/ClassIcon';
import { StudentRecord } from './PortalPage';
import {
  VexCodePracticeLab,
  PracticeAssignment
} from '../components/VexCodePracticeLab';

interface VocabItem {
  word: string;
  meaning: string;
  example?: string;
}

interface KidQuizQuestion {
  id: string;
  prompt: string;
  options: string[];
  answer: string;
}

interface BlockPuzzleConfig {
  instruction: string;
  blockColor: string;
  prefix?: string;
  suffix?: string;
  slotsCount: number;
  wordBank: string[];
  expectedBlocks: string[];
}

interface TestCase {
  name: string;
  type: string;
  expected?: string;
  varName?: string;
  expectedType?: string;
  expectedValue?: any;
  funcName?: string;
  args?: any[];
  expression?: string;
}

interface Lesson {
  id: string;
  order: number;
  title: string;
  category: string;
  theory: string;
  task: string;
  initialCode: string;
  vocab?: VocabItem[];
  kidQuiz?: KidQuizQuestion[];
  blockPuzzle?: BlockPuzzleConfig;
  practiceAssignments?: PracticeAssignment[];
  homeworkNote?: string;
  testCases: TestCase[];
}

interface ConsoleLine {
  type: 'normal' | 'info' | 'success' | 'error' | 'muted';
  text: string;
}

interface GradedTestCase extends TestCase {
  passed: boolean;
  message: string;
}

interface TrueFalseQuestion {
  id: string;
  word: string;
  shownMeaning: string;
  prompt: string;
  answer: 'Đúng' | 'Sai';
  actualMeaning: string;
}

interface LearnQuestionState {
  vocabIdx: number;
  promptType: 'en2vi' | 'vi2en';
  word: string;
  meaning: string;
  example: string;
  options: string[];
  correctOption: string;
}

interface LearnFeedbackState {
  selectedOption: string;
  isCorrect: boolean;
  word: string;
  meaning: string;
}

interface LearnPageProps {
  student: StudentRecord;
  onNavigatePortal: () => void;
}

function speakEnglishWord(word: string, e?: React.MouseEvent) {
  if (e) e.stopPropagation();
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(word);
    utter.lang = 'en-US';
    utter.rate = 0.9;
    window.speechSynthesis.speak(utter);
  }
}

function generateTrueFalseQuestions(lesson: Lesson): TrueFalseQuestion[] {
  const vocab = lesson.vocab || [];
  const list: TrueFalseQuestion[] = [];
  if (vocab.length >= 1) {
    list.push({
      id: 'tf_1',
      word: vocab[0].word,
      shownMeaning: vocab[0].meaning,
      prompt: `Thuật ngữ VEXcode "${vocab[0].word}" có nghĩa tiếng Việt là "${vocab[0].meaning}".`,
      answer: 'Đúng',
      actualMeaning: vocab[0].meaning
    });
  }
  if (vocab.length >= 3) {
    list.push({
      id: 'tf_2',
      word: vocab[1].word,
      shownMeaning: vocab[2].meaning,
      prompt: `Thuật ngữ VEXcode "${vocab[1].word}" có nghĩa tiếng Việt là "${vocab[2].meaning}".`,
      answer: 'Sai',
      actualMeaning: vocab[1].meaning
    });
  }
  return list;
}

function buildLearnQuestion(
  vocab: VocabItem[],
  queue: number[],
  masteredCount: number
): LearnQuestionState | null {
  if (vocab.length === 0 || queue.length === 0) return null;
  const targetIdx = queue[0];
  const targetItem = vocab[targetIdx];
  const promptType: 'en2vi' | 'vi2en' =
    (masteredCount + queue.length + targetIdx) % 2 === 0 ? 'en2vi' : 'vi2en';
  const correctOption = promptType === 'en2vi' ? targetItem.meaning : targetItem.word;

  const fallbackEn = [
    'forward',
    'reverse',
    'velocity',
    'degrees',
    'Magnet',
    'forever',
    'wait until',
    'turn'
  ];
  const fallbackVi = [
    'phía trước',
    'đảo ngược',
    'vận tốc, tốc độ',
    'độ',
    'nam châm',
    'mãi mãi, liên tục',
    'đợi cho đến khi',
    'xoay'
  ];

  const pool = vocab
    .filter((_, idx) => idx !== targetIdx)
    .map(v => (promptType === 'en2vi' ? v.meaning : v.word));

  const extraPool = promptType === 'en2vi' ? fallbackVi : fallbackEn;
  extraPool.forEach(val => {
    if (val.toLowerCase() !== correctOption.toLowerCase() && !pool.includes(val)) {
      pool.push(val);
    }
  });

  const distractors = pool.slice(0, 3);
  const options = [correctOption, ...distractors];
  for (let i = options.length - 1; i > 0; i--) {
    const j = (i * 7 + targetIdx * 3 + masteredCount) % (i + 1);
    const tmp = options[i];
    options[i] = options[j];
    options[j] = tmp;
  }

  return {
    vocabIdx: targetIdx,
    promptType,
    word: targetItem.word,
    meaning: targetItem.meaning,
    example: targetItem.example || '',
    options,
    correctOption
  };
}

function translateCSharpToJS(code: string): string {
  return code
    .replace(/\bint\s+/g, 'let ')
    .replace(/\bfloat\s+/g, 'let ')
    .replace(/\bstring\s+/g, 'let ')
    .replace(/\bbool\s+/g, 'let ')
    .replace(/\bstring\[\]\s+/g, 'let ')
    .replace(/\bnew\s+string\[\]\s*\{/g, '[')
    .replace(/(\d+)f\b/g, '$1')
    .replace(/\.Length\b/g, '.length');
}

function formatLogArg(arg: any): string {
  if (typeof arg === 'object' && arg !== null) {
    try {
      return JSON.stringify(arg);
    } catch {
      return String(arg);
    }
  }
  return String(arg);
}

export const LearnPage: React.FC<LearnPageProps> = ({ student, onNavigatePortal }) => {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [studentProgress, setStudentProgress] = useState<Record<string, any>>(
    student.progress || {}
  );
  const [code, setCode] = useState('');
  const [outputTab, setOutputTab] = useState<'console' | 'testcases'>('console');
  const [consoleLogs, setConsoleLogs] = useState<ConsoleLine[]>([
    {
      type: 'muted',
      text: 'Nhấn "Chạy thử" hoặc "Nộp bài & Chấm điểm" để xem kết quả tại đây...'
    }
  ]);
  const [gradedResults, setGradedResults] = useState<GradedTestCase[] | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [showCongrats, setShowCongrats] = useState(false);

  // Left-panel mini flashcard state
  const [miniCardIdx, setMiniCardIdx] = useState(0);
  const [miniCardFlipped, setMiniCardFlipped] = useState(false);

  // Quizlet 3-Mode State (for Robotics VEX GO & VEX IQ)
  const [roboticsSection, setRoboticsSection] = useState<'vocab' | 'practice'>('vocab');
  const [quizletMode, setQuizletMode] = useState<'flashcards' | 'learn' | 'test'>('flashcards');
  const [qzDeck, setQzDeck] = useState<VocabItem[]>([]);
  const [qzCardIdx, setQzCardIdx] = useState(0);
  const [qzCardFlipped, setQzCardFlipped] = useState(false);
  const [qzFrontLang, setQzFrontLang] = useState<'en' | 'vi'>('en');

  // Mode 2: Learn
  const [qzLearnQueue, setQzLearnQueue] = useState<number[]>([]);
  const [qzLearnMastered, setQzLearnMastered] = useState<number[]>([]);
  const [qzLearnCurrent, setQzLearnCurrent] = useState<LearnQuestionState | null>(null);
  const [qzLearnFeedback, setQzLearnFeedback] = useState<LearnFeedbackState | null>(null);

  // Mode 3: Test
  const [tfQuestions, setTfQuestions] = useState<TrueFalseQuestion[]>([]);
  const [tfAnswers, setTfAnswers] = useState<Record<string, string>>({});
  const [kidQuizAnswers, setKidQuizAnswers] = useState<Record<string, string>>({});
  const [kidPuzzleSlots, setKidPuzzleSlots] = useState<(string | null)[]>([]);
  const [kidTestGraded, setKidTestGraded] = useState(false);
  const [kidScorePercent, setKidScorePercent] = useState<number | null>(null);
  const [robotAnimState, setRobotAnimState] = useState<'idle' | 'success' | 'warn'>('idle');

  const currentLesson = lessons[currentLessonIndex] || null;
  const classId = student.classId || 'Web';
  const isRoboticsKidLesson =
    classId === 'Robotics' &&
    Boolean(currentLesson && (currentLesson.kidQuiz || currentLesson.blockPuzzle));

  const initLessonState = useCallback(
    (lesson: Lesson, progMap: Record<string, any>) => {
      const savedProg = progMap[lesson.id];
      setGradedResults(null);
      setOutputTab('console');
      setConsoleLogs([
        {
          type: 'muted',
          text: 'Nhấn "Chạy thử" hoặc "Nộp bài & Chấm điểm" để xem kết quả tại đây...'
        }
      ]);
      setMiniCardIdx(0);
      setMiniCardFlipped(false);

      if (classId === 'Robotics' && (lesson.kidQuiz || lesson.blockPuzzle)) {
        const vocab = lesson.vocab || [];
        setQzDeck(vocab.map(v => ({ ...v })));
        setQzCardIdx(0);
        setQzCardFlipped(false);

        const tfList = generateTrueFalseQuestions(lesson);
        setTfQuestions(tfList);

        const slotsCount = lesson.blockPuzzle ? lesson.blockPuzzle.slotsCount : 0;
        let restoredTf: Record<string, string> = {};
        let restoredQuiz: Record<string, string> = {};
        let restoredSlots: (string | null)[] = new Array(slotsCount).fill(null);
        let restoredMastered: number[] = [];

        if (savedProg && savedProg.code) {
          try {
            const jsonMatch = savedProg.code.match(/\/\/\s*KID_STATE:(.*)/);
            if (jsonMatch && jsonMatch[1]) {
              const parsed = JSON.parse(jsonMatch[1].trim());
              if (parsed.tf) restoredTf = parsed.tf;
              if (parsed.quiz) restoredQuiz = parsed.quiz;
              if (Array.isArray(parsed.slots) && parsed.slots.length === slotsCount) {
                restoredSlots = parsed.slots;
              }
              if (Array.isArray(parsed.mastered)) {
                restoredMastered = parsed.mastered;
              }
            }
          } catch {}
        }

        if (savedProg && savedProg.status === 'passed') {
          tfList.forEach(tf => {
            if (!restoredTf[tf.id]) restoredTf[tf.id] = tf.answer;
          });
        }

        const queue = vocab.map((_, idx) => idx).filter(i => !restoredMastered.includes(i));
        setQzLearnMastered(restoredMastered);
        setQzLearnQueue(queue);
        setQzLearnFeedback(null);
        setQzLearnCurrent(buildLearnQuestion(vocab, queue, restoredMastered.length));

        setTfAnswers(restoredTf);
        setKidQuizAnswers(restoredQuiz);
        setKidPuzzleSlots(restoredSlots);
        setKidTestGraded(false);
        setKidScorePercent(null);
        setRobotAnimState('idle');
        setQuizletMode(savedProg && savedProg.status === 'passed' ? 'test' : 'flashcards');
      } else {
        setCode(savedProg && savedProg.code ? savedProg.code : lesson.initialCode || '');
      }
    },
    [classId]
  );

  useEffect(() => {
    const teacherQuery = student.teacherId
      ? `&teacherId=${encodeURIComponent(student.teacherId)}`
      : '';
    fetch(`/api/lessons?class=${classId}${teacherQuery}`)
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.lessons) && data.lessons.length > 0) {
          const loaded: Lesson[] = data.lessons;
          setLessons(loaded);
          let firstUnfinished = loaded.findIndex(l => {
            const p = (student.progress || {})[l.id];
            return !p || p.status !== 'passed';
          });
          if (firstUnfinished === -1) firstUnfinished = 0;
          setCurrentLessonIndex(firstUnfinished);
          initLessonState(loaded[firstUnfinished], student.progress || {});
        }
      })
      .catch(err => console.error('Lỗi tải bài học:', err));
  }, [classId, student.teacherId, student.progress, initLessonState]);

  const buildRoboticsCodeSummary = useCallback(
    (
      lesson: Lesson,
      tfMap: Record<string, string>,
      quizMap: Record<string, string>,
      slotsArr: (string | null)[],
      masteredArr: number[]
    ) => {
      const lines: string[] = [];
      lines.push(`=== BÀI LÀM QUIZLET VEX GO & VEX IQ CỦA HỌC SINH (${lesson.title}) ===`);
      lines.push(
        `Tiến độ phần Học (Learn): Đã nắm vững ${masteredArr.length}/${
          (lesson.vocab || []).length
        } từ`
      );
      if (tfQuestions.length > 0) {
        lines.push(`--- Phần 1: Câu hỏi Đúng / Sai (True / False) ---`);
        tfQuestions.forEach(tf => {
          const ans = tfMap[tf.id] || '(Chưa chọn)';
          const ok = ans === tf.answer;
          lines.push(
            `${ok ? '[ĐÚNG]' : '[SAI]'} [${tf.word} = ${tf.shownMeaning}] -> Chọn: [${ans}]`
          );
        });
      }
      if (lesson.kidQuiz) {
        lines.push(`--- Phần 2: Trắc nghiệm Từ vựng (Multiple Choice) ---`);
        lesson.kidQuiz.forEach(q => {
          const ans = quizMap[q.id] || '(Chưa chọn)';
          const ok = ans === q.answer;
          lines.push(`${ok ? '[ĐÚNG]' : '[SAI]'} ${q.prompt} -> Chọn: [${ans}]`);
        });
      }
      if (lesson.blockPuzzle) {
        lines.push(`--- Phần 3: Ghép Khối Lệnh VEXcode (Matching) ---`);
        const joined = slotsArr.filter(Boolean).join(' ');
        const expected = (lesson.blockPuzzle.expectedBlocks || []).join(' ');
        const ok = joined.toLowerCase() === expected.toLowerCase();
        lines.push(
          `${ok ? '[ĐÚNG]' : '[SAI]'} Khối lệnh VEXcode đã lắp: [${slotsArr
            .map(s => s || '___')
            .join('] -> [')}]`
        );
      }
      lines.push(
        `// KID_STATE:${JSON.stringify({
          tf: tfMap,
          quiz: quizMap,
          slots: slotsArr,
          mastered: masteredArr
        })}`
      );
      return lines.join('\n');
    },
    [tfQuestions]
  );

  const handleSelectLesson = (idx: number) => {
    if (idx < 0 || idx >= lessons.length) return;
    setCurrentLessonIndex(idx);
    initLessonState(lessons[idx], studentProgress);
    setDrawerOpen(false);
  };

  const handleResetCode = () => {
    if (!currentLesson) return;
    if (isRoboticsKidLesson) {
      if (window.confirm('Con có muốn xóa các lựa chọn hiện tại để chơi lại bài này từ đầu không?')) {
        initLessonState(currentLesson, {});
      }
      return;
    }
    if (window.confirm('Bạn có chắc muốn khôi phục lại đoạn mã ban đầu của bài học này không?')) {
      setCode(currentLesson.initialCode || '');
    }
  };

  // Run Code
  const handleRunCode = async () => {
    if (!currentLesson) return;
    const logs: ConsoleLine[] = [
      { type: 'info', text: `--- BẮT ĐẦU CHẠY THỬ (${classId.toUpperCase()}) ---` }
    ];

    if (isRoboticsKidLesson) {
      if (quizletMode !== 'test') {
        setQuizletMode('test');
      }
      logs.push({
        type: 'info',
        text: `[Quizlet VEX GO & IQ] Kiểm tra tiến độ bài "${currentLesson.title}"...`
      });
      logs.push({
        type: 'normal',
        text: `   Phần Học (Learn): Đã nắm vững ${qzLearnMastered.length}/${
          (currentLesson.vocab || []).length
        } từ vựng.`
      });
      tfQuestions.forEach((tf, i) => {
        const val = tfAnswers[tf.id];
        logs.push({
          type: val ? 'normal' : 'muted',
          text: val
            ? `   Câu Đúng/Sai A${i + 1} (${tf.word}) -> Con chọn: "${val}"`
            : `   Câu Đúng/Sai A${i + 1} (${tf.word}) -> (Con chưa chọn Đúng/Sai)`
        });
      });
      (currentLesson.kidQuiz || []).forEach(q => {
        const val = kidQuizAnswers[q.id];
        logs.push({
          type: val ? 'normal' : 'muted',
          text: val
            ? `   ${q.prompt} -> Con chọn: "${val}"`
            : `   ${q.prompt} -> (Con chưa chọn thẻ nào)`
        });
      });
      if (currentLesson.blockPuzzle) {
        const assembled = kidPuzzleSlots.map(s => s || '___').join(' ] -> [ ');
        logs.push({
          type: 'info',
          text: `Khối lệnh VEXcode đã lắp: [ ${assembled} ]`
        });
      }
      const allFilled =
        tfQuestions.every(tf => Boolean(tfAnswers[tf.id])) &&
        (currentLesson.kidQuiz || []).every(q => Boolean(kidQuizAnswers[q.id])) &&
        kidPuzzleSlots.every(Boolean);
      setRobotAnimState(allFilled ? 'success' : 'warn');
      logs.push({
        type: allFilled ? 'success' : 'error',
        text: allFilled
          ? "Con đã làm đủ cả 3 phần trong bài Kiểm tra! Hãy bấm nút 'Nộp bài & Chấm điểm' để nhận Cúp nhé!"
          : 'Con hãy hoàn thành đủ Phần A (Đúng/Sai), Phần B (Trắc nghiệm) và Phần C (Ghép khối lệnh) rồi nộp bài nhé!'
      });
      setConsoleLogs(logs);
      setOutputTab('console');
      return;
    }

    if (classId === 'Python') {
      try {
        const res = await fetch('/api/execute/python', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code })
        });
        const data = await res.json();
        if (data.success) {
          if (data.stdout && data.stdout.trim()) {
            logs.push({ type: 'normal', text: data.stdout });
          } else {
            logs.push({
              type: 'muted',
              text: '(Chương trình chạy xong nhưng không có lệnh print() nào xuất kết quả)'
            });
          }
          logs.push({ type: 'success', text: 'Mã Python chạy thành công!' });
        } else {
          logs.push({
            type: 'error',
            text: `Lỗi Python:\n${data.error || 'Không thể thực thi'}`
          });
        }
      } catch {
        logs.push({ type: 'error', text: 'Không thể kết nối tới máy chủ Python' });
      }
    } else if (classId === 'Unity') {
      const Debug = {
        Log: (...args: any[]) => {
          logs.push({
            type: 'normal',
            text: '[Unity Console] ' + args.map(formatLogArg).join(' ')
          });
        }
      };
      try {
        const jsEq = translateCSharpToJS(code);
        const runner = new Function('Debug', jsEq);
        runner(Debug);
        logs.push({ type: 'success', text: 'Script Unity C# biên dịch và chạy thành công!' });
      } catch (err: any) {
        logs.push({ type: 'error', text: `Lỗi C# Unity: ${err.message}` });
      }
    } else {
      const origLog = console.log;
      const origErr = console.error;
      console.log = (...args: any[]) =>
        logs.push({ type: 'normal', text: args.map(formatLogArg).join(' ') });
      console.error = (...args: any[]) =>
        logs.push({ type: 'error', text: args.map(formatLogArg).join(' ') });
      try {
        const runner = new Function(code);
        runner();
        logs.push({ type: 'success', text: 'Chương trình JavaScript chạy thành công!' });
      } catch (err: any) {
        logs.push({ type: 'error', text: `Lỗi JavaScript: ${err.message}` });
      } finally {
        console.log = origLog;
        console.error = origErr;
      }
    }

    setConsoleLogs(logs);
    setOutputTab('console');
  };

  // Submit & Grade
  const handleSubmitCode = async () => {
    if (!currentLesson) return;
    const testCases = currentLesson.testCases || [];
    const logs: ConsoleLine[] = [
      {
        type: 'info',
        text: `--- HỆ THỐNG MINDX ĐANG CHẤM BÀI LỚP ${classId.toUpperCase()} ---`
      }
    ];

    let allPassed = true;
    const results: GradedTestCase[] = [];
    let submissionCode = code;

    if (isRoboticsKidLesson) {
      setQuizletMode('test');

      // 1. Grade True/False
      tfQuestions.forEach((tf, idx) => {
        const userTf = tfAnswers[tf.id];
        const passed = userTf === tf.answer;
        const message = passed
          ? `Đúng rồi! (${tf.word} = "${tf.actualMeaning}")`
          : userTf
          ? `Con chọn "${userTf}" chưa đúng, đáp án là "${tf.answer}" (vì ${tf.word} nghĩa là "${tf.actualMeaning}")`
          : `Con chưa chọn Đúng/Sai cho câu A${idx + 1}`;
        if (!passed) allPassed = false;
        results.push({
          name: `Câu Đúng/Sai A${idx + 1}: "${tf.word}" = "${tf.shownMeaning}"`,
          type: 'variable_value',
          passed,
          message
        });
      });

      // 2. Grade Multiple Choice & Block Puzzle
      for (const tc of testCases) {
        let passed = false;
        let message = '';
        if (tc.varName === 'puzzle') {
          const userJoined = kidPuzzleSlots
            .filter(Boolean)
            .join(' ')
            .trim()
            .replace(/\s+/g, ' ')
            .toLowerCase();
          const expectedJoined = String(tc.expectedValue || '')
            .trim()
            .replace(/\s+/g, ' ')
            .toLowerCase();
          passed = userJoined === expectedJoined;
          message = passed
            ? `Ghép chính xác: [${tc.expectedValue}]`
            : `Thứ tự đúng phải là: "${tc.expectedValue}" (Con đang lắp: "${
                kidPuzzleSlots.filter(Boolean).join(' ') || 'Chưa lắp'
              }")`;
        } else {
          const userAns = kidQuizAnswers[tc.varName || ''];
          const normActual = String(userAns ?? '')
            .trim()
            .replace(/\s+/g, ' ')
            .toLowerCase();
          const normExpected = String(tc.expectedValue ?? '')
            .trim()
            .replace(/\s+/g, ' ')
            .toLowerCase();
          passed = normActual === normExpected;
          message = passed
            ? `Đúng rồi! ("${tc.expectedValue}")`
            : userAns
            ? `Con chọn "${userAns}" chưa đúng, đáp án là "${tc.expectedValue}"`
            : `Con chưa bấm chọn đáp án cho câu này`;
        }
        if (!passed) allPassed = false;
        results.push({ ...tc, passed, message });
      }

      const passedCount = results.filter(r => r.passed).length;
      const pct = results.length > 0 ? Math.round((passedCount / results.length) * 100) : 100;
      setKidScorePercent(pct);
      setKidTestGraded(true);
      setRobotAnimState(allPassed ? 'success' : 'warn');
      submissionCode = buildRoboticsCodeSummary(
        currentLesson,
        tfAnswers,
        kidQuizAnswers,
        kidPuzzleSlots,
        qzLearnMastered
      );
    } else if (classId === 'Python') {
      const extractCode = `
${code}

# MindX Test Extractor
import json
_out_vars = {}
for _k in ['ten_hoc_sinh', 'tuoi', 'dien_tich', 'danh_gia', 'tong_so', 'so_luong', 'danh_sach_ban']:
    if _k in locals():
        _out_vars[_k] = locals()[_k]
print("---MINDX_VARS---" + json.dumps(_out_vars))
`;
      let stdout = '';
      let stderr = '';
      let pyVars: Record<string, any> = {};

      try {
        const res = await fetch('/api/execute/python', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code: extractCode })
        });
        const data = await res.json();
        if (data.success) {
          const parts = (data.stdout || '').split('---MINDX_VARS---');
          stdout = parts[0] || '';
          if (parts[1]) {
            try {
              pyVars = JSON.parse(parts[1].trim());
            } catch {}
          }
          logs.push({ type: 'normal', text: stdout });
        } else {
          stderr = data.error || '';
          logs.push({ type: 'error', text: stderr });
        }
      } catch {
        stderr = 'Lỗi kết nối server Python';
      }

      for (const tc of testCases) {
        let passed = false;
        let message = '';
        if (stderr) {
          passed = false;
          message = 'Code gặp lỗi runtime trong Python';
        } else if (tc.type === 'output_contains') {
          passed = stdout.toLowerCase().includes((tc.expected || '').toLowerCase());
          message = passed ? 'Chính xác' : `Chưa in ra đúng '${tc.expected}'`;
        } else if (tc.type === 'variable_type') {
          const val = pyVars[tc.varName || ''];
          passed = typeof val === tc.expectedType;
          message = passed ? 'Chính xác' : `Biến '${tc.varName}' phải có kiểu ${tc.expectedType}`;
        } else if (tc.type === 'variable_value') {
          const val = pyVars[tc.varName || ''];
          passed = val === tc.expectedValue;
          message = passed
            ? 'Chính xác'
            : `Biến '${tc.varName}' phải bằng ${tc.expectedValue} (hiện tại: ${val})`;
        } else if (tc.type === 'function_call') {
          const fnTestCode = `${code}\nprint("FN_RES=" + str(${tc.funcName}(${(
            tc.args || []
          ).join(',')})))`;
          try {
            const fnRes = await fetch('/api/execute/python', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ code: fnTestCode })
            });
            const fnData = await fnRes.json();
            if (fnData.success && fnData.stdout.includes(`FN_RES=${tc.expectedValue}`)) {
              passed = true;
              message = 'Chính xác';
            } else {
              passed = false;
              message = `Gọi ${tc.funcName}(${(tc.args || []).join(',')}) mong đợi ${
                tc.expectedValue
              }`;
            }
          } catch {
            passed = false;
            message = 'Lỗi chạy hàm Python';
          }
        } else if (tc.type === 'custom_eval') {
          try {
            const evalFn = new Function(
              ...Object.keys(pyVars),
              `return Boolean(${tc.expression});`
            );
            passed = Boolean(evalFn(...Object.values(pyVars)));
          } catch {
            const valList = pyVars[tc.varName || 'danh_sach_ban'];
            passed = Array.isArray(valList) && valList.length >= 3;
          }
          message = passed ? 'Chính xác' : 'Chưa thỏa mãn tiêu chí';
        }
        if (!passed) allPassed = false;
        results.push({ ...tc, passed, message });
      }
    } else if (classId === 'Unity') {
      const capturedLogs: string[] = [];
      const Debug = {
        Log: (...args: any[]) => {
          const msg = args.map(formatLogArg).join(' ');
          capturedLogs.push(msg);
          logs.push({ type: 'normal', text: '[Unity Console] ' + msg });
        }
      };
      let executionContext: Record<string, any> = {};
      let runtimeError: any = null;
      try {
        const jsEq = translateCSharpToJS(code);
        const runner = new Function(
          'Debug',
          `
          ${jsEq}
          return (function() {
            let _s = {};
            try { if (typeof playerName !== 'undefined') _s.playerName = playerName; } catch(e){}
            try { if (typeof hp !== 'undefined') _s.hp = hp; } catch(e){}
            try { if (typeof remainingHp !== 'undefined') _s.remainingHp = remainingHp; } catch(e){}
            try { if (typeof status !== 'undefined') _s.status = status; } catch(e){}
            try { if (typeof totalMonsters !== 'undefined') _s.totalMonsters = totalMonsters; } catch(e){}
            try { if (typeof Heal !== 'undefined') _s.Heal = Heal; } catch(e){}
            try { if (typeof weapons !== 'undefined') _s.weapons = weapons; } catch(e){}
            try { if (typeof weaponCount !== 'undefined') _s.weaponCount = weaponCount; } catch(e){}
            return _s;
          })();
        `
        );
        executionContext = runner(Debug) || {};
      } catch (err: any) {
        runtimeError = err;
        logs.push({ type: 'error', text: `Lỗi thực thi Unity C#: ${err.message}` });
      }

      for (const tc of testCases) {
        let passed = false;
        let message = '';
        if (runtimeError) {
          passed = false;
          message = 'Không thể kiểm tra do code gặp lỗi';
        } else if (tc.type === 'output_contains') {
          const full = capturedLogs.join('\n');
          passed = full.toLowerCase().includes((tc.expected || '').toLowerCase());
          message = passed ? 'Chính xác' : `Chưa in ra '${tc.expected}'`;
        } else if (tc.type === 'variable_type') {
          const val = executionContext[tc.varName || ''];
          passed = typeof val === tc.expectedType;
          message = passed ? 'Chính xác' : `Biến '${tc.varName}' phải có kiểu ${tc.expectedType}`;
        } else if (tc.type === 'variable_value') {
          const val = executionContext[tc.varName || ''];
          passed = val === tc.expectedValue;
          message = passed ? 'Chính xác' : `Biến '${tc.varName}' phải bằng ${tc.expectedValue}`;
        } else if (tc.type === 'function_call') {
          const fn = executionContext[tc.funcName || ''];
          if (typeof fn === 'function') {
            const res = fn(...(tc.args || []));
            passed = res === tc.expectedValue;
            message = passed ? 'Chính xác' : `Hàm trả về ${res}, mong đợi ${tc.expectedValue}`;
          } else {
            passed = false;
            message = `Hàm '${tc.funcName}' chưa được định nghĩa`;
          }
        } else if (tc.type === 'custom_eval') {
          try {
            const evalFn = new Function(
              ...Object.keys(executionContext),
              `return Boolean(${tc.expression});`
            );
            passed = Boolean(evalFn(...Object.values(executionContext)));
          } catch {
            const weapons = executionContext.weapons;
            const count = executionContext.weaponCount;
            passed = Array.isArray(weapons) && weapons.length >= 3 && count === weapons.length;
          }
          message = passed ? 'Chính xác' : 'Chưa thỏa mãn tiêu chí';
        }
        if (!passed) allPassed = false;
        results.push({ ...tc, passed, message });
      }
    } else {
      const capturedLogs: string[] = [];
      const origLog = console.log;
      console.log = (...args: any[]) => {
        const msg = args.map(formatLogArg).join(' ');
        capturedLogs.push(msg);
        logs.push({ type: 'normal', text: msg });
      };
      let executionContext: Record<string, any> = {};
      let runtimeError: any = null;
      try {
        const runner = new Function(`
          ${code}
          return (function() {
            let _scope = {};
            try { if (typeof tenHocSinh !== 'undefined') _scope.tenHocSinh = tenHocSinh; } catch(e){}
            try { if (typeof tuoi !== 'undefined') _scope.tuoi = tuoi; } catch(e){}
            try { if (typeof dienTichBanner !== 'undefined') _scope.dienTichBanner = dienTichBanner; } catch(e){}
            try { if (typeof ketQua !== 'undefined') _scope.ketQua = ketQua; } catch(e){}
            try { if (typeof tongThe !== 'undefined') _scope.tongThe = tongThe; } catch(e){}
            try { if (typeof tinhTongTien !== 'undefined') _scope.tinhTongTien = tinhTongTien; } catch(e){}
            try { if (typeof menuItems !== 'undefined') _scope.menuItems = menuItems; } catch(e){}
            try { if (typeof soLuongMenu !== 'undefined') _scope.soLuongMenu = soLuongMenu; } catch(e){}
            return _scope;
          })();
        `);
        executionContext = runner() || {};
      } catch (err: any) {
        runtimeError = err;
        logs.push({ type: 'error', text: `Lỗi thực thi: ${err.message}` });
      } finally {
        console.log = origLog;
      }

      for (const tc of testCases) {
        let passed = false;
        let message = '';
        if (runtimeError) {
          passed = false;
          message = 'Không thể kiểm tra do code gặp lỗi cú pháp';
        } else if (tc.type === 'output_contains') {
          const full = capturedLogs.join('\n');
          passed = full.toLowerCase().includes((tc.expected || '').toLowerCase());
          message = passed ? 'Chính xác' : `Chưa in ra '${tc.expected}'`;
        } else if (tc.type === 'variable_type') {
          const val = executionContext[tc.varName || ''];
          passed = typeof val === tc.expectedType;
          message = passed ? 'Chính xác' : `Biến '${tc.varName}' phải có kiểu ${tc.expectedType}`;
        } else if (tc.type === 'variable_value') {
          const val = executionContext[tc.varName || ''];
          passed = val === tc.expectedValue;
          message = passed ? 'Chính xác' : `Biến '${tc.varName}' phải bằng ${tc.expectedValue}`;
        } else if (tc.type === 'function_call') {
          const fn = executionContext[tc.funcName || ''];
          if (typeof fn === 'function') {
            const res = fn(...(tc.args || []));
            passed = res === tc.expectedValue;
            message = passed
              ? 'Chính xác'
              : `Gọi ${tc.funcName} trả về ${res}, mong đợi ${tc.expectedValue}`;
          } else {
            passed = false;
            message = `Hàm '${tc.funcName}' chưa được định nghĩa`;
          }
        } else if (tc.type === 'custom_eval') {
          const evalFn = new Function(
            ...Object.keys(executionContext),
            `return Boolean(${tc.expression});`
          );
          passed = Boolean(evalFn(...Object.values(executionContext)));
          message = passed ? 'Chính xác' : 'Chưa thỏa mãn tiêu chí kiểm tra';
        }
        if (!passed) allPassed = false;
        results.push({ ...tc, passed, message });
      }
    }

    setGradedResults(results);
    setOutputTab('testcases');

    const status = allPassed ? 'passed' : 'failed';
    try {
      const res = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: student.id,
          lessonId: currentLesson.id,
          code: submissionCode,
          status
        })
      });
      const data = await res.json();
      if (data.success) {
        setStudentProgress(prev => ({
          ...prev,
          [currentLesson.id]: {
            ...(prev[currentLesson.id] || {}),
            status,
            code: submissionCode
          }
        }));
      }
    } catch (err) {
      console.error('Lỗi lưu bài nộp:', err);
    }

    if (allPassed) {
      logs.push({
        type: 'success',
        text: 'XUẤT SẮC! BẠN ĐÃ VƯỢT QUA TOÀN BỘ TIÊU CHÍ!'
      });
      setShowCongrats(true);
    } else {
      logs.push({
        type: 'error',
        text: "Một số tiêu chí kiểm tra chưa đạt. Hãy xem thẻ 'Tiêu chí chấm điểm' để sửa lại nhé!"
      });
    }
    setConsoleLogs(logs);
  };

  // Quizlet Learn Option Handler
  const handleSelectLearnOption = (opt: string) => {
    if (!qzLearnCurrent || qzLearnFeedback || !currentLesson) return;
    const isCorrect = opt === qzLearnCurrent.correctOption;
    speakEnglishWord(qzLearnCurrent.word);

    if (isCorrect) {
      const nextMastered = [...qzLearnMastered, qzLearnCurrent.vocabIdx];
      const nextQueue = qzLearnQueue.filter(i => i !== qzLearnCurrent.vocabIdx);
      setQzLearnMastered(nextMastered);
      setQzLearnQueue(nextQueue);
    } else {
      const nextQueue = [...qzLearnQueue];
      const first = nextQueue.shift();
      if (typeof first === 'number') nextQueue.push(first);
      setQzLearnQueue(nextQueue);
    }

    setQzLearnFeedback({
      selectedOption: opt,
      isCorrect,
      word: qzLearnCurrent.word,
      meaning: qzLearnCurrent.meaning
    });
  };

  const handleNextLearnStep = () => {
    if (!currentLesson) return;
    setQzLearnFeedback(null);
    setQzLearnCurrent(
      buildLearnQuestion(currentLesson.vocab || [], qzLearnQueue, qzLearnMastered.length)
    );
  };

  const handleResetLearn = () => {
    if (!currentLesson) return;
    const vocab = currentLesson.vocab || [];
    const freshQueue = vocab.map((_, idx) => idx);
    setQzLearnMastered([]);
    setQzLearnQueue(freshQueue);
    setQzLearnFeedback(null);
    setQzLearnCurrent(buildLearnQuestion(vocab, freshQueue, 0));
  };

  // Overall course progress
  const passedLessonsCount = lessons.filter(
    l => studentProgress[l.id]?.status === 'passed'
  ).length;
  const coursePercent =
    lessons.length > 0 ? Math.round((passedLessonsCount / lessons.length) * 100) : 0;

  const vocabList = currentLesson?.vocab || [];
  const quizList = currentLesson?.kidQuiz || [];
  const puzzle = currentLesson?.blockPuzzle;

  const answeredTfCount = tfQuestions.filter(tf => Boolean(tfAnswers[tf.id])).length;
  const answeredQuizCount = quizList.filter(q => Boolean(kidQuizAnswers[q.id])).length;
  const puzzleDoneCount = puzzle && kidPuzzleSlots.every(Boolean) ? 1 : 0;
  const totalTestSections = tfQuestions.length + quizList.length + (puzzle ? 1 : 0);
  const answeredTestSections = answeredTfCount + answeredQuizCount + puzzleDoneCount;

  const currentMiniCard = vocabList[miniCardIdx] || null;
  const currentMainCard = qzDeck[qzCardIdx] || { word: '', meaning: '', example: '' };
  const showMainEnglish =
    (qzFrontLang === 'en' && !qzCardFlipped) || (qzFrontLang === 'vi' && qzCardFlipped);

  return (
    <div className="mindx-app">
      {/* Header MindX */}
      <header className="mindx-header">
        <div className="header-left">
          <button
            type="button"
            className="btn-back-home"
            title="Trở về trang chủ chọn lớp"
            onClick={onNavigatePortal}
          >
            <LuArrowLeft size={16} />
            <span>Chọn Lớp</span>
          </button>
          <div className="mindx-logo-badge">MINDX</div>
          <div className="current-lesson-header-title">
            {currentLesson
              ? `${currentLesson.order}. ${currentLesson.title}`
              : 'Đang tải bài học...'}
          </div>
        </div>

        <div className="header-center">
          <div className="progress-container">
            <div className="progress-info">
              <span>Tiến độ học tập</span>
              <span>
                {passedLessonsCount}/{lessons.length} bài ({coursePercent}%)
              </span>
            </div>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${coursePercent}%` }} />
            </div>
          </div>
        </div>

        <div className="header-right">
          <span className={`badge-class ${classId.toLowerCase()}`}>
            <ClassIcon name={classId} size={15} />
            <span>
              {classId === 'Robotics' ? 'Lớp Robot (VEX GO & IQ)' : `Lớp ${classId}`}
            </span>
          </span>

          {student.teacherName && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                background: 'rgba(56, 189, 248, 0.14)',
                border: '1px solid rgba(56, 189, 248, 0.35)',
                color: '#38bdf8',
                padding: '6px 12px',
                borderRadius: 999,
                fontSize: '0.8rem',
                fontWeight: 800
              }}
            >
              <span>GV: {student.teacherName}</span>
            </span>
          )}

          <div className="student-tag">
            <StudentAvatarIcon avatar={student.avatar} size={20} />
            <span>{student.name}</span>
          </div>

          <button type="button" className="btn-tracks" onClick={() => setDrawerOpen(true)}>
            <LuBookOpen size={16} />
            <span>Mục lục bài</span>
          </button>
        </div>
      </header>

      {/* Workspace: Full-Screen Quizlet cho Robotics, 2-Column cho Web/Python/Unity */}
      <main className={`mindx-workspace ${classId === 'Robotics' ? 'robotics-full' : ''}`}>
        {/* Cột Trái: Lý thuyết & Đề bài (Chỉ hiển thị cho Web, Python, Unity) */}
        {classId !== 'Robotics' && (
          <section className="theory-panel">
            <div className="theory-tabs">
              <button type="button" className="tab-btn active">
                <LuBookOpen size={16} />
                <span>Lý Thuyết &amp; Thử Thách</span>
              </button>
            </div>

            <div className="theory-content">
              <h2>
                {currentLesson ? `${currentLesson.order}. ${currentLesson.title}` : ''}
              </h2>

              {currentLesson && (
                <div dangerouslySetInnerHTML={{ __html: currentLesson.theory }} />
              )}

              <div className="task-card">
                <div className="task-card-title">
                  <LuTarget size={16} />
                  <span>Thử thách bài tập:</span>
                </div>
                {currentLesson && (
                  <div
                    className="task-card-body"
                    dangerouslySetInnerHTML={{ __html: currentLesson.task }}
                  />
                )}
              </div>

              {currentLesson?.homeworkNote && (
                <div
                  className="task-card"
                  style={{
                    marginTop: 14,
                    borderColor: 'rgba(56, 189, 248, 0.45)',
                    background: 'rgba(56, 189, 248, 0.08)'
                  }}
                >
                  <div className="task-card-title" style={{ color: '#38bdf8' }}>
                    <LuClipboardCheck size={16} />
                    <span>
                      Bài Tập Về Nhà ({student.teacherName || 'Giáo viên lớp giao'}):
                    </span>
                  </div>
                  <div className="task-card-body" style={{ whiteSpace: 'pre-wrap' }}>
                    {currentLesson.homeworkNote}
                  </div>
                </div>
              )}
            </div>

            <div className="panel-footer">
              <button
                type="button"
                className="btn-nav"
                disabled={currentLessonIndex === 0}
                onClick={() => handleSelectLesson(currentLessonIndex - 1)}
              >
                <LuArrowLeft size={15} />
                <span>Bài trước</span>
              </button>
              <button
                type="button"
                className="btn-nav"
                disabled={currentLessonIndex >= lessons.length - 1}
                onClick={() => handleSelectLesson(currentLessonIndex + 1)}
              >
                <span>Bài tiếp theo</span>
                <LuArrowRight size={15} />
              </button>
            </div>
          </section>
        )}

        {/* Màn hình chính: Full-Screen Quizlet & Thực Hành 2D (Robotics) hoặc Code Editor (Web/Python/Unity) */}
        <section className="editor-workspace">
          {classId !== 'Robotics' && (
            <div className="editor-header">
              <div className="editor-filename">
                {classId === 'Python' ? (
                  <>
                    <ClassIcon name="Python" size={16} />
                    <span>main.py</span>
                  </>
                ) : classId === 'Unity' ? (
                  <>
                    <ClassIcon name="Unity" size={16} />
                    <span>PlayerController.cs</span>
                  </>
                ) : (
                  <>
                    <ClassIcon name="javascript" size={16} />
                    <span>main.js</span>
                  </>
                )}
              </div>

              <div className="editor-actions">
                <button type="button" className="btn-reset-code" onClick={handleResetCode}>
                  <LuRotateCcw size={14} />
                  <span>Khôi phục</span>
                </button>
                <button type="button" className="btn-run" onClick={handleRunCode}>
                  <LuPlay size={14} />
                  <span>Chạy thử</span>
                </button>
                <button type="button" className="btn-submit" onClick={handleSubmitCode}>
                  <LuRocket size={15} />
                  <span>Nộp bài &amp; Chấm điểm</span>
                </button>
              </div>
            </div>
          )}

          <div className="editor-body">
            {isRoboticsKidLesson && currentLesson ? (
              <div className="kid-playground">
                <div
                  className="kid-playground-inner"
                  style={{
                    maxWidth: roboticsSection === 'practice' ? 1280 : 1020
                  }}
                >
                  {/* Thanh Chuyển Đổi 2 Phần Chính Của Robotics: Phần 1 (Học Từ Mới) & Phần 2 (Thực Hành Đề Thầy Cô Giao) */}
                  <div className="robotics-two-stage-bar">
                    <div className="robotics-stage-tabs">
                      <button
                        type="button"
                        className={`robotics-stage-btn ${
                          roboticsSection === 'vocab' ? 'active' : ''
                        }`}
                        onClick={() => setRoboticsSection('vocab')}
                      >
                        <TbCards size={22} />
                        <div>
                          <div className="robotics-stage-btn-title">
                            BƯỚC 1: HỌC TỪ VỰNG KHỐI LỆNH
                          </div>
                          <div className="robotics-stage-btn-sub">
                            Thẻ ghi nhớ &bull; Học &bull; Kiểm tra ({vocabList.length} từ mới)
                          </div>
                        </div>
                      </button>

                      <button
                        type="button"
                        className={`robotics-stage-btn practice ${
                          roboticsSection === 'practice' ? 'active' : ''
                        }`}
                        onClick={() => setRoboticsSection('practice')}
                      >
                        <TbRobot size={24} />
                        <div>
                          <div className="robotics-stage-btn-title">
                            BƯỚC 2: THỰC HÀNH &amp; BÀI TẬP VỀ NHÀ 2D
                          </div>
                          <div className="robotics-stage-btn-sub">
                            Lắp ghép VEXcode GO &amp; Làm đề của {student.teacherName || 'Thầy/Cô'}
                          </div>
                        </div>
                      </button>
                    </div>

                    <div className="robotics-lesson-nav-pills">
                      <button
                        type="button"
                        className="btn-friendly-lesson-nav"
                        disabled={currentLessonIndex === 0}
                        onClick={() => handleSelectLesson(currentLessonIndex - 1)}
                      >
                        <LuArrowLeft size={15} />
                        <span>Buổi trước</span>
                      </button>
                      <button
                        type="button"
                        className="btn-friendly-lesson-nav"
                        disabled={currentLessonIndex >= lessons.length - 1}
                        onClick={() => handleSelectLesson(currentLessonIndex + 1)}
                      >
                        <span>Buổi tiếp theo</span>
                        <LuArrowRight size={15} />
                      </button>
                    </div>
                  </div>

                  {roboticsSection === 'practice' ? (
                    <VexCodePracticeLab
                      lessonId={currentLesson.id}
                      lessonOrder={currentLesson.order}
                      lessonTitle={currentLesson.title}
                      teacherName={student.teacherName}
                      homeworkNote={currentLesson.homeworkNote}
                      assignments={currentLesson.practiceAssignments}
                      onSubmitAssignment={async (summaryCode, passed) => {
                        const status = passed ? 'passed' : 'failed';
                        try {
                          const res = await fetch('/api/submissions', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              studentId: student.id,
                              lessonId: currentLesson.id,
                              code: summaryCode,
                              status
                            })
                          });
                          const data = await res.json();
                          if (data.success) {
                            setStudentProgress(prev => ({
                              ...prev,
                              [currentLesson.id]: {
                                ...(prev[currentLesson.id] || {}),
                                status,
                                code: summaryCode
                              }
                            }));
                          }
                        } catch (err) {
                          console.error('Lỗi lưu bài thực hành:', err);
                        }
                        if (passed) {
                          setShowCongrats(true);
                        }
                      }}
                    />
                  ) : (
                    <>
                {/* Thanh 3 Chế độ chuẩn Quizlet */}
                <div className="quizlet-mode-bar">
                  <button
                    type="button"
                    className={`quizlet-mode-tab ${
                      quizletMode === 'flashcards' ? 'active' : ''
                    }`}
                    onClick={() => setQuizletMode('flashcards')}
                  >
                    <div className="quizlet-mode-tab-title">
                      <TbCards size={18} />
                      <span>1. Thẻ ghi nhớ</span>
                    </div>
                    <div className="quizlet-mode-tab-sub">
                      Flashcards ({vocabList.length} từ)
                    </div>
                  </button>

                  <button
                    type="button"
                    className={`quizlet-mode-tab ${quizletMode === 'learn' ? 'active' : ''}`}
                    onClick={() => {
                      setQuizletMode('learn');
                      if (!qzLearnCurrent && qzLearnQueue.length > 0) {
                        setQzLearnCurrent(
                          buildLearnQuestion(
                            vocabList,
                            qzLearnQueue,
                            qzLearnMastered.length
                          )
                        );
                      }
                    }}
                  >
                    <div className="quizlet-mode-tab-title">
                      <LuBrainCircuit size={18} />
                      <span>2. Học</span>
                    </div>
                    <div className="quizlet-mode-tab-sub">
                      {qzLearnMastered.length === vocabList.length && vocabList.length > 0 ? (
                        <>
                          <LuCircleCheck size={13} color="#34d399" />
                          <span>Đã thuộc 100%</span>
                        </>
                      ) : (
                        <span>
                          Thuộc {qzLearnMastered.length}/{vocabList.length} từ
                        </span>
                      )}
                    </div>
                  </button>

                  <button
                    type="button"
                    className={`quizlet-mode-tab ${quizletMode === 'test' ? 'active' : ''}`}
                    onClick={() => setQuizletMode('test')}
                  >
                    <div className="quizlet-mode-tab-title">
                      <LuClipboardCheck size={18} />
                      <span>3. Kiểm tra</span>
                    </div>
                    <div className="quizlet-mode-tab-sub">
                      {kidScorePercent !== null
                        ? `Điểm: ${kidScorePercent}%`
                        : `Đã làm ${answeredTestSections}/${totalTestSections}`}
                    </div>
                  </button>
                </div>

                {/* CHẾ ĐỘ 1: THẺ GHI NHỚ (FLASHCARDS) */}
                {quizletMode === 'flashcards' && (
                  <>
                    <div className="qz-flashcard-stage">
                      <div className="qz-flashcard-top">
                        <div
                          style={{
                            fontWeight: 900,
                            color: '#f8fafc',
                            fontSize: '1rem',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 8
                          }}
                        >
                          <TbCards size={20} color="#38bdf8" />
                          <span>Phần 1: Lật Thẻ Ghi Nhớ Từ Vựng VEX GO / VEX IQ</span>
                        </div>
                        <span className="qz-progress-pill">
                          Thẻ {qzCardIdx + 1} / {qzDeck.length}
                        </span>
                      </div>

                      <div
                        className={`qz-big-card ${qzCardFlipped ? 'flipped' : ''}`}
                        onClick={() => setQzCardFlipped(!qzCardFlipped)}
                      >
                        <span className="quizlet-side-badge">
                          <LuLanguages size={14} />
                          <span>
                            {showMainEnglish
                              ? 'Thuật ngữ VEXcode (Tiếng Anh)'
                              : 'Nghĩa Tiếng Việt'}
                          </span>
                        </span>
                        <button
                          type="button"
                          className="quizlet-speak-btn"
                          onClick={e => speakEnglishWord(currentMainCard.word, e)}
                        >
                          <LuVolume2 size={15} />
                          <span>Phát âm</span>
                        </button>
                        <div className="qz-big-word">
                          {showMainEnglish ? currentMainCard.word : currentMainCard.meaning}
                        </div>
                        {currentMainCard.example && (
                          <div className="qz-big-example">
                            Khối lệnh mẫu: <code>{currentMainCard.example}</code>
                          </div>
                        )}
                        <div className="quizlet-flip-hint">
                          <LuRepeat size={14} />
                          <span>
                            Bấm vào thẻ để lật mặt (
                            {showMainEnglish ? 'Xem nghĩa Tiếng Việt' : 'Xem từ Tiếng Anh'})
                          </span>
                        </div>
                      </div>

                      <div className="qz-toolbar">
                        <div className="qz-btn-group">
                          <button
                            type="button"
                            className="qz-action-btn"
                            onClick={() => {
                              if (qzDeck.length === 0) return;
                              setQzCardIdx((qzCardIdx - 1 + qzDeck.length) % qzDeck.length);
                              setQzCardFlipped(false);
                            }}
                          >
                            <LuArrowLeft size={15} />
                            <span>Thẻ trước</span>
                          </button>
                          <button
                            type="button"
                            className="qz-action-btn primary"
                            onClick={() => setQzCardFlipped(!qzCardFlipped)}
                          >
                            <LuRepeat size={15} />
                            <span>Lật thẻ</span>
                          </button>
                          <button
                            type="button"
                            className="qz-action-btn"
                            onClick={() => {
                              if (qzDeck.length === 0) return;
                              setQzCardIdx((qzCardIdx + 1) % qzDeck.length);
                              setQzCardFlipped(false);
                            }}
                          >
                            <span>Thẻ tiếp</span>
                            <LuArrowRight size={15} />
                          </button>
                        </div>

                        <div className="qz-btn-group">
                          <button
                            type="button"
                            className="qz-action-btn"
                            onClick={() => {
                              const copy = [...qzDeck];
                              for (let i = copy.length - 1; i > 0; i--) {
                                const j = Math.floor(Math.random() * (i + 1));
                                const t = copy[i];
                                copy[i] = copy[j];
                                copy[j] = t;
                              }
                              setQzDeck(copy);
                              setQzCardIdx(0);
                              setQzCardFlipped(false);
                            }}
                          >
                            <LuShuffle size={15} color="#fb923c" />
                            <span>Trộn thẻ</span>
                          </button>
                          <button
                            type="button"
                            className="qz-action-btn"
                            onClick={() => {
                              setQzFrontLang(qzFrontLang === 'en' ? 'vi' : 'en');
                              setQzCardFlipped(false);
                            }}
                          >
                            <LuLanguages size={15} color="#38bdf8" />
                            <span>
                              Mặt trước: {qzFrontLang === 'en' ? 'Tiếng Anh' : 'Tiếng Việt'}
                            </span>
                          </button>
                        </div>
                      </div>

                      <button
                        type="button"
                        className="qz-action-btn cta-next-mode"
                        onClick={() => {
                          setQuizletMode('learn');
                          if (!qzLearnCurrent && qzLearnQueue.length > 0) {
                            setQzLearnCurrent(
                              buildLearnQuestion(
                                vocabList,
                                qzLearnQueue,
                                qzLearnMastered.length
                              )
                            );
                          }
                        }}
                      >
                        <LuBrainCircuit size={18} />
                        <span>
                          Con đã xem xong thẻ? Chuyển sang Phần 2: HỌC THUỘC TỪ (Learn)
                        </span>
                        <LuArrowRight size={18} />
                      </button>
                    </div>

                    <div className="kid-section-card">
                      <div className="kid-section-header">
                        <div className="kid-section-title">
                          <LuListChecks size={18} color="#fb923c" />
                          <span>
                            Toàn bộ thuật ngữ trong bài học này ({vocabList.length} từ)
                          </span>
                        </div>
                        <span
                          className="kid-section-badge"
                          style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}
                        >
                          <LuVolume2 size={13} />
                          <span>Bấm để nghe đọc</span>
                        </span>
                      </div>
                      <div className="qz-terms-list">
                        {vocabList.map((v, i) => (
                          <div key={v.word + i} className="qz-term-row">
                            <div className="qz-term-en">
                              {i + 1}. {v.word}
                            </div>
                            <div className="qz-term-vi">{v.meaning}</div>
                            <button
                              type="button"
                              className="qz-action-btn"
                              onClick={e => speakEnglishWord(v.word, e)}
                            >
                              <LuVolume2 size={14} color="#38bdf8" />
                              <span>Đọc</span>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {/* CHẾ ĐỘ 2: HỌC (QUIZLET ADAPTIVE LEARN) */}
                {quizletMode === 'learn' && (
                  <div className="qz-learn-box">
                    <div className="qz-learn-progress-header">
                      <div
                        style={{
                          fontWeight: 900,
                          color: '#6ee7b7',
                          fontSize: '1.02rem',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 8
                        }}
                      >
                        <LuBrainCircuit size={20} color="#34d399" />
                        <span>Phần 2: Chế độ Học Thông Minh (Quizlet Learn)</span>
                      </div>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                        <span
                          className="kid-section-badge"
                          style={{
                            background: 'rgba(56, 189, 248, 0.2)',
                            color: '#38bdf8',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 5
                          }}
                        >
                          <LuBookOpen size={13} />
                          <span>Đang học: {qzLearnQueue.length} từ</span>
                        </span>
                        <span
                          className="kid-section-badge"
                          style={{
                            background: 'rgba(16, 185, 129, 0.25)',
                            color: '#6ee7b7',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 5
                          }}
                        >
                          <LuCircleCheck size={13} />
                          <span>
                            Đã nắm vững: {qzLearnMastered.length}/{vocabList.length} từ (
                            {vocabList.length > 0
                              ? Math.round((qzLearnMastered.length / vocabList.length) * 100)
                              : 100}
                            %)
                          </span>
                        </span>
                      </div>
                    </div>

                    <div className="qz-learn-bar-track">
                      <div
                        className="qz-learn-bar-fill"
                        style={{
                          width: `${
                            vocabList.length > 0
                              ? Math.round((qzLearnMastered.length / vocabList.length) * 100)
                              : 100
                          }%`
                        }}
                      />
                    </div>

                    {qzLearnMastered.length >= vocabList.length || !qzLearnCurrent ? (
                      <div
                        style={{
                          textAlign: 'center',
                          padding: '26px 16px',
                          background: '#0f172a',
                          borderRadius: 14,
                          border: '2px solid #10b981'
                        }}
                      >
                        <div
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 12,
                            marginBottom: 10
                          }}
                        >
                          <LuTrophy size={44} color="#fbbf24" />
                          <LuSparkles size={36} color="#34d399" />
                        </div>
                        <div
                          style={{
                            fontSize: '1.25rem',
                            fontWeight: 900,
                            color: '#6ee7b7',
                            marginBottom: 6
                          }}
                        >
                          Xuất sắc! Con đã nắm vững 100% ({vocabList.length}/{vocabList.length})
                          từ vựng của bài này!
                        </div>
                        <div
                          style={{
                            fontSize: '0.92rem',
                            color: '#cbd5e1',
                            marginBottom: 18
                          }}
                        >
                          Giờ con đã sẵn sàng bước vào phần <b>3. Kiểm tra (Test)</b> để giành Cúp
                          hoàn thành bài học!
                        </div>
                        <div
                          style={{
                            display: 'flex',
                            gap: 12,
                            justifyContent: 'center',
                            flexWrap: 'wrap'
                          }}
                        >
                          <button
                            type="button"
                            className="qz-action-btn"
                            onClick={handleResetLearn}
                          >
                            <LuRotateCcw size={15} />
                            <span>Học ôn lại lần nữa</span>
                          </button>
                          <button
                            type="button"
                            className="qz-action-btn cta-next-mode"
                            style={{ width: 'auto', padding: '12px 24px' }}
                            onClick={() => setQuizletMode('test')}
                          >
                            <LuClipboardCheck size={18} />
                            <span>Chuyển sang Phần 3: LÀM BÀI KIỂM TRA (Test)</span>
                            <LuArrowRight size={18} />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="qz-learn-prompt-card">
                          <div
                            className="qz-learn-label"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                          >
                            <LuLanguages size={14} color="#38bdf8" />
                            <span>
                              {qzLearnCurrent.promptType === 'en2vi'
                                ? 'Thuật ngữ VEXcode này có nghĩa Tiếng Việt là gì?'
                                : 'Trong VEXcode, từ Tiếng Anh nào mang ý nghĩa bên dưới?'}
                            </span>
                          </div>
                          <div className="qz-learn-question-word">
                            <span>
                              {qzLearnCurrent.promptType === 'en2vi'
                                ? qzLearnCurrent.word
                                : qzLearnCurrent.meaning}
                            </span>
                            <button
                              type="button"
                              className="quizlet-speak-btn"
                              style={{ position: 'static' }}
                              onClick={e => speakEnglishWord(qzLearnCurrent.word, e)}
                            >
                              <LuVolume2 size={15} />
                              <span>Nghe từ tiếng Anh</span>
                            </button>
                          </div>
                          {qzLearnCurrent.example && qzLearnCurrent.promptType === 'en2vi' && (
                            <div className="qz-big-example">
                              Gợi ý khối lệnh: <code>{qzLearnCurrent.example}</code>
                            </div>
                          )}
                        </div>

                        <div
                          style={{
                            fontSize: '0.86rem',
                            fontWeight: 800,
                            color: '#cbd5e1',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 6
                          }}
                        >
                          <LuTarget size={15} color="#fb923c" />
                          <span>Chọn đáp án đúng nhất trong 4 thẻ dưới đây:</span>
                        </div>

                        <div className="qz-learn-options">
                          {qzLearnCurrent.options.map((opt, idx) => {
                            let stateClass = '';
                            if (qzLearnFeedback) {
                              if (opt === qzLearnCurrent.correctOption) stateClass = 'correct';
                              else if (
                                opt === qzLearnFeedback.selectedOption &&
                                !qzLearnFeedback.isCorrect
                              ) {
                                stateClass = 'wrong';
                              }
                            }
                            return (
                              <button
                                key={opt + idx}
                                type="button"
                                className={`qz-learn-opt-btn ${stateClass}`}
                                disabled={Boolean(qzLearnFeedback)}
                                onClick={() => handleSelectLearnOption(opt)}
                              >
                                <span className="qz-learn-opt-num">{idx + 1}</span>
                                <span>{opt}</span>
                              </button>
                            );
                          })}
                        </div>

                        {qzLearnFeedback && (
                          <div
                            className={`qz-learn-feedback ${
                              qzLearnFeedback.isCorrect ? 'correct' : 'wrong'
                            }`}
                          >
                            {qzLearnFeedback.isCorrect ? (
                              <div>
                                <div
                                  style={{
                                    fontSize: '1.02rem',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 6
                                  }}
                                >
                                  <LuCircleCheck size={18} color="#34d399" />
                                  <span>Chính xác! Con giỏi lắm!</span>
                                </div>
                                <div
                                  style={{
                                    fontSize: '0.86rem',
                                    color: '#d1fae5',
                                    marginTop: 2
                                  }}
                                >
                                  <b>{qzLearnCurrent.word}</b> ={' '}
                                  <b>{qzLearnCurrent.meaning}</b> (Đã cộng vào danh sách từ nắm
                                  vững!)
                                </div>
                              </div>
                            ) : (
                              <div>
                                <div
                                  style={{
                                    fontSize: '1.02rem',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 6
                                  }}
                                >
                                  <LuLightbulb size={18} color="#fbbf24" />
                                  <span>Chưa đúng rồi! Hãy ghi nhớ đáp án đúng nhé:</span>
                                </div>
                                <div
                                  style={{
                                    fontSize: '0.9rem',
                                    color: '#ffffff',
                                    marginTop: 4
                                  }}
                                >
                                  Từ <b>&quot;{qzLearnCurrent.word}&quot;</b> có nghĩa là{' '}
                                  <b>&quot;{qzLearnCurrent.meaning}&quot;</b>. Hệ thống sẽ hỏi
                                  lại từ này ở cuối vòng để con thuộc bài nhé!
                                </div>
                              </div>
                            )}

                            <button
                              type="button"
                              className={`qz-action-btn ${
                                qzLearnFeedback.isCorrect ? 'primary' : ''
                              }`}
                              onClick={handleNextLearnStep}
                            >
                              <span>
                                {qzLearnFeedback.isCorrect
                                  ? 'Từ tiếp theo'
                                  : 'Đã hiểu, tiếp tục'}
                              </span>
                              <LuArrowRight size={15} />
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}

                {/* CHẾ ĐỘ 3: KIỂM TRA (QUIZLET TEST) */}
                {quizletMode === 'test' && (
                  <>
                    {kidTestGraded && kidScorePercent !== null && (
                      <div
                        className={`qz-test-score-banner ${
                          kidScorePercent === 100 ? 'passed' : 'failed'
                        }`}
                      >
                        <div>
                          <div
                            style={{
                              fontSize: '1.12rem',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 8
                            }}
                          >
                            {kidScorePercent === 100 ? (
                              <LuTrophy size={22} color="#fbbf24" />
                            ) : (
                              <LuTriangleAlert size={22} color="#f59e0b" />
                            )}
                            <span>
                              {kidScorePercent === 100
                                ? 'KẾT QUẢ KIỂM TRA: ĐẠT 100% TUYỆT ĐỐI!'
                                : `KẾT QUẢ BÀI KIỂM TRA: ĐẠT ${kidScorePercent}%`}
                            </span>
                          </div>
                          <div style={{ fontSize: '0.86rem', opacity: 0.92, marginTop: 3 }}>
                            {kidScorePercent === 100
                              ? 'Chúc mừng con đã hoàn thành xuất sắc bài Kiểm tra từ vựng & khối lệnh VEXcode!'
                              : 'Các câu tô viền đỏ là chưa đúng hoặc chưa chọn. Con hãy bấm sửa lại đáp án rồi nộp lại nhé!'}
                          </div>
                        </div>
                        <span className="qz-progress-pill" style={{ fontSize: '1rem' }}>
                          Điểm: {kidScorePercent}%
                        </span>
                      </div>
                    )}

                    {/* Phần A: Đúng / Sai (True / False) */}
                    {tfQuestions.length > 0 && (
                      <div className="kid-section-card">
                        <div className="kid-section-header">
                          <div className="kid-section-title">
                            <LuScale size={18} color="#fb923c" />
                            <span>
                              Phần A (Đúng / Sai): Kiểm Tra Nhanh Nghĩa Từ Vựng
                            </span>
                          </div>
                          <span className="kid-section-badge">
                            Đã chọn {answeredTfCount}/{tfQuestions.length} câu
                          </span>
                        </div>
                        <div className="kid-quiz-list">
                          {tfQuestions.map((tf, idx) => {
                            const sel = tfAnswers[tf.id] || '';
                            const isCorrect = sel === tf.answer;
                            const gradedClass = kidTestGraded
                              ? isCorrect
                                ? 'graded-correct'
                                : 'graded-wrong'
                              : '';
                            return (
                              <div
                                key={tf.id}
                                className={`kid-quiz-item ${
                                  sel ? 'answered' : ''
                                } ${gradedClass}`}
                              >
                                <div
                                  className="kid-quiz-prompt"
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    flexWrap: 'wrap',
                                    gap: 8
                                  }}
                                >
                                  <span>
                                    Câu A{idx + 1}. {tf.prompt}
                                  </span>
                                  <button
                                    type="button"
                                    className="qz-action-btn"
                                    style={{ padding: '4px 10px', fontSize: '0.76rem' }}
                                    onClick={e => speakEnglishWord(tf.word, e)}
                                  >
                                    <LuVolume2 size={13} color="#38bdf8" />
                                    <span>Nghe từ</span>
                                  </button>
                                </div>
                                <div className="qz-tf-grid">
                                  {(['Đúng', 'Sai'] as const).map(choice => {
                                    const isSel = sel === choice;
                                    return (
                                      <button
                                        key={choice}
                                        type="button"
                                        className={`kid-option-btn ${
                                          isSel ? 'selected' : ''
                                        }`}
                                        onClick={() =>
                                          setTfAnswers(prev => ({
                                            ...prev,
                                            [tf.id]: choice
                                          }))
                                        }
                                      >
                                        {choice === 'Đúng' ? (
                                          <LuThumbsUp
                                            size={16}
                                            color={isSel ? '#ffffff' : '#34d399'}
                                          />
                                        ) : (
                                          <LuThumbsDown
                                            size={16}
                                            color={isSel ? '#ffffff' : '#f87171'}
                                          />
                                        )}
                                        <span>
                                          {choice === 'Đúng'
                                            ? 'Đúng (True)'
                                            : 'Sai (False)'}
                                        </span>
                                      </button>
                                    );
                                  })}
                                </div>
                                {kidTestGraded && !isCorrect && (
                                  <div
                                    style={{
                                      marginTop: 8,
                                      fontSize: '0.82rem',
                                      fontWeight: 800,
                                      color: '#fca5a5',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: 6
                                    }}
                                  >
                                    <LuLightbulb size={15} color="#fbbf24" />
                                    <span>
                                      Gợi ý sửa: Đáp án đúng là <b>&quot;{tf.answer}&quot;</b>{' '}
                                      (vì <b>{tf.word}</b> có nghĩa là{' '}
                                      <b>&quot;{tf.actualMeaning}&quot;</b>).
                                    </span>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Phần B: Trắc nghiệm 4 đáp án (Multiple Choice) */}
                    <div className="kid-section-card">
                      <div className="kid-section-header">
                        <div className="kid-section-title">
                          <LuTarget size={18} color="#38bdf8" />
                          <span>Phần B (Trắc nghiệm): Chọn Thuật Ngữ VEXcode Đúng</span>
                        </div>
                        <span className="kid-section-badge">
                          Đã chọn {answeredQuizCount}/{quizList.length} câu
                        </span>
                      </div>
                      <div className="kid-quiz-list">
                        {quizList.map(q => {
                          const selectedVal = kidQuizAnswers[q.id] || '';
                          const isCorrect =
                            selectedVal.toLowerCase() === String(q.answer).toLowerCase();
                          const gradedClass = kidTestGraded
                            ? isCorrect
                              ? 'graded-correct'
                              : 'graded-wrong'
                            : '';
                          return (
                            <div
                              key={q.id}
                              className={`kid-quiz-item ${
                                selectedVal ? 'answered' : ''
                              } ${gradedClass}`}
                            >
                              <div className="kid-quiz-prompt">{q.prompt}</div>
                              <div className="kid-options-grid">
                                {q.options.map(opt => {
                                  const isSel = selectedVal === opt;
                                  return (
                                    <button
                                      key={opt}
                                      type="button"
                                      className={`kid-option-btn ${
                                        isSel ? 'selected' : ''
                                      }`}
                                      onClick={() => {
                                        if (/^[a-zA-Z\s-]+$/.test(opt)) {
                                          speakEnglishWord(opt);
                                        }
                                        setKidQuizAnswers(prev => ({
                                          ...prev,
                                          [q.id]: opt
                                        }));
                                      }}
                                    >
                                      {isSel ? (
                                        <LuCircleCheck size={16} color="#ffffff" />
                                      ) : (
                                        <LuCircleDot size={14} color="#38bdf8" />
                                      )}
                                      <span>{opt}</span>
                                    </button>
                                  );
                                })}
                              </div>
                              {kidTestGraded && !isCorrect && (
                                <div
                                  style={{
                                    marginTop: 8,
                                    fontSize: '0.82rem',
                                    fontWeight: 800,
                                    color: '#fca5a5',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 6
                                  }}
                                >
                                  <LuLightbulb size={15} color="#fbbf24" />
                                  <span>Gợi ý: Hãy kiểm tra lại câu này nhé!</span>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Phần C: Ghép Khối Lệnh VEXcode GO */}
                    {puzzle && (
                      <>
                        <div className="kid-section-card">
                          <div className="kid-section-header">
                            <div className="kid-section-title">
                              <LuPuzzle size={18} color="#fb923c" />
                              <span>
                                Phần C (Ghép thẻ khối lệnh): Lắp Ráp Khối Lệnh VEXcode
                              </span>
                            </div>
                            <span className="kid-section-badge">
                              Đã lắp {kidPuzzleSlots.filter(Boolean).length}/
                              {puzzle.slotsCount} mảnh
                            </span>
                          </div>
                          <div className="kid-puzzle-instruction">{puzzle.instruction}</div>

                          <div className={`kid-vex-block-frame ${puzzle.blockColor || 'motion'}`}>
                            <span
                              className="kid-static-token"
                              style={{ display: 'inline-flex', alignItems: 'center' }}
                            >
                              <TbRobot size={22} />
                            </span>
                            {puzzle.prefix && (
                              <span className="kid-static-token">{puzzle.prefix}</span>
                            )}
                            {kidPuzzleSlots.map((slotVal, idx) => (
                              <button
                                key={idx}
                                type="button"
                                className={`kid-slot-btn ${slotVal ? 'filled' : ''}`}
                                title={
                                  slotVal
                                    ? 'Bấm để tháo mảnh ghép này ra'
                                    : `Ô trống số ${idx + 1}`
                                }
                                onClick={() => {
                                  if (slotVal !== null) {
                                    const next = [...kidPuzzleSlots];
                                    next[idx] = null;
                                    setKidPuzzleSlots(next);
                                  }
                                }}
                              >
                                {slotVal ? (
                                  <>
                                    <span>{slotVal}</span>
                                    <LuX size={14} />
                                  </>
                                ) : (
                                  `Ô số ${idx + 1}`
                                )}
                              </button>
                            ))}
                            {puzzle.suffix && (
                              <span className="kid-static-token">{puzzle.suffix}</span>
                            )}
                          </div>

                          <div className="kid-wordbank-box">
                            <div
                              className="kid-wordbank-label"
                              style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                            >
                              <LuPuzzle size={14} color="#fb923c" />
                              <span>
                                Bấm vào các mảnh từ bên dưới để lắp vào ô trống ở trên (bấm vào
                                ô đã lắp để tháo ra):
                              </span>
                            </div>
                            {puzzle.wordBank.map(word => {
                              const isUsed = kidPuzzleSlots.includes(word);
                              return (
                                <button
                                  key={word}
                                  type="button"
                                  className="kid-wordbank-btn"
                                  disabled={isUsed}
                                  onClick={() => {
                                    const emptyIdx = kidPuzzleSlots.findIndex(s => s === null);
                                    if (emptyIdx !== -1) {
                                      if (/^[a-zA-Z0-9\s-]+$/.test(word)) {
                                        speakEnglishWord(word);
                                      }
                                      const next = [...kidPuzzleSlots];
                                      next[emptyIdx] = word;
                                      setKidPuzzleSlots(next);
                                    }
                                  }}
                                >
                                  <LuPlus size={14} color="#fb923c" />
                                  <span>{word}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        <div className="kid-robot-stage">
                          <div>
                            <div
                              style={{
                                fontWeight: 900,
                                color: '#fb923c',
                                fontSize: '0.9rem',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 6
                              }}
                            >
                              <TbRobot size={18} color="#fb923c" />
                              <span>Sa Bàn Robot VEX GO</span>
                            </div>
                            <div
                              className="kid-robot-status-text"
                              style={{
                                color:
                                  robotAnimState === 'success'
                                    ? '#34d399'
                                    : robotAnimState === 'warn'
                                    ? '#fbbf24'
                                    : '#38bdf8'
                              }}
                            >
                              {robotAnimState === 'success' ? (
                                <span
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 6
                                  }}
                                >
                                  <LuCircleCheck size={16} color="#34d399" />
                                  <span>
                                    Robot VEX GO đã nhận lệnh và chạy về đích thành công!
                                  </span>
                                </span>
                              ) : robotAnimState === 'warn' ? (
                                <span
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 6
                                  }}
                                >
                                  <LuTriangleAlert size={16} color="#fbbf24" />
                                  <span>
                                    Robot đang chờ con trả lời đúng hết các câu và lắp đúng khối
                                    lệnh!
                                  </span>
                                </span>
                              ) : (
                                'Hoàn thành bài Kiểm tra rồi bấm nút Chấm điểm bên dưới để Robot chạy nhé!'
                              )}
                            </div>
                          </div>
                          <div className="kid-robot-track">
                            <div
                              className="kid-robot-avatar"
                              style={{
                                transform:
                                  robotAnimState === 'success'
                                    ? 'translateX(140px)'
                                    : robotAnimState === 'warn'
                                    ? 'translateX(45px) rotate(-8deg)'
                                    : 'translateX(0px)'
                              }}
                            >
                              <TbRobot
                                size={30}
                                color={
                                  robotAnimState === 'success'
                                    ? '#34d399'
                                    : robotAnimState === 'warn'
                                    ? '#fbbf24'
                                    : '#fb923c'
                                }
                              />
                              <LuZap size={18} color="#38bdf8" />
                            </div>
                            <div
                              style={{
                                marginLeft: 'auto',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 6
                              }}
                            >
                              <LuMagnet size={22} color="#c084fc" />
                              <LuFlag size={22} color="#34d399" />
                            </div>
                          </div>
                        </div>
                      </>
                    )}

                    <button
                      type="button"
                      className="qz-submit-test-btn"
                      onClick={handleSubmitCode}
                    >
                      <LuRocket size={20} />
                      <span>NỘP BÀI KIỂM TRA &amp; CHẤM ĐIỂM NGAY</span>
                    </button>
                  </>
                )}
                    </>
                  )}
                </div>
              </div>
            ) : (
              <textarea
                id="codeTextarea"
                spellCheck={false}
                value={code}
                onChange={e => setCode(e.target.value)}
                onKeyDown={e => {
                  if (e.ctrlKey && e.key === 'Enter') {
                    e.preventDefault();
                    handleRunCode();
                  }
                }}
                placeholder="// Viết code tại đây..."
              />
            )}
          </div>

          {/* Output Console & Test Cases (Chỉ hiển thị cho các lớp code: Web, Python, Unity) */}
          {classId !== 'Robotics' && (
            <div className="output-workspace">
              <div className="output-header-tabs">
                <div className="output-tab-group">
                  <button
                    type="button"
                    className={`output-tab-btn ${outputTab === 'console' ? 'active' : ''}`}
                    onClick={() => setOutputTab('console')}
                  >
                    <LuTerminal size={15} />
                    <span>Màn hình Console</span>
                  </button>
                  <button
                    type="button"
                    className={`output-tab-btn ${outputTab === 'testcases' ? 'active' : ''}`}
                    onClick={() => setOutputTab('testcases')}
                  >
                    <LuFlaskConical size={15} />
                    <span>
                      Tiêu chí chấm điểm ({(currentLesson?.testCases || []).length})
                    </span>
                  </button>
                </div>
                <div className="output-right-actions">
                  <button
                    type="button"
                    className="btn-reset-code"
                    style={{ fontSize: '0.75rem' }}
                    onClick={() => setConsoleLogs([])}
                  >
                    <LuEraser size={13} />
                    <span>Xóa màn hình</span>
                  </button>
                </div>
              </div>

              <div className="output-body">
                {outputTab === 'console' ? (
                  <div className="console-output">
                    {consoleLogs.map((line, i) => (
                      <div key={i} className={`console-line ${line.type}`}>
                        {line.text}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="test-cases-list">
                    {gradedResults
                      ? gradedResults.map((tc, i) => (
                          <div
                            key={i}
                            className={`test-case-item ${tc.passed ? 'passed' : 'failed'}`}
                          >
                            <span
                              className="tc-icon"
                              style={{ color: tc.passed ? '#34d399' : '#f87171' }}
                            >
                              {tc.passed ? <LuCircleCheck size={18} /> : <LuCircleX size={18} />}
                            </span>
                            <div className="tc-name">
                              <div>{tc.name}</div>
                              <div
                                style={{
                                  fontSize: '0.78rem',
                                  color: tc.passed ? '#34d399' : '#f87171'
                                }}
                              >
                                {tc.message}
                              </div>
                            </div>
                            <span
                              className={`tc-status ${tc.passed ? 'passed' : 'failed'}`}
                            >
                              {tc.passed ? 'ĐẠT' : 'CHƯA ĐẠT'}
                            </span>
                          </div>
                        ))
                      : (currentLesson?.testCases || []).map((tc, i) => (
                          <div key={i} className="test-case-item">
                            <span className="tc-icon" style={{ color: 'var(--text-muted)' }}>
                              <LuFlaskConical size={16} />
                            </span>
                            <span className="tc-name">{tc.name}</span>
                            <span className="tc-status" style={{ color: 'var(--text-muted)' }}>
                              Chờ kiểm tra
                            </span>
                          </div>
                        ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </section>
      </main>

      {/* Drawer Mục lục Bài học */}
      <div
        className={`drawer-overlay ${drawerOpen ? 'active' : ''}`}
        onClick={() => setDrawerOpen(false)}
      />
      <aside className={`tracks-drawer ${drawerOpen ? 'active' : ''}`}>
        <div className="drawer-header">
          <h3 style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <LuBookOpen size={18} />
            <span>Danh Sách Bài Học MindX</span>
          </h3>
          <button
            type="button"
            className="btn-close-drawer"
            onClick={() => setDrawerOpen(false)}
          >
            &times;
          </button>
        </div>
        <div className="drawer-content">
          {lessons.map((l, idx) => {
            const prog = studentProgress[l.id];
            const isPassed = prog && prog.status === 'passed';
            const isActive = idx === currentLessonIndex;
            return (
              <div
                key={l.id}
                className={`drawer-item ${isActive ? 'active' : ''}`}
                onClick={() => handleSelectLesson(idx)}
              >
                <div>
                  <div
                    className="drawer-item-title"
                    style={{ display: 'flex', alignItems: 'center', gap: 8 }}
                  >
                    <span style={{ color: isPassed ? '#34d399' : 'var(--text-muted)' }}>
                      {isPassed ? <LuCircleCheck size={16} /> : <LuFileCode size={16} />}
                    </span>
                    <span>
                      Bài {l.order}: {l.title}
                    </span>
                  </div>
                  <div className="drawer-item-cat">{l.category}</div>
                </div>
                <div
                  style={{
                    fontSize: '0.8rem',
                    fontWeight: 800,
                    color: isPassed ? '#34d399' : 'var(--text-muted)'
                  }}
                >
                  {isPassed ? 'Đã xong' : 'Chưa hoàn thành'}
                </div>
              </div>
            );
          })}
        </div>
      </aside>

      {/* Modal Chúc mừng hoàn thành bài tập */}
      <div className={`modal-overlay ${showCongrats ? 'active' : ''}`}>
        <div className="congrats-card">
          <div
            className="congrats-icon"
            style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}
          >
            <LuTrophy size={56} color="#fbbf24" />
          </div>
          <h2>XUẤT SẮC!</h2>
          <p>
            {currentLessonIndex === lessons.length - 1
              ? `Chúc mừng bạn đã xuất sắc hoàn thành toàn bộ khóa học ${classId} tại MindX!`
              : 'Bạn đã vượt qua toàn bộ tiêu chí kiểm tra của thử thách này!'}
          </p>
          <button
            type="button"
            className="btn-next-lesson"
            onClick={() => {
              setShowCongrats(false);
              if (currentLessonIndex < lessons.length - 1) {
                handleSelectLesson(currentLessonIndex + 1);
              } else {
                setDrawerOpen(true);
              }
            }}
          >
            {currentLessonIndex === lessons.length - 1 ? (
              <>
                <LuTrophy size={18} color="#fbbf24" />
                <span>XEM TIẾN ĐỘ TỔNG KẾT</span>
              </>
            ) : (
              <>
                <span>CHINH PHỤC BÀI TIẾP THEO</span>
                <LuArrowRight size={18} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
