class Display {
    constructor(displayIndex){
        this.displayIndex = displayIndex;
    }

    static ShowMainProgressContainer(){
		getMainContainer().style.display = "none";
		getMainProgressContainer().style.display = "block";
	}

	static HideMainProgressContainer(){
		getMainContainer().style.display = "block";
		getMainProgressContainer().style.display = "none";
    }
    
    static ShowDisplayProgressContainer(){
        getDisplayProgressContainer().style.display = "block";
    }

    static HideDisplayProgressContainer(){
		getDisplayProgressContainer().style.display = "none";
    }

    static CloseAllDisplayContainers(){
        let displayContainer = getDisplayContainers();
        for(let i = 0; i < displayContainer.length; i++){
            displayContainer[i].style.display = "none";
        }
    }

    static ShowDisplayContainer(displayIndex){
        getDisplayContainers()[displayIndex].style.display = "block";
    }
    
    static HideDisplayContainer(displayIndex){
        getDisplayContainers()[displayIndex].style.display = "none";
    }


    setup(){
        Display.HideMainProgressContainer();
        Display.ShowDisplayContainer(this.displayIndex);
    }

    close(){
        Display.HideDisplayContainer(this.displayIndex);
    }
}

class DialerDisplay extends Display {
	constructor(displayIndex){
		super(displayIndex);
	}

	setup(data){
        super.setup();
    }

    close(){
        super.close();
    }
}

class RecentDisplay extends Display {
    constructor(displayIndex){
        super(displayIndex);
    }

    setup(data){
        super.setup();
    }

    close(){
        super.close();
    }
}


class ContactsDisplay extends Display {
    constructor(displayIndex){
        super(displayIndex);
    }

    setup(data){
        super.setup();
    }

    close(){
        super.close();
    }
}