chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
	if (request.isBigdata && request.isBigdata == "ok"){
	  sendResponse({data: $("#data_resource_url").attr("href")});
	  // sendResponse(document.getElementById("data_resource_url").innerHTML);
	}
});
