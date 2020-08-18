<template>
	<view class="flex justify-between text-cut">
		<view class="flex-sub">
			<text>{{ cell.labelString }}：</text>
		</view>
		<view class="flex-sub text-cut text-bold">
			<text>{{modes}}</text>
		</view>
	</view>
</template>

<script lang="ts">
	import {Vue, Component,Prop,Watch,Inject} from 'vue-property-decorator';
	import Cell from '@/classes/pub/coob/Cell';
	import BipInsAidNew from '@/classes/BipInsAidNew';
	@Component({})
	export default class bipShowRefCl extends Vue{
		@Prop({type:Object}) cell!:Cell;
		@Prop({type:String}) obj_id!:string;
		@Inject('bipInsAid') bipInsAid!:BipInsAidNew;
		@Prop({type:Number,default:0}) rowId!:number;
		@Prop() record!:any;
		mode:string = ''
		showValue:string = ''
		created(){
			if(this.cell.type<12){
				this.mode = this.record.data[this.cell.id]||0
			}else{
				this.mode = this.record.data[this.cell.id]||''
			}
			
			this.showValue = this.mode;
			let mkey = this.obj_id+"_"+this.cell.id
			uni.$on(mkey,()=>{this.cellDataChange()});
			this.makeCLshow();
			
			let mid = this.obj_id+"_row_"+this.rowId;
			// uni.$off(mid);
			uni.$on(mid,()=>{this.cellRowChange()});
			// console.log(this.mode,this.showValue);
		}
		cellRowChange(){
			if(this.cell.type<12){
				this.mode = this.record.data[this.cell.id]||0
			}else{
				this.mode = this.record.data[this.cell.id]||''
			}
			this.makeCLshow();
		}
		get modes(){
			return this.showValue || this.mode;
		}
		
		// @Watch('record')
		// recordChange(){
		// 	this.mode = this.record.data[this.cell.id]||''
		// 	this.showValue = this.mode;
		// 	this.makeCLshow();
		// }
		cellDataChange(){
			console.log('监听值变化');
			this.makeCLshow();
		}
		
		makeCLshow(){
			if(this.mode !== '' &&this.bipInsAid.values){
				let idx = this.bipInsAid.values.findIndex((item:any)=>{
					return item[this.bipInsAid.cells.cels[0].id]+'' === this.mode+'';
				})
				if(idx>-1){
					let item = this.bipInsAid.values[idx];
					this.showValue = item[this.bipInsAid.cells.cels[1].id];
				}
			}
		}	
	}
</script>

