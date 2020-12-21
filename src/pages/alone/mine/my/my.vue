<template>
	<view class="mine-info">
        <cu-custom bgColor="bg-white" :isBack="true">
			<block slot="content"><view class="header-title text-black">我的</view></block>
		</cu-custom>
		<view class="header">
			<view style="text-align:start;" class="padding-left-xl">
                <view class="flex solid-bottom padding align-center">
					<view>
                        <image class="cu-avatar xl round bg-white"  :src="path" mode="aspectFit"></image>                      
                    </view>
					<view style="width:100%">
                        <view class="grid text-white padding-left col-2">
                            <view class="text-start">{{user.userName}}</view>
                            <view class="text-center">积分
								<text class="margin-left-xs cuIcon-question" style=" font-size: 25upx;" @tap="integralRule"></text> 
							</view>
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
		<view class="cu-bar bg-white solid-bottom margin-top " @tap="jumpIntegral">
			<view class="action">
				<text class="cuIcon-titles text-progress "></text>积分排名
			</view>
			<view class="align-end" style="margin-right: 10upx;">
				<text class="cuIcon-right"></text>
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
		<view class="cu-bar bg-white solid-bottom" @tap="perfectInformation(true)">
			<view class="action">
				<text class="cuIcon-titles text-yellow "></text>信息完善
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

		<view class="cu-modal" style="z-index: 100;" :class="mdInfo?'show':''">
			<view class="cu-dialog">
				<view class="cu-bar bg-red justify-end">
					<view class="content">信息完善</view>
				</view>
				<view class="padding-xl">
					<form class="content">
						<view class="flex align-end bg-white"> 
							<view class="margin-xs radius">
								<image class="cu-avatar xl round bg-white"  :src="path" mode="aspectFit"></image> 
							</view>
							<view class="margin-xs radius">
								<uni-view class="text-center text-blue" @tap="chooseImage()">选择图片</uni-view>
							</view>
						</view>
						<view class="cu-form-group solid-bottom"> 
							<view class="title">单位</view>
							<input placeholder="单位" type="text" v-model="myInfo.scmName" disabled="true" @tap.stop="openScmSel()"/>
							<text :class="['cuIcon-searchlist', 'text-progress','text-bold']" @tap.stop="openScmSel()"></text>
						</view>
						<view class="cu-form-group solid-bottom"> 
							<view class="title">部门</view>
							<input placeholder="部门" type="text" v-model="myInfo.orgcodeName" disabled="true" @tap.stop="openOrgSel()"/>
							<text :class="['cuIcon-searchlist', 'text-progress','text-bold']" @tap.stop="openOrgSel()"></text>
						</view>
						<view class="cu-form-group">
							<view class="title">手机</view>
							<input placeholder="手机" type="text" v-model="myInfo.tel" />
						</view>
						<view class="cu-form-group">
							<view class="title">邮箱</view>
							<input placeholder="邮箱" type="text" v-model="myInfo.semail" />
						</view>
					</form>
				</view>
				<view class="cu-bar bg-white justify-end">
					<view class="action">
						<button class="cu-btn line-red text-red" @tap="mdInfo = false" :disabled="canExec">取消</button>
						<button class="cu-btn bg-blue margin-left" @tap="execPerInf" :disabled="canExec">确定</button>
					</view>
				</view>
			</view>
		</view>

		<view class="cu-modal" style="z-index: 100;" :class="showIintegralRuleDlg?'show':''">
			<view class="cu-dialog">
				<view class="cu-bar bg-red justify-end">
					<view class="content">积分规则</view>
				</view>
				<view class="padding-sm">
					<form class="content">
						<view class="padding-sm" style="text-align: start;" v-for="(item,index) in integralRul" :key="index">
							<view >{{item.name}}</view>
							<view class="margin-left-sm">
								每
								<template v-if="item.type=='answer'">答对一题</template>
								<template v-else>次</template>
								{{item.fraction}}积分;每天上限{{item.upper_limit}}积分;
								<template v-if="item.duration">
									浏览有效时长：{{item.duration}}秒
								</template>
							</view>
						</view>
					</form>
				</view>
				<view class="cu-bar bg-white justify-center">
					<button style="width:80%" class="cu-btn bg-blue" @tap="showIintegralRuleDlg = false">确定</button>
				</view>
			</view>
		</view>

		<kps-image-cutter @ok="onok" @cancel="oncancle" :url="url" :fixed="false" :maxWidth="500" :minHeight="300"></kps-image-cutter>

		<view class="flex justify-center privacy_protocol" >
			<view class="padding-sm">服务协议</view>
			<view class="padding-sm">隐私政策</view>
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
	import {BipMenuBtn} from '@/classes/BipMenuBtn'
	import kpsImageCutter from "@/components/uni-ui/ksp-image-cutter/ksp-image-cutter.vue";
	import bipComm from '@/components/bip-ui/bip-comm/bip-comm.vue';
	import comm from '@/static/js/comm.js';
	let commURL: any = comm;
	@Component({
		components:{kpsImageCutter,bipComm}
	})
	export default class My extends Vue{
		my_integral:number = 0;
		mdPass:boolean = false
		mdInfo:boolean = false
		canExec:boolean = false
		oldPwd:string = ''
		pwd:string = ''
		pwd1:string = ''
		at0:boolean = false
		at1:boolean = false
		at2:boolean = false
		gwName:any = '';//岗位名称
		editName:any ='MULGW';//岗位辅助
		url:any="";//要裁剪的头像地址
		path:any="../../../../static/gs.png";//头像地址


		usrSORGEdit:any = "MYSORG";
		usrSCMEdit:any="SCMM";
		myInfo:any ={
			scm:"",
			scmName:"",
			orgcode:"",
			orgcodeName:"",
			tel:"",
			semail:""
		};

		showIintegralRuleDlg:boolean = false;
		integralRul:any=[];

		mounted() {
			this.initIntegral();
			this.perfectInformation(false)
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
		//修改密码
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
				let cc:any = await tools.upPwd(this.user,this.pwd,this.oldPwd);
				this.mdPass = false
				this.canExec = false
				uni.showToast({
					title: cc.data.message,
					icon:"none"
				})
			}
		}
		//************************完善信息************************/
		async perfectInformation(st:boolean){
			if(!this.mdInfo){
				//先查询 用户当前信息
				let qe:QueryEntity = new QueryEntity('','');
				qe.page.currPage = 1;
				qe.page.pageSize = 100; 
				let oneCont = []; 
				let qCont = new QueryCont('usrcode',this.user.userCode,12);
				qCont.setContrast(0);
				oneCont.push(qCont);
				qe.cont = "~["+JSON.stringify(oneCont)+"]"
				let vv:any = await tools.getBipInsAidInfo('MYINFO',210,qe);
				if(vv.data.id ==0){
					let vl = vv.data.data.data.values;
					if(vl.length>0){
						this.myInfo.orgcode = vl[0].orgcode
						this.myInfo.orgcodeName = vl[0].oname
						this.myInfo.tel = vl[0].tel;
						this.myInfo.semail = vl[0].semail;
						this.myInfo.iocq  = vl[0].iocq ;
						this.myInfo.scm = vl[0].scm
						this.myInfo.scmName = vl[0].sname
					}
				}
				this.mdInfo = st
			}
			if(this.myInfo.iocq){
				this.path = commURL.BaseUri+"/db_"+commURL.BaseDBID+"/"+this.myInfo.iocq+"?c=" + new Date().getTime()
			}
			//获取用户部门辅助对象
			let aidKey = "KEY_"+this.usrSORGEdit
			if(!uni.getStorageSync(aidKey)){
				await InsAidModule.fetchInsAid({ id: 200, aid: this.usrSORGEdit });
			}
			aidKey = "KEY_"+this.usrSCMEdit
			if(!uni.getStorageSync(aidKey)){
				await InsAidModule.fetchInsAid({ id: 200, aid: this.usrSCMEdit });
			}
		}
		async execPerInf(){
			let btn1 = new BipMenuBtn("DLG","更改用户公司 手机号  邮箱 信息")
			btn1.setDlgType("D")
			btn1.setDlgCont("mine.serv.UserServlet*200;0;0");//修改文章浏览量
			let b = JSON.stringify(btn1)
			let v = JSON.stringify(this.myInfo);
			let vv:any =await tools.getDlgRunClass(v,b);
			uni.showToast({
				title: vv.data.message,
				icon:"none"
			})
			if(vv.data.id ==0){
				this.mdInfo = false
			}
		}
		//部门选择
		openOrgSel() {
			if(!this.myInfo.scm || !this.myInfo.scmName){
				uni.showToast({
					title:'请先选择正确的单位',
					icon:"none"
				})
				return;
			}
			let groupV = this.myInfo.scm; 
			let methordName = "MYSORG_PERFINFO"
			uni.$off(methordName,this.sorgSelectBack)
			uni.$on(methordName,this.sorgSelectBack);
			uni.showLoading({
				title:'跳转中...'
			})
			uni.navigateTo({url:'/pages/selecteditor/selecteditor?groupV='+groupV+'&editName='+this.usrSORGEdit+"&methordname="+methordName,complete: () => {
				uni.hideLoading();
			}});
		}
		sorgSelectBack(param:any){
			this.myInfo.orgcode = param.orgcode
			this.myInfo.orgcodeName = param.orgname
		}
		//公司选择
		openScmSel(){
			let groupV = ""; 
			let methordName = "MYSCM_PERFINFO"
			uni.$off(methordName,this.scmSelectBack)
			uni.$on(methordName,this.scmSelectBack);
			uni.showLoading({
				title:'跳转中...'
			})
			uni.navigateTo({url:'/pages/selecteditor/selecteditor?groupV='+groupV+'&editName='+this.usrSCMEdit+"&methordname="+methordName,complete: () => {
				uni.hideLoading();
			}});
		}
		scmSelectBack(param:any){
			if(param.orgcode != this.myInfo.scm){
				this.myInfo.orgcode=""
				this.myInfo.orgcodeName=""
			}
			this.myInfo.scm = param.orgcode
			this.myInfo.scmName = param.orgname
		}
		//************************完善信息************************/
		
		//************************显示积分规则************************/
		async integralRule(){
			//GETINTEGRULE
			let qe:QueryEntity = new QueryEntity('','');
			let vv:any = await tools.getBipInsAidInfo('GETINTEGRULE',210,qe);
			if(vv.data.id ==0){
				this.integralRul = vv.data.data.data.values;
			}
			this.showIintegralRuleDlg = true;
		}
		//查看密码
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
		/* 跳转至积分排名页面 */
		jumpIntegral(){
			let usrcode = this.user.userCode;
			let usrname = this.user.userName;
			let scm = this.myInfo.scm
			let url="/pages/alone/mine/scoreRank/scoreRank?usrcode="+usrcode+"&usrname="+usrname+"&scm="+scm;
			uni.navigateTo({
				url:url
			})
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
			if(vv.data.id ==0){
				let vl = vv.data.data.data.values;
				if(vl.length>0){
					this.my_integral = vl[0].total_integral;
				}else{
					this.my_integral = 0;
				}
			}
		}
	
		/**
		 * 选择头像
		 */
		chooseImage() {
			uni.chooseImage({
				success: (res:any) => {
					// 设置url的值，显示控件
					this.url = res.tempFilePaths[0];
				}
			});
		}
		//选完 裁剪完
		async onok(ev:any) {
			let params = {
				updid:39,
				snkey:uni.getStorageSync('snkey'),
			}
			await tools.uniAppUploadFile(ev.path,params,this.fileSuccess,null); 
		}
		fileSuccess(res:any){
			let data = JSON.parse(res.data);
			let fj_root = data.data.fj_root;
			this.myInfo.iocq = fj_root
			this.path = commURL.BaseUri+"/db_"+commURL.BaseDBID+"/"+this.myInfo.iocq+"?c=" + new Date().getTime()
			this.url = "";
		}

		//取消
		oncancle() {
			// url设置为空，隐藏控件
			this.url = "";
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
	.privacy_protocol{
		position: absolute;
		bottom: 0;
		left: 50%;
		transform: translate(-50%, 0%);
		color: #2079fff2;
	}
</style>
