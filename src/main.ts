import Vue from 'vue'
import App from './App.vue'
import cuCustom from './lib/colorui/components/cu-custom.vue'
Vue.component('cu-custom',cuCustom)
import boboMessage from './components/bobo-message/bobo-message.vue'
Vue.component('message', boboMessage)
Vue.config.productionTip = false

new App().$mount()
