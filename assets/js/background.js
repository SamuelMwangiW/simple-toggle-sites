// when the extension is first installed, set default values
chrome.runtime.onInstalled.addListener(function() {
    chrome.storage.sync.set({
        toggleSitesActive: false,
        toggleSitesBlockList: 'example.com',
        toggleSitesAllowList: 'example.org',
    }, function() {});
});

// set up initial chrome storage values
var toggleSitesActive = false;
var toggleSitesBlockList = 'example.com';
var toggleSitesAllowList = 'example.org';

chrome.storage.sync.get([
    'toggleSitesActive',
    'toggleSitesBlockList',
    'toggleSitesAllowList'
], function(result) {
    toggleSitesActive = result.toggleSitesActive;
    toggleSitesBlockList = result.toggleSitesBlockList;
    toggleSitesAllowList = result.toggleSitesAllowList;
});

// on each site request, block if it's in toggleSitesBlockList
chrome.webRequest.onBeforeRequest.addListener(
    function(details) {
        // if the toggle is inactive, don't block anything
        if (!toggleSitesActive) {
            return { cancel: false };
        }

        // determine if the url is in toggleSitesBlockList
        var allowed = toggleSitesAllowList.split(/\n/)
            .some(site => {
                var url = new URL(details.url);
                return Boolean(url.hostname.indexOf(site) !== -1);
            });

        if(toggleSitesAllowList.length && allowed){
            return { cancel: false };
        }

        var cancel = toggleSitesBlockList.split(/\n/)
            .some(site => {
                var url = new URL(details.url);

                return Boolean(url.hostname.indexOf(site) !== -1);
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