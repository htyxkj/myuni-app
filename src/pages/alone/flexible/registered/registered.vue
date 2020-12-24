<template>
	<view class="body">
		<cu-custom bgColor="bg-gradual-pink" :isBack="true">
			<block slot="backText">返回</block>
			<block slot="content"><view class="header-title">注册</view></block>
		</cu-custom>
		<template v-if="regType ==0">
			<view class="header margin-top">
				<image src="../../../../static/gs.png" mode="aspectFit"></image>
			</view>
			
			<view class="bg-white mycard margin padding" @tap="gotoReg(1)">
				<view class="flex align-center">
					<view class="radius padding">
						<image class="img" src="../../../../static/flexible/gr.png" mode="aspectFit"></image>
					</view>
					<view class="radius mytext margin-left">
						个人注册
					</view>
				</view>
			</view>

			<view class="bg-white mycard margin padding" @tap="gotoReg(2)">
				<view class="flex align-center">
					<view class="radius padding">
						<image class="img" src="../../../../static/flexible/gr.png" mode="aspectFit"></image>
					</view>
					<view class="radius mytext margin-left">
						企业注册
					</view>
				</view>
			</view>
			<!--<view class="cu-card margin-top">
				<view class="cu-item bg-img shadow-blur" :style="[{backgroundImage:'url(https://image.weilanwl.com/color2.0/plugin/qpct2148.jpg)'}]" @tap="gotoReg(1)">
					<view class="cardTitle">
						个人注册
					</view>
				</view>
			</view>
			<view class="cu-card">
				<view class="cu-item bg-img shadow-blur" :style="[{backgroundImage:'url(https://image.weilanwl.com/color2.0/plugin/sylb2244.jpg)'}]" @tap="gotoReg(2)">
					<view class="cardTitle">
						企业注册
					</view>
				</view>
			</view> -->
		</template>
		<template v-if="regType ==1">
			<view class="margin-top"></view>
			<view v-for="(item,index) in personalDsm.ccells.cels" :key="index">
				<bip-comm :obj_id="personalDsm.ccells.obj_id" :cell="item" v-if="item.onshow" ></bip-comm>
			</view>
			<view class="cu-bar bg-white margin-top">
				<view class="action">
					上传照片
				</view>
				<view class="action">
					{{imgList.length}}/1
				</view>
			</view>
			<view class="cu-form-group">
				<view class="grid col-4 grid-square flex-sub">
					<view class="bg-img" v-for="(item,index) in imgList" :key="index" @tap="ViewImage" :data-url="imgList[index]">
					 <image :src="imgList[index]" mode="aspectFill"></image>
						<view class="cu-tag bg-red" @tap.stop="DelImg" :data-index="index">
							<text class='cuIcon-close'></text>
						</view>
					</view>
					<view class="solids" @tap="ChooseImage" v-if="imgList.length<1">
						<text class='cuIcon-cameraadd'></text>
					</view>
				</view>
			</view>
			<view class="margin-top">
				<button class="cu-btn block bg-blue margin-tb-sm lg" @tap="savePersonal(true)">
					<text class="cuIcon-form"></text> 注册
				</button>
			</view>
		</template>
		<template v-if="regType ==2">
			<view class="cu-form-group margin-top">
				<view class="title">企业类型</view>
				<picker @change="companyTypeChange" :value="companyTypeIndex"  range-key="name" :range="companyType">
					<view class="picker">
						{{companyType[companyTypeIndex].name}}
					</view>
				</picker>
			</view>
			<template v-if="companyType[companyTypeIndex].code != 'A04'">
				<view v-for="(item,index) in enterpriseDsm.ccells.cels" :key="index">
					<bip-comm :obj_id="enterpriseDsm.ccells.obj_id" :cell="item" v-if="item.onshow" ></bip-comm>
				</view>
				<view class="cu-bar bg-white margin-top">
					<view class="action">
						上传照片
					</view>
					<view class="action">
						{{imgList.length}}/1
					</view>
				</view>
				<view class="cu-form-group">
					<view class="grid col-4 grid-square flex-sub">
						<view class="bg-img" v-for="(item,index) in imgList" :key="index" @tap="ViewImage" :data-url="imgList[index]">
						 <image :src="imgList[index]" mode="aspectFill"></image>
							<view class="cu-tag bg-red" @tap.stop="DelImg" :data-index="index">
								<text class='cuIcon-close'></text>
							</view>
						</view>
						<view class="solids" @tap="ChooseImage" v-if="imgList.length<1">
							<text class='cuIcon-cameraadd'></text>
						</view>
					</view>
				</view>
				<view class="margin-top">
					<button class="cu-btn block bg-blue margin-tb-sm lg" @tap="saveEnterprise(true)">
						<text class="cuIcon-form"></text> 注册
					</button>
				</view>
			</template>
			<template v-else>
				<view v-for="(item,index) in personalfamilyDsm.ccells.cels" :key="index">
					<bip-comm :obj_id="personalfamilyDsm.ccells.obj_id" :cell="item" v-if="item.onshow" ></bip-comm>
				</view>
				<view class="cu-bar bg-white margin-top">
					<view class="action">
						上传照片
					</view>
					<view class="action">
						{{imgList.length}}/1
					</view>
				</view>
				<view class="cu-form-group">
					<view class="grid col-4 grid-square flex-sub">
						<view class="bg-img" v-for="(item,index) in imgList" :key="index" @tap="ViewImage" :data-url="imgList[index]">
						 <image :src="imgList[index]" mode="aspectFill"></image>
							<view class="cu-tag bg-red" @tap.stop="DelImg" :data-index="index">
								<text class='cuIcon-close'></text>
							</view>
						</view>
						<view class="solids" @tap="ChooseImage" v-if="imgList.length<1">
							<text class='cuIcon-cameraadd'></text>
						</view>
					</view>
				</view>
				<view class="margin-top">
					<button class="cu-btn block bg-blue margin-tb-sm lg" @tap="savePersonalfamily(true)">
						<text class="cuIcon-form"></text> 注册
					</button>
				</view>
			</template>
		</template>
		<template v-if="regType ==1 || regType ==2">
			<bip-protocol @plChange="plChange" :showTY="1"></bip-protocol>
		</template>
		<mLoad :png="'/static/gs.png'" :msg="'注册中...'" v-if="loadModal"></mLoad>
	</view>
