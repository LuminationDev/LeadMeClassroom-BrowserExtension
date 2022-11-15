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

        document.body.insertAdjacentHTML('beforebegin', "" +
            "<div id=\"block-screen-container\" style=\"" +
            "   position: fixed; " +
            "   inset: 0; " +
            "   display: grid; " +
            "   place-items: center; " +
            "   height: 100vh; " +
            "   width: 100vw; " +
            "   background-color: black; " +
            "   z-index: 999999; " +
            "   font-family: Poppins, serif;\"" +
            ">\n" +
            "    <p style=\"color: white; font-size: large;\">Blocked</p>\n" +
            "</div>");
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
