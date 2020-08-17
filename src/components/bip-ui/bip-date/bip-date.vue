<template>
	<view class="cu-form-group solid-bottom">
		<template v-if="cell">
			<view class="title" :class="[cell.isReq?'text-red':'']">{{ cell.labelString || title }}</view>
		</template>
		<input class="text-right" :placeholder="cell.labelString || title " type="text" v-model="mode" disabled="true"/>
		<text class="cuIcon-calendar" @tap.stop="open()"></text>
		<bip-picker-date :mode="cell.type==91?'date':'datetime'"  @confirm="onConfirm" ref="calendar" ></bip-picker-date>
	</view>
</template>
<script lang="ts">
import { Vue, Prop, Component, Watch,Inject } from 'vue-property-decorator';
import Cell from '@/classes/pub/coob/Cell';
import bipPickerDate from '../bip-picker/bip-picker-date.vue'
import CRecord from '@/classes/pub/CRecord';
import CCliEnv from '@/classes/cenv/CCliEnv'
import CDataSet from '@/classes/pub/CDataSet';
@Component({
	components: {bipPickerDate }
})
export default class bipDate extends Vue {
	@Inject('env') env!:CCliEnv;
	@Prop({ default: '', type: String }) title!: string;
	@Prop({ type: Object }) cell!: Cell;
	@Prop({type:String}) obj_id!:string;
	cds:CDataSet = new CDataSet(null)
	selectIndex:Array<number>=[0,0,0,0,0,0]
	mode:string = ''
	created(){
		this.cds = this.env.getDataSet(this.obj_id);
		this.mode = this.record.data[this.cell.id]
	}
	
	change(e:any){
		// console.log(e)
	}
	
	open(){
		if(!this.unEditAble){
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
	get unEditAble(){
		let attr = this.cell.attr&0x40;
		return attr>0;
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
