import {VuexModule,Module,Mutation,Action,getModule} from 'vuex-module-decorators'
import store from '../../store'
import User from '@/classes/User';
import Menu from '@/classes/Menu';
export interface ILogin {
	loginState:boolean;
	user:User;
	menus:Array<Menu>;
	snkey:string
}

@Module({ dynamic: true , store:store,name:'login'})
class Login extends VuexModule implements ILogin {
    //#region 属性
	public loginState = false//必须使用public，不然在组件中找不到属性
	
	public user = new User('','','')
	public menus =new Array<Menu>()
	public snkey = "";
    //#endregion
    //#region 业务代码
	@Mutation
	private SET_USER(Value:User){
		this.user = Value
		uni.setStorage({key:'user',data:JSON.stringify(this.user)})
	}
	
	@Mutation
	private SET_LOGIN_STATE(Value:boolean){
		this.loginState = Value
		uni.setStorage({key:'isLogin',data:Value})
	}
	@Mutation
	private SET_MENUS(Value:Array<Menu>){
		this.menus = Value
		uni.setStorage({key:'menus',data:JSON.stringify(this.menus)})
	}
	@Mutation
	private SET_SNKEY(value:any){
		this.snkey = value;
		uni.setStorage({key:'snkey',data:value})
	}
    //#endregion
    //#region API
  
	/**
	 * 退出登录状态
	 * 将当前用户清空
	 * 登录状态清空
	 */
	
	@Action({ commit: 'SET_USER' })
	 // @Action
	public setUser(user:User){
		// this.SET_USER(user)
		return user;
	}
	@Action({ commit: 'exitOut' })
	public exitOut(){
		this.user = new User('','','');
		this.loginState = false
	}
	
	@Action({commit:'SET_LOGIN_STATE'})
	public setState(value:boolean){
		return value;
	}
	
	@Action({commit:'SET_MENUS'})
	public setMenus(value:Array<Menu>){
		return value;
	}
	
	@Action({commit:'SET_SNKEY'})
	public setSnKey(value:string){
		return value;
	}
	
    //#endregion
	
	//#region
	//#endregion
}


export const LoginModule = getModule(Login)
