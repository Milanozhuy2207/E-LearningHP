let allStudents = [];
let lessons = [];
let lessonsByClass = {};
let currentFilterClass = "All";
let selectedStudent = null;

document.addEventListener("DOMContentLoaded", async () => {
  if (window.Icons) {
    document.getElementById("addStudentBtnIcon").innerHTML = Icons.get("userPlus", { size: 16 });
    document.getElementById("refreshBtnIcon").innerHTML = Icons.get("rotateCcw", { size: 16 });
    document.getElementById("homeBtnIcon").innerHTML = Icons.get("home", { size: 16 });
    document.getElementById("resetClassBtnIcon").innerHTML = Icons.get("alertTriangle", { size: 16 });
    document.getElementById("statIconUsers").innerHTML = Icons.get("users", { size: 28 });
    document.getElementById("statIconProgress").innerHTML = Icons.get("trendingUp", { size: 28 });
    document.getElementById("statIconTrophy").innerHTML = Icons.get("trophy", { size: 28 });
    document.getElementById("statIconLessons").innerHTML = Icons.get("fileCode", { size: 28 });
    document.getElementById("tabIconAll").innerHTML = Icons.get("sparkles", { size: 16 });
    document.getElementById("tabIconWeb").innerHTML = Icons.get("web", { size: 16 });
    document.getElementById("tabIconPython").innerHTML = Icons.get("python", { size: 16 });
    document.getElementById("tabIconUnity").innerHTML = Icons.get("unity", { size: 16 });
    const tabIconRobotics = document.getElementById("tabIconRobotics");
    if (tabIconRobotics) tabIconRobotics.innerHTML = Icons.get("robotics", { size: 16 });
  }

  await fetchLessonsList();
  await loadDashboard();

  // Tự động làm mới dữ liệu mỗi 5 giây
  setInterval(loadDashboard, 5000);

  // Sự kiện nút bấm
  document.getElementById("btnRefresh").addEventListener("click", loadDashboard);
  document.getElementById("btnResetClass").addEventListener("click", resetClassData);

  // Tab Lọc Lớp
  setupFilterTabs();

  // Modal Thêm Học Sinh
  setupAddStudentModal();

  // Modal Xem Code
  setupCodeModal();
});

// Lấy danh sách bài học của toàn bộ các lớp
async function fetchLessonsList() {
  try {
    const res = await fetch("/api/lessons?class=All");
    const data = await res.json();
    if (data.success) {
      lessons = data.lessons || [];
      lessonsByClass = data.lessonsByClass || { Web: lessons };
      document.getElementById("statTotalLessons").textContent = lessons.length;
    }
  } catch (err) {
    console.error("Lỗi lấy danh sách bài học:", err);
  }
}

// Tải dữ liệu bảng điều khiển
async function loadDashboard() {
  try {
    const res = await fetch("/api/students");
    const data = await res.json();
    if (!data.success) return;

    allStudents = data.students || [];

    // Cập nhật số lượng đếm trên từng Tab
    const countWeb = allStudents.filter(s => s.classId === "Web").length;
    const countPython = allStudents.filter(s => s.classId === "Python").length;
    const countUnity = allStudents.filter(s => s.classId === "Unity").length;
    const countRobotics = allStudents.filter(s => s.classId === "Robotics").length;

    document.getElementById("badgeCountAll").textContent = `(${allStudents.length})`;
    document.getElementById("badgeCountWeb").textContent = `(${countWeb})`;
    document.getElementById("badgeCountPython").textContent = `(${countPython})`;
    document.getElementById("badgeCountUnity").textContent = `(${countUnity})`;
    const badgeRobotics = document.getElementById("badgeCountRobotics");
    if (badgeRobotics) badgeRobotics.textContent = `(${countRobotics})`;

    // Lọc danh sách học sinh theo tab hiện tại
    const displayList = currentFilterClass === "All"
      ? allStudents
      : allStudents.filter(s => s.classId === currentFilterClass);

    // Cập nhật thống kê
    const totalStudents = displayList.length;
    let totalProgressSum = 0;
    let completedCount = 0;

    displayList.forEach(s => {
      totalProgressSum += s.percent || 0;
      if (s.percent === 100) completedCount++;
    });

    const avgProgress = totalStudents > 0 ? Math.round(totalProgressSum / totalStudents) : 0;

    document.getElementById("statTotalStudents").textContent = totalStudents;
    document.getElementById("statAvgProgress").textContent = `${avgProgress}%`;
    document.getElementById("statCompletedStudents").textContent = completedCount;

    // Render bảng học sinh
    renderStudentsTable(displayList);
  } catch (err) {
    console.error("Lỗi tải bảng điều khiển:", err);
  }
}

