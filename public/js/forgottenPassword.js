window.onload = function(){
	//set listeners
	setVerifyButtonClickListener();
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

function buttonClick(){
	let email = getCodeInput().value.toLowerCase().trim();

	if(email){
		if(isEmailValid(email)){
			sendCode(email);
		}else{
			showError("Email is not correct");
		}
	}else{
		showError("Please enter your email address");
	}
}

function isEmailValid(email){
	const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

function sendCode(email){

	getMainContainer().style.display = "none";
	getProgressBar().style.display = "block";

	let data = { email: email };
	url = Consts.WEBSITE_URL + "/forgottenPassword";

	sendPostRequest(url, data)
	.then(json => {
		if(json.status == "success"){
			sessionStorage.setItem("email", email);
			getProgressBar().style.display = "none";
			window.open("forgottenPasswordVerification.html", "_self");
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