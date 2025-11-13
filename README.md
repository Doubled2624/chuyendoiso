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
TD_REMOTE_AI là hệ thống quản lý nhân viên làm việc từ xa cho Công ty Thành Đô, phát triển theo mô hình SPA bằng HTML–CSS–JS. Hệ thống hỗ trợ chấm công GPS, quản lý công việc, tính lương và phân tích dữ liệu bằng AI nội bộ Ollama.

## 🧩 2. Công nghệ sử dụng
| Thành phần | Công nghệ |
|-----------|-----------|
| Frontend | HTML, CSS, JavaScript (SPA) |
| UI Framework | Material Design |
| Data Storage | LocalStorage |
| AI | Ollama (Llama3/Gemma) |
| Backend (tuỳ chọn) | Node.js / Flask |
| Database (tuỳ chọn) | PostgreSQL / Redis |
| Triển khai | Docker Compose |
| Monitoring | Prometheus, Grafana, ELK |

## 🚀 3. Các chức năng chính
- Đăng nhập & phân quyền  
- Quản lý nhân viên  
- Quản lý công việc  
- Chấm công GPS + Google Maps  
- Tính lương tự động  
- Chat AI thông minh (Planner → Executor → Writer → Critic)

## 🛠️ 5. Triển khai Docker Compose
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
    ports:
      - "11434:11434"
  db:
    image: postgres:15
    environment:
      POSTGRES_USER: admin
      POSTGRES_PASSWORD: 123456
  nginx:
    image: nginx
    ports:
      - "80:80"
```

## 📊 6. Giám sát hệ thống
Sử dụng Prometheus, Grafana, ELK Stack và Alertmanager.

## 🚀 9. Khởi chạy nhanh
```bash
git clone https://github.com/yourname/td_remote_ai.git
cd td_remote_ai
npx serve .
ollama run llama3.1
```

## 📜 10. Giấy phép
Phục vụ học tập và nghiên cứu trong lĩnh vực chuyển đổi số doanh nghiệp.
