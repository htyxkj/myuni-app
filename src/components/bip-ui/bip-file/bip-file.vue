<template>
	<view class="cu-form-group solid-bottom">
		<template v-if="label">
			<view class="title">{{ cell.labelString }}</view>
		</template>
		<input type="text" v-model="mode" disabled="true"/>
		<text class="text-progress text-bold cuIcon-upload" @tap.stop="open()"></text>
		<bip-file-info :show="showFda" @hide="hide"></bip-file-info>
	</view>
		
</template>
<script lang="ts">
import { Vue, Provide, Prop, Component,Inject,Watch } from 'vue-property-decorator';
import Cell from '@/classes/pub/coob/Cell';
import CRecord from '@/classes/pub/CRecord';
// import BipInsAidNew from '@/classes/BipInsAidNew';
import CCliEnv from '@/classes/cenv/CCliEnv'
import CDataSet from '@/classes/pub/CDataSet';
import bipFileInfo from './bip-file-info.vue';
@Component({
	components: {bipFileInfo}
})
export default class bipFile extends Vue{
	@Inject('env') env!:CCliEnv;
	@Prop({ type: Object }) cell!: Cell;
	@Prop({type:String}) obj_id!:string;
	@Prop({type:[Boolean,String],default:false}) label!:boolean|string;
	@Prop({type:Number,default:-1}) rowId!:number;
	// @Prop({ type: Object }) bipInsAid!:BipInsAidNew;
	mode:string = '';
	imgList = [];
	showFda:boolean = false;
	cds:CDataSet = new CDataSet(null)
	created(){
		this.cds = this.env.getDataSet(this.obj_id);
		this.mode = this.record.data[this.cell.id];
		let mkey = this.obj_id+"_"+this.cell.id
		uni.$on(mkey,this.cellDataChange);
	}
	open(){
		console.log('open uploadFile')
		if(!this.unEditAble){
			this.showFda = true;
		}
		
	}
	
	get unEditAble(){
		let attr = this.cell.attr&0x40;
		return attr>0;
	}
	
	hide(){
		this.showFda = false;
	}
	
	cellDataChange(){
		console.log('监听值变化');
		this.recordChange();
	}
		
	@Watch('record')
	recordChange(){
		let rr = this.record.data[this.cell.id];
		if(rr !== this.mode){
			this.mode = rr||''
		}
	}
	
	get record():CRecord{
		return this.cds.getRecord(this.rowId)
	}
}
</script>
