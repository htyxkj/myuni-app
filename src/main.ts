import Vue from 'vue'
import App from './App.vue'
import cuCustom from './lib/colorui/components/cu-custom.vue'
Vue.component('cu-custom',cuCustom)
Vue.config.productionTip = false

new App().$mount()
