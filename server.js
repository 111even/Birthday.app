const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cron = require('node-cron');
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

mongoose.connect('mongodb://localhost:27017/birthdayDB');

const userSchema = new mongoose.Schema({
    username: String,
    email: String,
    dateOfBirth: Date,
});

const User = mongoose.model('User', userSchema);

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

app.post('/addUser', async (req, res) => {
    const newUser = new User({
        username: req.body.username,
        email: req.body.email,
        dateOfBirth: req.body.dateOfBirth,
    });

    try {
        await newUser.save();
        res.send('User added successfully!');
    } catch (err) {
        res.send(err);
    }
});

cron.schedule('0 7 * * *', () => { // Every da
    User.find({}, (err, users) => {
        if (err) {
            console.log(err);
        } else {
            const today = new Date();
            const todayMonthDay = `${today.getMonth() + 1}-${today.getDate()}`;

            users.forEach((user) => {
                const userMonthDay = `${user.dateOfBirth.getMonth() + 1}-${user.dateOfBirth.getDate()}`;
                if (userMonthDay === todayMonthDay) {
                    sendBirthdayEmail(user);
                }
            });
        }
    });
});

function sendBirthdayEmail(user) {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL,
            pass: process.env.EMAIL_PASSWORD,
        },
    });

    const mailOptions = {
        from: process.env.EMAIL,
        to: user.email,
        subject: 'Happy Birthday!',
        text: `Dear ${user.username},\n\nWishing you a very Happy Birthday!\n\nBest regards,\nYour Company`,
    };

    transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
            console.log(err);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
}

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
