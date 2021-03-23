<template>
	<view class="cu-form-group solid-bottom">
		<template v-if="cell">
			<view class="title" :class="[cell.isReq?'text-red':'']">{{ cell.labelString || title }}</view>
			<input :placeholder="cell.labelString" type="text" v-model="mode1" @tap.stop="open()" disabled="true"/>
			<text :class="['cuIcon-locationfill', 'text-grey']" @tap.stop="open()"></text>
		</template>
	</view>
</template>
<script lang="ts">
import Cell from '@/classes/pub/coob/Cell';
import CCliEnv from '@/classes/cenv/CCliEnv';
import CDataSet from '@/classes/pub/CDataSet';
import CRecord from '@/classes/pub/CRecord';
import { Vue, Prop, Component,Inject,Watch } from 'vue-property-decorator';
import { dataTool } from '@/classes/tools/DataTools';
const DataUtil = dataTool.utils;
@Component({
	components: {}
})
export default class bipGps extends Vue{
	@Inject('env') env!:CCliEnv;
	@Prop({ type: Object }) cell!: Cell;
	@Prop({type:String}) obj_id!:string;
	mode1: string = '';
	cds:CDataSet = new CDataSet(null)

	longitude:any = null;//经度
	latitude:any = null;//维度
	mapRootCel:any =null;//存放经纬度字段Cel
	root_mode:any = "";

	//钉钉配置信息
	ddCorpId:any = "";
	ddAgentId:any = "";
	ddCfg:any = "";

	async created(){
		this.cds = this.env.getDataSet(this.obj_id);
		this.mode1 = this.record.data[this.cell.id]
		for(var i=0;i<this.cds.ccells.cels.length;i++){
			if(this.cds.ccells.cels[i].id == this.cell.id){
				this.mapRootCel = this.cds.ccells.cels[(i+1)];
			}
		}
		this.root_mode = this.record.data[this.mapRootCel.id]
	}
	//打开位置选择	
	open(){ 
		let methordName = this.obj_id+"GPS"
		uni.$off(methordName,this.GpsSelOk)
		uni.$on(methordName,this.GpsSelOk);
		uni.showLoading({
			title:'跳转中...'
		})
		let ds = this.disabled;
		let refValue = this.cell.refValue;
		let url = "/pages/public/gps/gps?methordName="+methordName+"&ds="+ds+"&gps="+this.root_mode+"&refValue="+refValue;
		uni.navigateTo({url:url,complete: () => {
			uni.hideLoading();
		}}); 
	}
	//GPS选择完成 
	//参数  地址名称,经纬度信息
	GpsSelOk(param:any){
		let address = param.address;
		let lgt = param.lgt;
		if(!this.disabled){
			this.mode1 = address;
			this.cds.cellChange(address,this.cell.id);
			this.cds.cellChange(lgt,this.mapRootCel.id);
			DataUtil.checkGS(this.cds,this.env,this.cell)
			DataUtil.checkGS(this.cds,this.env,this.mapRootCel)
			uni.$emit(this.obj_id+"_"+this.mapRootCel.id)
		}
	}
 
	get record():CRecord{
		return this.cds.getRecord(this.cds.index)
	}
	get disabled(){
		if(this.cds.ccells!=null){
			let attr = this.cell.attr&0x40;
			if(attr>0){
				return true;
			}else{
				return !DataUtil.currCanEdit(this.cds,this.env);
			}
		}
		else{
			if(this.cell){
				let attr = this.cell.attr&0x40;
				return attr>0 ;
			}
			return false;
		}
	}
	@Watch('record')
	recordChange(){
		let rr = this.record.data[this.cell.id];
		if(rr !== this.mode1){
			this.mode1 = rr||''
		}
	}	
}
</script>
