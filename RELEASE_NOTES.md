# iMessenger 1.3.0

Bản này đồng bộ mã nguồn fMess 0.1.35 của tác giả gốc (từ 0.1.33 ở bản 1.2.0), gồm tính năng chọn font chữ cho Messenger và loạt sửa lỗi tự phục hồi sau khi máy ngủ dậy.

## Có gì mới

- **Chọn font chữ cho Messenger.** Vào **Cài đặt › Giao diện › Font** để chọn bất kỳ font nào có trên máy; nút **Thêm…** nhận file .ttf/.otf và dùng ngay mà không cần cài font vào hệ thống. Font mới áp dụng ngay lập tức.
- **Tự phục hồi sau khi máy ngủ dậy.** Sau khi máy ngủ từ 5 phút trở lên, tin nhắn không còn kẹt ở trạng thái "Đang gửi": app tự tải lại trang khi bạn gõ xong. Mất mạng rồi có mạng lại mà kết nối Facebook vẫn đứt thì app cũng tự tải lại, khỏi phải tải lại bằng tay.
- **Tự tải lại khi gặp lỗi "Couldn't load chats".** App tự thử tải lại một lần như khi bấm Reload bằng tay.
- **Windows: thông báo kêu chuông.** Thông báo mới kêu bằng âm thanh của Windows, mỗi tin nhắn kêu một lần; vẫn im lặng khi bật Không làm phiền hoặc đã tắt âm thanh của Messenger.
- **Sửa lỗi hiển thị:** hết nhấp nháy khi cuộn nhanh trong đoạn chat nền gradient trên macOS; khung sửa tin nhắn không còn bị bóp hẹp; thông báo Windows hiện đúng tên app trong Cài đặt; chữ toast đọc được ở dark mode với các giao diện Zalo, WhatsApp, Teams.
- **Theme:** giao diện Messenger gốc hoặc kiểu Zalo, WhatsApp, Teams, đủ cả sáng lẫn tối; tự thêm theme của bạn từ một file CSS (xem mục "Make a theme" trong README).

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
