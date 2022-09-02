class WebRTC {
    constructor(realTimeDatabase, classCode, uuid) {  
        this.classCode = classCode;
        this.uuid = uuid;

        // //Determine who sent the message in firebase
        this.uniqueId = Math.floor(Math.random()*1000000000);
        this.servers = {'iceServers': [{'urls': 'stun:stun.services.mozilla.com'}, {'urls': 'stun:stun.l.google.com:19302'}]};
        this.pc = this.createNewPeerConnection();

        //Real time database reference
        this.database = realTimeDatabase;
        //Listen for video requests being sent
        this.database.ref("/classCode").child(this.classCode).child("followers").child(this.uuid).child("/request").on('child_added', this.readMessage);
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

    readMessage = (data) => {
        if(data == null) {
            return;
        }
        console.log(data.val());
        
        var msg = data.val().message;
        var sender = data.val().sender;
        if (sender != this.uniqueId) {
            console.log(msg);
            if (msg == "permission") {
                console.log("Leader has asked follower for permission");
                this.prepareScreen();
            }
            else if (msg == "granted") {
                console.log("Follower has granted permission");
            }
            else if (msg == "denied") {
                console.log("Follower has denied permission");
            }
            else if (msg == "inSession") {
                console.log("Follower already has an open session");
            }
        }
    };

    /**
     * Send a message to a follower requesting that they share the current tab.
     * @param {*} senderId The unique id of the sending users, this stops a leader/follower replying to themselves.
     */
    requestVideoStream = () => {
        var msg = this.database.ref("/classCode").child(this.classCode).child("followers").child(this.uuid).child("/request").push({ sender: this.uniqueId, message: "permission" });
        msg.remove();
    }
      
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
            .then(stream => this.pc.addStream(stream));
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
     * 
     */
    stopFollowerStream = () => {
        console.log("Stopping webrtc connection...");
        //this.pc = null;
    }
}

export default WebRTC;
