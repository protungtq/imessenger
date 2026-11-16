# iMessenger 1.3.2

Bản này đồng bộ mã nguồn fMess 0.1.37 của tác giả gốc (từ 0.1.36 ở bản 1.3.1), gồm chế độ che thông tin nhạy cảm để chụp màn hình và chia sẻ màn hình, cùng loạt sửa lỗi chat mã hoá kẹt vòng xoay sau khi máy ngủ và đăng nhập bước hai bằng passkey.

## Có gì mới

- **Cài đặt › Quyền riêng tư › Che thông tin nhạy cảm.** Tên người chat, nội dung tin nhắn, xem trước liên kết, ảnh và hình đại diện đều hoá thành khối đặc, tiện chụp màn hình hoặc chia sẻ màn hình mà không lộ nội dung. Mọi ngôn ngữ đều được che; tắt đi thì khung chat trở lại như cũ.
- **macOS: chat mã hoá không còn kẹt vòng xoay sau một đêm máy ngủ.** Máy Mac đóng nắp vẫn thức dậy chốc lát trong đêm (dark wake); app tải lại đúng lúc đó, lần tải lại bị giấc ngủ cắt ngang và chat mã hoá kẹt ở vạch xám cùng vòng xoay cho tới khi thoát hẳn app. Giờ app chờ máy thức ổn định 20 giây mới tải lại, và không bao giờ tải lại trong 30 giây đầu của trang.
- **Chat mã hoá có kẹt thì app tự cứu lấy.** Khi mọi chat mã hoá trong danh sách đều trống, khi chat đang mở xoay tròn một phút không có tin nhắn, hoặc khi Messenger báo bộ phận chạy chat mã hoá bị treo, app sẽ tự tải lại; kẹt lại ngay sau đó thì app tự khởi động lại như khi thoát ra mở lại (tối đa mỗi 30 phút một lần).
- **Đăng nhập bước hai bằng passkey không còn trông như bị kẹt.** Passkey chỉ dùng được trong trình duyệt web, nên trong app mọi yêu cầu passkey đều bị từ chối; trước đây màn hình đăng nhập cứ đứng yên khó hiểu. Giờ app nói rõ lý do và chỉ sang "Thử cách khác": nhập mã từ ứng dụng xác thực hoặc tin nhắn SMS.

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
