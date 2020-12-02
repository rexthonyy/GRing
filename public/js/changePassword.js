window.onload = function(){
	//set listeners
	setResetPasswordButtonClickListener();
}

function setResetPasswordButtonClickListener(){
	getLoginButton().onclick = buttonClick;

	getPassword1Input().addEventListener("keyup", keypressEvent);
	getPassword2Input().addEventListener("keyup", keypressEvent);
}

function keypressEvent(event){
	event.preventDefault();
	if(event.keyCode === 13){
		buttonClick();
	}
}

function buttonClick(){
	let password1 = getPassword1Input().value.trim();
	let password2 = getPassword2Input().value.trim();

	if(password1 && password2){
		if(password1 === password2){
			if(password1.length >= 6){
				resetPassword(password1);
			}else{
				showError("Password should be at least 6 characters");
			}
		}else{
			showError("Passwords do not match");
		}
	}else{
		showError("Please enter your password");
	}
}

function resetPassword(password){

	getMainContainer().style.display = "none";
	getProgressBar().style.display = "block";

	let email = sessionStorage.getItem("email");

	let data = { email: email, password: password };
	url = Consts.WEBSITE_URL + "/changePassword";

	sendPostRequest(url, data)
	.then(json => {
		if(json.status == "success"){
			sessionStorage.removeItem("email");
			getProgressBar().style.display = "none";
			displaySuccessDialog();
		}else{
			getMainContainer().style.display = "block";
			getProgressBar().style.display = "none";
			showError(json.error, 5000);
		}
	}).catch(err => {
		console.error(err);
	});
}

function displaySuccessDialog(){
	getModalContent().innerHTML = 
	"<h1 style='color:white;'>Successful!</h1>" +
	"<p style='color:gray; margin-top: 16px; font-size: 1.2em;'>Your password has been changed successfully</p>" +
	"<button id='closeDialogButton'>OK</button>";
	
	getModalBackground().style.display = "block";
	getModalContent().style.display = "block";

	getModalContent().onclick = function(e){
		stopClickPropagation(e);
	}
	getCloseDialogButton().onclick = closeDialog;
	window.onclick = closeDialog;
}

function stopClickPropagation(e){
	if(!e) e = window.event;
	if(e.stopPropagation){
		e.stopPropagation();
	}else{
		e.cancelBubble = true;
	}
}

function closeDialog(){
	window.open("index.html", "_self");
}

function showError(error, duration = 3000){
	let errorMessage = getErrorMessage();
	errorMessage.textContent = error;
	errorMessage.style.display = "block";
	setTimeout(() => {
		errorMessage.style.display = "none";
	}, duration);
}

function getPassword1Input(){
	return document.getElementById("password1Input");
}

function getPassword2Input(){
	return document.getElementById("password2Input");
}

function getLoginButton(){
	return document.getElementById("loginButton");
}

function getErrorMessage(){
	return document.getElementById("errorMessage");
}

function getMainContainer(){
	return document.getElementById("mainContainer");
}

function getProgressBar(){
	return document.getElementById("progressBar");
}

function getCloseDialogButton(){
	return document.getElementById("closeDialogButton");
}

function getModalBackground(){
	return document.getElementById("modalBackground");
}

function getModalContent(){
	return document.getElementById("modalContent");
}