class WebRTC {
    constructor(realTimeDatabase, classCode, uuid) {  
        this.classCode = classCode;
        this.uuid = uuid;
        this.video = null;

        // //Determine who sent the message in firebase
        this.uniqueId = Math.floor(Math.random()*1000000000);
        this.servers = {'iceServers': [{'urls': 'stun:stun.services.mozilla.com'}, {'urls': 'stun:stun.l.google.com:19302'}]};
        this.pc = this.createNewPeerConnection();

        

        //Real time database reference
        this.database = realTimeDatabase;
        //Listen for ice candidates being sent
        this.database.ref("/classCode").child(this.classCode).child("followers").child(this.uuid).child("/ice").on('child_added', this.readIceCandidate);
    }

    /**
     * Create a new peer connection and await ice candidates
     */
    createNewPeerConnection = () => {
        let peerConnection = new RTCPeerConnection(this.servers);
        peerConnection.onicecandidate = (event => event.candidate?this.sendIceCandidates(this.uniqueId, JSON.stringify({'ice': event.candidate})):console.log("Sent All Ice") );
        return peerConnection;
    }

    /**
     * Set a video element for the newly created follower connection.
     * @param {*} element A reference to a HTML video element. 
     */
    setVideoElement = (element) => {
        this.video = element;
        //Setup the video ready for the stream
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
        var msg = this.database.ref("/classCode").child(this.classCode).child("followers").child(this.uuid).child("/ice").push({ sender: senderId, message: data });
        msg.remove();
    }
    
    /**
     * Read the ice specific part of a followers database entry.
     * @param {*} data An Ice Candidate object
     * @returns Null if there is no new data.
     */
    readIceCandidate = (data) => {
        if(data == null) {
            return;
        }
        console.log(data.val());
        
        var msg = JSON.parse(data.val().message);
        var sender = data.val().sender;
        if (sender != this.uniqueId) {
            if (msg.ice != undefined) {
                this.pc.addIceCandidate(new RTCIceCandidate(msg.ice));
            }
            else if (msg.sdp.type == "offer") {
                this.pc.setRemoteDescription(new RTCSessionDescription(msg.sdp))
                    .then(() => this.pc.createAnswer())
                    .then(answer => this.pc.setLocalDescription(answer))
                    .then(() => this.sendIceCandidates(this.uniqueId, JSON.stringify({'sdp': this.pc.localDescription})));
            }
            else if (msg.sdp.type == "answer") {
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
        navigator.mediaDevices.getDisplayMedia({audio:false, video:true})
            .then(stream => this.pc.addStream(stream))
            .then(() => chrome.runtime.sendMessage({"type" : "minimize"}));
    }

    /**
     * Create an offer to send to a specific follower.
     */   
    startFollowerStream = () => {
        //Create offer for one way connection
        this.pc.createOffer({offerToReceiveVideo: true})
            .then(offer => this.pc.setLocalDescription(offer) )
            .then(() => this.sendIceCandidates(this.uniqueId, JSON.stringify({'sdp': this.pc.localDescription})) );

        //Below starts up the two way connection
        // this.pc.createOffer()
        //     .then(offer => this.pc.setLocalDescription(offer) )
        //     .then(() => this.sendIceCandidates(this.uniqueId, JSON.stringify({'sdp': this.pc.localDescription})) );
    }

    /**
     * Send a message to the selected follower to reset their peer connection. Stop the 
     * current peer connection and reset for next time.
     */
    stopFollowerStream = () => {
        console.log("Stopping webrtc connection...");
        this.pc.close();
        this.pc = null;
        this.pc = this.createNewPeerConnection();
        //Setup the video ready for the stream
        this.setupVideo(this.video);
    }
}

export default WebRTC;
