//Page to control a YouTube page
import Controller from './AbstractController';

import {useStorage} from "@/hooks/useStorage";
const { setSyncStorage, removeSyncStorage } = useStorage();

class ScreenController extends Controller {
    constructor() {
        super();
    }

    determineAction = (action) => {
        switch (action) {
            case "block":
                this.blockScreen();
                break;

            case "unblock":
                this.unblockScreen();
                break;

            default:
                console.log("Unknown Action");
        }
    }

    /**
     * Inject a black div over the top of a page.
     */
    blockScreen = () => {
        setSyncStorage({"blocked": true});

        //Check if the screen is already blocked
        if(document.getElementById('block-screen-container')) { return; }

        fetch(chrome.runtime.getURL('src/assets/templates/block.html'))
            .then(response => response.text())
            .then(html => {
                document.body.insertAdjacentHTML('beforebegin', html);
            }).catch(err => {
            // handle error
        });
    }

    /**
     * Remove the block div from the screen.
     */
    unblockScreen = () => {
        removeSyncStorage("blocked");
        document.getElementById('block-screen-container').remove();
    }
}

export default ScreenController;