</template>

<script lang="ts">
	import {Vue,Provide,Component} from 'vue-property-decorator';
	import mLoad from '@/components/mLoad.vue';
	import {Tools} from '@/classes/tools/Tools';
	import User from '@/classes/User';
	import {BIPUtil} from '@/classes/api/request';
	let tools = BIPUtil.ServApi;
	import {LoginModule} from '@/store/module/login'; //导入vuex模块，自动注入
	import URIParams from '@/classes/URIParams';
	import BipMenuBar from '@/classes/pub/BipMenuBar';
	import QueryEntity from '@/classes/search/QueryEntity';
	import QueryCont from '@/classes/search/QueryCont';
	import CDataSet from '@/classes/pub/CDataSet';
	import CRecord from '@/classes/pub/CRecord';
	import CCliEnv from '@/classes/cenv/CCliEnv';
	import {dataTool} from '@/classes/tools/DataTools';
	const DataUtil = dataTool.utils;
	
	import bipProtocol from '@/components/bip-ui/bip-protocol/bip-protocol.vue';
	import bipComm from '@/components/bip-ui/bip-comm/bip-comm.vue';
	@Component({
		components: {
			mLoad,
			bipComm,
			bipProtocol
		},
		name: 'Login'
	})
	export default class extends Vue {
		regType:any =0;//注册类型  0:选择注册类型；1：个人注册；2：企业注册
		loadModal: boolean = false
		vueId: string = Tools.guid()
		checkPhoneRefName:string = "CHECKTEL"
		
		@Provide('env') env: CCliEnv = new CCliEnv();

		uriParam: URIParams = new URIParams();
		mbs: BipMenuBar = new BipMenuBar();
		ds_ext: Array<CDataSet> = Array<CDataSet>();
		imgList:any=[];//图片
		userCell:string = "ZC0002";//用户表
		/***********************************个人注册*************************************/
		personalCell:string = "ZC0001";//个人注册
		personalDsm: CDataSet = new CDataSet(null);
		
		/***********************************企业注册*************************************/
		companyTypeIndex:any=0//企业类型
		companyType:any=[{code:"A01",name:'企业单位'},{code:'A02',name:'个体单位'},{code:'A03',name:'劳务派遣公司'},{code:'A04',name:'个人家庭招聘'}]//租住类型
		personalfamilyDsm: CDataSet = new CDataSet(null);//个人家庭
		personalfamilyCell:string  = "ZC0003";
		
		enterpriseDsm: CDataSet = new CDataSet(null);//企业
		enterpriseCell:string  = "ZC0004";
		
		protocol:boolean = false;//是否同意协议
		plName:any = "";//协议名称

		async onLoad(){
			this.regType =0;
			this.companyTypeIndex = 0;
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
		}
		
		async gotoReg(type:any){
			this.imgList=[];
			if(type == 1){
				this.personalDsm = await this.initCell(this.personalCell);
				this.personalDsm.removeRecord(this.personalDsm.currRecord);
				let cr:any = DataUtil.createRecord(this.personalDsm,this.env);
				this.personalDsm.addRecord(cr);
				for(var i=0;i<this.personalDsm.ccells.cels.length;i++){
					let cel:any = this.personalDsm.ccells.cels[i];
					if((cel.attr & 0x400 )===0){
						cel.onshow = true;
					}
				}
				this.regType = type;
				this.env.initInfo(this.uriParam,[this.personalDsm.ccells] , this.mbs, this.personalDsm, this.ds_ext);
			}else{
				this.enterpriseDsm = await this.initCell(this.enterpriseCell);
				this.regType = type;
				this.companyTypeIndex = 0;
				this.enterpriseDsm.removeRecord(this.enterpriseDsm.currRecord);
				let cr:any = DataUtil.createRecord(this.enterpriseDsm,this.env); 
				this.enterpriseDsm.addRecord(cr); 
				for(var i=0;i<this.enterpriseDsm.ccells.cels.length;i++){
					let cel:any = this.enterpriseDsm.ccells.cels[i];
					if((cel.attr & 0x400 )===0){
						cel.onshow = true;
					}
				}
				this.env.initInfo(this.uriParam,[this.enterpriseDsm.ccells] , this.mbs, this.enterpriseDsm, this.ds_ext);
			}
		}
		
/**************************************个人注册START****************************************/
		//进行注册
		async savePersonal(saveImg:boolean){
			if(!this.protocol){
				uni.showModal({title:"提示",content:"请先阅读并同意"+this.plName,showCancel:false,}) 
				return;
			}
			this.saveData(this.personalDsm,this.personalCell,saveImg)
		}
/**************************************个人注册END****************************************/

/**************************************企业注册START*******************************************/
		//企业类型发生变化
		async companyTypeChange(e:any){
			this.companyTypeIndex = e.detail.value
			this.imgList = []
			if(this.companyType[this.companyTypeIndex].code =='A04'){
				this.personalfamilyDsm = await this.initCell(this.personalfamilyCell);
				this.personalfamilyDsm.removeRecord(this.personalfamilyDsm.currRecord);
				let cr:any = DataUtil.createRecord(this.personalfamilyDsm,this.env);
				this.personalfamilyDsm.addRecord(cr);
				this.env.initInfo(this.uriParam,[this.personalfamilyDsm.ccells] , this.mbs, this.personalfamilyDsm, this.ds_ext);
				for(var i=0;i<this.personalfamilyDsm.ccells.cels.length;i++){
					let cel:any = this.personalfamilyDsm.ccells.cels[i];
					if((cel.attr & 0x400 )===0){
						cel.onshow = true;
					}
				}
			}else{
				this.enterpriseDsm = await this.initCell(this.enterpriseCell);
				this.enterpriseDsm.removeRecord(this.enterpriseDsm.currRecord);
				let cr:any = DataUtil.createRecord(this.enterpriseDsm,this.env); 
				this.enterpriseDsm.addRecord(cr); 
				for(var i=0;i<this.enterpriseDsm.ccells.cels.length;i++){
					let cel:any = this.enterpriseDsm.ccells.cels[i];
					if((cel.attr & 0x400 )===0){
						cel.onshow = true;
					}
				}
				this.env.initInfo(this.uriParam,[this.enterpriseDsm.ccells] , this.mbs, this.enterpriseDsm, this.ds_ext);
			}
		}
		//企业注册
		async saveEnterprise(saveImg:boolean){
			if(!this.protocol){
				uni.showModal({title:"提示",content:"请先阅读并同意"+this.plName,showCancel:false,}) 
				return;
			}
			this.saveData(this.enterpriseDsm,this.enterpriseCell,saveImg)
		}
		//家庭注册
		async savePersonalfamily(saveImg:boolean){
			this.saveData(this.personalfamilyDsm,this.personalfamilyCell,saveImg)
		}
/**************************************企业注册END*******************************************/
/**************************************注册方法START*******************************************/
		async saveData(dsm:CDataSet,cell:string,saveImg:boolean){
			let bok = await this.checkNotNull(dsm);
			if(!bok){
				return ; 
			}
			bok = await this.checkPhone(dsm.currRecord.data.phone)
			if(!bok){
				return;
			}
			if(saveImg && this.imgList.length >0){
				await this.planReportSave(this.imgList[0],cell);
				return;
			}
			this.loadModal = true;
			let res:any = await tools.saveData(dsm.currRecord,cell, "");
			let rtn = res.data;
			if(rtn.id==0){
				this.loadModal = false;
				let res = await this.saveUser(dsm.currRecord.data.phone,dsm.currRecord.data.name,dsm.currRecord.data.phone);
				if(res){
					uni.showModal({title:"提示",content:"注册成功！",showCancel:false,success:function(){
						uni.navigateBack({delta:1})	
					}}) 
				}else{
					uni.showModal({title:"提示",content:"注册失败！",showCancel:false,success:function(){
						 
					}}) 
				}
			}else{
				this.loadModal = false;
				uni.showModal({title:"提示",content:rtn.message,showCancel:false}) 
			}
		}


/**************************************注册方法END*******************************************/
		//添加值用户表
		async saveUser(usrcode:any,usrname:any,tel:any){
			let dsm:CDataSet = new CDataSet(null);
			dsm = await this.initCell(this.userCell);
			dsm.removeRecord(dsm.currRecord);
			let cr:CRecord = DataUtil.createRecord(dsm,this.env);
			dsm.addRecord(cr);
			dsm.currRecord.data.usrcode = usrcode;
			dsm.currRecord.data.usrname = usrname;
			dsm.currRecord.data.tel = tel;
			if(this.regType == 1){//个人用户
				dsm.currRecord.data.gwcode = 2
			}else if(this.regType ==2){//企业用户
				dsm.currRecord.data.gwcode = 1
			}
			let res:any = await tools.saveData(dsm.currRecord,this.userCell, "");
			if(res.data.id ==0)
				return true;
		}
		//检查手机号是否注册过
		async checkPhone(tel:any){
			let qe = new QueryEntity("","");//查询实体
			qe.page.pageSize = 1000;
			qe.page.currPage = 1; 
			let qcont:QueryCont = new QueryCont("tel",tel,12);//查询条件
			qcont.setContrast(0)
			qe.cont = '~[['+JSON.stringify(qcont)+']]';
			let res:any  = await tools.getBipInsAidInfo(this.checkPhoneRefName,210,qe);
			if(res.data.id ==0){
				let page =res.data.data.data.page;
				let total = page.total
				if(total ==0){
					return true;
				}else{
					uni.showToast({title:"手机号已被注册！",icon:'none'})
				}
			}
			return false;
		}
		//选择照片
		ChooseImage() {
			uni.chooseImage({
				count: 1, //默认9
				sizeType: ['original', 'compressed'], //可以指定是原图还是压缩图，默认二者都有
				// sourceType: ['album'], //从相册选择
				success: (res) => { 
					this.imgList = res.tempFilePaths  
				}
			});
		}
		//删除
		DelImg(e:any) {
			this.imgList.splice(e.currentTarget.dataset.index, 1);
		}
		//点击图片
		ViewImage(e:any) {
			uni.previewImage({
				urls: this.imgList,
				current: e.currentTarget.dataset.url
			});
		}
		async planReportSave(file:any,fjkey:any){
			let params = {
				fname : new Date().getTime()+".png",
				fjkey : fjkey
			} 
			tools.uniAppUploadFile(file,params,this.fileSuccess,this.fileFail); 
		} 
		//文件上传成功
		fileSuccess(uploadFileRes:any){
			let data = uploadFileRes.data;
			data = JSON.parse(data) 
			if(data.id ==0){
				if(this.regType ==1){
					this.personalDsm.currRecord.data.fj_root = data.data.fj_root;
					this.personalDsm.currRecord.data.fj_name = data.data.fname;
					this.savePersonal(false)
				}else{
					if(this.companyType[this.companyTypeIndex].code =='A04'){//个人家庭
						this.personalfamilyDsm.currRecord.data.fj_root = data.data.fj_root;
						this.personalfamilyDsm.currRecord.data.fj_name = data.data.fname;
						this.savePersonalfamily(false)
					}else{//企业
						this.enterpriseDsm.currRecord.data.fj_root = data.data.fj_root;
						this.enterpriseDsm.currRecord.data.fj_name = data.data.fname;
						this.saveEnterprise(false)
					}
				}
			} else{
				this.loadModal = false;
				uni.showToast({title:"照片上传失败！",icon:'none'})
			}
		}
		//文件上传失败
		fileFail(error:any){
			this.loadModal = false;
			uni.showToast({title:"照片上传失败！",icon:'none'})
		}
		//获取对象定义
		async initCell(cell:any){
			let res:any = await tools.getCCellsParams(cell);
			if (res.data.id == 0) {
				return new CDataSet(res.data.data.layCels[0]); 
			}else{
				uni.showToast({title:'没有获取到对象定义'+cell,icon:'none'})
				return new CDataSet(null);
			}
		}
		//检查非空项
		checkNotNull(cds:CDataSet):boolean{ 
			let bok = true;
			cds.ccells.cels.forEach(item => {
				if (item.unNull&&bok) {
					let vl = null;
					if(cds.currRecord.data[item.id]!=null)
						vl = cds.currRecord.data[item.id]+''; 
					if (!vl ) {
						uni.showToast({title:"【" + item.labelString + "】不能为空!",icon:'none'})
						bok =  false;
						return false;
					}
				}
			}); 
			return bok;
		}
		plChange(vl:any){
			this.protocol = vl[0];
			this.plName = vl[1]
		}
	}
</script>

<style scoped>
	.cardTitle {
		color: #fff;
		padding: 90upx 60upx;
		font-size: 45rpx;
		font-weight: 350;
		transform: skew(-10deg, 0deg);
		position: relative;
		text-shadow: 0px 0px 6upx rgba(0, 0, 0, 0.3);
		text-align: right;
	} 
	.cu-form-group .title {
		min-width: calc(4em + 15px);
	}
	.body{
		background-color: #FFFFFF;
		height: 100%;
		width: 100%;
		position: absolute;
	}
	.header {
		text-align: center;
		background-color: #FFFFFF;
	}
	.header image {
		width: 450upx;
		height: 450upx;
		border-radius: 50%;
	}
	.img{
		width: 110upx;
		height: 110upx;
		border-radius: 50%;
		margin-left: 30upx;
	}
	.mycard{ 
		box-shadow: 0px 0px 12px 1px rgba(163, 163, 163, 0.5);
		border-radius: 10upx; 
	} 
	.mytext{
		font-size: 25px;
		color: #1e1e1e;
	}
</style>
