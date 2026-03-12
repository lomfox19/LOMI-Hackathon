// Quick diagnostic test for backend
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
require('dotenv').config();

console.log('🔍 Testing Backend Configuration...\n');

// Test 1: Environment Variables
console.log('1. Environment Variables:');
console.log('   PORT:', process.env.PORT || '❌ Not set');
console.log('   MONGODB_URI:', process.env.MONGODB_URI ? '✅ Set' : '❌ Not set');
console.log('   EMAIL_USER:', process.env.EMAIL_USER ? '✅ Set' : '❌ Not set');
console.log('   EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD ? '✅ Set (length:', process.env.EMAIL_PASSWORD?.length || 0, ')' : '❌ Not set');
console.log('   RECAPTCHA_SECRET_KEY:', process.env.RECAPTCHA_SECRET_KEY ? '✅ Set' : '❌ Not set');
console.log('');

// Test 2: MongoDB Connection
console.log('2. Testing MongoDB Connection...');
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/myapp')
    .then(() => {
        console.log('   ✅ MongoDB Connected Successfully!');
        mongoose.connection.close();
        testEmail();
    })
    .catch((err) => {
        console.error('   ❌ MongoDB Connection Failed:', err.message);
        process.exit(1);
    });

// Test 3: Email Configuration
function testEmail() {
    console.log('');
    console.log('3. Testing Email Configuration...');

    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: process.env.EMAIL_PORT || 587,
        secure: false,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
        }
    });

    transporter.verify((error, success) => {
        if (error) {
            console.error('   ❌ Email Configuration Failed:', error.message);
        } else {
            console.log('   ✅ Email Configuration Valid!');
        }

        console.log('');
        console.log('✅ Diagnostics Complete!');
        process.exit(0);
    });
}
