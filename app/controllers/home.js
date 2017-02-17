'use strict';


const [
    models,
    whir,
    commander
] = attract('models', 'library/whir', 'library/commander');
const m = models.schemas;

module.exports = {

    home: (req, res) => res.sendStatus(404).end(),

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
                        message: '_:user:_ has left the channel!',
                        action: {
                            method: 'leave',
                            user: socket.whir.user
                        }
                    }, socket);
                });
        });
    }
};
