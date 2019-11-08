<template>
	<view class="cu-form-group solid-bottom">
		<template v-if="cell">
			<view class="title">{{ cell.labelString }}</view>
		</template>
		<input :placeholder="cell.labelString" :type="'text'" v-model="mode" @tap.stop="open()" disabled="true"/>
		<text :class="['cuIcon-right', 'text-grey']" @tap.stop="open()"></text>
		<mLoad v-if="loading" :png="'/static/gs.png'" :msg="'加载中...'"></mLoad>
	</view>
</template>

<script lang="ts">
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
@Component({})
export default class bipSelect extends Vue {
	@Inject('env') env!:CCliEnv;
	@Prop({ type: Object }) cell!: Cell;
	@Prop({ type: Object }) bipInsAid!:BipInsAidNew;
	@Prop({type:String}) obj_id!:string;
	index: number = 0;
	mode: string = '';
	editName: string = '';
	methordName:string = '';
	aidKey = '';
	loading =false;
	
	cds:CDataSet = new CDataSet(null)
	
	
	async mounted() {
		this.cds = this.env.getDataSet(this.obj_id);
		this.index = this.cds.index;
		this.editName = this.bipInsAid.id;
		this.mode = this.record.data[this.cell.id]
	}
	open() {
		this.methordName = this.editName+"_"+(this.index<0?0:this.index)+"_"+this.cell.id
		uni.$off(this.methordName)
		uni.$on(this.methordName,this.selectBack)
		uni.navigateTo({url:'/pages/selecteditor/selecteditor?editName='+this.editName+"&methordname="+this.methordName});
	}
	selectBack(param:any){
		console.log(param)
		if(param){
			this.mode = param[this.bipInsAid.cells.cels[0].id]
			this.cds.cellChange(this.mode,this.cell.id);
		}
	}
	
	get aidmaps(){
		return InsAidModule.aidInfos;
	}
	
	get inProcess(){
		return InsAidModule.inProcess;
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

<style>
@charset "utf-8";
.cu-form-group {
	text-align: left;
	/* min-height: 90upx; */
}
.cu-form-group .title {
	min-width: calc(4em + 15px);
	/* font-size: 24upx !important; */
	/* font-weight: 400; */
}
.cu-form-group input {
	/* font-size: 24upx !important; */
}
</style>
