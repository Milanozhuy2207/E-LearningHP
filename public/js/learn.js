// State quản lý ứng dụng học tập MindX
let currentStudent = null;
let lessons = [];
let currentLessonIndex = 0;
let studentProgress = {};

// Khởi chạy khi tải trang
document.addEventListener("DOMContentLoaded", async () => {
  // 1. Kiểm tra học sinh đã chọn tên và lớp chưa
  const savedStudent = sessionStorage.getItem("currentStudent");
  if (!savedStudent) {
    window.location.href = "index.html";
    return;
  }
  currentStudent = JSON.parse(savedStudent);
  studentProgress = currentStudent.progress || {};

  // Cập nhật thông tin học sinh trên Header
  if (window.Icons) {
    document.getElementById("studentAvatar").innerHTML = Icons.avatar(currentStudent.avatar, { size: 20 });
    document.getElementById("backHomeIcon").innerHTML = Icons.get("arrowLeft", { size: 16 });
    document.getElementById("tracksBtnIcon").innerHTML = Icons.get("bookOpen", { size: 16 });
    document.getElementById("theoryTabIcon").innerHTML = Icons.get("bookOpen", { size: 16 });
    document.getElementById("taskTargetIcon").innerHTML = Icons.get("target", { size: 16 });
    document.getElementById("prevLessonIcon").innerHTML = Icons.get("arrowLeft", { size: 15 });
    document.getElementById("nextLessonIcon").innerHTML = Icons.get("arrowRight", { size: 15 });
    document.getElementById("resetCodeIcon").innerHTML = Icons.get("rotateCcw", { size: 14 });
    document.getElementById("runCodeIcon").innerHTML = Icons.get("play", { size: 14 });
    document.getElementById("submitCodeIcon").innerHTML = Icons.get("rocket", { size: 15 });
    document.getElementById("consoleTabIcon").innerHTML = Icons.get("terminal", { size: 15 });
    document.getElementById("testCasesTabIcon").innerHTML = Icons.get("flaskConical", { size: 15 });
    document.getElementById("clearOutputIcon").innerHTML = Icons.get("eraser", { size: 13 });
    document.getElementById("drawerHeaderIcon").innerHTML = Icons.get("bookOpen", { size: 18 });
    document.getElementById("congratsTrophyIcon").innerHTML = Icons.get("trophy", { size: 56 });
    document.getElementById("modalNextIcon").innerHTML = Icons.get("arrowRight", { size: 18 });
  }
  document.getElementById("studentName").textContent = currentStudent.name || "Học sinh";

  // Cập nhật huy hiệu lớp học và tên file code trên editor
  const classBadge = document.getElementById("studentClassBadge");
  const editorFileIcon = document.getElementById("editorFileIcon");
  const editorFileName = document.getElementById("editorFileName");
  const classId = currentStudent.classId || "Web";

  if (classId === "Python") {
    classBadge.className = "badge-class python";
    classBadge.innerHTML = `<span style="display:inline-flex;align-items:center;gap:6px;">${Icons.get('python', { size: 15 })} Lớp Python</span>`;
    if (editorFileIcon) editorFileIcon.innerHTML = Icons.get('python', { size: 16 });
    if (editorFileName) editorFileName.textContent = "main.py";
  } else if (classId === "Unity") {
    classBadge.className = "badge-class unity";
    classBadge.innerHTML = `<span style="display:inline-flex;align-items:center;gap:6px;">${Icons.get('unity', { size: 15 })} Lớp Unity</span>`;
    if (editorFileIcon) editorFileIcon.innerHTML = Icons.get('unity', { size: 16 });
    if (editorFileName) editorFileName.textContent = "PlayerController.cs";
  } else if (classId === "Robotics") {
    classBadge.className = "badge-class robotics";
    classBadge.innerHTML = `<span style="display:inline-flex;align-items:center;gap:6px;">${Icons.get('robotics', { size: 15 })} Lớp Robot (VEX GO & IQ)</span>`;
    if (editorFileIcon) editorFileIcon.innerHTML = Icons.get('robotics', { size: 16 });
    if (editorFileName) editorFileName.textContent = "🎮 Bảng Trò Chơi Từ Vựng & Lắp Ghép Khối Lệnh VEX GO";
    const resetTextEl = document.getElementById("resetCodeText");
    const runTextEl = document.getElementById("runCodeText");
    if (resetTextEl) resetTextEl.textContent = "Làm lại";
    if (runTextEl) runTextEl.textContent = "Chạy thử Robot";
  } else {
    classBadge.className = "badge-class web";
    classBadge.innerHTML = `<span style="display:inline-flex;align-items:center;gap:6px;">${Icons.get('web', { size: 15 })} Lớp Web</span>`;
    if (editorFileIcon) editorFileIcon.innerHTML = Icons.get('javascript', { size: 16 });
    if (editorFileName) editorFileName.textContent = "main.js";
  }

  // 2. Tải danh sách bài học ĐÚNG THEO LỚP của học sinh
  await fetchLessons(classId);

  // 3. Khởi tạo sự kiện giao diện
  setupEvents();
});

// Tải danh sách bài học theo lớp
async function fetchLessons(classId) {
  try {
    const res = await fetch(`/api/lessons?class=${classId}`);
    const data = await res.json();
    if (data.success && data.lessons) {
      lessons = data.lessons;

      // Tìm bài học đầu tiên chưa hoàn thành (hoặc bài đầu tiên)
      let firstUnfinishedIndex = lessons.findIndex(l => {
        const prog = studentProgress[l.id];
        return !prog || prog.status !== "passed";
      });
      if (firstUnfinishedIndex === -1) firstUnfinishedIndex = 0;

      loadLesson(firstUnfinishedIndex);
      renderDrawer();
      updateProgressBar();
    }
  } catch (err) {
    console.error("Lỗi tải bài học:", err);
    alert("Không thể tải danh sách bài học từ máy chủ!");
  }
}

// Nạp một bài học cụ thể
function loadLesson(index) {
  if (index < 0 || index >= lessons.length) return;
  currentLessonIndex = index;
  const lesson = lessons[index];

  // Cập nhật Header & Lý thuyết
  document.getElementById("headerLessonTitle").textContent = `${lesson.order}. ${lesson.title}`;
  document.getElementById("theoryTitle").textContent = `${lesson.order}. ${lesson.title}`;
  document.getElementById("theoryBody").innerHTML = `<div id="vocabDeckContainer"></div>` + lesson.theory;
  document.getElementById("taskBody").innerHTML = lesson.task;

  if (lesson.vocab && Array.isArray(lesson.vocab) && lesson.vocab.length > 0) {
    renderVocabFlashcards(lesson.vocab);
  }

  // Cập nhật Code Editor hoặc Bảng Trò Chơi Kéo-Chạm cho học sinh Tiểu học (Robotics)
  const savedProg = studentProgress[lesson.id];
  const textarea = document.getElementById("codeTextarea");
  const kidPlayground = document.getElementById("roboticsKidPlayground");

  if (currentStudent.classId === "Robotics" && (lesson.kidQuiz || lesson.blockPuzzle)) {
    textarea.style.display = "none";
    if (kidPlayground) {
      kidPlayground.style.display = "flex";
      initRoboticsKidPlayground(lesson, savedProg);
    }
  } else {
    textarea.style.display = "block";
    if (kidPlayground) kidPlayground.style.display = "none";
    if (savedProg && savedProg.code) {
      textarea.value = savedProg.code;
    } else {
      textarea.value = lesson.initialCode || "";
    }
  }

  // Cập nhật nút điều hướng
  document.getElementById("btnPrevLesson").disabled = index === 0;
  document.getElementById("btnNextLesson").disabled = index === lessons.length - 1;

  // Cập nhật số lượng test cases
  const tcCount = (lesson.testCases || []).length;
  document.getElementById("tcCount").textContent = tcCount;

  // Xóa màn hình console & nạp danh sách test cases rỗng ban đầu
  clearConsole();
  renderInitialTestCases(lesson.testCases);
  switchOutputTab("console");

  // Đánh dấu active trong drawer
  renderDrawer();
}

