require('dotenv').config();

const nodemailer = require('nodemailer');
const express = require('express');
const router = express.Router();
const User = require('../models/users');
const Verification = require('../models/verification');

//Check whether the code is correct
router.post('/', checkExpiredCode, (req, res) => {
    Verification.findOne({ type: 'forgottenPassword', email: req.body.email, code: req.body.code}, '_id', (err, doc) => {
        if(err){
            res.json(err);
        }
        if(doc == null){
            res.json({ status: 'failed', error: 'Invalid code' });
        }else{
            doc.remove();
            res.json({ status: 'success' });
        }
    })
});

router.post('/resendCode', checkExpiredCode, (req, res) => {
    User.findOne({ email: req.body.email }, '_id', (err, doc) => {
        if(err) {
            res.json(err);
        } 
        if(doc == null){
            res.json({ status: 'failed', error: 'Email is not signed up'});
        }else{
            Verification.find({ email: req.body.email, type: 'forgottenPassword' }, '_id', (err, doc) => {
                if(err) {
                    res.json(err);
                }
                if(doc != null){
                    //delete the duplicate emails
                    doc.forEach(element => {
                        element.remove();
                    });
                }

                //Create code
                let code = Math.floor(getRandom(100000, 999999));

                //Send email
                let transporter = nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                        user: process.env.SEND_EMAIL_FROM,
                        pass: process.env.SEND_EMAIL_PASSWORD
                    }
                });

                let mailOptions = {
                    from: process.env.SEND_EMAIL_FROM,
                    to: req.body.email,
                    subject: 'Gring Password Reset code',
                    text: `Your GRING password reset code is ${code}`
                };

                transporter.sendMail(mailOptions, async function(err, data) {
                    if(err){
                        console.log("Error occured", err);
                        res.status(500).json({ status: 'failed', error: 'Failed to send email. Please check your internet connection'});
                    }else{
                        console.log("Email sent!");
                        
                        // Record the new verification to the database
                        const vItem = new Verification({
                            type: 'forgottenPassword',
                            email: req.body.email,
                            code: code,
                            expire: Date.now()
                        });

                        try{
                            const newVItem = await vItem.save();
                            res.status(201).json({ status: 'success'});
                        }catch(err){
                            res.status(500).json({ status: 'failed', error: 'Failed to log email'});
                        }
                    }
                });
            });
        }
    });
});

function getRandom(min, max){
	return myMap(Math.random(), 0, 1, min, max);
}

function myMap(val, minF, maxF, minT, maxT){
	return minT + (((val - minF)/(maxF - minF)) * (maxT - minT));
}

function checkExpiredCode(req, res, next) {
    Verification.find({ }, 'expire', (err, doc) => {
        if(err) {
            res.json(err);
        }
        if(doc != null){
            //delete expired emails
            doc.forEach(element => {
                let expire = element.expire;
                let now = Date.now();
                let expirationTime = 1000 * 60 * 30;

                if(now > (expire + expirationTime)){
                    console.log("Removed expired verification item");
                    element.remove();
                }
            });
        }
    });

    next();
}

module.exports = router;