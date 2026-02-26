const express = require('express');
const app = express();
const http = require('http').createServer(app);
// Настраиваем Socket.io с увеличенным лимитом данных (до 20Мб)
const io = require('socket.io')(http, {
    maxHttpBufferSize: 2e7 // 20 MB
});
const path = require('path');

// Увеличиваем лимиты для самого Express
app.use(express.json({limit: '20mb'}));
app.use(express.urlencoded({limit: '20mb', extended: true}));

app.use(express.static(__dirname));

// --- ИСТОРИЯ СООБЩЕНИЙ ---
let messageHistory = [];

io.on('connection', (socket) => {
    console.log('Пользователь подключился');

    // Когда кто-то заходит, сразу отдаем ему все старые сообщения
    socket.emit('load history', messageHistory);

    socket.on('chat message', (data) => {
        // Сохраняем сообщение в историю на сервере
        messageHistory.push(data);
        
        // Ограничим историю (например, последние 100 постов), чтобы не перегружать память
        if (messageHistory.length > 100) messageHistory.shift();

        // Рассылаем всем
        io.emit('chat message', data);
    });
});

// Хостинг сам подставит нужный порт в process.env.PORT
const PORT = process.env.PORT || 3000; 

server.listen(PORT, '0.0.0.0', () => {
    console.log(`Сервер работает на порту ${PORT}`);
});