// Render bộ thẻ lật Flashcard kiểu Quizlet cho bài học có từ vựng (VEX GO / VEX IQ)
let currentCardIndex = 0;
let isCardFlipped = false;

function speakEnglishWord(word, event) {
  if (event) event.stopPropagation();
  if ("speechSynthesis" in window) {
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(word);
    utter.lang = "en-US";
    utter.rate = 0.9;
    window.speechSynthesis.speak(utter);
  }
}

function renderVocabFlashcards(vocabList) {
  const container = document.getElementById("vocabDeckContainer");
  if (!container || !vocabList || vocabList.length === 0) return;

  currentCardIndex = 0;
  isCardFlipped = false;

  const updateCardUI = () => {
    const item = vocabList[currentCardIndex];
    const safeWord = item.word.replace(/'/g, "\\'");
    container.innerHTML = `
      <div class="quizlet-deck-box">
        <div class="quizlet-deck-header">
          <span>🃏 Thẻ Ghi Nhớ Từ Mới (Flashcards Quizlet)</span>
          <span>Thẻ ${currentCardIndex + 1} / ${vocabList.length}</span>
        </div>
        <div class="quizlet-card ${isCardFlipped ? "flipped" : ""}" id="activeQuizletCard">
          <span class="quizlet-side-badge">${isCardFlipped ? "🇻🇳 Nghĩa Tiếng Việt" : "🇬🇧 Thuật ngữ VEXcode"}</span>
          <button type="button" class="quizlet-speak-btn" id="btnSpeakWord" title="Nghe phát âm tiếng Anh">🔊 Phát âm</button>
          <div class="quizlet-main-word">${isCardFlipped ? item.meaning : item.word}</div>
          <div class="quizlet-sub-example">${item.example ? `Ví dụ: <code>${item.example}</code>` : ""}</div>
          <div class="quizlet-flip-hint">🔄 Nhấp vào thẻ để lật (${isCardFlipped ? "Xem từ Tiếng Anh" : "Xem nghĩa Tiếng Việt"})</div>
        </div>
        <div class="quizlet-controls">
          <button type="button" class="quizlet-nav-btn" id="btnPrevCard">⬅️ Từ trước</button>
          <span style="font-size: 0.78rem; color: var(--text-muted); font-weight: 700;">Học thuộc từ trước khi làm bài bên phải nhé!</span>
          <button type="button" class="quizlet-nav-btn" id="btnNextCard">Từ tiếp ➡️</button>
        </div>
      </div>
    `;

    document.getElementById("activeQuizletCard").addEventListener("click", () => {
      isCardFlipped = !isCardFlipped;
      updateCardUI();
    });

    document.getElementById("btnSpeakWord").addEventListener("click", (e) => {
      speakEnglishWord(safeWord, e);
    });

    document.getElementById("btnPrevCard").addEventListener("click", () => {
      currentCardIndex = (currentCardIndex - 1 + vocabList.length) % vocabList.length;
      isCardFlipped = false;
      updateCardUI();
    });

    document.getElementById("btnNextCard").addEventListener("click", () => {
      currentCardIndex = (currentCardIndex + 1) % vocabList.length;
      isCardFlipped = false;
      updateCardUI();
    });
  };

  updateCardUI();
}

// ============================================================================
// KHU VỰC TRÒ CHƠI TỪ VỰNG & LẮP KHỐI LỆNH KÉO-CHẠM (DÀNH CHO HỌC SINH TIỂU HỌC)
// ============================================================================
let kidQuizAnswers = {};
let kidPuzzleSlots = [];

function initRoboticsKidPlayground(lesson, savedProg) {
  kidQuizAnswers = {};
  const slotsCount = lesson.blockPuzzle ? lesson.blockPuzzle.slotsCount : 0;
  kidPuzzleSlots = new Array(slotsCount).fill(null);

  // Khôi phục lựa chọn đã lưu của bé (nếu có)
  if (savedProg && savedProg.code) {
    try {
      const jsonMatch = savedProg.code.match(/\/\/\s*KID_STATE:(.*)/);
      if (jsonMatch && jsonMatch[1]) {
        const parsed = JSON.parse(jsonMatch[1].trim());
        if (parsed.quiz) kidQuizAnswers = parsed.quiz;
        if (Array.isArray(parsed.slots) && parsed.slots.length === slotsCount) {
          kidPuzzleSlots = parsed.slots;
        }
      }
    } catch (e) {}
  }

  renderRoboticsKidPlayground(lesson);
  syncKidStateToTextarea(lesson);
}

function syncKidStateToTextarea(lesson) {
  const lines = [];
  lines.push(`=== BÀI LÀM TỪ VỰNG & KHỐI LỆNH VEX GO CỦA HỌC SINH (${lesson.title}) ===`);
  if (lesson.kidQuiz) {
    lesson.kidQuiz.forEach(q => {
      const ans = kidQuizAnswers[q.id] || "(Chưa chọn)";
      const isCorrect = ans === q.answer;
      lines.push(`${isCorrect ? "✅" : "❌"} ${q.prompt} -> Chọn: [${ans}]`);
    });
  }
  if (lesson.blockPuzzle) {
    const joined = kidPuzzleSlots.filter(Boolean).join(" ");
    const expected = (lesson.blockPuzzle.expectedBlocks || []).join(" ");
    const isOk = joined.toLowerCase() === expected.toLowerCase();
    lines.push(`${isOk ? "✅" : "❌"} Khối lệnh VEXcode đã lắp: [${kidPuzzleSlots.map(s => s || "___").join("] -> [")}]`);
  }
  lines.push(`// KID_STATE:${JSON.stringify({ quiz: kidQuizAnswers, slots: kidPuzzleSlots })}`);

  const textarea = document.getElementById("codeTextarea");
  if (textarea) textarea.value = lines.join("\n");
}

function renderRoboticsKidPlayground(lesson) {
  const container = document.getElementById("roboticsKidPlayground");
  if (!container) return;

  const quizList = lesson.kidQuiz || [];
  const puzzle = lesson.blockPuzzle;
  const answeredCount = quizList.filter(q => Boolean(kidQuizAnswers[q.id])).length;

  let html = `
    <!-- Phần 1: Trắc nghiệm Chọn Thẻ Từ Vựng -->
    <div class="kid-section-card">
      <div class="kid-section-header">
        <div class="kid-section-title">🎯 Thử thách 1: Bấm Chọn Thẻ Từ Vựng Đúng</div>
        <span class="kid-section-badge">Đã chọn ${answeredCount}/${quizList.length} câu</span>
      </div>
      <div class="kid-quiz-list">
        ${quizList.map(q => {
          const selectedVal = kidQuizAnswers[q.id] || "";
          return `
            <div class="kid-quiz-item ${selectedVal ? "answered" : ""}">
              <div class="kid-quiz-prompt">${q.prompt}</div>
              <div class="kid-options-grid">
                ${q.options.map(opt => {
                  const isSel = selectedVal === opt;
                  const safeOpt = opt.replace(/"/g, "&quot;");
                  return `
                    <button type="button" class="kid-option-btn ${isSel ? "selected" : ""}" data-qid="${q.id}" data-opt="${safeOpt}">
                      <span>${isSel ? "✅" : "🔹"}</span>
                      <span>${opt}</span>
                    </button>
                  `;
                }).join("")}
              </div>
            </div>
          `;
        }).join("")}
      </div>
    </div>
  `;

  if (puzzle) {
    const filledCount = kidPuzzleSlots.filter(Boolean).length;
    html += `
      <!-- Phần 2: Lắp Ráp Khối Lệnh VEXcode GO -->
      <div class="kid-section-card">
        <div class="kid-section-header">
          <div class="kid-section-title">🧩 Thử thách 2: Lắp Ráp Khối Lệnh VEXcode</div>
          <span class="kid-section-badge">Đã lắp ${filledCount}/${puzzle.slotsCount} mảnh</span>
        </div>
        <div class="kid-puzzle-instruction">${puzzle.instruction}</div>

        <!-- Khung khối lệnh màu sắc VEXcode -->
        <div class="kid-vex-block-frame ${puzzle.blockColor || "motion"}">
          <span class="kid-static-token">🤖</span>
          ${puzzle.prefix ? `<span class="kid-static-token">${puzzle.prefix}</span>` : ""}
          ${kidPuzzleSlots.map((slotVal, idx) => `
            <button type="button" class="kid-slot-btn ${slotVal ? "filled" : ""}" data-slot-idx="${idx}" title="${slotVal ? "Bấm để tháo mảnh ghép này ra" : "Ô trống số " + (idx + 1)}">
              ${slotVal ? `${slotVal} ✖` : `Ô số ${idx + 1}`}
            </button>
          `).join("")}
          ${puzzle.suffix ? `<span class="kid-static-token">${puzzle.suffix}</span>` : ""}
        </div>

        <!-- Khay chứa các mảnh ghép từ vựng (Word Bank) -->
        <div class="kid-wordbank-box">
          <div class="kid-wordbank-label">👇 Bấm vào các mảnh từ bên dưới để lắp vào ô trống ở trên (bấm vào ô đã lắp để tháo ra):</div>
          ${puzzle.wordBank.map(word => {
            const isUsed = kidPuzzleSlots.includes(word);
            const safeW = word.replace(/"/g, "&quot;");
            return `
              <button type="button" class="kid-wordbank-btn" data-bank-word="${safeW}" ${isUsed ? "disabled" : ""}>
                ➕ ${word}
              </button>
            `;
          }).join("")}
        </div>
      </div>

      <!-- Phần 3: Sa Bàn Mô Phỏng Robot VEX GO -->
      <div class="kid-robot-stage">
        <div>
          <div style="font-weight: 900; color: #fb923c; font-size: 0.9rem;">🤖 Sa Bàn Robot VEX GO</div>
          <div class="kid-robot-status-text" id="kidRobotStatusText">Bấm "Chạy thử Robot" hoặc "Nộp bài" để xem Robot hoạt động!</div>
        </div>
        <div class="kid-robot-track">
          <div class="kid-robot-avatar" id="kidRobotAvatar">🤖💨</div>
          <div style="margin-left: auto; font-size: 1.5rem;" id="kidRobotTarget">🧲🏁</div>
        </div>
      </div>
    `;
  }

  container.innerHTML = html;

  // Gắn sự kiện bấm chọn đáp án trắc nghiệm từ vựng
  container.querySelectorAll(".kid-option-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const qid = btn.getAttribute("data-qid");
      const opt = btn.getAttribute("data-opt");
      kidQuizAnswers[qid] = opt;
      // Phát âm nếu lựa chọn là từ tiếng Anh
      if (/^[a-zA-Z\s-]+$/.test(opt)) {
        speakEnglishWord(opt);
      }
      syncKidStateToTextarea(lesson);
      renderRoboticsKidPlayground(lesson);
    });
  });

  // Gắn sự kiện bấm mảnh từ trong Word Bank để lắp vào ô trống đầu tiên
  container.querySelectorAll(".kid-wordbank-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const word = btn.getAttribute("data-bank-word");
      const emptyIdx = kidPuzzleSlots.findIndex(s => s === null);
      if (emptyIdx !== -1) {
        kidPuzzleSlots[emptyIdx] = word;
        if (/^[a-zA-Z0-9\s-]+$/.test(word)) {
          speakEnglishWord(word);
        }
        syncKidStateToTextarea(lesson);
        renderRoboticsKidPlayground(lesson);
      }
    });
  });

  // Gắn sự kiện bấm vào ô đã lắp để tháo mảnh ghép ra
  container.querySelectorAll(".kid-slot-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const idx = parseInt(btn.getAttribute("data-slot-idx"), 10);
      if (kidPuzzleSlots[idx] !== null) {
        kidPuzzleSlots[idx] = null;
        syncKidStateToTextarea(lesson);
        renderRoboticsKidPlayground(lesson);
      }
    });
  });
}

