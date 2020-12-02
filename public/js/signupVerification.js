window.onload = function(){
	//set listeners
	setVerificationInfo();
	setVerifyButtonClickListener();
	setResendLinkClickListener();
}

function setVerificationInfo(){
	getInfoParagraph().textContent = 
	"We just sent you a message via email to "+sessionStorage.getItem("email")+" with your authentication code. "+
	"Enter the code in the form below to verify your identity.";
}

function setVerifyButtonClickListener(){
	getVerifyButton().onclick = buttonClick;

	getCodeInput().addEventListener("keyup", (event) => {
		event.preventDefault();
		if(event.keyCode === 13){
			buttonClick();
		}
	});
}

function setResendLinkClickListener(){
	getResendLink().onclick = function(){
		
		getMainContainer().style.display = "none";
		getProgressBar().style.display = "block";

		let data = { email: sessionStorage.getItem("email") };
		let url = Consts.WEBSITE_URL + "/signupVerification/resendCode";

		sendPostRequest(url, data)
		.then(json => {
			getMainContainer().style.display = "block";
			getProgressBar().style.display = "none";
			getCodeInput().focus();

			if(json.status != "success"){
				showError(json.error, 5000);	
			}
		}).catch(err => {
			console.error(err);
		});
	};
}

function buttonClick(){
	let code = getCodeInput().value.trim();

	if(code){
		if(!isNaN(code)){
			if(code.length == 6){
				verify(code);
			}else{
				showError("Code is 6 digits in length");
			}
		}else{
			showError("Please enter a numeric code");
		}
	}else{
		showError("Please enter your verification code");
	}
}

function verify(code){

	getMainContainer().style.display = "none";
	getProgressBar().style.display = "block";

	let data = { email: sessionStorage.getItem("email"), code: code };
	let url = Consts.WEBSITE_URL + "/signupVerification";

	sendPostRequest(url, data)
	.then(json => {
		if(json.status == "success"){
			getProgressBar().style.display = "none";
			window.open("createAccount.html", "_self");
		}else{
			getMainContainer().style.display = "block";
			getProgressBar().style.display = "none";
			showError(json.error, 5000);
			getCodeInput().focus();
		}
	}).catch(err => {
		console.error(err);
	});
}

function showError(error, duration = 3000){
	let errorMessage = getErrorMessage();
	errorMessage.textContent = error;
	errorMessage.style.display = "block";
	setTimeout(() => {
		errorMessage.style.display = "none";
	}, duration);
}

function getInfoParagraph(){
	return document.getElementById("infoParagraph");
}

function getCodeInput(){
	return document.getElementById("codeInput");
}

function getVerifyButton(){
	return document.getElementById("verifyButton");
}

function getErrorMessage(){
	return document.getElementById("errorMessage");
}

function getResendLink(){
	return document.getElementById("resend");
}

function getMainContainer(){
	return document.getElementById("mainContainer");
}

function getProgressBar(){
	return document.getElementById("progressBar");
}