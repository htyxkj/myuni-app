<template>
	<view class="content">
		<cu-custom bgColor="bg-gradual-pink" :isBack="false">
			<!-- <block slot="backText">返回</block> -->
			<block slot="content">{{title}}</block>
		</cu-custom>
		<template v-if="loginState">
			<home v-if="tabcur==0"></home>
			<menuPage v-if="tabcur==1"></menuPage>
			<message v-if="tabcur==2"></message>
			<mine v-if="tabcur==3"></mine>
		</template>

		<view  class="cu-bar tabbar bg-white shadow foot">
			<view class="action" :class="tabcur==0?tabcurColor:''" @tap="tabSelect" data-id="0">
				<view :class="tabcur==0?'cuIcon-homefill':'cuIcon-home'" style="font-size: 50upx;"></view> 首页
			</view>
			<view class="action" :class="tabcur==1?tabcurColor:''" @tap="tabSelect" data-id="1">
				<view :class="tabcur==1?'cuIcon-formfill':'cuIcon-form'" style="font-size: 50upx;"></view> 菜单
			</view>
			<view class="action" :class="tabcur==2?tabcurColor:''" @tap="tabSelect" data-id="2">
				<view :class="tabcur==2?'cuIcon-messagefill':'cuIcon-message'" style="font-size: 50upx;"></view> 消息
			</view>
			<view class="action" :class="tabcur==3?tabcurColor:''" @tap="tabSelect" data-id="3">
				<view :class="tabcur==3?'cuIcon-profilefill':'cuIcon-profile'" style="font-size: 50upx;"></view> 我
			</view>
		</view>
	</view>
</template>

<script lang="ts">
    import {Vue,Provide,Component} from 'vue-property-decorator';
	import home from './home.vue';
	import menuPage from '../menu/menuPage.vue';
	import message from '../message/message.vue';
	import mine from '../mine/mine.vue';
	import {
		LoginModule
	} from '@/store/module/login'; //导入vuex模块，自动注入
	import {
		Tools
	} from '../../classes/tools/Tools';
	@Component({
		components:{home,mine,message,menuPage}
	})
	export default class Index extends Vue{
		@Provide() title:string = '首页'
		@Provide() tabcur:number = 1
		@Provide() tabcurColor:string = 'text-green'
		@Provide() vueId: string = Tools.guid()
		onLoad() {
			if(!this.loginState){
				uni.navigateTo({'url':'/pages/login/login'})
			}
		}
		
		tabSelect(e:any){
			this.tabcur = parseInt(e.currentTarget.dataset.id)
			this.title = this.makeTitle(this.tabcur)
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

<style>
	.cu-bar.tabbar .action [class*="cuIcon-"] {
		margin: 0 auto 8rpx !important;		
	}
</style>
