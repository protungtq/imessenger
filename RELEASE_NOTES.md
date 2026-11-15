# iMessenger 1.3.1

Bản này đồng bộ mã nguồn fMess 0.1.36 của tác giả gốc (từ 0.1.35 ở bản 1.3.0), gồm menu chuột phải cho chat và tin nhắn, trả lời nhanh bằng double-click, phím F11 toàn màn hình, cùng loạt sửa lỗi ô tìm kiếm, giao diện Zalo, vòng xoay trên Windows và giấc ngủ của macOS.

## Có gì mới

- **Chuột phải vào một cuộc chat trong danh sách để mở menu của nó** (đánh dấu chưa đọc, tắt thông báo, ghim, xoá…) như app chat trên máy tính. Chuột phải lần nữa thì ra menu thường.
- **Chuột phải vào tin nhắn để thả cảm xúc.** Bôi đen chữ trước rồi chuột phải thì vẫn có menu thường với Copy; chuột phải vào ảnh vẫn có Copy Image.
- **Double-click vào chỗ trống cạnh tin nhắn để trả lời tin đó.** Double-click vào chữ thì vẫn chọn chữ như cũ.
- **Windows và Linux: F11 để bật/tắt toàn màn hình.**
- **Ô tìm kiếm gõ được trở lại, bôi đen được chữ trong tin nhắn** sau khi app tự tải lại lúc đang mở chat (sau khi máy ngủ, mất mạng hoặc bấm Ctrl+R). Trước đây chữ gõ vào cứ chui vào ô soạn tin, phải thoát hẳn app mới hết.
- **Zalo: ô soạn tin giữ nguyên bề ngang sau khi trả lời tin nhắn**, không còn co lại bằng cụm nút. Phần trích dẫn nằm phía trên tin trả lời, có vạch xanh, và mở chat nhanh hơn.
- **Windows: chat không còn kẹt vòng xoay sau khi tải lại.**
- **macOS: máy tự ngủ được khi đang mở app.** Trình phát âm thanh của Messenger giữ máy thức; giờ nó nghỉ giữa các lần phát, tin nhắn tới vẫn kêu.

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
