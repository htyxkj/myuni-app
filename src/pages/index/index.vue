<template>
	<view>
		<view  v-if="ifDefaultIndex">
			<cu-custom v-show="!isSpDeatilPage" bgColor="bg-gradual-pink" :isBack="false">
				<block slot="content"><view class="header-title">{{title}}</view></block>
			</cu-custom>
			<template v-if="loginState">
				<template v-if="tabcur==-1">
					<customize :menu="menubarr"></customize>
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
		<view class="cu-modal" :class="showpp?'show':''">
			<view class="cu-dialog">
				<view class="cu-bar bg-white justify-end">
					<view class="content">服务协议和隐私政策</view>
				</view>
				<view class="padding-xl">
					请你务必审慎阅读、充分理解“服务协议”和隐私政策各条款，包括但不限于：为了向你提供内容分享等服务，我们需要收集你的设备信息、操作日志等个人信息。你可以阅读《服务协议》和《隐私政策》了解详细信息。如你同意，请点击“同意”开始接受我们的服务。
				</view>
				<view class="cu-bar bg-white justify-end">
					<view class="action">
						<button class="cu-btn line-blue text-blue" @tap="showpp = false">暂不使用</button>
						<button class="cu-btn bg-blue margin-left" @tap="AgreeToTerms">同意</button>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script lang="ts">
    import {Vue,Component} from 'vue-property-decorator';
	import home from './home.vue';
	import menuPage from '../menu/menuPage.vue';
	import message from '../message/message.vue';
	import BipTask from '../task/BipTask.vue';
	import my from '../my/my.vue';
	import customize from '../customize/customize.vue';
	import mIndexBar from '../../components/mIndexBar.vue'
	import {
		LoginModule
	} from '@/store/module/login'; //导入vuex模块，自动注入
	import {
		Tools
	} from '../../classes/tools/Tools';
	import comm from '@/static/js/comm.js';
	let commURL: any = comm;
	import {singIn} from '@/pages/index/singIn/singIn'
import { values } from 'xe-utils/methods';
	@Component({
		components:{home,my,message,menuPage,mIndexBar,customize,BipTask}
	})
	export default class Index extends Vue{
		title:string = '首页'
		tabcur:number = 0
		tabcurColor:string = 'text-green'
		vueId: string = Tools.guid()
		
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
			uni.setStorageSync('AgreeToTerms',true);
			this._onLoad();
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
					tt = '审核中心';
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
