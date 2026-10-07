# PA#1 — TripBudget: lên lịch trình du lịch theo ngân sách

Nhóm: Nguyễn Lê Minh Nhật `23120068` · Nguyễn Trần Quỳnh Như `23120069` · Đặng Mai Quốc `23120078` · Repo: https://github.com/Quynhnhu0203/tripbudget

## 1. Vấn đề và người dùng

**Minh**, sinh viên năm 3 ở TP.HCM, rủ 2 bạn đi 3 ngày 2 đêm dịp lễ, **cả nhóm có 4 triệu**, chưa biết đi đâu. **Vấn đề:** người có ngân sách cố định không biết đi đâu, ở đâu cho vừa tiền, và chỉ phát hiện vượt ngân sách khi đã đi. **Hiện nay:** đọc review Facebook/TikTok, xem phòng trên Agoda, tự cộng tiền vào ghi chú điện thoại — hay quên xe nội thành, vé cổng. Vai trò: **khách**; **bên cung cấp dịch vụ** (khách sạn, nhà xe, quán ăn — đăng giá, lịch trống: nguồn giá thật); **admin** (điểm tham quan, duyệt bên cung cấp).

## 2. Tính năng LLM: lịch trình theo ngân sách và yêu cầu

1. Khách nhập ngân sách, ngày đi, số ngày, số người và yêu cầu tự do ("thích biển, bạn em đau chân, một đứa ăn chay").
2. **LLM đọc yêu cầu** → ràng buộc thuộc **tập đóng** (`it_di_bo`, `an_chay`, `can_thang_may`…); hệ thống **hỏi lại khách xác nhận**.
3. **Code lọc ứng viên** từ CSDL: còn phòng, xe có chuyến, quán và điểm tham quan mở cửa, thoả ràng buộc đã xác nhận.
4. **LLM chọn và xếp** lịch trình theo ngày (xe hai chiều, nơi ở, điểm tham quan, ăn uống) **chỉ bằng ID ứng viên**, kèm lý do, đầu ra JSON.
5. **Code kiểm tra:** ID tồn tại, tổng tiền từ CSDL + dự phòng 10% ≤ ngân sách, không vi phạm ràng buộc; sai thì LLM làm lại tối đa 2 lần, vẫn sai thì báo "không tìm được" — **không bao giờ hiện lịch trình vi phạm**. LLM không đưa giá, không ra web.

| Lỗi | Ai, bao nhiêu | Hoàn tác? |
|---|---|---|
| **Bỏ sót ràng buộc** ("đau chân" → lịch leo đồi 3 km) | Cả nhóm khách mất một buổi của chuyến 3 ngày, đổi chỗ tại chỗ giá cao hơn | Không — phòng mùa lễ thường mất cọc ~50% |
| **Vượt ngân sách thực tế** (thiếu khoản, giá cũ) | VD: ghi 3,8 triệu, thực tế 4,6 triệu (+20%), hết tiền ngày cuối | Không, khi đã đi |
| **Quá dè dặt** (báo "không tìm được" dù có phương án) | Khách bỏ đi | Có — mất một lượt dùng |

**Cách biết sai:** 100 yêu cầu mẫu viết tay (gồm ca khó: "mẹ em mới mổ gối", ngân sách sát đáy, yêu cầu mâu thuẫn), nhãn ràng buộc do một người khác (không phải người viết) gán. Chỉ số: **recall ràng buộc ≥ 95%** (chính); lịch trình vi phạm nhãn đúng ≤ 3%; mục bịa và vượt ngân sách theo CSDL = 0%; "không tìm được" sai ≤ 10%. Khi chạy thật: tỷ lệ khách sửa ràng buộc ở bước xác nhận.

## 3. Phạm vi

**Trong:** (1) auth 3 vai trò; (2) bên cung cấp đăng lưu trú (phòng, tiện ích, giá, lịch trống), nhà xe (giá, giờ chạy), quán ăn (khoảng giá, món chay); (3) admin: điểm tham quan (giá vé, giờ mở, mức đi bộ), duyệt bên cung cấp — mọi giá có nguồn + ngày; (4) 5 điểm đến (Đà Lạt, Vũng Tàu, Nha Trang, Phan Thiết, Hội An), chỉ xuất phát TP.HCM; (5) tính năng LLM mục 2; (6) khách chỉnh lịch trình (tính lại tiền), lưu, giữ chỗ phòng; (7) 100 mẫu + script đánh giá trong CI.

