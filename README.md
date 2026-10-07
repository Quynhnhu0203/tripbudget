# TripBudget

Lên lịch trình du lịch theo ngân sách: khách nhập ngân sách và yêu cầu viết tự do, LLM đọc ràng buộc và chọn lịch trình chỉ từ dữ liệu trong hệ thống, code tính tổng tiền và chặn mọi lịch trình vượt ngân sách.

Đồ án môn CSC13114 — Advanced Web Application Development. Đề xuất: [docs/PROPOSAL.md](docs/PROPOSAL.md).

**Nhóm:** Nguyễn Lê Minh Nhật · Nguyễn Trần Quỳnh Như · Đặng Mai Quốc

## Cấu trúc

```
client/   React + Vite
server/   Node.js + Express
docs/     đề xuất, spec
```

## Chạy local

Cần Node.js 22+.

```bash
npm install
cp .env.example .env
npm run dev:server   # http://localhost:3000
npm run dev:client   # http://localhost:5173
```

## Kiểm tra

```bash
npm run lint
npm test
npm run build
```

CI (GitHub Actions) chạy cả ba lệnh trên ở mỗi push và pull request.
