# PA#1 — Đề xuất và lập kế hoạch: TripBudget (lên lịch trình du lịch theo ngân sách)

Nhóm: Nguyễn Lê Minh Nhật – `23120068` · Nguyễn Trần Quỳnh Như – `23120069` · Đặng Mai Quốc – `23120078` · Repo: https://github.com/Quynhnhu0203/tripbudget

## 1. Vấn đề và người dùng

**Người dùng:** Minh, sinh viên năm 3 ở TP.HCM, rủ 2 bạn đi chơi 3 ngày 2 đêm dịp nghỉ lễ, **cả nhóm có 4 triệu đồng**, chưa biết đi đâu.

**Vấn đề (một câu):** người có ngân sách cố định không biết đi đâu, ở đâu cho vừa tiền, và thường chỉ phát hiện vượt ngân sách khi đã đi.

**Hiện nay họ làm gì:** đọc review trên Facebook/TikTok, mở Agoda xem phòng, tự cộng tiền phòng + vé tham quan + ăn uống vào ghi chú điện thoại — hay quên tiền xe nội thành và vé vào cổng.

Ba vai trò: **khách** (lên và chỉnh lịch trình), **chủ khách sạn** (đăng phòng, giá, lịch trống — nguồn giá thật), **admin** (nhập điểm tham quan, giá ăn uống, giá xe; duyệt khách sạn).

## 2. Tính năng LLM: lên lịch trình theo ngân sách và yêu cầu

**Luồng:**
1. Khách nhập ngân sách tổng, ngày đi, số ngày, số người và **yêu cầu viết tự do** ("thích biển, bạn em đau chân nên ít đi bộ, một đứa ăn chay").
2. **LLM đọc yêu cầu** → danh sách ràng buộc thuộc **tập đóng** (`it_di_bo`, `an_chay`, `co_tre_nho`, `thich_bien`, `can_thang_may`…). Hệ thống **hiện lại cho khách xác nhận** ("Mình hiểu bạn cần: ít đi bộ, có món chay — đúng không?").
3. **Code lọc ứng viên** từ CSDL: điểm đến có chi phí tối thiểu ≤ ngân sách, khách sạn còn phòng, điểm tham quan mở cửa ngày đó, thoả ràng buộc đã xác nhận.
4. **LLM chọn và sắp xếp** lịch trình theo ngày (khách sạn, điểm tham quan, bữa ăn) **chỉ bằng ID trong danh sách ứng viên**, kèm lý do; đầu ra JSON có schema.
5. **Code kiểm tra:** mọi ID tồn tại; tổng tiền (tính từ CSDL, cộng dự phòng 10%) ≤ ngân sách; không vi phạm ràng buộc. Sai → trả lỗi cho LLM làm lại, tối đa 2 lần; vẫn sai → báo "không tìm được lịch trình phù hợp", **không bao giờ hiển thị lịch trình vi phạm**.

LLM không đưa ra giá, không ra web. Giá hiển thị kèm "cập nhật ngày …".

**Cái giá khi sai:**

| Lỗi | Ai bị ảnh hưởng | Mức độ | Hoàn tác? |
|---|---|---|---|
| **Bỏ sót ràng buộc** (không nhận ra "đau chân" → lịch trình leo đồi, đi bộ phố cổ 3 km) | Khách và người đi cùng | Mất một buổi của chuyến 3 ngày, phải đổi điểm tại chỗ với giá cao hơn | Không — thời gian đã mất; phòng mùa lễ thường không hoàn cọc (~50% tiền phòng) |
| **Vượt ngân sách thực tế** (dữ liệu thiếu khoản, giá cũ) | Cả nhóm khách | VD: lịch trình ghi 3,8 triệu, thực tế 4,6 triệu — vượt 20%, hết tiền ngày cuối | Không, khi đã đi |
| **Quá dè dặt** (báo "không tìm được" dù có phương án) | Khách; nền tảng | Khách bỏ đi dùng cách cũ | Có — chỉ mất lượt dùng |

