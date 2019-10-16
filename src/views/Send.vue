<template>
  <div class="centered-container">
    <md-content class="md-elevation-3">
      <div class="title">
        <div class="md-title">Send Tokens</div>
      </div>
      <qrcode-stream
        @decode="onDecode"
        @init="onInit"
        :paused="pauseQrReader"
        :camera="camera"
        :style="styleObject"
      />
      <div class="form send-form">
        <md-field class="receiver-address-field">
          <label>Receiver Address</label>
          <md-input v-model="receiverAddress"></md-input>
          <i class="fas fa-qrcode fa-lg" aria-hidden="true" @click="toggleQrReader"></i>
        </md-field>
        <md-field>
          <label>Token Amount</label>
          <md-input v-model="amount" autofocus></md-input>
        </md-field>
      </div>
      <div class="actions md-layout md-alignment-center-space-between">
        <md-button
          class="md-raised md-primary full-width-button"
          @click="send"
          aria-placeholder="Enter"
        >Send</md-button>
      </div>
      <div class="loading-overlay" v-if="loading">
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
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import cryptoUtils from "../utils/cryptoUtils";
import Vue from "vue";
import VueQrcodeReader from "vue-qrcode-reader";
const defaultCamera = {
  audio: false, // don't request microphone access
  video: {
    facingMode: { ideal: "environment" }, // use rear camera if available
    width: { min: 360, ideal: 680, max: 1920 }, // constrain video width resolution
    height: { min: 240, ideal: 480, max: 1080 } // constrain video height resolution
  }
};

Vue.use(VueQrcodeReader);
export default {
  data() {
    return {
      loading: false,
      displayQrReader: false,
      pauseQrReader: false,
      amount: "",
      receiverAddress: "",
      camera: false,
      styleObject: {
        display: "none"
      },
      openDialog: false,
      dialogTitle: "",
      dialogContent: "",
      error: ""
    };
  },
  computed: {
    ...mapGetters([
      "isAuthenticated",
      "getKeypair",
      "getServerUrl",
      "getAccount"
    ])
  },
  methods: {
    ...mapActions(["updateTabName"]),
    renderDialog(title, message) {
      this.openDialog = true;
      this.dialogTitle = title;
      this.dialogContent = message;
    },
    isValidHex(hex) {
      if (hex.length !== 64) return false;
      if (hex === "0".repeat(64)) return false;
      return true;
    },
    send() {
      const amount = parseInt(this.amount, 10);
      const account = this.getAccount;
      if (
        amount &&
        amount > 0 &&
        this.isValidHex(this.receiverAddress) &&
        account.data.balance >= amount
      ) {
        this.loading = true;
        const serverUrl = this.getServerUrl;
        const receiver = cryptoUtils.normaliseText(this.receiverAddress);
        let tx = cryptoUtils.buildTx({
          type: "transfer",
          from: { ...account, keys: this.getKeypair },
          to: { id: receiver },
          amount
        });
        cryptoUtils
          .send(serverUrl, tx)
          // .then(data => {
          //   this.loading = false;
          //   this.renderDialog(
          //     "Success",
          //     "Tx is successfully submitted to server !"
          //   );
          //   this.amount = "";
          //   this.receiverAddress = "";
          //   this.updateTabName({ tabName: "Transactions" });
          // })
          .catch(e => {
            this.loading = false;
            this.renderDialog("Error", e.message);
          });
        this.loading = false;
        this.renderDialog("Success", "Tx is submitted to Shardus network !");
        this.amount = "";
        this.receiverAddress = "";
        this.updateTabName({ tabName: "Transactions" });
      } else {
        this.renderDialog(
          "Error",
          "Invalid token amount or receiver address !"
        );
      }
    },
    toggleQrReader() {
      if (!this.displayQrReader) {
        this.displayQrReader = true;
        this.styleObject = {
          display: "block"
        };
        this.camera = defaultCamera;
        this.pauseQrReader = false;
      } else {
        this.displayQrReader = false;
        this.styleObject = {
          display: "none"
        };
        this.camera = false;
        this.pauseQrReader = true;
      }
    },
    onDecode(decodedString) {
      this.receiverAddress = decodedString;
      this.toggleQrReader();
    },
    renderQrReader() {
      if (this.displayQrReader) {
        return `<qrcode-stream @decode="onDecode" @init="onInit" :paused="pauseQrReader" :camera="camera"/>`;
      }
    },
    async onInit(promise) {
      try {
        await promise;
      } catch (error) {
        if (error.name === "NotAllowedError") {
          this.error = "ERROR: you need to grant camera access permisson";
        } else if (error.name === "NotFoundError") {
          this.error = "ERROR: no camera on this device";
        } else if (error.name === "NotSupportedError") {
          this.error = "ERROR: secure context required (HTTPS, localhost)";
        } else if (error.name === "NotReadableError") {
          this.error = "ERROR: is the camera already in use?";
        } else if (error.name === "OverconstrainedError") {
          this.error = "ERROR: installed cameras are not suitable";
        } else if (error.name === "StreamApiNotSupportedError") {
          this.error = "ERROR: Stream API is not supported in this browser";
        }
        this.renderDialog("QR Code Reader Error", this.error);
      }
    }
  }
};
</script>

<style scoped>
.centered-container {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  position: relative;
  height: 100vh;
  margin: 20px auto;
  max-width: 500px;
}
.title {
  text-align: center;
  margin-bottom: 30px;
}
.actions .md-button {
  margin: 0;
}
.form {
  margin-bottom: 60px;
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
.send-form .fa-qrcode {
  cursor: pointer;
}
.send-form .fa-qrcode:hover {
  color: #448aff;
}
</style>
