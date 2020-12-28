class Dialog {
	constructor(dialogIndex){
		this.dialogIndex = dialogIndex; 
	}

	static Show(dialogIndex){
		getModalBackground().style.display = "flex";
		getModals()[dialogIndex].style.display = "block";
	}

	static Hide(dialogIndex){
		getModalBackground().style.display = "none";
		getModals()[dialogIndex].style.display = "none";
	}

	static HideAllDialogs(){
		for(let i = 0; i < getModals().length; i++){
			Dialog.Hide(i);
		}
	}

	show(){
		Dialog.Show(this.dialogIndex);
	}

	hide(){
		Dialog.Hide(this.dialogIndex);
	}
}

class WelcomeDialog extends Dialog {
	constructor(dialogIndex){
		super(dialogIndex);
	}

	show(data){
		getWelcomeModalGetStartedBtn().onclick = () => {
			data.callback(this.dialogIndex);
		};

		super.show();
	}

	hide(){
		getWelcomeModalGetStartedBtn().onclick = () => {};
		super.hide();
	}
}

class VideoCallInitiatorDialog extends Dialog {
	constructor(dialogIndex){
		super(dialogIndex);
	}

	show(data){
		this.setup(data);
		this.setClickListener(data);
		super.show();
	}

	setup(data){
		getVideoCallInitiatorUserDisplayPic().src = data.src;
		if(data.isDisplayNameVisible){
			getVideoCallInitiatorUserDisplayName().style.display = "block";
			getVideoCallInitiatorUserDisplayName().textContent = data.displayName;
		}else{
			getVideoCallInitiatorUserDisplayName().style.display = "none";
		}
		getVideoCallInitiatorUsername().textContent = "@" + data.username;


		let videoElm = getVideoCallInitiatorVideoElement();
		videoElm.muted = true;

		addVideoStream(videoElm, data.stream);
	}

	setClickListener(data){
		getVideoInitiatorCallStopCallBtn().onclick = () => {
			data.callback();
		};
	}

	hide(){
		getVideoInitiatorCallStopCallBtn().onclick = () => {};
		super.hide();
	}
}

class CallEndedDialog extends Dialog {
	constructor(dialogIndex){
		super(dialogIndex);
	}

	show(data){
		this.setup(data);
		super.show();
	}

	setup(data){
		getCallEndedUserDisplayPic().src = data.src;
		if(data.isDisplayNameVisible){
			getCallEndedUserDisplayName().style.display = "block";
			getCallEndedUserDisplayName().textContent = data.displayName;
		}else{
			getCallEndedUserDisplayName().style.display = "none";
		}
		getCallEndedUsername().textContent = "@" + data.username;
	}
}

class IncomingCallDialog extends Dialog {
	constructor(dialogIndex){
		super(dialogIndex);
	}

	show(data){
		this.setup(data);
		this.setClickListener(data);
		super.show();
	}

	setup(data){
		getIncomingCallUserDisplayPic().src = data.src;
		getIncomingCallUserDisplayName().textContent = data.displayName;
		getIncomingCallUsername().textContent = "@" + data.username;
	}

	setClickListener(data){
		getIncomingCallAnswerCallBtn().onclick = () => {
			data.callback('answer');
		};

		getIncomingCallStopCallBtn().onclick = () => {
			data.callback('decline');
		};
	}

	hide(){
		getIncomingCallAnswerCallBtn().onclick = () => {};
		getIncomingCallStopCallBtn().onclick = () => {};
		super.hide();
	}
}

class AnsweringVideoCallDialog extends Dialog {
	constructor(dialogIndex){
		super(dialogIndex);
	}

	show(data){
		this.setup(data);
		this.setClickListener(data);
		super.show();
	}

	setup(data){
		let videoElm1 = getAnsweringVideoCallVideoElement1();
		let videoElm2 = getAnsweringVideoCallVideoElement2();

		videoElm1.muted = true;
		videoElm2.muted = true;

		addVideoStream(videoElm1, data.contactStream);
		addVideoStream(videoElm2, data.userStream);
	}

	setClickListener(data){
		getAnsweringVideoCallStopCallBtn().onclick = () => {
			data.callback();
		};
	}

	hide(){
		getAnsweringVideoCallStopCallBtn().onclick = () => {};
		super.hide();
	}
}