function animateKidRobotStage(success = true) {
  const avatar = document.getElementById("kidRobotAvatar");
  const statusText = document.getElementById("kidRobotStatusText");
  if (!avatar || !statusText) return;

  avatar.style.transform = "translateX(0px) rotate(0deg)";
  setTimeout(() => {
    if (success) {
      avatar.style.transform = "translateX(140px)";
      avatar.textContent = "🤖⚡🧲";
      statusText.textContent = "🎉 Robot VEX GO đã nhận lệnh và chạy về đích thành công!";
      statusText.style.color = "#34d399";
    } else {
      avatar.style.transform = "translateX(45px) rotate(-8deg)";
      avatar.textContent = "🤖❓";
      statusText.textContent = "⚠️ Robot đang chờ con chọn đủ các từ và lắp đúng khối lệnh!";
      statusText.style.color = "#fbbf24";
    }
  }, 80);
}

// Cập nhật thanh tiến độ
function updateProgressBar() {
  if (lessons.length === 0) return;
  const passedCount = Object.values(studentProgress).filter(p => p.status === "passed").length;
  const percent = Math.round((passedCount / lessons.length) * 100);

  document.getElementById("progressText").textContent = `${passedCount}/${lessons.length} bài (${percent}%)`;
  document.getElementById("progressFill").style.width = `${percent}%`;
}

