import '../../main.css'
import './popup.css';
import { Firebase } from '../../controller'
import { auth } from 'firebaseui';
import { getAuth, setPersistence, browserLocalPersistence, signOut, EmailAuthProvider } from 'firebase/auth'

const popup = document.getElementById("popup");
const inputs = document.querySelectorAll('input');
const codeBlock = document.getElementById('code-block');
const reset = document.getElementById('resetCode');
const form = document.querySelector('form');
const connect = document.getElementById('connectBtn');
const login = document.getElementById('login');
const endSession = document.getElementById("endSession");
const assistantBtn = document.getElementById('assistantBtn');
const endSessionBtn = document.getElementById("endSessionBtn");

//==================================
//RUNTIME
//==================================

const firebase = new Firebase();

/**
 * Check if a session is in progress - i.e. if there is a saved class code. This
 * can only proceed if the storage permission has been enabled. It cannot be requested
 * here as it requires a User gesture.
 */
chrome.permissions.contains({
    permissions: ["storage"]
}, (granted) => {
    if (granted) {
        checkForFollower();
    } else {
        console.log("Storage permission is not enabled.");
    }
});

/**
 * Try to get any 'follower' details from the chrome synchronized storage, if they
 * are present it means the browser is currently in a session.
 */
function checkForFollower() {
    chrome.storage.sync.get("follower", (data) => {
        if (data.follower != null && data.follower != undefined) {
            popup.classList.add('hidden');
            endSession.classList.remove('hidden');
        } else {
            console.log("Nothing saved");
        }
    });
}

//Focus the inputs 
inputs.forEach((input, key) => {
    input.addEventListener('keyup', function (e) {
        if (e.key === "Backspace") {
            if (key === 3) {
                codeBlock.classList.add('hidden');
            }

            if (key != 0) {
                inputs[key - 1].focus();
            }
        }

        if (key === 3 && e.key === "Enter") {
            connect.click();
        }

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

/**
 * Connect to the classroom, when user tries to connect the extension prompts for
 * the additional permissions (if not already granted). If theses are denied then 
 * the user cannot join the classroom. Permissions can be enabled/disabled in the 
 * options menu.
 */
connect.onclick = async () => {
    //This request must be from a user action, cannot perform on load.
    chrome.permissions.request({
        permissions: [
            "storage",
            "tabs",
            "scripting",
            "activeTab",
            "identity"
        ]
    }, (granted) => {
        console.log(granted);

        // The callback argument will be true if the user granted the permissions.
        if (granted) {
            console.log("Permissions have been enabled");
            connectToClass();
        } else {
            console.log("Permissions have been denied");
            document.getElementById("error").innerHTML = "Permissions have been denied";
        }
    });
}

function connectToClass() {
    const userCode = [...inputs].map((input) => input.value).join('');

    //Querys the currently open tab and sends a message to it
    chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
        firebase.checkForClassroom(userCode).then((result) => {
            if (result) {
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
        });
    });
}

function setupLogin() {
    var ui = new auth.AuthUI(getAuth())
    login.innerText = "Login"
    login.onclick = () => {
        ui.start('#firebaseui-auth-container', {
            signInOptions: [
                EmailAuthProvider.PROVIDER_ID
            ],
            callbacks: {
                signInFailure(error) {
                    const errorTag2 = document.getElementById("error");
                    errorTag2.innerText = error;
                    return false;
                },
                signInSuccessWithAuthResult(authResult, redirectUrl) {
                    chrome.tabs.create({ url: chrome.runtime.getURL("dashboard.html") });
                    return false;
                }
            }
        });
    }
}

setPersistence(getAuth(), browserLocalPersistence).then(() => {
    if (getAuth().currentUser) {
        login.innerText = "Go to dashboard"
        login.onclick = () => {
            chrome.tabs.create({ url: chrome.runtime.getURL("dashboard.html") });
        }
        logout.classList.remove('hidden')
        logout.onclick = () => {
            signOut(getAuth()).then(() => {
                setupLogin()
                logout.classList.add('hidden')
            })
        }
    } else {
        setupLogin()
    }
    login.classList.remove('hidden')
})

assistantBtn.onclick = () => {
    chrome.runtime.sendMessage({ "type": "maximize" });
}

//End a current session
endSessionBtn.onclick = () => {
    chrome.storage.sync.get("follower", (data) => {
        if (data.follower != null && data.follower != undefined) {
            //Send message to firebase about disconnection
            chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {

                var activeTab = tabs[0];
                chrome.tabs.sendMessage(activeTab.id,
                    {
                        "type": "disconnect",
                        "code": data.follower.code,
                        "uuid": data.follower.uuid
                    }, (response) => {
                        console.log(response);
                    }
                );
            });
        }
    });

    chrome.storage.sync.remove("follower", () => {
        console.log("Data removed");
        popup.classList.remove('hidden');
        endSession.classList.add('hidden');
    });
}
