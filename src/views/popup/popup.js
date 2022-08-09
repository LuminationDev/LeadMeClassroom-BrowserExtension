import './popup.css';

const inputs = document.querySelectorAll('input');
const codeBlock = document.getElementById('code-block');
const reset = document.getElementById('resetCode');
const form = document.querySelector('form');
const connect = document.getElementById('connectBtn');
const login = document.getElementById('login');

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

    //Collects all the open tabs
    // chrome.tabs.query({}, function(tabs) {
    //     console.log(tabs);
    // });

    //TODO - create a new tab and run this code?

    //Querys the currently open tab and sends a message to it
    chrome.tabs.query({currentWindow: true, active: true}, function (tabs){
        
        var activeTab = tabs[0];
        chrome.tabs.sendMessage(activeTab.id, 
            {
                "message": "start",
                "code": userCode
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
