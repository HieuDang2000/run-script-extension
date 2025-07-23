// Lưu trữ các phím tắt đã đăng ký
let registeredShortcuts = {};

// Khởi tạo khi extension được load
chrome.runtime.onInstalled.addListener(() => {
  console.log('Extension đã được cài đặt/cập nhật');
  loadShortcuts();
});

// Khi Chrome khởi động, tải lại phím tắt
chrome.runtime.onStartup.addListener(() => {
  console.log('Chrome đã khởi động, tải lại phím tắt');
  loadShortcuts();
});

// Lắng nghe thông báo từ popup hoặc content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Nhận message:', message, 'từ:', sender);
  
  if (message.action === 'updateShortcuts') {
    loadShortcuts();
    sendResponse({ status: 'Đã cập nhật phím tắt' });
  } else if (message.action === 'checkShortcut') {
    const shortcut = message.shortcut;
    console.log('Kiểm tra phím tắt:', shortcut);
    console.log('Danh sách phím tắt hiện tại:', registeredShortcuts);
    
    if (registeredShortcuts[shortcut]) {
      console.log('Tìm thấy phím tắt, thực thi script:', registeredShortcuts[shortcut]);
      executeScript(registeredShortcuts[shortcut], sender.tab.id);
      sendResponse({ status: 'Đã thực thi script' });
    } else {
      console.log('Không tìm thấy phím tắt');
      sendResponse({ status: 'Không tìm thấy phím tắt' });
    }
  } else if (message.action === 'contentScriptLoaded') {
    console.log('Content script đã được load trong tab:', sender.tab?.id);
    sendResponse({ status: 'Đã ghi nhận' });
  } else if (message.action === 'getShortcuts') {
    sendResponse({ shortcuts: registeredShortcuts });
  } else if (message.action === 'executeScriptInPage') {
    // Thực thi script bằng chrome.scripting.executeScript
    const tabId = sender.tab.id;
    const script = message.script;
    
    console.log('Thực thi script trong tab:', tabId);
    console.log('Script cần thực thi:', script);
    
    // Tạo một function để thực thi script
    const executeInPage = function(scriptToExecute) {
      try {
        // Đầu tiên inject các hàm tiện ích
        const helperFunctions = `
          // Hàm log với định dạng đặc biệt
          function runScriptLog(message) {
            console.log('%c[Run Script Extension]%c ' + message, 
              'background: #4285f4; color: white; padding: 2px 4px; border-radius: 2px;', 
              'color: #4285f4;');
          }

          // Hàm thông báo
          function runScriptAlert(message) {
            alert('[Run Script Extension] ' + message);
          }

          // Hàm lấy phần tử DOM
          function runScriptGetElement(selector) {
            return document.querySelector(selector);
          }

          // Hàm lấy tất cả phần tử DOM
          function runScriptGetElements(selector) {
            return document.querySelectorAll(selector);
          }

          // Hàm click vào phần tử
          function runScriptClick(selector) {
            const element = document.querySelector(selector);
            if (element) {
              element.click();
              return true;
            }
            return false;
          }

          // Hàm điền giá trị vào input
          function runScriptFill(selector, value) {
            const element = document.querySelector(selector);
            if (element) {
              element.value = value;
              // Kích hoạt sự kiện input để các thư viện JS khác biết giá trị đã thay đổi
              const event = new Event('input', { bubbles: true });
              element.dispatchEvent(event);
              return true;
            }
            return false;
          }

          // Hàm lấy text của phần tử
          function runScriptGetText(selector) {
            const element = document.querySelector(selector);
            return element ? element.textContent : null;
          }
        `;
        
        // Thực thi các hàm tiện ích
        eval(helperFunctions);
        
        // Sau đó thực thi script của người dùng
        console.log('Đang thực thi script:', scriptToExecute);
        const result = eval(scriptToExecute);
        console.log('Kết quả thực thi script:', result);
        
        return { success: true, result: result };
      } catch (error) {
        console.error('Lỗi khi thực thi script:', error);
        return { success: false, error: error.message };
      }
    };
    
    // Thực thi script trong tab
    chrome.scripting.executeScript({
      target: { tabId: tabId },
      func: executeInPage,
      args: [script],
      world: "MAIN" // Thực thi trong world chính của trang
    }).then((results) => {
      console.log('Script đã được thực thi:', results);
      sendResponse({ success: true, results: results[0].result });
    }).catch((error) => {
      console.error('Lỗi khi thực thi script:', error);
      sendResponse({ success: false, error: error.message });
    });
    
    // Trả về true để giữ kênh giao tiếp mở cho sendResponse bất đồng bộ
    return true;
  }
  
  // Quan trọng: trả về true để giữ kênh giao tiếp mở cho sendResponse bất đồng bộ
  return true;
});

// Tải các phím tắt từ storage
function loadShortcuts() {
  chrome.storage.local.get('shortcuts', (data) => {
    registeredShortcuts = data.shortcuts || {};
    console.log('Đã tải phím tắt:', registeredShortcuts);
    
    // Đảm bảo content script được inject vào tất cả các tab
    updateContentScriptInTabs();
  });
}

// Inject content script vào tất cả các tab
function updateContentScriptInTabs() {
  chrome.tabs.query({}, (tabs) => {
    console.log('Số lượng tab hiện tại:', tabs.length);
    
    for (const tab of tabs) {
      if (tab.url && (tab.url.startsWith('http') || tab.url.startsWith('https'))) {
        console.log('Inject content script vào tab:', tab.id, tab.url);
        
        try {
          chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ['content.js']
          }).then(() => {
            console.log('Đã inject content script vào tab:', tab.id);
          }).catch(error => {
            console.error('Lỗi khi inject content script vào tab:', tab.id, error);
          });
        } catch (error) {
          console.error('Không thể inject content script vào tab:', tab.url, error);
        }
      }
    }
  });
}

// Thực thi script trên tab được chỉ định
function executeScript(script, tabId) {
  console.log('Thực thi script trên tab:', tabId);
  console.log('Script cần thực thi:', script);
  
  // Gửi script đến content script để thực thi
  chrome.tabs.sendMessage(tabId, {
    action: 'executeScript',
    script: script
  }, (response) => {
    if (response) {
      console.log('Kết quả thực thi script:', response);
    } else {
      console.error('Không nhận được phản hồi từ content script');
    }
  });
}

// Lắng nghe sự kiện khi tab được tạo để inject content script
chrome.tabs.onCreated.addListener((tab) => {
  console.log('Tab mới được tạo:', tab.id);
});

// Lắng nghe sự kiện khi tab được cập nhật để inject content script
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url && (tab.url.startsWith('http') || tab.url.startsWith('https'))) {
    console.log('Tab đã load xong, inject content script:', tabId, tab.url);
    
    chrome.scripting.executeScript({
      target: { tabId: tabId },
      files: ['content.js']
    }).then(() => {
      console.log('Đã inject content script vào tab:', tabId);
    }).catch(error => {
      console.error('Lỗi khi inject content script vào tab:', tabId, error);
    });
  }
});

console.log('Background script đã được khởi chạy'); 