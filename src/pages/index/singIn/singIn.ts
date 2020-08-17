import * as dd from 'dingtalk-jsapi';
import {Vue,Provide,Component} from 'vue-property-decorator';
import User from '@/classes/User';
import Menu from '@/classes/Menu';
import comm from '@/static/js/comm.js';
let commURL: any = comm;
import { BIPUtil } from '@/classes/api/request';
let tools = BIPUtil.ServApi;
import { LoginModule } from '@/store/module/login'; //导入vuex模块，自动注入
import { isFunction } from 'xe-utils/methods';

export namespace singIn {
	class ServerUtils {
		route:any = null;//route
		jumpRoute:string="";//跳转路由
		corpId:string="";  //企业唯一码  
		appId:string="";   //默认00
		agentId:string="";//应用id
		//第三方单点登录
		async init(route:any){
			this.route = route;
            if(this.route.jumpRoute)
				this.jumpRoute = this.route.jumpRoute;
            if (dd.env.platform !="notInDingTalk") {//钉钉内
                await this.loginDD();
                return;
            }
		}
		//钉钉内免密登录
		async loginDD(){
			//禁用iOS Webview弹性效果
            dd.ui.webViewBounce.disable({onSuccess: function() {},onFail: function() {}});
            if(this.loginState){
                console.log("已登录状态！")
            }else{
                this.corpId =this.route.corpId   //企业唯一码  
                this.appId = this.route.appId;   //默认00
                this.agentId = this.route.agentId;//应用id
                let ddConfig = {corpId:this.corpId,agentId:this.agentId,bipAppid:this.appId};
				uni.setStorageSync('ddConfig', JSON.stringify(ddConfig));
				let _this =this;
                await dd.ready(function() {
                    dd.runtime.permission.requestAuthCode({
						corpId: _this.corpId,
						onSuccess: function(info:any) {
							_this.loginDDRemote(info.code)
                            // _this.getDDJSTicket(); 
						},
						onFail : function(err:any) {
							uni.showToast({
								title: '系统错误，请联系管理员！',
								icon:"none"
							})
							uni.reLaunch({'url':'/pages/login/login'});
						}
					});
				});
			}
		}
		async loginDDRemote(code:any) { 
            var logindata = {
                code: code,
                corpId:this.corpId, 
                appId:this.appId,
                agentId:this.agentId,
                ding:1, 
                ioutsys:3,
            }
            try{
				var res:any = await tools.loginWithOutPwd("",logindata);
				if(res.data.id ==0){
					let data = res.data
					let user:User = new User('','','');
					let _u = data.data.user
					user.userCode = _u.userCode
					user.userName = _u.userName
					user.attr = _u.attr
					user.deptInfo = _u.deptInfo
					user.gwCode = _u.gwCode
					let ms:Array<Menu> = data.data.menulist;
					LoginModule.setUser(user)
					LoginModule.setState(true)
					LoginModule.setMenus(ms);
					LoginModule.setSnKey(data.data.snkey)
				}else{
					uni.showToast({
						title: res.data.message,
						icon:"none"
					})
				}
            }catch(e){
				uni.showToast({
					title: '系统连接错误！！！',
					icon:"none"
				})
				uni.reLaunch({'url':'/pages/login/login'});
            }
		}
		

		get loginState(){
			let v = LoginModule.loginState
			if(!v){
				let value = uni.getStorageSync('isLogin');
				if(value){
					LoginModule.setState(true)
					let user = JSON.parse(uni.getStorageSync('user'))
					LoginModule.setUser(user)
					let ms = JSON.parse(uni.getStorageSync('menus'))
					LoginModule.setMenus(ms)
					let snkey = uni.getStorageSync('snkey')
					LoginModule.setSnKey(snkey)
					return true;
				}
			}
			return v;
		}
	}
	export const ServApi = new ServerUtils();
}
