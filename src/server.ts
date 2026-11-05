import express, { Request, Response } from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { exec } from 'child_process';
import {
  ClassInfo,
  ClassType,
  Lesson,
  Student,
  StudentStats,
  LoginRequestBody,
  CreateStudentRequestBody,
  SubmissionRequestBody
} from './types';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Đường dẫn tương đối từ src/ hoặc dist/ ra thư mục gốc dự án
const PROJECT_ROOT = path.join(__dirname, '..');
const PUBLIC_DIR = path.join(PROJECT_ROOT, 'public');
const DATA_DIR = path.join(PROJECT_ROOT, 'data');
const STUDENTS_FILE = path.join(DATA_DIR, 'students.json');

const VALID_CLASSES: ClassType[] = ['Web', 'Python', 'Unity', 'Robotics'];

const LESSONS_FILES: Record<ClassType, string> = {
  Web: path.join(DATA_DIR, 'lessons_web.json'),
  Python: path.join(DATA_DIR, 'lessons_python.json'),
  Unity: path.join(DATA_DIR, 'lessons_unity.json'),
  Robotics: path.join(DATA_DIR, 'lessons_robotics.json')
};

app.use(express.static(PUBLIC_DIR));

// Đảm bảo thư mục dữ liệu tồn tại
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function readJSON<T>(filePath: string, defaultValue: T): T {
  try {
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify(defaultValue, null, 2), 'utf-8');
      return defaultValue;
    }
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content) as T;
  } catch (err) {
    console.error(`Lỗi đọc file ${filePath}:`, err);
    return defaultValue;
  }
}

function writeJSON<T>(filePath: string, data: T): boolean {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error(`Lỗi ghi file ${filePath}:`, err);
    return false;
  }
}

// Danh mục 4 bộ môn học tại MindX
const CLASSES_CONFIG: Record<ClassType, { name: string; icon: string; description: string }> = {
  Python: {
    name: 'Lớp Lập Trình Python',
    icon: 'python',
    description: 'Tư duy logic, thuật toán và giải bài toán với Python 3'
  },
  Web: {
    name: 'Lớp Lập Trình Web (JavaScript)',
    icon: 'web',
    description: 'Xây dựng giao diện web tương tác và ứng dụng hiện đại'
  },
  Unity: {
    name: 'Lớp Phát Triển Game Unity (C#)',
    icon: 'unity',
    description: 'Sáng tạo thế giới game 2D/3D và lập trình logic game C#'
  },
  Robotics: {
    name: 'Lớp Lập Trình Robot (VEX GO & VEX IQ)',
    icon: 'robotics',
    description: 'Điều khiển robot VEX GO & VEX IQ, cảm biến và giải bài toán tự hành'
  }
};

// 1. API Lấy danh sách 4 lớp học MindX
app.get('/api/classes', (_req: Request, res: Response) => {
  const students = readJSON<Student[]>(STUDENTS_FILE, []);
  
  const classes: ClassInfo[] = (Object.keys(CLASSES_CONFIG) as ClassType[]).map(id => {
    const config = CLASSES_CONFIG[id];
    const studentCount = students.filter(s => s.classId === id).length;
    return {
      id,
      name: config.name,
      icon: config.icon,
      description: config.description,
      studentCount
    };
  });

  res.json({ success: true, classes });
});

// 2. API Lấy danh sách bài học (Phân biệt rõ ràng theo từng lớp ?class=Web|Python|Unity|Robotics|All)
app.get('/api/lessons', (req: Request, res: Response) => {
  const classParam = (req.query.class as string) || 'Web';

  if (classParam === 'All') {
    const lessonsByClass: Record<ClassType, Lesson[]> = {
      Web: readJSON<Lesson[]>(LESSONS_FILES.Web, []),
      Python: readJSON<Lesson[]>(LESSONS_FILES.Python, []),
      Unity: readJSON<Lesson[]>(LESSONS_FILES.Unity, []),
      Robotics: readJSON<Lesson[]>(LESSONS_FILES.Robotics, [])
    };
    res.json({
      success: true,
      classId: 'All',
      lessons: lessonsByClass.Web,
      lessonsByClass
    });
    return;
  }

  const targetClass: ClassType = VALID_CLASSES.includes(classParam as ClassType)
    ? (classParam as ClassType)
    : 'Web';
  
  const targetFile = LESSONS_FILES[targetClass];
  const lessons = readJSON<Lesson[]>(targetFile, []);

  res.json({ success: true, classId: targetClass, lessons });
});

