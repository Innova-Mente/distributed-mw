async function fetchTopicsData() {
    const response = await fetch('/api/topicsClients');
    return await response.json();
}

async function fetchLogs() {
    const response = await fetch('/api/logs');
    return await response.json();
}

async function displayTopicsData() {
    const topics = await fetchTopicsData();
    const clientNames = [];

    const container = document.getElementById('topicsClientsContainer');
    container.innerHTML = topics.length ? 'Non sono presenti canali di informazione.' : '';

    for (const topic in topics) {
        const clientsContainer = document.createElement('ul');

        topics[topic].forEach(client => {
            if (!clientNames.includes(client.name)) clientNames.push(client.name);

            const clientElement = document.createElement('li');
            clientElement.innerHTML = `${client.name} (${client.ipAddress})`;
            clientsContainer.appendChild(clientElement);
        });

        const topicContainer = document.createElement('li');
        let topicDescription = "canale di ";
        if (topic.includes("-in")) {
            topicDescription += `input a ${topic.replace("-in", "")}`;
        } else if (topic.includes("-out")) {
            topicDescription += `output da ${topic.replace("-out", "")}`;
        }
        topicContainer.innerHTML = `<strong>${topic}</strong> (${topicDescription}):${clientsContainer.outerHTML}`;
        container.appendChild(topicContainer);
    }

    const microMondiCount = clientNames.filter(name => name.startsWith('MicroMondo')).length;
    let microMondiText = `In questo momento sono in esecuzione <strong>${microMondiCount}</strong> MicroMondi.`;
    if (microMondiCount === 0) microMondiText = "In questo momento non ci sono MicroMondi in esecuzione.";
    if (microMondiCount === 1) microMondiText = "In questo momento è in esecuzione un solo MicroMondo.";
    document.getElementById('microMondiText').innerHTML = microMondiText;
}

async function displayLogs() {
    const logs = await fetchLogs();

    const logsTableBody = document.getElementById('logsTableBody');
    logsTableBody.innerHTML = '';

    logs.forEach(log => {
        const row = document.createElement('tr');
        const timestampCell = document.createElement('td');
        const typeCell = document.createElement('td');
        const ipAddressCell = document.createElement('td');
        const topicCell = document.createElement('td');
        const payloadCell = document.createElement('td');

        timestampCell.textContent = new Date(log.timestamp).toLocaleString();
        typeCell.textContent = log.type;
        ipAddressCell.textContent = log.ipAddress;
        topicCell.textContent = log.topic;
        payloadCell.textContent = JSON.stringify(log.payload);
        if (log.type === "error") {
            row.style.backgroundColor = "orange";
        }

        row.appendChild(timestampCell);
        row.appendChild(typeCell);
        row.appendChild(ipAddressCell);
        row.appendChild(topicCell);
        row.appendChild(payloadCell);
        logsTableBody.appendChild(row);
    });
}