const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8080 });

let drawingHistory = []; 

wss.on('connection', (ws) => {
    console.log('New client connected');

    // ���������� ����� ��������� ��� ��������� ������ �볺���
    ws.send(JSON.stringify({ type: 'history', history: drawingHistory }));

    ws.on('message', (message) => {
        const data = JSON.parse(message);

        if (data.type === 'draw') {
            drawingHistory.push(data); 
            broadcast(data); 
        } else if (data.type === 'clear') {
            drawingHistory = []; 
            broadcast({ type: 'clear' }); 
        } else if (data.type === 'getHistory') {
            // ��������� ������ ��� �����
            ws.send(JSON.stringify({ type: 'history', history: drawingHistory }));
        }
    });

    ws.on('close', () => {
        console.log('Client disconnected');
    });
});

// ������� ��� ���������� ����� ��� �볺����
function broadcast(data) {
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(data));
        }
    });
}
