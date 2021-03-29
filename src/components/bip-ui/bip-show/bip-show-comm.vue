<template>
	<view class="flex justify-between text-cut">
		<view class="flex-sub" :class="[cell.isReq?'text-red':'']">
			<text>{{ cell.labelString }}：</text>
		</view>
		<view class="flex-treble text-cut text-bold">
			<text >{{mode}}</text>
		</view>
	</view>
</template>

<script lang="ts">
	import {Vue, Component,Prop,Watch,Inject} from 'vue-property-decorator';
	import Cell from '@/classes/pub/coob/Cell';
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
				// let mid = this.obj_id+"_row_"+this.rowId;
				// // uni.$off(mid);
				// uni.$on(mid,()=>{this.cellRowChange()});
			})
			
		}
		
		// beforDestory(){
		// 	let mid = this.obj_id+"_row_"+this.rowId;
		// 	uni.$off(mid,()=>{this.cellRowChange()});
		// }
		
		@Watch('record',{deep:true})
		cellRowChange(){
			this.mode = this.record.data[this.cell.id]||''
		}
		
		
	}
</script>

