<template>
  <div class = "wrapper">
    <h1 class = "title">Simple Ad Blocker</h1>
    <div class = "buttons">
      <button type = "button"
              class = "state-off"
              :class = "{'is-active': !active}"
              @click = "setActive(false)">Off
      </button>
      <button type = "button"
              class = "state-on"
              :class = "{'is-active': active}"
              @click = "setActive(true)">On
      </button>
    </div>
    <div class = "sites">
      <p>Additional Blocked sites, one per line</p>
      <textarea rows = "8"
                autocomplete = "off"
                placeholder = "Blocked sites"
                autocapitalize = "off"
                spellcheck = "false"
                v-model = "blockList"></textarea>
    </div>
    <div class = "sites">
      <p>Allowed sites, one per line</p>
      <textarea rows = "8"
                autocomplete = "off"
                placeholder = "Blocked sites"
                autocapitalize = "off"
                spellcheck = "false"
                v-model = "allowList"></textarea>
    </div>
    <button type = "button"
            class = "state-save"
            @click = "saveList">Save Site List
    </button>
  </div>
</template>
<script>
export default {
  data() {
    return {
      active: true,
      blockList: "example.com",
      allowList: "example.org",
      icons: {
        active: 'images/icon-48x48.png',
        inactive: 'images/icon-48x48-off.png'
      }
    }
  },
  created() {
    chrome.storage.sync.get(['toggleSitesActive', 'toggleSitesBlockList','toggleSitesAllowList'], (result) => {
      this.active = result.toggleSitesActive;
      this.blockList = result.toggleSitesBlockList;
      this.allowList = result.toggleSitesAllowList;
    });
  },
  methods: {
    setActive(active) {
      this.active = active;
      chrome.storage.sync.set({
        toggleSitesActive: active
      }, () => {
      });

      chrome.browserAction.setIcon({
        path: this.icons[active ? 'active' : 'inactive']
      });
    },
    saveList() {
      chrome.storage.sync.set({
        toggleSitesBlockList: this.blockList,
        toggleSitesAllowList: this.allowList,
      }, () => {
      });
    }
  }
}
</script>