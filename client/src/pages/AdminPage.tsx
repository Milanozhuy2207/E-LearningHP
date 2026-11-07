import React, { useEffect, useState, useCallback } from 'react';
import {
  LuShieldCheck,
  LuActivity,
  LuUsers,
  LuBookOpen,
  LuUserPlus,
  LuRotateCcw,
  LuExternalLink,
  LuTrendingUp,
  LuTrophy,
  LuFileCode,
  LuSparkles,
  LuTrash2,
  LuCircleCheck,
  LuCircleX,
  LuSearch,
  LuPencil,
  LuSave,
  LuPlus,
  LuX,
  LuRefreshCw,
  LuListPlus,
  LuCheck,
  LuUser,
  LuLogOut,
  LuLock,
  LuKeyRound
} from 'react-icons/lu';
import { TbCards, TbRobot } from 'react-icons/tb';
import { ClassIcon, StudentAvatarIcon } from '../components/ClassIcon';
import { StudentRecord } from './PortalPage';
import { PracticeAssignment } from '../components/VexCodePracticeLab';

type ValidClassId = 'Web' | 'Python' | 'Unity' | 'Robotics';
type FilterClass = 'All' | ValidClassId;
type AdminSection = 'monitor' | 'students' | 'curriculum' | 'teachers';

interface VocabItem {
  word: string;
  meaning: string;
  example?: string;
}

interface LessonSummary {
  id: string;
  order: number;
  title: string;
  category: string;
  theory?: string;
  task?: string;
  vocab?: VocabItem[];
  practiceAssignments?: PracticeAssignment[];
  practiceAssignmentsByTeacher?: Record<string, PracticeAssignment[]>;
  homeworkNote?: string;
  homeworkByTeacher?: Record<string, string>;
  testCases?: any[];
}

export interface TeacherProfile {
  id: string;
  username: string;
  name: string;
  role: 'super_admin' | 'teacher';
  assignedClasses: ValidClassId[];
  createdAt?: string;
}

interface AdminPageProps {
  onOpenStudentPortal: () => void;
}

const ALL_CLASS_OPTIONS: { id: ValidClassId; name: string; shortLabel: string }[] = [
  { id: 'Robotics', name: 'Lập Trình Robot (VEX GO & VEX IQ)', shortLabel: 'Lớp Robot (VEX)' },
  { id: 'Python', name: 'Lập Trình Python', shortLabel: 'Lớp Python' },
  { id: 'Web', name: 'Lập Trình Web (JavaScript)', shortLabel: 'Lớp Web' },
  { id: 'Unity', name: 'Lập Trình Game Unity (C#)', shortLabel: 'Lớp Unity' }
];

function getStoredTeacher(): TeacherProfile | null {
  try {
    const raw = sessionStorage.getItem('currentTeacher');
    if (!raw) return null;
    return JSON.parse(raw) as TeacherProfile;
  } catch {
    return null;
  }
}

