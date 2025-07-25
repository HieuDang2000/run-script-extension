const step1 = document.querySelector("#activate-wp-script-core");
const step2 = document.querySelector("#toplevel_page_wpscore-dashboard > a > div.wp-menu-name");
const step3_1 = document.querySelector("#dashboard > div.tab-content > div > div > div.v-cloak--hidden > div > div > div > div > div > div.row > div > div > input")
const step3_2 = document.querySelector("#dashboard > div.tab-content > div > div > div.v-cloak--hidden > div > div > div > div > div > div.row > div > div > span.input-group-btn > button")
const step4 = document.querySelector("#toplevel_page_wpscore-dashboard > ul > li:nth-child(4) > a");
const fullurl = window.location.href;

if (step1) {
    simulateClick(step1);
    console.log("step1");
}
else {
    if (step2 && fullurl.includes("wp-admin/plugins.php?plugin_status")) {
        simulateClick(step2);
        console.log("step2");
    }
    else {
        if (step3_1 && step3_2 && step3_1.value === "") {
            // Gõ license key như người dùng thật
            simulateTyping(step3_1, "wpscript_303f7c5dc013fd0e598e27821f83f7cb").then(() => {
                // Đợi một chút sau khi gõ xong
                setTimeout(() => {
                    step3_2.disabled = false;
                    simulateClick(step3_2);
                    console.log("step3");
                }, 500);
            });
        }
        else {
            if (step4) {
                simulateClick(step4);
                console.log("step4");
            }
        }
    }
}


// Mô phỏng click như người dùng thật
function simulateClick(element) {
    element.dispatchEvent(new MouseEvent('mousedown', {bubbles: true}));
    element.dispatchEvent(new MouseEvent('mouseup', {bubbles: true}));
    element.dispatchEvent(new MouseEvent('click', {bubbles: true}));
}

// Mô phỏng gõ phím đơn giản hơn
function simulateTyping(element, text) {
    // Focus vào input
    element.dispatchEvent(new Event('focus', {bubbles: true}));
    
    // Đặt giá trị và kích hoạt sự kiện input
    element.value = text;
    element.dispatchEvent(new Event('input', {bubbles: true}));
    
    // Kích hoạt sự kiện change
    element.dispatchEvent(new Event('change', {bubbles: true}));
    
    // Trả về promise đã giải quyết sau một khoảng thời gian ngắn
    return Promise.resolve(setTimeout(() => {}, 100));
}
