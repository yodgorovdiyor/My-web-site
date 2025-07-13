// server.js
// Kerakli modullarni import qilish
require('dotenv').config(); // .env faylidan muhit o'zgaruvchilarini yuklash uchun
const express = require('express'); // Veb-server yaratish uchun Express freymvorki
const nodemailer = require('nodemailer'); // Elektron pochta yuborish uchun Nodemailer kutubxonasi
const cors = require('cors'); // CORS (Cross-Origin Resource Sharing) muammolarini hal qilish uchun

// Express ilovasini yaratish
const app = express();
const PORT = process.env.PORT || 3000; // Server portini belgilash, agar muhit o'zgaruvchisi bo'lmasa, 3000

// Middleware sozlamalari
// Barcha kelib tushgan so'rovlar uchun CORSni yoqish.
// Bu sizning frontendingiz (veb-saytingiz) boshqa domenda bo'lsa, so'rov yuborishiga imkon beradi.
app.use(cors());
// JSON formatidagi so'rov tanasini tahlil qilish uchun Express.json() middleware'ini yoqish
app.use(express.json());

// Elektron pochta yuborish uchun Nodemailer transporter sozlamalari
// Bu yerda sizning elektron pochta xizmatingiz (masalan, Gmail) ma'lumotlari bo'ladi.
// DIQQAT: Gmail uchun sizga "App Passwords" (Ilova parollari) yaratishingiz kerak bo'ladi,
// agar sizda ikki faktorli autentifikatsiya yoqilgan bo'lsa.
// Oddiy Gmail parolini ishlatish xavfsiz emas va Google tomonidan bloklanishi mumkin.
const transporter = nodemailer.createTransport({
    service: 'gmail', // Agar boshqa xizmat bo'lsa, uni o'zgartiring (masalan, 'Outlook', 'Yahoo')
    auth: {
        user: process.env.EMAIL_USER, // .env faylidan olingan elektron pochta manzili
        pass: process.env.EMAIL_PASS  // .env faylidan olingan parol yoki ilova paroli
    }
});

// Kontakt shakli ma'lumotlarini qabul qilish uchun POST endpoint yaratish
app.post('/send-email', async (req, res) => {
    // So'rov tanasidan ism, elektron pochta va xabar ma'lumotlarini olish
    const { name, email, message } = req.body;

    // Ma'lumotlarni tekshirish: barcha maydonlar to'ldirilganligiga ishonch hosil qilish
    if (!name || !email || !message) {
        // Agar biron bir maydon bo'sh bo'lsa, 400 Bad Request javobini qaytarish
        return res.status(400).json({ success: false, message: 'Iltimos, barcha maydonlarni to\'ldiring.' });
    }

    try {
        // Elektron pochta xabarini sozlash
        const mailOptions = {
            from: process.env.EMAIL_USER, // Xabar yuboruvchi elektron pochta manzili (sizning Gmailingiz)
            to: 'diyoryodgorov2007@gmail.com', // Xabar qabul qiluvchi elektron pochta manzili (Diyorning Gmaili)
            subject: `Veb-saytdan yangi xabar: ${name}`, // Elektron pochta mavzusi
            html: `
                <p><b>Ism:</b> ${name}</p>
                <p><b>Elektron pochta:</b> ${email}</p>
                <p><b>Xabar:</b></p>
                <p>${message}</p>
            `
        };

        // Elektron pochtani yuborish
        await transporter.sendMail(mailOptions);
        console.log('Elektron pochta muvaffaqiyatli yuborildi!'); // Server konsoliga xabar chiqarish
        // Muvaffaqiyatli javobni frontendga qaytarish
        res.status(200).json({ success: true, message: 'Xabaringiz muvaffaqiyatli yuborildi!' });

    } catch (error) {
        // Xato yuz berganda xatoni konsolga chiqarish
        // Nodemailer xatosini aniqroq ko'rsatish uchun error.message ishlatiladi
        console.error('Elektron pochta yuborishda xato:', error.message);
        // Xato javobini frontendga qaytarish
        res.status(500).json({ success: false, message: `Xabar yuborishda xato yuz berdi: ${error.message}` });
    }
});

// Serverni belgilangan portda ishga tushirish
app.listen(PORT, () => {
    console.log(`Server http://localhost:${PORT} portida ishlamoqda`);
});
