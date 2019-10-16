
<template>
  <div>
    <div class="centered-container">
      <md-content class="md-elevation-3">
        <div class="title">
          <div class="md-title">Server URL</div>
        </div>
        <div class="form">
          <md-field>
            <label>Server Address</label>
            <md-input autofocus :value="getServerUrl" v-on:change="onServerUrlChange"></md-input>
          </md-field>
        </div>
        <div class="actions md-layout md-alignment-center-space-between">
          <md-button
            class="md-raised md-primary full-width-button"
            @click="changeServer"
            aria-placeholder="Enter"
          >Change Server</md-button>
        </div>
        <div class="loading-overlay" v-if="serverURLLoading">
          <md-progress-spinner md-mode="indeterminate" :md-stroke="2"></md-progress-spinner>
        </div>
      </md-content>
      <div class="background"/>
    </div>

    <div class="centered-container">
      <md-content class="md-elevation-3">
        <div class="title">
          <div class="md-title">Import / Export Wallet</div>
        </div>
        <div class="actions md-layout md-alignment-center-space-between">
          <md-button
            class="md-raised md-primary import-button"
            @click="importWallet"
            aria-placeholder="Enter"
          >Import from Google Drive</md-button>
        </div>
        <div class="actions md-layout md-alignment-center-space-between">
          <md-button
            class="md-raised md-primary export-button"
            @click="exportWallet"
            aria-placeholder="Enter"
          >Export to Google Drive</md-button>
        </div>
        <div class="loading-overlay" v-if="importLoading">
          <md-progress-spinner md-mode="indeterminate" :md-stroke="2"></md-progress-spinner>
        </div>
      </md-content>
      <div class="background"/>
    </div>

    <div class="centered-container">
      <md-content class="md-elevation-3">
        <div class="title">
          <div class="md-title">User Account</div>
        </div>
        <div class="actions md-layout md-alignment-center-space-between">
          <md-button
            class="md-raised md-accent export-button"
            @click="logout"
            aria-placeholder="Enter"
          >Log Out</md-button>
        </div>
        <div class="loading-overlay" v-if="importLoading">
          <md-progress-spinner md-mode="indeterminate" :md-stroke="2"></md-progress-spinner>
        </div>
      </md-content>
      <div class="background"/>
      <md-dialog-alert
        :md-active.sync="openDialog"
        :md-title="dialogTitle"
        :md-content="dialogContent"
      />
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import firebase from "firebase";
import GDrive from "../utils/googleDrive/GDrive.js";
import cryptoUtils from "../utils/cryptoUtils.js";

