'use strict';


const whir = _require('library/whir');
const commander = _require('library/commander');
const m = _require('models').schemas;

module.exports = {

    message: (socket, req) => {

        socket.on('message', data => {

            data = JSON.parse(data.toString('utf8'));
            if (data.message.match(/^\/[\w]/)) {
                return commander.run.bind(this, whir)(socket, data.message);
            }

            whir.broadcast(req.app.locals.wss.clients, {
                channel: socket.whir.channel,
                user: data.user,
                message: data.message
            }, socket);
        });

        socket.on('close', () => {
            if (!socket.whir) {
                return;
            }

            m.channel.findOneAndUpdate({ name: socket.whir.channel }, {
                    $pull: { connectedUsers: { user: socket.whir.user } }
                })
                .exec()
                .then(() => {
                    whir.broadcast(req.app.locals.wss.clients, {
                        channel: socket.whir.channel,
                        user: socket.whir.user,
                        message: '-I left the channel.-',
                        action: 'leave'
                    }, socket);
                });
        });
    }
};
