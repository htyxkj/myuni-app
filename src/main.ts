import Vue from 'vue'
import App from './App.vue'
// import {http} from '@/lib/http/index.js'
import store from './store'
Vue.config.productionTip = false
import cuCustom from './lib/colorui/components/cu-custom.vue'
Vue.component('cu-custom',cuCustom)
import comm from '@/static/js/comm.js';
let commURL:any = comm;
// http.config.baseUrl = commURL.BaseUri
// Vue.prototype.$http = http
new App({
	store
}).$mount()