// 3. API Lấy danh sách học sinh (Có hỗ trợ lọc theo lớp ?class=Web|Python|Unity|Robotics)
app.get('/api/students', (req: Request, res: Response) => {
  const filterClass = req.query.class as string | undefined;
  const students = readJSON<Student[]>(STUDENTS_FILE, []);

  let filtered = students;
  if (filterClass && VALID_CLASSES.includes(filterClass as ClassType)) {
    filtered = students.filter(s => s.classId === filterClass);
  }

  const studentStats: StudentStats[] = filtered.map((s: Student) => {
    const studentClass: ClassType = VALID_CLASSES.includes(s.classId) ? s.classId : 'Web';
    // Đọc danh sách bài học riêng của lớp học sinh đó để tính đúng tiến độ
    const classLessonsFile = LESSONS_FILES[studentClass];
    const classLessons = readJSON<Lesson[]>(classLessonsFile, []);
    const totalLessons = classLessons.length;
    const validLessonIds = new Set(classLessons.map(l => l.id));

    const passedCount = Object.entries(s.progress || {}).filter(
      ([lessonId, p]) => validLessonIds.has(lessonId) && p.status === 'passed'
    ).length;
    const percent = totalLessons > 0 ? Math.round((passedCount / totalLessons) * 100) : 0;
    return {
      ...s,
      classId: studentClass,
      passedCount,
      totalLessons,
      percent
    };
  });

  res.json({
    success: true,
    totalLessons: 7,
    currentFilter: filterClass || 'All',
    students: studentStats
  });
});

// 4. API Đăng nhập / Chọn học sinh vào học
const AVATARS = ['⚡', '🚀', '🧑‍💻', '🌟', '🤖', '👾', '🔥', '🎯', '✨', '🦊'];

app.post('/api/students/login', (req: Request<{}, {}, LoginRequestBody>, res: Response) => {
  const { studentId, name, classId } = req.body;
  const students = readJSON<Student[]>(STUDENTS_FILE, []);

  // TH1: Đăng nhập bằng ID học sinh đã có sẵn trong lớp
  if (studentId) {
    const student = students.find(s => s.id === studentId);
    if (!student) {
      res.status(404).json({ success: false, message: 'Không tìm thấy học sinh trong danh sách' });
      return;
    }
    student.lastActive = new Date().toISOString();
    writeJSON(STUDENTS_FILE, students);
    res.json({ success: true, student });
    return;
  }

  // TH2: Nhập tên và chọn lớp
  if (!name || !name.trim() || !classId) {
    res.status(400).json({ success: false, message: 'Vui lòng chọn lớp và nhập tên của bạn' });
    return;
  }

  const cleanName = name.trim();
  let student = students.find(s => s.name.toLowerCase() === cleanName.toLowerCase() && s.classId === classId);

  if (!student) {
    const randomAvatar = AVATARS[Math.floor(Math.random() * AVATARS.length)];
    student = {
      id: `std-${classId.toLowerCase()}-${Date.now()}`,
      name: cleanName,
      classId: classId as ClassType,
      avatar: randomAvatar,
      createdAt: new Date().toISOString(),
      lastActive: new Date().toISOString(),
      progress: {}
    };
    students.push(student);
    writeJSON(STUDENTS_FILE, students);
  } else {
    student.lastActive = new Date().toISOString();
    writeJSON(STUDENTS_FILE, students);
  }

  res.json({ success: true, student });
});

// 5. API Giáo viên thêm học sinh vào lớp
app.post('/api/students/create', (req: Request<{}, {}, CreateStudentRequestBody>, res: Response) => {
  const { name, classId } = req.body;
  if (!name || !name.trim() || !classId) {
    res.status(400).json({ success: false, message: 'Thiếu thông tin tên học sinh hoặc lớp học' });
    return;
  }

  const cleanName = name.trim();
  const students = readJSON<Student[]>(STUDENTS_FILE, []);

  const exists = students.find(s => s.name.toLowerCase() === cleanName.toLowerCase() && s.classId === classId);
  if (exists) {
    res.status(400).json({ success: false, message: `Học sinh "${cleanName}" đã có trong lớp ${classId}!` });
    return;
  }

  const randomAvatar = AVATARS[Math.floor(Math.random() * AVATARS.length)];
  const newStudent: Student = {
    id: `std-${classId.toLowerCase()}-${Date.now()}`,
    name: cleanName,
    classId: classId as ClassType,
    avatar: randomAvatar,
    createdAt: new Date().toISOString(),
    lastActive: new Date().toISOString(),
    progress: {}
  };

  students.push(newStudent);
  writeJSON(STUDENTS_FILE, students);

  res.json({ success: true, message: 'Đã thêm học sinh thành công!', student: newStudent });
});

