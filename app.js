// Danh sách các bài học mẫu dành cho học sinh
const LESSONS = [
  {
    id: "01-hello",
    badge: "Bài 1",
    icon: "👋",
    title: "Xin chào JavaScript",
    desc: "JavaScript dùng lệnh `console.log()` để in thông báo ra màn hình điều khiển. Đây là câu lệnh đầu tiên mà mọi lập trình viên đều học!",
    challenge: "Hãy sửa tên trong dấu ngoặc kép thành tên thật của bạn và nhấn 'Chạy Code'.",
    defaultCode: `// 1. Lệnh in câu chào ra màn hình
console.log("Xin chào! Mình là học sinh lớp JavaScript.");

// 2. Thử in một lời nhắn nữa nào
console.log("Học lập trình thật là thú vị! 🚀");`
  },
  {
    id: "02-variables",
    badge: "Bài 2",
    icon: "📦",
    title: "Biến & Kiểu Dữ Liệu",
    desc: "Biến (variable) giống như những chiếc hộp có dán nhãn, dùng để lưu trữ thông tin như tên (chuỗi chữ), tuổi (số) hay trạng thái.",
    challenge: "Tạo thêm một biến 'soThich' chứa sở thích của bạn và dùng console.log() để in ra.",
    defaultCode: `// let dùng để tạo một biến có thể thay đổi giá trị
let hoVaTen = "Nguyễn Văn An";
let tuoi = 12;
let laHocSinh = true; // Kiểu Đúng/Sai (Boolean)

console.log("Họ và tên:", hoVaTen);
console.log("Tuổi:", tuoi);
console.log("Là học sinh:", laHocSinh);

// Thay đổi giá trị của biến
tuoi = tuoi + 1;
console.log("Năm sau, bạn sẽ:", tuoi, "tuổi");`
  },
  {
    id: "03-math",
    badge: "Bài 3",
    icon: "➕",
    title: "Phép Toán Số Học",
    desc: "Máy tính rất giỏi tính toán! JavaScript hỗ trợ các phép tính: cộng (+), trừ (-), nhân (*), chia (/).",
    challenge: "Tính chu vi hình chữ nhật có chiều dài 8 và chiều rộng 5 (công thức: (dài + rộng) * 2).",
    defaultCode: `let a = 15;
let b = 5;

console.log("Phép cộng a + b =", a + b);
console.log("Phép trừ a - b =", a - b);
console.log("Phép nhân a * b =", a * b);
console.log("Phép chia a / b =", a / b);

// Ghép chuỗi chữ với số:
let soDiem = 10;
console.log("Điểm kiểm tra của bạn là: " + soDiem + " điểm!");`
  },
  {
    id: "04-conditions",
    badge: "Bài 4",
    icon: "🚦",
    title: "Câu Lệnh Điều Kiện (if / else)",
    desc: "Lệnh if (nếu) và else (ngược lại) giúp máy tính biết tự đưa ra quyết định dựa trên điều kiện đúng hay sai.",
    challenge: "Đổi giá trị 'diem' thành 4 để xem máy tính sẽ in ra thông báo gì nhé!",
    defaultCode: `let diem = 9;

console.log("Điểm số của bạn:", diem);

if (diem >= 8) {
  console.log("🌟 Xếp loại: Giỏi! Bạn làm bài rất xuất sắc.");
} else if (diem >= 5) {
  console.log("👍 Xếp loại: Đạt! Chúc mừng bạn đã qua môn.");
} else {
  console.log("💪 Cần cố gắng hơn ở bài kiểm tra sau nhé!");
}`
  },
  {
    id: "05-loops",
    badge: "Bài 5",
    icon: "🔄",
    title: "Vòng Lặp (for loop)",
    desc: "Vòng lặp giúp máy tính tự động lặp lại một công việc nhiều lần mà bạn không cần phải gõ lại từng dòng.",
    challenge: "Hãy sửa vòng lặp để đếm từ 1 đến 10 thay vì từ 1 đến 5.",
    defaultCode: `console.log("Bắt đầu đếm ngược nào:");

for (let i = 5; i >= 1; i--) {
  console.log("Đếm:", i);
}

console.log("🚀 Phóng tên lửa thành công!");`
  },
  {
    id: "06-functions",
    badge: "Bài 6",
    icon: "⚙️",
    title: "Hàm (Function - Cỗ Máy Nhỏ)",
    desc: "Hàm giống như một cỗ máy: nhận nguyên liệu đầu vào (tham số), xử lý và trả về kết quả (return). Viết 1 lần, dùng được mãi mãi!",
    challenge: "Tạo hàm 'gapDoi(so)' nhận vào một số và trả về số đó nhân với 2.",
    defaultCode: `// Định nghĩa một hàm chào mừng
function taoLoiChao(ten, monHoc) {
  return "Chào " + ten + "! Chúc bạn học tốt môn " + monHoc + " nhé.";
}

// Gọi hàm và in kết quả
let loiNhan1 = taoLoiChao("Bình", "Toán");
let loiNhan2 = taoLoiChao("Mai", "Tin Học");

console.log(loiNhan1);
console.log(loiNhan2);`
  },
  {
    id: "07-arrays",
    badge: "Bài 7",
    icon: "📋",
    title: "Mảng Dữ Liệu (Array)",
    desc: "Mảng là một danh sách chứa nhiều phần tử, đánh số thứ tự bắt đầu từ 0.",
    challenge: "Thêm một món ăn bạn thích vào danh sách bằng lệnh `danhSachMonAn.push('tên món')` rồi in lại danh sách.",
    defaultCode: `let danhSachMonAn = ["Pizza", "Phở bò", "Kem socola", "Bánh mì"];

console.log("Số lượng món ăn:", danhSachMonAn.length);
console.log("Món đầu tiên (vị trí 0):", danhSachMonAn[0]);
console.log("Món thứ hai (vị trí 1):", danhSachMonAn[1]);

console.log("--- Danh sách tất cả các món ---");
for (let i = 0; i < danhSachMonAn.length; i++) {
  console.log((i + 1) + ". " + danhSachMonAn[i]);
}`
  }
];

