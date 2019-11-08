import Vue from 'vue'
import Vuex from 'vuex'
import { IComponent } from './module/component'
import { ILogin } from './module/login'
import { IUripm } from './module/uripm'
import { IInsAid } from './module/insaid'
Vue.use(Vuex)

export interface IRootState {
    component: IComponent,
	login:ILogin,
	uripm:IUripm,
	insaid:IInsAid
}

// Declare empty store first, dynamically register all modules later.
export default new Vuex.Store<IRootState>({})
