const express = require("express");
const router = express.Router();
const User = require('../models/users');
const Contact = require('../models/contacts');

router.post('/getRecentlyContacted', (req, res) => {
    getContacts(req, res);
});

router.post('/getContacts', (req, res) => {
    getContacts(req, res);
});

// router.get('/getContacts', (req, res) => {
//     getContacts(req, res);
// });

function getContacts(req, res){
    let userId = req.body.userId;
    let tabIndex = req.body.index;

    Contact.find({ userId: userId }, 'contactId', (err, doc) => {
        if(err) {
            res.json({ status: 'failed', error: err });
        } 
        if(doc == null){
            res.status(404).json({ status: 'failed', error: 'contact not found'});
        }else{
            let contactsArray = [];
            doc.forEach(element => {
                let contactId = element.contactId;

                User.findOne({ _id: contactId }, (err, doc) => {
                    if(err) {
                        res.json({ status: 'failed', error: err });
                    } 
                    if(doc == null){
                        res.status(404).json({ status: 'failed', error: 'user not found'});
                    }else{
                        contactsArray.push(doc);
                    }
                });
            });

            res.status(200).json({ index: tabIndex, contacts: contactsArray });
        }
    });
}

module.exports = router;