var menus;
var activeMenuIndex = 0;
var connection;

window.onload = () => {
	// getMainContainer().style.display = "none";
	// getMainProgressContainer().style.display = "block";
	// getDisplayProgressContainer().style.display = "none";
	//getDisplayContainers()[0].style.display = "block";

	//setup();

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
			console.log("peer id : " + id);

			setupMenus();
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
}

function checkNewUserLogin(){

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
	menus[activeMenuIndex].click();
}

function menuCallback(data){
	menus[data.index].menuCallback(data);
}

function setgup(){
	let dropdownMenu = document.getElementById("dropdownBtn");
	dropdownMenu.onclick = (e) => {
		stopClickPropagation(e);
		closeAllDropdowns();
		openDropdown(document.getElementById("testDropdown"));
	}
	let dropdownMenu1 = document.getElementById("dropdownBtn1");
	dropdownMenu1.onclick = (e) => {
		stopClickPropagation(e);
		closeAllDropdowns();
		openDropdown(document.getElementById("testDropdown1"));
	}
	let dropdownMenu2 = document.getElementById("dropdownBtn2");
	dropdownMenu2.onclick = (e) => {
		stopClickPropagation(e);
		closeAllDropdowns();
		openDropdown(document.getElementById("testDropdown2"));
	}
	
	window.onclick = e => {
		if(!e.target.matches('.rex-dropdown-btn')){
			closeAllDropdowns();
		}
	};
}

