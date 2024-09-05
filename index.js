import { WebSocketServer, WebSocket } from 'ws';
import express from 'express';
import http from 'http';

const topicsClients = {};
const logs = [];
const server = new WebSocketServer({ port: 20000 });

const logMessage = (type, topic, payload) => {
    console.log(`[TYPE: ${type}]\t [TOPIC: ${topic}]\t payload:${JSON.stringify(payload)}`);

    logs.push({
        timestamp: new Date(),
        type,
        topic,
        payload
    });
    if (logs.length > 100) logs.shift();
}

const handleSubscribeMessage = (topic, client, payload) => {
    logMessage("subscribe", topic, payload);

    // if it's a new topic create an empty list to store the clients subscribed to it
    if (!topicsClients[topic]) {
        topicsClients[topic] = [];
    }

    // add the client to the list of clients subscribed to that topic
    if (!topicsClients[topic].includes(client)) {
        client.name = payload.clientName;
        client.ipAddress = payload.ipAddress;
        topicsClients[topic].push(client);
    }

    // when the client closes the connection, remove it from the topic list
    client.on('close', () => {
        logMessage("unsubscribe", topic, payload);

        // checks that the topic still exists
        if (!topicsClients[topic]) return;

        topicsClients[topic] = topicsClients[topic].filter(c => c !== client);

        // delete the topic if there are no clients connected to it
        if (topicsClients[topic].length === 0) {
            delete topicsClients[topic];
        }
    });
}

const handlePublishMessage = (topic, payload) => {
    logMessage("publish", topic, payload);

    const message = JSON.stringify({
        topic,
        payload
    });

    // send message to all the clients subscribed to the topic
    topicsClients[topic]?.filter(client => client.readyState === WebSocket.OPEN).forEach(client => client.send(message));
}

server.on('connection', (client, req) => {
    client.on('message', (rawMessage) => {
        const message = JSON.parse(rawMessage);
        const { type, topic, payload } = message;

        switch (type) {
            case 'subscribe':
                payload.ipAddress = req.socket.remoteAddress.replace("::ffff:", "");
                if (payload.ipAddress === "::1") payload.ipAddress = "localhost";
                handleSubscribeMessage(topic, client, payload);
                break;
            case 'publish':
                handlePublishMessage(topic, payload);
                break;
            default:
                logMessage("error", "unknown message type", "");
                break;
        }
    });
});

const webServer = express();

webServer.use(express.static('public'));

webServer.get('/api/topicsClients', (_, res) => {
    res.json(topicsClients);
});

webServer.get('/api/logs', (_, res) => {
    res.json(logs);
});

http.createServer(webServer).listen(80);
