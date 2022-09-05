//===========================================
//RUNTIME LISTENERS
//===========================================
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
    checkStorage();
});

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    console.log(changeInfo);

    if(changeInfo.url == null) {
        return;
    }

    // read changeInfo data and do something with it as long as it isnt the assistant page
    if (!changeInfo.url.includes("assistant")) {
        // do something here
        checkStorage();
    }
});

//Listen for messages that are sent from content scripts and the assistant.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    switch(request.type) {
        case "capture":
            chrome.tabs.captureVisibleTab({ quality: 1 }, (result) => {
                sendResponse(result);
            });

            return true; //signals that this is an async response

        case "website":
            updateTabURL(request);
            break;

        default:
            console.log("Unknown command");
            break;
    }
});

//===========================================
//FUNCTIONS
//===========================================
/**
 * Check if a follower has been saved by the popup.js script.
 */
const checkStorage = () => {
    chrome.storage.sync.get("follower", async (data) => {
        if(data == null) {
            return;
        }    

        if(data.follower == null) {
            return;
        }

        captureScreen();
    });
}

/**
 * Send a message to the assistant page to request that a screen capture
 * is to be taken.
 */
const captureScreen = () => {
    //Minor delay to let the screen load
    setTimeout(function(){ 
        //Send a message to the assistant page
        chrome.tabs.query({}, function(tabs) {
            tabs.forEach(tab => {
                if(tab.url.includes("chrome") && tab.url.includes("assistant")) {
                    chrome.tabs.sendMessage(tab.id, {"type" : "capture"});
                }
            });
        });
    }, 500);
}

/**
 * Update the URL of the currently active tab with the message that has been sent, it
 * MUST begin with https:// otherwise it will extend the current URL with whatever is 
 * passed.
 * @param {*} message 
 */
const updateTabURL = (message) => {
    setTimeout(function(){ 
        chrome.tabs.query({currentWindow: true, active: true}, function(tabs) {
            const activeTab = tabs[0];
            // chrome.tabs.sendMessage(activeTab.id, message);
            chrome.tabs.update(activeTab.id, {url: `https://${message.value}`});
        });
    }, 3000);
}