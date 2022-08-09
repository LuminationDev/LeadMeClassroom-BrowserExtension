//Send the user to the onboarding page when first installing the extension
chrome.runtime.onInstalled.addListener((reason) => {
    if (reason === chrome.runtime.OnInstalledReason.INSTALL) {
        chrome.tabs.create({
            url: 'onboarding.html'
        });
    }
});

//Listen for messages sent from other scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log(request);

    switch(request.type) {
        case "storage":
            chrome.storage.sync.set({ "classCode": request.code }, () => {
                console.log("Data saved");
            });
            break;

        case "firebase":
            
            break;
        
        case "webrtc":
            
            break;

        default:
            console.log("Unknown command");
            break;
    }       
    
    //chrome.runtime.onMessage.removeListener(backgroundListener); //if you want to stop listening after receiving the message
});
