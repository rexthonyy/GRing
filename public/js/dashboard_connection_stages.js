class ConnectionStage {
    constructor(socket, data){
        this.socket = socket;
        this.data = data;
    }

    start(){}
    next(){}

    stop(){
        let stage = connection.connectionStage;

        stopStream(stage.data.stream);
        audio.stopAllAudio();

        //call the stop connection stage pass in this.data
        let callEndedStage = new EndCallConnectionStage(stage.socket, stage.data);
        connection.connectionStage = callEndedStage;
        callEndedStage.start();
    }
}

class CallInitiator extends ConnectionStage {
    constructor(socket, data){
        super(socket, data);
    }

    start(){
        if(this.data.video){
            let callInitiator = new VideoCallInitiator(this.socket, this.data);
            connection.connectionStage = callInitiator;
            callInitiator.start();
        }else{
            console.log("Voice call");
        }
    }
}

class VideoCallInitiator extends ConnectionStage {
    constructor(socket, data){
        super(socket, data);
    }

    start(){
        navigator.mediaDevices.getUserMedia({video: true, audio: true})
        .then(stream => {

            this.data.stream = stream;
            
            dialogs[1].show({
                src: "images/icons/ic_avatar.PNG",
                isDisplayNameVisible: false,
                username: this.data.username,
                stream: stream,
                callback: this.stop
            });

            connection.responseListener.responseHandler = this.responseHandler;

            this.socket.emit('get-user-with-username', this.data.username);
        });
    }

    responseHandler(response){
        let stage = connection.connectionStage;

        if(response.user == undefined){
            audio.playAudio(Consts.IVR_USER_DOES_NOT_EXIST, stage.stop);
            return;
        }
             
        if(response.user._id == sessionStorage.getItem("userId")){
            console.log("Calling self");
            audio.playAudio(Consts.IVR_USER_IS_BUSY, stage.stop);
            return;
        }

        stage.data.contactId = response.user._id;

        stage.next(stage.data);
    }

    next(data){
        let stage = connection.connectionStage;

        dialogs[1].hide();
        let startConnectionStage = new StartVideoCallConnectionStage(stage.socket, data);
        connection.connectionStage = startConnectionStage;
        startConnectionStage.start();
    }

    stop(){
        dialogs[1].hide();
        super.stop();
    }
}

class EndCallConnectionStage extends ConnectionStage {
    constructor(socket, data){
        super(socket, data);
    }

     start(){
        let src = 'images/icons/ic_avatar.PNG';
        let isDisplayNameVisible = false;
        let userDisplayName = "";
        let username = this.data.username;

        if(this.data.userImageLink != undefined){
            src = this.data.userImageLink;
        }

        if(this.data.userDisplayName != undefined){
            isDisplayNameVisible = true;
            userDisplayName = this.data.userDisplayName;
        }

        dialogs[2].show({
            src: src,
            isDisplayNameVisible: isDisplayNameVisible,
            userDisplayName: userDisplayName,
            username: username
        });

        connection.responseListener.responseHandler = ()=>{};

        this.stop();
    }

    stop(){
        wait(3000, () => {
            dialogs[2].hide();
        });
    }
}

class StartVideoCallConnectionStage extends ConnectionStage {
    constructor(socket, data){
        super(socket, data);
    }

    start(){
        dialogs[1].show({
            src: "images/icons/ic_avatar.PNG",
            isDisplayNameVisible: false,
            username: this.data.username,
            stream: this.data.stream,
            callback: this.stop
        });

        connection.responseListener.responseHandler = this.responseHandler;

        //send connection request
        this.socket.emit('send-connection-request', sessionStorage.getItem("userId"), this.data.contactId);
    }

    responseHandler(response){
        let stage = connection.connectionStage;
        let userImageLink = '';

        switch(response.type){
            case "notifyContactIsBusy":
                 audio.playAudio(Consts.IVR_USER_IS_BUSY, stage.stop);
                 break;

            case "connectingToCall":
                stage.data.connectionId = response.connectionId;
                stage.data.userDisplayName = response.user.displayName;

                userImageLink = "images/icons/ic_avatar.PNG";
                if(response.user.displayImageLink != ''){
                    stage.data.userImageLink = response.user.displayImageLink;
                    userImageLink = response.user.displayImageLink;
                }

                dialogs[1].show({
                    src: userImageLink,
                    isDisplayNameVisible: true,
                    username: stage.data.username,
                    stream: stage.data.stream,
                    callback: stage.stop
                });
                break;

            case "notifyContactIsUnavailable":
                audio.playAudio(Consts.IVR_USER_NOT_AVAILABLE, stage.stop);
                break;

            case "notifyUserDisconnected":
                dialogs[1].hide();
                stage.stop();
                break;

            case "waitingForContactToPickupYourCall":
                audio.setLoopKey(Consts.RINGBACK_TONE_DEFAULT);
                audio.playAudioInLoop();

                userImageLink = "images/icons/ic_avatar.PNG";
                if(stage.data.userImageLink != undefined){
                    userImageLink = stage.data.userImageLink;
                }

                dialogs[1].show({
                    src: userImageLink,
                    isDisplayNameVisible: true,
                    username: stage.data.username,
                    stream: stage.data.stream,
                    callback: () => {
                        stage.socket.emit('stop-waiting-for-call-pickup', response.connectionId);
                        dialogs[1].hide();
                        super.stop();
                    }
                });
                break;

            case "contactDeclinedYourCall":
                dialogs[1].hide();
                stage.stop();
                break;

            case "contactPickedUpYourCall":
                dialogs[1].hide();
                stage.data.contactPeerId = response.peerId;
                let videoCallTransmitterStage = new VideoCallTransmitterStage(stage.socket, stage.data);
                connection.connectionStage = videoCallTransmitterStage;
                videoCallTransmitterStage.start();
                break;

            default:
                dialogs[1].hide();
                stage.stop();
        }
    }

