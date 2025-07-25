// Thay thế ID này bằng ID thực tế của extension của bạn
const extensionId = "mabbikcpdgbenoafghildichnikiophj"; 

chrome.runtime.sendMessage({ command: "switchToNextTab" }, (response) => {
    console.log(response.result);
});
console.log("test");
//cc