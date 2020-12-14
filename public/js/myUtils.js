function stopClickPropagation(e){
	if(!e) e = window.event;
	if(e.stopPropagation){
		e.stopPropagation();
	}else{
		e.cancelBubble = true;
	}
}

function openDropdown(elm){
	elm.classList.toggle("rex-display-block");
}

function closeAllDropdowns(){
	var dropdowns = document.getElementsByClassName("rex-dropdown-content");
	var i;
	for(i = 0; i < dropdowns.length; i++){
		var openDropdown = dropdowns[i];
		if(openDropdown.classList.contains("rex-display-block")){
			openDropdown.classList.remove("rex-display-block");
		}
	}
}

function wait(time, func){
	setTimeout(() => {
		func();
	}, time);
}