let localOffer;
let webSocket;
let pc;

function onload() {
    initwebrtc();

}


function startWebsocket(frameHandlerCallback) {
    const url = 'ws://' + window.location.host + '/';
    console.log('connecting websocket to url' + url);
    socket = new WebSocket(url, "srd_protocol");

    //socket.binaryType = 'arraybuffer'; // from jmuxer

    socket.onopen = function (event) {
        pc.onicecandidate = event => {
            if (event.candidate === null) {
                console.log(pc.localDescription);
                socket.send(JSON.stringify({type:'offer', offer: pc.localDescription}));
            }
        };


        console.log("websocket open");
        console.log(event);
    };

    socket.onmessage = function (event) {
        const data = JSON.parse(event.data);
        switch (data.type) {
            case 'offer':
                console.log(data.offer);
                pc.setRemoteDescription(new RTCSessionDescription(data.offer));
                socket.send({type: 'start'});
        }
    };
}

function initwebrtc() {
    pc = new RTCPeerConnection({
        iceServers: [
            {
                urls: 'stun:stun.l.google.com:19302'
            }
        ]
    });
    let log = msg => {
        document.getElementById('div').innerHTML += msg + '<br>'
    };

    pc.ontrack = function (event) {
        var el = document.createElement(event.track.kind);
        el.srcObject = event.streams[0];
        el.autoplay = true;
        el.controls = true;

        document.getElementById('remoteVideos').appendChild(el)
    };

    pc.oniceconnectionstatechange = e => log(pc.iceConnectionState);


// Offer to receive 1 audio, and 2 video tracks
    pc.addTransceiver('audio', {'direction': 'recvonly'});
    pc.addTransceiver('video', {'direction': 'recvonly'});
    pc.addTransceiver('video', {'direction': 'recvonly'});
    pc.createOffer().then(d => pc.setLocalDescription(d)).catch(log);
}

