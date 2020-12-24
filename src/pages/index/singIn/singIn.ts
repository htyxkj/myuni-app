let dd = require( 'dingtalk-jsapi');
import User from '@/classes/User';
import Menu from '@/classes/Menu';
import { BIPUtil } from '@/classes/api/request';
let tools = BIPUtil.ServApi;
import { LoginModule } from '@/store/module/login'; //导入vuex模块，自动注入
import { GlobalVariable } from '@/classes/tools/ICL';

export namespace singIn {
	class ServerUtils {
		route:any = null;//route
		jumpRoute:string="";//跳转路由
		corpId:string="";  //企业唯一码  
		appId:string="";   //默认00
		agentId:string="";//应用id
		loginOk:any = null;//登录成功回调方法
		loginFailure:any = null;//登录失败回调方法
		//第三方单点登录
		async init(route:any,loginOk:any,loginFailure:any){
			this.loginOk = loginOk;
			this.loginFailure = loginFailure;
			this.route = route;
            if(this.route.jumpRoute)
				this.jumpRoute = this.route.jumpRoute;
			if (dd.env.platform !="notInDingTalk") {//钉钉内
				console.log("钉钉单点登录")
                await this.loginDD();
                return;
            }else{
				this.loginFailure();
			}
		}
		async initDDJSTicket(){
			await this.getDDJSTicket();
		}
		//钉钉内免密登录
		async loginDD(){
			//禁用iOS Webview弹性效果
            // dd.ui.webViewBounce.disable({onSuccess: function() {},onFail: function() {}});
			this.corpId =this.route.corpId   //企业唯一码  
			this.appId = this.route.appId;   //默认00
			this.agentId = this.route.agentId;//应用id
			if(!this.corpId || !this.agentId){
				this.loginFailure();
			}
			let ddConfig = {corpId:this.corpId,agentId:this.agentId,bipAppid:this.appId};
			uni.setStorageSync('ddConfig', JSON.stringify(ddConfig));
			let _this =this;
			await dd.ready(function() {
				dd.runtime.permission.requestAuthCode({
					corpId: _this.corpId,
					onSuccess: function(info:any) {
						_this.loginDDRemote(info.code)
						_this.getDDJSTicket();
					},
					onFail : function(err:any) {
						uni.showToast({
							title: '系统错误，请联系管理员！',
							icon:"none"
						})
						uni.reLaunch({'url':'/pages/login/login'});
					}
				},function() { 
						uni.reLaunch({'url':'/pages/login/login'});
					}
				);
			});
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
					uni.setStorageSync('isLogin',true);
					uni.setStorageSync('loginType',GlobalVariable.LOGIN_TYPE_DING);
					this.loginOk();
				}else{
					uni.showToast({
						title: res.data.message,
						icon:"none"
					})
					setTimeout(() => {
						this.loginFailure()	
					}, 700);
				}
            }catch(e){
				uni.showToast({
					title: '系统连接错误！！！',
					icon:"none"
				})
				uni.reLaunch({'url':'/pages/login/login'});
            }
		}
		async getDDJSTicket(){ 
			let ddConfig = uni.getStorageSync('ddConfig')
			if(!ddConfig)
				return;
			ddConfig = JSON.parse(ddConfig);
			let url =decodeURIComponent(uni.getStorageSync("location.href")); 
			url =encodeURIComponent(url); 
			let ddCorpId = ddConfig["corpId"];
			let ddAgentId = ddConfig["agentId"]; 
			let bipAppid = ddConfig["bipAppid"]; 
			var data:any = { 
				url:url, 
				agentId:ddAgentId, 
				corpId:ddCorpId,
				bipAppid:bipAppid,
			}  
			var res:any = await  BIPUtil.ServApi.getDDJSAPI_TICKET(data); 
			if(res.data.id != undefined){ 
				if(res.data.id == 0){
					let ddCfg = JSON.parse(res.data.message); 
					await dd.runtime.permission.requestAuthCode({
						corpId: ddCorpId,
						onSuccess: function(info:any) {
							dd.config({
								agentId: ddAgentId, // 必填，微应用ID
								corpId: ddCorpId,//必填，企业ID
								timeStamp:ddCfg.timeStamp, // 必填，生成签名的时间戳
								nonceStr: ddCfg.nonceStr, // 必填，生成签名的随机串
								signature: ddCfg.DDJSTICKET, // 必填，签名
								type:0,   //选填。0表示微应用的jsapi,1表示服务窗的jsapi；不填默认为0。该参数从dingtalk.js的0.8.3版本开始支持
								jsApiList : [
									'biz.map.locate',
									'biz.map.view',
									'device.geolocation.get',
									'device.geolocation.start',
									'device.geolocation.stop',
									'biz.map.search',
								] // 必填，需要使用的jsapi列表，注意：不要带dd。
							}); 
						},
						onFail : function(err:any) {
							alert('dd onFail error: ' +JSON.stringify(err));
						}
					});
					dd.error(function(error:any){ 
						alert('dd error: ' +JSON.stringify(error));
					});
				} 
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
