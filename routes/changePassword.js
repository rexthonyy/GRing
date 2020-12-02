const express = require('express');
const router = express.Router();
const User = require('../models/users');

router.post('/', (req, res) => {
    let email = req.body.email;
    let password = req.body.password;

    User.findOne({ email: email }, 'password', async (err, doc) => {
        if(err) {
            res.json(err);
        } 
        if(doc == null){
            res.json({ status: 'failed', error: 'Email is not signed up'});
        }else{
            doc.password = password;

            try{
                await doc.save();
                res.json({ status: 'success' });
            }catch(err){
                res.status(400).json({ status: 'failed', error: 'Failed to update password'});
            }
        }
    });
});

module.exports = router;