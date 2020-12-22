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

