<template>
<view>
	<view class="cu-form-group solid-bottom">
		<template v-if="cell">
			<view class="title" :class="[cell.isReq?'text-red':'']">{{cell.labelString}}</view>
			<template v-if="type=='text'">
				<input name="input" :placeholder="cell.labelString" type="text" v-model="mode" @blur="dataChange" :disabled="disabled"/>
				<template v-if="clearable">
					<text :class="[mode?'cuIcon-close':'','text-red']" @tap.stop="clear()"></text>
				</template>
			</template>
			<template v-else>
				
				<input :placeholder="cell.labelString" type="password" :password="at0" v-model="mode" :disabled="disabled"/>
				<text :class="[mode?(!at0?'cuIcon-attentionforbid':'cuIcon-attention'):'','text-grey']" @tap.stop="open()" :disabled="disabled"></text>
			</template>
		</template>
		<template v-else>
		</template>
		
	</view>
</view>
	
</template>

<script lang="ts">
	import {Vue, Component,Prop,Watch,Inject} from 'vue-property-decorator';
	import Cell from '@/classes/pub/coob/Cell';
	import CDataSet from '@/classes/pub/CDataSet';
	import CRecord from '@/classes/pub/CRecord';
	import CCliEnv from '@/classes/cenv/CCliEnv';
	import { dataTool } from '@/classes/tools/DataTools';
	const DataUtil = dataTool.utils;
	@Component({})
	export default class bipInput extends Vue{
		@Inject('env') env!:CCliEnv;
		@Prop({default:'text',type:String}) type!:string
		@Prop({default:false,type:Boolean}) clearable!:boolean
		@Prop({type:Object}) cell!:Cell;
		@Prop({type:String}) obj_id!:string;
		cds:CDataSet = new CDataSet(null)
		at0:boolean = true
		mode:string = ''
		open(){
			this.at0 = !this.at0
		}
		clear(){
			this.mode = ''
		}
		
		mounted(){
			let mkey = this.obj_id+"_"+this.cell.id
			uni.$on(mkey,this.cellDataChange)
			this.$nextTick(()=>{
				this.cds = this.env.getDataSet(this.obj_id);
				this.mode = this.record.data[this.cell.id];
			})
		}
		
		beforDestory(){
			let mkey = this.obj_id+"_"+this.cell.id
			uni.$off(mkey,this.cellDataChange)
		}
		
		dataChange(e:any){
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
		
		cellDataChange(){
			console.log('监听值变化');
			this.$nextTick(()=>{
				this.recordChange();
			})
			
		}
		
		
		
		@Watch('record')
		recordChange(){
			this.$nextTick(()=>{
				let rr = this.record.data[this.cell.id];
				if(rr !== this.mode){
					this.mode = rr||''
				}
			});
		}
	
	}
</script>

<style scoped>
	@charset "utf-8";
	.cu-form-group{
		text-align: left;
		/* min-height: 90upx; */
	}
	.cu-form-group .title {
		min-width: calc(4em + 15px);
		/* font-size: 24upx !important; */
		/* font-weight: 400; */
	}
	/* .cu-form-group input{ */
		/* font-size: 24upx !important; */
	/* } */
</style>
