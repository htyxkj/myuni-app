<template>
	<view class="cu-form-group solid-bottom">
		<!-- <image src="https://cdn.nlark.com/yuque/0/2019/png/280374/1552996358228-assets/web-upload/e256b4ce-d9a4-488b-8da2-032747213982.png"
			 mode="widthFix" class="response"></image> -->
		<template v-if="label">
			<view class="title">{{ cell.labelString }}</view>
		</template>
		<input type="text" v-model="mode" disabled="true"/>
		<text class="text-progress text-bold cuIcon-camerarotate"></text>
	</view>
		
</template>
<script lang="ts">
import { Vue, Provide, Prop, Component,Inject,Watch } from 'vue-property-decorator';
import Cell from '@/classes/pub/coob/Cell';
import CRecord from '@/classes/pub/CRecord';
import CCliEnv from '@/classes/cenv/CCliEnv'
import CDataSet from '@/classes/pub/CDataSet';
import bipFileInfo from './bip-file-info.vue';
@Component({
	components: {bipFileInfo}
})
export default class bipImage extends Vue{
	@Inject('env') env!:CCliEnv;
	@Prop({ type: Object }) cell!: Cell;
	@Prop({type:String}) obj_id!:string;
	@Prop({type:Boolean,default:false}) label!:boolean;
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
		this.showFda = true;
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
