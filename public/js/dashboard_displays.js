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

        getUsernameDialerInput().addEventListener("input", this.usernameInputListener);

        getVideoCallDialerInput().onclick = () => {
            let username = getUsernameDialerInput().value.slice(1);
            this.call({ 
                userId : sessionStorage.getItem("userId"),
                username: username, 
                video: true, 
                audio: true 
            });
        }

        getVoiceCallDialerInput().onclick = () => {
            let username = getUsernameDialerInput().value.slice(1);
            this.call({ 
                userId : sessionStorage.getItem("userId"),
                username: username, 
                video: false, 
                audio: true 
            });
        }
    }

    call(data){
        let username = data.username;
        if(username.length > 0){
            if(isUsernameValid(username)){
                connection.call(data);
            }else{
                this.showError("Invalid username");
            }
        }else{
            this.showError("Please enter a username")
        }
    }

    showError(error, duration = 5000){
        let errorMessage = getUsernameDialerInputError();
        errorMessage.textContent = error;
        errorMessage.style.display = "block";
        wait(duration, () => {
            errorMessage.style.display = "none";
        });
    }

    close(){
        super.close();
        getUsernameDialerInput().removeEventListener("input", this.usernameInputListener);
    }

    usernameInputListener(e){
        let username = e.target.value;

        if(username.length > 0){
            if(username.indexOf('@') != 0){             
                getUsernameDialerInput().value = '@' + username;
            }
        }
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