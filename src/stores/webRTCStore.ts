import { defineStore } from "pinia";

/**
 * Configure the stun or turn servers used to communicate between the separate accounts
 */
const configuration = {
    iceServers: [
        {'urls': 'stun:stun.services.mozilla.com'},
        {'urls': 'stun:stun.l.google.com:19302'}
    ]
}

interface IConnectionDetails {
    classCode: string,
    uniqueId: string
}

interface IRTCConnection {
    peerConnection: RTCPeerConnection;
    video: HTMLVideoElement;
    stream: MediaStream;
}

export let useWebRTCStore = defineStore("webRTC", {
    state: () => {
        return {
            servers: [{'urls': 'stun:stun.services.mozilla.com'}, {'urls': 'stun:stun.l.google.com:19302'}],
            connectionDetails: <IConnectionDetails>{},
            connections: new Map<string, IRTCConnection>(), //hold all the webrtc connections
            callback: Function
        }
    },

    actions:
    {
        /**
         * Add a new connection to the connections object
         * @param callback
         * @param classCode
         * @param UUID
         */
        setConnectionDetails(callback: typeof Function, classCode: string, UUID: string) {
            this.callback = callback;

            this.connectionDetails = {
                classCode: classCode,
                uniqueId: String(Math.floor(Math.random() * 1000000000))
            }
        },

        /**
         * Read the ice specific part of a followers database entry.
         * @param {*} data An Ice Candidate object
         * @param UUID
         * @returns Null if there is no new data.
         */
        readIceCandidate(data: any, UUID: string) {
            const connection = this.connections.get(UUID);
            if(connection == null) { return; }

            console.log(data.val());
            if(data.val() == null) {
                return;
            }

            if(data.val().message === "awaiting connection") {
                return;
            }

            let msg = JSON.parse(data.val().message);
            let sender = data.val().sender;
            if (sender !== this.connectionDetails.uniqueId) {
                if (msg.ice !== undefined) {
                    connection.peerConnection.addIceCandidate(new RTCIceCandidate(msg.ice));
                }
                else if (msg.sdp.type === "offer") {
                    connection.peerConnection.setRemoteDescription(new RTCSessionDescription(msg.sdp))
                        .then(() => connection.peerConnection.createAnswer())
                        .then(answer => connection.peerConnection.setLocalDescription(answer))
                        .then(() => this.callback(this.connectionDetails.uniqueId, UUID, JSON.stringify({ 'sdp': connection.peerConnection.localDescription })));
                }
                else if (msg.sdp.type === "answer") {
                    connection.peerConnection.setRemoteDescription(new RTCSessionDescription(msg.sdp));
                }
            }
        },

        /**
         * Add a new connection to the connections object
         * @param UUID
         * @param videoElement
         */
        createNewConnection(UUID: string, videoElement?: HTMLVideoElement) {
            const newObj = {
                peerConnection: this.createNewPeerConnection(UUID, videoElement),
                video: videoElement,
                stream: new MediaStream
            }

            this.connections.set(UUID, <IRTCConnection>newObj);
        },

        /**
         * Create a new peer connection and await ice candidates
         */
        createNewPeerConnection(UUID: string, videoElement?: HTMLVideoElement) {
            let peerConnection = new RTCPeerConnection(configuration);
            peerConnection.onicecandidate = (event => event.candidate ? this.callback(this.connectionDetails.uniqueId, UUID, JSON.stringify({ 'ice': event.candidate })) : console.log("Sent All Ice"));
            // peerConnection.ontrack = (e: RTCTrackEvent) => {
            //     videoElement.srcObject = e.streams[0];
            //     return false;
            // }

            if(videoElement != null) {
                // @ts-ignore
                peerConnection.onaddstream = (event => videoElement.srcObject = event.stream);
            }

            return peerConnection;
        },

        /**
         * Ask to capture the current screen that is visible.
         */
        async prepareScreen(UUID: string) {
            console.log(UUID);
            console.log(this.connections);
            const connection = this.connections.get(UUID);
            if(connection == null) { return; }

            return navigator.mediaDevices.getDisplayMedia({ audio: false, video: true })
                .then(stream => {

                    //Keep track of the current media stream for the connection
                    connection.stream = stream;
                    // @ts-ignore
                    connection.peerConnection.addStream(stream);
                    //stream.getTracks().forEach(track => { connection.peerConnection.addTrack(track); });
                    return "granted";
                })
                .catch(() => {
                    return "denied";
                });
        },

        /**
         * Create an offer to send to a specific follower.
         */
        startFollowerStream(UUID: string) {
            const connection = this.connections.get(UUID);
            if(connection == null) { return; }

            //Create offer for one way connection
            const pc = connection.peerConnection;
            connection.peerConnection.createOffer({ offerToReceiveVideo: true })
                .then(offer => pc.setLocalDescription(offer))
                .then(() => this.callback(this.connectionDetails.uniqueId, UUID, JSON.stringify({ 'sdp': connection.peerConnection.localDescription })));
        },

        /**
         * Close any tracks that a follower has open to a WebRTC connection.
         */
        stopTracks(UUID: string) {
            const connection = this.connections.get(UUID);
            if(connection == null) { return; }

            //Close the current stream then set up the video ready for the next stream
            connection.stream.getTracks().forEach(track => track.stop());
            connection.peerConnection.close()
            connection.peerConnection = this.createNewPeerConnection(UUID, connection.video);
        },
    }
});