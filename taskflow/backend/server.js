const dotenv = require('dotenv');
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const http = require("http");
const { Server } = require('socket.io');

dotenv.config();
connectDB();

const app = express();

const cookieParser = require('cookie-parser');

app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

io.on('connection', (socket) => {
    console.log(`Có người kết nối: ${socket.id}`);

    socket.on('disconnect', () => {
        console.log(`Người dùng ngắt kết nối: ${socket.id}`);
    });
});

app.get('/api/hello', (req, res) => {
    res.json({ message: "Backend đã lên sóng, chào fen!" });
});

const authRoutes = require('./routes/authRoutes');
const projectRoutes = require('./routes/projectRoutes');

app.use((req, res, next) => {
    req.io = io
    next();
})

app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server + Socket.IO đang chạy trên cổng ${PORT}`));