// Chạy thử code (Run code)
async function runUserCode() {
  const code = document.getElementById("codeTextarea").value;
  clearConsole();
  appendConsoleLog("info", `--- BẮT ĐẦU CHẠY THỬ (${currentStudent.classId.toUpperCase()}) ---`);

  if (currentStudent.classId === "Python") {
    // Chạy qua Python Engine trên server
    try {
      const res = await fetch("/api/execute/python", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code })
      });
      const data = await res.json();
      if (data.success) {
        if (data.stdout && data.stdout.trim()) {
          appendConsoleLog("normal", data.stdout);
        } else {
          appendConsoleLog("muted", "(Chương trình chạy xong nhưng không có lệnh print() nào xuất kết quả)");
        }
        appendConsoleLog("success", "✔ Mã Python chạy thành công!");
      } else {
        appendConsoleLog("error", `❌ Lỗi Python:\n${data.error || "Không thể thực thi"}`);
      }
    } catch (err) {
      appendConsoleLog("error", "❌ Không thể kết nối tới máy chủ Python");
    }
  } else if (currentStudent.classId === "Unity") {
    // Chạy Unity C# Simulator
    runUnityCSharpCode(code);
  } else if (currentStudent.classId === "Robotics") {
    // Chạy VEX GO & VEX IQ Simulator
    runRoboticsVexCode(code);
  } else {
    // Chạy JavaScript Web
    runJavaScriptCode(code);
  }

  switchOutputTab("console");
}

function runJavaScriptCode(code) {
  const originalLog = console.log;
  const originalError = console.error;
  console.log = (...args) => appendConsoleLog("normal", args.map(formatLogArg).join(" "));
  console.error = (...args) => appendConsoleLog("error", args.map(formatLogArg).join(" "));

  try {
    const runner = new Function(code);
    runner();
    appendConsoleLog("success", "✔ Chương trình JavaScript chạy thành công!");
  } catch (err) {
    appendConsoleLog("error", `❌ Lỗi JavaScript: ${err.message}`);
  } finally {
    console.log = originalLog;
    console.error = originalError;
  }
}

function runUnityCSharpCode(code) {
  // Giả lập môi trường Unity C#
  let unityLogs = [];
  const Debug = {
    Log: (...args) => {
      const msg = "[Unity Console] " + args.map(formatLogArg).join(" ");
      unityLogs.push(msg);
      appendConsoleLog("normal", msg);
    }
  };

  try {
    // Tiền xử lý C# sang JS tương đương để chạy an toàn
    const jsEquivalent = translateCSharpToJS(code);
    const runner = new Function("Debug", jsEquivalent);
    runner(Debug);
    appendConsoleLog("success", "✔ Script Unity C# biên dịch và chạy thành công!");
  } catch (err) {
    appendConsoleLog("error", `❌ Lỗi C# Unity: ${err.message}`);
  }
}

