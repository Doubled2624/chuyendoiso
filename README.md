<h2 align="center">
    <a href="https://dainam.edu.vn/vi/khoa-cong-nghe-thong-tin">
    🎓 Faculty of Information Technology (DaiNam University)
    </a>
</h2>

<h2 align="center">
   ỨNG DỤNG QUẢN LÝ KHO Y TẾ XÃ (WMS_YTE_XA_AI)
</h2>

<div align="center">
    <p align="center">
        <img src="docs/aiotlab_logo.png" alt="AIoTLab Logo" width="170"/>
        <img src="docs/fitdnu_logo.png" alt="FIT DNU Logo" width="180"/>
        <img src="docs/dnu_logo.png" alt="DaiNam University Logo" width="200"/>
    </p>

[![AIoTLab](https://img.shields.io/badge/AIoTLab-green?style=for-the-badge)](https://www.facebook.com/DNUAIoTLab)
[![Faculty of Information Technology](https://img.shields.io/badge/Faculty%20of%20Information%20Technology-blue?style=for-the-badge)](https://dainam.edu.vn/vi/khoa-cong-nghe-thong-tin)
[![DaiNam University](https://img.shields.io/badge/DaiNam%20University-orange?style=for-the-badge)](https://dainam.edu.vn)

</div>

---

## 📘 1. Giới thiệu hệ thống

**TD_REMOTE_AI** là hệ thống quản lý nhân viên làm việc từ xa cho **Công ty Thành Đô**, phát triển theo mô hình **Single Page Application (SPA)** bằng **HTML – CSS – JavaScript**.

Hệ thống cho phép:

- 👨‍💻 **Nhân viên:**  
  - Đăng nhập, xem công việc, cập nhật trạng thái.  
  - Chấm công theo vị trí GPS (check-in / check-out).  

- 🧑‍💼 **Quản trị viên (Admin):**  
  - Quản lý danh sách nhân viên, phân phòng ban, khoá/mở tài khoản.  
  - Giao việc, theo dõi tiến độ, tính lương, xuất báo cáo CSV/JSON.  
  - Sử dụng **AI nội bộ** để phân tích KPI, chấm công, lương theo thời gian thực.

- 🤖 **AI Trợ lý Thành Đô:**  
  - Hiểu câu hỏi tiếng Việt và trả lời dựa trên **dữ liệu thật** trong hệ thống (users, tasks, attendance, payroll).  
  - Hỗ trợ các truy vấn như:  
    - “Tóm tắt KPI tuần này của phòng Kỹ thuật.”  
    - “Ai chưa check-in 3 ngày gần nhất?”  
    - “Tính bảng lương tháng này và xuất Excel.”  
  - Tích hợp với **Ollama** chạy cục bộ (local LLM), đảm bảo **bảo mật dữ liệu doanh nghiệp**.

Ứng dụng được xây dựng theo hướng **offline-first**, dữ liệu có thể lưu trong `localStorage` hoặc backend (nếu bật chế độ server).

---

## 🧱 2. Kiến trúc tổng quan

Hệ thống gồm các lớp chính:

- **Frontend SPA (HTML/CSS/JS):**  
  - Chạy trực tiếp trên trình duyệt.  
  - Điều hướng bằng hash router: `#/dashboard`, `#/employees`, `#/tasks`, `#/attendance`, `#/payroll`, `#/ai`, `#/admin`.  

- **Lớp nghiệp vụ (Business Logic – JS Modules):**  
  - `auth.js` – Đăng nhập, phân quyền.  
  - `data.js` – Đọc/ghi dữ liệu (LocalStorage hoặc API).  
  - `payroll.js` – Tính lương từ log chấm công.  
  - `ui.js`, `router.js` – Render giao diện, điều hướng.  

- **Lớp AI nội bộ:**  
  - `ai.js`, `ai_skills.js`, `ai_ui.js`.  
  - Kết nối tới **Ollama API** (`http://localhost:11434`) để gọi model như `llama3.1`, `gemma`…  
  - AI không gọi Internet, chỉ phân tích dựa trên dữ liệu nội bộ.

- **Backend & Database (tùy chọn / mở rộng):**  
  - Có thể dùng Node.js/Flask + PostgreSQL/Redis khi triển khai thực tế.  
  - Phiên bản demo có thể chạy **chỉ với Frontend + Ollama**.

---

## 🧩 3. Công nghệ sử dụng

| Thành phần        | Công nghệ                                  |
|-------------------|--------------------------------------------|
| Frontend          | HTML, CSS, JavaScript (Single Page App)   |
| UI/UX             | Material Design, Responsive, Dark/Light   |
| Lưu trữ cục bộ    | LocalStorage (offline-first)              |
| AI nội bộ         | Ollama (Llama3 / Gemma / tuỳ model)       |
| Backend (option)  | Node.js (Express) / Python (Flask)        |
| CSDL (option)     | PostgreSQL, Redis                         |
| Triển khai        | Docker Compose, Nginx reverse proxy       |
| Monitoring (opt.) | Prometheus, Grafana, ELK Stack            |

---

## 🚀 4. Các chức năng chính

### 4.1 Đăng nhập & phân quyền

- Đăng nhập bằng email + mật khẩu.  
- Phân quyền:
  - **Admin**: full chức năng, xem & chỉnh toàn bộ dữ liệu.  
  - **Nhân viên**: chỉ xem và thao tác trên dữ liệu của riêng mình (công việc, chấm công, hồ sơ).  
- Lưu session trong `localStorage`.

---

### 4.2 Quản lý nhân viên

- Danh sách nhân viên:
  - Họ tên, email, vai trò, phòng ban, trạng thái.  
- Bộ lọc phòng ban, nút **Xuất CSV** để phục vụ báo cáo.  
- Chức năng:
  - Thêm nhân viên mới.  
  - Chỉnh sửa tên, phòng ban, mật khẩu.  
  - Khoá / mở khoá tài khoản.

---

### 4.3 Quản lý công việc

- Tạo & giao việc:
  - Tiêu đề, mô tả, hạn hoàn thành, người nhận.  
- Trạng thái công việc:
  - `todo` → `inprogress` → `done`.  
- Lọc công việc theo phòng ban và nhân viên.  
- Xuất danh sách công việc ra CSV phục vụ báo cáo.  

---

### 4.4 Chấm công GPS

- Nhân viên có thể:
  - **Check-in**: ghi thời gian và toạ độ GPS.  
  - **Check-out**: ghi thời gian kết thúc và toạ độ (nếu có).  
- Dữ liệu lưu trong `attendance`:
  - userId, date, checkIn, checkOut, lat, lng.  
- Giao diện hiển thị:
  - Bảng danh sách ngày công, giờ vào/ra, toạ độ.  
  - Link **Google Maps** từ lat/lng để kiểm tra vị trí.  

---

### 4.5 Tính lương

- Tính lương dựa trên:
  - Số giờ làm việc chuẩn trong kỳ.  
  - Giờ OT (overtime) dựa trên log check-in/check-out.  
  - Lương cơ bản, phụ cấp, khấu trừ, hệ số OT.  
- Xuất **bảng lương** ra CSV hoặc JSON.  
- Lưu lại các kỳ lương đã chốt để dễ dàng tra cứu.

---

### 4.6 AI Trợ lý Thành Đô

- Tab **AI (Admin)** cho phép chat hỗ trợ phân tích dữ liệu.  
- Một số tác vụ AI có thể thực hiện:
  - Tóm tắt KPI theo phòng ban / theo tuần.  
  - Phát hiện bất thường chấm công (thiếu giờ, thiếu check-in/out).  
  - Liệt kê công việc sắp đến hạn, quá hạn.  
  - Gợi ý hành động quản trị nhân sự.  
- AI trả lời theo bố cục:
  - **Kết quả chính**, **Phân tích**, **Đề xuất hành động**, **Nguồn dữ liệu**.  

---

## 🧠 5. Mô hình hoạt động AI

Pipeline AI được thiết kế theo từng bước rõ ràng:

1. **User hỏi (tiếng Việt):**  
   → Ví dụ: “Tóm tắt KPI tuần này của phòng Kỹ thuật và đề xuất 3 việc ưu tiên.”

2. **Planner (trên Ollama):**  
   → Sinh ra JSON kế hoạch (`intent`, `steps`) mô tả tool nào sẽ được gọi.  

3. **Executor (trên browser):**  
   → `ai_skills.js` thực thi từng step, đọc dữ liệu thật từ hệ thống (users, tasks, attendance, payroll).  

4. **Writer (trên Ollama):**  
   → Tổng hợp kết quả, tạo báo cáo dạng Markdown với bố cục rõ.  

5. **Critic (tùy chọn):**  
   → Đánh giá chất lượng câu trả lời, yêu cầu bổ sung số liệu/đề xuất nếu còn hời hợt.  

6. **Hiển thị:**  
   → Giao diện AI render đẹp, hỗ trợ **Markdown + bảng + code block + emoji**, có phần “🛠️ Nhật ký phân tích” chứa JSON kế hoạch & kết quả cho DevOps/QA kiểm tra.

---

## 🛠️ 6. Triển khai hệ thống (Docker Compose)

Hệ thống có thể triển khai dạng nhiều service bằng **Docker Compose**.

### 6.1 Ví dụ `docker-compose.yml` (tối giản)

```yaml
version: "3.9"
services:
  frontend:
    build: ./frontend
    ports:
      - "8080:80"

  backend:
    build: ./backend
    ports:
      - "5000:5000"

  ai_service:
    image: ollama/ollama
    volumes:
      - ollama_data:/root/.ollama
    ports:
      - "11434:11434"

  db:
    image: postgres:15
    environment:
      POSTGRES_USER: admin
      POSTGRES_PASSWORD: 123456
      POSTGRES_DB: thanhdo_remote
    volumes:
      - pgdata:/var/lib/postgresql/data

  nginx:
    image: nginx
    volumes:
      - ./deploy/nginx.conf:/etc/nginx/nginx.conf:ro
    ports:
      - "80:80"
    depends_on:
      - frontend
      - backend
      - ai_service

volumes:
  pgdata:
  ollama_data:
```

### 6.2 Khởi chạy bằng Docker

```bash
docker-compose up -d
```

---

## 📈 7. Giám sát & nhật ký hệ thống

Khi triển khai thực tế, hệ thống có thể được giám sát bằng:

- **Prometheus:** Thu thập metrics (CPU, RAM, số lượng request, độ trễ API).  
- **Grafana:** Vẽ dashboard theo dõi tình trạng hệ thống (lỗi, tải, người dùng đang online).  
- **ELK Stack (Elasticsearch – Logstash – Kibana):** Thu thập & phân tích log ứng dụng/backend/AI.  
- **Alertmanager:** Gửi cảnh báo qua Email/Slack/Telegram khi có sự cố (service down, CPU cao, lỗi 500 tăng đột biến).

---

## 🖼️ 8. Giao diện chính

Một số màn hình chính:

- **Dashboard:**  
  - Tóm tắt số lượng nhân viên, công việc, tỷ lệ hoàn thành, trạng thái chấm công hôm nay.  

- **Nhân viên:**  
  - Bảng danh sách, lọc phòng ban, xuất CSV.  

- **Công việc:**  
  - Danh sách, trạng thái, hạn, người phụ trách.  
  - Form giao việc, chỉnh sửa, xoá.  

- **Chấm công:**  
  - Bảng log check-in/out, toạ độ, link Google Maps.  
  - Nút check-in/out ngay trong giao diện.  

- **Tính lương:**  
  - Lọc theo kỳ (từ ngày – đến ngày, phòng ban).  
  - Bảng lương chi tiết, tổng hợp, export CSV/JSON.  

- **AI (Admin):**  
  - Khung chat, lịch sử hội thoại, nút gợi ý câu hỏi.  
  - Popup cấu hình AI (URL Ollama, model, export log).  

---

## ⭐ 9. Điểm nổi bật

- 🔒 **Bảo mật dữ liệu:** AI chạy nội bộ (Ollama), không gửi dữ liệu ra Internet.  
- ⚡ **Nhanh & nhẹ:** SPA thuần JS, không cần framework nặng.  
- 📶 **Offline-first:** Có thể chạy chỉ với trình duyệt & localStorage (cho demo/học tập).  
- 📊 **Phân tích dữ liệu thông minh:** AI trả lời dựa trên dữ liệu mới nhất, có số liệu & đề xuất rõ ràng.  
- 🧱 **Dễ mở rộng:** Có thể thêm backend thật, database thật, hoặc thêm kỹ năng AI mới mà không phải viết lại UI.  

---

## 🧪 10. Khởi chạy nhanh (Local Dev)

### 10.1 Chạy bản Frontend tĩnh

```bash
git clone https://github.com/yourname/td_remote_ai.git
cd td_remote_ai

# Chạy server tĩnh (npx serve hoặc http-server hoặc live-server)
npx serve .
# hoặc
python -m http.server 8000
```

Mở trình duyệt tại:

- `http://localhost:3000` (nếu dùng `npx serve .`)  
- `http://localhost:8000` (nếu dùng `python -m http.server`)  

### 10.2 Bật Ollama

```bash
# Cài ollama trước, sau đó:
ollama pull llama3.1
ollama serve
```

Trong phần cấu hình AI của ứng dụng, đặt:

- **Base URL:** `http://localhost:11434`  
- **Model:** `llama3.1` (hoặc model bạn đang sử dụng)

---

## 📁 11. Cấu trúc thư mục tham khảo

```bash
td_remote_ai/
├─ index.html
├─ assets/
│  ├─ css/
│  │  └─ style.css
│  └─ js/
│     ├─ ui.js
│     ├─ router.js
│     ├─ data.js
│     ├─ auth.js
│     ├─ payroll.js
│     ├─ ai.js
│     ├─ ai_ui.js
│     └─ ai_skills.js
├─ deploy/
│  └─ nginx.conf
└─ README.md
```

---

## 📜 12. Giấy phép

Dự án được xây dựng phục vụ **mục đích học tập và nghiên cứu** trong khuôn khổ môn học / đồ án **Chuyển đổi số doanh nghiệp** với bối cảnh giả lập **Công ty Thành Đô**.

Tác giả: **Bùi Tuấn Dương**  
Vui lòng trích dẫn nguồn nếu tái sử dụng hoặc phát triển thêm từ mã nguồn này.

---

🎉 Cảm ơn bạn đã sử dụng TD_REMOTE_AI!  
Nếu bạn thấy dự án hữu ích, hãy ⭐ trên GitHub để ủng hộ tác giả.