// Cài đặt các Tab lọc
function setupFilterTabs() {
  const tabs = [
    { id: "tabFilterAll", classId: "All", label: "Tất cả các lớp" },
    { id: "tabFilterWeb", classId: "Web", label: "Lớp Lập Trình Web (JavaScript)" },
    { id: "tabFilterPython", classId: "Python", label: "Lớp Lập Trình Python" },
    { id: "tabFilterUnity", classId: "Unity", label: "Lớp Phát Triển Game Unity" },
    { id: "tabFilterRobotics", classId: "Robotics", label: "Lớp Lập Trình Robot (VEX GO & VEX IQ)" }
  ];

  tabs.forEach(tab => {
    const tabEl = document.getElementById(tab.id);
    if (!tabEl) return;
    tabEl.addEventListener("click", () => {
      currentFilterClass = tab.classId;

      // Cập nhật giao diện active của tabs
      document.querySelectorAll(".filter-tab-btn").forEach(btn => btn.classList.remove("active"));
      tabEl.classList.add("active");

      document.getElementById("currentFilterLabel").textContent = tab.label;
      document.getElementById("tableSubTitle").textContent = `Hiển thị ${tab.label} • Tự động cập nhật mỗi 5 giây`;

      loadDashboard();
    });
  });
}

// Render danh sách học sinh ra bảng
function renderStudentsTable(list) {
  const tbody = document.getElementById("studentsTableBody");
  tbody.innerHTML = "";

  if (list.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5" style="text-align: center; padding: 48px; color: var(--text-muted);">
          Chưa có học sinh nào trong ${currentFilterClass === "All" ? "hệ thống" : `lớp ${currentFilterClass}`}. 
          Hãy bấm nút <strong>"+ Thêm Học Sinh"</strong> ở trên để thêm bạn vào lớp nhé!
        </td>
      </tr>
    `;
    return;
  }

  list.forEach(s => {
    const tr = document.createElement("tr");

    // Format thời gian hoạt động
    let timeText = "Vừa xong";
    if (s.lastActive) {
      const d = new Date(s.lastActive);
      timeText = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + " " + d.toLocaleDateString();
    }

    // Badge Lớp học
    const classId = s.classId || "Web";
    const classBadgeMap = {
      Python: "python",
      Unity: "unity",
      Robotics: "robotics",
      Web: "web"
    };
    const classBadgeCls = classBadgeMap[classId] || "web";
    const classIconSvg = window.Icons ? Icons.get(classBadgeCls, { size: 14 }) : "";

    // Lấy danh sách bài học đúng theo bộ môn của học sinh
    const studentLessons = lessonsByClass[classId] || lessons;

    // Render pills từng bài học
    const pillsHtml = studentLessons.map(l => {
      const prog = (s.progress || {})[l.id];
      let cls = "unattempted";
      let title = `Bài ${l.order} (${l.title}): Chưa làm`;

      if (prog) {
        if (prog.status === "passed") {
          cls = "passed";
          title = `Bài ${l.order} (${l.title}): Đã đạt (${prog.attempts || 1} lần thử)`;
        } else {
          cls = "in_progress";
          title = `Bài ${l.order} (${l.title}): Đang làm / Chưa đạt (${prog.attempts || 1} lần thử)`;
        }
      }

      return `<span class="lesson-pill ${cls}" title="${title}">${l.order}</span>`;
    }).join("");

    const avatarSvg = window.Icons ? Icons.avatar(s.avatar, { size: 22 }) : (s.avatar || "⚡");

    tr.innerHTML = `
      <td>
        <div class="student-col">
          <span class="student-avatar">${avatarSvg}</span>
          <div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <span class="student-name">${escapeHtml(s.name)}</span>
              <span class="badge-class ${classBadgeCls}" style="display: inline-flex; align-items: center; gap: 6px;">
                ${classIconSvg}
                <span>${classId === "Robotics" ? "Robot VEX" : classId}</span>
              </span>
            </div>
            <div class="student-sub">ID: ${s.id}</div>
          </div>
        </div>
      </td>
      <td>
        <div class="progress-cell">
          <div style="display: flex; justify-content: space-between; font-size: 0.8rem; font-weight: 800; margin-bottom: 3px;">
            <span>${s.passedCount || 0}/${studentLessons.length} bài</span>
            <span style="color: ${s.percent === 100 ? '#34d399' : '#ffffff'};">${s.percent || 0}%</span>
          </div>
          <div class="mini-progress-bar">
            <div class="mini-progress-fill" style="width: ${s.percent || 0}%"></div>
          </div>
        </div>
      </td>
      <td>
        <div class="lessons-pill-group">
          ${pillsHtml}
        </div>
      </td>
      <td style="color: var(--text-muted); font-size: 0.82rem;">
        ${timeText}
      </td>
      <td>
        <div class="action-buttons">
          <button class="btn-action-view" onclick="openCodeModal('${s.id}')" style="display: inline-flex; align-items: center; gap: 6px;">
            ${window.Icons ? Icons.get('eye', { size: 14 }) : '🔍'}
            <span>Xem Code</span>
          </button>
          <button class="btn-action-delete" title="Xóa học sinh khỏi lớp" onclick="deleteStudent('${s.id}', '${escapeHtml(s.name)}')">
            ${window.Icons ? Icons.get('trash2', { size: 14 }) : '🗑️'}
          </button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// Cài đặt Modal Thêm Học Sinh
function setupAddStudentModal() {
  const modal = document.getElementById("addStudentModal");
  const btnOpen = document.getElementById("btnOpenAddStudent");
  const btnClose = document.getElementById("btnCloseAddStudent");
  const btnCancel = document.getElementById("btnCancelAddStudent");
  const btnConfirm = document.getElementById("btnConfirmAddStudent");

  btnOpen.addEventListener("click", () => {
    document.getElementById("addStudentName").value = "";
    if (currentFilterClass !== "All") {
      document.getElementById("addStudentClass").value = currentFilterClass;
    }
    modal.classList.add("active");
    document.getElementById("addStudentName").focus();
  });

  const closeModal = () => modal.classList.remove("active");
  btnClose.addEventListener("click", closeModal);
  btnCancel.addEventListener("click", closeModal);
  modal.addEventListener("click", (e) => {
    if (e.target.id === "addStudentModal") closeModal();
  });

  btnConfirm.addEventListener("click", async () => {
    const name = document.getElementById("addStudentName").value.trim();
    const classId = document.getElementById("addStudentClass").value;

    if (!name) {
      alert("Vui lòng nhập họ và tên học sinh!");
      return;
    }

    try {
      const res = await fetch("/api/students/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, classId })
      });
      const data = await res.json();
      if (data.success) {
        closeModal();
        await loadDashboard();
      } else {
        alert(data.message || "Lỗi thêm học sinh");
      }
    } catch (err) {
      alert("Lỗi kết nối máy chủ");
    }
  });
}

// Xóa học sinh
window.deleteStudent = async function(id, name) {
  if (!confirm(`Bạn có chắc chắn muốn xóa học sinh "${name}" khỏi danh sách lớp không?`)) return;

  try {
    const res = await fetch(`/api/students/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (data.success) {
      await loadDashboard();
    } else {
      alert(data.message || "Lỗi xóa học sinh");
    }
  } catch (err) {
    alert("Lỗi kết nối máy chủ");
  }
};

// Cài đặt Modal Xem Code
function setupCodeModal() {
  document.getElementById("btnCloseCodeModal").addEventListener("click", closeCodeModal);
  document.getElementById("codeModal").addEventListener("click", (e) => {
    if (e.target.id === "codeModal") closeCodeModal();
  });
  document.getElementById("modalLessonSelect").addEventListener("change", onLessonSelectChange);
}

window.openCodeModal = function(studentId) {
  selectedStudent = allStudents.find(s => s.id === studentId);
  if (!selectedStudent) return;

  const classLabel = selectedStudent.classId === "Robotics" ? "Robot (VEX GO & VEX IQ)" : selectedStudent.classId;
  document.getElementById("modalStudentTitle").textContent = `Bài làm của: ${selectedStudent.name} (Lớp ${classLabel})`;

  const studentLessons = lessonsByClass[selectedStudent.classId] || lessons;
  const select = document.getElementById("modalLessonSelect");
  select.innerHTML = "";
  studentLessons.forEach(l => {
    const opt = document.createElement("option");
    opt.value = l.id;
    const prog = (selectedStudent.progress || {})[l.id];
    const statusText = prog ? (prog.status === "passed" ? " (✅ Đã đạt)" : " (⏳ Đang làm)") : " (⭕ Chưa làm)";
    opt.textContent = `Bài ${l.order}: ${l.title} ${statusText}`;
    select.appendChild(opt);
  });

  if (studentLessons.length > 0) {
    select.value = studentLessons[0].id;
    updateModalCodePreview(studentLessons[0].id);
  }

  document.getElementById("codeModal").classList.add("active");
};

function closeCodeModal() {
  document.getElementById("codeModal").classList.remove("active");
}

function onLessonSelectChange() {
  const lessonId = document.getElementById("modalLessonSelect").value;
  updateModalCodePreview(lessonId);
}

function updateModalCodePreview(lessonId) {
  if (!selectedStudent) return;
  const prog = (selectedStudent.progress || {})[lessonId];
  const previewBox = document.getElementById("codePreviewBox");
  const statusEl = document.getElementById("modalLessonStatus");
  const attemptsEl = document.getElementById("modalAttemptsInfo");
  const submittedEl = document.getElementById("modalSubmittedTime");

  if (!prog) {
    statusEl.textContent = "Chưa làm bài này";
    statusEl.style.color = "var(--text-muted)";
    attemptsEl.textContent = "Số lần thử: 0";
    submittedEl.textContent = "Thời gian nộp: Chưa có";
    previewBox.textContent = "// Học sinh chưa nộp bài này";
    return;
  }

  if (prog.status === "passed") {
    statusEl.textContent = "✅ ĐÃ ĐẠT";
    statusEl.style.color = "#34d399";
  } else {
    statusEl.textContent = "❌ CHƯA ĐẠT";
    statusEl.style.color = "#f87171";
  }

  attemptsEl.textContent = `Số lần thử: ${prog.attempts || 1} lần`;
  submittedEl.textContent = `Nộp lần cuối: ${prog.lastSubmittedAt ? new Date(prog.lastSubmittedAt).toLocaleTimeString() : 'N/A'}`;
  previewBox.textContent = prog.code || "// Không có nội dung";
}

// Reset dữ liệu lớp học
async function resetClassData() {
  const confirmMsg = confirm("⚠️ CẢNH BÁO: Bạn có chắc chắn muốn xóa toàn bộ danh sách và tiến độ học sinh hiện tại để bắt đầu một buổi mới?");
  if (!confirmMsg) return;

  try {
    const res = await fetch("/api/teacher/reset-all", { method: "POST" });
    const data = await res.json();
    if (data.success) {
      alert("Đã đặt lại dữ liệu lớp học thành công!");
      await loadDashboard();
    }
  } catch (err) {
    alert("Lỗi khi đặt lại lớp học!");
  }
}

function escapeHtml(str) {
  return (str || "").replace(/[&<>"']/g, function(m) {
    return {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }[m];
  });
}
