let clickedEl = null;

// Save element that has last been right-clicked on to insert mail into
document.addEventListener("mousedown", (event) => {
    if(event.button == 2) { 
        clickedEl = event.target;
    }
}, true);

chrome.runtime.onMessage.addListener((request) => {
    if(request.action == "insert_mail") {
      clickedEl.value = request.data;
    }
});