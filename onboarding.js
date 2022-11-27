let button = document.querySelector("button");
button.addEventListener("click", function () {
  chrome.permissions.request({
    origins: ["<all_urls>"],
  });
});
