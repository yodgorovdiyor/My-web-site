// Gerekli modullarni import qilish
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const path = require('path'); // Fayl yo'llarini boshqarish uchun

// .env faylidan muhit o'zgaruvchilarini yuklash
// server.js fayli 'files' papkasida joylashganligi sababli,
// .env ham shu papkada bo'lsa, __dirname + '/.env' yo'li to'g'ri bo'ladi.
require('dotenv').config({ path: path.join(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 3000; // Render o'z portini beradi, agar bo'lmasa 3000

// Middleware'lar
app.use(express.json()); // JSON formatidagi so'rov tanasini parslash uchun

// CORS sozlamalari
// Frontend domeningizni bu yerga kiriting.
// Agar frontend va backend bir xil Render loyihasida bo'lsa,
// sizning saytingizning asosiy URL manzili: https://my-web-site-mudp.onrender.com
app.use(cors({
    origin: 'https://my-web-site-mudp.onrender.com' // Frontend domeningizni kiriting
}));

// Statik fayllarni taqdim etish
// Bu Node.js serveri orqali index.html va music.m4a kabi fayllarni taqdim etadi.
// Loyihaning ildiz katalogini statik fayllar uchun belgilash
// __dirname hozirda 'files' papkasini bildiradi, shuning uchun '..' bilan bir qadam orqaga qaytamiz.
app.use(express.static(path.join(__dirname, '..')));

// 'files' papkasidagi resurslarga '/files' yo'li orqali kirish imkonini berish
// Masalan, 'files/music.m4a' ga 'https://your-domain.onrender.com/files/music.m4a' orqali kirish mumkin
app.use('/files', express.static(path.join(__dirname, '')));

// Asosiy sahifani taqdim etish (index.html)
// Agar foydalanuvchi ildiz URL ga kirsa, index.html ni yuborish
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'index.html'));
});

// Elektron pochta yuborish uchun API yo'li
app.post('/send-email', async (req, res) => {
    const { name, email, message } = req.body;

    // Nodemailer transporter'ini sozlash
    const transporter = nodemailer.createTransport({
        service: 'gmail', // Gmail xizmatidan foydalanish
        auth: {
            user: process.env.EMAIL_USER, // .env faylidan olingan Gmail manzili
            pass: process.env.EMAIL_PASS  // .env faylidan olingan Gmail ilova paroli
        }
    });

    // Elektron pochta variantlari
    const mailOptions = {
        from: process.env.EMAIL_USER, // Yuboruvchi manzili
        to: process.env.EMAIL_USER,   // Xabar keladigan manzil (o'zingizning manzilingiz)
        subject: `Yangi xabar: ${name} dan`, // Xabar mavzusi
        html: `
            <p><strong>Ism:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Xabar:</strong> ${message}</p>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Email muvaffaqiyatli yuborildi!');
        res.status(200).json({ message: 'Xabar muvaffaqiyatli yuborildi!' });
    } catch (error) {
        console.error('Email yuborishda xato:', error);
        res.status(500).json({ message: 'Xabar yuborishda xato yuz berdi.', error: error.message });
    }
});

// Serverni ishga tushirish
app.listen(PORT, () => {
    console.log(`Server ${PORT} portida ishga tushdi`);
    console.log(`Frontend URL: https://my-web-site-mudp.onrender.com`); // Saytingizning asosiy URL manzili
});
