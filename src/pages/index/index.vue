<template>
	<view>
		<view  v-if="ifDefaultIndex">
			<cu-custom v-show="!isSpDeatilPage" bgColor="bg-gradual-pink" :isBack="false">
				<block slot="content"><view class="header-title">{{title}}</view></block>
			</cu-custom>
			<template v-if="loginState">
				<template v-if="tabcur==-1">
					<customize :menu="menubarr" :onShow="tabcur==-1" :isShow="isShow"></customize>
				</template>
				<template v-else-if="tabcur==0">
					<home ></home>
				</template>
				<template v-else-if="tabcur==1">
					<menuPage></menuPage>
				</template>
				<template v-else-if="tabcur==2">
					<bip-task @setShowBtn="setShowBtn"></bip-task>
				</template>
				<template v-else>
					<my></my>
				</template>
				<!-- <message v-if="tabcur==2"></message> -->
			</template>
			<mIndexBar v-if="ifDefaultIndex" v-show="!isSpDeatilPage" :tbI="tabcur" @tabSelect="tabSelect"></mIndexBar>
		</view>
		<bip-protocol v-if="showpp" :showTY="-1" :showpp="showpp" @AgreeToTerms="AgreeToTerms"></bip-protocol>
	</view>
</template>

<script lang="ts">
    import {Vue,Component} from 'vue-property-decorator';
	import home from './home.vue';
	import menuPage from '@/components/bip-comp/menu/menuPage.vue';
	import BipTask from '@/components/bip-comp/task/BipTask.vue';
	import my from '@/components/bip-comp/my/my.vue';
	import customize from '@/components/bip-comp/customize/Index.vue';
	import mIndexBar from '@/components/mIndexBar.vue'
	import {
		LoginModule
	} from '@/store/module/login'; //导入vuex模块，自动注入
	import { Tools } from '@/classes/tools/Tools';
	import comm from '@/static/js/comm.js';
	let commURL: any = comm;
	import {singIn} from '@/pages/index/singIn/singIn'
	import bipProtocol from '@/components/bip-ui/bip-protocol/bip-protocol.vue';
	@Component({
		components:{home,my,menuPage,mIndexBar,customize,BipTask,bipProtocol}
	})
	export default class Index extends Vue{
		title:string = '首页'
		tabcur:number = 0
		tabcurColor:string = 'text-green'
		vueId: string = Tools.guid()
		isShow:boolean = false;
		
		menubarr:any=null

		olOption:any = null;
		ifDefaultIndex:boolean = false;//是否显示首页

		isSpDeatilPage:boolean = false;
		showpp:boolean = false;//显示隐私政策 服务协议

		options:any = null;
		
		onLoad(options:any) {
			//#ifdef APP-PLUS
				// let value = uni.getStorageSync('AgreeToTerms');
				// if(!value){
				// 	this.showpp=true;
				// 	return;
				// }
			//#endif
			this.options = options
			this._onLoad();
			//#ifdef APP-PLUS
			if(this.loginState){
				uni.getSystemInfo({
					success:(res) => {
						//检测当前平台，如果是安卓则启动安卓更新  
						if(res.platform=="android"){
							Tools.AndroidCheckUpdate();  
						}  
					}  
				})
			}
			//#endif
		}
		_onLoad(){
			this.showpp=false;
			let options:any = this.options;
			if(commURL && commURL.ItemType && commURL.ItemType == 'mine'){
				uni.reLaunch({
					'url': '/pages/alone/mine/index/index'
				})
				return;
			}else{
				if(!this.loginState || options.corpId){
					singIn.ServApi.init(options,this.loginOk,this.loginFailure);
				}
				this.olOption = options
				this.ifDefaultIndex = true;
			}
		}

		//同意隐私条款
		AgreeToTerms(){
			this._onLoad();
		}
		/**
		 * 页面显示
		 */
		async onShow(){
			this.isShow = true;
		}
		async onHide(){
			this.isShow = false;
		}

		//登录成功
		loginOk(){
			if(commURL.ItemType == 'mine'){
				uni.reLaunch({
					'url': '/pages/alone/mine/index/index'
				})
				return;
			}
			if(this.olOption.tabcur){
				this.tabcur = this.olOption.tabcur;
			}
			this.title = this.makeTitle(this.tabcur)
		}
		//登录失败
		loginFailure(){
			if(!this.loginState){
				uni.reLaunch({'url':'/pages/login/login'})
				return;
			}else{
				uni.reLaunch({'url':'/pages/login/login'})
				// if(commURL.ItemType == 'mine'){
				// 	uni.reLaunch({
				// 		'url': '/pages/alone/mine/index/index'
				// 	})
				// 	return;
				// }
			}
		}
		
		tabSelect(e:any){
			this.tabcur = e[0];
			this.menubarr = e[1]
			this.title = this.makeTitle(parseInt(this.menubarr.url))
		}
		
		/**
		 * 根据导航设置首页标题
		 * @param {number} index 
		 */
		makeTitle(index:number){
			let tt = '首页';
			switch (index){
				case 1:
					tt = '菜单';
					break;
				case 2:
					tt = '消息中心';
					break;
				case 3:
					tt = '我';
					break;
				default:
				tt = '首页'
					break;
			}
			return tt;
		}
		
		get loginState(){
			let v = LoginModule.loginState
			if(!v){
				let value = uni.getStorageSync('isLogin');
				if(value){
					LoginModule.setState(true)
					let _user = uni.getStorageSync('user');
					if(_user){
						let user = JSON.parse(_user)
						LoginModule.setUser(user)
					}
					let _ms = uni.getStorageSync('menus');
					if(_ms){
						let ms = JSON.parse(_ms)
						LoginModule.setMenus(ms)
					}
					let snkey = uni.getStorageSync('snkey')
					LoginModule.setSnKey(snkey)
					v = true;
				}
			}
			return v;
		}
		//消息中心  点击详情隐藏头部标题底部按钮
		setShowBtn(res:any){
			this.isSpDeatilPage = res;
		}
	}
</script>

<style lang="scss">
	page {
	    margin-bottom: 0 !important;
	}
	.cu-bar.tabbar .action [class*="cuIcon-"] {
		margin: 0 auto 8rpx !important;		
	}
</style>
