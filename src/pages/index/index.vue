<template>
	<view>
		<view  v-if="loginState">
			<cu-custom bgColor="bg-gradual-pink" :isBack="false">
				<block slot="content"><view class="header-title">{{title}}</view></block>
			</cu-custom>
			<template>
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
					<bip-task></bip-task>
				</template>
				<template v-else>
					<my></my>
				</template>
				<!-- <message v-if="tabcur==2"></message> -->
			</template>
			<mIndexBar v-if="loginState" :tbI="tabcur" @tabSelect="tabSelect"></mIndexBar>
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
		onLoad(options:any) {
			singIn.ServApi.init(options,this.loginOk,this.loginFailure);
			this.olOption = options
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
				if(commURL.ItemType == 'mine'){
					uni.redirectTo({
						'url': '/pages/alone/mine/index/index'
					})
					return;
				}
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
</script>

<style lang="scss">
	page {
	    margin-bottom: 0 !important;
	}
	.cu-bar.tabbar .action [class*="cuIcon-"] {
		margin: 0 auto 8rpx !important;		
	}
</style>
