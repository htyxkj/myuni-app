<template>
	<view class="mine-info">
		<view class=" bg-white header" style="backgroundImage:url('../../static/mine/bg.jpg')" >
			<view>
				<view class="cu-avatar xl round my-margin-top bg-white" style="background-image:url(../../static/gs.png);"></view>
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
	</view>
</template>
<script lang="ts">
	import {Vue,Prop,Component} from 'vue-property-decorator';
	import {LoginModule} from '@/store/module/login'; //导入vuex模块，自动注入
	import { InsAidModule } from '@/store/module/insaid'; //导入vuex模块，自动注入
	import {BIPUtil} from '@/classes/api/request';
	let tools = BIPUtil.ServApi;
	import {icl} from '@/classes/tools/CommICL';
	const ICL = icl; 
	@Component({
		components:{}
	})
	export default class MyTop extends Vue {
		@Prop({default:null}) layoutdata?:any;
		gwName:any = '';//岗位名称
		editName:any ='MULGW';//岗位辅助

		async mounted() {
			this.getGWName(this.user.gwCode);
		}
		get user(){
			return LoginModule.user
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
<style scoped>
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