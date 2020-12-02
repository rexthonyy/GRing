class MyAudio {
    constructor(){
        this.myAudio = {};

        this.myAudio[Consts.IVR_USER_DOES_NOT_EXIST] = new Audio(Consts.IVR_USER_DOES_NOT_EXIST);
        this.myAudio[Consts.IVR_USER_NOT_AVAILABLE] = new Audio(Consts.IVR_USER_NOT_AVAILABLE);
        this.myAudio[Consts.IVR_USER_IS_BUSY] = new Audio(Consts.IVR_USER_IS_BUSY);
        this.myAudio[Consts.RING_TONE_DEFAULT] = new Audio(Consts.RING_TONE_DEFAULT);
        this.myAudio[Consts.RINGBACK_TONE_DEFAULT] = new Audio(Consts.RINGBACK_TONE_DEFAULT);
    }

    playAudio(key, callback){
        this.myAudio[key].play();
        this.myAudio[key].onended = callback;
   }

   stopAudio(key){
        this.myAudio[key].pause();
        this.myAudio[key].currentTime = 0;
   }
}