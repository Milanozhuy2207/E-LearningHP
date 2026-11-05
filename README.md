# 🔴 MindX Technology School - Nền Tảng Học & Thực Hành Code

Hệ thống học lập trình trực tuyến dành riêng cho học sinh **MindX Technology School**, hỗ trợ quản lý học sinh theo **4 bộ môn chính: Python, Web, Unity và Lập trình Robot (VEX GO & VEX IQ)** với giao diện hiện đại, chuyên nghiệp.

---

## 🌐 Các Đường Dẫn Truy Cập

| Đối tượng | Địa chỉ trên máy này | Địa chỉ qua Wi-Fi lớp học |
| :--- | :--- | :--- |
| **Học sinh (Chọn lớp & Làm bài)** | [http://localhost:3000](http://localhost:3000) | `http://<IP_MÁY_BẠN>:3000` |
| **Giáo viên (Bảng Giám sát & Quản lý lớp)** | [http://localhost:3000/teacher.html](http://localhost:3000/teacher.html) | `http://<IP_MÁY_BẠN>:3000/teacher.html` |

> *Ví dụ: Nếu IP máy tính của bạn là `192.168.1.254`, học sinh trong lớp chỉ cần kết nối cùng mạng Wi-Fi và truy cập `http://192.168.1.254:3000`.*

---

## 🏫 4 Bộ Môn Học Tại MindX

1. 🌐 **Lớp Web:** Lập trình JavaScript, xây dựng giao diện và tương tác web.
2. 🐍 **Lớp Python:** Tư duy logic, thuật toán và giải quyết bài toán với Python.
3. 🎮 **Lớp Unity:** Lập trình logic và phát triển game 2D/3D (C#).
4. 🤖 **Lớp Lập trình Robot (VEX GO & VEX IQ):** Điều khiển VEX Brain, Drivetrain, cảm biến khoảng cách, nam châm điện và lập trình tự hành (Autonomous).

Học sinh khi vào trang web sẽ:
- **Bước 1:** Chọn lớp học của mình (Web, Python, Unity hoặc Robot VEX).
- **Bước 2:** Chọn tên mình trong danh sách học sinh của lớp đó (hoặc tìm kiếm nhanh tên mình) để bắt đầu học ngay lập tức!
- *(Nếu là học sinh mới vào lớp, có sẵn ô nhập tên để tự thêm vào lớp).*

---

## 👨‍🏫 Tính Năng Dành Cho Giáo Viên (Teacher Dashboard)

- **Bộ lọc theo lớp:** Xem toàn trường hoặc lọc riêng theo từng lớp: `[Tất cả]`, `[🌐 Lớp Web]`, `[🐍 Lớp Python]`, `[🎮 Lớp Unity]`, `[🤖 Lớp Robot (VEX)]`.
- **Thêm học sinh mới:** Bấm nút **"+ Thêm Học Sinh"** để nhập tên và gán vào lớp mong muốn.
- **Xóa học sinh:** Nút thùng rác `🗑️` cho phép xóa học sinh khỏi danh sách lớp nếu cần.
- **Xem trực tiếp mã nguồn (🔍 Xem Code):** Nhấp vào để xem chi tiết từng dòng code học sinh đã viết cho từng bài, số lần thử và thời gian nộp bài.
- **Cập nhật Live thời gian thực:** Tự động đồng bộ tiến độ mỗi 5 giây mà không cần F5.

---

## 🛠️ Các Lệnh Khởi Động Máy Chủ (TypeScript)

Mở terminal tại thư mục `training`:

- **Chạy server (Khuyên dùng):**
  ```bash
  npm start
  ```
  *(Sử dụng `tsx` thực thi trực tiếp TypeScript siêu tốc)*

- **Chế độ phát triển (Tự động tải lại khi sửa code):**
  ```bash
  npm run dev
  ```

- **Biên dịch và chạy bản build:**
  ```bash
  npm run build
  npm run prod
  ```

---

## 📂 Cấu Trúc Dự Án (TypeScript + Express)

```text
training/
├── src/                        # Mã nguồn TypeScript Backend
│   ├── server.ts               # Express Server & APIs quản lý lớp, học sinh, chấm bài
│   └── types/
│       └── index.ts            # Định nghĩa ClassType, Student, Lesson, TestCase,...
├── dist/                       # Mã JavaScript sau khi biên dịch (tsc)
├── tsconfig.json               # Cấu hình TypeScript 7 (NodeNext)
├── package.json                # Thư viện: express, cors, typescript, tsx, @types/...
├── data/
│   ├── lessons_web.json        # 7 bài học Lập trình Web (JavaScript)
│   ├── lessons_python.json     # 7 bài học Lập trình Python 3
│   ├── lessons_unity.json      # 7 bài học Phát triển Game Unity (C#)
│   ├── lessons_robotics.json   # 7 bài học Lập trình Robot (VEX GO & VEX IQ)
│   └── students.json           # Danh sách học sinh theo 4 lớp học
└── public/                     # Giao diện Web Client phong cách MindX
    ├── index.html              # Trang chủ: Chọn 1 trong 3 lớp & chọn tên học sinh
    ├── learn.html              # MindX Code Lab: Lý thuyết, Code Editor, Console & Test Cases
    ├── teacher.html            # Teacher Dashboard: Quản lý 3 lớp, xem code, thống kê
    ├── css/
    │   ├── common.css          # Brand màu đỏ MindX & accents từng lớp
    │   ├── learn.css           # Giao diện Code Lab
    │   └── teacher.css         # Giao diện Teacher Dashboard
    └── js/
        ├── learn.js            # Engine chạy code & kiểm tra Test Cases tự động
        └── teacher.js          # Logic cập nhật tiến độ Live, lọc lớp, thêm/xóa học sinh
```
