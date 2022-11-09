
const connectedPorts = [];
let socket = null;
function connectSocket(obj) {
    let url = `wss://api.shoonya.com/NorenWSTP/${obj.susertoken}`;
    // Create socket instance.
    socket = new WebSocket(url);

    // Send initial package on open.
    socket.addEventListener('open', () => {
        let wsValues = JSON.stringify(obj);
        socket.send(wsValues);
        setInterval(function () {
            if (socket.readyState === 1) {
                socket.send(`{"t":"h"}`);
            } else {
                connectedPorts.forEach(port => port.postMessage('WS Disconnected'));
            }
        }, 4000);
    });

    // Send data from socket to all open tabs.
    socket.addEventListener('message', ({ data }) => {
        const package = JSON.parse(data);
        connectedPorts.forEach(port => port.postMessage(package));
    });
}

// ws timer
/**
 * When a new thread is connected to the shared worker,
 * start listening for messages from the new thread.
 */
self.addEventListener('connect', ({ ports }) => {
    const port = ports[0];

    // Add this new port to the list of connected ports.
    connectedPorts.push(port);

    /**
     * Receive data from main thread and determine which
     * actions it should take based on the received data.
     */
    port.addEventListener('message', ({ data }) => {
        const { action, value } = data;

        // Send message to socket.
        if (action === 'send') {
            socket.send(value);
            //console.log('ok');
            // Remove port from connected ports list.
        } else if (action === 'unload') {
            const index = connectedPorts.indexOf(port);
            connectedPorts.splice(index, 1);
        } else if (action === 'connect') {
            if (socket == null) {
                connectSocket(value);
            } else {
                console.log('already connected');
            }
        }
    });

    // Start the port broadcasting.
    port.start();
});