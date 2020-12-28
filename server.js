if (process.env.NODE_ENV !== 'production') require('dotenv').config();

const fs = require('fs');
const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const { v4: uuidV4 } = require('uuid');
const mongoose = require('mongoose');
const { PeerServer } = require('peer');
const User = require('./models/users');
const Connection = require('./models/connection');
const ConnectedUsers = require('./models/connectedUsers');
const ConnectionHistory = require('./models/connectionHistory');

const app = express();
const server = http.Server(app);
const io = socketio(server);

const PORT = process.env.PORT || process.env.HTTP_PORT;

server.listen(PORT, () => console.log(`Server is running on port ${PORT}`));

PeerServer({ 
    port: process.env.PEERJS_PORT, 
    path: '/'
});

app.get('/favicon.ico', (req, res) => {
    res.send("app icon");
});

//middlewares
app.use(express.json());

app.use(express.static('public'));

const signinRouter = require("./routes/signIn");
app.use("/", signinRouter);

const forgottenPasswordRouter = require("./routes/forgottenPassword");
app.use("/forgottenPassword", forgottenPasswordRouter);

const forgottenPasswordVerificationRouter = require("./routes/forgottenPasswordVerification");
app.use("/forgottenPasswordVerification", forgottenPasswordVerificationRouter);

const changePasswordRouter = require("./routes/changePassword");
app.use("/changePassword", changePasswordRouter);

const signupRouter = require("./routes/signup");
app.use("/signup", signupRouter);

const signupVerificationRouter = require("./routes/signupVerification");
app.use("/signupVerification", signupVerificationRouter);

const createAccountRouter = require("./routes/createAccount");
app.use("/createAccount", createAccountRouter);

const updatePhotoRouter = require("./routes/updatePhoto");
app.use("/updatePhoto", updatePhotoRouter);

const dashboardRouter = require("./routes/dashboard");
app.use("/dashboard", dashboardRouter);

//database connection
const MONGODB_URI = process.env.MONGODB_URI || process.env.DATABASE_URL;
mongoose.connect(MONGODB_URI, {useNewUrlParser: true, useUnifiedTopology: true});
const db = mongoose.connection;
db.on('error', (error) => console.error(error));
db.once('open', () => console.log('Connected to mongodb Database'));




























//timeout ids
var timeoutIds = {};

