import { WebSocketServer, WebSocket } from 'ws';
import express from 'express';
import http from 'http';

const topicsClients = {};
const logs = [];
const server = new WebSocketServer({ port: 20000 });

const logMessage = (type, topic, ipAddress, payload) => {
    console.log(`[TYPE: ${type}]\t [IP ADDRESS: ${ipAddress}]\t [TOPIC: ${topic}]\t payload:${JSON.stringify(payload)}`);

    logs.unshift({
        timestamp: new Date(),
        type,
        ipAddress,
        topic,
        payload
    });
    if (logs.length > 100) logs.pop();
}

const handleSubscribeMessage = (topic, ipAddress, payload, client) => {
    logMessage("subscribe", topic, ipAddress, payload);

    // if it's a new topic create an empty list to store the clients subscribed to it
    if (!topicsClients[topic]) {
        topicsClients[topic] = [];
    }

    // add the client to the list of clients subscribed to that topic
    if (!topicsClients[topic].includes(client)) {
        client.name = payload.clientName;
        client.ipAddress = ipAddress;
        topicsClients[topic].push(client);
    }

    // when the client closes the connection, remove it from the topic list
    client.on('close', () => {
        logMessage("unsubscribe", topic, ipAddress, payload);

        // checks that the topic still exists
        if (!topicsClients[topic]) return;

        topicsClients[topic] = topicsClients[topic].filter(c => c !== client);

        // delete the topic if there are no clients connected to it
        if (topicsClients[topic].length === 0) {
            delete topicsClients[topic];
        }
    });
}

const handlePublishMessage = (topic, ipAddress, payload) => {
    logMessage("publish", topic, ipAddress, payload);

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
        let ipAddress = req.socket.remoteAddress.replace("::ffff:", "");
        if (ipAddress === "::1") ipAddress = "localhost";

        switch (type) {
            case 'subscribe':
                handleSubscribeMessage(topic, ipAddress, payload, client);
                break;
            case 'publish':
                handlePublishMessage(topic, ipAddress, payload);
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
