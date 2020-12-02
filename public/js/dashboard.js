var connection;

var tabs;

var activeTabIndex = 0;

var dialogs;

window.onload = function(){
	setup()
	.then(() => {
		checkNewUserLogin();
		handleInputListener();
		handleClickListeners();
	}).catch(err => {
		console.log(err);
	});
}

function setup(){
	return new Promise((resolve, reject) => {
		connection = new Connection((id) => {
			console.log("peer id : " + id);

			setupTabs();
			setupDialogs();
			resolve();
		});
	});
	
}

function setupTabs(){
	tabs = [
		new DialerTab(0),
		new RecentTab(1),
		new ContactsTab(2),
		new LogoutTab(3)
	];
}

function setupDialogs(){
	dialogs = [
		new WelcomeDialog(0),
		new IncomingCallDialog(1),
		new OutgoingCallDialog(2),
		new AnsweringCallDialog(3),
		new EndedCallDialog(4),
		new OutgoingVideoCallDialog(5),
		new AnsweringVideoCallDialog(6)
	];
}

function tabCallback(data){
	tabs[data.index].tabCallback(data);
}

function dialogCallback(data){
	dialogs[data.index].dialogCallback(data);
}

function checkNewUserLogin(){
	if(sessionStorage.getItem("isNewUser") == 1){
		sessionStorage.setItem("isNewUser", 0);
		dialogs[0].show();
	}
}

function handleClickListeners(){
	handleSideNavClickListener();
	handleDialerDisplayClickListener();
}

function handleSideNavClickListener(){
	let sideNavTabs = getSideNavTabs();
	for(let i = 0; i < sideNavTabs.length; i++){
		sideNavTabs[i].onclick = () => {
			if(activeTabIndex != i){
				tabs[activeTabIndex].close();
				tabs[i].click();
				activeTabIndex = i;
			}
		};
	}
	tabs[activeTabIndex].click();
}

function handleInputListener(){
	getUsernameInput().addEventListener("input", (e) => {
		let username = e.target.value;

		if(username.length > 0){
			if(username.indexOf('@') != 0){				
				getUsernameInput().value = '@' + username;
			}
		}
	});
}

function handleDialerDisplayClickListener(){
	getVoiceCallBtn().onclick = () => {
		let username = getUsernameInput().value.slice(1);
		call(username, { video: false, audio: true });
	};

	getVideoCallBtn().onclick = () => {
		let username = getUsernameInput().value.slice(1);
		call(username, { video: true, audio: true });
	};
}

function showError(error, duration = 3000){
	let errorMessage = getErrorMessages()[0];
	errorMessage.textContent = error;
	errorMessage.style.display = "block";
	wait(duration, () => {
		errorMessage.style.display = "none";
	});
}

function call(username, mediaData){
	if(username.length > 0){
		if(isUsernameValid(username)){
			connection.startConnection({
				userId : sessionStorage.getItem("userId"),
				username : username,
				mediaData : mediaData
			});
		}else{
			showError("Invalid username");
		}
	}else{
		showError("Please enter a username")
	}
}