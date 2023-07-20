import { defineStore } from "pinia";
import { IConnectionDetails, IRTCConnection } from "../constants/_dataTypes";

/**
 * Configure the stun or turn servers used to communicate between the separate accounts
 */
const configuration = {
    iceServers: [
        {'urls': 'stun:stun.services.mozilla.com'},
        {'urls': 'stun:stun.l.google.com:19302'}
    ]
}

// interface IConnectionDetails {
//     classCode: string,
//     uniqueId: string
// }
//
// interface IRTCConnection {
//     peerConnection: RTCPeerConnection;
//     stream: MediaStream;
// }

//NOTE: Must not use the basic typescript Function type parameter as it uses eval() which is blocked by chromes CSP. We
//can use a separate variable which can be overridden within the store code to work around this issue.
type callbackType = (senderId: string, UUID: string, data: string) => void;
let callbackFunction: callbackType;

export let useWebRTCStore = defineStore("webRTC", {
    state: () => {
        return {
            servers: [{'urls': 'stun:stun.services.mozilla.com'}, {'urls': 'stun:stun.l.google.com:19302'}],
            connectionDetails: <IConnectionDetails>{},
            connections: new Map<string, IRTCConnection>(), //hold all the webrtc connections
            connectionStatus: false
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
        setConnectionDetails(callback: callbackType, classCode: string, UUID: string) {
            callbackFunction = callback;

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
            if(data.val() == null) { return; }
            if(data.val().message === "awaiting connection") { return; }

            let msg = JSON.parse(data.val().message);
            let sender = data.val().sender;
            if (sender !== this.connectionDetails.uniqueId) {
                if (msg.ice !== undefined) {
                    void connection.peerConnection.addIceCandidate(new RTCIceCandidate(msg.ice));
                }
                else if (msg.sdp.type === "offer") {
                    connection.peerConnection.setRemoteDescription(new RTCSessionDescription(msg.sdp))
                        .then(() => connection.peerConnection.createAnswer())
                        .then(answer => connection.peerConnection.setLocalDescription(answer))
                        .then(() => callbackFunction(this.connectionDetails.uniqueId, UUID, JSON.stringify({ 'sdp': connection.peerConnection.localDescription })));
                }
                else if (msg.sdp.type === "answer") {
                    void connection.peerConnection.setRemoteDescription(new RTCSessionDescription(msg.sdp));
                }
            }
        },

        /**
         * Add a new connection to the connections object
         * @param UUID
         */
        createNewConnection(UUID: string) {
            const newObj = {
                peerConnection: this.createNewPeerConnection(UUID),
                stream: new MediaStream
            }

            this.connections.set(UUID, <IRTCConnection>newObj);
        },

        /**
         * Create a new peer connection and await ice candidates
         */
        createNewPeerConnection(UUID: string) {
            let peerConnection = new RTCPeerConnection(configuration);
            peerConnection.onicecandidate = (event => event.candidate ? callbackFunction(this.connectionDetails.uniqueId, UUID, JSON.stringify({ 'ice': event.candidate })) : console.log("Sent All Ice"));
            return peerConnection;
        },

        /**
         * Ask to capture the current screen that is visible.
         */
        async prepareScreen(UUID: string) {
            const connection = this.connections.get(UUID);
            if(connection == null) { return; }

            return navigator.mediaDevices.getDisplayMedia({ audio: false, video: true })
                .then(stream => {
                    //Determine if the teacher has cancelled the connection in the meantime
                    if(!this.connectionStatus) {
                        stream.getTracks().forEach(track => track.stop());
                        return "denied";
                    }

                    //Keep track of the current media stream for the connection
                    connection.stream = stream;
                    // @ts-ignore
                    connection.peerConnection.addStream(stream);

                    //stream.getTracks().forEach(track => { connection.peerConnection.addTrack(track); });
                    return stream;
                })
                .catch(() => {
                    return "denied";
                });
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
            connection.peerConnection = this.createNewPeerConnection(UUID);
        },
    }
});