    stop(){
        dialogs[1].hide();
        let stage = connection.connectionStage;
        stage.socket.emit('stop-connecting-to-call', stage.data.connectionId);
        super.stop();
    }
}

class RecieveCallStage extends ConnectionStage {
    constructor(socket, data){
        super(socket, data);
    }

    start(){
        let userImageLink = "images/icons/ic_avatar.PNG";
        if(this.data.displayImageLink != ''){
            userImageLink = this.data.userImageLink;
        }

        dialogs[3].show({
            src: userImageLink,
            displayName: this.data.displayName,
            username: this.data.username,
            callback: (response) => {
                if(response == 'answer'){
                    this.socket.emit('answer-call', connection.peerId, this.data.connectionId);
                }else{
                    this.socket.emit('decline-call', this.data.connectionId);
                    this.stop();
                }
            }
        });

        audio.setLoopKey(Consts.RING_TONE_DEFAULT)
        audio.playAudioInLoop();

        connection.responseListener.responseHandler = this.responseHandler;

        //send connection request
        this.socket.emit('accept-connection-request', this.data.connectionId);
    }

    responseHandler(response){
        let stage = connection.connectionStage;

        switch(response.type){

            case "youDidNotPickupTheCall":
                stage.stop();
            break;

            case "notifyUserDisconnected":
                stage.stop();
            break;

            case "contactFlashedYou":
                stage.stop();
            break;

            case "call":
                dialogs[3].hide();

                stage.data.call = response.call;

                let videoCallReceiverStage = new VideoCallReceiverStage(stage.socket, stage.data);
                connection.connectionStage = videoCallReceiverStage;
                videoCallReceiverStage.start();
            break;

            default:
                stage.stop();
        }
    }

    stop(){
        dialogs[3].hide();

        let stage = connection.connectionStage;

        audio.stopAllAudio();

        //call the stop connection stage pass in this.data
        let callEndedStage = new EndCallConnectionStage(stage.socket, stage.data);
        connection.connectionStage = callEndedStage;
        callEndedStage.start();
    }
}

class VideoCallTransmitterStage extends ConnectionStage {
    constructor(socket, data){
        super(socket, data);
    }

    start(){
        let call = connection.myPeer.call(this.data.contactPeerId, this.data.stream);
        call.on('stream', userVideoStream => {
            let stage = connection.connectionStage;
            audio.stopAllAudio();
            // console.log(userVideoStream);
            // console.log(stage.data.stream);
            dialogs[4].show({
                contactStream: userVideoStream,
                userStream: stage.data.stream,
                callback: stage.stop
            });

            connection.responseListener.responseHandler = stage.responseHandler;
        });
    }

    responseHandler(response){
        let stage = connection.connectionStage;

        switch(response.type){

            case "notifyUserDisconnected":
                stage.stop();
            break;

            default:
                stage.stop();
        }
    }

    stop(){
        dialogs[4].hide();
        super.stop();
    }
}

class VideoCallReceiverStage extends ConnectionStage {
    constructor(socket, data){
        super(socket, data);
    }

    start(){
        navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        .then(stream => {
            this.data.stream = stream;
            this.data.call.answer(stream);
            this.data.call.on('stream', userVideoStream => {
                let stage = connection.connectionStage;
                audio.stopAllAudio();
                // console.log(userVideoStream);
                // console.log(stage.data.stream);
                dialogs[4].show({
                    contactStream: userVideoStream,
                    userStream: stage.data.stream,
                    callback: stage.stop
                });

                connection.responseListener.responseHandler = stage.responseHandler;
            });
        });
    }

    responseHandler(response){
        let stage = connection.connectionStage;

        switch(response.type){

            case "notifyUserDisconnected":
                stage.stop();
            break;

            default:
                stage.stop();
        }
    }

    stop(){
        dialogs[4].hide();
        super.stop();
    }
}

