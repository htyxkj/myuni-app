<template>
	<view>
		<cu-custom bgColor="bg-gradual-pink" :isBack="false">
			<!-- <block slot="backText">返回</block> -->
			<block slot="content"><view class="header-title">{{title}}</view></block>
		</cu-custom>
		<template v-if="loginState">
			<home v-if="tabcur==0" ></home>
			<menuPage v-if="tabcur==1"></menuPage>
			<message v-if="tabcur==2"></message>
			<mine v-if="tabcur==3"></mine>
			<customize v-if="tabcur==-1" :menu="menubarr"></customize>
		</template>
		<mIndexBar :tbI="tabcur" @tabSelect="tabSelect"></mIndexBar>
	</view>
</template>

<script lang="ts">
    import {Vue,Component} from 'vue-property-decorator';
	import home from './home.vue';
	import menuPage from '../menu/menuPage.vue';
	import message from '../message/message.vue';
	import mine from '../mine/mine.vue';
	import customize from '../customize/customize.vue';
	import mIndexBar from '../../components/mIndexBar.vue'
	import {
		LoginModule
	} from '@/store/module/login'; //导入vuex模块，自动注入
	import {
		Tools
	} from '../../classes/tools/Tools';
	@Component({
		components:{home,mine,message,menuPage,mIndexBar,customize}
	})
	export default class Index extends Vue{
		title:string = '首页'
		tabcur:number = 0
		tabcurColor:string = 'text-green'
		vueId: string = Tools.guid()
		
		menubarr:any=null
				
		onLoad(options:any) {
			// setTimeout(()=>{
				console.log('登录状态：',LoginModule.loginState)
				if(!this.loginState){
					uni.navigateTo({'url':'/pages/login/login'})
				}
				
				if(options.tabcur){
					this.tabcur = options.tabcur;
				}
				
				this.title = this.makeTitle(this.tabcur)
			// },200)

		}
		
		tabSelect(e:any){
			this.tabcur = e[0];
			// this.tabcur = parseInt(e.currentTarget.dataset.id)
			this.title = this.makeTitle(this.tabcur)
			this.menubarr = e[1]
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
					tt = '消息';
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
					return true;
				}
			}
			return v;
		}
	}
</script>

<style lang="scss">
	page {
		/* margin-bottom: 100upx; */
		padding-bottom: 120upx;
	}
	.cu-bar.tabbar .action [class*="cuIcon-"] {
		margin: 0 auto 8rpx !important;		
	}
</style>
