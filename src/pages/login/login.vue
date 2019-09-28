<template>
	<view>
		<cu-custom bgColor="bg-gradual-pink" :isBack="false">
			<block slot="backText">返回</block>
			<block slot="content">登录页面</block>
		</cu-custom>
		<!-- 主体表单 -->
		<form>
			<view class="header">
				<image src="../../static/gs.png" mode="aspectFit"></image>
			</view>
			<view class="cu-form-group margin-top">
				<view class="title">账 号</view>
				<input placeholder="请输入账号/手机号" name="input" v-model="user.userCode"></input>
			</view>
			<view class="cu-form-group">
				<view class="title">密 码</view>
				<input placeholder="请输入密码" type="password" v-model="user.password"></input>
			</view>
			<view class="padding flex flex-direction">
				<button form-type="submit" :disabled="canLogin" class="cu-btn bg-blue margin-tb-sm lg shadow" @tap="loginSys">登录系统</button>
			</view>
		</form>
		<mLoad :png="'/static/gs.png'" :msg="'登录中...'" v-if="loadModal"></mLoad>
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
	import {
		User
	} from '@/classes/User';
	import {
		Menu
	} from '@/classes/Menu';
	import comm from '@/static/js/comm.js';
	let commURL: any = comm;
	import {
		login
	} from '@/classes/api/request';
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
		@Provide() canLogin: boolean = false
		@Provide() loadModal: boolean = false
		@Provide() vueId: string = Tools.guid()
		@Provide() user: User = new User('admin', '', '11')
		onLoad() {
			console.log('登录页面1112')
		}
		loginSys() {
			if (!this.user.userCode) {
				
				uni.showToast({
					title: '请输入账号密码'
				})
				return;
			} else {
				this.canLogin = true;
				this.loadModal = true
				login(this.user).then((res: any) => {
					console.log(res)
					let data = res.data
					if (data.id != -1) {
						console.log(data)
						let _u = data.data.user
						this.user.userCode = _u.userCode
						this.user.userName = _u.userName
						this.user.attr = _u.attr
						this.user.deptInfo = _u.deptInfo
						let ms:Array<Menu> = data.data.menulist;
						console.log(ms)
						// uni.setStorage({key:'user',data:this.user})
						LoginModule.setUser(this.user)
						LoginModule.setState(true)
						LoginModule.setMenus(ms);
						uni.navigateTo({
							'url': '/pages/index/index'
						})
					} else {
						uni.showToast({
							title: data.message
						})
					}
				}).catch((err: any) => {
					console.log(err)
					uni.showToast({
						title: '链接服务失败'
					})
				}).finally(() => {
					this.canLogin = false;
					this.loadModal = false
				})
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
	}

	.header {
		text-align: center;
		background-color: #FFFFFF;
	}

	.header image {
		width: 161upx;
		height: 161upx;
		border-radius: 50%;

	}
</style>
