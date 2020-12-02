window.onload = function(){
	//set listeners
	setUploadPhotoClickListener();
	setCreateAccountButtonClickListener();

	hideRemoveImage();
	getRemoveImage().onclick = () => {
		getPhoto().src = "images/icons/ic_avatar.png";
		getUploadFile().value = "";
		hideRemoveImage();
	}
}

function setUploadPhotoClickListener(){
	getPhoto().onclick = () => {
		getUploadFile().addEventListener("change", (event) => {
			getPhoto().src = URL.createObjectURL(event.target.files[0]);
			getPhoto().onload = () => URL.revokeObjectURL(getPhoto().src);
			showRemoveImage();
		});

		getUploadFile().click();
	};
}

function showRemoveImage(){
	getRemoveImage().style.display = "block";
}

function hideRemoveImage(){
	getRemoveImage().style.display = "none";
}

function setCreateAccountButtonClickListener(){
	getCreateAccountButton().onclick = buttonClick;

	getDisplayNameInput().addEventListener("keyup", keypressEvent);
	getUsernameInput().addEventListener("keyup", keypressEvent);
}

function keypressEvent(event){
	event.preventDefault();
	if(event.keyCode === 13){
		buttonClick();
	}
}

function buttonClick(){
	let displayName = getDisplayNameInput().value.trim();
	let username = getUsernameInput().value.trim();

	if(displayName){
		if(displayName.length >= 3){
			if(username){
				if(isUsernameValid(username)){
					createAccount(displayName, username);
				}else{
					showError("Your username must be more than 3 characters and contain only letters, numbers, underscores and no spaces");
				}
			}else{
				showError("Please enter your username");
			}
		}else{
			showError("Display name must be at least 3 characters");
		}
	}else{
		showError("Please enter your display name");
	}
}

function createAccount(displayName, username){

	getMainContainer().style.display = "none";
	getProgressBar().style.display = "block";

	let email = sessionStorage.getItem("email");
	let password = sessionStorage.getItem("password");
	
	let data = { username: username, displayName: displayName, email: email, password: password };
	url = Consts.WEBSITE_URL + "/createAccount";

	sendPostRequest(url, data)
	.then(json => {
		if(json.status == "success"){
			console.log(`user id : ${json.id}`);
			sessionStorage.setItem("userId", json.id);
			sessionStorage.setItem("isNewUser", 1);
			sessionStorage.removeItem("email");
			sessionStorage.removeItem("password");

			uploadPhoto(json.id);
		}else{
			getMainContainer().style.display = "block";
			getProgressBar().style.display = "none";
			showError(json.error, 5000);
		}
	}).catch(err => {
		console.error(err);
	});
}

function uploadPhoto(userId){

	getHiddenUserIdInput().value = userId;

	url = Consts.WEBSITE_URL + "/updatePhoto";

	sendFormDataRequest(url, getUploadForm())
		.then(json => {
			console.log("photo upload status : " + json.status);
			getProgressBar().style.display = "none";
			window.open("dashboard.html", "_self");	
		}).catch(err => {
			console.log(err);
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

function getUploadForm(){
	return document.getElementById("uploadForm");
}

function getPhoto(){
	return document.getElementById("photo");
}

function getUploadFile(){
	return document.getElementById("uploadFile");
}

function getHiddenUserIdInput(){
	return document.getElementById("userIdInput");
}

function getRemoveImage(){
	return document.getElementById("removeImage");
}

function getDisplayNameInput(){
	return document.getElementById("nameInput");
}

function getUsernameInput(){
	return document.getElementById("usernameInput");
}

function getCreateAccountButton(){
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