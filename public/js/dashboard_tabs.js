class Tab {
	constructor(tabIndex, display){
		this.tabIndex = tabIndex;
		this.display = display;
	}

	click(){
		this.deselectAllSideNavTabs();
		this.selectSideNavTab(this.tabIndex);
		this.sendRequest(this.getRouteUrl(), tabCallback, this.getData());
	}

	getRouteUrl(){}
	getData(){}

	//this is called from dashboard.js
	tabCallback(data){
		this.setup(data);
		this.display.setup();
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

	deselectAllSideNavTabs(){
		let sideNavTabs = getSideNavTabs();
		for(let i = 0; i < sideNavTabs.length; i++){
			sideNavTabs[i].className = "navItemContainer";
		}
	}

	selectSideNavTab(index){
		let sideNavTabs = getSideNavTabs();
		sideNavTabs[index].className = "navItemContainer activeSideNavTab";
	}
}

class DialerTab extends Tab {
	constructor(tabIndex){
		super(tabIndex, new DialerDisplay(tabIndex));
	}

	getRouteUrl(){
		return Consts.WEBSITE_URL + "/dashboard/getRecentlyContacted";
	}

	getData(){
		return { 'index': this.tabIndex, 'userId': sessionStorage.getItem("userId") };
	}

	setup(data){
		this.setupContactList(data);
		this.setupClickListener(data);
	}

	setupContactList(data){
		this.recentlyContacted = data.contacts;

		let html = "";

		data.contacts.forEach(element => {
			html += 
			`
				<div class="listItem">
					<div class="imgListItemSection">
						<img src="${element.displayImageLink}"/>
					</div>
					<div class="infoListItemSection">
						<div class="navContainer">
							<div class="descListItemSection">
								<div class="navContainer">
									<p class="listItemName">${element.displayName}</p>
									<p class="listItemDesc">@${element.username}</p>
								</div>
							</div>
							<div class="iconListItemSection">
								<div class="navContainer">
									<img class="listItemPhone"src="images/icons/ic_phone_white.png" width="24px" height="24px"/>
								</div>
							</div>
						</div>
					</div> 
					<div class="listItemDummy"></div>
				</div>
			`;
		});

		getListContainers()[this.tabIndex].innerHTML = html;
	}

	setupClickListener(data){

	}
	
	clearData(){
		console.log("Clear dialer data");
		this.recentlyContacted = undefined;
		getListContainers()[this.tabIndex].innerHTML = "";
	}
}

class RecentTab extends Tab {
	constructor(tabIndex){
		super(tabIndex);
	}

	getData(){
		return {'index': this.tabIndex, 'status': 1};
	}

	loadData(data){
		console.log("Recent data loaded");
	}

	clearData(){
		console.log("Clear recent data");
	}
}

class ContactsTab extends Tab {
	constructor(tabIndex){
		super(tabIndex);
	}

	getData(){
		return {'index': this.tabIndex, 'status': 1};
	}

	loadData(data){
		console.log("Contacts data loaded");
	}

	clearData(){
		console.log("Clear contacts data");
	}
}

class LogoutTab extends Tab {
	constructor(tabIndex){
		super(tabIndex);
	}

	getData(){
		return {'index': this.tabIndex, 'status': 1};
	}

	click(){
		super.closeMainView();
		super.sendRequest(tabCallback, getData());
	}

	//this is called from dashboard.js
	tabCallback(data){
		if(data.status == 1){
			window.open("index.html", "_self");
		}else{
			super.openMainView();
			tabs[1].click();
			activeTabIndex = 1;
		}
	}
}

