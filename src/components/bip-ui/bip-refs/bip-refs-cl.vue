<template>
	<view class="cu-form-group solid-bottom">
		<template v-if="label && !noLable">
			<view class="title" :class="[cell.isReq?'text-red':'']">{{ cell.labelString }}</view>
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
import BipInsAidNew from '@/classes/BipInsAidNew';
import CCliEnv from '@/classes/cenv/CCliEnv'
import CDataSet from '@/classes/pub/CDataSet';
@Component({
	components: {}
})
export default class bipRefsCl extends Vue{
	@Inject('env') env!:CCliEnv;
	@Prop({ type: Boolean }) noLable!: boolean;
	@Prop({ type: Object }) cell!: Cell;
	@Prop({type:String}) obj_id!:string;
	@Prop({type:Boolean,default:false}) label!:boolean;
	@Prop({type:Number,default:-1}) rowId!:number;
	@Inject('bipInsAid') bipInsAid!:BipInsAidNew;
	mode:string = '0';
	showValue:string = '';
	cds:CDataSet = new CDataSet(null)
	created(){
		this.$nextTick(()=>{
			this.cds = this.env.getDataSet(this.obj_id);
			this.mode = this.record.data[this.cell.id];
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
	
	
	
	@Watch('record',{deep:true})
	recordChange(){
		if(Object.keys(this.record.data).length>0){
			this.$nextTick(()=>{
				let rr = this.record.data[this.cell.id];
				this.mode = rr;
				this.makeCLshow();
			})
		}
	}
	
	makeCLshow(){
		if(Object.keys(this.record.data).length>0){
			if(this.mode !== '' &&this.bipInsAid.values){
				let idx = this.bipInsAid.values.findIndex((item:any)=>{
					let k1 = item[this.bipInsAid.cells.cels[0].id];
					return k1 == this.mode;
				})
				if(idx>-1){
					let item = this.bipInsAid.values[idx];
					this.showValue = item[this.bipInsAid.cells.cels[1].id];
				}
			}
		}
		
	}	
}
</script>