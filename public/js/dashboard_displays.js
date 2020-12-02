class Display {
    constructor(tabIndex){
        this.tabIndex = tabIndex;
    }

    static OpenMainView(){
		getMainContainer().style.display = "block";
		getMainProgressBar().style.display = "none";
	}

	static CloseMainView(){
		getMainContainer().style.display = "none";
		getMainProgressBar().style.display = "block";
    }
    
    static OpenDisplayView(){
        getDisplayContainer().style.display = "block";
		getDisplayProgressBar().style.display = "none";
    }

    static CloseDisplayView(){
        getDisplayContainer().style.display = "none";
		getDisplayProgressBar().style.display = "block";
    }

    static CloseAllDisplayTabViews(){
        let displayTabs = getDisplayTabs();
        for(let i = 0; i < displayTabs.length; i++){
            displayTabs[i].style.display = "none";
        }
    }

    openDisplayTabView(){
        getDisplayTabs()[this.tabIndex].style.display = "block";
    }
    
    closeDisplayTabView(){
        getDisplayTabs()[this.tabIndex].style.display = "none";
    }


    setup(){}
}

class DialerDisplay extends Display {
	constructor(tabIndex){
		super(tabIndex);
	}

	setup(){
		Display.OpenDisplayView();
		this.openDisplayTabView();
		Display.OpenMainView();
    }

    close(){
        Display.CloseAllDisplayTabViews();
		Display.CloseDisplayView();
    }
}