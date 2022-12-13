import * as REQUESTS from "../constants/_requests";
import { Tab } from "../models";
import { useStorage } from "../hooks/useStorage";
const { getSyncStorage } = useStorage();

interface storageFollower {
    code: string,
    uuid: string,
    monitoring: boolean
}

//===========================================
//RUNTIME LISTENERS
//===========================================
//Send the user to the on boarding page when first installing the extension
chrome.runtime.onInstalled.addListener((details) => {
    if (details.reason === chrome.runtime.OnInstalledReason.INSTALL) {
        // void chrome.tabs.create({ url: 'onboarding.html' });
    }
});

//Listen for when a tab becomes inactive
chrome.tabs.onActivated.addListener(async () => {
    const data = <storageFollower>await getSyncStorage("follower");
    if (data == null) { return; }
    if (data.monitoring) { captureScreen(); }

    //Need to collect the current tab details for the index number
    chrome.tabs.query({ active: true, lastFocusedWindow: true }, ([currentTab]) => {
        chrome.tabs.query({ url: REQUESTS.ASSISTANT_MATCH_URL }, ([assistantTab]) => {
            if(assistantTab == null) { return; }
            chrome.tabs.sendMessage(<number>assistantTab.id, { type: REQUESTS.UPDATE_ACTIVE_TAB, tab: currentTab });
        });
    });
});

chrome.tabs.onRemoved.addListener(async (tabId) => {
    const data = <storageFollower>await getSyncStorage("follower");
    if (data == null) { return; }
    if (data.monitoring) { captureScreen(); }

    chrome.tabs.query({ url: REQUESTS.ASSISTANT_MATCH_URL }, ([assistantTab]) => {
        if(assistantTab == null) { return; }
        chrome.tabs.sendMessage(<number>assistantTab.id, { type: REQUESTS.REMOVE_TAB, tabId: tabId });
    });
});

//Listen for when a tab url changes
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    const data = <storageFollower>await getSyncStorage("follower");
    if (data == null) { return; }

    let url = <string>tab.url;
    if (url.includes("assistant.html")) { return }

    console.log(tab);

    chrome.tabs.query({ url: REQUESTS.ASSISTANT_MATCH_URL }, ([assistantTab]) => {
        if(assistantTab == null) { return; }
        let newTab = new Tab(tab.id + "", tab.index, tab.windowId, <string>tab.title, <string>tab.favIconUrl, <string>tab.url)
        newTab.audible = <boolean>tab.audible
        newTab.muted = tab.mutedInfo ? tab.mutedInfo.muted : false

        //if tab action is only mute/unmute
        if(changeInfo.mutedInfo !== undefined) {
            delete newTab.lastActivated;
        }
        //Tab was opened in background or right click -> new tab
        else if(!tab.active && (changeInfo.status === 'loading' || changeInfo.status === 'complete' || changeInfo.favIconUrl !== null)) {
            newTab.lastActivated = 0;
        }

        chrome.tabs.sendMessage(<number>assistantTab.id, { type: REQUESTS.UPDATE_TAB, tab: newTab });
    });

    if (changeInfo.url == null) { return; }

    // read changeInfo data and do something with it as long as it isn't the assistant page
    if (!changeInfo.url.includes("assistant") && data.monitoring) { captureScreen(); }
});

//Listen for messages that are sent from content scripts and the assistant.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log(request);

    switch (request.type) {
        case REQUESTS.CAPTURE:
            //Quality - tested on a graphics heavy page
            //100 ~ 753kb
            //50 ~ 135kb
            //30 ~ 110kb
            //20 ~ 75kb
            //10 ~ 55kb
            //5 ~ 37kb

            //Not much difference between 10 and above
            try {
                chrome.tabs.captureVisibleTab({ quality: 10 }, (result) => {
                    if (result) {
                        sendResponse(result);
                    } else {
                        sendResponse(REQUESTS.CAPTURE_FAILED)
                    }
                });
            } catch (err: any) {
                sendResponse(REQUESTS.CAPTURE_FAILED)
            }

            return true; //signals that this is an async response

        case REQUESTS.WEBSITE:
            updateTabURL(request);
            break;

        case REQUESTS.MAXIMIZE:
        case REQUESTS.MINIMIZE:
            resize(request);
            break;

        case REQUESTS.MUTETAB:
        case REQUESTS.UNMUTETAB:
            muteTab(request, request.type === REQUESTS.MUTETAB);
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
 * Send a message to the assistant page to request that a screen capture
 * is to be taken.
 */
const captureScreen = () => {
    //Minor delay to let the screen load
    setTimeout(function () {
        //Send a message to the assistant page
        chrome.tabs.query({ url: REQUESTS.ASSISTANT_MATCH_URL }, ([tab]) => {
            if (!tab) {
                return
            }
            void chrome.tabs.sendMessage(<number>tab.id, { type: REQUESTS.CAPTURE });
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

            //Convert the message into a website
            const website = message.value.startsWith("https://") ? message.value : `https://${message.value}`;
            if (!activeTab) {
                void chrome.windows.create({ url: website, focused: true, state: 'maximized' })
            } else {
                void chrome.tabs.update(<number>activeTab.id, { url: website });
                void chrome.windows.update(activeTab.windowId, { state: 'maximized', focused: true });

            }
        })
    });
}

/**
 * Send a message to the assistant page to request a resize of the page to minimise or maximise the page.
 */
const resize = (request: any) => {
    //Send a message to the assistant page
    chrome.tabs.query({ url: REQUESTS.ASSISTANT_MATCH_URL }, ([tab]) => {
        void chrome.windows.update(tab.windowId, { state: request.type === REQUESTS.MAXIMIZE ? 'maximized' : 'minimized' });
    });
}

/**
 * Mute or unmute the currently active tab or all tabs.
 */
const muteTab = (request: any, mute: boolean) => {
    if (request.tabId) {
        void chrome.tabs.update(parseInt(request.tabId), { muted: mute });
    } else if (request.tabs === REQUESTS.MULTITAB) {
        chrome.tabs.query({}, function (tabs) {
            tabs.forEach(tab => {
                void chrome.tabs.update(<number>tab.id, { muted: mute });
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
    request.tabs = REQUESTS.MULTITAB
    muteTab(request, request.action === "block");

    chrome.tabs.query({}, function (tabs) {
        tabs.forEach(tab => {
            let url = <string>tab.url;
            if (url.includes("assistant.html")) { return; }

            let id = <number>tab.id;
            void chrome.tabs.sendMessage(id, request);
        });
    });
}