// Chuyển đổi cú pháp C# cơ bản thành JS để giả lập chạy
function translateCSharpToJS(code) {
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

// Tạo môi trường giả lập Robot VEX GO & VEX IQ
function createVexEnvironment(capturedLogs) {
  const logToBrain = (...args) => {
    const msg = args.map(formatLogArg).join(" ");
    capturedLogs.push(msg);
    appendConsoleLog("normal", `📟 [VEX Brain] ${msg}`);
  };

  const brain = {
    print: logToBrain,
    Print: logToBrain,
    clear: () => appendConsoleLog("muted", "📟 [VEX Brain] Đã xóa màn hình Brain")
  };

  const drivetrain = {
    driveFor: (direction = "FORWARD", distance = 200, unit = "MM") => {
      const dirText = String(direction).toUpperCase() === "REVERSE" ? "lùi (REVERSE)" : "tiến (FORWARD)";
      const msg = `Robot di chuyển ${dirText} ${distance} ${unit}`;
      capturedLogs.push(msg);
      appendConsoleLog("info", `🤖 [VEX Drivetrain] ${msg}`);
    },
    turnFor: (direction = "RIGHT", angle = 90, unit = "DEGREES") => {
      const dirText = String(direction).toUpperCase() === "LEFT" ? "trái (LEFT)" : "phải (RIGHT)";
      const msg = `Robot xoay ${dirText} góc ${angle}° (${unit})`;
      capturedLogs.push(msg);
      appendConsoleLog("info", `🔄 [VEX Drivetrain] ${msg}`);
    },
    setVelocity: (vel = 80) => {
      const msg = `Đặt tốc độ động cơ Drivetrain: ${vel}%`;
      capturedLogs.push(msg);
      appendConsoleLog("info", `⚡ [VEX Drivetrain] ${msg}`);
    },
    stop: () => {
      appendConsoleLog("muted", "🛑 [VEX Drivetrain] Robot đã dừng");
    }
  };

  const magnet = {
    energize: (mode = "BOOST") => {
      const modeText = String(mode).toUpperCase() === "DROP" ? "THẢ ĐĨA TỪ (DROP)" : "HÚT ĐĨA TỪ (BOOST)";
      const msg = `Nam châm điện VEX GO: ${modeText}`;
      capturedLogs.push(msg);
      appendConsoleLog("info", `🧲 [VEX GO Magnet] ${msg}`);
    }
  };

  const arm = {
    spinFor: (deg = 90) => {
      const msg = `Cánh tay VEX IQ nâng/hạ góc ${deg}°`;
      capturedLogs.push(msg);
      appendConsoleLog("info", `🦾 [VEX IQ Arm] ${msg}`);
    }
  };

  const claw = {
    setPosition: (deg = 45) => {
      const msg = `Tay gắp VEX IQ mở/đóng góc ${deg}°`;
      capturedLogs.push(msg);
      appendConsoleLog("info", `🦀 [VEX IQ Claw] ${msg}`);
    }
  };

  const vexVocabCheck = (vocabMap = {}) => {
    appendConsoleLog("info", "🤖 [VEXcode GO / IQ] Kiểm tra các từ khóa bạn đã nhập:");
    Object.entries(vocabMap).forEach(([label, userVal]) => {
      const text = String(userVal || "").trim();
      if (text) {
        const line = `[Khối lệnh ${label}] -> "${text}"`;
        capturedLogs.push(line);
        appendConsoleLog("normal", `   🔹 ${line}`);
      } else {
        appendConsoleLog("muted", `   ⚪ [${label}] -> (Chưa điền từ)`);
      }
    });
  };

  return {
    brain,
    Brain: brain,
    drivetrain,
    Drivetrain: drivetrain,
    magnet,
    Magnet: magnet,
    arm,
    claw,
    vexVocabCheck,
    FORWARD: "FORWARD",
    REVERSE: "REVERSE",
    LEFT: "LEFT",
    RIGHT: "RIGHT",
    MM: "MM",
    DEGREES: "DEGREES",
    BOOST: "BOOST",
    DROP: "DROP"
  };
}

function runRoboticsVexCode(code) {
  const lesson = lessons[currentLessonIndex];
  if (lesson && (lesson.kidQuiz || lesson.blockPuzzle)) {
    appendConsoleLog("info", `🤖 [VEX GO Playground] Đang kiểm tra lựa chọn của con trong bài "${lesson.title}"...`);
    (lesson.kidQuiz || []).forEach(q => {
      const val = kidQuizAnswers[q.id];
      if (val) {
        appendConsoleLog("normal", `   ✔ ${q.prompt} -> Con chọn: "${val}"`);
      } else {
        appendConsoleLog("muted", `   ⚪ ${q.prompt} -> (Con chưa chọn thẻ nào)`);
      }
    });

    if (lesson.blockPuzzle) {
      const assembled = kidPuzzleSlots.map(s => s || "___").join(" ] -> [ ");
      appendConsoleLog("info", `🧩 Khối lệnh VEXcode đã lắp: [ ${assembled} ]`);
    }

    const allFilled = (lesson.kidQuiz || []).every(q => Boolean(kidQuizAnswers[q.id])) &&
      kidPuzzleSlots.every(Boolean);
    animateKidRobotStage(allFilled);
    if (allFilled) {
      appendConsoleLog("success", "✔ Con đã điền đủ các câu! Hãy bấm nút 'Nộp bài & Chấm điểm' màu đỏ để nhận Cúp nhé!");
    } else {
      appendConsoleLog("error", "💡 Con hãy bấm chọn hết các câu hỏi và lắp đủ các ô khối lệnh rồi nộp bài nhé!");
    }
    return;
  }

  const capturedLogs = [];
  const vexEnv = createVexEnvironment(capturedLogs);
  const originalLog = console.log;
  const originalError = console.error;
  console.log = (...args) => {
    const msg = args.map(formatLogArg).join(" ");
    capturedLogs.push(msg);
    appendConsoleLog("normal", `📟 [VEX Console] ${msg}`);
  };
  console.error = (...args) => appendConsoleLog("error", args.map(formatLogArg).join(" "));

  try {
    const envKeys = Object.keys(vexEnv);
    const envValues = Object.values(vexEnv);
    const runner = new Function(...envKeys, code);
    runner(...envValues);
    appendConsoleLog("success", "✔ Chương trình điều khiển Robot VEX GO / VEX IQ chạy thành công!");
  } catch (err) {
    appendConsoleLog("error", `❌ Lỗi chương trình Robot VEX: ${err.message}`);
  } finally {
    console.log = originalLog;
    console.error = originalError;
  }
}

// Nộp bài & Chấm điểm tự động (Submit code)
async function submitUserCode() {
  const lesson = lessons[currentLessonIndex];
  const code = document.getElementById("codeTextarea").value;
  const testCases = lesson.testCases || [];

  clearConsole();
  appendConsoleLog("info", `--- HỆ THỐNG MINDX ĐANG CHẤM BÀI LỚP ${currentStudent.classId.toUpperCase()} ---`);

  let allPassed = true;
  const results = [];

  if (currentStudent.classId === "Python") {
    // Chấm điểm Python
    const pyResult = await gradePythonSubmission(code, testCases);
    allPassed = pyResult.allPassed;
    results.push(...pyResult.results);
  } else if (currentStudent.classId === "Unity") {
    // Chấm điểm Unity C#
    const uniResult = gradeUnitySubmission(code, testCases);
    allPassed = uniResult.allPassed;
    results.push(...uniResult.results);
  } else if (currentStudent.classId === "Robotics") {
    // Chấm điểm Lập trình Robot (VEX GO + VEX IQ)
    const robResult = gradeRoboticsSubmission(code, testCases);
    allPassed = robResult.allPassed;
    results.push(...robResult.results);
  } else {
    // Chấm điểm Web JavaScript
    const jsResult = gradeJavaScriptSubmission(code, testCases);
    allPassed = jsResult.allPassed;
    results.push(...jsResult.results);
  }

  // Hiển thị kết quả Test Cases trên giao diện
  renderTestCasesResults(results);
  switchOutputTab("testcases");

  // Gửi kết quả lên server để lưu tiến độ và giáo viên theo dõi
  const status = allPassed ? "passed" : "failed";
  try {
    const res = await fetch("/api/submissions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        studentId: currentStudent.id,
        lessonId: lesson.id,
        code,
        status
      })
    });
    const data = await res.json();
    if (data.success) {
      if (!studentProgress[lesson.id]) studentProgress[lesson.id] = {};
      studentProgress[lesson.id].status = status;
      studentProgress[lesson.id].code = code;
      updateProgressBar();
      renderDrawer();
    }
  } catch (err) {
    console.error("Lỗi lưu bài nộp:", err);
  }

  // Nếu hoàn thành xuất sắc tất cả test cases
  if (allPassed) {
    appendConsoleLog("success", "🎉 XUẤT SẮC! BẠN ĐÃ VƯỢT QUA TOÀN BỘ TIÊU CHÍ!");
    showCongratsModal();
  } else {
    appendConsoleLog("error", "⚠️ Một số tiêu chí kiểm tra chưa đạt. Hãy xem thẻ 'Tiêu chí chấm điểm' để sửa lại nhé!");
  }
}

// Chấm điểm Python thông qua server
async function gradePythonSubmission(code, testCases) {
  // Thêm script trích xuất biến vào cuối code python
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

  let stdout = "";
  let stderr = "";
  let pyVars = {};

  try {
    const res = await fetch("/api/execute/python", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: extractCode })
    });
    const data = await res.json();
    if (data.success) {
      const parts = (data.stdout || "").split("---MINDX_VARS---");
      stdout = parts[0] || "";
      if (parts[1]) {
        try { pyVars = JSON.parse(parts[1].trim()); } catch(e){}
      }
      appendConsoleLog("normal", stdout);
    } else {
      stderr = data.error || "";
      appendConsoleLog("error", stderr);
    }
  } catch (err) {
    stderr = "Lỗi kết nối server Python";
  }

  let allPassed = true;
  const results = [];

  for (const tc of testCases) {
    let passed = false;
    let message = "";

    if (stderr) {
      passed = false;
      message = "Code gặp lỗi runtime trong Python";
    } else if (tc.type === "output_contains") {
      passed = stdout.toLowerCase().includes(tc.expected.toLowerCase());
      message = passed ? "Chính xác" : `Chưa in ra đúng '${tc.expected}'`;
    } else if (tc.type === "variable_type") {
      const val = pyVars[tc.varName];
      passed = typeof val === tc.expectedType;
      message = passed ? "Chính xác" : `Biến '${tc.varName}' phải có kiểu ${tc.expectedType}`;
    } else if (tc.type === "variable_value") {
      const val = pyVars[tc.varName];
      passed = val === tc.expectedValue;
      message = passed ? "Chính xác" : `Biến '${tc.varName}' phải bằng ${tc.expectedValue} (hiện tại: ${val})`;
    } else if (tc.type === "function_call") {
      // Test gọi hàm Python
      const fnTestCode = `${code}\nprint("FN_RES=" + str(${tc.funcName}(${tc.args.join(",")})))`;
      try {
        const fnRes = await fetch("/api/execute/python", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code: fnTestCode })
        });
        const fnData = await fnRes.json();
        if (fnData.success && fnData.stdout.includes(`FN_RES=${tc.expectedValue}`)) {
          passed = true;
          message = "Chính xác";
        } else {
          passed = false;
          message = `Gọi ${tc.funcName}(${tc.args.join(",")}) mong đợi ${tc.expectedValue}`;
        }
      } catch (e) {
        passed = false;
        message = "Lỗi chạy hàm Python";
      }
    } else if (tc.type === "custom_eval") {
      try {
        const evalFn = new Function(...Object.keys(pyVars), `return Boolean(${tc.expression});`);
        passed = Boolean(evalFn(...Object.values(pyVars)));
      } catch (e) {
        const valList = pyVars[tc.varName || "danh_sach_ban"];
        passed = Array.isArray(valList) && valList.length >= 3;
      }
      message = passed ? "Chính xác" : "Chưa thỏa mãn tiêu chí";
    }

    if (!passed) allPassed = false;
    results.push({ ...tc, passed, message });
  }

  return { allPassed, results };
}

