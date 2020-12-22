class Menu {
	constructor(menuIndex, display){
		this.menuIndex = menuIndex;
		this.display = display;
	}

	click(){
		Menu.DeselectAllSideNavMenus();
		Menu.SelectSideNavMenu(this.menuIndex);
		this.sendRequest(this.getRouteUrl(), menuCallback, this.getData());
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

	setup(data){
		this.setupContactList(data);
		this.setupClickListener(data);
	}

	setupContactList(data){
		this.contacts = data.contacts;
		let html = "";

		data.contacts.forEach(element => {
			html += 
			`
				<div class="rex-pad16px rex-hover rex-selectable-item-background">
					<div class="custom-dialer-user-grid">
						<div>
							<img class="rex-width-60px rex-height-60px rex-curDiv-30px" src="${element.displayImageLink}"/>
						</div>
						<div class="rex-display-flex rex-center-vertical-flex-items rex-text-overflow-ellipses">
							<p class="rex-fs-normal rex-color-white rex-ml-16px">${element.displayName}</p>
							<p class="rex-fs-normal rex-color-gray rex-mt-8px rex-ml-16px">@${element.username}</p>
						</div>
						<div class="rex-display-flex rex-center-flex-items">
							<div class="rex-dropdown">
								<img id="${element._id}dropdownBtn" class="custom-phone-icon rex-dropdown-btn rex-width-24px rex-height-24px" src="images/icons/ic_phone_white.png"/>
								<div id="${element._id}dropdown" class="rex-dropdown-content rex-min-width-100px custom-background-color1 rex-overflow-auto rex-box-shadow1 rex-z-index1 rex-center-text rex-display-gone">
									<p id="${element._id}videoCall" class="rex-selectable-item-background rex-pad16px rex-color-white">Video call</p>
									<p id="${element._id}voiceCall" class="rex-selectable-item-background rex-pad16px rex-color-white">Voice call</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			`;
		});

		getUserDialerContainer().innerHTML = html;
	}

	setupClickListener(data){
		this.contacts.forEach(element => {
			document.findElementById(`${element._id}dropdownBtn`).onclick = () => {
				stopClickPropagation(e);
				closeAllDropdowns();
				openDropdown(document.getElementById(`${element._id}dropdown`));
			};

			document.getElementById(`${element._id}videoCall`).onclick = () => {
				connection.call({ 
	                userId : sessionStorage.getItem("userId"),
	                username: element.username, 
	                video: true, 
	                audio: true 
	            });
			};

			document.getElementById(`${element._id}voiceCall`).onclick = () => {
				connection.call({ 
	                userId : sessionStorage.getItem("userId"),
	                username: element.username, 
	                video: false, 
	                audio: true 
	            });
			};
		});

		window.onclick = e => {
			if(!e.target.matches('.rex-dropdown-btn')){
				closeAllDropdowns();
			}
		};
	}
	
	clearData(){
		console.log("Clear dialer data");
		window.onclick = () => {};
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

