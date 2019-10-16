
<template>
  <div class="centered-container">
    <md-content class="md-elevation-3">
      <div class="title">
        <div class="md-title">Create Tokens</div>
      </div>

      <div class="form">
        <md-field>
          <label>Token Amount</label>
          <md-input v-model="amount" autofocus></md-input>
        </md-field>
      </div>

      <div class="actions md-layout md-alignment-center-space-between">
        <md-button
          class="md-raised md-primary full-width-button"
          @click="create"
          aria-placeholder="Enter"
        >Create</md-button>
      </div>

      <div class="loading-overlay" v-if="loading">
        <md-progress-spinner md-mode="indeterminate" :md-stroke="2"></md-progress-spinner>
      </div>

      <md-dialog-alert
        :md-active.sync="openDialog"
        :md-title="dialogTitle"
        :md-content="dialogContent"
      />
    </md-content>
    <div class="background"/>
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import cryptoUtils from "../utils/cryptoUtils";
const maxCreateAmount = 100;
export default {
  data() {
    return {
      loading: false,
      amount: "",
      openDialog: false,
      dialogTitle: "",
      dialogContent: ""
    };
  },
  computed: {
    localComputed() {
      return true;
    },
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
    create() {
      const amount = parseInt(cryptoUtils.normaliseText(this.amount), 10);
      if (!amount || amount <= 0) {
        this.renderDialog("Invalid Amount", `Please input correct amount`);
      } else if (amount && amount <= maxCreateAmount) {
        this.loading = true;
        const serverUrl = this.getServerUrl;
        const account = this.getAccount;
        account.id = this.getKeypair.publicKey;
        let tx = cryptoUtils.buildTx({
          type: "create",
          from: {},
          to: { ...account, keys: this.getKeypair },
          amount
        });
        console.log(JSON.stringify(tx));
        cryptoUtils
          .send(serverUrl, tx)
          // .then(data => {
          //   this.loading = false;
          //   this.renderDialog(
          //     "Success",
          //     "Tx is successfully submitted to server !"
          //   );
          //   this.amount = "";
          //   this.updateTabName({ tabName: "Transactions" });
          // })
          .catch(e => {
            this.loading = false;
            this.renderDialog("Error", JSON.stringify(e.message));
          });
        this.loading = false;
        this.renderDialog("Success", "Tx is submitted to Shardus network !");
        this.amount = "";
        this.updateTabName({ tabName: "Transactions" });
      } else {
        this.renderDialog(
          "Invalid Amount",
          `Cannot create more than ${maxCreateAmount} coins at a time`
        );
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
</style>
