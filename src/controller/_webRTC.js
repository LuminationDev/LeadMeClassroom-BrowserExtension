class WebRTC {
    constructor(realTimeDatabase, classCode, uuid) {
        this.classCode = classCode;
        this.uuid = uuid;
        this.video = null;

        console.log("CREATED");

        // //Determine who sent the message in firebase
        this.uniqueId = Math.floor(Math.random() * 1000000000);
        this.servers = { 'iceServers': [{ 'urls': 'stun:stun.services.mozilla.com' }, { 'urls': 'stun:stun.l.google.com:19302' }] };
        this.pc = this.createNewPeerConnection();
        this.stream = null; //Track the current stream

        //Real time database reference
        this.db = realTimeDatabase;

        //Listen for ice candidates being sent
        this.db.ref(`ice/${this.classCode}/${this.uuid}`).on('child_added', async (snapshot) => this.readIceCandidate(snapshot));
    }

    /**
     * Create a new peer connection and await ice candidates
     */
    createNewPeerConnection = () => {
        let peerConnection = new RTCPeerConnection(this.servers);
        peerConnection.onicecandidate = (event => event.candidate ? this.sendIceCandidates(this.uniqueId, JSON.stringify({ 'ice': event.candidate })) : console.log("Sent All Ice"));
        return peerConnection;
    }

    /**
     * Set a video element for the newly created follower connection.
     * @param {*} element A reference to a HTML video element. 
     */
    setVideoElement = (element) => {
        this.video = element;
        //Set up the video ready for the stream
        this.setupVideo(this.video);
    }

    /**
     * For a leader set up a video area for a followers screen to be
     * displayed on for the one way connection.
     */
    setupVideo = (followerVideo) => {
        this.pc.onaddstream = (event => followerVideo.srcObject = event.stream);
    }

    /**
     * Push ice candidate information to a particular user.
     * @param {*} senderId 
     * @param {*} data 
     */
    sendIceCandidates = (senderId, data) => {
        const msg = this.db.ref(`ice/${this.classCode}/${this.uuid}`).push({ sender: senderId, message: data });
        msg.remove();
    }

    /**
     * Read the ice specific part of a followers database entry.
     * @param {*} data An Ice Candidate object
     * @returns Null if there is no new data.
     */
    readIceCandidate = (data) => {
        if (data == null) {
            return;
        }

        if(data.val().message === "initial data") {
            return;
        }

        console.log(data.val());

        let msg = JSON.parse(data.val().message);
        let sender = data.val().sender;
        if (sender !== this.uniqueId) {
            if (msg.ice !== undefined) {
                this.pc.addIceCandidate(new RTCIceCandidate(msg.ice));
            }
            else if (msg.sdp.type === "offer") {
                this.pc.setRemoteDescription(new RTCSessionDescription(msg.sdp))
                    .then(() => this.pc.createAnswer())
                    .then(answer => this.pc.setLocalDescription(answer))
                    .then(() => this.sendIceCandidates(this.uniqueId, JSON.stringify({ 'sdp': this.pc.localDescription })));
            }
            else if (msg.sdp.type === "answer") {
                this.pc.setRemoteDescription(new RTCSessionDescription(msg.sdp));
            }
        }
    };

    /**
     * Ask to capture the current screen that is visible.
     */
    prepareScreen = () => {
        //Webcam display
        // navigator.mediaDevices.getUserMedia({audio:true, video:true})
        //     .then(stream => this.leaderVideo.srcObject = stream)
        //     .then(stream => this.pc.addStream(stream));

        //Desktop display
        // navigator.mediaDevices.getDisplayMedia({audio:false, video:true})
        //     .then(stream => this.videoArea.srcObject = stream)
        //     .then(stream => this.pc.addStream(stream));

        //add preferCurrentTab:true, to only select the currently open tab

        return navigator.mediaDevices.getDisplayMedia({ audio: false, video: true })
            .then(stream => {
                this.stream = stream;
                this.pc.addStream(stream);
                return "granted";
            })
            .catch(e => {
                return "denied";
            });
    }

    /**
     * Create an offer to send to a specific follower.
     */
    startFollowerStream = () => {
        //Create offer for one way connection
        this.pc.createOffer({ offerToReceiveVideo: true })
            .then(offer => this.pc.setLocalDescription(offer))
            .then(() => this.sendIceCandidates(this.uniqueId, JSON.stringify({ 'sdp': this.pc.localDescription })));

        //Below starts up the two-way connection
        // this.pc.createOffer()
        //     .then(offer => this.pc.setLocalDescription(offer) )
        //     .then(() => this.sendIceCandidates(this.uniqueId, JSON.stringify({'sdp': this.pc.localDescription})) );
    }

    /**
     * Close any tracks that a follower has open to a WebRTC connection.
     */
    stopTracks = () => {
        this.stream.getTracks().forEach(track => track.stop());
        this.stream = null;

        this.stopFollowerStream();
    }

    /**
     * Send a message to the selected follower to reset their peer connection. Stop the 
     * current peer connection and reset for next time.
     */
    stopFollowerStream = () => {
        console.log("Stopping webrtc connection...");
        this.pc.close();
        this.pc = null;

        //Set up the video ready for the next stream
        this.pc = this.createNewPeerConnection();
        this.setupVideo(this.video);
    }
}

export default WebRTC;
