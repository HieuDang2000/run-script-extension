// Kiểm tra xem content script đã được load chưa
if (window.runScriptExtensionLoaded) {
  console.log('Content script đã được load trước đó, bỏ qua');
} else {
  window.runScriptExtensionLoaded = true;
  
  console.log('Content script đã được khởi chạy');
  
  // Lấy danh sách phím tắt từ background
  chrome.runtime.sendMessage({ action: 'getShortcuts' }, (response) => {
    console.log('Phím tắt hiện tại:', response?.shortcuts);
  });

  // Lắng nghe sự kiện phím
  document.addEventListener('keydown', (event) => {
    // Tạo chuỗi phím tắt từ sự kiện
    const shortcutString = createShortcutString(event);
    
    // Chỉ log khi có phím không phải modifier
    if (![16, 17, 18, 91].includes(event.keyCode)) {
      console.log('Phím được nhấn:', shortcutString);
    }
    
    // Gửi phím tắt đến background script để kiểm tra
    chrome.runtime.sendMessage({
      action: 'checkShortcut',
      shortcut: shortcutString
    }, (response) => {
      if (response) {
        console.log('Phản hồi từ background:', response);
      }
    });
  });

  // Tạo chuỗi phím tắt từ sự kiện keydown
  function createShortcutString(event) {
    const keys = [];
    
    if (event.ctrlKey) keys.push('Ctrl');
    if (event.shiftKey) keys.push('Shift');
    if (event.altKey) keys.push('Alt');
    if (event.metaKey) keys.push('Meta');
    
    // Thêm phím chính nếu không phải phím modifier
    if (![16, 17, 18, 91].includes(event.keyCode)) {
      const key = event.key.toUpperCase();
      keys.push(key);
    }
    
    return keys.join('+');
  }

  // Thông báo cho background script rằng content script đã được load
  chrome.runtime.sendMessage({ action: 'contentScriptLoaded' }, (response) => {
    console.log('Content script đã được load:', response);
  });
  
  // Lắng nghe yêu cầu thực thi script từ background script
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('Content script nhận message:', message);
    
    if (message.action === 'executeScript') {
      // Gửi yêu cầu tới background script để thực thi script bằng chrome.scripting.executeScript
      chrome.runtime.sendMessage({
        action: 'executeScriptInPage',
        script: message.script,
        tabId: chrome.runtime.id // Sử dụng ID của extension thay vì tabId
      }, (response) => {
        console.log('Script đã được thực thi với kết quả:', response);
        sendResponse(response);
      });
      
      // Trả về true để giữ kênh giao tiếp mở cho sendResponse bất đồng bộ
      return true;
    }
  });
} 