// Khởi tạo các phần tử DOM
let currentLesson = LESSONS[0];

const lessonListEl = document.getElementById("lessonList");
const lessonBadgeEl = document.getElementById("lessonBadge");
const lessonTitleEl = document.getElementById("lessonTitle");
const lessonDescEl = document.getElementById("lessonDesc");
const lessonChallengeEl = document.getElementById("lessonChallenge");
const codeEditorEl = document.getElementById("codeEditor");
const consoleOutputEl = document.getElementById("consoleOutput");
const runCodeBtn = document.getElementById("runCodeBtn");
const resetCodeBtn = document.getElementById("resetCodeBtn");
const clearConsoleBtn = document.getElementById("clearConsoleBtn");

// Tạo danh sách bài học ở thanh bên
function renderLessonList() {
  lessonListEl.innerHTML = "";
  LESSONS.forEach((lesson) => {
    const li = document.createElement("li");
    li.className = `lesson-item ${lesson.id === currentLesson.id ? "active" : ""}`;
    li.innerHTML = `
      <span class="lesson-icon">${lesson.icon}</span>
      <span>${lesson.badge}: ${lesson.title}</span>
    `;
    li.addEventListener("click", () => switchLesson(lesson));
    lessonListEl.appendChild(li);
  });
}

// Chuyển bài học
function switchLesson(lesson) {
  currentLesson = lesson;
  lessonBadgeEl.textContent = lesson.badge;
  lessonTitleEl.textContent = lesson.title;
  lessonDescEl.innerHTML = lesson.desc;
  lessonChallengeEl.textContent = lesson.challenge;
  codeEditorEl.value = lesson.defaultCode;
  
  clearConsole();
  appendLog("system", `Đã mở: ${lesson.badge} - ${lesson.title}. Bấm "Chạy Code" để xem kết quả!`);
  renderLessonList();
}

// Xóa màn hình console
function clearConsole() {
  consoleOutputEl.innerHTML = "";
}

// In thông điệp ra console trên web
function appendLog(type, ...args) {
  const line = document.createElement("div");
  line.className = `log-line log-${type}`;
  
  const formatted = args.map(arg => {
    if (typeof arg === "object" && arg !== null) {
      try {
        return JSON.stringify(arg, null, 2);
      } catch (e) {
        return String(arg);
      }
    }
    return String(arg);
  }).join(" ");

  line.textContent = formatted;
  consoleOutputEl.appendChild(line);
  consoleOutputEl.scrollTop = consoleOutputEl.scrollHeight;
}

// Chạy code an toàn
function runCode() {
  const code = codeEditorEl.value;
  clearConsole();
  appendLog("system", "--- BẮT ĐẦU CHẠY CHƯƠNG TRÌNH ---");

  // Ghi đè console.log tạm thời để hiển thị lên màn hình giao diện
  const originalLog = console.log;
  const originalError = console.error;
  const originalWarn = console.warn;

  console.log = (...args) => {
    originalLog(...args);
    appendLog("string", ...args);
  };

  console.error = (...args) => {
    originalError(...args);
    appendLog("error", ...args);
  };

  console.warn = (...args) => {
    originalWarn(...args);
    appendLog("number", ...args);
  };

  try {
    // Chạy code qua Function constructor
    const runner = new Function(code);
    runner();
    appendLog("system", "--- HOÀN THÀNH (Không có lỗi) ---");
  } catch (err) {
    appendLog("error", `❌ Lỗi JavaScript: ${err.message}`);
    appendLog("system", "💡 Gợi ý: Hãy kiểm tra lại dấu ngoặc đơn (), ngoặc kép \"\", hoặc tên biến xem đã gõ đúng chưa nhé!");
  } finally {
    // Khôi phục lại console gốc
    console.log = originalLog;
    console.error = originalError;
    console.warn = originalWarn;
  }
}

// Sự kiện nút bấm
runCodeBtn.addEventListener("click", runCode);

resetCodeBtn.addEventListener("click", () => {
  codeEditorEl.value = currentLesson.defaultCode;
  clearConsole();
  appendLog("system", "Đã khôi phục code gốc của bài học.");
});

clearConsoleBtn.addEventListener("click", clearConsole);

// Cho phép nhấn Ctrl + Enter để chạy code nhanh
codeEditorEl.addEventListener("keydown", (e) => {
  if (e.ctrlKey && e.key === "Enter") {
    e.preventDefault();
    runCode();
  }
});

// Khởi chạy ban đầu
switchLesson(LESSONS[0]);
