<template>
  <div class="centered-container">
    <md-content class="md-elevation-3">
      <div class="title">
        <span class="md-title">BALANCE :</span>
        <span class="md-display-1">{{ getAccount.data.balance }}</span>
        <span class="md-caption">ULT</span>
      </div>
      <transaction v-for="tx in txList" :key="tx.txnTimestamp * Math.random()" :transaction="tx"/>
    </md-content>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import Transaction from "@/components/Transaction.vue";
export default {
  components: { Transaction },
  data() {
    return {
      loading: false
    };
  },
  computed: {
    ...mapGetters(["isAuthenticated", "getTxList", "getAccount"]),
    txList() {
      let originalTxList = this.getTxList.map(tx => tx);
      let txList = [];
      for (let i = 0; i < originalTxList.length; i += 1) {
        const isSelfTransfer =
          originalTxList[i].srcAct === originalTxList[i].tgtAct;
        if (isSelfTransfer) {
          txList.push({
            ...originalTxList[i],
            type: "received from"
          });
        }
        txList.push(originalTxList[i]);
      }
      return txList.sort((a, b) => b.txnTimestamp - a.txnTimestamp);
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
  min-height: 100vh;
  margin: 20px auto;
  max-width: 500px;
  text-align: left;
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
.tab-transactions .md-content {
  padding: 15px;
}
</style>