**Cách biết sai (đo được):** bộ **100 yêu cầu mẫu** (viết tay, gồm ca khó: ràng buộc nói vòng — "mẹ em mới mổ gối"; ngân sách sát mức tối thiểu; yêu cầu mâu thuẫn), mỗi yêu cầu có nhãn ràng buộc đúng do người khác người viết gán.
- **Recall ràng buộc** khi đọc yêu cầu ≥ 95% (chỉ số chính — bỏ sót mới gây hại).
- Lịch trình vi phạm **ràng buộc theo nhãn đúng** (không theo nhãn của LLM) ≤ 3%.
- Mục bịa (ID không tồn tại) = 0% và vượt ngân sách theo giá CSDL = 0% — code đảm bảo, vẫn có test.
- "Không tìm được" khi thực tế có phương án ≤ 10%.
- Khi chạy thật: tỷ lệ khách sửa ràng buộc ở bước xác nhận, tỷ lệ khách đổi/bỏ mục trong lịch trình.

## 3. Phạm vi học kỳ

**Trong phạm vi:**
1. Xác thực + phân quyền 3 vai trò.
2. Chủ khách sạn: đăng khách sạn (tiện ích: thang máy, khoảng cách trung tâm…), loại phòng, giá, lịch trống.
3. Admin: điểm tham quan (giá vé, giờ mở cửa, mức đi bộ, phù hợp trẻ em), giá ăn uống tham khảo, giá xe khách từ TP.HCM; duyệt khách sạn. Mọi giá có **nguồn + ngày cập nhật**.
4. **5 điểm đến** (Đà Lạt, Vũng Tàu, Nha Trang, Phan Thiết, Hội An), xuất phát **chỉ từ TP.HCM**.
5. **Tính năng LLM** (mục 2): đọc yêu cầu → xác nhận → lịch trình → kiểm tra.
6. Khách chỉnh lịch trình (đổi khách sạn, bỏ/thêm điểm → tính lại tiền), lưu, **giữ chỗ** khách sạn.
7. **Bộ 100 yêu cầu mẫu + script đánh giá chạy trong CI.**

**Cố ý để ngoài:** thanh toán thật; đặt vé xe/máy bay/vé tham quan thật (chỉ giá tham khảo); điểm đến ngoài 5 nơi, xuất phát ngoài TP.HCM; **LLM tìm giá trên web** và cào dữ liệu Agoda/Booking; giá thời gian thực; **khách sạn trả tiền để được ưu tiên trong gợi ý**; chatbot hỏi đáp tự do; review, chat với chủ khách sạn, bản đồ chỉ đường; app di động; đa ngôn ngữ.

## 4. Kế hoạch và phân công

**Nhật** = Nguyễn Lê Minh Nhật (backend, LLM) · **Như** = Nguyễn Trần Quỳnh Như (frontend) · **Quốc** = Đặng Mai Quốc (dữ liệu, đánh giá)

| CP | Ngày | Việc | Phụ trách |
|---|---|---|---|
| CP1 | 15/10 | CI chạy lint + test; schema CSDL; dữ liệu thật cho Đà Lạt, Vũng Tàu; 20 yêu cầu mẫu có nhãn; **chạy thử prompt trên 20 mẫu** | Nhật: CI, prompt thử · Như: schema · Quốc: dữ liệu, 20 mẫu |
| CP2 | 29/10 | Auth 3 vai trò; **API lịch trình v1** (đọc yêu cầu, lọc, LLM, kiểm tra); **script đánh giá trong CI**; 50 mẫu | Nhật: API LLM + kiểm tra · Như: auth · Quốc: script đánh giá, 50 mẫu |
| CP3 | 12/11 | UI khách: nhập yêu cầu, xác nhận ràng buộc, xem/chỉnh/lưu lịch trình; module chủ khách sạn | Như: UI khách · Nhật: API chỉnh + tính lại · Quốc: module chủ khách sạn |
| CP4 | 26/11 | Module admin; giữ chỗ khách sạn; dữ liệu đủ 5 điểm đến; đủ 100 mẫu | Quốc: admin, dữ liệu · Nhật: giữ chỗ · Như: UI admin |
| CP5 | 10/12 | Tinh chỉnh prompt theo số liệu; xử lý LLM lỗi/timeout; so sánh 2 model; báo cáo số liệu đánh giá | Nhật: prompt, xử lý lỗi · Quốc: số liệu, so sánh · Như: UI trạng thái lỗi |
| CP6 | 24/12 | Triển khai, demo, báo cáo cuối: đổi gì so với kế hoạch và vì sao | Như: triển khai · Nhật: demo · Quốc: báo cáo |

