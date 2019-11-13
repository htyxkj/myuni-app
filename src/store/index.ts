import Vue from 'vue'
import Vuex from 'vuex'

import { ILogin } from './module/login'
import { IUripm } from './module/uripm'
import { IInsAid } from './module/insaid'
import { IEnvInfo } from './module/envmode'
Vue.use(Vuex)

export interface IRootState {
	login:ILogin,
	uripm:IUripm,
	insaid:IInsAid,
	envInfo:IEnvInfo
}

// Declare empty store first, dynamically register all modules later.
export default new Vuex.Store<IRootState>({})
