<template>
	<view class="cu-form-group solid-bottom">
		<template v-if="label">
			<view class="title">{{ cell.labelString }}</view>
		</template>
		<input type="text" v-model="modes" disabled="true"/>
		<text class="text-progress text-bold cuIcon-tag"></text>
	</view>
</template>
<script lang="ts">
	//常量参照
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
export default class bipRefsCl extends Vue{
	@Inject('env') env!:CCliEnv;
	@Prop({ type: Object }) cell!: Cell;
	@Prop({type:String}) obj_id!:string;
	@Prop({type:Boolean,default:false}) label!:boolean;
	@Prop({type:Number,default:-1}) rowId!:number;
	@Inject('bipInsAid') bipInsAid!:BipInsAidNew;
	mode:string = '';
	showValue:string = '';
	cds:CDataSet = new CDataSet(null)
	created(){
		this.$nextTick(()=>{
			this.cds = this.env.getDataSet(this.obj_id);
			this.mode = this.record.data[this.cell.id];
			let mkey = this.obj_id+"_"+this.cell.id
			uni.$on(mkey,this.cellDataChange);
			this.makeCLshow();
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
	
	@Watch('record')
	recordChange(){
		this.$nextTick(()=>{
			let rr = this.record.data[this.cell.id];
			if(rr !== this.mode){
				this.mode = rr||''
				this.makeCLshow();
			}
		})
		
	}
	
	makeCLshow(){
		if(this.mode !== '' &&this.bipInsAid.values){
			let idx = this.bipInsAid.values.findIndex((item:any)=>{
				return item[this.bipInsAid.cells.cels[0].id]+'' === this.mode+'';
			})
			if(idx>-1){
				let item = this.bipInsAid.values[idx];
				this.showValue = item[this.bipInsAid.cells.cels[1].id];
			}
		}
	}	
}
</script>