export interface storageFollower {
    code: string,
    uuid: string,
    monitoring: boolean
}

export interface followerData {
    code: string,
    uuid: string,
    name: string,
    teacherName: string,
    monitoring?: boolean
}

export interface taskData {
    name: string,
    packageName: string,
    type: string
}

//Connect details for the WEBRTC connection in the webRTCStore
export interface IConnectionDetails {
    classCode: string,
    uniqueId: string
}

//Connect details for the WEBRTC connection in the webRTCStore
export interface IRTCConnection {
    peerConnection: RTCPeerConnection;
    stream: MediaStream;
}