**Ngoài:** thanh toán, đặt phòng/vé/bàn thật; giữ chỗ vé xe; điểm đến khác, xuất phát khác; LLM tìm giá trên web, cào Agoda/Booking; giá thời gian thực; trả tiền để được ưu tiên gợi ý; chatbot tự do; review, chat, bản đồ; app di động; đa ngôn ngữ.

## 4. Kế hoạch — Nhật (backend, LLM) · Như (frontend) · Quốc (dữ liệu, đánh giá)

| CP | Ngày | Việc — người phụ trách |
|---|---|---|
| 1 | 15/10 | CI lint + test — Nhật; schema CSDL — Như; dữ liệu thật Đà Lạt, Vũng Tàu + 20 mẫu — Quốc; chạy thử prompt trên 20 mẫu — Nhật |
| 2 | 29/10 | API lịch trình v1 (đọc, lọc, LLM, kiểm tra) — Nhật; auth 3 vai trò — Như; script đánh giá trong CI + 50 mẫu — Quốc |
| 3 | 12/11 | UI khách (nhập, xác nhận, xem/chỉnh/lưu) — Như; API chỉnh + tính lại, module nhà xe + quán ăn — Nhật; module lưu trú (phòng, lịch trống) — Quốc |
| 4 | 26/11 | API admin (điểm tham quan, duyệt bên cung cấp) + giữ chỗ phòng — Nhật; UI admin — Như; dữ liệu đủ 5 điểm + 100 mẫu — Quốc |
| 5 | 10/12 | Tinh chỉnh prompt, xử lý lỗi/timeout — Nhật; số liệu, so sánh 2 model — Quốc; UI trạng thái lỗi — Như |
| 6 | 24/12 | Triển khai — Như; demo — Nhật; báo cáo "đổi gì, vì sao" — Quốc |

Mỗi mục "Trong" có ít nhất một dòng; không mục "Ngoài" nào có dòng.

## 5. Rủi ro

1. **Giá không thật hoặc thiếu khoản → "trong ngân sách" vô nghĩa.** *Tuần này:* mỗi người nhận 1–2 điểm đến, lấy giá công khai, ghi nguồn + ngày; liệt kê mọi khoản chi của một chuyến thật trước khi chốt schema; dự phòng 10% hiển thị rõ.
2. **LLM bỏ sót ràng buộc nói vòng, recall < 95%.** *Tuần này:* viết 20 yêu cầu khó nhất, chạy thử ngay; bước khách xác nhận nghĩa là lỗi chỉ gây hại khi cả LLM lẫn khách cùng bỏ sót; nếu vẫn thấp, thêm checkbox bắt buộc ("có ai đi lại khó không?").

## 6. Công nghệ

| Lựa chọn | Lý do |
|---|---|
| React + Vite | Màn chỉnh lịch trình nhiều khối, đổi một mục phải tính lại tiền ngay — hợp state theo component; build tĩnh, host miễn phí. |
| Node.js + Express | Logic là lọc SQL, gọi LLM, kiểm tra tiền — Express đủ nhẹ; chung ngôn ngữ với frontend nên schema Zod dùng chung. |
| PostgreSQL | Dữ liệu quan hệ (bên cung cấp–dịch vụ–lịch trống–điểm đến); lọc ứng viên bằng SQL. |
| Zod | Model miễn phí không chắc hỗ trợ JSON schema, mọi đầu ra đều qua một schema cho API, kiểm tra ID và test. |
| **Model miễn phí trên OpenCode Zen** (API tương thích OpenAI) | **0 USD.** Danh sách miễn phí thay đổi, nên CP1 thử 2–3 model trên 20 mẫu, chọn recall cao nhất; tên model trong biến môi trường. |
| Script đánh giá Node | Biến "cách biết sai" thành test: recall < 95% làm CI đỏ. |
| GitHub Actions; Render free | 0 USD; job đánh giá chỉ chạy khi đổi prompt, tránh vượt giới hạn lượt gọi. |
