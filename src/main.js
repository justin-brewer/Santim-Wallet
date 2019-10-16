import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import VueMaterial from 'vue-material'
import 'vue-material/dist/vue-material.min.css'
import 'vue-material/dist/theme/default.css'
import VueQriously from 'vue-qriously'
import firebase from 'firebase'
import VueTabs from 'vue-nav-tabs'
import 'vue-nav-tabs/themes/vue-tabs.css'

Vue.config.productionTip = false
Vue.use(VueMaterial)
Vue.use(VueQriously)
Vue.use(VueTabs)

const firebaseConfig = {
  apiKey: "AIzaSyBcA11GsDWLKuqYNq2gXrKRy2EOYT_f3fA",
  authDomain: "web-client-vue-1546923755509.firebaseapp.com",
  databaseURL: "https://web-client-vue-1546923755509.firebaseio.com",
  projectId: "web-client-vue-1546923755509",
  storageBucket: "web-client-vue-1546923755509.appspot.com",
  messagingSenderId: "486106013722"
}
let app = ''
firebase.initializeApp(firebaseConfig)

firebase.auth().onAuthStateChanged(async (user) => {
  if (user) {
    store.commit('setAuthStatus', {
      isAuthenticated: true
    })
    store.commit('setIsRegistered', {
      isRegistered: true
    })
  }
  if (!app) {
    /* eslint-disable no-new */
    app = new Vue({
      router,
      store,
      render: h => h(App)
    }).$mount('#app')
  }
})