// Chấm điểm Unity C#
function gradeUnitySubmission(code, testCases) {
  const capturedLogs = [];
  const Debug = {
    Log: (...args) => {
      const msg = args.map(formatLogArg).join(" ");
      capturedLogs.push(msg);
      appendConsoleLog("normal", "[Unity Console] " + msg);
    }
  };

  let executionContext = {};
  let runtimeError = null;

  try {
    const jsEquivalent = translateCSharpToJS(code);
    const runner = new Function("Debug", `
      ${jsEquivalent}
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
    `);
    executionContext = runner(Debug) || {};
  } catch (err) {
    runtimeError = err;
    appendConsoleLog("error", `❌ Lỗi thực thi Unity C#: ${err.message}`);
  }

  let allPassed = true;
  const results = [];

  for (const tc of testCases) {
    let passed = false;
    let message = "";

    if (runtimeError) {
      passed = false;
      message = "Không thể kiểm tra do code gặp lỗi";
    } else if (tc.type === "output_contains") {
      const full = capturedLogs.join("\n");
      passed = full.toLowerCase().includes(tc.expected.toLowerCase());
      message = passed ? "Chính xác" : `Chưa in ra '${tc.expected}'`;
    } else if (tc.type === "variable_type") {
      const val = executionContext[tc.varName];
      passed = typeof val === tc.expectedType;
      message = passed ? "Chính xác" : `Biến '${tc.varName}' phải có kiểu ${tc.expectedType}`;
    } else if (tc.type === "variable_value") {
      const val = executionContext[tc.varName];
      passed = val === tc.expectedValue;
      message = passed ? "Chính xác" : `Biến '${tc.varName}' phải bằng ${tc.expectedValue}`;
    } else if (tc.type === "function_call") {
      const fn = executionContext[tc.funcName];
      if (typeof fn === "function") {
        const res = fn(...tc.args);
        passed = res === tc.expectedValue;
        message = passed ? "Chính xác" : `Hàm trả về ${res}, mong đợi ${tc.expectedValue}`;
      } else {
        passed = false;
        message = `Hàm '${tc.funcName}' chưa được định nghĩa`;
      }
    } else if (tc.type === "custom_eval") {
      try {
        const evalFn = new Function(...Object.keys(executionContext), `return Boolean(${tc.expression});`);
        passed = Boolean(evalFn(...Object.values(executionContext)));
      } catch (e) {
        const weapons = executionContext.weapons;
        const count = executionContext.weaponCount;
        passed = Array.isArray(weapons) && weapons.length >= 3 && count === weapons.length;
      }
      message = passed ? "Chính xác" : "Chưa thỏa mãn tiêu chí";
    }

    if (!passed) allPassed = false;
    results.push({ ...tc, passed, message });
  }

  return { allPassed, results };
}

