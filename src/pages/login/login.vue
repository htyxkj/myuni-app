<template>
	<view class="body">
		<!-- <cu-custom bgColor="bg-gradual-pink" :isBack="false">
			<block slot="backText">返回</block>
			<block slot="content"><view class="header-title">登录页面</view></block>
		</cu-custom> -->
		<!-- 主体表单 -->
		<form>
			<view class="header">
				<image :src="'../../static/'+_comm.ItemType+'.png'" mode="aspectFit"></image>
			</view>
			<view class="cu-form-group margin-top input">
				<view class="title">账 号</view>
				<input placeholder="请输入账号/手机号" name="input" v-model="user.userCode" />
			</view>
			<view class="cu-form-group input">
				<view class="title">密 码</view>
				<input placeholder="请输入密码" type="password" v-model="user.password" />
			</view>
			<view class="padding">
				<view class="grid text-center col-5">
					<view></view>
					<view></view>
					<view></view>
					<view></view>
					<view v-if="_comm.ItemType =='flexible'" class="registered" @tap="registered('flexible')">注册</view><!-- 灵活用工注册 -->
					<view v-if="_comm.ItemType =='credit'" class="registered" @tap="registered('credit')">注册</view><!-- 征信管理注册 -->
					<view v-if="_comm.ItemType == 'mine'" class="registered" @tap="touristLogin">游客登陆</view> <!-- 张矿微平台 -->
				</view>
			</view>
			<view class="padding flex flex-direction">
				<button form-type="submit" :disabled="canLogin" class="cu-btn margin-tb-sm loginbtn lg shadow " @tap="loginSys(null)">登录</button>
			</view>
		</form>
		<!-- <view class="flex justify-center privacy_protocol" >
			<view class="padding-sm">服务协议</view>
			<view class="padding-sm">隐私政策</view>
		</view> -->
		<mLoad :png="'/static/'+_comm.ItemType+'.png'" :msg="'登录中...'" v-if="loadModal"></mLoad>
	</view>
</template>

<script lang="ts">
	import {
		Vue,
		Provide,
		Component
	} from 'vue-property-decorator';
	import mLoad from '../../components/mLoad.vue';
	import {
		Tools
	} from '../../classes/tools/Tools';
	import User from '@/classes/User';
	import Menu from '@/classes/Menu';
	import comm from '@/static/js/comm.js';
	let commURL: any = comm;
	import {
		BIPUtil
	} from '@/classes/api/request';
	let tools = BIPUtil.ServApi;
	import {
		LoginModule
	} from '@/store/module/login'; //导入vuex模块，自动注入
	@Component({
		components: {
			mLoad
		},
		name: 'Login'
	})
	export default class extends Vue {
		canLogin: boolean = false
		loadModal: boolean = false
		vueId: string = Tools.guid()
		user: User = new User('', '', '')
		// user: User = new User('', '', '')
		_comm:any = null;
		onLoad() {
			uni.clearStorage();
			this._comm = commURL;
			this.$forceUpdate();
		}
		/**
		 * 登录系统
		 */
		loginSys(user:any=null) {
			uni.setStorageSync('userType','Official');
			if(user == null)
				user = this.user;
			if (!user.userCode) {
				uni.showToast({
					title: '请输入账号密码',
					icon:"none"
				})
				return;
			} else {
				this.canLogin = true;
				this.loadModal = true;
				tools.login(user).then((res: any) => {
					let data = res.data
					if(data.id ==2){//注册时间到期
						uni.showToast({
							title: data.message,
							icon:"none"
						})
						this.canLogin = false;
						this.loadModal = false;
						return;
					}
					if (data.id != -1) {
						let _u = data.data.user
						this.user.userCode = _u.userCode
						this.user.userName = _u.userName
						this.user.attr = _u.attr
						this.user.deptInfo = _u.deptInfo
						this.user.gwCode = _u.gwCode
						let ms:Array<Menu> = data.data.menulist;
						LoginModule.setUser(user)
						LoginModule.setState(true)
						LoginModule.setMenus(ms);
						LoginModule.setSnKey(data.data.snkey)
						if(commURL.ItemType == 'mine'){	
							setTimeout(() => {
								uni.redirectTo({
									'url': '/pages/alone/mine/index/index'
								}) 							
							}, 300);
						}else{
							setTimeout(()=>{
								uni.redirectTo({
									'url': '/pages/index/index'
								})
							},200);
						}
					} else {
						uni.showToast({
							title: data.message,
							icon:"none"
						})
						this.canLogin = false;
						this.loadModal = false;
					}
				}).catch((err: any) => {
					console.log(JSON.stringify(err))
					uni.showToast({
						title: '链接服务失败',
						icon:"none"
					})
					this.canLogin = false;
					this.loadModal = false;
				});
				// .finally(() => {
				// 	this.canLogin = false;
				// 	this.loadModal = false;
				// })
			}
		}
		/**
		 * 张矿微平台 游客登陆
		 */
		touristLogin(){
			let user: User = new User('portal', '', '')
			this.loginSys(user);
			uni.setStorageSync('userType','Tourist')
		}

		
		//注册页面
		registered(vl:any){
			if(vl == 'flexible'){
				uni.navigateTo({
					url:'/pages/alone/flexible/registered/registered',
				});
			}else if(vl =='credit'){
				uni.navigateTo({
					url:'/pages/alone/credit/registered/registered',
				});
			}
		}
		notLogin() {
			console.log('不能登录系统')
		}

		get loginState() {
			return LoginModule.loginState
		}
	}
</script>

<style>
	/*每个页面公共css */
	/* 	@import "../../lib/colorui/main.css";
	@import "../../lib/colorui/icon.css"; */

	.cu-form-group .title {
		min-width: calc(4em + 15px);
		font-weight: 600;
	}

	.header {
		text-align: center;
		background-color: #FFFFFF;
		padding-top: 100upx;
	}

	.header image {
		width: 550upx;
		height: 480upx;
		border-radius: 50%;
	}
	.registered{
		color: #3A86ED;
		font-weight: 600;
	}
	.body{
		background-color: #FFFFFF;
		height: 100%;
		width: 100%;
		position: absolute;
	}
	.input{
		border-bottom: 1px solid #e5e5e5;
		border-top:0rpx ;
	}
	.loginbtn{
		border-radius: 50upx;
		background-color: red !important;
		color: #FFFFFF !important;
	}
	.privacy_protocol{
		position: absolute;
		bottom: 0;
		left: 50%;
		transform: translate(-50%, 0%);
		color: #2079fff2;
	}
</style>
