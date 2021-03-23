<template>
	<view class="mine-info">
		<view class=" bg-white header">
			<view>
				<image v-if="mycomm" class="cu-avatar xl round my-margin-top bg-white"  :src="'../../../static/'+mycomm.ItemType+'.png'" mode="aspectFit"></image>
			</view>
			<view class="my-info my-margin-top">
				<view style="font-weight: 600;">{{AttrTitle}}</view>
				<view class="bg-white whiteCrd margin my-margin-top">
					<view class="bg-white whiteCrd padding-top ">
						<view class="grid margin-bottom text-center col-2">
							<view>岗位</view>
							<view>隶属部门</view>
						</view>
						<view class="grid padding-bottom text-center col-2 " style="color: #000000;font-weight: 600;">
							<view>{{gwName}}</view>
							<view>{{user.deptInfo.deptName}}</view>
						</view>
					</view>
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
				<text class="cuIcon-titles text-blue "></text>退出系统
			</view>
		</view>
		<!-- <view class="cu-bar bg-white solid-bottom margin-top">
			<view class="action">
				<text class="cuIcon-titles text-progress "></text>关于我们
			</view>
		</view> -->
		<!-- <button class="bg-blue margin-tb-sm lg" >退出登录</button> -->
		<!--修改密码-->
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
							<!-- <input placeholder="请输入旧密码" :type="at0?'text':'password'" v-model="oldPwd" /> -->
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
							<!-- <input placeholder="新密码" :type="at1?'text':'password'" v-model="pwd" /> -->
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
							<!-- <input placeholder="再次确认密码" :type="at2?'text':'password'" v-model="pwd1" /> -->
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
	import {
		LoginModule
	} from '@/store/module/login'; //导入vuex模块，自动注入
	import comm from '@/static/js/comm.js';
	let commURL: any = comm;
	@Component({
		components:{}
	})
	export default class My extends Vue{
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

		mycomm:any = null;
		onLoad() {
			this.mycomm = commURL;
		}
		async mounted() {
			await this.getGWName(this.user.gwCode);
			this.mycomm = commURL;
		}
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
						uni.clearStorage();
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
		
		async getGWName(code:any){
			if(!code)
				code="";
			this.gwName = "";
			let codeA = code.split(";");
			for(var i=0;i<codeA.length;i++){
				code = codeA[i]
				let aidKey= ICL.AID_KEY+this.editName;
				let key = aidKey+"_"+code;
				if(!this.inProcess.get(key)){
					let rtn = this.aidValues.get(key);
					if(!rtn){
						let cont = "gwcode = '"+code+"'";
						let vvs = {id:this.editName,key:key,cont:cont}
						await InsAidModule.fetchInsDataByCont(vvs);
						let rtn:any = this.aidValues.get(key);
						if(rtn){
							this.gwName += rtn.gwname+";";
						}
					}
				}else{
					let rtn = this.aidValues.get(key);
					if(rtn){
						this.gwName += rtn.gwname+";";
					}
				}
			}
			if(this.gwName.length>1){
				this.gwName = this.gwName.substring(0,this.gwName.length-1)
			}
		}
		get aidmaps(){
			return InsAidModule.aidInfos;
		}
		get aidValues(){
			return InsAidModule.aidValues;
		}
		get inProcess(){
			return InsAidModule.inProcess;
		}
	}
</script>

<style>
	.mine-info .header{
		text-align: center;
		background-image: url('../../../static/my/bg.jpg');
		background-repeat: no-repeat;
		background-size: 100% 100%;
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
