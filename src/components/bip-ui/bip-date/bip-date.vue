<template>
	<view class="cu-form-group solid-bottom">
		<template v-if="cell">
			<view class="title" :class="[cell.isReq?'text-red':'']">{{ cell.labelString || title }}</view>
		</template>
		<input class="text-right" :placeholder="cell.labelString || title " type="text" v-model="mode" disabled="true"/>
		<text class="cuIcon-calendar" @tap.stop="open()"></text>
		<bip-picker-date :mode="pickerType"  @confirm="onConfirm" ref="calendar" ></bip-picker-date>
	</view>
</template>
<script lang="ts">
import { Vue, Prop, Component, Watch,Inject } from 'vue-property-decorator';
import Cell from '@/classes/pub/coob/Cell';
import bipPickerDate from '../bip-picker/bip-picker-date.vue'
import CRecord from '@/classes/pub/CRecord';
import CCliEnv from '@/classes/cenv/CCliEnv'
import CDataSet from '@/classes/pub/CDataSet';
import { dataTool } from '@/classes/tools/DataTools';
const DataUtil = dataTool.utils;
import BipInsAidNew from '@/classes/BipInsAidNew';
@Component({
	components: {bipPickerDate }
})
export default class bipDate extends Vue {
	@Inject('env') env!:CCliEnv;
	@Prop({ default: '', type: String }) title!: string;
	@Prop({ type: Object }) cell!: Cell;
	@Prop({type:String}) obj_id!:string;
	@Prop({type:String}) bType!:string;
	cds:CDataSet = new CDataSet(null)
	selectIndex:Array<number>=[0,0,0,0,0,0]
	mode:string = ''
	pickerType:any ='date'
	created(){
		this.cds = this.env.getDataSet(this.obj_id);
		this.mode = this.record.data[this.cell.id]
		if(this.cell.type==91){
			this.pickerType = 'date';
		}
		if(this.cell.type==92){
			this.pickerType ='time'
		}
		if(this.cell.type==93){
			this.pickerType ='datetime'
		}
		if(this.bType =='CYMEditor'){
			this.pickerType ='ym'
		}
	}
	
	change(e:any){
		// console.log(e)
	}
	
	open(){
		if(!this.disabled){
			let rr:any = this.$refs.calendar
			rr.show();
		}
	}
	
	onConfirm(e:any){
		console.log(e)
		this.mode = e.result
		this.selectIndex = e.defaultVal
		this.$nextTick(()=>{
			if(this.mode != this.record.data[this.cell.id])
				this.cds.cellChange(this.mode,this.cell.id);
		})
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
		// console.log('recordchang')
		let rr = this.record.data[this.cell.id];
		if(rr !== this.mode){
			this.mode = rr||''
		}
	}
}
</script>