// 6. API Giáo viên xóa học sinh
app.delete('/api/students/:id', (req: Request<{ id: string }>, res: Response) => {
  const { id } = req.params;
  const students = readJSON<Student[]>(STUDENTS_FILE, []);
  const newStudents = students.filter(s => s.id !== id);

  if (newStudents.length === students.length) {
    res.status(404).json({ success: false, message: 'Không tìm thấy học sinh để xóa' });
    return;
  }

  writeJSON(STUDENTS_FILE, newStudents);
  res.json({ success: true, message: 'Đã xóa học sinh khỏi danh sách lớp' });
});

// 7. API Nộp bài / Lưu tiến độ
app.post('/api/submissions', (req: Request<{}, {}, SubmissionRequestBody>, res: Response) => {
  const { studentId, lessonId, code, status } = req.body;

  if (!studentId || !lessonId) {
    res.status(400).json({ success: false, message: 'Thiếu thông tin nộp bài' });
    return;
  }

  const students = readJSON<Student[]>(STUDENTS_FILE, []);
  const studentIndex = students.findIndex(s => s.id === studentId);

  if (studentIndex === -1) {
    res.status(404).json({ success: false, message: 'Không tìm thấy học sinh' });
    return;
  }

  const student = students[studentIndex];
  if (!student.progress) student.progress = {};

  const prev = student.progress[lessonId] || { attempts: 0, status: 'in_progress', code: '', passedAt: null };
  const isPassed = status === 'passed';

  student.progress[lessonId] = {
    status: isPassed ? 'passed' : (prev.status === 'passed' ? 'passed' : 'failed'),
    code: code || '',
    attempts: (prev.attempts || 0) + 1,
    passedAt: isPassed ? (prev.passedAt || new Date().toISOString()) : prev.passedAt,
    lastSubmittedAt: new Date().toISOString()
  };

  student.lastActive = new Date().toISOString();

  students[studentIndex] = student;
  writeJSON(STUDENTS_FILE, students);

  res.json({
    success: true,
    message: isPassed ? 'Chúc mừng bạn đã hoàn thành bài học!' : 'Đã ghi nhận bài nộp',
    progress: student.progress[lessonId]
  });
});

// 8. API Chạy Python Code (Thực thi Python trên máy chủ cho lớp Python)
app.post('/api/execute/python', (req: Request, res: Response) => {
  const { code } = req.body;
  if (typeof code !== 'string') {
    res.status(400).json({ success: false, message: 'Thiếu mã nguồn Python' });
    return;
  }

  // Tạo file tạm thời để chạy an toàn
  const tempFile = path.join(os.tmpdir(), `mindx_py_${Date.now()}_${Math.random().toString(36).substring(7)}.py`);
  
  try {
    fs.writeFileSync(tempFile, code, 'utf-8');

    exec(`python "${tempFile}"`, { timeout: 4000 }, (error, stdout, stderr) => {
      // Dọn dẹp file tạm
      try { if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile); } catch (e) {}

      if (error && error.killed) {
        res.json({ success: false, error: 'Chương trình chạy quá thời gian (Time limit exceeded / vòng lặp vô tận)' });
        return;
      }

      if (stderr && stderr.trim()) {
        res.json({ success: false, error: stderr.trim(), stdout: stdout || '' });
        return;
      }

      res.json({ success: true, stdout: stdout || '' });
    });
  } catch (err: any) {
    try { if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile); } catch (e) {}
    res.status(500).json({ success: false, error: err.message });
  }
});

// 9. API Reset dữ liệu lớp học
app.post('/api/teacher/reset-all', (_req: Request, res: Response) => {
  writeJSON<Student[]>(STUDENTS_FILE, []);
  res.json({ success: true, message: 'Đã xóa dữ liệu để đón lớp học mới!' });
});

// Lấy IP mạng nội bộ LAN
function getLocalIP(): string {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    const ifaceList = interfaces[name];
    if (ifaceList) {
      for (const iface of ifaceList) {
        if (iface.family === 'IPv4' && !iface.internal) {
          return iface.address;
        }
      }
    }
  }
  return 'localhost';
}

app.listen(PORT, () => {
  const ip = getLocalIP();
  console.log(`\n======================================================`);
  console.log(`🔴 MINDX TECHNOLOGY SCHOOL - 4 BỘ MÔN: PYTHON, WEB, UNITY, ROBOTICS (VEX)`);
  console.log(`======================================================`);
  console.log(`👉 Link dành cho HỌC SINH (Máy này):       http://localhost:${PORT}`);
  console.log(`👉 Link cho HỌC SINH (Các máy cùng Wi-Fi): http://${ip}:${PORT}`);
  console.log(`👉 Link dành cho GIÁO VIÊN theo dõi:       http://localhost:${PORT}/teacher.html`);
  console.log(`======================================================\n`);
});
