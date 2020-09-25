<template>
	<view class="mine-info">
        <cu-custom bgColor="bg-white" :isBack="true">
			<block slot="content"><view class="header-title text-black">我的</view></block>
		</cu-custom>
		<view class="header">
			<view style="text-align:start;" class="padding-left-xl">
                <view class="flex solid-bottom padding align-center">
					<view>
                        <image class="cu-avatar xl round bg-white"  src="../../../../static/gs.png" mode="aspectFit"></image>                      
                    </view>
					<view style="width:100%">
                        <view class="grid text-white padding-left col-2">
                            <view class="text-start">{{user.userName}}</view>
                            <view class="text-center">积分</view>
                        </view>
                        <view class="grid text-center text-white padding-left col-2">
                            <view></view>
                            <view>{{my_integral}}</view>
                        </view>
                    </view>
				</view>
			</view>
			<!-- <view class="my-info my-margin-top">
				<view class="bg-white whiteCrd margin my-margin-top">
					<view class="bg-white whiteCrd padding-top padding-bottom">
						<view class="grid text-center col-2">
							<view @click="gotoFavoritesPage">收藏</view>
							<view @click="gotoHistoryPage">历史</view>
						</view>
					</view>
				</view>
			</view> -->
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
				<text class="cuIcon-titles text-blue "></text>退出系统
			</view>
		</view>
		<view class="cu-bar bg-white solid-bottom margin-top">
			<view class="action">
				<text class="cuIcon-titles text-progress "></text>关于我们
			</view>
		</view>
		<view class="cu-modal" style="z-index: 100;" :class="mdPass?'show':''">
			<view class="cu-dialog">
				<view class="cu-bar bg-red justify-end">
					<view class="content">修改密码</view>
				</view>
				<view class="padding-xl">
					<form class="content">
						<view class="cu-form-group">
							<view class="title">旧密码</view>
							<template v-if="at0">
								<input placeholder="请输入旧密码" type="text" v-model="oldPwd" />
							</template>
							<template v-else>
								<input placeholder="请输入旧密码" type="password" v-model="oldPwd" />
							</template>
							<text :class="[at0?'cuIcon-attentionforbid':'cuIcon-attention','text-orange']" @tap.stop="open(0)"></text>
						</view>
						<view class="cu-form-group">
							<view class="title">新密码</view>
							<template v-if="at1">
								<input placeholder="新密码" type="text" v-model="pwd" />
							</template>
							<template v-else>
								<input placeholder="新密码" type="password" v-model="pwd" />
							</template>
							<text :class="[at1?'cuIcon-attentionforbid':'cuIcon-attention','text-orange']" @tap.stop="open(1)"></text>
						</view>
						<view class="cu-form-group">
							<view class="title">确认密码</view>
							<template v-if="at2">
								<input placeholder="再次确认密码" type="text" v-model="pwd1" />
							</template>
							<template v-else>
								<input placeholder="再次确认密码" type="password" v-model="pwd1" />
							</template>
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
	import { InsAidModule } from '@/store/module/insaid'; //导入vuex模块，自动注入
	import {BIPUtil} from '@/classes/api/request';
	let tools = BIPUtil.ServApi;
	import {icl} from '@/classes/tools/CommICL';
	const ICL = icl; 
	import QueryEntity from '@/classes/search/QueryEntity';
	import QueryCont from '@/classes/search/QueryCont';
	import {
		LoginModule
	} from '@/store/module/login'; //导入vuex模块，自动注入
	@Component({
		components:{}
	})
	export default class My extends Vue{
		my_integral:number = 0;
		mdPass:boolean = false
		canExec:boolean = false
		oldPwd:string = ''
		pwd:string = ''
		pwd1:string = ''
		at0:boolean = false
		at1:boolean = false
		at2:boolean = false
		gwName:any = '';//岗位名称
		editName:any ='MULGW';//岗位辅助

		mounted() {
			this.initIntegral();
		}
		get user(){
			return LoginModule.user
		}
		/**
		 * 退出系统
		 */
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
						uni.clearStorage()
						uni.reLaunch({'url':'/pages/login/login'})
					}
				}
			})
			
		}
		modifyPassClick(){
			if(!this.mdPass){
				this.mdPass = true
				this.oldPwd = '';
				this.pwd = '';
				this.pwd1 = '';
			}
		}
		async execModify(){
			if(this.pwd != this.pwd1){
				uni.showToast({
					title: '两次密码不一致！',
					icon:"none"
				})
				return;
			}
			this.canExec = true
			if(this.user){
				let cc = await tools.upPwd(this.user,this.pwd,this.oldPwd);
				this.mdPass = false
				this.canExec = false
				uni.showToast({
					title: cc.data.message,
					icon:"none"
				})
			}
		}
		open(index:number){
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
		/**
		 * 打开收藏页面
		 */
		gotoFavoritesPage(){
			let url = "/pages/alone/mine/my/favoritesOrHistoryList?type=0&title=我的收藏";
			uni.navigateTo({
				'url':url,
			})
		}
		/**
		 * 打开浏览记录页面
		 */
		gotoHistoryPage(){
			let url = "/pages/alone/mine/my/favoritesOrHistoryList?type=1&title=历史浏览";
			uni.navigateTo({
				'url':url,
			})
		}

		/**
		 * 查询当前用户积分
		 */
		async initIntegral(){
			let qe:QueryEntity = new QueryEntity('','');
			qe.page.currPage = 1;
			qe.page.pageSize = 100; 
			let oneCont = []; 
			let qCont = new QueryCont('user_id',this.user.userCode,12);
			qCont.setContrast(0);
			oneCont.push(qCont);
			qe.cont = "~["+JSON.stringify(oneCont)+"]"
			let vv:any = await tools.getBipInsAidInfo('MYINTEGRAL',210,qe);
			console.log(vv)
			if(vv.data.id ==0){
				let vl = vv.data.data.data.values;
				if(vl.length>0){
					this.my_integral = vl[0].total_integral;
				}else{
					this.my_integral = 0;
				}
			}
		}
	}
</script>

<style>
	.mine-info .header{
		text-align: center;
		background-color: #EA272F;
	}
	.my-info{
		color: white;
	}
	.my-margin-top{
		margin-top:20upx;
	}
	.whiteCrd{
    	border-radius: 5px 5px 0px 0px;
	}
	.cu-form-group{
		text-align: left;
	}
	.cu-form-group .title {
		min-width: calc(4em + 15px);
		
	}
</style>
