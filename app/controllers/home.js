'use strict';


const m = _require('models');
const whir = _require('library/whir');

module.exports = {

    home: (req, res) => res.sendStatus(404).end(),

    message: (socket, req) => {

        socket.on('message', data => {

            data = JSON.parse(data.toString('utf8'));
            whir.broadcast(req.app.locals.wss.clients,
                socket.whir.session,
                {
                    channel: data.channel,
                    user: data.user,
                    message: data.message
                });
        });

        socket.on('close', () => {

            if (!socket.connectedChannel) {
                return;
            }

            m.channel.findOneAndUpdate({ name: socket.whir.channel }, {
                    $pull: {
                        connectedUsers: {
                            user: socket.whir.user
                        }
                    }
                })
                .exec()
                .then(() => {
                    whir.broadcast(req.app.locals.wss.clients, socket.whir.session, {
                        user: 'whir',
                        channel: socket.whir.channel,
                        message: `_${socket.whir.user}_ has left the channel!`
                    });
                });
        });
    }
};
