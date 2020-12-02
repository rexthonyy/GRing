class Dialog {
	constructor(dialogIndex){
		this.dialogIndex = dialogIndex; 
	}

	show(){
		getModalBackground().style.display = "block";
		getDialogs()[this.dialogIndex].style.display = "block";
	}

	hide(){
		getModalBackground().style.display = "none";
		getDialogs()[this.dialogIndex].style.display = "none";
	}

	stopClickPropagation(){
		let dg = getDialogs()[this.dialogIndex];
		dg.onclick = (e) => {
			console.log("dialog");
			stopClickPropagation(e);
		};
	}

	cancelClickPropagation(){
		let dg = getDialogs()[this.dialogIndex];
		dg.onclick = (e) => {return false};
	}
}

class WelcomeDialog extends Dialog {
	constructor(dialogIndex){
		super(dialogIndex);
	}

	dialogCallback(data){
		if(data.status == 'close'){
			this.hide();
		}
	}

	show(){
		super.stopClickPropagation();
		let dg = getDialogs()[this.dialogIndex];
		dg.getElementsByTagName("button")[0].onclick = () => {
			dialogCallback({ index: this.dialogIndex, status: 'close'});
		};

		super.show();
	}

	hide(){
		super.cancelClickPropagation();
		let dg = getDialogs()[this.dialogIndex];
		dg.getElementsByTagName("button")[0].onclick = () => {return false};

		super.hide();
	}
}

class IncomingCallDialog extends Dialog {
	constructor(dialogIndex){
		super(dialogIndex);
	}
}

class OutgoingCallDialog extends Dialog {
	constructor(dialogIndex){
		super(dialogIndex);
	}

	dialogCallback(data){
		if(data.status == 'close'){
			this.hide();
		}
	}

	show(){
		super.stopClickPropagation();
		getStopOutgoingCallBtn().onclick = () => {
			dialogCallback({ index: this.dialogIndex, status: 'close'});
		};

		super.show();
	}

	hide(){
		super.cancelClickPropagation();
		getStopOutgoingCallBtn().onclick = () => {return false};

		super.hide();
	}
}

class AnsweringCallDialog extends Dialog {
	constructor(dialogIndex){
		super(dialogIndex);
	}
}

class EndedCallDialog extends Dialog {
	constructor(dialogIndex){
		super(dialogIndex);
	}
}

class OutgoingVideoCallDialog extends Dialog {
	constructor(dialogIndex){
		super(dialogIndex);
	}
}

class AnsweringVideoCallDialog extends Dialog {
	constructor(dialogIndex){
		super(dialogIndex);
	}
}