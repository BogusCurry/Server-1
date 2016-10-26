'use strict';


const m = _require('models');

module.exports = {

    run: (whir, socket, input) => {

        const data = {};
        data.channel = socket.whir.channel;
        input = input.match(/^\/([\w]+)\s?(.*)?/);
        switch (input[1]) {
            case 'help':
                data.message = 'Commands';
                data.payload = {
                    items: {
                        '/find': { type: 'string', value: '/find [starts with ...]' },
                        '/desc': { type: 'string', value: '/desc [channel description]' },
                        '/max': { type: 'string', value: '/max 50' },
                        '/kick': { type: 'string', value: '/kick [username]' },
                        '/ban': { type: 'string', value: '/ban [username]' },
                        '/purge': { type: 'string', value: '/purge [minutes]' },
                        '/private': { type: 'string', value: '/private [password]' },
                        '/public': { type: 'string', value: '' },
                        '/info': { type: 'string', value: '' },
                        '/mute': { type: 'string', value: '' },
                        '/unmute': { type: 'string', value: '' },
                        '/exit': { type: 'string', value: '' }
                    }
                };
                whir.send(socket, data);
                break;

            case 'find':
                m.channel.findOne({ name: socket.whir.channel })
                    .lean()
                    .exec()
                    .then(channel => {
                        let users = channel.connectedUsers.filter(item => item.user.indexOf(input[2]) >= 0);
                        data.message = `Found ${users.length} matching users.`;
                        data.payload = {
                            items: {}
                        };

                        users.forEach(user => {
                            data.payload.items[user.user] = { type: 'date', value: user.meta.joinedOn };
                        });

                        whir.send(socket, data);
                    });
                break;

            case 'desc':
                m.channel.findOneAndUpdate({
                        name: socket.whir.channel,
                        'meta.owner': socket.whir.session
                    },
                    { description: input[2] })
                    .lean()
                    .exec()
                    .then(channel => {
                        if (!channel) {
                            data.message = 'You can\'t update this channel\'s description.';
                            return whir.send(socket, data);
                        }

                        data.message = 'Channel description has been set.';
                        whir.send(socket, data);
                    });
                break;

            case 'max':
                m.channel.findOneAndUpdate({
                        name: socket.whir.channel,
                        'meta.owner': socket.whir.session
                    },
                    { maxUsers: parseInt(input[2], 10) })
                    .lean()
                    .exec()
                    .then(channel => {
                        if (!channel) {
                            data.message = 'You can\'t update this channel\'s max. users.';
                            return whir.send(socket, data);
                        }

                        data.message = 'Channel max. users has been set.';
                        whir.send(socket, data);
                    });
                break;

            case 'info':
                m.channel.findOne({ name: socket.whir.channel })
                    .lean()
                    .exec()
                    .then(channel => {
                        data.message = 'Channel';
                        data.payload = {
                            pad: false,
                            items: {
                                'Name:': { type: 'string', value: channel.name },
                                'Description:': { type: 'string', value: channel.description },
                                'Users online:': { type: 'number', value: channel.connectedUsers.length },
                                'Max. users:': { type: 'number', value: channel.maxUsers },
                                'Online since:': { type: 'date', value: channel.meta.createdOn }
                            }
                        };
                        whir.send(socket, data);
                    });
                break;
        }
    }
};
