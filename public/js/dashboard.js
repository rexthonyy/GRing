var menus;
var dialogs;
var activeMenuIndex = 0;
var connection;
var audio;

window.onload = () => {
	setup()
	.then(() => {
		checkNewUserLogin();
		handleClickListeners();
		runTestCase();
	}).catch(err => {
		console.log(err);
	});
}

function setup() {
	return new Promise((resolve, reject) => {
		connection = new Connection((id) => {
			audio = new MyAudio();
			console.log("peer id : " + id);

			setupMenus();
			setupDialogs();
			resolve();
		});
	});
}

function setupMenus(){
	menus = [
		new DialerMenu(0),
		new RecentMenu(1),
		new ContactsMenu(2),
		new LogoutMenu(3)
	];
	menus[activeMenuIndex].click();
}

function setupDialogs(){
	dialogs = [
		new WelcomeDialog(0),
		new VideoCallInitiatorDialog(1),
		new CallEndedDialog(2),
		new IncomingCallDialog(3),
		new AnsweringVideoCallDialog(4)
	];
}

function checkNewUserLogin(){
	if(sessionStorage.getItem("isNewUser") == 1){
		sessionStorage.setItem("isNewUser", 0);
		dialogs[0].show();
	}
}

function handleClickListeners(){
	let sidebarMenus = getSidebarMenus();
	for(let i = 0; i < sidebarMenus.length; i++){
		sidebarMenus[i].onclick = () => {
			if(activeMenuIndex != i){
				menus[activeMenuIndex].close();
				menus[i].click();
				activeMenuIndex = i;
			}
		};
	}
}

function menuCallback(data){
	menus[data.index].menuCallback(data);
}











let isAnsweredCall = undefined;
let isConnectedToCall = undefined;

function runTestCase(){

	const myVideo = getAnsweringVideoCallVideoElement2();
	myVideo.muted = true;

	navigator.mediaDevices.getUserMedia({
		video: true,
		audio: true
	}).then(stream => {
		 
		connection.myPeer.on("call", call => {
			console.log("answer connection request");
			call.answer(stream);

			call.on('stream', userVideoStream => {
				if(isAnsweredCall == undefined){
					isAnsweredCall = true;
				}else{
					isAnsweredCall = undefined;
					return;
				}
				console.log("SHOW display stream");
				
				dialogs[4].show({
		            contactStream: userVideoStream,
		            userStream: stream,
		            callback: ()=>{
		            	dialogs[4].hide();
		            }
		        });
			});
		});

		connection.socket.on("user-connected", userId => {
			connectToNewUser(userId, stream);
		});

		connection.socket.emit('join-room', connection.peerId);
	});
}

function connectToNewUser(userId, stream){
	console.log("connected user: " + userId);
	const call = connection.myPeer.call(userId, stream);
	call.on('stream', userVideoStream => {
		if(isConnectedToCall == undefined){
			isConnectedToCall = true;
		}else{
			isConnectedToCall = undefined;
			return;
		}
		console.log(userVideoStream);
		console.log(stream);
		dialogs[4].show({
            contactStream: userVideoStream,
            userStream: stream,
            callback: ()=>{
            	dialogs[4].hide();
            }
        });
	});
}


























// function setgup(){
// 	let dropdownMenu = document.getElementById("dropdownBtn");
// 	dropdownMenu.onclick = (e) => {
// 		stopClickPropagation(e);
// 		closeAllDropdowns();
// 		openDropdown(document.getElementById("testDropdown"));
// 	}
// 	let dropdownMenu1 = document.getElementById("dropdownBtn1");
// 	dropdownMenu1.onclick = (e) => {
// 		stopClickPropagation(e);
// 		closeAllDropdowns();
// 		openDropdown(document.getElementById("testDropdown1"));
// 	}
// 	let dropdownMenu2 = document.getElementById("dropdownBtn2");
// 	dropdownMenu2.onclick = (e) => {
// 		stopClickPropagation(e);
// 		closeAllDropdowns();
// 		openDropdown(document.getElementById("testDropdown2"));
// 	}
	
// 	window.onclick = e => {
// 		if(!e.target.matches('.rex-dropdown-btn')){
// 			closeAllDropdowns();
// 		}
// 	};
// }

