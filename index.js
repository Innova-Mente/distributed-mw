import { WebSocketServer, WebSocket } from 'ws';

const topicsClients = {};
const server = new WebSocketServer({ port: 20000 });

const handleSubscribeMessage = (client, topic) => {
    console.log(`[SUBSCRIBE]\t [TOPIC: ${topic}]`);

    // if it's a new topic create an empty list to store the clients subscribed to it
    if (!topicsClients[topic]) {
        topicsClients[topic] = [];
    }

    // add the client to the list of clients subscribed to that topic
    if (!topicsClients[topic].includes(client)) {
        topicsClients[topic].push(client);
    }

    // when the client closes the connection, remove it from the topic list
    client.on('close', () => {
        // checks that the topic still exists
        if (!topicsClients[topic]) return;

        topicsClients[topic] = topicsClients[topic].filter(c => c !== client);

        // delete the topic if there are no clients connected to it
        if (topicsClients[topic].length === 0) {
            delete topicsClients[topic];
        }
    });
}

const handlePublishMessage = (payload, topic) => {
    console.log(`[PUBLISH]\t [TOPIC: ${topic}]\t payload:`, JSON.stringify(payload));

    const message = JSON.stringify({
        topic,
        payload
    });

    // send message to all the clients subscribed to the topic
    topicsClients[topic]?.filter(client => client.readyState === WebSocket.OPEN).forEach(client => client.send(message));
}

server.on('connection', (client) => {
    client.on('message', (rawMessage) => {
        const message = JSON.parse(rawMessage);
        const { type, topic } = message;

        switch (type) {
            case 'subscribe':
                handleSubscribeMessage(client, topic);
                break;
            case 'publish':
                handlePublishMessage(message.payload, topic);
                break;
            default:
                console.log('Unknown message type');
                break;
        }
    });
});
