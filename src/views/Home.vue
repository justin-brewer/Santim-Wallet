<template>
  <div>
    <vue-tabs
      active-tab-color="#2f73e4"
      active-text-color="white"
      type="pills"
      text-position="hidden"
      centered
      @tab-change="handleTabChange"
      v-model="tabName"
    >
      <v-tab title="Transactions" icon="fas fa-file-alt fa-lg">
        <Transactions/>
      </v-tab>

      <v-tab title="Create" icon="fas fa-hand-holding-usd fa-lg">
        <Create/>
      </v-tab>

      <v-tab title="Send" icon="fas fa-share fa-lg">
        <Send/>
      </v-tab>

      <v-tab title="Receive" icon="fas fa-qrcode fa-lg">
        <Receive/>
      </v-tab>

      <v-tab title="Setting" icon="fas fa-cog fa-lg">
        <Setting/>
      </v-tab>
    </vue-tabs>

    <md-dialog-alert
      :md-active.sync="openDialog"
      :md-title="dialogTitle"
      :md-content="dialogContent"
    />
    <md-snackbar :md-duration="2000" :md-active.sync="showSnackbar" md-persistent>
      <span>{{ errorMessage }}</span>
      <md-button class="md-primary" @click="showSnackbar = false">Dismiss</md-button>
    </md-snackbar>
  </div>
</template>

<script>
import Transactions from "./TransactionsList.vue";
import Create from "./Create.vue";
import Receive from "./Receive.vue";
import Send from "./Send.vue";
import Setting from "./Setting.vue";
import { mapActions, mapGetters } from "vuex";
import cryptoUtils from "../utils/cryptoUtils.js";
export default {
  name: "TabRouter",
  components: { Transactions, Create, Receive, Send, Setting },
  data() {
    return {
      openDialog: false,
      dialogTitle: "",
      dialogContent: "",
      showSnackbar: false,
      errorMessage: "",
      tabName: "Create"
    };
  },
  created: async function() {
    await this.loadAccount();
  },
  mounted: async function() {
    let address = this.getKeypair.publicKey;
    let serverUrl = this.getServerUrl;
    let self = this;

    setInterval(async () => {
      this.refresh();
    }, 2000);
    cryptoUtils.getAccount(serverUrl, address).then(function(account) {
      if (account.balance > 0) {
        self.tabName = "Transactions";
        self.updateTabName({ tabName: "Transactions" });
      }
    });
  },
  computed: {
    ...mapGetters([
      "isAuthenticated",
      "getKeypair",
      "getServerUrl",
      "getAccount",
      "getUpdateStatus",
      "getTxList",
      "getAuthStatus",
      "getTabName"
    ])
  },
  methods: {
    ...mapActions([
      "createAccount",
      "loadAccount",
      "updateAccount",
      "updateTxList",
      "updateStatus",
      "updateTabName"
    ]),
    renderDialog(title, message) {
      this.openDialog = true;
      this.dialogTitle = title;
      this.dialogContent = message;
    },
    handleTabChange(tabIndex, newTab, oldTab) {
      this.updateTabName({ tabName: newTab.title });
    },
    async refresh() {
      // console.log(`TabName is : ${this.getTabName}`)
      // console.log(this.tabName)
      let address;
      let serverUrl;
      let updated;
      let currentTxList;
      let isAuthenticated;
      try {
        address = this.getKeypair.publicKey;
        serverUrl = this.getServerUrl;
        updated = this.getUpdateStatus;
        currentTxList = this.getTxList;
        isAuthenticated = this.getAuthStatus;
      } catch (e) {
        return;
      }
      try {
        if (address && isAuthenticated) {
          let account = await cryptoUtils.getAccount(serverUrl, address);
          let txList = await cryptoUtils.getHistory(
            serverUrl,
            address,
            currentTxList
          );
          this.tabName = this.getTabName;
          // console.log(`server account balance: ${account.balance}`);
          // console.log(`local account balance: ${this.getAccount.balance}`);
          if (!updated) {
            if (
              txList.length !== currentTxList.length ||
              this.getAccount.balance !== account.balance
            ) {
              this.updateAccount({ account });
              this.updateTxList({ txList });
              this.updateStatus({ updated: true });
            }
          } else {
            this.updateStatus({ updated: false });
          }
        }
      } catch (e) {
        this.showSnackbar = true;
        this.errorMessage = `Error: ${e.message}`;
      }
    }
  }
};
</script>

<style>
#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
#nav {
  padding: 30px;
}

#nav a {
  font-weight: bold;
  color: #2c3e50;
}

#nav a.router-link-exact-active {
  color: #42b983;
}
.md-content.md-tabs-content.md-theme-default {
  padding: 0px;
}
.md-tabs-content {
  height: 100vh;
}
.tabs__link {
  background: #448aff;
  border-radius: 0px !important;
  color: #fff !important;
}
.nav.nav-pills.nav-justified {
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: space-between;
  flex-grow: 1;
}
.nav.nav-pills.nav-justified .tab {
  flex-grow: 1;
  margin: 0;
}
</style>