export default {
  data() {
    return {
      importLoading: false,
      serverURLLoading: false,
      editedServerUrl: "",
      openDialog: false,
      dialogTitle: "",
      dialogContent: ""
    };
  },
  computed: {
    ...mapGetters(["isAuthenticated", "getServerUrl", "getKeypair"])
  },
  methods: {
    renderDialog(title, message) {
      this.openDialog = true;
      this.dialogTitle = title;
      this.dialogContent = message;
    },
    changeServer() {
      this.serverURLLoading = true;
      if (this.editedServerUrl !== "") {
        this.updateServer({ serverUrl: this.editedServerUrl });
      }
      setTimeout(() => {
        this.serverURLLoading = false;
      }, 1000);
    },
    onServerUrlChange(e) {
      this.editedServerUrl = e.target.value;
    },
    logout: function() {
      firebase
        .auth()
        .signOut()
        .then(() => {
          localStorage.removeItem("keypair");
          this.updateAuthStatus({ isAuthenticated: false });
          this.updateAccount({
            address: null,
            balance: 0,
            sequence: 0,
            keys: null
          });
          this.updateKeypair({ keypair: null });
          this.resetTxList();
          this.$router.replace("login");
        });
    },
    initialGoogle: function() {
      return new Promise((resolve, reject) => {
        try {
          gapi.load("auth2", async () => {
            if (!gapi.auth2.getAuthInstance()) {
              // TODO: put google credentials in seperate file
              await gapi.auth2.init({
                apiKey: "-UqBRtpAMRFSqIzBP7qh7WR8",
                clientId:
                  "486106013722-be8fm8avqkrij76b65c08kils391gbfa.apps.googleusercontent.com",
                scope:
                  "https://www.googleapis.com/auth/drive https://www.googleapis.com/auth/drive.appdata https://www.googleapis.com/auth/drive.file",
                discoveryDocs: [
                  "https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"
                ]
              });
            }
            gapi.auth2.getAuthInstance().isSignedIn.listen(isSignedIn => {
              this.updateSignInStatus(isSignedIn);
              resolve();
            });
            if (
              gapi.auth2.getAuthInstance() &&
              !gapi.auth2.getAuthInstance().isSignedIn.get()
            ) {
              try {
                gapi.auth2.getAuthInstance().signIn();
              } catch (e) {
                this.updateSignInStatus(true);
                resolve();
              }
            }
            if (gapi.auth2.getAuthInstance().isSignedIn.get()) {
              this.updateSignInStatus(true);
              resolve();
            }
          });
        } catch (e) {
          console.log(e);
          reject(e);
        }
      });
    },
    updateSignInStatus(isSignedIn) {
      if (isSignedIn) {
        const token = gapi.auth2
          .getAuthInstance()
          .currentUser.get()
          .getAuthResponse().access_token;
        GDrive.setAccessToken(token);
        GDrive.init();
      }
    },
    async exportWallet() {
      try {
        await this.initialGoogle();
      } catch (e) {
        console.log(e);
      }
      console.log(GDrive.isInitialized());
      if (GDrive.isInitialized()) {
        try {
          let res = await GDrive.files.createFileMultipart(
            JSON.stringify(this.getKeypair),
            "text/plain",
            {
              parents: ["root"],
              name: "Wallet"
            }
          );
          console.log(res);
          if (res.ok) {
            this.renderDialog(
              "Export Success",
              "Your wallet credentials are successfully exported to your Google Drive."
            );
          } else {
            console.log(res.headers);
            this.renderDialog(
              "Export Failed",
              "Something went wrong while trying to export your wallet to Google Drive"
            );
          }
        } catch (e) {
          console.log(e);
        }
      }
    },
    async importWallet() {
      await this.initialGoogle();
      if (GDrive.isInitialized()) {
        try {
          let fileId = await GDrive.files.getId(
            "Wallet",
            ["root"],
            "text/plain"
          );
          let res = await GDrive.files.get(fileId, {
            alt: "media"
          });
          if (res.ok) {
            let keypair = await res.json();
            if (keypair && keypair.publicKey && keypair.secretKey) {
              this.updateKeypair({ keypair });
              let serverUrl = this.getServerUrl;
              setTimeout(() => {
                cryptoUtils
                  .getAccount(serverUrl, keypair.publicKey)
                  .then(account => {
                    console.log(account);
                    this.updateAccount({ account });
                  });
              }, 100);
            }
            this.renderDialog(
              "Import Success",
              "Your wallet credentials are successfully imported from your Google Drive."
            );
          } else {
            console.log(e);
            this.renderDialog(
              "Import Fail",
              "Something went wrong while trying to import your wallet credentials from Google Drive"
            );
          }
        } catch (e) {
          console.log(e);
          this.renderDialog(
            "Import Fail",
            "Something went wrong while trying to import your wallet credentials from Google Drive"
          );
        }
      }
    },
    ...mapActions([
      "updateServer",
      "updateKeypair",
      "updateAccount",
      "updateAuthStatus",
      "resetTxList"
    ])
  }
};
</script>

<style scoped>
.centered-container {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  position: relative;
  margin: 10px auto;
  margin-bottom: 20px;
  max-width: 500px;
  height: auto;
}
.title {
  text-align: left;
  margin-bottom: 15px;
}
.actions .md-button {
  margin: 0;
}
.form {
  margin-bottom: 20px;
}
.md-content {
  z-index: 1;
  padding: 40px;
  width: 100%;
  max-width: 100%;
  position: relative;
}
.loading-overlay {
  z-index: 10;
  top: 0;
  left: 0;
  right: 0;
  position: absolute;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
}
.full-width-button {
  width: 100%;
}
.import-button,
.export-button {
  width: 100%;
  margin: 10px auto !important;
}
.logout-button {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  position: relative;
  margin: 10px auto;
  margin-bottom: 20px;
  max-width: 500px;
}
</style>
