import React, { useEffect, useState } from 'react';
import {
  LuUser,
  LuSparkles,
  LuSearch,
  LuPlus,
  LuCheck,
  LuSmile,
  LuArrowRight,
  LuBookOpen
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
      alert('Bạn nhỏ ơi, hãy nhập họ và tên của mình trước khi vào lớp nhé!');
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
            <p>Không Gian Học Tập &amp; Sáng Tạo Thân Thiện Cho Học Sinh</p>
          </div>
        </div>
      </header>

      <main className="portal-main">
        <div className="hero-banner">
          <div className="hero-badge">
            <LuSparkles size={16} className="react-icon" />
            <span>CHÀO MỪNG BẠN ĐẾN VỚI LỚP HỌC CÔNG NGHỆ MINDX</span>
          </div>
          <h2>
            Hôm Nay Mình Cùng <span>Khám Phá &amp; Sáng Tạo</span> Nhé!
          </h2>
          <p>
            Chỉ với 3 bước đơn giản bên dưới để vào đúng lớp của Thầy/Cô và nhận bài tập về nhà hôm nay.
          </p>
        </div>

        {/* Bước 1: Chọn môn học */}
        <div className="friendly-step-section">
          <div className="section-title">
            <div className="step-number">1</div>
            <div>
              <h3>Chọn Môn Học Yêu Thích Của Bạn</h3>
              <p className="step-subtitle">Bấm vào thẻ môn học mà bạn đang theo học tại MindX</p>
            </div>
          </div>
          <div className="classes-grid">
            {classes.map(c => {
              const isSelected = c.id === selectedClassId;
              return (
                <div
                  key={c.id}
                  className={`class-card ${c.id.toLowerCase()} ${
                    isSelected ? 'active' : ''
                  }`}
                  onClick={() => setSelectedClassId(c.id)}
                >
                  <div className="class-card-header">
                    <div className="class-icon">
                      <ClassIcon name={c.icon || c.id} size={30} />
                    </div>
                    <span className="class-count">
                      {isSelected ? 'Đang chọn' : `${c.studentCount || 0} bạn`}
                    </span>
                  </div>
                  <h4>{c.name}</h4>
                  <p>{c.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bước 2: Chọn Giáo viên phụ trách lớp */}
        {classTeachers.length > 0 && (
          <div className="friendly-step-section">
            <div className="section-title">
              <div className="step-number">2</div>
              <div>
                <h3>Chọn Lớp Của Thầy/Cô Đang Dạy Bạn</h3>
                <p className="step-subtitle">
                  Chọn đúng Thầy/Cô để nhận đúng Bài Tập Về Nhà &amp; Đề Thực Hành của lớp mình nhé!
                </p>
              </div>
            </div>
            <div className="teacher-select-grid">
              {classTeachers.map(t => {
                const isSelected = t.id === selectedTeacherId;
                const countInTeacherClass = studentsInClass.filter(
                  s => s.teacherId === t.id
                ).length;
                return (
                  <div
                    key={t.id}
                    className={`teacher-select-card ${isSelected ? 'active' : ''}`}
                    onClick={() => setSelectedTeacherId(t.id)}
                  >
                    <div className="teacher-select-left">
                      <div className="teacher-select-avatar">
                        <LuUser size={22} />
                      </div>
                      <div>
                        <div className="teacher-select-name">{t.name}</div>
                        <div className="teacher-select-meta">
                          <LuBookOpen size={13} />
                          <span>
                            {countInTeacherClass} bạn học sinh &bull; Bài tập về nhà riêng của lớp
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className={`teacher-select-check ${isSelected ? 'active' : ''}`}>
                      <LuCheck size={16} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Bước 3: Chọn tên học sinh */}
        <div className="friendly-step-section">
          <div className="section-title">
            <div className="step-number">{classTeachers.length > 0 ? 3 : 2}</div>
            <div>
              <h3>
                Bấm Vào Tên Của Bạn Để Vào Lớp Ngay{' '}
                {currentTeacherObj && (
                  <span className="selected-teacher-inline">
                    ({currentTeacherObj.name})
                  </span>
                )}
              </h3>
              <p className="step-subtitle">
                Tìm tên của bạn trong danh sách bên dưới hoặc nhập tên mới nếu đây là buổi đầu tiên
              </p>
            </div>
          </div>

          <div className="student-roster-box">
            <div className="roster-header">
              <span className="roster-count-label">
                <LuSmile size={18} color="#fbbf24" />
                <span>
                  {loadingRoster
                    ? 'Đang mở sổ điểm danh lớp...'
                    : `Có ${studentsByTeacher.length} bạn trong lớp ${
                        currentTeacherObj ? currentTeacherObj.name : selectedClassId
                      }:`}
                </span>
              </span>
              <div className="search-input-box">
                <span className="search-icon">
                  <LuSearch size={16} />
                </span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Gõ tên của bạn để tìm nhanh..."
                />
              </div>
            </div>

            <div className="students-cards-grid">
              {filteredStudents.length === 0 ? (
                <div className="empty-roster-friendly">
                  Chưa thấy tên của bạn trong lớp này. Hãy nhập tên vào ô bên dưới để vào lớp của{' '}
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
                        <div className="student-teacher-sub">
                          GV: {std.teacherName}
                        </div>
                      )}
                      <div className="student-progress-text">
                        Đã hoàn thành: <strong>{std.passedCount || 0}/{std.totalLessons || 7} bài</strong> ({std.percent || 0}%)
                      </div>
                    </div>
                    <div className="student-enter-arrow" title="Vào học ngay">
                      <LuArrowRight size={16} />
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="new-student-form-box">
              <span className="new-student-label">
                <LuUser size={18} color="#38bdf8" className="react-icon" />
                <span>
                  Bạn mới vào lớp của{' '}
                  <strong style={{ color: '#7dd3fc' }}>
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
                placeholder="Nhập họ và tên của bạn vào đây..."
              />
              <button type="button" className="btn-join" onClick={handleJoinAsNew}>
                <LuPlus size={16} className="react-icon" />
                <span>Vào Lớp Học Ngay</span>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
