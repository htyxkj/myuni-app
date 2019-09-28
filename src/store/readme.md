# 在uni-app typescript中如何使用vuex
## 第一步(安装vuex，vuex-module-decorators)
```
npm install --save vuex
npm install --save vuex-module-decorators
```
## 第二步(在src目录下创建store目录)
```
store目录结构
store
	index.ts//用于对外申明vuex模块
	module//用于存放分块的模型
```
## 第三步(编辑index.ts)
```
import Vue from 'vue' //导入vue包
import Vuex from 'vuex'//导入vuex包
import { ILogin } from './module/login'//导入登录模块
//import { XXX } from './module/xxx'//导入其他模块
Vue.use(Vuex)//Vue启用vuex
//导出根接口IRootState
export interface IRootState {
	login:ILogin,//登录模块
	//xxx:XXX
}

// Declare empty store first, dynamically register all modules later.
//先声明空存储，然后动态注册所有模块。
export default new Vuex.Store<IRootState>({})
```
## 第四步：在store/module目录下(编辑或者定义login.ts)
```
import {VuexModule,Module,Mutation,Action,getModule} from 'vuex-module-decorators'
import store from '../../store'

export interface ILogin {
	loginState:boolean;
}

@Module({ dynamic: true , store:store,name:'login'})
class Login extends VuexModule implements ILogin {
    //#region 属性
	public loginState = false
	
    //#endregion
    //#region 业务代码
	/**
	 * 申明Mutation，给属性赋值
	 */
	@Mutation
	private SET_LOGIN_STATE(Value:boolean){
		this.loginState = Value
		uni.setStorage({key:'islogin',data:this.loginState})
	}
	
	@Mutation
	ExitOut(){
		this.loginState = false
	}
    //#endregion
	
    //#region API
	/**
	 * Action调用Mutation有2中写法
	 * 第一种 Action({commit：'SET_LOGIN_STATE'})
	 *  commit对应的值为申明Mutation的方法名，如SET_LOGIN_STATE
	 */
	@Action({ commit: 'SET_LOGIN_STATE' })
	public setState(value:boolean){
		return value;
	}
	
	/**
	 * Action调用Mutation有2中写法
	 * 第二种 Action
	 * 在Action方法中直接调用，当方法使用
	 */
	@Action
	public setState(value:boolean){
		this.SET_LOGIN_STATE(value);
	}
	
	
	@Action({ commit: 'ExitOut' })
	public exitOut(){
	}
    //#endregion
}


export const LoginModule = getModule(Login)//导出模块

```
## 第五步：在main.ts中申明
```
import store from './store'
new App({
	store
}).$mount()
```
## 第六步：在组件中使用（如login.vue）
```
import {Vue,Provide,Component} from 'vue-property-decorator';
import { LoginModule} from '@/store/module/login';//导入vuex模块，自动注入
@Component({})
	export default class Login extends Vue{
		//获取vuex登录模块中的loginState
		get loginState(){
			return LoginModule.loginState
		}
		
		loginOK(){
			LoginModule.setState(true)
		}
	}
```