var jmuxer = null;
var player = null;

function load() {
    playerFn();
    startWebsocket();
}

function playerFn() {
   player = new Player({
       useWorker: true,
       workerFile: "/Broadway/Decoder.js"
   });

   document.body.appendChild(player.canvas);

}

function startWebsocket() {
    var socket = new WebSocket('ws://127.0.0.1:8080/', "srd_protocol");

    socket.binaryType = 'arraybuffer'; // from jmuxer

    socket.onopen = function (event) {
        console.log("websocket open");
        console.log(event);
        socket.send("start");
    };


    socket.onmessage = function (event) {
        const buffer = new Uint8Array(event.data);
        console.log(buffer);
        /*jmuxer.feed({
            video: new Uint8Array(buffer)
        });*/
        const byteArray = new Uint8Array(event.data);
        player.decode(byteArray);

    };
}

function jmuxerFn() {
    jmuxer = new JMuxer({
        node: 'player',
        mode: 'video',
        flushingTime: 1,
        fps: 30,
        debug: false
    });

}