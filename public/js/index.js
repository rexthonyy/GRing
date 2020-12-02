window.onload = function(){
	//set listeners
	setSigninButtonClickListener();
}

function setSigninButtonClickListener(){
	getLoginButton().onclick = buttonClick;

	getEmailInput().addEventListener("keyup", keypressEvent);
	getPasswordInput().addEventListener("keyup", keypressEvent);
}

function keypressEvent(event){
	event.preventDefault();
	if(event.keyCode === 13){
		buttonClick();
	}
}

function buttonClick(){
	let email = getEmailInput().value.toLowerCase().trim();
	let password = getPasswordInput().value;

	if(email){
		if(isEmailValid(email)){
			if(password){
				if(password.length >= 6){
					signin(email, password);
				}else{
					showError("Password should be at least 6 characters");
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

function signin(email, password){
	
	getMainContainer().style.display = "none";
	getProgressBar().style.display = "block";

	let data = { email: email, password: password };
	url = Consts.WEBSITE_URL;

	sendPostRequest(url, data)
	.then(json => {
		if(json.status == "success"){
			sessionStorage.setItem("userId", json.id);
			sessionStorage.setItem("isNewUser", 0);
			getProgressBar().style.display = "none";
			window.open("dashboard.html", "_self");
		}else{
			getMainContainer().style.display = "block";
			getProgressBar().style.display = "none";
			showError(json.error, 5000);
		}
	}).catch(err => {
		console.error(err);
	});
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

function getPasswordInput(){
	return document.getElementById("passwordInput");
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