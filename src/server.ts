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
const TEACHERS_FILE = path.join(DATA_DIR, 'teachers.json');

interface TeacherAccount {
  id: string;
  username: string;
  password: string;
  name: string;
  role: 'super_admin' | 'teacher';
  assignedClasses: ClassType[];
  createdAt: string;
}

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

// Helper tra cứu tên giáo viên từ teacherId
function resolveTeacherInfo(
  teacherId?: string,
  teacherName?: string
): { teacherId?: string; teacherName?: string } {
  if (!teacherId) return {};
  if (teacherName && teacherName.trim()) {
    return { teacherId, teacherName: teacherName.trim() };
  }
  const teachers = readJSON<TeacherAccount[]>(TEACHERS_FILE, []);
  const found = teachers.find(t => t.id === teacherId);
  return {
    teacherId,
    teacherName: found ? found.name : undefined
  };
}

// Helper áp dụng Bài Tập Về Nhà / Đề Thực Hành riêng của Giáo Viên phụ trách lớp đó
function applyTeacherHomeworkToLessons(lessons: any[], teacherId?: string): any[] {
  if (!teacherId || teacherId === 'default') return lessons;
  return lessons.map(lesson => {
    const copy = { ...lesson };
    if (
      copy.practiceAssignmentsByTeacher &&
      Array.isArray(copy.practiceAssignmentsByTeacher[teacherId]) &&
      copy.practiceAssignmentsByTeacher[teacherId].length > 0
    ) {
      copy.practiceAssignments = copy.practiceAssignmentsByTeacher[teacherId];
    }
    if (
      copy.homeworkByTeacher &&
      typeof copy.homeworkByTeacher[teacherId] === 'string' &&
      copy.homeworkByTeacher[teacherId].trim()
    ) {
      copy.homeworkNote = copy.homeworkByTeacher[teacherId];
    }
    return copy;
  });
}

