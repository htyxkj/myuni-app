<template>
	<view class="mine-info">
		<view class=" bg-white header">
			<view class="flex align-center">
				<image src="../../static/gs.png" mode="aspectFit"></image>
				<view class="my-info">
					<view style="font-size: 40upx; font-weight: bold;">{{user.deptInfo.cmcName}}</view>
					<view style="font-size: 36upx; font-weight: 600;">{{user.userName}}</view>
					<view>{{AttrTitle}}</view>
					
				</view>
			</view>
		</view>
 		<view class="cu-bar bg-white solid-bottom margin-top " @tap="modifyPassClick">
			<view class="action">
				<text class="cuIcon-titles text-red "></text>修改密码
			</view>
			<view class="align-end" style="margin-right: 10upx;">
				<text class="cuIcon-right"></text>
			</view>
		</view>
		<view class="cu-bar bg-white solid-bottom"  @tap="exitSys">
			<view class="action">
				<text class="cuIcon-titles text-blue "></text>登出系统
			</view>
		</view>
		<view class="cu-bar bg-white solid-bottom margin-top">
			<view class="action">
				<text class="cuIcon-titles text-progress "></text>关于我们
			</view>
		</view>
		<!-- <button class="bg-blue margin-tb-sm lg" >退出登录</button> -->
		<!--修改密码-->
		<!-- <mLoad :png="'/static/gs.png'" :msg="'处理中...'" v-if="canExec"></mLoad> -->
		<view class="cu-modal" :class="mdPass?'show':''">
			<view class="cu-dialog">
				<view class="cu-bar bg-red justify-end">
					<view class="content">修改密码</view>
				</view>
				<view class="padding-xl">
					<form class="content">
						<view class="cu-form-group">
							<view class="title">旧密码</view>
							<input placeholder="请输入旧密码" :type="at0?'text':'password'" v-model="oldPwd"></input>
							<text :class="[at0?'cuIcon-attentionforbid':'cuIcon-attention','text-orange']" @tap.stop="open(0)"></text>
						</view>
						<view class="cu-form-group">
							<view class="title">新密码</view>
							<input placeholder="新密码" :type="at1?'text':'password'" v-model="pwd"></input>
							<text :class="[at1?'cuIcon-attentionforbid':'cuIcon-attention','text-orange']" @tap.stop="open(1)"></text>
						</view>
						<view class="cu-form-group">
							<view class="title">确认密码</view>
							<input placeholder="再次确认密码" :type="at2?'text':'password'" v-model="pwd1"></input>
							<text :class="[at2?'cuIcon-attentionforbid':'cuIcon-attention','text-orange']" @tap.stop="open(2)"></text>
						</view>
					</form>
				</view>
				<view class="cu-bar bg-white justify-end">
					<view class="action">
						<button class="cu-btn line-red text-red" @tap="mdPass = false" :disabled="canExec">取消</button>
						<button class="cu-btn bg-blue margin-left" @tap="execModify" :disabled="canExec">确定</button>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script lang="ts">
	import {Vue,Component} from 'vue-property-decorator';
	// import mLoad from '../../components/mLoad.vue';
	import {
		LoginModule
	} from '@/store/module/login'; //导入vuex模块，自动注入
	@Component({
		components:{}
	})
	export default class Mine extends Vue{
		mdPass:boolean = false
		canExec:boolean = false
		oldPwd:string = ''
		pwd:string = ''
		pwd1:string = ''
		at0:boolean = false
		at1:boolean = false
		at2:boolean = false
		get user(){
			return LoginModule.user
		}
		exitSys(){
			uni.showModal({
				title: '系统提示',
				content: '确定要退出系统吗?',
				cancelText: '再看看',
				confirmText: '退出',
				success: res => {
					if (res.confirm) {
						// uni.navigateTo({'url':'/pages/login/login'})
						//关闭所有页面，打开到应用内的某个页面。
						uni.reLaunch({'url':'/pages/login/login'})
					}
				}
			})
			
		}
		modifyPassClick(){
			if(!this.mdPass){
				this.mdPass = true
				console.log('修改密码')
			}
		}
		execModify(){
			this.canExec = true
			console.log('开始修改密码！')
			setTimeout(()=>{
				console.log('修改成功')
				this.mdPass = false
				this.canExec = false
			},2000);
		}
		
		open(index:number){
			console.log('open',index);
			switch(index){
				case 0:
					this.at0 = !this.at0;
					break;
				case 1:
					this.at1 = !this.at1;
					break;
				case 2:
					this.at2 = !this.at2;
					break;
			}
		}
		
		get AttrTitle(){
			//1:管理员;2:特权用户;3:公司用户;4:部门用户;5:普通用户;6:非操作员;9:做废
			let tt = '非操作员'
			if(this.user){
				let k = parseInt(this.user.attr+'')
				switch(k){
					case 0:
						tt = '超级管理员'
						break;
					case 1:
						tt = '管理员'
						break;
					case 2:
						tt = '特权用户'
						break;
					case 3:
						tt = '公司用户'
						break;
					case 4:
						tt = '部门用户'
						break;
					case 5:
						tt = '普通用户'
						break;
					case 6:
						tt = '非操作员'
						break;
					default:
						tt = '作废'
						break;
				}
			}
			return tt;
		}
	}
</script>

<style>
	.mine-info .header{
		text-align: center;
		/* vertical-align:middle; */
		/* background-color: #EBEEF5; */
	}
	.mine-info .header image{
		width:200upx;
		height:200upx;
		border-radius:50%;	
	}
	.my-info{
		margin-left: 100upx;
		/* margin-bottom: 100upx; */
		/* margin-right: 100upx; */
	}
	.cu-form-group{
		text-align: left;
	}
	.cu-form-group .title {
		min-width: calc(4em + 15px);
		
	}
</style>
