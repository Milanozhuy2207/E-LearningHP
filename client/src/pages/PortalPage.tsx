import React, { useEffect, useState } from 'react';
import {
  LuUser,
  LuZap,
  LuSearch,
  LuPlus,
  LuCheck
} from 'react-icons/lu';
import { ClassIcon, StudentAvatarIcon } from '../components/ClassIcon';

export interface ClassInfo {
  id: 'Web' | 'Python' | 'Unity' | 'Robotics';
  name: string;
  icon: string;
  description: string;
  studentCount: number;
}

export interface StudentRecord {
  id: string;
  name: string;
  classId: 'Web' | 'Python' | 'Unity' | 'Robotics';
  teacherId?: string;
  teacherName?: string;
  avatar: string;
  createdAt?: string;
  lastActive?: string;
  progress: Record<string, any>;
  passedCount?: number;
  totalLessons?: number;
  percent?: number;
}

interface TeacherOption {
  id: string;
  username: string;
  name: string;
  role: 'super_admin' | 'teacher';
  assignedClasses: ('Web' | 'Python' | 'Unity' | 'Robotics')[];
}

interface PortalPageProps {
  onSelectStudent: (student: StudentRecord) => void;
}

export const PortalPage: React.FC<PortalPageProps> = ({
  onSelectStudent
}) => {
  const [classes, setClasses] = useState<ClassInfo[]>([]);
  const [teachers, setTeachers] = useState<TeacherOption[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<'Web' | 'Python' | 'Unity' | 'Robotics'>('Robotics');
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>('');
  const [studentsInClass, setStudentsInClass] = useState<StudentRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [newStudentName, setNewStudentName] = useState('');
  const [loadingRoster, setLoadingRoster] = useState(true);

  useEffect(() => {
    fetch('/api/classes')
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.classes)) {
          setClasses(data.classes);
        }
      })
      .catch(err => console.error('Lỗi tải lớp học:', err));

    fetch('/api/admin/teachers')
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.teachers)) {
          setTeachers(data.teachers);
        }
      })
      .catch(err => console.error('Lỗi tải danh sách giáo viên:', err));
  }, []);

  // Teachers who teach the currently selected class (excluding super_admin unless no specific teacher exists)
  const classTeachers = teachers.filter(
    t => t.role === 'teacher' && t.assignedClasses.includes(selectedClassId)
  );

  useEffect(() => {
    if (classTeachers.length > 0) {
      if (!classTeachers.some(t => t.id === selectedTeacherId)) {
        setSelectedTeacherId(classTeachers[0].id);
      }
    } else {
      setSelectedTeacherId('');
    }
  }, [selectedClassId, teachers]);

  useEffect(() => {
    setLoadingRoster(true);
    fetch(`/api/students?class=${selectedClassId}`)
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.students)) {
          setStudentsInClass(data.students);
        }
      })
      .catch(err => console.error('Lỗi tải danh sách học sinh:', err))
      .finally(() => setLoadingRoster(false));
  }, [selectedClassId]);

  const currentClassObj = classes.find(c => c.id === selectedClassId);
  const currentTeacherObj = classTeachers.find(t => t.id === selectedTeacherId);

  // Filter students by selectedTeacherId (so each class only sees students of that teacher)
  const studentsByTeacher = selectedTeacherId
    ? studentsInClass.filter(
        s => !s.teacherId || s.teacherId === selectedTeacherId
      )
    : studentsInClass;

  const filteredStudents = studentsByTeacher.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase().trim())
  );

  const handleLoginById = async (studentId: string) => {
    try {
      const res = await fetch('/api/students/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId })
      });
      const data = await res.json();
      if (data.success && data.student) {
        sessionStorage.setItem('currentStudent', JSON.stringify(data.student));
        onSelectStudent(data.student);
      } else {
        alert(data.message || 'Lỗi đăng nhập');
      }
    } catch {
      alert('Không thể kết nối đến máy chủ.');
    }
  };

  const handleJoinAsNew = async () => {
    const clean = newStudentName.trim();
    if (!clean) {
      alert('Vui lòng nhập họ và tên của bạn!');
      return;
    }
    try {
      const res = await fetch('/api/students/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: clean,
          classId: selectedClassId,
          teacherId: currentTeacherObj?.id,
          teacherName: currentTeacherObj?.name
        })
      });
      const data = await res.json();
      if (data.success && data.student) {
        sessionStorage.setItem('currentStudent', JSON.stringify(data.student));
        onSelectStudent(data.student);
      } else {
        alert(data.message || 'Lỗi đăng ký');
      }
    } catch {
      alert('Lỗi kết nối máy chủ');
    }
  };

  return (
    <div className="portal-wrapper">
      <header className="portal-header">
        <div className="brand">
          <div className="brand-logo">M</div>
          <div className="brand-title">
            <h1>MINDX TECHNOLOGY SCHOOL</h1>
            <p>Cổng Học Tập &amp; Bài Tập Về Nhà Dành Cho Học Sinh</p>
          </div>
        </div>
      </header>

      <main className="portal-main">
        <div className="hero-banner">
          <div className="hero-badge">
            <LuZap size={16} className="react-icon" />
            <span>CHÀO MỪNG CÁC BẠN HỌC SINH MINDX</span>
          </div>
          <h2>
            Vào Lớp &amp; <span>Làm Bài Tập Theo Giáo Viên</span>
          </h2>
          <p>
            Chọn bộ môn, chọn đúng Thầy/Cô phụ trách lớp của bạn để nhận đúng đề bài tập về nhà nhé!
          </p>
        </div>

        {/* Bước 1: Chọn bộ môn học */}
        <div>
          <div className="section-title">
            <div className="step-number">1</div>
            <h3>Chọn Bộ Môn Học Của Bạn:</h3>
          </div>
          <div className="classes-grid">
            {classes.map(c => (
              <div
                key={c.id}
                className={`class-card ${c.id.toLowerCase()} ${
                  c.id === selectedClassId ? 'active' : ''
                }`}
                onClick={() => setSelectedClassId(c.id)}
              >
                <div className="class-card-header">
                  <div className="class-icon">
                    <ClassIcon name={c.icon || c.id} size={30} />
                  </div>
                  <span className="class-count">{c.studentCount || 0} học sinh</span>
                </div>
                <h4>{c.name}</h4>
                <p>{c.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bước 2: Chọn Giáo viên phụ trách lớp (để học & làm đúng bài tập về nhà của giáo viên đó) */}
        {classTeachers.length > 0 && (
          <div>
            <div className="section-title">
              <div className="step-number">2</div>
              <h3>Chọn Giáo Viên Phụ Trách Lớp Của Bạn (Để Nhận Đúng Bài Tập Về Nhà):</h3>
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                gap: 14
              }}
            >
              {classTeachers.map(t => {
                const isSelected = t.id === selectedTeacherId;
                const countInTeacherClass = studentsInClass.filter(
                  s => s.teacherId === t.id
                ).length;
                return (
                  <div
                    key={t.id}
                    onClick={() => setSelectedTeacherId(t.id)}
                    style={{
                      background: isSelected
                        ? 'rgba(56, 189, 248, 0.14)'
                        : 'var(--card-dark)',
                      border: isSelected
                        ? '2px solid #38bdf8'
                        : '1.5px solid var(--border-dark)',
                      borderRadius: 14,
                      padding: '16px 18px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 12,
                      transition: 'all 0.2s'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div
                        style={{
                          width: 44,
                          height: 44,
                          borderRadius: 12,
                          background: isSelected
                            ? 'rgba(56, 189, 248, 0.22)'
                            : 'rgba(255,255,255,0.05)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#38bdf8'
                        }}
                      >
                        <LuUser size={22} />
                      </div>
                      <div>
                        <div
                          style={{
                            fontWeight: 900,
                            fontSize: '0.96rem',
                            color: '#ffffff'
                          }}
                        >
                          {t.name}
                        </div>
                        <div
                          style={{
                            fontSize: '0.8rem',
                            color: isSelected ? '#7dd3fc' : 'var(--text-muted)',
                            marginTop: 2,
                            fontWeight: 700
                          }}
                        >
                          {countInTeacherClass} học sinh • Có bộ Bài tập về nhà riêng
                        </div>
                      </div>
                    </div>
                    {isSelected && (
                      <span
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: '50%',
                          background: '#38bdf8',
                          color: '#020617',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <LuCheck size={16} />
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Bước 3: Chọn tên học sinh */}
        <div>
          <div className="section-title">
            <div className="step-number">{classTeachers.length > 0 ? 3 : 2}</div>
            <h3>
              Chọn Tên Bạn Trong Danh Sách Lớp:{' '}
              {currentClassObj && (
                <span
                  style={{
                    color: 'var(--mindx-red)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    verticalAlign: 'middle'
                  }}
                >
                  <ClassIcon name={currentClassObj.icon || currentClassObj.id} size={18} />
                  <span>
                    {currentClassObj.name}
                    {currentTeacherObj ? ` — ${currentTeacherObj.name}` : ''}
                  </span>
                </span>
              )}
            </h3>
          </div>

          <div className="student-roster-box">
            <div className="roster-header">
              <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                {loadingRoster
                  ? 'Đang tải danh sách học sinh...'
                  : `Danh sách ${studentsByTeacher.length} học sinh ${
                      currentTeacherObj ? `thuộc ${currentTeacherObj.name}` : `lớp ${selectedClassId}`
                    }:`}
              </span>
              <div className="search-input-box">
                <span className="search-icon">
                  <LuSearch size={16} />
                </span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Tìm kiếm tên của bạn..."
                />
              </div>
            </div>

            <div className="students-cards-grid">
              {filteredStudents.length === 0 ? (
                <div
                  style={{
                    gridColumn: '1 / -1',
                    padding: 24,
                    textAlign: 'center',
                    color: 'var(--text-muted)'
                  }}
                >
                  Chưa có học sinh nào trong lớp này. Hãy nhập tên ở phía dưới để tham gia lớp của{' '}
                  <strong>{currentTeacherObj ? currentTeacherObj.name : selectedClassId}</strong> nhé!
                </div>
              ) : (
                filteredStudents.map(std => (
                  <div
                    key={std.id}
                    className="student-item-card"
                    onClick={() => handleLoginById(std.id)}
                  >
                    <div className="student-avatar-box">
                      <StudentAvatarIcon avatar={std.avatar} size={22} />
                    </div>
                    <div className="student-info-box">
                      <div className="student-name-text">{std.name}</div>
                      {std.teacherName && (
                        <div
                          style={{
                            fontSize: '0.73rem',
                            color: '#38bdf8',
                            fontWeight: 700,
                            marginBottom: 2
                          }}
                        >
                          GV: {std.teacherName}
                        </div>
                      )}
                      <div className="student-progress-text">
                        Tiến độ: {std.percent || 0}% ({std.passedCount || 0}/
                        {std.totalLessons || 7} bài)
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="new-student-form-box">
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                <LuUser size={16} color="#38bdf8" className="react-icon" />
                <span>
                  Bạn là học sinh mới của{' '}
                  <strong style={{ color: '#38bdf8' }}>
                    {currentTeacherObj ? currentTeacherObj.name : `Lớp ${selectedClassId}`}
                  </strong>
                  ?
                </span>
              </span>
              <input
                type="text"
                className="new-student-input"
                value={newStudentName}
                onChange={e => setNewStudentName(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') handleJoinAsNew();
                }}
                placeholder="Nhập họ và tên của bạn..."
              />
              <button type="button" className="btn-join" onClick={handleJoinAsNew}>
                <LuPlus size={16} className="react-icon" />
                <span>Tham Gia Lớp</span>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
