<template>
	<view class="myBody">
		<cu-custom :bgColor="'bg-'+color" :isBack="true">
			<block slot="content">
				<view class="header-title">{{ title }}</view>
			</block>
		</cu-custom>
		<view class="margin-lr-sm margin-tb-sm">
			<template v-if="loading == false">
				<view v-for="(item,index) in dlgDsm.ccells.cels" :key="index">
					<bip-comm :obj_id="dlgDsm.ccells.obj_id" :cell="item" v-if="item.onshow" ></bip-comm>
				</view>
				<view class="padding-xl margin-xl"></view>
				<view class="padding-xs margin-xs"></view>
			</template>
		</view>
		<view class="cu-bar tabbar bg-white shadow foot my-b-menu">
			<view class="submit bg-gray margin-sm" @click="saveData(0)"><text>取消</text></view>
			<view class="submit margin-sm" :class="'bg-'+color" @click="saveData(1)"><text>保存</text></view>
		</view>
		<mLoad v-if="loading" :png="'/static/gs.png'" :msg="'操作进行中...'"></mLoad>
		<message ref="msg"></message>
	</view>
</template>

<script lang="ts">
let dd = require( 'dingtalk-jsapi');
import { Vue, Provide, Component, Prop, Watch } from 'vue-property-decorator';
import mLoad from '@/components/mLoad.vue';//加载页面
import { GlobalVariable } from '@/classes/tools/ICL';
import CDataSet from '@/classes/pub/CDataSet';
import {BIPUtil} from '@/classes/api/request';
let tools = BIPUtil.ServApi;
import bipComm from '@/components/bip-ui/bip-comm/bip-comm.vue';
import URIParams from '@/classes/URIParams';
import CCliEnv from '@/classes/cenv/CCliEnv';
import BipMenuBar from '@/classes/pub/BipMenuBar';
import QueryEntity from '@/classes/search/QueryEntity';
import { dataTool } from '@/classes/tools/DataTools';
import { Tools } from '../../classes/tools/Tools';
const DataUtil = dataTool.utils;
@Component({components:{mLoad,bipComm}})
export default class DLG extends Vue {
	title:any = "";
	color:any = "";
	loading:boolean = false;

	cellId:string = "";
	dlgDsm: CDataSet = new CDataSet(null);
	@Provide('env') env: CCliEnv = new CCliEnv();
	uriParam: URIParams = new URIParams();
	ds_ext: Array<CDataSet> = Array<CDataSet>();
	mbs: BipMenuBar = new BipMenuBar();	
	qe:QueryEntity = new QueryEntity('','');
	async onLoad(option: any) {
		this.loading = true;
		this.cellId = option.cellId;
		this.title = option.title;
		this.color = option.color;
		this.qe.cont = '{'+option.key+':"'+option.vl+'"}';
		await this.initData();
		await this.findData(this.cellId);
		this.loading = false;
	}
	async initData(){
		this.dlgDsm = await this.initCell(this.cellId);
		for(var i=0;i<this.dlgDsm.ccells.cels.length;i++){
			let cel:any = this.dlgDsm.ccells.cels[i];
			if((cel.attr & 0x400 )===0){
				cel.onshow = true;
			}
		}
		this.env.initInfo(this.uriParam,[this.dlgDsm.ccells] , this.mbs, this.dlgDsm, this.ds_ext);
	}
	async saveData(type:any){
		if(type ==0){
			uni.navigateBack({
				delta: 1
			});
			return;
		}
		let bok = await this.checkNotNull(this.dlgDsm);
		if(!bok){
			return ; 
		}
		this.loading = true;
		let res:any = await tools.saveData(this.dlgDsm.currRecord,this.cellId, "");
		let rtn = res.data;
		if(rtn.id==0){
			this.loading = false;
			if(res){
				uni.showModal({title:"提示",content:"操作成功！",showCancel:false,success:function(){
					uni.navigateBack({delta:1})	
				}}) 
			}else{
				uni.showModal({title:"提示",content:"操作失败！",showCancel:false,success:function(){
						
				}}) 
			}
		}else{
			this.loading = false;
			uni.showModal({title:"提示",content:rtn.message,showCancel:false}) 
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
	//加载数据
	findData(objid:string = ''){
		this.qe.tcell = objid;
		this.qe.pcell = objid;
		this.qe.oprid = 13;
		tools.query(this.qe).then((res:any)=>{
			let rr = res.data;
			if(rr.id==0){
				let infos = rr.data.data;
				let cds = this.env.getDataSet(objid);
				infos.data.forEach((cr:any)=>{
					cds.addRecord(cr);
				})
				//处理二次初值
				this.secondAssignment(cds);
			}
			this.loading = false;
		});
	}
	//处理二次初值
	secondAssignment(cds:any){
		if(cds){
			let cr = DataUtil.createRecord(this.dlgDsm,this.env);
			let cels = cds.ccells.cels;
			for(let i=0;i<cels.length;i++){
				let cel = cels[i];
				let cc = Tools.bitOperation(cel.attr,0x100000000);
            	if(cc >0 && !cds.currRecord.data[cel.id]){//二次初值
					cds.currRecord.data[cel.id] = cr.data[cel.id];
				}
			}
		}
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
}
</script>

<style lang="scss" scoped>

</style>