// Chấm điểm Lập trình Robot (VEX GO & VEX IQ)
function gradeRoboticsSubmission(code, testCases) {
  const lesson = lessons[currentLessonIndex];

  // Nếu là bài học Trò Chơi Từ Vựng & Lắp Ghép Khối Lệnh dành cho học sinh Tiểu học
  if (lesson && (lesson.kidQuiz || lesson.blockPuzzle)) {
    let allPassed = true;
    const results = [];

    for (const tc of testCases) {
      let passed = false;
      let message = "";

      if (tc.varName === "puzzle") {
        const userJoined = kidPuzzleSlots.filter(Boolean).join(" ").trim().replace(/\s+/g, " ").toLowerCase();
        const expectedJoined = String(tc.expectedValue || "").trim().replace(/\s+/g, " ").toLowerCase();
        passed = userJoined === expectedJoined;
        message = passed
          ? `Ghép chính xác: [${tc.expectedValue}]`
          : `Thứ tự đúng phải là: "${tc.expectedValue}" (Con đang lắp: "${kidPuzzleSlots.filter(Boolean).join(" ") || "Chưa lắp"}")`;
      } else {
        const userAns = kidQuizAnswers[tc.varName];
        const normActual = String(userAns ?? "").trim().replace(/\s+/g, " ").toLowerCase();
        const normExpected = String(tc.expectedValue ?? "").trim().replace(/\s+/g, " ").toLowerCase();
        passed = normActual === normExpected;
        message = passed
          ? `Đúng rồi! ("${tc.expectedValue}")`
          : (userAns ? `Con chọn "${userAns}" chưa đúng, đáp án là "${tc.expectedValue}"` : `Con chưa bấm chọn đáp án cho câu này`);
      }

      if (!passed) allPassed = false;
      results.push({ ...tc, passed, message });
    }

    animateKidRobotStage(allPassed);
    return { allPassed, results };
  }

  const capturedLogs = [];
  const vexEnv = createVexEnvironment(capturedLogs);
  const originalLog = console.log;
  console.log = (...args) => {
    const msg = args.map(formatLogArg).join(" ");
    capturedLogs.push(msg);
    appendConsoleLog("normal", `📟 [VEX Console] ${msg}`);
  };

  let executionContext = {};
  let runtimeError = null;

  try {
    const envKeys = Object.keys(vexEnv);
    const envValues = Object.values(vexEnv);
    const trackedVars = [
      // Biến từ vựng VEX GO / VEX IQ (rob-1 .. rob-7)
      "tu_khi", "tu_bat_dau", "tu_dong_co", "tu_quay_tron", "tu_phia_truoc", "tu_dao_nguoc", "tu_dung_lai",
      "tu_khoang", "tu_den", "tu_dat", "tu_van_toc", "tu_do", "tu_doi", "tu_giay",
      "tu_xoay", "tu_ben_trai", "tu_ben_phai", "tu_xoay_vong", "tu_dung_xe",
      "tu_doi_cho_den_khi", "tu_cam_bien_bumber", "tu_duoc_nhan", "cau_lenh_day_du",
      "tu_nam_cham", "tu_lam_manh_me", "tu_tang_cuong", "tu_roi_bo",
      "tu_mai_mai", "tu_neu_thi", "tu_cho_den_khi", "tu_vat_the",
      "buoc_1", "buoc_2", "buoc_3", "buoc_4", "buoc_5",
      // Biến code robot mở rộng
      "tenRobot", "tocDo", "chuViBanhXe", "soVongQuay", "quangDuong",
      "khoangCach", "hanhDong", "tongDia", "tinhDiemThiDau", "loTrinhRobot", "soBuoc"
    ];
    const extractStatements = trackedVars
      .map(v => `try { if (typeof ${v} !== 'undefined') _s.${v} = ${v}; } catch(e){}`)
      .join("\n        ");

    const runner = new Function(...envKeys, `
      ${code}
      return (function() {
        let _s = {};
        ${extractStatements}
        return _s;
      })();
    `);
    executionContext = runner(...envValues) || {};
  } catch (err) {
    runtimeError = err;
    appendConsoleLog("error", `❌ Lỗi thực thi VEX Robotics: ${err.message}`);
  } finally {
    console.log = originalLog;
  }

  let allPassed = true;
  const results = [];

  for (const tc of testCases) {
    let passed = false;
    let message = "";

    if (runtimeError) {
      passed = false;
      message = "Không thể kiểm tra do code gặp lỗi cú pháp";
    } else if (tc.type === "output_contains") {
      const full = capturedLogs.join("\n");
      passed = full.toLowerCase().includes(tc.expected.toLowerCase());
      message = passed ? "Chính xác" : `Chưa hiển thị '${tc.expected}' lên VEX Brain`;
    } else if (tc.type === "variable_type") {
      const val = executionContext[tc.varName];
      passed = typeof val === tc.expectedType;
      message = passed ? "Chính xác" : `Biến '${tc.varName}' phải có kiểu ${tc.expectedType}`;
    } else if (tc.type === "variable_value") {
      const val = executionContext[tc.varName];
      if (typeof tc.expectedValue === "string") {
        const normActual = String(val ?? "").trim().replace(/\s+/g, " ").toLowerCase();
        const normExpected = String(tc.expectedValue).trim().replace(/\s+/g, " ").toLowerCase();
        passed = normActual === normExpected;
      } else {
        passed = val === tc.expectedValue;
      }
      message = passed
        ? `Chính xác ('${tc.expectedValue}')`
        : `Biến '${tc.varName}' cần điền là "${tc.expectedValue}" (hiện tại: "${val ?? ""}")`;
    } else if (tc.type === "function_call") {
      const fn = executionContext[tc.funcName];
      if (typeof fn === "function") {
        const res = fn(...tc.args);
        passed = res === tc.expectedValue;
        message = passed ? "Chính xác" : `Gọi ${tc.funcName} trả về ${res}, mong đợi ${tc.expectedValue}`;
      } else {
        passed = false;
        message = `Hàm '${tc.funcName}' chưa được định nghĩa`;
      }
    } else if (tc.type === "custom_eval") {
      try {
        const evalFn = new Function(...Object.keys(executionContext), `return Boolean(${tc.expression});`);
        passed = Boolean(evalFn(...Object.values(executionContext)));
      } catch (e) {
        passed = false;
      }
      message = passed ? "Chính xác" : "Chưa thỏa mãn tiêu chí kiểm tra";
    }

    if (!passed) allPassed = false;
    results.push({ ...tc, passed, message });
  }

  return { allPassed, results };
}

// Chấm điểm Web JavaScript
function gradeJavaScriptSubmission(code, testCases) {
  const capturedLogs = [];
  const originalLog = console.log;
  console.log = (...args) => {
    const msg = args.map(formatLogArg).join(" ");
    capturedLogs.push(msg);
    appendConsoleLog("normal", msg);
  };

  let executionContext = {};
  let runtimeError = null;

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
  } catch (err) {
    runtimeError = err;
    appendConsoleLog("error", `❌ Lỗi thực thi: ${err.message}`);
  } finally {
    console.log = originalLog;
  }

  let allPassed = true;
  const results = [];

  for (const tc of testCases) {
    let passed = false;
    let message = "";

    if (runtimeError) {
      passed = false;
      message = "Không thể kiểm tra do code gặp lỗi cú pháp";
    } else if (tc.type === "output_contains") {
      const full = capturedLogs.join("\n");
      passed = full.toLowerCase().includes(tc.expected.toLowerCase());
      message = passed ? "Chính xác" : `Chưa in ra '${tc.expected}'`;
    } else if (tc.type === "variable_type") {
      const val = executionContext[tc.varName];
      passed = typeof val === tc.expectedType;
      message = passed ? "Chính xác" : `Biến '${tc.varName}' phải có kiểu ${tc.expectedType}`;
    } else if (tc.type === "variable_value") {
      const val = executionContext[tc.varName];
      passed = val === tc.expectedValue;
      message = passed ? "Chính xác" : `Biến '${tc.varName}' phải bằng ${tc.expectedValue}`;
    } else if (tc.type === "function_call") {
      const fn = executionContext[tc.funcName];
      if (typeof fn === "function") {
        const res = fn(...tc.args);
        passed = res === tc.expectedValue;
        message = passed ? "Chính xác" : `Gọi ${tc.funcName} trả về ${res}, mong đợi ${tc.expectedValue}`;
      } else {
        passed = false;
        message = `Hàm '${tc.funcName}' chưa được định nghĩa`;
      }
    } else if (tc.type === "custom_eval") {
      const evalFn = new Function(...Object.keys(executionContext), `return Boolean(${tc.expression});`);
      passed = Boolean(evalFn(...Object.values(executionContext)));
      message = passed ? "Chính xác" : "Chưa thỏa mãn tiêu chí kiểm tra";
    }

    if (!passed) allPassed = false;
    results.push({ ...tc, passed, message });
  }

  return { allPassed, results };
}

// Hiển thị modal chúc mừng
function showCongratsModal() {
  const modal = document.getElementById("congratsModal");
  const isLastLesson = currentLessonIndex === lessons.length - 1;
  const msg = document.getElementById("congratsMessage");
  const nextBtn = document.getElementById("btnModalNextLesson");

  if (isLastLesson) {
    msg.textContent = `Chúc mừng bạn đã xuất sắc hoàn thành toàn bộ khóa học ${currentStudent.classId} tại MindX!`;
    nextBtn.textContent = "🏆 XEM TIẾN ĐỘ TỔNG KẾT";
  } else {
    msg.textContent = "Bạn đã vượt qua toàn bộ tiêu chí kiểm tra của thử thách này!";
    nextBtn.textContent = "CHINH PHỤC BÀI TIẾP THEO ➡️";
  }

  modal.classList.add("active");
}

function hideCongratsModal() {
  document.getElementById("congratsModal").classList.remove("active");
}

