const express = require('express');
const multer = require('multer');
const path = require('path');
const User = require('../models/users');
const fs = require('fs');

const router = express.Router();

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'public/images/pics/');
    },
    filename: function(req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: {fileSize: 1024 * 1024 * 2},
    fileFilter: function(req, file, cb){
        checkFileType(file, cb);
    }
}).single('userImage');

function checkFileType(file, cb){
    const fileTypes = /jpeg|jpg|png|gif/;
    const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
    if(extname){
        cb(null, true);
    }else{
        cb("Error : Images only");
    }
}

router.post('/', (req, res) => {
    upload(req, res, async (err) => {
        if(err){
            res.json({ status: 'failed', error: err });
        }else{

            let userId = req.body.userId;
            console.log(`user id : ${userId}`);
            let displayImageLink = "";

            if(req.file !== undefined){
                displayImageLink = (req.file.destination + req.file.filename).slice(7);
            }

            User.findOne({ _id: userId }, 'displayImageLink', (err, doc) => {
                if(err) {
                    res.json(err);
                } 
                if(doc == null){
                    res.json({ status: 'failed', error: 'User id not found'});
                }else{
                    //delete the previous image before updating it to the current one
                    let prevDisplayImageLink = doc.displayImageLink;
                    //delete it
                    fs.unlink(prevDisplayImageLink, async (err) => {
                        if(err) console.log(err);
                        //update it
                        doc.displayImageLink = displayImageLink;
            
                        try{
                            await doc.save();
                            res.json({ status: 'success' });
                        }catch(err){
                            res.status(400).json({ status: 'failed', error: 'Failed to update user image link'});
                        }
                    });
                }
            });
        }
    });
});

module.exports = router;