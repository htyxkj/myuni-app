import Vue from 'vue'
import Vuex from 'vuex'
import { IComponent } from './module/component'
import { ILogin } from './module/login'
Vue.use(Vuex)

export interface IRootState {
    component: IComponent,
	login:ILogin
}

// Declare empty store first, dynamically register all modules later.
export default new Vuex.Store<IRootState>({})
