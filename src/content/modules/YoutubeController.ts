//Page to control a YouTube page
import Controller from './AbstractController'

class YoutubeController extends Controller {
    private player: HTMLVideoElement;

    constructor() {
        super();
        //Currently the easiest way to get the video element, only the main video has this class
        let video = document.getElementsByClassName("video-stream");
        this.player = <HTMLVideoElement>video[0];
    }

    determineAction = (action: string) => {
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
        void this.player.play();
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