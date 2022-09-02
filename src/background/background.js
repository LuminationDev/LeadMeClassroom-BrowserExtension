//Send the user to the onboarding page when first installing the extension
chrome.runtime.onInstalled.addListener((reason) => {
    if (reason === chrome.runtime.OnInstalledReason.INSTALL) {
        chrome.tabs.create({
            url: 'onboarding.html'
        });
    }
});

//Listen for when a tab becomes inactive
chrome.tabs.onActivated.addListener((activeInfo) => {
    chrome.storage.sync.get("follower", async (data) => {
        if(data == null) {
            return;
        }    

        if(data.follower == null) {
            return;
        }

        chrome.tabs.query({currentWindow: true}, function(tabs) {
            //Send to all but the active
            tabs.forEach(tab => {
                if(tab.id != activeInfo.tabId) {
                    chrome.tabs.sendMessage(tab.id, {message: "inactive"}, function(response) {});
                } else {
                    chrome.tabs.sendMessage(tab.id, {message: "active"}, function(response) {});
                }
            });
        });
    });
});

//Listen for messages are sent from other content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    switch(request.type) {
        case "storage":
            chrome.storage.sync.set({ "follower": request }, () => {
                console.log("Data saved");
            });
            break;

        case "capture":
            chrome.tabs.captureVisibleTab(sender.tab.windowId, { quality: 1 }, (result) => {
                sendResponse(result);
            });
            break;

        default:
            console.log("Unknown command");
            break;
    }       
    
    return true;
    //chrome.runtime.onMessage.removeListener(backgroundListener); //if you want to stop listening after receiving the message
});
