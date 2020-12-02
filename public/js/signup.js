window.onload = function(){
	//set listeners
	setSignupButtonClickListener();
}

function setSignupButtonClickListener(){
	getLoginButton().onclick = buttonClick;

	getEmailInput().addEventListener("keyup", keypressEvent);
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
	let email = getEmailInput().value.toLowerCase().trim();
	let password1 = getPassword1Input().value.trim();
	let password2 = getPassword2Input().value.trim();

	if(email){
		if(isEmailValid(email)){
			if(password1 && password2){
				if(password1 === password2){
					if(password1.length >= 6){
						signup(email, password1);
					}else{
						showError("Password should be at least 6 characters");
					}
				}else{
					showError("Passwords do not match");
				}
			}else{
				showError("Please enter your password");
			}
		}else{
			showError("Email is not correct");
		}
	}else{
		showError("Please enter your email address");
	}
}

function signup(email, password){
	
	byPass(email, password); return;//todo: delete this in production after fixing email sending
	
	getMainContainer().style.display = "none";
	getProgressBar().style.display = "block";

	let data = { email: email };
	url = Consts.WEBSITE_URL + "/signup";

	sendPostRequest(url, data)
	.then(json => {
		if(json.status == "success"){
			sessionStorage.setItem("email", email);
			sessionStorage.setItem("password", password);
			getProgressBar().style.display = "none";
			window.open("signupVerification.html", "_self");
		}else{
			getMainContainer().style.display = "block";
			getProgressBar().style.display = "none";
			showError(json.error, 5000);
		}
	}).catch(err => {
		console.error(err);
	});
}

function byPass(email, password){
	sessionStorage.setItem("email", email);
	sessionStorage.setItem("password", password);
	window.open("createAccount.html", "_self");
}

function isEmailValid(email){
	const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

function showError(error, duration = 3000){
	let errorMessage = getErrorMessage();
	errorMessage.textContent = error;
	errorMessage.style.display = "block";
	setTimeout(() => {
		errorMessage.style.display = "none";
	}, duration);
}

function getEmailInput(){
	return document.getElementById("emailInput");
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