class Menu {
	constructor(menuIndex, display){
		this.menuIndex = menuIndex;
		this.display = display;
	}

	click(){
		Menu.DeselectAllSideNavMenus();
		Menu.SelectSideNavMenu(this.menuIndex);
		//this.sendRequest(this.getRouteUrl(), menuCallback, this.getData());
		this.menuCallback(undefined);
	}

	getRouteUrl(){}
	getData(){}
	setup(){}

	//this is called from dashboard.js
	menuCallback(data){
		this.setup(data);
		this.display.setup(data);
	}

	close(){
		this.clearData();
		this.display.close();
	}

	clearData(){}

	sendRequest(url, callback, data){
		sendPostRequest(url, data)
		.then(json => {
			callback(json);
		}).catch(err => {
			console.error(err);
		});
	}

	static DeselectAllSideNavMenus(){
		let sideNavMenus = getSidebarMenus();
		for(let i = 0; i < sideNavMenus.length; i++){
			sideNavMenus[i].className = "sidebarMenu rex-width-80pp rex-height-20pp rex-center-div-horizontal rex-curDiv-64px rex-hover rex-display-flex rex-center-flex-items rex-selectable-item-background";
		}
	}

	static SelectSideNavMenu(index){
		let sideNavMenus = getSidebarMenus();
		sideNavMenus[index].className = "sidebarMenu rex-width-80pp rex-height-20pp rex-center-div-horizontal rex-curDiv-64px rex-hover rex-display-flex rex-center-flex-items rex-selectable-item-background rex-item-selected";
	}
}

class DialerMenu extends Menu {
	constructor(menuIndex){
		super(menuIndex, new DialerDisplay(menuIndex));
	}

	getRouteUrl(){
		return Consts.WEBSITE_URL + "/dashboard/getRecentlyContacted";
	}

	getData(){
		return { 'index': this.menuIndex, 'userId': sessionStorage.getItem("userId") };
	}

	click(){
		Menu.DeselectAllSideNavMenus();
		Menu.SelectSideNavMenu(this.menuIndex);
		this.setup(undefined);
		this.display.setup();
	}

	setup(data){
		this.setupContactList(data);
		this.setupClickListener(data);
	}

	setupContactList(data){
		
	}

	setupClickListener(data){

	}
	
	clearData(){
		console.log("Clear dialer data");
	}
}

class RecentMenu extends Menu {
	constructor(menuIndex){
		super(menuIndex, new RecentDisplay(menuIndex));
	}

	clearData(){
		console.log("Clear dialer data");
	}
}

class ContactsMenu extends Menu {
	constructor(menuIndex){
		super(menuIndex, new ContactsDisplay(menuIndex));
	}

	clearData(){
		console.log("Clear contacts data");
	}
}

class LogoutMenu extends Menu {
	constructor(menuIndex){
		super(menuIndex);
	}

	getData(){
		return {'index': this.menuIndex, 'status': 1};
	}

	click(){
		Display.ShowMainProgressContainer();
		//super.sendRequest(tabCallback, getData());
		this.menuCallback({'status': 0});
	}

	//this is called from dashboard.js
	menuCallback(data){
		wait(3000, () => {
			if(data.status == 1){
				window.open("index.html", "_self");
			}else{
				Display.HideMainProgressContainer();
				menus[0].click();
				activeMenuIndex = 0;
			}
		});
	}
}

