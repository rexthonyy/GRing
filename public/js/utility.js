function stopStream(stream){
	stream.getTracks().forEach(function(track) {
		track.stop();
	});
}

function stopClickPropagation(e){
	if(!e) e = window.event;
	if(e.stopPropagation){
		e.stopPropagation();
	}else{
		e.cancelBubble = true;
	}
}

function isUsernameValid(username){
	if(username.length >= 3){
		const re = /^\w+$/;
	    return re.test(username);
	}else{
		return false;
	}
}

function wait(time, func){
	setTimeout(() => {
		func();
	}, time);
}

function getRandom(min, max){
	return myMap(Math.random(), 0, 1, min, max);
}

function myMap(val, minF, maxF, minT, maxT){
	return minT + (((val - minF)/(maxF - minF)) * (maxT - minT));
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

async function sendFormDataRequest(url, form){
	let response = await fetch(url, {
		method: 'post',
		body: new FormData(form)
	});

	let json = await response.json();

	return json;
}