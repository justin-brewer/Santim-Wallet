import firebase from 'firebase'
import Vue from 'vue'
import Router from 'vue-router'

import Home from '@/views/Home'
import Login from '@/views/Login'
import Register from '@/views/Register'
import store from './store'

Vue.use(Router)

const router = new Router({
  routes: [
    {
      path: '*',
      redirect: '/home'
    },
    {
      path: '/',
      redirect: '/home'
    },
    {
      path: '/login',
      name: 'Login',
      component: Login
    },
    {
      path: '/register',
      name: 'Register',
      component: Register
    },
    {
      path: '/home',
      name: 'Home',
      component: Home,
      meta: {
        requiresAuth: true
      }
    }
  ]
})

router.beforeEach(async (to, from, next) => {
  const currentUser = firebase.auth().currentUser
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  if (!currentUser) {
    await store.dispatch('loadLastSignIn')
    let isRegistered = store.getters.getIsRegistered
    if (isRegistered) {
      console.log('you are already registered from this browser once')
      if (to.path === '/login') next()
      if (to.path === '/register') next()
      else next('login')
    } else {
      console.log('you are not registered from this browser')
      if (to.path === '/register') next()
      if (to.path === '/login') next()
      else next('register')
    }
  } else if (!requiresAuth && currentUser) next('home')
  else next()
})

export default router