// Render test cases ban đầu (chưa chấm)
function renderInitialTestCases(testCases) {
  const container = document.getElementById("testCasesView");
  container.innerHTML = "";
  if (!testCases || testCases.length === 0) {
    container.innerHTML = "<div class='console-line muted'>Bài này không có tiêu chí kiểm tra tự động.</div>";
    return;
  }
  testCases.forEach((tc) => {
    const item = document.createElement("div");
    item.className = "test-case-item";
    const iconSvg = window.Icons ? Icons.get("flaskConical", { size: 16 }) : "⚪";
    item.innerHTML = `
      <span class="tc-icon" style="color: var(--text-muted);">${iconSvg}</span>
      <span class="tc-name">${tc.name}</span>
      <span class="tc-status" style="color: var(--text-muted);">Chờ kiểm tra</span>
    `;
    container.appendChild(item);
  });
}

// Render kết quả test cases sau khi chấm
function renderTestCasesResults(results) {
  const container = document.getElementById("testCasesView");
  container.innerHTML = "";
  results.forEach(tc => {
    const item = document.createElement("div");
    item.className = `test-case-item ${tc.passed ? "passed" : "failed"}`;
    const iconSvg = window.Icons
      ? (tc.passed ? Icons.get("checkCircle2", { size: 18 }) : Icons.get("xCircle", { size: 18 }))
      : (tc.passed ? "✅" : "❌");

    item.innerHTML = `
      <span class="tc-icon" style="color: ${tc.passed ? "#34d399" : "#f87171"};">${iconSvg}</span>
      <div class="tc-name">
        <div>${tc.name}</div>
        <div style="font-size: 0.78rem; color: ${tc.passed ? "#34d399" : "#f87171"};">${tc.message}</div>
      </div>
      <span class="tc-status ${tc.passed ? "passed" : "failed"}">${tc.passed ? "ĐẠT" : "CHƯA ĐẠT"}</span>
    `;
    container.appendChild(item);
  });
}

// Render danh sách Drawer bài học
function renderDrawer() {
  const container = document.getElementById("drawerLessonsList");
  container.innerHTML = "";
  lessons.forEach((l, idx) => {
    const prog = studentProgress[l.id];
    const isPassed = prog && prog.status === "passed";
    const isActive = idx === currentLessonIndex;

    const item = document.createElement("div");
    item.className = `drawer-item ${isActive ? "active" : ""}`;
    const statusIconSvg = window.Icons
      ? (isPassed ? Icons.get("checkCircle2", { size: 16 }) : Icons.get("fileCode", { size: 16 }))
      : (isPassed ? "✅" : "⭕");

    item.innerHTML = `
      <div>
        <div class="drawer-item-title" style="display:flex;align-items:center;gap:8px;">
          <span style="color: ${isPassed ? '#34d399' : 'var(--text-muted)'};">${statusIconSvg}</span>
          <span>Bài ${l.order}: ${l.title}</span>
        </div>
        <div class="drawer-item-cat">${l.category}</div>
      </div>
      <div style="font-size: 0.8rem; font-weight: 800; color: ${isPassed ? "#34d399" : "var(--text-muted)"}">
        ${isPassed ? "Đã xong" : "Chưa hoàn thành"}
      </div>
    `;
    item.addEventListener("click", () => {
      loadLesson(idx);
      closeDrawer();
    });
    container.appendChild(item);
  });
}

// Điều hướng Tab Output (Console vs Test Cases)
function switchOutputTab(tab) {
  const consoleBtn = document.getElementById("tabConsoleBtn");
  const testcasesBtn = document.getElementById("tabTestCasesBtn");
  const consoleView = document.getElementById("consoleView");
  const testcasesView = document.getElementById("testCasesView");

  if (tab === "console") {
    consoleBtn.classList.add("active");
    testcasesBtn.classList.remove("active");
    consoleView.style.display = "flex";
    testcasesView.style.display = "none";
  } else {
    testcasesBtn.classList.add("active");
    consoleBtn.classList.remove("active");
    testcasesView.style.display = "flex";
    consoleView.style.display = "none";
  }
}

function clearConsole() {
  document.getElementById("consoleView").innerHTML = "";
}

function appendConsoleLog(type, text) {
  const container = document.getElementById("consoleView");
  const line = document.createElement("div");
  line.className = `console-line ${type}`;
  line.textContent = text;
  container.appendChild(line);
  container.scrollTop = container.scrollHeight;
}

function formatLogArg(arg) {
  if (typeof arg === "object" && arg !== null) {
    try { return JSON.stringify(arg); } catch(e) { return String(arg); }
  }
  return String(arg);
}

function openDrawer() {
  document.getElementById("tracksDrawer").classList.add("active");
  document.getElementById("drawerOverlay").classList.add("active");
}

function closeDrawer() {
  document.getElementById("tracksDrawer").classList.remove("active");
  document.getElementById("drawerOverlay").classList.remove("active");
}

function setupEvents() {
  document.getElementById("btnRunCode").addEventListener("click", runUserCode);
  document.getElementById("btnSubmitCode").addEventListener("click", submitUserCode);

  document.getElementById("btnResetCode").addEventListener("click", () => {
    const lesson = lessons[currentLessonIndex];
    if (currentStudent.classId === "Robotics" && lesson && (lesson.kidQuiz || lesson.blockPuzzle)) {
      if (confirm("Con có muốn xóa các lựa chọn hiện tại để chơi lại bài này từ đầu không?")) {
        initRoboticsKidPlayground(lesson, null);
      }
      return;
    }
    if (confirm("Bạn có chắc muốn khôi phục lại đoạn mã ban đầu của bài học này không?")) {
      document.getElementById("codeTextarea").value = lesson.initialCode || "";
    }
  });

  document.getElementById("btnClearOutput").addEventListener("click", clearConsole);
  document.getElementById("tabConsoleBtn").addEventListener("click", () => switchOutputTab("console"));
  document.getElementById("tabTestCasesBtn").addEventListener("click", () => switchOutputTab("testcases"));

  document.getElementById("btnPrevLesson").addEventListener("click", () => {
    if (currentLessonIndex > 0) loadLesson(currentLessonIndex - 1);
  });
  document.getElementById("btnNextLesson").addEventListener("click", () => {
    if (currentLessonIndex < lessons.length - 1) loadLesson(currentLessonIndex + 1);
  });

  document.getElementById("btnOpenTracks").addEventListener("click", openDrawer);
  document.getElementById("btnCloseDrawer").addEventListener("click", closeDrawer);
  document.getElementById("drawerOverlay").addEventListener("click", closeDrawer);

  document.getElementById("btnModalNextLesson").addEventListener("click", () => {
    hideCongratsModal();
    if (currentLessonIndex < lessons.length - 1) {
      loadLesson(currentLessonIndex + 1);
    } else {
      openDrawer();
    }
  });

  const textarea = document.getElementById("codeTextarea");
  textarea.addEventListener("keydown", (e) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      textarea.value = textarea.value.substring(0, start) + "    " + textarea.value.substring(end);
      textarea.selectionStart = textarea.selectionEnd = start + 4;
    } else if (e.ctrlKey && e.key === "Enter") {
      e.preventDefault();
      runUserCode();
    }
  });
}
