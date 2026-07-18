// server.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
require('dotenv').config();

// تهيئة تطبيق Express
const app = express();
const server = http.createServer(app);

// تهيئة Socket.io للتتبع اللحظي (الرادار)
const io = new Server(server, {
    cors: {
        origin: "*", // السماح للتطبيقات بالاتصال من أي مكان
        methods: ["GET", "POST"]
    }
});

// إعدادات الحماية والـ Middleware
app.use(cors());
app.use(express.json()); // لتمكين قراءة البيانات بصيغة JSON

// ==========================================
// 1. مسارات الـ API (نقاط الاتصال)
// ==========================================

// مسار فحص حالة السيرفر
app.get('/api/health', (req, res) => {
    res.status(200).json({ 
        status: 'success', 
        message: 'سيرفر واجيك يعمل بنجاح! 🚀',
        timestamp: new Date()
    });
});

// هنا سنقوم لاحقاً بربط باقي المسارات مثل:
// app.use('/api/auth', authRoutes);
// app.use('/api/orders', orderRoutes);
// app.use('/api/drivers', driverRoutes);


// ==========================================
// 2. نظام التتبع اللحظي (WebSockets)
// ==========================================
io.on('connection', (socket) => {
    console.log(`تم اتصال جهاز جديد: ${socket.id}`);

    // عندما يقوم الكابتن بتحديث موقعه (GPS)
    socket.on('update_driver_location', (data) => {
        // data: { driver_id: 1, lat: 12.8286, lng: 45.0163 }
        
        // بث الموقع فوراً لغرفة "العميل" و "برج المراقبة"
        io.emit('driver_location_changed', data);
    });

    // عند فصل الاتصال
    socket.on('disconnect', () => {
        console.log(`تم قطع اتصال الجهاز: ${socket.id}`);
    });
});

// ==========================================
// 3. تشغيل السيرفر
// ==========================================
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`
    ======================================
    🚀 سيرفر "واجيك" يعمل على المنفذ: ${PORT}
    📡 نظام التتبع اللحظي (Socket.io): مُفعل
    ======================================
    `);
});
