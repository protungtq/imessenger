# iMessenger 1.2.0

Bản này bổ sung cơ chế **tự cập nhật ngay trong app** cho iMessenger, dùng cặp khóa ký riêng của iMessenger. Nội dung và các sửa lỗi giữ nguyên như bản 1.1.0.

## Có gì mới

- **App tự thông báo khi có bản mới, cho tải về và tự cài ngay trong app.** Từ bản sau 1.2.0 trở đi, khi có phiên bản mới, iMessenger sẽ hiện thông báo; bạn chỉ cần bấm đồng ý là app tự tải gói cập nhật, kiểm chứng chữ ký điện tử bằng khóa công khai tích hợp sẵn, rồi tự cài đặt — không còn phải lên trang Releases tải file exe về như trước.
- **Riêng bản 1.2.0 vẫn cần cài tay một lần**: đây là bản đầu tiên chứa khóa công khai của iMessenger, các bản cũ (1.0.0, 1.1.0) mang khóa của tác giả gốc nên không thể tự kiểm chứng gói cập nhật ký bằng khóa mới.
- Bao gồm toàn bộ sửa lỗi của bản 1.1.0, nổi bật là: hết thông báo cho các đoạn chat đã tắt thông báo, mỗi tin nhắn chỉ báo một lần, hết đơ khi gọi điện trên Windows, phóng to ảnh trong chat cá nhân đã chuẩn, lưu ảnh ngay trong app.

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
