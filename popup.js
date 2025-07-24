document.addEventListener('DOMContentLoaded', function() {
  const shortcutInput = document.getElementById('shortcut');
  const scriptInput = document.getElementById('script');
  const saveButton = document.getElementById('saveButton');
  const shortcutList = document.getElementById('shortcutList');
  const fileInput = document.getElementById('fileInput');
  const loadFileButton = document.getElementById('loadFileButton');

  // Thêm mẫu script khi trang được tải
  if (scriptInput.value === '') {
    scriptInput.value = `
console.log("Hello World!");`;
  }

  // Load saved shortcuts
  loadShortcuts();

  // Tự động gán 4 file script cho các phím 6, 7, 8, 9
  loadDefaultScripts();

  // Xử lý tải file
  loadFileButton.addEventListener('click', function() {
    if (!fileInput.files || fileInput.files.length === 0) return;

    const file = fileInput.files[0];
    
    // Kiểm tra kích thước file (giới hạn 5MB)
    if (file.size > 5 * 1024 * 1024) return;

    const reader = new FileReader();
    reader.onload = function(e) {
      scriptInput.value = e.target.result;
    };
    reader.readAsText(file);
  });

  // Save shortcut
  saveButton.addEventListener('click', function() {
    const shortcut = shortcutInput.value.trim();
    const script = scriptInput.value.trim();

    if (!shortcut || !script) return;

    // Save to local storage (hỗ trợ dữ liệu lớn tới 5MB)
    chrome.storage.local.get('shortcuts', function(data) {
      const shortcuts = data.shortcuts || {};
      
      shortcuts[shortcut] = script;
      
      chrome.storage.local.set({shortcuts: shortcuts}, function() {
        // Clear inputs
        shortcutInput.value = '';
        scriptInput.value = '';
        fileInput.value = ''; // Reset file input
        
        // Reload shortcuts list
        loadShortcuts();
        
        // Notify background script about updated shortcuts
        chrome.runtime.sendMessage({action: 'updateShortcuts'});
      });
    });
  });

  // Load shortcuts from storage
  function loadShortcuts() {
    chrome.storage.local.get('shortcuts', function(data) {
      const shortcuts = data.shortcuts || {};
      
      shortcutList.innerHTML = '';
      
      if (Object.keys(shortcuts).length === 0) {
        shortcutList.innerHTML = '<p>Chưa có phím tắt nào được lưu.</p>';
        return;
      }
      
      for (const shortcut in shortcuts) {
        const shortcutItem = document.createElement('div');
        shortcutItem.className = 'shortcut-item';
        
        const shortcutKey = document.createElement('div');
        shortcutKey.className = 'shortcut-key';
        shortcutKey.textContent = shortcut;
        
        const actions = document.createElement('div');
        actions.className = 'actions';
        
        const editButton = document.createElement('button');
        editButton.className = 'btn-small';
        editButton.textContent = 'Sửa';
        editButton.addEventListener('click', function() {
          shortcutInput.value = shortcut;
          scriptInput.value = shortcuts[shortcut];
        });
        
        const deleteButton = document.createElement('button');
        deleteButton.className = 'btn-small btn-delete';
        deleteButton.textContent = 'Xóa';
        deleteButton.addEventListener('click', function() {
          delete shortcuts[shortcut];
          chrome.storage.local.set({shortcuts: shortcuts}, function() {
            loadShortcuts();
            chrome.runtime.sendMessage({action: 'updateShortcuts'});
          });
        });
        
        actions.appendChild(editButton);
        actions.appendChild(deleteButton);
        
        shortcutItem.appendChild(shortcutKey);
        shortcutItem.appendChild(actions);
        
        shortcutList.appendChild(shortcutItem);
      }
    });
  }

  // Hàm tự động gán 4 file script cho các phím 6, 7, 8, 9
  function loadDefaultScripts() {
    const scriptFiles = [
      { key: '6', file: 'auto-login.js' },
      { key: '7', file: 'auto-theme-embedded.js' },
      { key: '8', file: 'auto-partner-catagory-search.js' },
      { key: '9', file: 'auto-import-video.js' },
    ];

    // Lấy shortcuts hiện tại
    chrome.storage.local.get('shortcuts', function(data) {
      const shortcuts = data.shortcuts || {};
      let updatedCount = 0;

      // Lặp qua từng file script
      scriptFiles.forEach(scriptFile => {
        // Tạo URL cho file script
        const scriptURL = chrome.runtime.getURL(scriptFile.file);
        
        // Fetch nội dung file
        fetch(scriptURL)
          .then(response => {
            if (!response.ok) {
              throw new Error(`Không thể tải file ${scriptFile.file}`);
            }
            return response.text();
          })
          .then(scriptContent => {
            // Lưu script vào shortcuts
            shortcuts[scriptFile.key] = scriptContent;
            updatedCount++;
            
            // Nếu đã xử lý tất cả các file, cập nhật storage
            if (updatedCount === scriptFiles.length) {
              chrome.storage.local.set({shortcuts: shortcuts}, function() {
                console.log('Đã gán 4 file script cho các phím 6, 7, 8, 9');
                loadShortcuts();
                chrome.runtime.sendMessage({action: 'updateShortcuts'});
              });
            }
          })
          .catch(error => {
            console.error(`Lỗi khi tải file ${scriptFile.file}:`, error);
          });
      });
    });
  }
}); 