// 1. Khởi tạo biến lưu trữ điểm số
let diemSo = 0;

// 2. Danh sách các màu nền ngẫu nhiên
const danhSachMau = [
  "#f3e8ff", // Tím nhạt
  "#e0f2fe", // Xanh dương nhạt
  "#dcfce7", // Xanh lá nhạt
  "#fef3c7", // Vàng nhạt
  "#ffe4e6"  // Hồng nhạt
];

// 3. Lấy các phần tử trên trang web bằng id (DOM)
const scoreEl = document.getElementById("score");
const messageEl = document.getElementById("levelMessage");
const clickBtn = document.getElementById("clickBtn");
const colorBtn = document.getElementById("colorBtn");
const resetBtn = document.getElementById("resetBtn");

// 4. Lập trình cho nút "Bấm để cộng điểm"
clickBtn.addEventListener("click", function() {
  // Tăng điểm lên 1
  diemSo = diemSo + 1;
  
  // Cập nhật điểm lên màn hình
  scoreEl.textContent = diemSo;

  // Hiệu ứng phóng to nhẹ điểm số khi bấm
  scoreEl.style.transform = "scale(1.2)";
  setTimeout(() => {
    scoreEl.style.transform = "scale(1)";
  }, 100);

  // Kiểm tra điều kiện điểm số để đưa ra lời chúc mừng
  if (diemSo === 5) {
    messageEl.textContent = "🔥 Tuyệt vời! Bạn đã đạt 5 điểm!";
    messageEl.style.color = "#d97706";
  } else if (diemSo === 10) {
    messageEl.textContent = "🎉 Siêu sao! Bạn đạt mốc 10 điểm rồi!";
    messageEl.style.color = "#7c3aed";
  } else if (diemSo > 10) {
    messageEl.textContent = "🚀 Không thể ngăn cản! Điểm đang tăng vèo vèo!";
  }
});

// 5. Lập trình cho nút "Đổi màu nền"
colorBtn.addEventListener("click", function() {
  // Chọn ngẫu nhiên một màu trong danh sách
  const viTriNgauNhien = Math.floor(Math.random() * danhSachMau.length);
  const mauMoi = danhSachMau[viTriNgauNhien];

  // Thay đổi màu nền của toàn bộ trang web (thẻ body)
  document.body.style.backgroundColor = mauMoi;
  console.log("Đã đổi màu nền sang mã màu:", mauMoi);
});

// 6. Lập trình cho nút "Đặt lại từ đầu"
resetBtn.addEventListener("click", function() {
  diemSo = 0;
  scoreEl.textContent = diemSo;
  messageEl.textContent = "Hãy bấm nút để ghi điểm đầu tiên!";
  messageEl.style.color = "#059669";
  document.body.style.backgroundColor = "#f3e8ff";
  console.log("Đã đặt lại trò chơi về trạng thái ban đầu.");
});
