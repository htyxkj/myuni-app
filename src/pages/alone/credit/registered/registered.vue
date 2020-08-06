<template>
	<view class="body">
		<cu-custom bgColor="bg-gradual-pink" :isBack="true">
			<block slot="backText">返回</block>
			<block slot="content"><view class="header-title">注册</view></block>
		</cu-custom>
		<view class="myTitle">注册信息</view>
		<view class="cu-form-group margin-top input">
			<view class="title text-red">姓  名  </view>
			<input placeholder="请输入姓 名" name="input" v-model="ruleForm.username" />
		</view>
		<view class="cu-form-group input">
			<view class="title text-red">手机号  </view>
			<input placeholder="请输入手机号" type="input" v-model="ruleForm.usrcode" />
			<button class='cu-btn bg-green shadow' @tap="sendCode" :disabled="!cansendcode">{{yzcode1Btn}}</button>
		</view>
		<view class="cu-form-group input">
			<view class="title text-red">验证码</view>
			<input placeholder="请输入验证码" type="input" v-model="ruleForm.yzcode1" />
		</view> 
		<view class="cu-form-group input">
			<view class="title text-red">行  业  </view>
			<input placeholder="请选择行业" :type="'text'" v-model="ruleForm.orgcode1" @tap.stop="openSel()" disabled="true"/>
			<text :class="['cuIcon-triangledownfill', 'text-grey']" @tap.stop="openSel()"></text>
			<bip-select :arr="hyValue" :show="isShowSel" @cancel="cancel" @selectChange="selectChange" @select="selectOK" :showKey="showk" :isStr="false"></bip-select>
		</view>
		<view class="cu-form-group input">
			<view class="title">推荐机构</view>
			<input placeholder="请输入推荐机构" type="input" v-model="ruleForm.address1" />
		</view>
		<view class="cu-form-group input">
			<view class="title">公司名称</view>
			<input placeholder="请输入公司名称" type="input" v-model="ruleForm.orgname" />
		</view> 
		<view class="cu-form-group input">
			<view class="title">信用代码</view>
			<input placeholder="请输入信用代码" type="input" v-model="ruleForm.xycode" />
		</view>
		<view>
			<button style="width: 70%;margin-left: 15%;" class="cu-btn block bg-blue margin-tb-sm lg" @tap="registered">提交信息</button>
		</view>
		<view>
			<button style="width: 70%;margin-left: 15%;" class="cu-btn block bg-white margin-tb-sm lg" @tap="resetForm">重置信息</button>
		</view>
		<mLoad :png="'/static/gs.png'" :msg="'注册中...'" v-if="loadModal"></mLoad>
	</view>
</template>

