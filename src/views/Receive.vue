
<template>
  <div class="centered-container">
    <md-content class="md-elevation-3">
      <div class="title">
        <div class="md-title">Receive Tokens</div>
      </div>

      <div>
        <span class="md-caption">My Address</span>
      </div>
      <div class="my-address">
        <span class="md-body2">{{ getKeypair.publicKey }}</span>
      </div>
      <qriously :value="getKeypair.publicKey" :size="200" class="qr-code"/>
    </md-content>
    <div class="background"/>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
export default {
  data() {
    return {
      loading: false
    };
  },
  computed: {
    localComputed() {
      return true;
    },
    ...mapGetters(["isAuthenticated", "getKeypair"])
  },
  methods: {}
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
.my-address {
  overflow-wrap: break-word;
  margin: 10px auto;
  text-align: left;
}
.qr-code {
  margin: 0 auto;
  text-align: center;
}
</style>