export const AdminPage: React.FC<AdminPageProps> = ({ onOpenStudentPortal }) => {
  // Teacher Auth State
  const [teacher, setTeacher] = useState<TeacherProfile | null>(() => getStoredTeacher());
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [teachersList, setTeachersList] = useState<TeacherProfile[]>([]);

  const [activeSection, setActiveSection] = useState<AdminSection>('monitor');
  const [currentFilterClass, setCurrentFilterClass] = useState<FilterClass>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [lessonsByClass, setLessonsByClass] = useState<Record<ValidClassId, LessonSummary[]>>({
    Web: [],
    Python: [],
    Unity: [],
    Robotics: []
  });

  // Add Student Modal / Bulk Add State
  const [showAddModal, setShowAddModal] = useState(false);
  const [bulkMode, setBulkMode] = useState(false);
  const [newStudentName, setNewStudentName] = useState('');
  const [bulkNamesText, setBulkNamesText] = useState('');
  const [newStudentClass, setNewStudentClass] = useState<ValidClassId>('Robotics');

  // Edit Student Modal State
  const [editingStudent, setEditingStudent] = useState<StudentRecord | null>(null);
  const [editStudentName, setEditStudentName] = useState('');
  const [editStudentClass, setEditStudentClass] = useState<ValidClassId>('Web');

  // View Code Modal State
  const [codeModalData, setCodeModalData] = useState<{
    studentName: string;
    classId: ValidClassId;
    lessonOrder: number;
    lessonTitle: string;
    status: string;
    attempts: number;
    lastSubmittedAt?: string;
    code: string;
  } | null>(null);

  // Curriculum Editor State
  const [curriculumClass, setCurriculumClass] = useState<ValidClassId>('Robotics');
  const [selectedLessonId, setSelectedLessonId] = useState<string>('');
  const [editLessonTitle, setEditLessonTitle] = useState('');
  const [editLessonCategory, setEditLessonCategory] = useState('');
  const [editLessonVocab, setEditLessonVocab] = useState<VocabItem[]>([]);
  const [editPracticeAssignments, setEditPracticeAssignments] = useState<PracticeAssignment[]>([]);
  const [editHomeworkNote, setEditHomeworkNote] = useState('');
  const [saveCurriculumMsg, setSaveCurriculumMsg] = useState<string | null>(null);

  // Teacher Account Management State (for super_admin)
  const [showCreateTeacherModal, setShowCreateTeacherModal] = useState(false);
  const [newTeacherName, setNewTeacherName] = useState('');
  const [newTeacherUsername, setNewTeacherUsername] = useState('');
  const [newTeacherPassword, setNewTeacherPassword] = useState('123');
  const [newTeacherClasses, setNewTeacherClasses] = useState<ValidClassId[]>(['Robotics']);

  const [editingTeacherAcc, setEditingTeacherAcc] = useState<TeacherProfile | null>(null);
  const [editTeacherAccName, setEditTeacherAccName] = useState('');
  const [editTeacherAccPassword, setEditTeacherAccPassword] = useState('');
  const [editTeacherAccClasses, setEditTeacherAccClasses] = useState<ValidClassId[]>([]);

  // Allowed classes for the logged-in teacher
  const allowedClasses: ValidClassId[] = teacher
    ? teacher.role === 'super_admin'
      ? ['Robotics', 'Python', 'Web', 'Unity']
      : teacher.assignedClasses
    : [];

  const allowedClassOptions = ALL_CLASS_OPTIONS.filter(c => allowedClasses.includes(c.id));

  const loadTeachersList = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/teachers');
      const data = await res.json();
      if (data.success && Array.isArray(data.teachers)) {
        setTeachersList(data.teachers);
      }
    } catch (err) {
      console.error('Lỗi tải danh sách giáo viên:', err);
    }
  }, []);

  const loadLessons = useCallback(async () => {
    try {
      const res = await fetch('/api/lessons?class=All');
      const data = await res.json();
      if (data.success && data.lessonsByClass) {
        setLessonsByClass(data.lessonsByClass);
      }
    } catch (err) {
      console.error('Lỗi tải danh sách bài học:', err);
    }
  }, []);

  const fetchStudentsData = useCallback(async () => {
    try {
      const res = await fetch('/api/students');
      const data = await res.json();
      if (data.success && Array.isArray(data.students)) {
        setStudents(data.students);
      }
    } catch (err) {
      console.error('Lỗi cập nhật dữ liệu giáo viên:', err);
    }
  }, []);

  useEffect(() => {
    loadTeachersList();
    loadLessons();
    fetchStudentsData();
    const timer = setInterval(fetchStudentsData, 2500);
    return () => clearInterval(timer);
  }, [loadTeachersList, loadLessons, fetchStudentsData]);

  // Ensure default filter & class selection match the logged-in teacher's assignedClasses
  useEffect(() => {
    if (!teacher) return;
    const classes =
      teacher.role === 'super_admin'
        ? (['Robotics', 'Python', 'Web', 'Unity'] as ValidClassId[])
        : teacher.assignedClasses;
    if (classes.length === 1) {
      setCurrentFilterClass(classes[0]);
      setNewStudentClass(classes[0]);
      setCurriculumClass(classes[0]);
    } else if (classes.length > 1) {
      setCurrentFilterClass('All');
      setNewStudentClass(classes[0]);
      setCurriculumClass(classes[0]);
    }
  }, [teacher]);

  const activeHomeworkTeacherId =
    teacher && teacher.role === 'teacher' ? teacher.id : 'default';

  const populateLessonEditorFields = useCallback(
    (lesson: LessonSummary) => {
      setSelectedLessonId(lesson.id);
      setEditLessonTitle(lesson.title || '');
      setEditLessonCategory(lesson.category || '');
      setEditLessonVocab(lesson.vocab ? lesson.vocab.map(v => ({ ...v })) : []);

      const teacherPractice =
        activeHomeworkTeacherId !== 'default' &&
        lesson.practiceAssignmentsByTeacher &&
        Array.isArray(lesson.practiceAssignmentsByTeacher[activeHomeworkTeacherId])
          ? lesson.practiceAssignmentsByTeacher[activeHomeworkTeacherId]
          : lesson.practiceAssignments || [];

      setEditPracticeAssignments(teacherPractice.map(p => ({ ...p })));

      const teacherHwNote =
        activeHomeworkTeacherId !== 'default' &&
        lesson.homeworkByTeacher &&
        typeof lesson.homeworkByTeacher[activeHomeworkTeacherId] === 'string'
          ? lesson.homeworkByTeacher[activeHomeworkTeacherId]
          : lesson.homeworkNote || '';

      setEditHomeworkNote(teacherHwNote);
      setSaveCurriculumMsg(null);
    },
    [activeHomeworkTeacherId]
  );

  // Select default lesson when switching curriculumClass
  useEffect(() => {
    const list = lessonsByClass[curriculumClass] || [];
    if (list.length > 0) {
      const found = list.find(l => l.id === selectedLessonId) || list[0];
      populateLessonEditorFields(found);
    }
  }, [curriculumClass, lessonsByClass, populateLessonEditorFields]);

  const handleTeacherLogin = async (usernameInput?: string, passwordInput?: string) => {
    const u = (usernameInput ?? loginUsername).trim();
    const p = (passwordInput ?? loginPassword).trim();
    setLoginError(null);
    if (!u || !p) {
      setLoginError('Vui lòng nhập tên đăng nhập và mật khẩu!');
      return;
    }
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: u, password: p })
      });
      const data = await res.json();
      if (data.success && data.teacher) {
        sessionStorage.setItem('currentTeacher', JSON.stringify(data.teacher));
        setTeacher(data.teacher);
        setActiveSection('monitor');
      } else {
        setLoginError(data.message || 'Đăng nhập không thành công');
      }
    } catch {
      setLoginError('Lỗi kết nối tới máy chủ');
    }
  };

  const handleTeacherLogout = () => {
    sessionStorage.removeItem('currentTeacher');
    setTeacher(null);
    setLoginUsername('');
    setLoginPassword('');
    setLoginError(null);
  };

  const handleSelectCurriculumLesson = (lesson: LessonSummary) => {
    populateLessonEditorFields(lesson);
  };

  // Only include students in classes assigned to this teacher AND belonging to this teacher's class
  const teacherScopedStudents = students.filter(s => {
    const inClass = allowedClasses.includes(s.classId as ValidClassId);
    if (!inClass) return false;
    if (teacher && teacher.role === 'teacher') {
      return !s.teacherId || s.teacherId === teacher.id;
    }
    return true;
  });

  // Filtered students (by selected class filter + search query)
  const filteredStudents = teacherScopedStudents.filter(s => {
    const matchClass = currentFilterClass === 'All' || s.classId === currentFilterClass;
    const matchQuery = s.name.toLowerCase().includes(searchQuery.toLowerCase().trim());
    return matchClass && matchQuery;
  });

  // KPI metrics
  const totalStudents = filteredStudents.length;
  const avgProgress =
    totalStudents > 0
      ? Math.round(
          filteredStudents.reduce((acc, s) => acc + (s.percent || 0), 0) / totalStudents
        )
      : 0;
  const completedAll = filteredStudents.filter(s => (s.percent || 0) === 100).length;
  const totalSubmissions = filteredStudents.reduce((acc, s) => {
    const progs = Object.values(s.progress || {});
    return acc + progs.reduce((sum: number, p: any) => sum + (p.attempts || 0), 0);
  }, 0);

  // Per-class summary counts
  const getClassSummary = (cid: ValidClassId) => {
    const list = teacherScopedStudents.filter(s => s.classId === cid);
    const count = list.length;
    const avg =
      count > 0
        ? Math.round(list.reduce((acc, s) => acc + (s.percent || 0), 0) / count)
        : 0;
    return { count, avg };
  };

  const handleCreateStudent = async () => {
    const assignTeacherId =
      teacher && teacher.role === 'teacher' ? teacher.id : undefined;
    const assignTeacherName =
      teacher && teacher.role === 'teacher' ? teacher.name : undefined;

    if (bulkMode) {
      const names = bulkNamesText
        .split('\n')
        .map(n => n.trim())
        .filter(Boolean);
      if (names.length === 0) {
        alert('Vui lòng nhập ít nhất 1 tên học sinh (mỗi dòng 1 tên)!');
        return;
      }
      try {
        const res = await fetch('/api/students/bulk-create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            names,
            classId: newStudentClass,
            teacherId: assignTeacherId,
            teacherName: assignTeacherName
          })
        });
        const data = await res.json();
        if (data.success) {
          setBulkNamesText('');
          setShowAddModal(false);
          fetchStudentsData();
        } else {
          alert(data.message || 'Không thể thêm danh sách học sinh');
        }
      } catch {
        alert('Lỗi kết nối máy chủ');
      }
      return;
    }

    const clean = newStudentName.trim();
    if (!clean) {
      alert('Vui lòng nhập họ và tên học sinh!');
      return;
    }
    try {
      const res = await fetch('/api/students/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: clean,
          classId: newStudentClass,
          teacherId: assignTeacherId,
          teacherName: assignTeacherName
        })
      });
      const data = await res.json();
      if (data.success) {
        setNewStudentName('');
        setShowAddModal(false);
        fetchStudentsData();
      } else {
        alert(data.message || 'Không thể thêm học sinh');
      }
    } catch {
      alert('Lỗi kết nối máy chủ');
    }
  };

  const handleSaveEditStudent = async () => {
    if (!editingStudent) return;
    const clean = editStudentName.trim();
    if (!clean) {
      alert('Tên học sinh không được để trống!');
      return;
    }
    try {
      const res = await fetch(`/api/students/${editingStudent.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: clean, classId: editStudentClass })
      });
      const data = await res.json();
      if (data.success) {
        setEditingStudent(null);
        fetchStudentsData();
      } else {
        alert(data.message || 'Lỗi cập nhật');
      }
    } catch {
      alert('Lỗi kết nối máy chủ');
    }
  };

  const handleResetStudentProgress = async (student: StudentRecord) => {
    if (
      !window.confirm(
        `Đặt lại toàn bộ tiến độ bài làm của học sinh "${student.name}" về 0%?`
      )
    ) {
      return;
    }
    try {
      const res = await fetch(`/api/students/${student.id}/reset-progress`, {
        method: 'POST'
      });
      const data = await res.json();
      if (data.success) {
        fetchStudentsData();
      }
    } catch {
      alert('Lỗi kết nối máy chủ');
    }
  };

  const handleDeleteStudent = async (id: string, name: string) => {
    if (!window.confirm(`Bạn có chắc muốn xóa học sinh "${name}" khỏi danh sách lớp không?`)) {
      return;
    }
    try {
      const res = await fetch(`/api/students/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        fetchStudentsData();
      } else {
        alert(data.message || 'Không thể xóa học sinh');
      }
    } catch {
      alert('Lỗi kết nối máy chủ');
    }
  };

  const handleResetAll = async () => {
    if (
      !window.confirm(
        'CẢNH BÁO: Bạn có chắc chắn muốn XÓA TOÀN BỘ danh sách học sinh và kết quả hiện tại để đón lớp học mới không?'
      )
    ) {
      return;
    }
    try {
      const res = await fetch('/api/teacher/reset-all', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        fetchStudentsData();
      }
    } catch {
      alert('Lỗi khi xóa dữ liệu');
    }
  };

  const handleSaveCurriculumLesson = async () => {
    if (!selectedLessonId) return;
    try {
      const cleanedVocab = editLessonVocab
        .map(v => ({
          word: v.word.trim(),
          meaning: v.meaning.trim(),
          example: (v.example || '').trim()
        }))
        .filter(v => v.word && v.meaning);

      const res = await fetch(`/api/admin/lessons/${curriculumClass}/${selectedLessonId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editLessonTitle,
          category: editLessonCategory,
          vocab: curriculumClass === 'Robotics' ? cleanedVocab : undefined,
          practiceAssignments:
            curriculumClass === 'Robotics' ? editPracticeAssignments : undefined,
          teacherId: activeHomeworkTeacherId,
          homeworkNote: editHomeworkNote.trim()
        })
      });
      const data = await res.json();
      if (data.success) {
        setSaveCurriculumMsg(
          data.message || 'Đã lưu cập nhật bài học & Bài tập về nhà thành công!'
        );
        loadLessons();
        setTimeout(() => setSaveCurriculumMsg(null), 3000);
      } else {
        alert(data.message || 'Lỗi lưu bài học');
      }
    } catch {
      alert('Không thể kết nối máy chủ');
    }
  };

  // Teacher Account CRUD Handlers
  const toggleClassInList = (
    cls: ValidClassId,
    list: ValidClassId[],
    setter: React.Dispatch<React.SetStateAction<ValidClassId[]>>
  ) => {
    if (list.includes(cls)) {
      if (list.length === 1) return; // Keep at least 1 class
      setter(list.filter(c => c !== cls));
    } else {
      setter([...list, cls]);
    }
  };

  const handleCreateTeacherAccount = async () => {
    if (!newTeacherName.trim() || !newTeacherUsername.trim() || !newTeacherPassword.trim()) {
      alert('Vui lòng nhập đầy đủ Họ tên, Tài khoản đăng nhập và Mật khẩu!');
      return;
    }
    try {
      const res = await fetch('/api/admin/teachers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newTeacherName.trim(),
          username: newTeacherUsername.trim(),
          password: newTeacherPassword.trim(),
          assignedClasses: newTeacherClasses
        })
      });
      const data = await res.json();
      if (data.success) {
        setNewTeacherName('');
        setNewTeacherUsername('');
        setNewTeacherPassword('123');
        setShowCreateTeacherModal(false);
        loadTeachersList();
      } else {
        alert(data.message || 'Không thể cấp tài khoản');
      }
    } catch {
      alert('Lỗi kết nối máy chủ');
    }
  };

  const handleSaveEditTeacherAcc = async () => {
    if (!editingTeacherAcc) return;
    try {
      const res = await fetch(`/api/admin/teachers/${editingTeacherAcc.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editTeacherAccName.trim(),
          password: editTeacherAccPassword.trim() || undefined,
          assignedClasses: editTeacherAccClasses
        })
      });
      const data = await res.json();
      if (data.success) {
        setEditingTeacherAcc(null);
        loadTeachersList();
        if (teacher && teacher.id === editingTeacherAcc.id && data.teacher) {
          sessionStorage.setItem('currentTeacher', JSON.stringify(data.teacher));
          setTeacher(data.teacher);
        }
      } else {
        alert(data.message || 'Lỗi cập nhật tài khoản giáo viên');
      }
    } catch {
      alert('Lỗi kết nối máy chủ');
    }
  };

  const handleDeleteTeacherAccount = async (acc: TeacherProfile) => {
    if (
      !window.confirm(
        `Bạn có chắc muốn xóa tài khoản giáo viên "${acc.name}" (${acc.username}) không?`
      )
    ) {
      return;
    }
    try {
      const res = await fetch(`/api/admin/teachers/${acc.id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        loadTeachersList();
      } else {
        alert(data.message || 'Không thể xóa tài khoản');
      }
    } catch {
      alert('Lỗi kết nối máy chủ');
    }
  };

  // ============================================================================
  // MÀN HÌNH ĐĂNG NHẬP GIÁO VIÊN / ADMIN (NẾU CHƯA ĐĂNG NHẬP)
  // ============================================================================
  if (!teacher) {
    return (
      <div className="admin-login-screen">
        <div className="admin-login-card">
          <div className="admin-login-brand">
            <div className="admin-brand-logo" style={{ width: 52, height: 52, fontSize: '1.5rem' }}>
              M
            </div>
            <div>
              <h1>CỔNG GIÁO VIÊN &amp; QUẢN TRỊ</h1>
              <p>Đăng nhập để quản lý các lớp học được phân công phụ trách</p>
            </div>
          </div>

          {loginError && <div className="admin-login-error">{loginError}</div>}

          <div className="form-group">
            <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <LuUser size={15} color="#38bdf8" />
              <span>Tài khoản Giáo viên / Admin:</span>
            </label>
            <input
              type="text"
              className="form-input"
              placeholder="Ví dụ: gv_robotics, gv_python, admin..."
              value={loginUsername}
              onChange={e => setLoginUsername(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') handleTeacherLogin();
              }}
            />
          </div>

          <div className="form-group">
            <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <LuLock size={15} color="#38bdf8" />
              <span>Mật khẩu:</span>
            </label>
            <input
              type="password"
              className="form-input"
              placeholder="Nhập mật khẩu (mặc định: 123)..."
              value={loginPassword}
              onChange={e => setLoginPassword(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') handleTeacherLogin();
              }}
            />
          </div>

          <button
            type="button"
            className="btn-submit-modal"
            onClick={() => handleTeacherLogin()}
          >
            Đăng Nhập Vào Hệ Thống
          </button>

          {/* Chọn nhanh tài khoản Giáo viên để test / vào lớp */}
          <div className="admin-quick-accounts">
            <div className="admin-quick-title">
              <LuKeyRound size={14} color="#fb923c" />
              <span>Chọn nhanh tài khoản Giáo viên theo lớp phụ trách (Mật khẩu: 123):</span>
            </div>
            <div className="admin-quick-grid">
              {teachersList.map(acc => (
                <button
                  key={acc.id}
                  type="button"
                  className="admin-quick-btn"
                  onClick={() => handleTeacherLogin(acc.username, '123')}
                >
                  <div className="admin-quick-btn-top">
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                      <LuUser size={15} color="#38bdf8" />
                      <strong>{acc.name}</strong>
                    </span>
                    <span className="admin-quick-user">@{acc.username}</span>
                  </div>
                  <div className="admin-quick-classes">
                    {acc.role === 'super_admin' ? (
                      <span className="admin-role-tag super">Quản trị toàn bộ 4 lớp + Cấp TK</span>
                    ) : (
                      acc.assignedClasses.map(cid => (
                        <span key={cid} className={`badge-class ${cid.toLowerCase()}`}>
                          <ClassIcon name={cid} size={12} />
                          <span>{cid === 'Robotics' ? 'Robot (VEX)' : cid}</span>
                        </span>
                      ))
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const activeReferenceClass: ValidClassId =
    currentFilterClass === 'All'
      ? allowedClasses[0] || 'Web'
      : currentFilterClass;

  const referenceLessons =
    lessonsByClass[activeReferenceClass] || lessonsByClass.Web || [];

  return (
    <div className="admin-layout">
      {/* SIDEBAR ADMIN DÀNH RIÊNG CHO THẦY CÔ */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-brand">
          <div className="admin-brand-logo">M</div>
          <div>
            <div className="admin-brand-title">MINDX ADMIN</div>
            <div className="admin-brand-sub">Cổng Quản Trị Giáo Viên</div>
          </div>
        </div>

        {/* Thông tin Giáo viên đang đăng nhập */}
        <div className="admin-teacher-profile-box">
          <div className="admin-teacher-profile-top">
            <div className="student-cell-avatar" style={{ width: 36, height: 36 }}>
              <LuUser size={18} color="#38bdf8" />
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div className="admin-teacher-name">{teacher.name}</div>
              <div className="admin-teacher-role">
                {teacher.role === 'super_admin'
                  ? 'Quản Trị Đào Tạo (Toàn quyền)'
                  : `GV Phụ trách: ${teacher.assignedClasses.join(', ')}`}
              </div>
            </div>
            <button
              type="button"
              className="admin-logout-icon-btn"
              title="Đăng xuất / Đổi tài khoản Giáo viên"
              onClick={handleTeacherLogout}
            >
              <LuLogOut size={16} />
            </button>
          </div>
        </div>

        <div className="admin-nav-group">
          <div className="admin-nav-label">QUẢN LÝ ĐÀO TẠO</div>
          <button
            type="button"
            className={`admin-nav-item ${activeSection === 'monitor' ? 'active' : ''}`}
            onClick={() => setActiveSection('monitor')}
          >
            <LuActivity size={18} />
            <span>Theo Dõi Lớp Học (Live)</span>
          </button>

          <button
            type="button"
            className={`admin-nav-item ${activeSection === 'students' ? 'active' : ''}`}
            onClick={() => setActiveSection('students')}
          >
            <LuUsers size={18} />
            <span>Quản Lý Học Sinh ({teacherScopedStudents.length})</span>
          </button>

          <button
            type="button"
            className={`admin-nav-item ${activeSection === 'curriculum' ? 'active' : ''}`}
            onClick={() => setActiveSection('curriculum')}
          >
            <LuBookOpen size={18} />
            <span>Quản Lý Bài Học &amp; Quizlet</span>
          </button>

          {teacher.role === 'super_admin' && (
            <button
              type="button"
              className={`admin-nav-item ${activeSection === 'teachers' ? 'active' : ''}`}
              onClick={() => setActiveSection('teachers')}
            >
              <LuKeyRound size={18} />
              <span>Cấp Tài Khoản Giáo Viên ({teachersList.length})</span>
            </button>
          )}
        </div>

        <div className="admin-sidebar-classes">
          <div className="admin-nav-label">
            LỚP HỌC PHỤ TRÁCH ({allowedClassOptions.length})
          </div>
          {allowedClassOptions.length > 1 && (
            <button
              type="button"
              className={`admin-class-pill ${currentFilterClass === 'All' ? 'active' : ''}`}
              onClick={() => setCurrentFilterClass('All')}
            >
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                <LuShieldCheck size={16} color="#fb7185" />
                <span>Tất cả lớp của tôi</span>
              </span>
              <span className="admin-class-pill-count">{teacherScopedStudents.length}</span>
            </button>
          )}

          {allowedClassOptions.map(tab => {
            const count = teacherScopedStudents.filter(s => s.classId === tab.id).length;
            return (
              <button
                key={tab.id}
                type="button"
                className={`admin-class-pill ${
                  currentFilterClass === tab.id ? 'active' : ''
                }`}
                onClick={() => setCurrentFilterClass(tab.id)}
              >
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                  <ClassIcon name={tab.id} size={16} />
                  <span>{tab.shortLabel}</span>
                </span>
                <span className="admin-class-pill-count">{count}</span>
              </button>
            );
          })}
        </div>

        <div className="admin-sidebar-footer">
          <button
            type="button"
            className="admin-btn-student-view"
            onClick={onOpenStudentPortal}
          >
            <LuExternalLink size={16} />
            <span>Mở Cổng Giao Diện Học Sinh</span>
          </button>
        </div>
      </aside>

      {/* NỘI DUNG CHÍNH CỦA ADMIN */}
      <div className="admin-content-area">
        {/* Topbar Admin với Thanh Tìm Kiếm Mới */}
        <header className="admin-topbar">
          <div className="admin-topbar-left">
            <span className="live-indicator">
              <span className="dot" />
              <span>LIVE SYNC</span>
            </span>
            <h2>
              {activeSection === 'monitor' && 'Theo Dõi Tiến Độ Lớp Học Phụ Trách'}
              {activeSection === 'students' && 'Danh Sách Học Sinh Lớp Phụ Trách'}
              {activeSection === 'curriculum' && 'Quản Lý Bài Học & Từ Vựng Quizlet'}
              {activeSection === 'teachers' && 'Cấp Tài Khoản & Phân Công Lớp Cho Giáo Viên'}
            </h2>
          </div>

          <div className="admin-topbar-actions">
            {/* Thanh tìm kiếm Admin đã được thiết kế lại chuẩn đẹp */}
            <div className="admin-search-bar">
              <LuSearch size={16} className="admin-search-icon" />
              <input
                type="text"
                className="admin-search-input"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm tên học sinh..."
              />
              {searchQuery && (
                <button
                  type="button"
                  className="admin-search-clear"
                  title="Xóa tìm kiếm"
                  onClick={() => setSearchQuery('')}
                >
                  <LuX size={14} />
                </button>
              )}
            </div>

            <button
              type="button"
              className="btn-action primary"
              onClick={() => {
                if (currentFilterClass !== 'All') {
                  setNewStudentClass(currentFilterClass);
                } else if (allowedClasses.length > 0) {
                  setNewStudentClass(allowedClasses[0]);
                }
                setBulkMode(false);
                setShowAddModal(true);
              }}
            >
              <LuUserPlus size={16} />
              <span>Thêm Học Sinh</span>
            </button>

            {teacher.role === 'super_admin' && (
              <button type="button" className="btn-action danger" onClick={handleResetAll}>
                <LuRotateCcw size={16} />
                <span>Reset Toàn Trường</span>
              </button>
            )}
          </div>
        </header>

        <main className="admin-main-scroll">
          {/* ================================================================
              PHÂN HỆ 1: THEO DÕI LỚP HỌC (LIVE MONITOR)
             ================================================================ */}
          {activeSection === 'monitor' && (
            <>
              {/* Các thẻ Lớp học mà Giáo viên này phụ trách */}
              <div
                className="admin-course-cards"
                style={{
                  gridTemplateColumns: `repeat(${Math.max(
                    allowedClassOptions.length,
                    1
                  )}, minmax(220px, 1fr))`
                }}
              >
                {allowedClassOptions.map(c => {
                  const summary = getClassSummary(c.id);
                  const isSelected = currentFilterClass === c.id;
                  return (
                    <div
                      key={c.id}
                      className={`admin-course-card ${isSelected ? 'active' : ''}`}
                      onClick={() => {
                        if (allowedClassOptions.length > 1) {
                          setCurrentFilterClass(isSelected ? 'All' : c.id);
                        } else {
                          setCurrentFilterClass(c.id);
                        }
                      }}
                    >
                      <div className="admin-course-card-top">
                        <div className="admin-course-icon">
                          <ClassIcon name={c.id} size={24} />
                        </div>
                        <span className="admin-course-badge">{summary.count} học sinh</span>
                      </div>
                      <div className="admin-course-name">{c.name}</div>
                      <div className="admin-course-progress-row">
                        <span>Tiến độ TB:</span>
                        <strong>{summary.avg}%</strong>
                      </div>
                      <div className="mini-bar-bg" style={{ width: '100%' }}>
                        <div
                          className="mini-bar-fill"
                          style={{ width: `${summary.avg}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* 4 Thẻ KPI */}
              <div className="admin-kpi-grid">
                <div className="admin-kpi-card">
                  <div
                    className="admin-kpi-icon"
                    style={{ background: 'rgba(56, 189, 248, 0.14)', color: '#38bdf8' }}
                  >
                    <LuUsers size={24} />
                  </div>
                  <div className="admin-kpi-body">
                    <div className="admin-kpi-label">Sĩ Số Lớp Phụ Trách</div>
                    <div className="admin-kpi-value">{totalStudents}</div>
                    <div className="admin-kpi-sub">
                      {currentFilterClass === 'All'
                        ? `Các lớp: ${allowedClasses.join(', ')}`
                        : `Lớp ${currentFilterClass}`}
                    </div>
                  </div>
                </div>

                <div className="admin-kpi-card">
                  <div
                    className="admin-kpi-icon"
                    style={{ background: 'rgba(249, 115, 22, 0.14)', color: '#fb923c' }}
                  >
                    <LuTrendingUp size={24} />
                  </div>
                  <div className="admin-kpi-body">
                    <div className="admin-kpi-label">Tiến Độ Trung Bình</div>
                    <div className="admin-kpi-value" style={{ color: '#fb923c' }}>
                      {avgProgress}%
                    </div>
                    <div className="admin-kpi-sub">Tỷ lệ hoàn thành bài học</div>
                  </div>
                </div>

                <div className="admin-kpi-card">
                  <div
                    className="admin-kpi-icon"
                    style={{ background: 'rgba(16, 185, 129, 0.14)', color: '#34d399' }}
                  >
                    <LuTrophy size={24} />
                  </div>
                  <div className="admin-kpi-body">
                    <div className="admin-kpi-label">Hoàn Thành 100% Khóa</div>
                    <div className="admin-kpi-value" style={{ color: '#34d399' }}>
                      {completedAll}
                    </div>
                    <div className="admin-kpi-sub">Học sinh vượt qua mọi thử thách</div>
                  </div>
                </div>

                <div className="admin-kpi-card">
                  <div
                    className="admin-kpi-icon"
                    style={{ background: 'rgba(225, 29, 72, 0.15)', color: '#fb7185' }}
                  >
                    <LuFileCode size={24} />
                  </div>
                  <div className="admin-kpi-body">
                    <div className="admin-kpi-label">Tổng Lượt Nộp Bài</div>
                    <div className="admin-kpi-value" style={{ color: '#fb7185' }}>
                      {totalSubmissions}
                    </div>
                    <div className="admin-kpi-sub">Chấm điểm tự động thời gian thực</div>
                  </div>
                </div>
              </div>

              {/* Bảng ma trận tiến độ từng bài học */}
              <div className="monitor-card">
                <div className="monitor-card-header">
                  <div>
                    <h3 style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                      <LuSparkles size={18} color="#fb7185" />
                      <span>
                        Ma Trận Tiến Độ Học Sinh (
                        {currentFilterClass === 'All'
                          ? `Lớp của ${teacher.name}`
                          : `Lớp ${currentFilterClass}`}
                        )
                      </span>
                    </h3>
                    <span
                      style={{
                        fontSize: '0.82rem',
                        color: 'var(--text-muted)',
                        display: 'block',
                        marginTop: 4
                      }}
                    >
                      Nhấp vào từng ô trạng thái bài học để xem bài làm hoặc kết quả Kiểm tra Quizlet của học sinh
                    </span>
                  </div>
                </div>

                <div style={{ overflowX: 'auto' }}>
                  <table className="roster-table">
                    <thead>
                      <tr>
                        <th>Học Sinh</th>
                        <th>Bộ Môn</th>
                        <th>Tiến Độ Chung</th>
                        {referenceLessons.map((_, idx) => (
                          <th key={idx} style={{ textAlign: 'center' }}>
                            Bài {idx + 1}
                          </th>
                        ))}
                        <th style={{ textAlign: 'right' }}>Quản Lý</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredStudents.length === 0 ? (
                        <tr>
                          <td colSpan={11} className="empty-table-msg">
                            Chưa có học sinh nào trong lớp này. Hãy nhấn{' '}
                            <b>"+ Thêm Học Sinh"</b> ở góc trên bên phải!
                          </td>
                        </tr>
                      ) : (
                        filteredStudents.map(s => {
                          const sClass: ValidClassId =
                            s.classId === 'Python' ||
                            s.classId === 'Unity' ||
                            s.classId === 'Robotics'
                              ? s.classId
                              : 'Web';
                          const studentLessons =
                            lessonsByClass[sClass] || lessonsByClass.Web || [];

                          return (
                            <tr key={s.id}>
                              <td>
                                <div className="student-cell">
                                  <div className="student-cell-avatar">
                                    <StudentAvatarIcon avatar={s.avatar} size={20} />
                                  </div>
                                  <div>
                                    <div className="student-cell-name">{s.name}</div>
                                    <div className="student-cell-time">
                                      Hoạt động:{' '}
                                      {s.lastActive
                                        ? new Date(s.lastActive).toLocaleTimeString('vi-VN')
                                        : 'Mới tham gia'}
                                    </div>
                                  </div>
                                </div>
                              </td>

                              <td>
                                <span className={`badge-class ${sClass.toLowerCase()}`}>
                                  <ClassIcon name={sClass} size={15} />
                                  <span>
                                    {sClass === 'Robotics' ? 'Robot (VEX)' : sClass}
                                  </span>
                                </span>
                              </td>

                              <td>
                                <div className="progress-cell-wrapper">
                                  <div className="mini-bar-bg">
                                    <div
                                      className="mini-bar-fill"
                                      style={{ width: `${s.percent || 0}%` }}
                                    />
                                  </div>
                                  <span className="progress-percent">
                                    {s.percent || 0}% ({s.passedCount || 0}/
                                    {s.totalLessons || studentLessons.length})
                                  </span>
                                </div>
                              </td>

                              {referenceLessons.map((_, idx) => {
                                const targetLesson = studentLessons[idx];
                                if (!targetLesson) {
                                  return (
                                    <td key={idx} style={{ textAlign: 'center', color: '#475569' }}>
                                      —
                                    </td>
                                  );
                                }
                                const p = s.progress ? s.progress[targetLesson.id] : null;
                                if (!p) {
                                  return (
                                    <td key={targetLesson.id} style={{ textAlign: 'center' }}>
                                      <span
                                        className="lesson-pill none"
                                        title={`Bài ${targetLesson.order}: ${targetLesson.title} - Chưa làm`}
                                      >
                                        -
                                      </span>
                                    </td>
                                  );
                                }
                                const isPassed = p.status === 'passed';
                                return (
                                  <td key={targetLesson.id} style={{ textAlign: 'center' }}>
                                    <span
                                      className={`lesson-pill ${isPassed ? 'passed' : 'failed'}`}
                                      title={`Bài ${targetLesson.order}: ${targetLesson.title} (${
                                        isPassed ? 'ĐẠT' : 'CHƯA ĐẠT'
                                      }) - Nhấn để xem`}
                                      onClick={() =>
                                        setCodeModalData({
                                          studentName: s.name,
                                          classId: sClass,
                                          lessonOrder: targetLesson.order,
                                          lessonTitle: targetLesson.title,
                                          status: p.status,
                                          attempts: p.attempts || 1,
                                          lastSubmittedAt: p.lastSubmittedAt,
                                          code: p.code || '// Chưa có dữ liệu'
                                        })
                                      }
                                    >
                                      {isPassed ? (
                                        <LuCircleCheck size={16} />
                                      ) : (
                                        <LuCircleX size={16} />
                                      )}
                                    </span>
                                  </td>
                                );
                              })}

                              <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                                <button
                                  type="button"
                                  className="btn-view-code"
                                  title="Sửa thông tin học sinh"
                                  onClick={() => {
                                    setEditingStudent(s);
                                    setEditStudentName(s.name);
                                    setEditStudentClass(sClass);
                                  }}
                                >
                                  <LuPencil size={13} />
                                  <span>Sửa</span>
                                </button>
                                <button
                                  type="button"
                                  className="btn-delete-student"
                                  title="Xóa học sinh khỏi lớp"
                                  onClick={() => handleDeleteStudent(s.id, s.name)}
                                >
                                  <LuTrash2 size={13} />
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* ================================================================
              PHÂN HỆ 2: QUẢN LÝ HỌC SINH (STUDENT MANAGEMENT & BULK IMPORT)
             ================================================================ */}
          {activeSection === 'students' && (
            <div className="monitor-card">
              <div className="monitor-card-header">
                <div>
                  <h3 style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                    <LuUsers size={18} color="#38bdf8" />
                    <span>Danh Sách Học Sinh Lớp Phụ Trách ({filteredStudents.length})</span>
                  </h3>
                  <span
                    style={{
                      fontSize: '0.82rem',
                      color: 'var(--text-muted)',
                      display: 'block',
                      marginTop: 4
                    }}
                  >
                    Thêm lẻ, nhập danh sách nhiều học sinh theo lô hoặc đặt lại tiến độ bài học
                  </span>
                </div>

                <div style={{ display: 'flex', gap: 10 }}>
                  <button
                    type="button"
                    className="btn-action"
                    onClick={() => {
                      setBulkMode(true);
                      setShowAddModal(true);
                    }}
                  >
                    <LuListPlus size={16} />
                    <span>Nhập Danh Sách Theo Lô</span>
                  </button>
                  <button
                    type="button"
                    className="btn-action primary"
                    onClick={() => {
                      setBulkMode(false);
                      setShowAddModal(true);
                    }}
                  >
                    <LuUserPlus size={16} />
                    <span>Thêm 1 Học Sinh</span>
                  </button>
                </div>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table className="roster-table">
                  <thead>
                    <tr>
                      <th>Họ và Tên Học Sinh</th>
                      <th>Lớp Đang Học</th>
                      <th>Hoạt Động Gần Nhất</th>
                      <th>Tiến Độ Hoàn Thành</th>
                      <th style={{ textAlign: 'right' }}>Thao Tác Quản Trị</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="empty-table-msg">
                          Chưa có học sinh nào trong lớp bạn phụ trách.
                        </td>
                      </tr>
                    ) : (
                      filteredStudents.map(s => {
                        const sClass: ValidClassId =
                          s.classId === 'Python' ||
                          s.classId === 'Unity' ||
                          s.classId === 'Robotics'
                            ? s.classId
                            : 'Web';
                        return (
                          <tr key={s.id}>
                            <td>
                              <div className="student-cell">
                                <div className="student-cell-avatar">
                                  <StudentAvatarIcon avatar={s.avatar} size={20} />
                                </div>
                                <div>
                                  <div className="student-cell-name">{s.name}</div>
                                  <div className="student-cell-time">Mã HS: {s.id}</div>
                                </div>
                              </div>
                            </td>
                            <td>
                              <span className={`badge-class ${sClass.toLowerCase()}`}>
                                <ClassIcon name={sClass} size={15} />
                                <span>
                                  {sClass === 'Robotics'
                                    ? 'Lập Trình Robot (VEX GO & IQ)'
                                    : `Lớp ${sClass}`}
                                </span>
                              </span>
                            </td>
                            <td style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>
                              {s.lastActive
                                ? new Date(s.lastActive).toLocaleString('vi-VN')
                                : 'Mới tạo'}
                            </td>
                            <td>
                              <div className="progress-cell-wrapper">
                                <div className="mini-bar-bg">
                                  <div
                                    className="mini-bar-fill"
                                    style={{ width: `${s.percent || 0}%` }}
                                  />
                                </div>
                                <span className="progress-percent">
                                  {s.percent || 0}% ({s.passedCount || 0}/{s.totalLessons || 0} bài)
                                </span>
                              </div>
                            </td>
                            <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                              <button
                                type="button"
                                className="btn-view-code"
                                onClick={() => {
                                  setEditingStudent(s);
                                  setEditStudentName(s.name);
                                  setEditStudentClass(sClass);
                                }}
                              >
                                <LuPencil size={13} />
                                <span>Sửa</span>
                              </button>
                              <button
                                type="button"
                                className="btn-view-code"
                                style={{ marginLeft: 8 }}
                                onClick={() => handleResetStudentProgress(s)}
                              >
                                <LuRefreshCw size={13} />
                                <span>Reset tiến độ</span>
                              </button>
                              <button
                                type="button"
                                className="btn-delete-student"
                                onClick={() => handleDeleteStudent(s.id, s.name)}
                              >
                                <LuTrash2 size={13} />
                                <span>Xóa</span>
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ================================================================
              PHÂN HỆ 3: QUẢN LÝ BÀI HỌC & TỪ VỰNG QUIZLET (CURRICULUM)
             ================================================================ */}
          {activeSection === 'curriculum' && (
            <div className="admin-curriculum-grid">
              {/* Cột chọn bộ môn & bài học (chỉ các bộ môn giáo viên phụ trách) */}
              <div className="monitor-card" style={{ padding: 20 }}>
                <h3
                  style={{
                    fontSize: '1rem',
                    fontWeight: 800,
                    marginBottom: 14,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8
                  }}
                >
                  <LuBookOpen size={18} color="#fb923c" />
                  <span>Bộ Môn Bạn Phụ Trách</span>
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 18 }}>
                  {allowedClassOptions.map(c => (
                    <button
                      key={c.id}
                      type="button"
                      className={`admin-class-pill ${curriculumClass === c.id ? 'active' : ''}`}
                      onClick={() => setCurriculumClass(c.id)}
                    >
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                        <ClassIcon name={c.id} size={16} />
                        <span>{c.name}</span>
                      </span>
                      <span className="admin-class-pill-count">
                        {(lessonsByClass[c.id] || []).length} bài
                      </span>
                    </button>
                  ))}
                </div>

                <div
                  style={{
                    fontSize: '0.78rem',
                    fontWeight: 800,
                    color: 'var(--text-muted)',
                    textTransform: 'uppercase',
                    marginBottom: 8
                  }}
                >
                  Danh sách bài học ({curriculumClass}):
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {(lessonsByClass[curriculumClass] || []).map(lesson => (
                    <div
                      key={lesson.id}
                      className={`drawer-item ${
                        selectedLessonId === lesson.id ? 'active' : ''
                      }`}
                      style={{ marginBottom: 0 }}
                      onClick={() => handleSelectCurriculumLesson(lesson)}
                    >
                      <div>
                        <div className="drawer-item-title">
                          Bài {lesson.order}: {lesson.title}
                        </div>
                        <div className="drawer-item-cat">{lesson.category}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Cột chỉnh sửa bài học & từ vựng Quizlet */}
              <div className="monitor-card" style={{ padding: 24 }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 20,
                    paddingBottom: 14,
                    borderBottom: '1px solid var(--border-dark)'
                  }}
                >
                  <div>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#ffffff' }}>
                      Chỉnh Sửa Bài Học &amp; Giao Bài Tập Về Nhà ({curriculumClass})
                    </h3>
                    <span style={{ fontSize: '0.84rem', color: '#38bdf8', fontWeight: 700 }}>
                      Đang thiết lập Bài Tập Về Nhà riêng cho lớp của:{' '}
                      <strong>{teacher.name}</strong> (Học sinh lớp bạn sẽ nhận đúng bài tập này)
                    </span>
                  </div>

                  <button
                    type="button"
                    className="btn-action primary"
                    onClick={handleSaveCurriculumLesson}
                  >
                    <LuSave size={16} />
                    <span>Lưu Bài Học &amp; BTVN Của Lớp</span>
                  </button>
                </div>

                {saveCurriculumMsg && (
                  <div
                    style={{
                      background: 'rgba(16, 185, 129, 0.16)',
                      border: '1px solid #10b981',
                      color: '#6ee7b7',
                      padding: '10px 16px',
                      borderRadius: 10,
                      fontWeight: 800,
                      marginBottom: 16,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8
                    }}
                  >
                    <LuCheck size={18} />
                    <span>{saveCurriculumMsg}</span>
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, marginBottom: 16 }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label>Tiêu đề bài học:</label>
                    <input
                      type="text"
                      className="form-input"
                      value={editLessonTitle}
                      onChange={e => setEditLessonTitle(e.target.value)}
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label>Chủ đề / Học phần:</label>
                    <input
                      type="text"
                      className="form-input"
                      value={editLessonCategory}
                      onChange={e => setEditLessonCategory(e.target.value)}
                    />
                  </div>
                </div>

                {/* Ô Giao Bài Tập Về Nhà / Dặn dò riêng của Giáo viên này */}
                <div
                  className="form-group"
                  style={{
                    background: 'rgba(56, 189, 248, 0.07)',
                    border: '1px solid rgba(56, 189, 248, 0.3)',
                    borderRadius: 12,
                    padding: 14,
                    marginBottom: 20
                  }}
                >
                  <label style={{ color: '#38bdf8' }}>
                    Bài Tập Về Nhà / Dặn dò riêng của {teacher.name} cho buổi học này:
                  </label>
                  <textarea
                    className="form-input"
                    rows={2}
                    placeholder="Ví dụ: Về nhà các con ôn thuộc 7 từ mới và hoàn thành Đề thực hành số 1, 2 thầy giao nhé..."
                    value={editHomeworkNote}
                    onChange={e => setEditHomeworkNote(e.target.value)}
                  />
                </div>

                {curriculumClass === 'Robotics' ? (
                  <div>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: 12
                      }}
                    >
                      <div
                        style={{
                          fontWeight: 900,
                          color: '#fb923c',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 8
                        }}
                      >
                        <TbCards size={20} />
                        <span>
                          Bộ Thẻ Từ Vựng Quizlet VEX GO &amp; VEX IQ ({editLessonVocab.length} từ)
                        </span>
                      </div>
                      <button
                        type="button"
                        className="btn-action"
                        onClick={() =>
                          setEditLessonVocab([
                            ...editLessonVocab,
                            { word: '', meaning: '', example: '' }
                          ])
                        }
                      >
                        <LuPlus size={15} />
                        <span>Thêm Thẻ Từ Mới</span>
                      </button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {editLessonVocab.map((v, i) => (
                        <div
                          key={i}
                          style={{
                            display: 'grid',
                            gridTemplateColumns: '1.2fr 1.5fr 1.5fr auto',
                            gap: 10,
                            alignItems: 'center',
                            background: '#020617',
                            padding: 12,
                            borderRadius: 10,
                            border: '1px solid var(--border-dark)'
                          }}
                        >
                          <input
                            type="text"
                            className="form-input"
                            placeholder="Từ tiếng Anh (VD: forward)"
                            value={v.word}
                            onChange={e => {
                              const next = [...editLessonVocab];
                              next[i] = { ...next[i], word: e.target.value };
                              setEditLessonVocab(next);
                            }}
                          />
                          <input
                            type="text"
                            className="form-input"
                            placeholder="Nghĩa tiếng Việt (VD: đi về phía trước)"
                            value={v.meaning}
                            onChange={e => {
                              const next = [...editLessonVocab];
                              next[i] = { ...next[i], meaning: e.target.value };
                              setEditLessonVocab(next);
                            }}
                          />
                          <input
                            type="text"
                            className="form-input"
                            placeholder="Ví dụ khối lệnh (VD: drive forward)"
                            value={v.example || ''}
                            onChange={e => {
                              const next = [...editLessonVocab];
                              next[i] = { ...next[i], example: e.target.value };
                              setEditLessonVocab(next);
                            }}
                          />
                          <button
                            type="button"
                            className="btn-delete-student"
                            style={{ marginLeft: 0, padding: '8px 10px' }}
                            title="Xóa thẻ từ này"
                            onClick={() =>
                              setEditLessonVocab(editLessonVocab.filter((_, idx) => idx !== i))
                            }
                          >
                            <LuTrash2 size={15} />
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Quản lý Đề Thực Hành VEXcode GO 2D Giao Cho Học Sinh */}
                    <div
                      style={{
                        marginTop: 28,
                        paddingTop: 22,
                        borderTop: '1px dashed #334155'
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginBottom: 12
                        }}
                      >
                        <div
                          style={{
                            fontWeight: 900,
                            color: '#38bdf8',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 8
                          }}
                        >
                          <TbRobot size={20} color="#fb923c" />
                          <span>
                            Phần 2: Đề Thực Hành VEXcode GO 2D Thầy Cô Giao (
                            {editPracticeAssignments.length} đề riêng)
                          </span>
                        </div>
                        <button
                          type="button"
                          className="btn-action"
                          onClick={() =>
                            setEditPracticeAssignments([
                              ...editPracticeAssignments,
                              {
                                id: `assign-${Date.now()}`,
                                title: `Đề ${
                                  editPracticeAssignments.length + 1
                                } (Thầy Cô Giao): Nhiệm vụ Robot VEX GO`,
                                description:
                                  'Con hãy ghép các khối lệnh VEXcode GO để điều khiển Robot từ ô Xuất phát tới Ô Đích màu xanh nhé!',
                                startX: 0,
                                startY: 2,
                                startHeading: 90,
                                goalX: 3,
                                goalY: 2,
                                hasDisk: false,
                                diskX: 2,
                                diskY: 2
                              }
                            ])
                          }
                        >
                          <LuPlus size={15} />
                          <span>Giao Thêm Đề Thực Hành Mới</span>
                        </button>
                      </div>

                      {editPracticeAssignments.length === 0 ? (
                        <div
                          style={{
                            background: '#020617',
                            border: '1px solid #1e293b',
                            borderRadius: 10,
                            padding: 14,
                            color: '#94a3b8',
                            fontSize: '0.85rem'
                          }}
                        >
                          Đang sử dụng bộ đề thực hành 2D mặc định của buổi học. Thầy cô có thể nhấn{' '}
                          <b>"+ Giao Thêm Đề Thực Hành Mới"</b> ở trên để giao đề riêng cho lớp!
                        </div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                          {editPracticeAssignments.map((pa, idx) => (
                            <div
                              key={pa.id}
                              style={{
                                background: '#020617',
                                border: '1px solid #1e293b',
                                borderRadius: 12,
                                padding: 16,
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 10
                              }}
                            >
                              <div
                                style={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'center',
                                  gap: 10
                                }}
                              >
                                <input
                                  type="text"
                                  className="form-input"
                                  placeholder="Tiêu đề đề bài thầy cô giao..."
                                  value={pa.title}
                                  onChange={e => {
                                    const next = [...editPracticeAssignments];
                                    next[idx] = { ...next[idx], title: e.target.value };
                                    setEditPracticeAssignments(next);
                                  }}
                                />
                                <button
                                  type="button"
                                  className="btn-delete-student"
                                  style={{ marginLeft: 0, padding: '8px 12px' }}
                                  onClick={() =>
                                    setEditPracticeAssignments(
                                      editPracticeAssignments.filter((_, i) => i !== idx)
                                    )
                                  }
                                >
                                  <LuTrash2 size={14} />
                                  <span>Xóa đề</span>
                                </button>
                              </div>

                              <textarea
                                className="form-input"
                                rows={2}
                                placeholder="Mô tả yêu cầu đề thực hành cho học sinh..."
                                value={pa.description}
                                onChange={e => {
                                  const next = [...editPracticeAssignments];
                                  next[idx] = { ...next[idx], description: e.target.value };
                                  setEditPracticeAssignments(next);
                                }}
                              />

                              <div
                                style={{
                                  display: 'grid',
                                  gridTemplateColumns: 'repeat(4, 1fr)',
                                  gap: 10
                                }}
                              >
                                <div className="form-group" style={{ marginBottom: 0 }}>
                                  <label>Ô Xuất Phát X (0-4):</label>
                                  <input
                                    type="number"
                                    min={0}
                                    max={4}
                                    className="form-input"
                                    value={pa.startX}
                                    onChange={e => {
                                      const next = [...editPracticeAssignments];
                                      next[idx] = {
                                        ...next[idx],
                                        startX: Math.min(4, Math.max(0, Number(e.target.value)))
                                      };
                                      setEditPracticeAssignments(next);
                                    }}
                                  />
                                </div>
                                <div className="form-group" style={{ marginBottom: 0 }}>
                                  <label>Ô Xuất Phát Y (0-4):</label>
                                  <input
                                    type="number"
                                    min={0}
                                    max={4}
                                    className="form-input"
                                    value={pa.startY}
                                    onChange={e => {
                                      const next = [...editPracticeAssignments];
                                      next[idx] = {
                                        ...next[idx],
                                        startY: Math.min(4, Math.max(0, Number(e.target.value)))
                                      };
                                      setEditPracticeAssignments(next);
                                    }}
                                  />
                                </div>
                                <div className="form-group" style={{ marginBottom: 0 }}>
                                  <label>Ô Đích X (0-4):</label>
                                  <input
                                    type="number"
                                    min={0}
                                    max={4}
                                    className="form-input"
                                    value={pa.goalX}
                                    onChange={e => {
                                      const next = [...editPracticeAssignments];
                                      next[idx] = {
                                        ...next[idx],
                                        goalX: Math.min(4, Math.max(0, Number(e.target.value)))
                                      };
                                      setEditPracticeAssignments(next);
                                    }}
                                  />
                                </div>
                                <div className="form-group" style={{ marginBottom: 0 }}>
                                  <label>Ô Đích Y (0-4):</label>
                                  <input
                                    type="number"
                                    min={0}
                                    max={4}
                                    className="form-input"
                                    value={pa.goalY}
                                    onChange={e => {
                                      const next = [...editPracticeAssignments];
                                      next[idx] = {
                                        ...next[idx],
                                        goalY: Math.min(4, Math.max(0, Number(e.target.value)))
                                      };
                                      setEditPracticeAssignments(next);
                                    }}
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div
                    style={{
                      padding: 18,
                      background: '#020617',
                      borderRadius: 10,
                      border: '1px solid var(--border-dark)',
                      color: 'var(--text-muted)',
                      fontSize: '0.9rem'
                    }}
                  >
                    Thầy cô có thể đổi tên bài học và chủ đề ở trên rồi nhấn{' '}
                    <b>"Lưu Cập Nhật Bài Học"</b>.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ================================================================
              PHÂN HỆ 4: CẤP TÀI KHOẢN & PHÂN CÔNG LỚP CHO GIÁO VIÊN
             ================================================================ */}
          {activeSection === 'teachers' && teacher.role === 'super_admin' && (
            <div className="monitor-card">
              <div className="monitor-card-header">
                <div>
                  <h3 style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                    <LuKeyRound size={18} color="#fb923c" />
                    <span>Danh Sách Tài Khoản Giáo Viên ({teachersList.length})</span>
                  </h3>
                  <span
                    style={{
                      fontSize: '0.82rem',
                      color: 'var(--text-muted)',
                      display: 'block',
                      marginTop: 4
                    }}
                  >
                    Thầy cô nào được phân công nhận lớp nào thì khi đăng nhập sẽ chỉ hiển thị đúng lớp đó
                  </span>
                </div>

                <button
                  type="button"
                  className="btn-action primary"
                  onClick={() => {
                    setNewTeacherName('');
                    setNewTeacherUsername('');
                    setNewTeacherPassword('123');
                    setNewTeacherClasses(['Robotics']);
                    setShowCreateTeacherModal(true);
                  }}
                >
                  <LuUserPlus size={16} />
                  <span>Cấp Tài Khoản Giáo Viên Mới</span>
                </button>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table className="roster-table">
                  <thead>
                    <tr>
                      <th>Họ và Tên Giáo Viên</th>
                      <th>Tài Khoản Đăng Nhập</th>
                      <th>Vai Trò</th>
                      <th>Các Lớp Được Phân Công Phụ Trách</th>
                      <th style={{ textAlign: 'right' }}>Thao Tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {teachersList.map(acc => (
                      <tr key={acc.id}>
                        <td>
                          <div className="student-cell">
                            <div className="student-cell-avatar">
                              <LuUser size={20} color="#38bdf8" />
                            </div>
                            <div>
                              <div className="student-cell-name">{acc.name}</div>
                              <div className="student-cell-time">ID: {acc.id}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <code
                            style={{
                              background: '#020617',
                              padding: '4px 10px',
                              borderRadius: 6,
                              border: '1px solid #1e293b',
                              color: '#38bdf8',
                              fontWeight: 800
                            }}
                          >
                            {acc.username}
                          </code>
                        </td>
                        <td>
                          {acc.role === 'super_admin' ? (
                            <span className="admin-role-tag super">Quản Trị Đào Tạo</span>
                          ) : (
                            <span className="admin-role-tag">Giáo Viên Bộ Môn</span>
                          )}
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                            {acc.assignedClasses.map(cid => (
                              <span key={cid} className={`badge-class ${cid.toLowerCase()}`}>
                                <ClassIcon name={cid} size={14} />
                                <span>
                                  {cid === 'Robotics' ? 'Robot (VEX GO & IQ)' : cid}
                                </span>
                              </span>
                            ))}
                          </div>
                        </td>
                        <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                          <button
                            type="button"
                            className="btn-view-code"
                            onClick={() => {
                              setEditingTeacherAcc(acc);
                              setEditTeacherAccName(acc.name);
                              setEditTeacherAccPassword('');
                              setEditTeacherAccClasses([...acc.assignedClasses]);
                            }}
                          >
                            <LuPencil size={13} />
                            <span>Phân công lớp / Đổi MK</span>
                          </button>
                          {acc.role !== 'super_admin' && (
                            <button
                              type="button"
                              className="btn-delete-student"
                              onClick={() => handleDeleteTeacherAccount(acc)}
                            >
                              <LuTrash2 size={13} />
                              <span>Xóa</span>
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Modal Thêm Học Sinh (Chỉ cho phép chọn các lớp giáo viên này phụ trách) */}
      <div
        className={`modal-backdrop ${showAddModal ? 'active' : ''}`}
        onClick={e => {
          if (e.target === e.currentTarget) setShowAddModal(false);
        }}
      >
        <div className="modal-box" style={{ maxWidth: 500 }}>
          <div className="modal-header">
            <h3 style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <LuUserPlus size={20} color="#fb7185" />
              <span>
                {bulkMode
                  ? 'Nhập Danh Sách Học Sinh Theo Lô'
                  : 'Thêm Học Sinh Vào Lớp'}
              </span>
            </h3>
            <button
              type="button"
              className="btn-close"
              onClick={() => setShowAddModal(false)}
            >
              &times;
            </button>
          </div>
          <div className="modal-body">
            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              <button
                type="button"
                className={`btn-action ${!bulkMode ? 'primary' : ''}`}
                style={{ flex: 1, justifyContent: 'center' }}
                onClick={() => setBulkMode(false)}
              >
                <LuUserPlus size={15} />
                <span>Thêm 1 Học Sinh</span>
              </button>
              <button
                type="button"
                className={`btn-action ${bulkMode ? 'primary' : ''}`}
                style={{ flex: 1, justifyContent: 'center' }}
                onClick={() => setBulkMode(true)}
              >
                <LuListPlus size={15} />
                <span>Thêm Nhiều Học Sinh</span>
              </button>
            </div>

            <div className="form-group">
              <label>Lớp Học Phụ Trách:</label>
              <select
                className="form-select"
                value={newStudentClass}
                onChange={e => setNewStudentClass(e.target.value as ValidClassId)}
              >
                {allowedClassOptions.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {bulkMode ? (
              <div className="form-group">
                <label>Danh sách Họ và Tên (Mỗi dòng 1 học sinh):</label>
                <textarea
                  className="form-input"
                  rows={6}
                  placeholder={`Nguyễn Minh An\nTrần Bảo Ngọc\nLê Hoàng Nam`}
                  value={bulkNamesText}
                  onChange={e => setBulkNamesText(e.target.value)}
                  style={{ resize: 'vertical', fontFamily: 'inherit' }}
                />
              </div>
            ) : (
              <div className="form-group">
                <label>Họ và Tên Học Sinh:</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Ví dụ: Nguyễn Minh An..."
                  value={newStudentName}
                  onChange={e => setNewStudentName(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') handleCreateStudent();
                  }}
                />
              </div>
            )}

            <button
              type="button"
              className="btn-submit-modal"
              onClick={handleCreateStudent}
            >
              {bulkMode ? 'Thêm Toàn Bộ Danh Sách Vào Lớp' : 'Xác Nhận Thêm Vào Lớp'}
            </button>
          </div>
        </div>
      </div>

      {/* Modal Sửa Thông Tin Học Sinh */}
      <div
        className={`modal-backdrop ${editingStudent ? 'active' : ''}`}
        onClick={e => {
          if (e.target === e.currentTarget) setEditingStudent(null);
        }}
      >
        <div className="modal-box" style={{ maxWidth: 440 }}>
          <div className="modal-header">
            <h3 style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <LuPencil size={18} color="#38bdf8" />
              <span>Cập Nhật Thông Tin Học Sinh</span>
            </h3>
            <button
              type="button"
              className="btn-close"
              onClick={() => setEditingStudent(null)}
            >
              &times;
            </button>
          </div>
          <div className="modal-body">
            <div className="form-group">
              <label>Họ và Tên Học Sinh:</label>
              <input
                type="text"
                className="form-input"
                value={editStudentName}
                onChange={e => setEditStudentName(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Lớp / Bộ Môn:</label>
              <select
                className="form-select"
                value={editStudentClass}
                onChange={e => setEditStudentClass(e.target.value as ValidClassId)}
              >
                {allowedClassOptions.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="button"
              className="btn-submit-modal"
              onClick={handleSaveEditStudent}
            >
              Lưu Thay Đổi
            </button>
          </div>
        </div>
      </div>

      {/* Modal Cấp Tài Khoản Giáo Viên Mới */}
      <div
        className={`modal-backdrop ${showCreateTeacherModal ? 'active' : ''}`}
        onClick={e => {
          if (e.target === e.currentTarget) setShowCreateTeacherModal(false);
        }}
      >
        <div className="modal-box" style={{ maxWidth: 500 }}>
          <div className="modal-header">
            <h3 style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <LuKeyRound size={19} color="#fb923c" />
              <span>Cấp Tài Khoản &amp; Phân Công Lớp Cho Giáo Viên</span>
            </h3>
            <button
              type="button"
              className="btn-close"
              onClick={() => setShowCreateTeacherModal(false)}
            >
              &times;
            </button>
          </div>
          <div className="modal-body">
            <div className="form-group">
              <label>Họ và Tên Giáo Viên:</label>
              <input
                type="text"
                className="form-input"
                placeholder="Ví dụ: Cô Nguyễn Thu Hà..."
                value={newTeacherName}
                onChange={e => setNewTeacherName(e.target.value)}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group">
                <label>Tài Khoản Đăng Nhập (Username):</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Ví dụ: gv_thuha"
                  value={newTeacherUsername}
                  onChange={e => setNewTeacherUsername(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Mật Khẩu Cấp:</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Ví dụ: 123"
                  value={newTeacherPassword}
                  onChange={e => setNewTeacherPassword(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Phân Công Lớp Phụ Trách (Chọn 1 hoặc nhiều lớp):</label>
              <div className="admin-class-checkbox-grid">
                {ALL_CLASS_OPTIONS.map(c => {
                  const checked = newTeacherClasses.includes(c.id);
                  return (
                    <div
                      key={c.id}
                      className={`admin-class-checkbox-item ${checked ? 'checked' : ''}`}
                      onClick={() =>
                        toggleClassInList(c.id, newTeacherClasses, setNewTeacherClasses)
                      }
                    >
                      <ClassIcon name={c.id} size={18} />
                      <span style={{ flex: 1 }}>{c.name}</span>
                      {checked && <LuCheck size={16} color="#34d399" />}
                    </div>
                  );
                })}
              </div>
            </div>

            <button
              type="button"
              className="btn-submit-modal"
              onClick={handleCreateTeacherAccount}
            >
              Cấp Tài Khoản Giáo Viên
            </button>
          </div>
        </div>
      </div>

      {/* Modal Chỉnh Sửa Phân Công Lớp Của Giáo Viên */}
      <div
        className={`modal-backdrop ${editingTeacherAcc ? 'active' : ''}`}
        onClick={e => {
          if (e.target === e.currentTarget) setEditingTeacherAcc(null);
        }}
      >
        <div className="modal-box" style={{ maxWidth: 500 }}>
          <div className="modal-header">
            <h3 style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <LuPencil size={18} color="#38bdf8" />
              <span>Cập Nhật Phân Công Lớp ({editingTeacherAcc?.username})</span>
            </h3>
            <button
              type="button"
              className="btn-close"
              onClick={() => setEditingTeacherAcc(null)}
            >
              &times;
            </button>
          </div>
          <div className="modal-body">
            <div className="form-group">
              <label>Họ và Tên Giáo Viên:</label>
              <input
                type="text"
                className="form-input"
                value={editTeacherAccName}
                onChange={e => setEditTeacherAccName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Đổi Mật Khẩu Mới (Để trống nếu giữ nguyên):</label>
              <input
                type="text"
                className="form-input"
                placeholder="Nhập mật khẩu mới nếu cần đổi..."
                value={editTeacherAccPassword}
                onChange={e => setEditTeacherAccPassword(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Các Lớp Được Phân Công Phụ Trách:</label>
              <div className="admin-class-checkbox-grid">
                {ALL_CLASS_OPTIONS.map(c => {
                  const checked = editTeacherAccClasses.includes(c.id);
                  return (
                    <div
                      key={c.id}
                      className={`admin-class-checkbox-item ${checked ? 'checked' : ''}`}
                      onClick={() =>
                        toggleClassInList(
                          c.id,
                          editTeacherAccClasses,
                          setEditTeacherAccClasses
                        )
                      }
                    >
                      <ClassIcon name={c.id} size={18} />
                      <span style={{ flex: 1 }}>{c.name}</span>
                      {checked && <LuCheck size={16} color="#34d399" />}
                    </div>
                  );
                })}
              </div>
            </div>

            <button
              type="button"
              className="btn-submit-modal"
              onClick={handleSaveEditTeacherAcc}
            >
              Lưu Phân Công Lớp
            </button>
          </div>
        </div>
      </div>

      {/* Modal Xem Chi Tiết Bài Làm Của Học Sinh */}
      <div
        className={`modal-backdrop ${codeModalData ? 'active' : ''}`}
        onClick={e => {
          if (e.target === e.currentTarget) setCodeModalData(null);
        }}
      >
        <div className="modal-box">
          <div className="modal-header">
            <h3>
              {codeModalData
                ? `${codeModalData.studentName} (${codeModalData.classId}) — Bài ${codeModalData.lessonOrder}: ${codeModalData.lessonTitle}`
                : 'Chi tiết bài nộp'}
            </h3>
            <button
              type="button"
              className="btn-close"
              onClick={() => setCodeModalData(null)}
            >
              &times;
            </button>
          </div>
          <div className="modal-body">
            {codeModalData && (
              <>
                <div
                  style={{
                    marginBottom: 12,
                    fontSize: '0.85rem',
                    color: 'var(--text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    flexWrap: 'wrap'
                  }}
                >
                  <span>Trạng thái:</span>
                  <strong
                    style={{
                      color: codeModalData.status === 'passed' ? '#34d399' : '#f87171',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4
                    }}
                  >
                    {codeModalData.status === 'passed' ? (
                      <>
                        <LuCircleCheck size={15} />
                        <span>ĐẠT YÊU CẦU</span>
                      </>
                    ) : (
                      <>
                        <LuCircleX size={15} />
                        <span>CHƯA ĐẠT</span>
                      </>
                    )}
                  </strong>
                  <span>• Số lần nộp: {codeModalData.attempts}</span>
                  <span>
                    • Lần cuối:{' '}
                    {codeModalData.lastSubmittedAt
                      ? new Date(codeModalData.lastSubmittedAt).toLocaleTimeString('vi-VN')
                      : 'N/A'}
                  </span>
                </div>
                <pre className="code-preview-box">{codeModalData.code}</pre>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
