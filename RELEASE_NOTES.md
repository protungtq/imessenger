# iMessenger 1.1.0

Bản cập nhật nền: đồng bộ toàn bộ mã nguồn mới nhất từ fMess gốc (bản 0.1.33), giữ nguyên tên gọi, icon và mã định danh iMessenger.

## Có gì mới

- **Hết thông báo cho các đoạn chat đã tắt thông báo** — số badge trên biểu tượng app và chấm đỏ trên thanh taskbar không còn tính các đoạn chat đã tắt thông báo, và nhóm đã tắt thông báo không còn bị báo nhầm.
- **Mỗi tin nhắn chỉ thông báo một lần** — hết cảnh một tin nhắn báo hai lần liền, hoặc vài giờ sau (khi máy vừa thức dậy) lại báo lại.
- **Hết đơ khi gọi điện trên Windows** — trước đây sau khi đã mở rồi tắt một cuộc gọi, lần gọi tiếp theo khi mở lại app sẽ làm app "Not Responding".
- **Phóng to ảnh trong chat cá nhân đã chuẩn** — chụm hai ngón, Ctrl + lăn chuột hoặc nhấp đúp giờ phóng đúng tấm ảnh (trước đây phóng lớp nền mờ phía sau) vì chat cá nhân là chat mã hoá; trên Windows zoom bằng touchpad cũng mượt mà hơn.
- **Lưu ảnh ngay trong app** — bấm Tải xuống không còn bật trình duyệt ra ngoài nữa, và ảnh trong chat mã hoá không còn bị lưu thành tên "Unknown".
- **Tải xong có thông báo** ở cuối cửa sổ, kèm nút mở thư mục chứa file.
- **Trích dẫn tin nhắn đọc rõ** trong các theme Zalo, WhatsApp và Teams (trước đây chữ trắng trên bong bóng sáng màu, không đọc được).
- **Các nút trong ô soạn tin của theme WhatsApp và Teams có lại biểu tượng đúng** — Messenger đổi bộ biểu tượng nên nút ghi âm, đính kèm, sticker, GIF trước đây hiện toàn dấu +.
- **Theme gradient hiển thị đúng màu tin nhắn của bạn**; trên macOS hết nháy tím khi cuộn nhanh trong các đoạn chat dùng theme gradient.
- **Nút "Kiểm tra ngay"** trong Cài đặt › Chung để tìm bản mới, khỏi phải lục menu.
- **Tuỳ chọn Kiểm tra chính tả** trong Cài đặt › Chung (mặc định vẫn bật) — nếu gõ tiếng Việt đúng mà vẫn bị gạch đỏ trên Windows dùng tiếng Anh, chỉ cần tắt tuỳ chọn này.
- **Tự đổi biểu tượng và tên app** trong Cài đặt › Giao diện: chọn ảnh .png hoặc .ico làm biểu tượng trên Dock, thanh taskbar và khay hệ thống.
- **Esc huỷ voice clip** đang ghi hoặc đang nghe lại; theme Teams có thêm nút ghi âm, sticker và GIF trong ô soạn tin, biểu tượng kiểu Teams.
- **An toàn hơn:** chỉ link web, email và số điện thoại mới được mở ra ngoài app; các link dạng file:, smb: bị chặn.
- Trên macOS: app không còn hiện trong mục Đang phát (Now Playing) mỗi khi có tiếng tin nhắn; trong trình xem ảnh, Esc và phím mũi tên dùng được ngay không cần click trước; máy Mac màn hình 120Hz cuộn mượt gấp đôi.

## Nguồn gốc & tác giả

iMessenger là bản đổi tên (rebrand) cá nhân từ **fMess** — phần mềm mã nguồn mở của tác giả **Toan Ho**: https://github.com/toanbku/fmess

Toàn bộ mã nguồn và công lao thuộc về tác giả gốc, phát hành theo giấy phép **MIT**. Bản này chỉ thay đổi: tên ứng dụng, icon, mã định danh, và trỏ cơ chế cập nhật về repo này (protungtq/imessenger) thay vì repo gốc. Xin cảm ơn tác giả Toan Ho đã mở mã nguồn.

## Tải về

- **Windows:** `iMessenger-windows-setup.exe` (bản cài đặt) hoặc `iMessenger-windows-portable.exe` (chạy luôn, không cần cài)
- **macOS:** `iMessenger-mac-apple-silicon.dmg` (chip Apple M) hoặc `iMessenger-mac-intel.dmg`
- **Linux:** `iMessenger-linux.AppImage` (chạy luôn), `.deb` (Ubuntu/Debian) hoặc `.rpm` (Fedora)

## Lưu ý

- Bản dựng chưa có chữ ký số cho Windows: nếu Windows hiện cảnh báo SmartScreen, bấm **More info → Run anyway**.
- Đăng nhập bằng tài khoản Facebook ngay trong ứng dụng (mở trang facebook.com/messages chính thức); ứng dụng không thu thập mật khẩu hay dữ liệu của bạn.
- iMessenger/fMess không liên kết với Meta Platforms, Inc. Messenger và Facebook là nhãn hiệu của Meta.
