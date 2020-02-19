var player = null;

function load() {
    var socketURL = 'ws://localhost:8080/';
    var jmuxer = new JMuxer({
        node: 'player',
        mode: 'video',
        flushingTime: 1000,
        fps: 30,
        debug: true
    });
    var ws = new WebSocket(socketURL, "srd_protocol");
    ws.binaryType = 'arraybuffer';
    ws.addEventListener('message',function(event) {
        jmuxer.feed({
            video: new Uint8Array(event.data)
        });
    });
    ws.addEventListener('open', function(){
        ws.send(JSON.stringify({type: "start"}));
    });
    ws.addEventListener('error', function(e) {
        console.log('Socket Error');
    });

}


