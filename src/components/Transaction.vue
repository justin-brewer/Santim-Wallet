<template>
    <div class="transaction">
        <div class="md-layout md-gutter label-row">
            <div class="md-layout-item md-size-15"></div>
            <div class="md-layout-item md-size-35"><span class="md-caption">{{getTxType}}</span></div>
            <div class="md-layout-item md-size-50 timestamp"><span class="md-caption">{{getDate}}</span></div>
        </div>
        <div class="md-layout md-gutter transaction-info-row">
            <div class="md-layout-item md-size-15" v-if="getTxType === 'sent to'">
                <span style="color: orange">
                <i class="fas fa-arrow-circle-left fa-lg" aria-hidden="true"></i>
                </span>
            </div>
            <div class="md-layout-item md-size-15" v-else>
                <span style="color: #448aff">
                <i class="fas fa-arrow-circle-right fa-lg" aria-hidden="true"></i>
                </span>
            </div>
            <div class="md-layout-item md-size-85" v-if="getTxType === 'received from'">{{transaction.from}}</div>
            <div class="md-layout-item md-size-85" v-else>{{transaction.to}}</div>
        </div>
        <div class="md-layout md-gutter transaction-amount-row">
            <div class="md-layout-item md-size-15"></div>
            <div class="md-layout-item md-size-85">
                <span class="md-subheading sent-amount" :style="`color: ${amountColor}`">
                    {{amountSign}}{{transaction.amount}}
                </span>
            </div>
        </div>
        <md-divider></md-divider>
    </div>
</template>
<script>
import { mapGetters } from 'vuex'
import moment from 'moment'
export default {
  data () {
    return {
      loading: false
    }
  },
  props: ['transaction'],
  computed: {
    ...mapGetters(['getAccount']),
    getTxType () {
      let address = this.getAccount.address
      let transaction = this.transaction
      if (transaction.type) return transaction.type
      if (transaction.type === 'create') return 'created'
      if (transaction.type === 'transfer' && transaction.from === address) return 'sent to'
      return 'received from'
    },
    getDate () {
      return moment(this.transaction.txnTimestamp).calendar()
    },
    amountSign () {
      if (this.getTxType === 'sent to') return '-'
      else return '+'
    },
    amountColor () {
      if (this.getTxType === 'sent to') return 'orange'
      else return '#448aff'
    },
    isSelfTxn () {
      return this.transaction.srcAct === this.transaction.tgtAct
    }
  }
}
</script>

<style scoped>
.transaction {
    margin-bottom: 15px;
}
.transaction-info-row {
    overflow-wrap: break-word;
    margin-top: 5px;
}
.transaction-amount-row {
    margin-top: 5px;
    margin-bottom: 10px;
}
.timestamp {
    text-align: right;
}
.sent-amount {
    /* color: #ff5722; */
    margin-top: 15px;
    font-size: 18px;
}
</style>
