// Copyright (c) 2014 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/**
 * Get the current URL.
 *
 * @param {function(string)} callback - called when the URL of the current tab
 *   is found.
 */

function getCurrentTabUrl(callback) {
  // Query filter to be passed to chrome.tabs.query - see
  // https://developer.chrome.com/extensions/tabs#method-query
  var queryInfo = {
    active: true,
    currentWindow: true
  };

  chrome.tabs.query(queryInfo, function(tabs) {
    // chrome.tabs.query invokes the callback with a list of tabs that match the
    // query. When the popup is opened, there is certainly a window and at least
    // one tab, so we can safely assume that |tabs| is a non-empty array.
    // A window can only have one active tab at a time, so the array consists of
    // exactly one tab.
    var tab = tabs[0];

    // A tab is a plain object that provides information about the tab.
    // See https://developer.chrome.com/extensions/tabs#type-Tab
    var url = tab.url;
    var tabID = tab.id
    // tab.url is only available if the "activeTab" permission is declared.
    // If you want to see the URL of other tabs (e.g. after removing active:true
    // from |queryInfo|), then the "tabs" permission is required to see their
    // "url" properties.
    console.assert(typeof url == 'string', 'tab.url should be a string');

    callback(url, tabID);
  });

  // Most methods of the Chrome extension APIs are asynchronous. This means that
  // you CANNOT do something like this:
  //
  // var url;
  // chrome.tabs.query(queryInfo, function(tabs) {
  //   url = tabs[0].url;
  // });
  // alert(url); // Shows "undefined", because chrome.tabs.query is async.
}

/**
 * @param {string} searchTerm - Search term for Google Image search.
 * @param {function(string,number,number)} callback - Called when an image has
 *   been found. The callback gets the URL, width and height of the image.
 * @param {function(string)} errorCallback - Called when the image is not found.
 *   The callback gets a string that describes the failure reason.
 */

function renderResult(result){
  document.body.innerHTML = result;
}

function parseToDOM(str){
  var div = document.createElement("div");
  if(typeof str == 'string')
    div.innerHTML = str;
  return div.childNodes;
}

function httpRequest(url, callback){
  var xhr = new XMLHttpRequest();
  xhr.open('GET', url, true);
  xhr.setRequestHeader("Content-Type",
          "application/x-www-form-urlencoded;");
  xhr.onreadystatechange == function(){
    if (xhr.readyState == 4){
      callback(xhr.responseText);
    }
  }
  xhr.send();
}

function getBigdataURL(){
  var resp;
  chrome.runtime.sendMessage({isBigdata: "ok"}, function(response){
    resp = response
  });
  return resp
}

chrome.browserAction.onClicked.addListener(function (tab) {
    // ...check the URL of the active tab against our pattern and...
    if (urlRegex.test(tab.url)) {
        // ...if it matches, send a message specifying a callback too
        chrome.tabs.sendMessage(tab.id, {isBigdata: 'ok'}, doStuffWithDom);
    }
});

document.addEventListener('DOMContentLoaded', function() {
  getCurrentTabUrl(function(article_url, tab_id) {

    console.log(encodeURIComponent(article_url))
    var url = "http://localhost:9999/";
    if (article_url.slice(7, 14) == "spider8"){
      console.log(article_url.slice(7, 14))
      spiderURL = getBigdataURL();
      article_url = spiderURL.data;
    };
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open("POST", url, false);
    xmlHttp.setRequestHeader("Content-Type",
            "application/x-www-form-urlencoded;");
    xmlHttp.send("article_url="+encodeURIComponent(article_url));
    if (xmlHttp.readyState == 4 && xmlHttp.status == 200){
      renderResult(xmlHttp.responseText);
    }
    // httpRequest(url, function(result){
    //   document.body.innerHTML = result;
    //   console.log(result);
    // });
  });
});
