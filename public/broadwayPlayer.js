

function load() {
    var player = null;
    player = new Player({
        useWorker: true,
        workerFile: "/Broadway/Decoder.js"
    });
    const desktopArea = document.getElementById("desktopArea");
    desktopArea.appendChild(player.canvas);
    addInputEventHandler(desktopArea.querySelector("canvas"));
    startWebsocket(player.decode);

}
