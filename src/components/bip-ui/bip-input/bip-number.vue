<template>
	<view class="cu-form-group solid-bottom text-green">
		<template v-if="cell">
			<view class="title" :class="[cell.isReq?'text-red':'']">{{cell.labelString}}</view>
		</template>
		<input class="text-right" :placeholder="cell.labelString" :type="type" v-model="mode" @blur="dataChange" />
	</view>
</template>

<script lang="ts">
	import {Vue, Component,Prop,Watch,Inject} from 'vue-property-decorator';
	import Cell from '@/classes/pub/coob/Cell';
	import CDataSet from '@/classes/pub/CDataSet';
	import CRecord from '@/classes/pub/CRecord';
	import CCliEnv from '@/classes/cenv/CCliEnv'
	@Component({})
	export default class bipInput extends Vue{
		@Inject('env') env!:CCliEnv;
		@Prop({default:'digit',type:String}) type!:string
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
			this.$nextTick(()=>{
				this.cds = this.env.getDataSet(this.obj_id);
				this.mode = this.record.data[this.cell.id];
				this.mode = this.formatNumber(this.mode)
				let mkey = this.obj_id+"_"+this.cell.id
				uni.$on(mkey,this.cellDataChange)
			})
			
			// console.log(this.record)
		}
		
		dataChange(e:any){
			this.$nextTick(()=>{
				if(this.mode != this.record.data[this.cell.id]){
					this.mode = this.formatNumber(this.mode);
					this.cds.cellChange(this.mode,this.cell.id);
				}
			})
			
				
		}
		
		formatNumber(mm:string){
			let num = mm
			if(this.cell.ccPoint){
				let nr = parseFloat(mm);
				if(isNaN(nr)){
					return '';
				}
				num = nr.toFixed(this.cell.ccPoint)
			}
			return num
		}
		
		get record():CRecord{
			return this.cds.getRecord(this.cds.index)
		}
		
		cellDataChange(){
			console.log('监听值变化');
			this.recordChange();
		}
		
		
		
		@Watch('record')
		recordChange(){
			// console.log('recordchang')
			this.$nextTick(()=>{
				let rr = this.record.data[this.cell.id];
				rr = this.formatNumber(rr)
				if(rr !== this.mode){
					this.mode = rr||''
				}
			})
			
		}
		
		
		
	}
</script>

<style scoped>
	@charset "utf-8";
	.cu-form-group{
		text-align: right;
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
