import * as REQUESTS from "../constants/_requests";
import Tab from "@/models/_tab";

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
    checkStoragePermission(checkStorage);
    chrome.tabs.query({ url: REQUESTS.ASSISTANT_MATCH_URL }, ([assistantTab]) => {
        chrome.tabs.sendMessage(assistantTab.id, { "type": REQUESTS.UPDATE_ACTIVE_TAB, tabId: activeInfo.tabId });
    });

});

chrome.tabs.onRemoved.addListener((tabId, removeInfo) => {
    checkStoragePermission(checkStorage);
    chrome.tabs.query({ url: REQUESTS.ASSISTANT_MATCH_URL }, ([assistantTab]) => {
        chrome.tabs.sendMessage(assistantTab.id, { "type": REQUESTS.REMOVE_TAB, tabId: tabId });
    });
});

//Listen for when a tab url changes
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (tab.url.includes("assistant.html")) {
        return
    }
    chrome.tabs.query({ url: REQUESTS.ASSISTANT_MATCH_URL }, ([assistantTab]) => {
        chrome.tabs.sendMessage(assistantTab.id, { "type": REQUESTS.UPDATE_TAB, tab: new Tab(tab.id + "", tab.title, tab.favIconUrl, tab.url) });
    });

    if (changeInfo.url == null) {
        return;
    }

    // read changeInfo data and do something with it as long as it isnt the assistant page
    if (!changeInfo.url.includes("assistant")) {
        // do something here
        checkStoragePermission(checkStorage);
    }
});

//Listen for messages that are sent from content scripts and the assistant.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log("BACKGROUND REQUEST");
    console.log(request);

    switch (request.type) {
        case REQUESTS.CAPTURE:
            chrome.tabs.captureVisibleTab({ quality: 1 }, (result) => {
                sendResponse(result);
            });
            return true; //signals that this is an async response

        case REQUESTS.WEBSITE:
            updateTabURL(request);
            break;

        case REQUESTS.MAXIMIZE:
            maximize();
            break;

        case REQUESTS.MINIMIZE:
            minimize();
            break;

        case REQUESTS.MUTETAB:
            //REMOVE - SETTIMEOUT IS ONLY FOR LOCAL TESTING
            muteTab(request);
            break;

        case REQUESTS.UNMUTETAB:
            //REMOVE - SETTIMEOUT IS ONLY FOR LOCAL TESTING
            unmuteTab(request);
            break;

        case REQUESTS.YOUTUBE:
            youtubeAction(request); //Send to the content script
            break;

        case REQUESTS.SCREENCONTROL:
            console.log("Background");
            contentAction(request); //Send to the content script
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
 * Check if the storage permission has been enabled before trying to
 * access the chrome sync or local storage
 */
const checkStoragePermission = (callback) => {
    chrome.permissions.contains({
        permissions: ["storage"]
    }, (granted) => {
        if (granted) {
            callback();
        } else {
            console.log("Storage permission is not enabled.");
        }
    });
}

/**
 * Check if a follower has been saved by the popup.js script.
 */
const checkStorage = () => {
    chrome.storage.sync.get("follower", async (data) => {
        if (data == null) {
            return;
        }

        if (data.follower == null) {
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
    setTimeout(function () {
        //Send a message to the assistant page
        chrome.tabs.query({ url: REQUESTS.ASSISTANT_MATCH_URL }, ([tab]) => {
            chrome.tabs.sendMessage(tab.id, { "type": REQUESTS.CAPTURE });
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
    setTimeout(function () {
        chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
            const activeTab = tabs[0];
            // chrome.tabs.sendMessage(activeTab.id, message);
            chrome.tabs.update(activeTab.id, { url: `https://${message.value}` });
            chrome.windows.update(activeTab.windowId, { state: 'maximized', focused: true });
        });
    }, 3000);
}

/**
 * Send a message to the assistant page to request that a screen capture
 * is to be taken.
 */
const maximize = () => {
    //Send a message to the assistant page
    chrome.tabs.query({ url: REQUESTS.ASSISTANT_MATCH_URL }, ([tab]) => {
        chrome.windows.update(tab.windowId, { state: 'maximized' });
    });
}

/**
 * Send a message to the assistant page to request that a screen capture
 * is to be taken.
 */
const minimize = () => {
    //Send a message to the assistant page
    chrome.tabs.query({ url: REQUESTS.ASSISTANT_MATCH_URL }, ([tab]) => {
        chrome.windows.update(tab.windowId, { state: 'minimized' });
    });
}

/**
 * Mute the currently active tab or all tabs.
 */
const muteTab = (request) => {
    if (request.tabs === REQUESTS.SINGLETAB) {
        chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
            chrome.tabs.update(tabs[0].id, { muted: true });
        });
    } else if (request.tabs === REQUESTS.MULTITAB) {
        console.log("MULTITAB MUTE");
        chrome.tabs.query({}, function (tabs) {
            console.log(tabs);
            tabs.forEach(tab => {
                console.log(tab);
                chrome.tabs.update(tab.id, { muted: true });
            });
        });
    }
}

/**
 * Unmute the currently active tab or all tabs.
 */
const unmuteTab = (request) => {
    if (request.tabs === REQUESTS.SINGLETAB) {
        chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
            chrome.tabs.update(tabs[0].id, { muted: false });
        });
    } else if (request.tabs === REQUESTS.MULTITAB) {
        chrome.tabs.query({}, function (tabs) {
            tabs.forEach(tab => {
                chrome.tabs.update(tab.id, { muted: false });
            });
        });
    }
}

/**
 * Send a youtube action to the active tab.
 */
const youtubeAction = (request) => {
    chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
        console.log(tabs);
        const activeTab = tabs[0];
        chrome.tabs.sendMessage(activeTab.id, request);
    });
}

/**
 * Send an action to all currently open tabs except the assistant tab
 * @param request
 */
const contentAction = (request) => {
    chrome.tabs.query({}, function (tabs) {
        tabs.forEach(tab => {
            if(!tab.url.includes("assistant.html")) {
                chrome.tabs.sendMessage(tab.id, request);
            }
        });
    });
}
