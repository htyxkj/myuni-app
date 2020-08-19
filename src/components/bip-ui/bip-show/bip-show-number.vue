<template>
	<view class="flex text-cut justify-between" :style="'width:100%'">
		<text class="text-green flex-sub">{{ cell.labelString }}：</text>
		<text class="flex-twice">{{mode}}</text>
	</view>
</template>

<script lang="ts">
	import {Vue, Component,Prop,Watch} from 'vue-property-decorator';
	import Cell from '@/classes/pub/coob/Cell';
	import CDataSet from '@/classes/pub/CDataSet';
	import CRecord from '@/classes/pub/CRecord';
	import CCliEnv from '@/classes/cenv/CCliEnv'
	@Component({})
	export default class bipShowComm extends Vue{
		@Prop({type:Object}) cell!:Cell;
		@Prop() record!:any;
		@Prop({type:String}) obj_id!:string;
		@Prop({type:Number,default:0}) rowId!:number;
		mode:string = ''
		created(){
			this.$nextTick(()=>{
				this.cellRowChange();
			})
		}
		
		@Watch('record',{deep:true})
		cellRowChange(){
			// console.log(this.cell.id)
			this.mode = this.formatNumber(this.record.data[this.cell.id]||'');
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
	}
</script>

