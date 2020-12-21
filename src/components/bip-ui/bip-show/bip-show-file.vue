<template>
	<view class="flex justify-between text-cut">
		<view class="flex-sub" :class="[cell.isReq?'text-red':'']">
			<text>{{ cell.labelString }}：</text>
		</view>
		<view class="text-cut text-bold">
			<text>{{mode}}</text>
		</view>
		<view>
			<text class="text-progress text-bold cuIcon-upload" @tap.stop="open()"></text>
		</view>
		<bip-file-info :cell="cell" :obj_id="obj_id"  :show="showFda" @hide="hide" :isSPShow="true"></bip-file-info>
	</view>
</template>

<script lang="ts">
	import {Vue, Component,Prop,Watch,Inject} from 'vue-property-decorator';
	import Cell from '@/classes/pub/coob/Cell';
	import CDataSet from '@/classes/pub/CDataSet';
	import CRecord from '@/classes/pub/CRecord';
	import CCliEnv from '@/classes/cenv/CCliEnv'
	import bipFileInfo from '../bip-file/bip-file-info.vue';
	@Component({
		components: {bipFileInfo}
	})
	export default class bipShowFile extends Vue{
		@Prop({type:Object}) cell!:Cell;
		@Prop() record!:any;
		@Prop({type:String}) obj_id!:string;
		@Prop({type:Number,default:0}) rowId!:number;
		showFda:boolean = false;
		mode:string = ''
		created(){
			this.$nextTick(()=>{
				this.cellRowChange();
				// let mid = this.obj_id+"_row_"+this.rowId;
				// // uni.$off(mid);
				// uni.$on(mid,()=>{this.cellRowChange()});
			})
			
		}
		hide(){
			this.showFda = false;
		}
		open(){
			this.showFda = true;
		}
		@Watch('record',{deep:true})
		cellRowChange(){
			this.mode = this.record.data[this.cell.id]||''
		}
	}
</script>

