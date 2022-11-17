import * as REQUESTS from "../constants/_requests";
import { Tab } from "../models";

import { useStorage } from "../hooks/useStorage";
const { getSyncStorage } = useStorage();

//===========================================
//RUNTIME LISTENERS
//===========================================
//Send the user to the on boarding page when first installing the extension
chrome.runtime.onInstalled.addListener((details) => {
    if (details.reason === chrome.runtime.OnInstalledReason.INSTALL) {
        void chrome.tabs.create({ url: 'onboarding.html' });
    }
});

//Listen for when a tab becomes inactive
chrome.tabs.onActivated.addListener(async () => {
    const data = await getSyncStorage("follower");
    if (data == null) { return; }

    checkStoragePermission(checkStorage);

    //Need to collect the current tab details for the index number
    chrome.tabs.query({ active: true, lastFocusedWindow: true }, ([currentTab]) => {
        chrome.tabs.query({ url: REQUESTS.ASSISTANT_MATCH_URL }, ([assistantTab]) => {
            chrome.tabs.sendMessage(<number>assistantTab.id, { "type": REQUESTS.UPDATE_ACTIVE_TAB, tab: currentTab });
        });
    });
});

chrome.tabs.onRemoved.addListener(async (tabId) => {
    const data = await getSyncStorage("follower");
    if (data == null) { return; }

    checkStoragePermission(checkStorage);
    chrome.tabs.query({ url: REQUESTS.ASSISTANT_MATCH_URL }, ([assistantTab]) => {
        chrome.tabs.sendMessage(<number>assistantTab.id, { "type": REQUESTS.REMOVE_TAB, tabId: tabId });
    });
});

//Listen for when a tab url changes
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    const data = await getSyncStorage("follower");
    if (data == null) { return; }

    let url = <string>tab.url;
    if (url.includes("assistant.html")) { return }

    chrome.tabs.query({ url: REQUESTS.ASSISTANT_MATCH_URL }, ([assistantTab]) => {
        let newTab = new Tab(tab.id + "", tab.index, tab.windowId, <string>tab.title, <string>tab.favIconUrl, <string>tab.url)
        newTab.audible = <boolean>tab.audible
        newTab.muted = tab.mutedInfo ? tab.mutedInfo.muted : false
        chrome.tabs.sendMessage(<number>assistantTab.id, { "type": REQUESTS.UPDATE_TAB, tab: newTab });
    });

    if (changeInfo.url == null) { return; }

    // read changeInfo data and do something with it as long as it isn't the assistant page
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
            muteTab(request);
            break;

        case REQUESTS.UNMUTETAB:
            unmuteTab(request);
            break;

        case REQUESTS.YOUTUBE:
            youtubeAction(request); //Send to the content script
            break;

        case REQUESTS.SCREENCONTROL:
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
const checkStoragePermission = (callback: Function) => {
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
        if (data == null) { return; }
        if (data.follower == null) { return; }

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
            void chrome.tabs.sendMessage(<number>tab.id, { "type": REQUESTS.CAPTURE });
        });
    }, 500);
}

/**
 * Update the URL of the currently active tab with the message that has been sent, it
 * MUST begin with https:// otherwise it will extend the current URL with whatever is 
 * passed.
 * @param {*} message
 */
const updateTabURL = (message: any) => {
    chrome.tabs.query({ active: true }, function (tabs) {
        chrome.windows.getCurrent().then(window => {
            const currentWindowTabs = tabs.filter(element => element.windowId === window.id)
            let activeTab
            if (currentWindowTabs.length > 0 && !currentWindowTabs[0]?.url?.includes("assistant.html")) {
                activeTab = currentWindowTabs[0]
            } else {
                activeTab = tabs.filter(element => element && element.url && !element.url.includes("assistant.html"))[0]
            }
            if (!activeTab) {
                chrome.windows.create({ url: `https://${message.value}`, focused: true, state: 'maximized' })
            } else {
                chrome.tabs.update(<number>activeTab.id, { url: `https://${message.value}` });
                chrome.windows.update(activeTab.windowId, { state: 'maximized', focused: true });

            }
            // chrome.tabs.sendMessage(activeTab.id, message);
        })
    });
}

/**
 * Send a message to the assistant page to request that a screen capture
 * is to be taken.
 */
const maximize = () => {
    //Send a message to the assistant page
    chrome.tabs.query({ url: REQUESTS.ASSISTANT_MATCH_URL }, ([tab]) => {
        void chrome.windows.update(tab.windowId, { state: 'maximized' });
    });
}

/**
 * Send a message to the assistant page to request that a screen capture
 * is to be taken.
 */
const minimize = () => {
    //Send a message to the assistant page
    chrome.tabs.query({ url: REQUESTS.ASSISTANT_MATCH_URL }, ([tab]) => {
        void chrome.windows.update(tab.windowId, { state: 'minimized' });
    });
}

/**
 * Mute the currently active tab or all tabs.
 */
const muteTab = (request: any) => {
    if (request.tabId) {
        void chrome.tabs.update(parseInt(request.tabId), { muted: true });
    } else if (request.tabs === REQUESTS.MULTITAB) {
        console.log("MULTI-TAB MUTE");
        chrome.tabs.query({}, function (tabs) {
            console.log(tabs);
            tabs.forEach(tab => {
                console.log(tab);
                void chrome.tabs.update(<number>tab.id, { muted: true });
            });
        });
    }
}

/**
 * Unmute the currently active tab or all tabs.
 */
const unmuteTab = (request: any) => {
    if (request.tabId) {
        void chrome.tabs.update(parseInt(request.tabId), { muted: false });
    } else if (request.tabs === REQUESTS.MULTITAB) {
        chrome.tabs.query({}, function (tabs) {
            tabs.forEach(tab => {
                void chrome.tabs.update(<number>tab.id, { muted: false });
            });
        });
    }
}

/**
 * Send a YouTube action to the active tab.
 */
const youtubeAction = (request: object) => {
    chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
        console.log(tabs);
        const activeTab = tabs[0];
        void chrome.tabs.sendMessage(<number>activeTab.id, request);
    });
}

/**
 * Send an action to all currently open tabs except the assistant tab
 * @param request
 */
const contentAction = (request: any) => {
    chrome.tabs.query({}, function (tabs) {
        tabs.forEach(tab => {
            let url = <string>tab.url;
            if (url.includes("assistant.html")) { return; }

            let id = <number>tab.id;
            void chrome.tabs.sendMessage(id, request);
        });
    });
}
