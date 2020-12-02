class Connection {
    constructor(callback){
        this.socket = io('/');
        this.myAudio = new MyAudio();
        this.stopCall = false;
        this.endFunc = {};

        this.myPeer = new Peer({
            host: '/',
            port: 3001,
            path: '/',
            secure: true
        });
        
        this.myPeer.on('open', id => {
            this.peerId = id;
            callback(id);
        });

        this.setSocketListener();
    }

    setSocketListener(){
        this.myPeer.on('call', call => {
            navigator.mediaDevices.getUserMedia({ video: true, audio: true })
            .then(stream => {
                this.connectionObj.stream = stream;
                call.answer(stream);

                call.on('stream', userVideoStream => {
                    this.stopRingingTone();

                    //prepare the new dialog
                    this.addVideoStream(getAnsweringVideoCallLargeVideoElm(), userVideoStream);
                    this.addVideoStream(getAnsweringVideoCallSmallVideoElm(), stream);

                    dialogs[1].hide();
                    dialogs[6].show();

                    let func = () => {
                        this.endFunc[this.connectionObj.connectionId] = () => {};
                        dialogs[6].hide();
                        stopStream(stream);
                        stopStream(userVideoStream);

                        callEnded(3000);
                    };

                    getStopAnsweringVideoCallBtn().onclick = func;  
                    this.endFunc[this.connectionObj.connectionId] = func;
                });
             });
            
        });

        this.socket.on('socket-response', response => {
            switch(response.type){
                case "verifyUsername":
                    if(response.user == undefined){
                        this.myAudio.playAudio(Consts.IVR_USER_DOES_NOT_EXIST, this.stopVideoConnection);
                        getStopOutgoingVideoCallBtn().onclick = () => {
                            this.myAudio.stopAudio(Consts.IVR_USER_DOES_NOT_EXIST);
                            this.stopVideoConnection(0);
                        }   
                    }else{                        
                        //if you are trying to call yourself - busy
                        if(response.user._id == sessionStorage.getItem("userId")){
                            console.log("Calling self");
                            this.myAudio.playAudio(Consts.IVR_USER_IS_BUSY, this.stopVideoConnection);
                            getStopOutgoingVideoCallBtn().onclick = () => {
                                this.myAudio.stopAudio(Consts.IVR_USER_IS_BUSY);
                                this.stopVideoConnection(0);
                            }
                            return;
                        }
        
                        //send connection request
                        this.socket.emit('send-connection-request', sessionStorage.getItem("userId"), response.user._id);
                    }
                break;

                case "notifyContactIsBusy":
                    console.log("User is busy on another call");
                    this.myAudio.playAudio(Consts.IVR_USER_IS_BUSY, this.stopVideoConnection);
                    getStopOutgoingVideoCallBtn().onclick = () => {
                        this.myAudio.stopAudio(Consts.IVR_USER_IS_BUSY);
                        this.stopVideoConnection(0);
                    }
                break;

                case "replyToConnectionRequest":
                    if(sessionStorage.getItem('userId') === response.contactId){
                        this.connectionObj = {};
                        this.connectionObj.username = response.user.username;
                        this.connectionObj.src = response.user.displayImageLink;
                        this.connectionObj.connectionId = response.connectionId;
                        getIncomingCallImage().src = response.user.displayImageLink;
                        getIncomingCallDisplayName().textContent = response.user.displayName;
                        getIncomingCallUsername().textContent = '@' + response.user.username;
                        getAnswerIncomingCallBtn().onclick = () => {
                            this.socket.emit('answer-call', this.peerId, response.connectionId);
                        };
                        getDeclineIncomingCallBtn().onclick = () => {
                            this.socket.emit('decline-call', response.connectionId);
                            this.stopRingingTone();
                            dialogs[1].hide();
                            this.callEnded(2000);
                            this.endFunc[response.connectionId] = () => {};
                        };
                        dialogs[1].show();
        
                        this.playRingingToneCallback();
                        
                        this.endFunc[response.connectionId] = () => {
                            this.endFunc[response.connectionId] = () => {};
                            this.stopRingingTone();
                            dialogs[1].hide();
                            this.callEnded(2000);
                        };

                        this.socket.emit('accept-connection-request', response.connectionId);
                    }
                break;

                case "connectingToCall":
                    this.connectionObj.src = response.user.displayImageLink;
                    getOutgoingVideoCallImage().src = response.user.displayImageLink;
                    getOutgoingVideoCallDisplayName().style.display = "block";
                    getOutgoingVideoCallDisplayName().textContent = response.user.displayName;
                    getOutgoingVideoCallUsername().textContent = "@" + response.user.username;                    
                    getStopOutgoingVideoCallBtn().onclick = () => {
                        this.socket.emit('stop-connecting-to-call', response.connectionId);
                        this.stopVideoConnection(0);
                    };
                break;

                case "notifyContactIsUnavailable":
                    this.myAudio.playAudio(Consts.IVR_USER_NOT_AVAILABLE, this.stopVideoConnection);
                    getStopOutgoingVideoCallBtn().onclick = () => {
                        this.myAudio.stopAudio(Consts.IVR_USER_NOT_AVAILABLE);
                        this.stopVideoConnection(0);
                    }
                    this.endFunc[response.connectionId] = () => {};
                break;

                case "waitingForContactToPickupYourCall":
                    this.playRingBackToneCallback();
                    getStopOutgoingVideoCallBtn().onclick = () => {
                        this.socket.emit('stop-waiting-for-call-pickup', response.connectionId);
                        this.stopRingBackTone();
                        this.stopVideoConnection(0);
                        this.endFunc[response.connectionId] = () => {};
                    };
                    this.endFunc[response.connectionId] = () => {
                        this.stopRingBackTone();
                        this.stopVideoConnection(0);
                    };
                break;

                case "contactFlashedYou":
                    this.stopRingingTone();
                    dialogs[1].hide();
                    this.callEnded(2000);
                    this.endFunc[response.connectionId] = () => {};
                break;

                case "youDidNotPickupTheCall":
                    this.stopRingingTone();
                    dialogs[1].hide();
                    this.callEnded(2000);
                    this.endFunc[response.connectionId] = () => {};
                break;

                case "contactFailedToPickupYourCall":
                    this.stopRingBackTone();
                    this.stopVideoConnection(0);
                    this.endFunc[response.connectionId] = () => {};
                    break;

                case "contactDeclinedYourCall":
                    this.stopRingBackTone();
                    this.myAudio.playAudio(Consts.IVR_USER_NOT_AVAILABLE, this.stopVideoConnection);
                    getStopOutgoingVideoCallBtn().onclick = () => {
                        this.myAudio.stopAudio(Consts.IVR_USER_NOT_AVAILABLE);
                        this.stopVideoConnection(0);
                    }
                    this.endFunc[response.connectionId] = () => {};
                break;  

                case "contactPickedUpYourCall":
                    console.log("pickup");
                    
                    const call = this.myPeer.call(response.peerId, this.connectionObj.stream);
                    call.on('stream', userVideoStream => {
                        this.stopRingBackTone();

                        //prepare the new dialog
                        this.addVideoStream(getAnsweringVideoCallLargeVideoElm(), userVideoStream);
                        this.addVideoStream(getAnsweringVideoCallSmallVideoElm(), this.connectionObj.stream);

                        dialogs[5].hide();
                        dialogs[6].show();

                        let func = () => {
                            this.endFunc[response.connectionId] = () => {};
                            dialogs[6].hide();
                            stopStream(this.connectionObj.stream);
                            stopStream(userVideoStream);

                            callEnded(3000);
                        };

                        getStopAnsweringVideoCallBtn().onclick = func;  
                        this.endFunc[response.connectionId] = func;
                    });
                break;

                case "notifyUserDisconnected":
                    this.endFunc[response.connectionId]();
                break;

                default:
                    alert("ERROR : " + response.message);
                    console.error(response);
                break;
            }
        });
    }
    
    startConnection(connectionObj){
        if(connectionObj.mediaData.video){
            this.startVideoConnection(connectionObj);
        }else{
            this.startVoiceConnection(connectionObj);
        }
    }

    startVideoConnection(connectionObj){
        getOutgoingVideoCallImage().src = 'images/icons/ic_avatar.PNG';
        getOutgoingVideoCallDisplayName().style.display = "none";
        getOutgoingVideoCallUsername().textContent = "@" + connectionObj.username;
        getStopOutgoingVideoCallBtn().onclick = () => {
            this.stopCall = true;
            dialogs[5].hide();
        };
        dialogs[5].show();
        let myVideo = getOutgoingVideoCallVideoElm();
        myVideo.muted = true;
        navigator.mediaDevices.getUserMedia(connectionObj.mediaData)
        .then(stream => {
            connectionObj.stream = stream;
            connectionObj.src = getOutgoingVideoCallImage().src;
            this.connectionObj = connectionObj;
            //display your camera output
            this.addVideoStream(myVideo, stream);

            if(this.stopCall){
                this.stopCall = false;
                stopStream(stream);
                dialogs[5].hide();
                return;
            }
            
            getStopOutgoingVideoCallBtn().onclick = () => {};

            //check whether the user exits
            this.socket.emit('get-user-with-username', connectionObj.username);
        });
    }

    stopVideoConnection(duration = 5000){
        wait(duration, () => {
            dialogs[5].hide();
            stopStream(connection.connectionObj.stream);

            connection.callEnded(3000);
        });
    }

    callEnded(duration){
        getEndedCallImage().src = connection.connectionObj.src;
        getEndedCallDisplayName().style.display = "none";
        getEndedCallUsername().textContent = "@" + connection.connectionObj.username;
        dialogs[4].show();
        wait(duration, () => {
            dialogs[4].hide();
        });
    }

    startVoiceConnection(connectionObj){
        
    }

    playRingingToneCallback(){
        connection.myAudio.playAudio(Consts.RING_TONE_DEFAULT, connection.playRingingToneCallback);
    }

    stopRingingTone(){
        connection.myAudio.stopAudio(Consts.RING_TONE_DEFAULT);
    }

    playRingBackToneCallback(){
        connection.myAudio.playAudio(Consts.RINGBACK_TONE_DEFAULT, connection.playRingBackToneCallback);
    }

    stopRingBackTone(){
        connection.myAudio.stopAudio(Consts.RINGBACK_TONE_DEFAULT);
    }

    addVideoStream(videoElm, stream){
        videoElm.srcObject = stream;
        videoElm.addEventListener('loadedmetadata', () => {
            videoElm.play();
        });
    }
}