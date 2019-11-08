<template>
	<view class="cu-form-group solid-bottom">
		<template v-if="cell">
			<view class="title">{{ cell.labelString || title }}</view>
		</template>
		<input :placeholder="cell.labelString || title " :type="'text'" v-model="mode" disabled="true"></input>
		<text class="cuIcon-calendar" @tap.stop="open()"></text>
		<bip-picker
			mode="dateTime" 
			:defaultVal="selectIndex"
			:current="true"
			@confirm="onConfirm" 
			ref="calendar" 
		></bip-picker>
	</view>
</template>
<script lang="ts">
import { Vue, Prop, Component, Watch,Inject } from 'vue-property-decorator';
import Cell from '@/classes/pub/coob/Cell';
import bipPicker from './bip-picker.vue'
import CRecord from '@/classes/pub/CRecord';
import CCliEnv from '@/classes/cenv/CCliEnv'
import CDataSet from '@/classes/pub/CDataSet';
@Component({
	components: { bipPicker }
})
export default class bipDate extends Vue {
	@Inject('env') env!:CCliEnv;
	@Prop({ default: '', type: String }) title!: string;
	@Prop({ type: Object }) cell!: Cell;
	@Prop({type:String}) obj_id!:string;
	cds:CDataSet = new CDataSet(null)
	selectIndex:Array<number>=[0,0,0,0,0,0]
	mode:string = ''
	mounted(){
		this.cds = this.env.getDataSet(this.obj_id);
		this.mode = this.record.data[this.cell.id]
	}
	
	change(e:any){
		console.log(e)
	}
	
	open(){
		let rr:any = this.$refs.calendar
		rr.show();
	}
	
	onConfirm(e:any){
		console.log(e)
		this.mode = e.result
		this.selectIndex = e.defaultVal
	}
	
	get record():CRecord{
		return this.cds.getRecord(this.cds.index)
	}
	
	@Watch('record')
	recordChange(){
		console.log('recordchang')
		let rr = this.record.data[this.cell.id];
		if(rr !== this.mode){
			this.mode = rr||''
		}
	}
}
</script>
