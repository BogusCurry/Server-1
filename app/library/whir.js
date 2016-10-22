'use strict';


const send = (socket, data) => {
    if (data.close) {
        return socket.close(1011, data.message);
    }

    socket.send(JSON.stringify(data), { binary: true, mask: true });
};

module.exports = {

    send: send,

    broadcast: (clients, session, data) => {

        for (let socket of clients) {
            if (socket.connectedChannel === data.channel && socket.connectedSession !== session) {
                send(socket, data);
            }
        }
    }
};