import Vue from 'vue'
import Hello from './hello.vue'

Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  el: '#app',
  template: '<Hello/>',
  components: { Hello }
})