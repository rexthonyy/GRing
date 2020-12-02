const express = require('express');
const User = require('../models/users');

const router = express.Router();

router.post('/', (req, res) => {
    let username = req.body.username;
    let email = req.body.email;
    let password = req.body.password;
    let displayName = req.body.displayName;
    let displayImageLink = "";
    let description = "Hello there, I am using Gring to connect with the people that I care about.";

    User.findOne({ $or: [{ email: email }, { username: username }] }, '_id', async (err, doc) => {
        if(err) {
            res.json(err);
        } 
        if(doc != null){
            res.json({ status: 'failed', error: 'Username is already taken' });
        }else{
            const user = new User({
                username: username,
                email: email,
                password: password,
                displayName: displayName,
                displayImageLink: displayImageLink,
                description: description
            });

            try{
                const newUser = await user.save();
                res.status(201).json({ status: 'success', id: newUser._id });
            }catch(err){
                res.status(400).json({ status: 'failed', error: err });
            }
        }
    });
});

module.exports = router;