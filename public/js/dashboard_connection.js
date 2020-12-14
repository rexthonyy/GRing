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
}

class ResponseListener {
    constructor(callback, socket, myPeer){

        //define this in the constructor of each stage
        this.responseHandler = undefined; 

        myPeer.on('open', id => {
            callback(id);
        });

        myPeer.on('call', call => {
            this.responseHandler({ 'type': 'call', 'call': call});
        });

        socket.on('socket-response', response => {
            this.responseHandler(response);
        });
    }
}