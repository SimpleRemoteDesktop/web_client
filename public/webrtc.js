let localOffer;
let webSocket;
let pc;
let el;

function onload() {
    initwebrtc();
    startWebsocket();
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
                socket.send(JSON.stringify({type: 'start'}));
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
        el = document.createElement(event.track.kind);
        el.srcObject = event.streams[0];
        el.autoplay = true;
        el.controls = false;

    	addInputEventHandler(el);
        document.getElementById('remoteVideos').appendChild(el)
    };

    pc.oniceconnectionstatechange = e => log(pc.iceConnectionState);


// Offer to receive 1 audio, and 2 video tracks
    pc.addTransceiver('audio', {'direction': 'recvonly'});
    pc.addTransceiver('video', {'direction': 'recvonly'});
    pc.addTransceiver('video', {'direction': 'recvonly'});
    pc.createOffer().then(d => pc.setLocalDescription(d)).catch(log);
}

const Button = {
    LEFT: 1,
    RIGHT: 2,
    MIDDLE: 4,
    prevState: 0
};

const SRD_MOUSE_BUTTON = {
    LEFT: 1,
    RIGHT: 2
};

function addInputEventHandler(element) {
    element.addEventListener('contextmenu', function (event) {
        event.preventDefault();
        return false;
    });

    element.addEventListener("mouseup", onMouseButton, false);
    element.addEventListener("mousedown", onMouseButton, false);
    element.addEventListener('mousemove', onMouseMove, false);
    document.addEventListener('keydown', onKeyDown, false);
    document.addEventListener('keyup', onKeyUp, false);


    function onKeyDown(event) {
        if (event.repeat) return;
        onKeyPress(event);
    }

    function onKeyUp(event) {
        if (event.repeat) return;
        onKeyPress(event);
    }

    function onKeyPress(event) {
        console.log(event);
    }

    function onMouseButton(event) {
        //console.log(event);
        const button = event.buttons ^ Button.prevState;
        Button.prevState = event.buttons;
        const isDown = event.type === "mousedown";

        //console.log(button, isDown);
        socket.send(JSON.stringify({type: "button", button: button, isDown: isDown}));

    }

    function onMouseMove(event) {
        var x = event.pageX - element.offsetLeft + document.documentElement.scrollLeft;
        var y = event.pageY - element.offsetTop + document.documentElement.scrollTop;

        var fx = x / element.offsetWidth;
        var fy = y / element.offsetHeight;

        socket.send(JSON.stringify({type: "move", x: fx, y: fy}));
    }
}