<script lang="ts">
	import {Vue,Provide,Component} from 'vue-property-decorator';
	import mLoad from '@/components/mLoad.vue';
	import bipSelect from '@/components/bip-ui/bip-select/bip-select.vue'
	import {Tools} from '@/classes/tools/Tools';
	import User from '@/classes/User';
	import {BIPUtil} from '@/classes/api/request';
	let tools = BIPUtil.ServApi;
	import {LoginModule} from '@/store/module/login'; //导入vuex模块，自动注入
 
	import Request from '@/lib/http/request.js';
	const http = new Request();
	import comm from '@/static/js/comm.js';
	let commURL: any = comm;
	http.config.baseUrl = commURL.BaseUri;
	import QueryEntity from '@/classes/search/QueryEntity';
	import QueryCont from '@/classes/search/QueryCont';
	import {dataTool} from '@/classes/tools/DataTools';
	const DataUtil = dataTool.utils;
	@Component({
		components: {
			mLoad,
			bipSelect
		},
	})
	export default class extends Vue {
		loadModal:boolean = false;
		isShowSel:boolean = false;
		showk:string = "orgname";
		hyValue:any = [];
		ruleForm:any =  {
			username: '',
			usrcode:'',
			yzcode1:'',
			address1:'',
			orgname:'',
			orgcode:'',
			orgcode1:'',
			xycode:'',
		};
		yzcode1Btn:any = "发送验证码";
		cansendcode:boolean = true;//是否可以发送验证码
		seconds:number = 60;
		smsurl:any = "";
		async onLoad(){ 
			let user: User = new User('portal', '', '')
			await tools.login(user).then((res: any) => { 
				let data = res.data
				if (data.id != -1) { 
					let _u = data.data.user
					user.userCode = _u.userCode
					user.userName = _u.userName
					user.attr = _u.attr
					user.deptInfo = _u.deptInfo 
					LoginModule.setUser(user) 
					LoginModule.setSnKey(data.data.snkey)  
				}
			});
			this.smsurl = commURL.SMSURL
			this.getHYDate();
		}
		//校验手机号
		async checkTel(value:any){
			//校验手机号是否注册过
			let param = {dbid:commURL.BaseDBID,ckid:2,usrcode:value};
			let res:any = await http.post("/reginfoCK", param , { header: { 'content-type': 'application/x-www-form-urlencoded' } });
			if(res.data == 0){
				this.doSendCode();
			}else{
				uni.showToast({
					title: '该手机号已注册过！！',
					icon:"none"
				})
				this.cansendcode = true;
				return false;
			}
		};
		sendCode(){
			this.checkTel(this.ruleForm.usrcode)
		}
		//发送验证码
		async doSendCode(){
			this.cansendcode = false;
			var myreg=/^[1][3,4,5,7,8][0-9]{9}$/;
			if (myreg.test(this.ruleForm.usrcode)) {
				let param = {tels : this.ruleForm.usrcode};
				let res = await http.post(this.smsurl+"xcode", param, { header: { 'content-type': 'application/x-www-form-urlencoded' } });
				uni.showToast({
					title: res.data.info,
					icon:"none"
				})
				this.seconds = 60;
				this.countDown();
			}else{
				uni.showToast({
					title: '请输入正确的手机号!',
					icon:"none"
				})
				this.cansendcode = true;
				// uni.showModal({title:"提示",content:"请输入正确的手机号！",showCancel:false}) 
			}
		}
		//发送验证码
		async countDown() {  
			this.seconds = this.seconds - 1;
			this.yzcode1Btn = this.seconds+ "秒后重新发送";
			if (this.seconds == 0) {  
				this.yzcode1Btn = "发送验证码"; 
				this.cansendcode = true;
				return;  
			}  
			setTimeout(() => {
				this.countDown();
			}, 1000);
		}  
		
		//注册
		async registered(){
			if(!this.ruleForm.username || this.ruleForm.username ==''){
				uni.showToast({title: '姓名不能为空!',icon:"none"})
				return 
			}
			if(!this.ruleForm.usrcode || this.ruleForm.usrcode ==''){
				uni.showToast({title: '请输入正确的手机号!',icon:"none"})
				return 
			}
			var myreg=/^[0-9]{5}$/;
			if (!myreg.test(this.ruleForm.yzcode1)) {
				uni.showToast({title: '验证码需要5位数字!',icon:"none"})
				return 
			}
			if(!this.ruleForm.orgcode1 || this.ruleForm.orgcode1 ==''){
				uni.showToast({title: '行业不能为空!',icon:"none"})
				return 
			}
			
			let param = {tels:this.ruleForm.usrcode,xcode:this.ruleForm.yzcode1};
			// let data = qs.stringify(param);
			let res:any = await http.post(this.smsurl+"/ckxcode", param , { header: { 'content-type': 'application/x-www-form-urlencoded' } });
			if(res.data.type=="-1"){
				uni.showToast({
					title: res.data.info,
					icon:"none"
				})
			}else if(res.data.type=="0"){
				this.loadModal = true;
				await tools.registered(this.ruleForm).then((res: any) => {
					if(res.data ==0){
					uni.showModal({title:"提示",content:"注册成功！用户名："+this.ruleForm.usrcode+",密码是手机号后8位！"
					,showCancel:false,success:function(){
						uni.redirectTo({
						 	'url': '/pages/login/login'
						})
					}}) 
					}else{
						uni.showToast({
							title: '注册失败!',
							icon:"none"
						})
					}
					this.loadModal = false;
				})
				.catch((res: any) => {
					this.loadModal = false;
				});
			}else {
				uni.showToast({
					title: '系统错误!',
					icon:"none"
				})
			}
		}
	
		//重置信息
		resetForm(){
			this.ruleForm =  {
				username: '',
				usrcode:'',
				yzcode1:'',
				address1:'',
				orgname:'',
				orgcode:'',
				orgcode1:'',
				xycode:'',
			}
		}
		
		//行业信息选择
		openSel(){
			this.isShowSel = true;
		}
		cancel(){
			this.isShowSel = false;
		}
		selectChange(e:any){ 
			this.ruleForm.orgcode = e.orgcode
			this.ruleForm.orgcode1 = e.orgname
			this.cancel();
		}
		selectOK(e:any){
			this.ruleForm.orgcode = e.orgcode
			this.ruleForm.orgcode1 = e.orgname
			this.cancel();
		}
		//获取行业信息
		async getHYDate(){
			this.hyValue = [];
			let qe:QueryEntity = new QueryEntity('','');
			qe.page.currPage = 1;
			qe.page.pageSize = 100;
			qe.cont = "";
			let vv = await tools.getBipInsAidInfo('INDUS',210,qe);
			console.log(vv);
			if(vv.data.id ==0){
				let values = vv.data.data.data.values;
				this.hyValue = values;
			}
		}
	}
</script>

<style scoped>
	.body{
		background-color: #FFFFFF;
		height: 100%;
		width: 100%;
		position: absolute;
	}
	.myTitle{
		color: rgb(78, 144, 238);
		display: block;
		font-size: 1.5em;
		margin-block-start: 0.83em;
		margin-block-end: 0.83em;
		margin-inline-start: 0px;
		margin-inline-end: 0px;
		font-weight: bold;
		text-align: center;
	}
</style>
