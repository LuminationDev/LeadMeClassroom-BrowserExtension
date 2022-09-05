import './popup.css';

const popup = document.getElementById("popup");
const inputs = document.querySelectorAll('input');
const codeBlock = document.getElementById('code-block');
const reset = document.getElementById('resetCode');
const form = document.querySelector('form');
const connect = document.getElementById('connectBtn');
const login = document.getElementById('login');
const endSession = document.getElementById("endSession");
const endSessionBtn = document.getElementById("endSessionBtn");

//==================================
//RUNTIME
//==================================
//Check if a session is in progress - i.e. if there is a saved class code
chrome.storage.sync.get("follower", (data) => {
    if(data.follower != null && data.follower != undefined) {
        popup.classList.add('hidden');
        endSession.classList.remove('hidden');
    } else {
        console.log("Nothing saved");
    }
});

//Focus the inputs 
inputs.forEach((input, key) => {
    input.addEventListener('keyup', function () {
        if (input.value) {
            if (key === 3) {
                codeBlock.classList.remove('hidden');
            } else {
                inputs[key + 1].focus();
            }
        }
    });
});

//Clear the form
reset.onclick = () => {
    form.reset();
    codeBlock.classList.add('hidden');
};

//Connect to the classroom
connect.onclick = async () => {
    const userCode = [...inputs].map((input) => input.value).join(''); 

    //Querys the currently open tab and sends a message to it
    chrome.tabs.query({currentWindow: true, active: true}, function (tabs){
        
        var activeTab = tabs[0];
        chrome.tabs.sendMessage(activeTab.id, 
            {
                "type": "check",
                "code": userCode
            }, (response) => {
                console.log(response);

                if(!response) {
                    document.getElementById("error").innerHTML = "No class found";
                    return;
                }

                chrome.storage.sync.set({ 
                    "follower": 
                    {
                        "code": userCode
                    } 
                });

                chrome.windows.create({ 
                    url: chrome.runtime.getURL("assistant.html"),
                    type: "popup",
                    state: "minimized"
                });

                window.close();
            }
        );
    });
}

//Login a leader to an account
login.onclick = () => {
    //Show login prompt here

    //Then go to the dashboard
    chrome.tabs.create({ url: chrome.runtime.getURL("dashboard.html") });
}

//End a current session
endSessionBtn.onclick = () => {
    chrome.storage.sync.remove("follower", () => {
        console.log("Data removed");
        popup.classList.remove('hidden');
        endSession.classList.add('hidden');
    });
}
