class WebRTC {
    constructor(realTimeDatabase, leaderVideo, followerVideo) {  
        // //Determine who sent the message in firebase
        this.database = realTimeDatabase;
        this.leaderVideo = leaderVideo;
        this.uniqueId = Math.floor(Math.random()*1000000000);
        this.servers = {'iceServers': [{'urls': 'stun:stun.services.mozilla.com'}, {'urls': 'stun:stun.l.google.com:19302'}]};
        this.pc = new RTCPeerConnection(this.servers);
        this.pc.onicecandidate = (event => event.candidate?this.sendMessage(this.uniqueId, JSON.stringify({'ice': event.candidate})):console.log("Sent All Ice") );
        this.pc.onaddstream = (event => followerVideo.srcObject = event.stream);

        this.database.ref("/ice").on('child_added', this.readMessage);
    }

    sendMessage = (senderId, data) => {
        var msg = this.database.ref("/ice").push({ sender: senderId, message: data });
        msg.remove();
    }
       
    readMessage = (data) => {
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
                    .then(() => this.sendMessage(this.uniqueId, JSON.stringify({'sdp': this.pc.localDescription})));
            }
            else if (msg.sdp.type == "answer") {
                this.pc.setRemoteDescription(new RTCSessionDescription(msg.sdp));
            }
        }
    };
       
    showMyFace = () => {
        //Webcam display
        // navigator.mediaDevices.getUserMedia({audio:true, video:true})
        //     .then(stream => this.leaderVideo.srcObject = stream)
        //     .then(stream => this.pc.addStream(stream));

        //Desktop display
        navigator.mediaDevices.getDisplayMedia({audio:false, video:true})
            .then(stream => this.leaderVideo.srcObject = stream)
            .then(stream => this.pc.addStream(stream));
    }
       
    showFriendsFace = () => {
        this.pc.createOffer()
            .then(offer => this.pc.setLocalDescription(offer) )
            .then(() => this.sendMessage(this.uniqueId, JSON.stringify({'sdp': this.pc.localDescription})) );
    }
}

export default WebRTC;
