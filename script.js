const socket = new WebSocket('ws://localhost:8080');

const canvas = document.getElementById('drawingCanvas');
const ctx = canvas.getContext('2d');
const colorPicker = document.getElementById('colorPicker');
const brushBtn = document.getElementById('brushBtn');
const eraserBtn = document.getElementById('eraserBtn');
const clearBtn = document.getElementById('clearBtn');

ctx.strokeStyle = '#000000';
ctx.lineWidth = 5;

let isDrawing = false;
let lastX = 0;
let lastY = 0;
let tool = 'brush';
let drawingHistory = [];


brushBtn.addEventListener('click', () => {
    tool = 'brush';
    ctx.strokeStyle = colorPicker.value;
    ctx.lineWidth = 5;
});

eraserBtn.addEventListener('click', () => {
    tool = 'eraser';
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 20;
});

colorPicker.addEventListener('input', () => {
    if (tool === 'brush') {
        ctx.strokeStyle = colorPicker.value;
    }
});

function sendDrawingData(data) {
    if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify(data));
    }
}

// Обробка вхідних повідомлень
socket.onmessage = (event) => {
    const receivedData = JSON.parse(event.data);

    if (receivedData.type === 'clear') {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawingHistory = [];
    } else if (receivedData.type === 'draw') {
        drawFromSocket(receivedData);
        drawingHistory.push(receivedData);
    } else if (receivedData.type === 'history') {
        receivedData.history.forEach((data) => drawFromSocket(data));
        drawingHistory = receivedData.history;
    }
};

// Малювання ліній
canvas.addEventListener('mousedown', (e) => {
    isDrawing = true;
    [lastX, lastY] = [e.offsetX, e.offsetY];
});

canvas.addEventListener('mousemove', (e) => {
    if (!isDrawing) return;

    const drawingData = {
        type: 'draw',
        lastX, lastY,
        x: e.offsetX,
        y: e.offsetY,
        color: ctx.strokeStyle,
        lineWidth: ctx.lineWidth,
        tool
    };

    drawLine(drawingData);
    sendDrawingData(drawingData);

    [lastX, lastY] = [e.offsetX, e.offsetY];
});

canvas.addEventListener('mouseup', () => {
    isDrawing = false;
});

canvas.addEventListener('mouseout', () => {
    isDrawing = false;
});

function drawLine(data) {
    ctx.beginPath();
    ctx.moveTo(data.lastX, data.lastY);
    ctx.lineTo(data.x, data.y);
    ctx.strokeStyle = data.color;
    ctx.lineWidth = data.lineWidth;
    ctx.stroke();
    ctx.closePath();
}

function drawFromSocket(data) {
    drawLine(data);
}

clearBtn.addEventListener('click', () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    sendDrawingData({ type: 'clear' });
});
