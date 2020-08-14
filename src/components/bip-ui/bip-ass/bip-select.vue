<template>
	<view class="cu-form-group solid-bottom">
		<template v-if="cell">
			<view class="title">{{ cell.labelString }}</view>
		</template>
		<input :placeholder="cell.labelString" type="text" v-model="mode" disabled="true" @tap.stop="open()"/>
		<text :class="['cuIcon-searchlist', 'text-progress','text-bold']" @tap.stop="open()"></text>
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
	modekey: string = '';
	editName: string = '';
	methordName:string = '';
	refKey = '';
	refInsAid:BipInsAidNew = new BipInsAidNew("")
	aidKey = ''
	cds:CDataSet = new CDataSet(null)
	
	created() {
		this.cds = this.env.getDataSet(this.obj_id);
		this.index = this.cds.index;
		this.editName = this.bipInsAid.id;
		this.mode = this.record.data[this.cell.id]
		this.modekey = this.mode
		this.refKey = this.cell.refValue||this.editName
		if(this.refKey.startsWith("{")){
			let _l = this.refKey.indexOf("}");
			this.refKey = this.refKey.substring(2,_l);
		}
		if(this.refKey){
			this.aidKey= ICL.AID_KEY+this.refKey;
			if(this.editName == this.refKey){
				this.refInsAid = this.refInsAid.clone(this.bipInsAid);
			}else{
				InsAidModule.fetchInsAid({ id: 200, aid: this.refKey });
			}
		}
		this.getRefVal();
	}
	open() {
		this.methordName = this.editName+"_"+(this.index<0?0:this.index)+"_"+this.cell.id
		uni.$off(this.methordName,this.selectBack)
		uni.$on(this.methordName,this.selectBack);
		uni.showLoading({
			title:'跳转中...'
		})
		uni.navigateTo({url:'/pages/selecteditor/selecteditor?editName='+this.editName+"&methordname="+this.methordName,complete: () => {
			uni.hideLoading();
		}});
	}
	selectBack(param:any){
		// console.log(param)
		if(param){
			// 如果可以编辑 更改值，并更新状态
			this.$nextTick(()=>{
				if(this.refKey == this.editName){
					this.refInsAid.values[0] = param;
					let v0= param[this.bipInsAid.cells.cels[0].id];
					this.refInsAid.realV = v0;
					this.refInsAid.makeShow();
				}
				this.makeSv();
				this.cds.cellChange(this.modekey,this.cell.id);
			})
			
		}
	}
	
	makeSv(){
		if(this.refInsAid.id){
			this.modekey = this.refInsAid.realV;
			this.mode = this.refInsAid.showV;
		}
	}
	
	get aidmaps(){
		return InsAidModule.aidInfos;
	}
	
	get inProcess(){
		return InsAidModule.inProcess;
	}
	
	get aidValues(){
		return InsAidModule.aidValues;
	}
	
	async getRefVal(){
		if(this.modekey){
			let key = ICL.AID_KEY+this.refKey+"_"+this.modekey
			if(!this.inProcess.get(key)){
				let rtn = this.aidValues.get(key);
				if(!rtn){
					let cont = this.refInsAid.cells.cels[0].id+"='"+this.modekey+"'"
					let vvs = {id:this.refKey,key:key,cont:cont}
					await InsAidModule.fetchInsDataByCont(vvs);
				}
			}else{
				let rtn = this.aidValues.get(key);
				if(rtn){
					this.refInsAid.values[0] = rtn;
					this.refInsAid.makeShow();
					this.makeSv();
				}
			}
		}
		
	}

	get record():CRecord{
		return this.cds.getRecord(this.cds.index)
	}
	
	@Watch('record')
	recordChange(){
		// console.log('recordchang')
		this.$nextTick(()=>{
			let rr = this.record.data[this.cell.id];
				if(rr !== this.modekey){
					this.mode = rr||'';
					this.modekey = this.mode;
					this.getRefVal();
				}
		})
		
	}
	
	@Watch('aidValues',{deep:true})
	aidValuesChange(){
		// console.log('aidValues change')
		this.$nextTick(()=>{
			let key = ICL.AID_KEY+this.refKey+"_"+this.modekey;
			let rr = this.aidValues.get(key);
			if(rr){
				let r0 = this.refInsAid.values[0];
				if(rr != r0){
					this.refInsAid.values[0] = rr;
					this.refInsAid.makeShow();
					this.makeSv();
				}
			}
		})
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
/* .cu-form-group input { */
	/* font-size: 24upx !important; */
/* } */
</style>
