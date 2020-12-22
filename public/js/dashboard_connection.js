class Connection {
    constructor(callback){
        this.socket = io('/');
        
        this.myPeer = new Peer({
            host: '/',
            port: 3001,
            path: '/',
            secure: true
        });

        this.responseListener = new ResponseListener(callback, this.socket, this.myPeer);
    }

    call(data){
        let callInitiator = new CallInitiator(this.socket, data);
        this.connectionStage = callInitiator;
        callInitiator.start();
    }

    stop(){
        this.connectionStage.stop();
    }
}

class ResponseListener {
    constructor(callback, socket, myPeer){

        //define this in the constructor of each stage
        this.responseHandler = ()=>{}; 

        myPeer.on('open', id => {
            connection.peerId = id;
            callback(id);
        });

        myPeer.on('call', call => {
            this.responseHandler({ type: 'call', call: call});
        });

        socket.on('socket-response', response => {
            if(response.type == "replyToConnectionRequest"){
                if(sessionStorage.getItem('userId') === response.contactId){
                    let recieveCallStage = new RecieveCallStage(socket, {
                        username: response.user.username,
                        userDisplayName: response.user.userDisplayName,
                        userImageLink: response.user.displayImageLink,
                        connectionId: response.connectionId
                    });
                    connection.connectionStage = recieveCallStage;
                    recieveCallStage.start();
                }
            }else{
                this.responseHandler(response);
            }
        });
    }
}