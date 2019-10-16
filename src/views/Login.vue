<template>
  <div>
    <div class="shardus-welcome">
      <img alt="shardus logo" src="../assets/logo.png" id="shardus-logo">
    </div>
    <div class="form auth-form">
      <md-field class="email-field">
        <label>Email</label>
        <md-input v-model="email" required></md-input>
      </md-field>
      <md-field>
        <label>Password</label>
        <md-input v-model="password" type="password" required></md-input>
      </md-field>
      <md-button
        class="md-raised md-primary half-width-button"
        @click="login"
        aria-placeholder="Enter"
      >Sign In</md-button>
      <p>
        Please
        <router-link to="/register">Register</router-link>if you haven't created an account yet.
      </p>
    </div>
    <div class="loading-overlay" v-if="loading">
      <md-progress-spinner md-mode="indeterminate" :md-stroke="2"></md-progress-spinner>
    </div>
    <md-dialog-alert
      :md-active.sync="openDialog"
      :md-title="dialogTitle"
      :md-content="dialogContent"
    />
  </div>
</template>

<script>
import firebase from "firebase";
import { mapActions, mapGetters } from "vuex";
import cryptoUtils from "../utils/cryptoUtils";
export default {
  name: "login",
  data() {
    return {
      email: "",
      password: "",
      loading: false,
      openDialog: false,
      dialogTitle: "",
      dialogContent: ""
    };
  },
  computed: {
    ...mapGetters([
      "getAuthStatus",
      "getKeypair",
      "getServerUrl",
      "getAccount",
      "getUpdateStatus",
      "getTxList"
    ])
  },
  methods: {
    ...mapActions([
      "updateAuthStatus",
      "updateKeypair",
      "updateAccount",
      "loadAccount"
    ]),
    renderDialog(title, message) {
      this.openDialog = true;
      this.dialogTitle = title;
      this.dialogContent = message;
    },
    login: async function() {
      this.loading = true;
      firebase
        .auth()
        .signInWithEmailAndPassword(
          cryptoUtils.normaliseText(this.email),
          cryptoUtils.normaliseText(this.password)
        )
        .then(
          async user => {
            this.loading = false;
            await this.loadAccount();
            this.updateAuthStatus({ isAuthenticated: true });
            this.$router.replace("home");
          },
          err => {
            this.loading = false;
            this.renderDialog("Oops", err.message);
          }
        );
    }
  }
};
</script>

<style scoped>
/* "scoped" attribute limit the CSS to this component only */
.login {
  margin-top: 40px;
}
input {
  margin: 10px 0;
  width: 20%;
  padding: 15px;
}
button {
  margin-top: 20px;
  width: 10%;
  cursor: pointer;
}
p {
  margin-top: 40px;
  font-size: 13px;
}
p a {
  text-decoration: underline;
  cursor: pointer;
}
.shardus-welcome {
  margin-top: 50px;
}
.auth-form {
  width: 80%;
  max-width: 400px;
  margin: 20px auto;
}
#shardus-logo {
  width: 250px;
  display: inline-block;
  margin: 10px auto;
}
.full-width-button {
  width: 100%;
  height: 45px;
  margin: 20px auto;
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
</style>