//Page to control a YouTube page
import Controller from './AbstractController'

class YoutubeController extends Controller {
    constructor() {
        super();
        //Currently the easiest way to get the video element, only the main video has this class
        let video = document.getElementsByClassName("video-stream");
        this.player = video[0];
    }

    determineAction = (action) => {
        switch (action) {
            case "play":
                this.playVideo();
                break;

            case "pause":
                this.pauseVideo();
                break;

            case "stop":
                this.stopVideo();
                break;

            default:
                console.log("Unknown Action");
        }
    }

    playVideo = () => {
        this.player.play();
    }

    pauseVideo = () => {
        this.player.pause();
    }

    stopVideo = () => {
        this.player.pause();
        this.player.currentTime = 0;
    }
}

export default YoutubeController;