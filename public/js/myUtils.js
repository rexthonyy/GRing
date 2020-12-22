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

async function sendPostRequest(url, data){
	let response = await fetch(url, {
		method: "POST",
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(data)
	});

	let json = await response.json();

	return json;
}

function isUsernameValid(username){
	if(username.length >= 3){
		const re = /^\w+$/;
	    return re.test(username);
	}else{
		return false;
	}
}

function addVideoStream(videoElm, stream){
    videoElm.srcObject = stream;
    videoElm.addEventListener('loadedmetadata', () => {
        videoElm.play();
    });
}

function stopStream(stream){
	stream.getTracks().forEach(function(track) {
		track.stop();
	});
}