// 2. API Lấy danh sách bài học (Phân biệt rõ ràng theo từng lớp ?class=Web|Python|Unity|Robotics|All&teacherId=...)
app.get('/api/lessons', (req: Request, res: Response) => {
  const classParam = (req.query.class as string) || 'Web';
  const teacherIdParam = req.query.teacherId as string | undefined;

  if (classParam === 'All') {
    const lessonsByClass: Record<ClassType, any[]> = {
      Web: applyTeacherHomeworkToLessons(readJSON<any[]>(LESSONS_FILES.Web, []), teacherIdParam),
      Python: applyTeacherHomeworkToLessons(readJSON<any[]>(LESSONS_FILES.Python, []), teacherIdParam),
      Unity: applyTeacherHomeworkToLessons(readJSON<any[]>(LESSONS_FILES.Unity, []), teacherIdParam),
      Robotics: applyTeacherHomeworkToLessons(readJSON<any[]>(LESSONS_FILES.Robotics, []), teacherIdParam)
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
  const rawLessons = readJSON<any[]>(targetFile, []);
  const lessons = applyTeacherHomeworkToLessons(rawLessons, teacherIdParam);

  res.json({ success: true, classId: targetClass, teacherId: teacherIdParam, lessons });
});

// 3. API Lấy danh sách học sinh (Có hỗ trợ lọc theo lớp ?class=... và theo giáo viên ?teacherId=...)
app.get('/api/students', (req: Request, res: Response) => {
  const filterClass = req.query.class as string | undefined;
  const filterTeacherId = req.query.teacherId as string | undefined;
  const students = readJSON<Student[]>(STUDENTS_FILE, []);

  let filtered = students;
  if (filterClass && VALID_CLASSES.includes(filterClass as ClassType)) {
    filtered = filtered.filter(s => s.classId === filterClass);
  }
  if (filterTeacherId) {
    filtered = filtered.filter(s => s.teacherId === filterTeacherId);
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
const AVATARS = ['user'];

app.post('/api/students/login', (req: Request<{}, {}, LoginRequestBody>, res: Response) => {
  const { studentId, name, classId, teacherId, teacherName } = req.body;
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

  // TH2: Nhập tên và chọn lớp + giáo viên giảng dạy
  if (!name || !name.trim() || !classId) {
    res.status(400).json({ success: false, message: 'Vui lòng chọn lớp và nhập tên của bạn' });
    return;
  }

  const cleanName = name.trim();
  const resolvedTeacher = resolveTeacherInfo(teacherId, teacherName);

  let student = students.find(
    s =>
      s.name.toLowerCase() === cleanName.toLowerCase() &&
      s.classId === classId &&
      (!resolvedTeacher.teacherId || s.teacherId === resolvedTeacher.teacherId)
  );

  if (!student) {
    const randomAvatar = AVATARS[Math.floor(Math.random() * AVATARS.length)];
    student = {
      id: `std-${classId.toLowerCase()}-${Date.now()}`,
      name: cleanName,
      classId: classId as ClassType,
      teacherId: resolvedTeacher.teacherId,
      teacherName: resolvedTeacher.teacherName,
      avatar: randomAvatar,
      createdAt: new Date().toISOString(),
      lastActive: new Date().toISOString(),
      progress: {}
    };
    students.push(student);
    writeJSON(STUDENTS_FILE, students);
  } else {
    if (resolvedTeacher.teacherId && !student.teacherId) {
      student.teacherId = resolvedTeacher.teacherId;
      student.teacherName = resolvedTeacher.teacherName;
    }
    student.lastActive = new Date().toISOString();
    writeJSON(STUDENTS_FILE, students);
  }

  res.json({ success: true, student });
});

// 5. API Giáo viên thêm học sinh vào lớp của mình
app.post('/api/students/create', (req: Request<{}, {}, CreateStudentRequestBody>, res: Response) => {
  const { name, classId, teacherId, teacherName } = req.body;
  if (!name || !name.trim() || !classId) {
    res.status(400).json({ success: false, message: 'Thiếu thông tin tên học sinh hoặc lớp học' });
    return;
  }

  const cleanName = name.trim();
  const resolvedTeacher = resolveTeacherInfo(teacherId, teacherName);
  const students = readJSON<Student[]>(STUDENTS_FILE, []);

  const exists = students.find(
    s =>
      s.name.toLowerCase() === cleanName.toLowerCase() &&
      s.classId === classId &&
      s.teacherId === resolvedTeacher.teacherId
  );
  if (exists) {
    res.status(400).json({ success: false, message: `Học sinh "${cleanName}" đã có trong lớp này!` });
    return;
  }

  const randomAvatar = AVATARS[Math.floor(Math.random() * AVATARS.length)];
  const newStudent: Student = {
    id: `std-${classId.toLowerCase()}-${Date.now()}`,
    name: cleanName,
    classId: classId as ClassType,
    teacherId: resolvedTeacher.teacherId,
    teacherName: resolvedTeacher.teacherName,
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

// 6b. API Admin cập nhật thông tin học sinh (Đổi tên, chuyển lớp, đổi giáo viên phụ trách)
app.put(
  '/api/students/:id',
  (
    req: Request<
      { id: string },
      {},
      { name?: string; classId?: ClassType; teacherId?: string; teacherName?: string }
    >,
    res: Response
  ) => {
    const { id } = req.params;
    const { name, classId, teacherId, teacherName } = req.body;
    const students = readJSON<Student[]>(STUDENTS_FILE, []);
    const idx = students.findIndex(s => s.id === id);

    if (idx === -1) {
      res.status(404).json({ success: false, message: 'Không tìm thấy học sinh' });
      return;
    }

    if (name && name.trim()) {
      students[idx].name = name.trim();
    }
    if (classId && VALID_CLASSES.includes(classId)) {
      students[idx].classId = classId;
    }
    if (teacherId !== undefined) {
      const resolved = resolveTeacherInfo(teacherId, teacherName);
      students[idx].teacherId = resolved.teacherId;
      students[idx].teacherName = resolved.teacherName;
    }

    writeJSON(STUDENTS_FILE, students);
    res.json({ success: true, message: 'Đã cập nhật thông tin học sinh!', student: students[idx] });
  }
);

// 6c. API Admin reset tiến độ của 1 học sinh
app.post('/api/students/:id/reset-progress', (req: Request<{ id: string }>, res: Response) => {
  const { id } = req.params;
  const students = readJSON<Student[]>(STUDENTS_FILE, []);
  const idx = students.findIndex(s => s.id === id);

  if (idx === -1) {
    res.status(404).json({ success: false, message: 'Không tìm thấy học sinh' });
    return;
  }

  students[idx].progress = {};
  writeJSON(STUDENTS_FILE, students);
  res.json({ success: true, message: `Đã đặt lại tiến độ học tập của ${students[idx].name}` });
});

// 6d. API Admin thêm nhanh danh sách nhiều học sinh cùng lúc (Bulk Create)
app.post(
  '/api/students/bulk-create',
  (
    req: Request<
      {},
      {},
      { names: string[]; classId: ClassType; teacherId?: string; teacherName?: string }
    >,
    res: Response
  ) => {
    const { names, classId, teacherId, teacherName } = req.body;
    if (!Array.isArray(names) || names.length === 0 || !classId || !VALID_CLASSES.includes(classId)) {
      res.status(400).json({ success: false, message: 'Vui lòng nhập danh sách tên học sinh và chọn lớp hợp lệ' });
      return;
    }

    const resolvedTeacher = resolveTeacherInfo(teacherId, teacherName);
    const students = readJSON<Student[]>(STUDENTS_FILE, []);
    let addedCount = 0;

    names.forEach((rawName, i) => {
      const cleanName = (rawName || '').trim();
      if (!cleanName) return;
      const exists = students.find(
        s =>
          s.name.toLowerCase() === cleanName.toLowerCase() &&
          s.classId === classId &&
          s.teacherId === resolvedTeacher.teacherId
      );
      if (!exists) {
        const randomAvatar = AVATARS[Math.floor(Math.random() * AVATARS.length)];
        students.push({
          id: `std-${classId.toLowerCase()}-${Date.now()}-${i}`,
          name: cleanName,
          classId,
          teacherId: resolvedTeacher.teacherId,
          teacherName: resolvedTeacher.teacherName,
          avatar: randomAvatar,
          createdAt: new Date().toISOString(),
          lastActive: new Date().toISOString(),
          progress: {}
        });
        addedCount++;
      }
    });

    writeJSON(STUDENTS_FILE, students);
    res.json({
      success: true,
      addedCount,
      message: `Đã thêm thành công ${addedCount} học sinh vào lớp ${classId}!`
    });
  }
);

// 6e. API Admin cập nhật nội dung bài học / từ vựng Quizlet / Bài tập về nhà theo từng Giáo viên
app.put('/api/admin/lessons/:classId/:lessonId', (req: Request<{ classId: string; lessonId: string }>, res: Response) => {
  const classId = req.params.classId as ClassType;
  const { lessonId } = req.params;

  if (!VALID_CLASSES.includes(classId)) {
    res.status(400).json({ success: false, message: 'Lớp học không hợp lệ' });
    return;
  }

  const filePath = LESSONS_FILES[classId];
  const lessons = readJSON<any[]>(filePath, []);
  const idx = lessons.findIndex(l => l.id === lessonId);

  if (idx === -1) {
    res.status(404).json({ success: false, message: 'Không tìm thấy bài học' });
    return;
  }

  const {
    title,
    category,
    theory,
    task,
    vocab,
    practiceAssignments,
    teacherId,
    homeworkNote
  } = req.body;

  if (typeof title === 'string' && title.trim()) lessons[idx].title = title.trim();
  if (typeof category === 'string' && category.trim()) lessons[idx].category = category.trim();
  if (typeof theory === 'string') lessons[idx].theory = theory;
  if (typeof task === 'string') lessons[idx].task = task;
  if (Array.isArray(vocab)) lessons[idx].vocab = vocab;

  // Nếu có truyền teacherId (Giáo viên giao Bài tập về nhà riêng cho lớp mình)
  if (teacherId && teacherId !== 'default') {
    if (Array.isArray(practiceAssignments)) {
      if (!lessons[idx].practiceAssignmentsByTeacher) {
        lessons[idx].practiceAssignmentsByTeacher = {};
      }
      lessons[idx].practiceAssignmentsByTeacher[teacherId] = practiceAssignments;
    }
    if (typeof homeworkNote === 'string') {
      if (!lessons[idx].homeworkByTeacher) {
        lessons[idx].homeworkByTeacher = {};
      }
      lessons[idx].homeworkByTeacher[teacherId] = homeworkNote;
    }
  } else {
    if (Array.isArray(practiceAssignments)) {
      lessons[idx].practiceAssignments = practiceAssignments;
    }
    if (typeof homeworkNote === 'string') {
      lessons[idx].homeworkNote = homeworkNote;
    }
  }

  writeJSON(filePath, lessons);
  res.json({
    success: true,
    message:
      teacherId && teacherId !== 'default'
        ? 'Đã lưu Bài Tập Về Nhà riêng cho lớp của thầy/cô thành công!'
        : 'Đã lưu cập nhật bài học thành công!',
    lesson: lessons[idx]
  });
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

// 9b. API Đăng nhập Tài khoản Giáo viên / Admin
app.post('/api/admin/login', (req: Request<{}, {}, { username?: string; password?: string }>, res: Response) => {
  const { username, password } = req.body;
  if (!username || !password) {
    res.status(400).json({ success: false, message: 'Vui lòng nhập tên đăng nhập và mật khẩu!' });
    return;
  }

  const teachers = readJSON<TeacherAccount[]>(TEACHERS_FILE, []);
  const found = teachers.find(
    t => t.username.toLowerCase() === username.trim().toLowerCase() && t.password === password
  );

  if (!found) {
    res.status(401).json({ success: false, message: 'Tên tài khoản hoặc mật khẩu không chính xác!' });
    return;
  }

  const { password: _pw, ...safeTeacher } = found;
  res.json({ success: true, teacher: safeTeacher });
});

// 9c. API Lấy danh sách tài khoản Giáo viên
app.get('/api/admin/teachers', (_req: Request, res: Response) => {
  const teachers = readJSON<TeacherAccount[]>(TEACHERS_FILE, []);
  const safeList = teachers.map(({ password: _pw, ...rest }) => rest);
  res.json({ success: true, teachers: safeList });
});

// 9d. API Cấp tài khoản mới cho Giáo viên
app.post(
  '/api/admin/teachers',
  (
    req: Request<
      {},
      {},
      { name?: string; username?: string; password?: string; assignedClasses?: ClassType[] }
    >,
    res: Response
  ) => {
    const { name, username, password, assignedClasses } = req.body;
    if (!name?.trim() || !username?.trim() || !password?.trim()) {
      res.status(400).json({
        success: false,
        message: 'Vui lòng nhập đầy đủ Họ tên, Tên đăng nhập và Mật khẩu!'
      });
      return;
    }

    const cleanClasses = (assignedClasses || []).filter(c => VALID_CLASSES.includes(c));
    if (cleanClasses.length === 0) {
      res.status(400).json({
        success: false,
        message: 'Vui lòng phân công ít nhất 1 lớp học cho giáo viên!'
      });
      return;
    }

    const teachers = readJSON<TeacherAccount[]>(TEACHERS_FILE, []);
    const cleanUser = username.trim().toLowerCase();
    if (teachers.some(t => t.username.toLowerCase() === cleanUser)) {
      res.status(400).json({
        success: false,
        message: `Tài khoản "${cleanUser}" đã tồn tại!`
      });
      return;
    }

    const newTeacher: TeacherAccount = {
      id: `tch-${Date.now()}`,
      username: cleanUser,
      password: password.trim(),
      name: name.trim(),
      role: 'teacher',
      assignedClasses: cleanClasses,
      createdAt: new Date().toISOString()
    };

    teachers.push(newTeacher);
    writeJSON(TEACHERS_FILE, teachers);

    const { password: _pw, ...safeTeacher } = newTeacher;
    res.json({
      success: true,
      message: `Đã cấp tài khoản cho ${newTeacher.name} thành công!`,
      teacher: safeTeacher
    });
  }
);

// 9e. API Cập nhật phân công lớp / mật khẩu Giáo viên
app.put(
  '/api/admin/teachers/:id',
  (
    req: Request<
      { id: string },
      {},
      { name?: string; password?: string; assignedClasses?: ClassType[] }
    >,
    res: Response
  ) => {
    const { id } = req.params;
    const { name, password, assignedClasses } = req.body;
    const teachers = readJSON<TeacherAccount[]>(TEACHERS_FILE, []);
    const idx = teachers.findIndex(t => t.id === id);

    if (idx === -1) {
      res.status(404).json({ success: false, message: 'Không tìm thấy tài khoản giáo viên' });
      return;
    }

    if (name && name.trim()) {
      teachers[idx].name = name.trim();
    }
    if (password && password.trim()) {
      teachers[idx].password = password.trim();
    }
    if (Array.isArray(assignedClasses)) {
      const cleanClasses = assignedClasses.filter(c => VALID_CLASSES.includes(c));
      if (cleanClasses.length > 0) {
        teachers[idx].assignedClasses = cleanClasses;
      }
    }

    writeJSON(TEACHERS_FILE, teachers);
    const { password: _pw, ...safeTeacher } = teachers[idx];
    res.json({
      success: true,
      message: 'Đã cập nhật phân công lớp cho giáo viên!',
      teacher: safeTeacher
    });
  }
);

// 9f. API Xóa tài khoản Giáo viên
app.delete('/api/admin/teachers/:id', (req: Request<{ id: string }>, res: Response) => {
  const { id } = req.params;
  const teachers = readJSON<TeacherAccount[]>(TEACHERS_FILE, []);
  const target = teachers.find(t => t.id === id);

  if (!target) {
    res.status(404).json({ success: false, message: 'Không tìm thấy tài khoản giáo viên' });
    return;
  }

  if (target.role === 'super_admin') {
    res.status(400).json({ success: false, message: 'Không thể xóa tài khoản Quản trị viên gốc!' });
    return;
  }

  const next = teachers.filter(t => t.id !== id);
  writeJSON(TEACHERS_FILE, next);
  res.json({ success: true, message: 'Đã xóa tài khoản giáo viên' });
});

// 10. Điều hướng ReactJS SPA cho các route phía Client (Tách biệt Giao diện Học sinh & Giao diện Admin)
app.get(['/learn', '/admin', '/teacher', '/learn.html', '/teacher.html'], (_req: Request, res: Response) => {
  res.sendFile(path.join(PUBLIC_DIR, 'index.html'));
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
  console.log(`🔴 MINDX TECHNOLOGY SCHOOL - HỆ THỐNG HỌC TẬP & QUẢN TRỊ`);
  console.log(`======================================================`);
  console.log(`🎓 GIAO DIỆN HỌC SINH (Máy này):        http://localhost:${PORT}`);
  console.log(`🎓 GIAO DIỆN HỌC SINH (Mạng LAN/Wi-Fi): http://${ip}:${PORT}`);
  console.log(`🛡️  GIAO DIỆN ADMIN (Dành cho Thầy Cô):  http://localhost:${PORT}/admin`);
  console.log(`======================================================\n`);
});
