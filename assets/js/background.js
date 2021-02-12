// when the extension is first installed, set default values
chrome.runtime.onInstalled.addListener(function() {
    fetch("http://localhost:8080/hosts.json")
        .then((resp) => resp.json())
        .then(function (data) {
            chrome.storage.local.set({
                defaultBlockedList: data
            }, function (){});
        });

    chrome.storage.sync.set({
        toggleSitesActive: true,
        toggleSitesBlockList: 'example.com',
        toggleSitesAllowList: 'example.org',
    }, function() {});
});

// set up initial chrome storage values
let toggleSitesActive = true;
let toggleSitesBlockList = 'example.com';
let toggleSitesAllowList = 'example.org';
let defaultBlockedList = [];

chrome.storage.sync.get([
    'toggleSitesActive',
    'toggleSitesBlockList',
    'toggleSitesAllowList'
], function(result) {
    toggleSitesActive = result.toggleSitesActive;
    toggleSitesBlockList = result.toggleSitesBlockList;
    toggleSitesAllowList = result.toggleSitesAllowList;
});
chrome.storage.local.get(['defaultBlockedList'], function (result){
    defaultBlockedList = result.defaultBlockedList;
});

// on each site request, block if it's in toggleSitesBlockList
chrome.webRequest.onBeforeRequest.addListener(
    function(details) {
        // if the toggle is inactive, don't block anything
        if (!toggleSitesActive) {
            return { cancel: false };
        }

        // determine if the url is in toggleSitesBlockList
        const allowed = toggleSitesAllowList.split(/\n/)
            .some(site => {
                var url = new URL(details.url);
                return Boolean(url.hostname.indexOf(site) === 0);
            });

        if(toggleSitesAllowList.length && allowed){
            return { cancel: false };
        }

        let combinedList = [...defaultBlockedList, ...toggleSitesBlockList.split(/\n/)];
        const cancel = combinedList.some(site => {
            const url = new URL(details.url);
            return Boolean(url.hostname.indexOf(site) === 0);
        });

        return { cancel: cancel };
    },
    {
        urls: ["<all_urls>"]
    },
    [
        "blocking"
    ]
);

// any time a storage item is updated, update global variables
chrome.storage.onChanged.addListener(function(changes, namespace) {
    if (namespace === 'sync') {
        if (changes.toggleSitesActive) {
            toggleSitesActive = changes.toggleSitesActive.newValue;
        }
        if (changes.toggleSitesBlockList) {
            toggleSitesBlockList = changes.toggleSitesBlockList.newValue;
        }
        if (changes.toggleSitesAllowList) {
            toggleSitesAllowList = changes.toggleSitesAllowList.newValue;
        }
    }
});