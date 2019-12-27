<template>
	<view class="cu-form-group solid-bottom">
		<template v-if="label">
			<view class="title">{{ cell.labelString }}</view>
		</template>
		<input :type="'text'" v-model="modes" disabled="true"/>
		<text class="text-progress text-bold cuIcon-fork"></text>
	</view>
</template>
<script lang="ts">
	//辅助参照
import { Vue, Component, Prop, Watch,Inject } from 'vue-property-decorator';
import Cell from '@/classes/pub/coob/Cell';
import CRecord from '@/classes/pub/CRecord';
import { BIPUtil } from '@/classes/api/request';
let tools = BIPUtil.ServApi;
import {icl} from '@/classes/tools/CommICL';
const ICL = icl; 
import { InsAidModule } from '@/store/module/insaid'; //导入vuex模块，自动注入
import BipInsAidNew from '@/classes/BipInsAidNew';
import CCliEnv from '@/classes/cenv/CCliEnv'
import CDataSet from '@/classes/pub/CDataSet';
@Component({
	components: {}
})
export default class bipRefsFz extends Vue{
	@Inject('env') env!:CCliEnv;
	@Prop({ type: Object }) cell!: Cell;
	@Prop({type:String}) obj_id!:string;
	@Prop({type:Boolean,default:false}) label!:boolean;
	@Prop({type:Number,default:-1}) rowId!:number;
	@Inject('bipInsAid') bipInsAid!:BipInsAidNew;
	mode:string = '';
	showValue:string = '';
	aidKey:string = '';
	cds:CDataSet = new CDataSet(null)
	created(){
		// console.log(this.bipInsAid)
		this.$nextTick(()=>{
			this.cds = this.env.getDataSet(this.obj_id);
			this.mode = this.record.data[this.cell.id];
			let mkey = this.obj_id+"_"+this.cell.id
			uni.$on(mkey,this.cellDataChange);
			this.aidKey = ICL.AID_KEY+this.bipInsAid.id;
			if(this.mode !=='' && this.mode !== undefined){
				let key = this.aidKey+"_"+this.mode;
				let rr = this.aidValues.get(key);
				if(rr){
					this.bipInsAid.values[0] = rr;
					this.bipInsAid.makeShow();
					this.showValue = this.bipInsAid.showV;
				}else{
					if(!this.inProcess.get(key))
						this.makeRefshow();
				}
			}
		})
	}
	
	get modes(){
		return this.showValue || this.mode;
	}
	
	get record():CRecord{
		return this.cds.getRecord(this.rowId)
	}

	cellDataChange(){
		console.log('监听值变化');
		this.recordChange();
	}
	
	get aidValues(){
		return InsAidModule.aidValues;
	}
	
	@Watch('aidValues')
	aidValuesChange(){
		this.$nextTick(()=>{
			if(this.mode !==''){
			let key = this.aidKey+"_"+this.mode;
			let rr = this.aidValues.get(key);
			// console.log(rr,'aidValues')
			if(rr){
				this.bipInsAid.values[0] = rr;
				this.bipInsAid.makeShow();
				this.showValue = this.bipInsAid.showV;
				}
			}
		})
		
	}
	
	@Watch('record')
	recordChange(){
		this.$nextTick(()=>{
			let rr = this.record.data[this.cell.id];
			if(rr !== this.mode){
				this.makeRefshow()
			}
		})
		
	}

	get inProcess(){
		return InsAidModule.inProcess;
	}

	makeRefshow(){
		let key = this.aidKey+"_"+this.mode;
		if(!this.inProcess.get(key)){
			let rtn = this.aidValues.get(key);
			if(!rtn){
				let cel = this.bipInsAid.cells.cels[0];
				if(cel){
					let cont = "";
					if(cel.type<12){
						cont = cel.id+"="+this.mode+""
					}else{
						cont = cel.id+"='"+this.mode+"'"
					}
					let vvs = {id:this.bipInsAid.id,key:key,cont:cont}
					InsAidModule.fetchInsDataByCont(vvs);
				}
				
			}
		}else{
			let rtn = this.aidValues.get(key);
			if(rtn){
				this.bipInsAid.values[0] = rtn;
				this.bipInsAid.makeShow();
				this.showValue = this.bipInsAid.showV;
			}
		}
	}
}
</script>