Phạm vi khớp kế hoạch: mục 1 → CP2; 2 → CP3; 3, 4 → CP1/CP4; 5 → CP1–CP2, CP5; 6 → CP3–CP4; 7 → CP1–CP5. Không mục "để ngoài" nào có dòng trong bảng.

## 5. Rủi ro

1. **Dữ liệu giá không thật hoặc thiếu khoản → "trong ngân sách" vô nghĩa.** *Bắt đầu tuần này:* mỗi người phụ trách điểm đến của mình, lấy giá công khai (trang khách sạn, bảng giá vé, nhà xe), ghi nguồn + ngày; liệt kê đủ các khoản chi của một chuyến thật (xe nội thành, gửi xe, vé cổng) trước khi thiết kế schema; giữ dự phòng 10% hiển thị rõ.
2. **LLM bỏ sót ràng buộc nói vòng vượt mục tiêu 95%, prompt không sửa nổi.** *Bắt đầu tuần này:* viết 20 yêu cầu khó nhất trước và chạy thử ngay ở CP1 để biết mức khó; ràng buộc là tập đóng + bước khách xác nhận, nên một lỗi chỉ gây hại khi cả LLM lẫn khách cùng bỏ sót; nếu vẫn thấp, thêm câu hỏi bắt buộc dạng checkbox ("có ai đi lại khó không?").

## 6. Lựa chọn công nghệ

| Hạng mục | Lựa chọn | Lý do gắn với dự án |
|---|---|---|
| Frontend | React + Vite | Màn hình chỉnh lịch trình là nhiều khối ngày/mục, đổi một khách sạn hay bỏ một điểm phải tính lại tổng tiền ngay và hiện trạng thái chờ LLM (vài giây) — hợp với state theo component; Vite build ra file tĩnh, host miễn phí. |
| Backend | Node.js + Express | Logic chính là lọc ứng viên bằng SQL, gọi LLM rồi kiểm tra tổng tiền — Express đủ nhẹ; cùng ngôn ngữ với frontend nên schema Zod của lịch trình chỉ định nghĩa một lần, dùng cho cả API, form và script đánh giá. |
| CSDL | PostgreSQL | Dữ liệu quan hệ (khách sạn–phòng–lịch trống–điểm đến); lọc ứng viên bằng SQL. |
| Kiểm tra đầu ra LLM | Zod | Một schema dùng chung cho structured output, kiểm tra ID và test. |
| Model LLM | **Anthropic Claude Sonnet 5.5** (`claude-sonnet-5-5`), structured output | Phải cân ràng buộc và lịch theo ngày, cần model đủ mạnh. Giá $2 / $10 mỗi 1 triệu token vào/ra; một lịch trình ≈ 6.000 token vào + 1.500 ra ≈ **0,03 USD**, tối đa 3 lượt ≈ 0,08 USD; một lượt chạy 100 mẫu ≈ 3 USD. CP5 so với Claude Haiku 4.5 ($1 / $5, rẻ hơn ~2 lần) — giữ model rẻ hơn nếu recall vẫn ≥ 95%. |
| Đánh giá | Script Node chạy 100 mẫu, xuất các chỉ số mục 2 | Biến "cách biết sai" thành test fail được; recall < 95% làm CI đỏ. |
| CI & triển khai | GitHub Actions; Render gói miễn phí | Chi phí 0; job đánh giá gọi API chỉ chạy khi đổi prompt/logic LLM để giới hạn chi phí. |