//socket connection
io.on('connection', socket => {

    socket.on('join-room', userId => {
        socket.join('testRoom');
        socket.to('testRoom').broadcast.emit('user-connected', userId);
    });






















    socket.on('get-user-with-username', (username) => {
        User.findOne({ username: username }, '_id', (err, doc) => {
            let user = undefined;
            if(!err && doc != null){
                user = doc;
            }
            socket.emit('socket-response', { type: 'verifyUsername', user: user });
        });
    });

    socket.on('send-connection-request', (userId, contactId) => {
        //check if the contactId is busy
        Connection.findOne({ $or: [{ initiatorId: contactId }, { contactId: contactId }] }, '_id', (err, doc) => {
            if(err){
                console.log("contact error");
                socket.emit('socket-response', { type: 'error', message: err });
                return;
            }
            if(doc != null){
                console.log("contact is busy");
                //contact is busy on another call
                socket.emit('socket-response', { type: 'notifyContactIsBusy' });
                return;
            }
                            
            //check if contacts share a connection id in common : if there has been a previous connection between contacts
            ConnectedUsers.find({ $or: [{ userId: userId }, { userId: contactId }] }, async (err, doc) => {
                if(err){
                    socket.emit('socket-response', { type: 'error', message: err });
                    return;
                }

                let connectionId = undefined;
                let userArray = [];
                let contactArray = [];

                userArray = doc.filter(element => element.userId == userId);
                contactArray = doc.filter(element => element.userId == contactId);

                userArray.forEach(elm1 => {
                    contactArray.forEach(elm2 => {
                        if(elm1.connectionId == elm2.connectionId){
                            connectionId = elm1.connectionId;
                        }
                    });
                });
                
                //if this is the first time that contacts are calling each other
                if(connectionId == undefined){
                    //record contact communication in the connection table
                    //create a connection id for the connection
                    connectionId = uuidV4();
                    const connectedUser = new ConnectedUsers({
                        connectionId: connectionId,
                        userId: userId
                    });
                    const connectedContact = new ConnectedUsers({
                        connectionId: connectionId,
                        userId: contactId
                    });
        
                    try{
                        await connectedUser.save();
                        await connectedContact.save();
                    }catch(err){
                        socket.emit('socket-response', { type: 'error', message: err });
                        return;
                    }
                }

                //record connection id in connection tb
                const connection = new Connection({
                    connectionId: connectionId,
                    initiatorId: userId,
                    contactId: contactId,
                    connectionStatus: 'connecting'
                });

                try{
                    await connection.save();
                }catch(err){
                    socket.emit('socket-response', { type: 'error', message: err });
                    return;
                }

                //make user to join the connection id as a room
                socket.join(connectionId);
                User.findOne({ _id: userId }, ('_id username displayName displayImageLink'), (err, doc) => {
                    if(err){
                        socket.emit('socket-response', { type: 'error', message: err });
                        return;
                    }
                    if(doc == null){
                        socket.emit('socket-response', { type: 'error', message: err });
                        return;
                    }

                    //broadcast to all other users so that the user with contact id can connect to the call
                    socket.broadcast.emit('socket-response', { type: 'replyToConnectionRequest', connectionId: connectionId, contactId: contactId, user: doc });
                });

                //get the user details
                User.findOne({ _id: contactId }, 'username displayImageLink displayName', (err, doc) => {
                    if(err){
                        socket.emit('socket-response', { type: 'error', message: err });
                        return;
                    }
                    if(doc == null){
                        socket.emit('socket-response', { type: 'error', message: err });
                        return;
                    }

                    socket.emit('socket-response', { type: 'connectingToCall', connectionId: connectionId, user: doc });
                });

                
                //setup the timeout
                timeoutIds[connectionId] = setTimeout(() => {
                    socket.emit('socket-response', { type: 'notifyContactIsUnavailable' });
                    
                    endCall(connectionId);
                }, 5 * 1000);
                /*
                    If timeout occurs,you will do the following
                    1. remove the socket from the connection id room (optional)
                    2. Delete the connection from the connection table
                    3. Record the connection in the connection history table
                */

                socket.on('disconnect', () => {
                    clearInterval(timeoutIds[connectionId]);
                    socket.broadcast.to(connectionId).emit('socket-response', { type: 'notifyUserDisconnected', connectionId: connectionId });
                    endCall(connectionId);
                });
            });
        });
    });

    socket.on('accept-connection-request', connectionId => {
        clearInterval(timeoutIds[connectionId]);
        socket.join(connectionId);
        socket.broadcast.to(connectionId).emit('socket-response', { type: 'waitingForContactToPickupYourCall', connectionId: connectionId });

        //setup the noanswer timeout
        timeoutIds[connectionId] = setTimeout(() => {
            socket.emit('socket-response', { type: 'youDidNotPickupTheCall' });
            socket.broadcast.to(connectionId).emit('socket-response', { type: 'contactFailedToPickupYourCall' });
            endCall(connectionId);
        }, 15 * 1000);

        //for when the receiver refreshes the page
        socket.on('disconnect', () => {
            clearInterval(timeoutIds[connectionId]);
            socket.broadcast.to(connectionId).emit('socket-response', { type: 'notifyUserDisconnected', connectionId: connectionId });
            endCall(connectionId);
        });
    });

    socket.on('answer-call', (peerId, connectionId) => {
        clearInterval(timeoutIds[connectionId]);

        //add connected status to the connection table
        Connection.findOne({ connectionId: connectionId }, 'connectionStatus createdAt', async (err, doc) => {
            if(err) {
                socket.emit('socket-response', { type: 'error', message: err });
                return;
            } 
            if(doc == null){
                socket.emit('socket-response', { type: 'error', message: err });
                return;
            }
            
            doc.connectionStatus = 'connected';
            doc.createdAt = Date.now();

            try{
                await doc.save();
                socket.broadcast.to(connectionId).emit('socket-response', { type: 'contactPickedUpYourCall', peerId: peerId, connectionId: connectionId });
            }catch(err){
                socket.emit('socket-response', { type: 'error', message: err });
                return;
            }
        });
    });

    socket.on('decline-call', connectionId => {
        clearInterval(timeoutIds[connectionId]);
        
        socket.broadcast.to(connectionId).emit('socket-response', { type: 'contactDeclinedYourCall' });
        endCall(connectionId);
    });

    socket.on('stop-connecting-to-call', connectionId => {
        clearInterval(timeoutIds[connectionId]);
        endCall(connectionId);
    });
    
    socket.on('stop-waiting-for-call-pickup', connectionId => {
        clearInterval(timeoutIds[connectionId]);
        socket.broadcast.to(connectionId).emit('socket-response', { type: 'contactFlashedYou' });
        endCall(connectionId);
    });

    socket.on('end-call', connectionId => {
        endCall(connectionId);
    });

    function endCall(connectionId){
        Connection.findOne({ connectionId: connectionId }, async (err, doc) => {
            if(err){
                socket.emit('socket-response', { type: 'error', message: err });
                return;
            }
            if(doc == null){
                socket.emit('socket-response', { type: 'error', message: err });
                return;
            }

            //transfer all the document content to connectionhistory after interpreting it whether missed call or received call
            //then delete it

            const connectionHistory = new ConnectionHistory({
                connectionId: doc.connectionId,
                initiatorId: doc.initiatorId,
                connectionType: 'video',
                connectionStatus: doc.connectionStatus,
                connectionDuration: (doc.connectionStatus == 'connected')?(Date.now() - doc.createdAt):0
            });

            try{
                await connectionHistory.save();
            }catch(err){
                socket.emit('socket-response', { type: 'error', message: err });
                return;
            }

            doc.remove();
        });
    }
});

