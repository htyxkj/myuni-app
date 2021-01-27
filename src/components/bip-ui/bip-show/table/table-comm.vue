<template>
	<view class="text-cut">
		<text class="bip-font-12">{{mode}}</text>
	</view>
</template>

<script lang="ts">
	import {Vue, Component,Prop,Watch,Inject} from 'vue-property-decorator';
	import Cell from '@/classes/pub/coob/Cell';
	@Component({})
	export default class bipShowTable extends Vue{
		@Prop({type:Object}) cell!:Cell;
		@Prop() record!:any;
		@Prop() obj_id!:any;
		@Prop({type:Number,default:0}) rowId!:number;
		mode:string = ''
		created(){
			this.$nextTick(()=>{
				this.cellRowChange();
			})
			
		}
		
		@Watch('record')
		cellRowChange(){
			this.mode = this.record.data[this.cell.id]||''
		}
	}
</script>

