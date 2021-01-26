<template>
	<view class="flex text-cut" @tap.stop="rowClick">
		<template v-if="cell.refValue ||cell.editName">
			<bip-show-ref2 :cell="cell" :record="record" :rowId="rowId" :obj_id="obj_id"></bip-show-ref2>
		</template>
		<template v-else>
			<table-comm :cell="cell" :record="record" :rowId="rowId" :obj_id="obj_id"></table-comm>
		</template>
		
	</view>
</template>

<script lang="ts">
	import {Vue, Component,Prop,Watch,Inject} from 'vue-property-decorator';
	import Cell from '@/classes/pub/coob/Cell';
	import tableComm from './table/table-comm.vue';
	import bipShowRef2 from './bip-show-ref2.vue';
	@Component({components:{tableComm,bipShowRef2}})
	export default class bipShowTable extends Vue{
		@Prop({type:Object}) cell!:Cell;
		@Prop() record!:any;
		@Prop({type:Number,default:0}) rowId!:number;
		@Prop() obj_id!:any;
		mode:string = ''
		created(){
			this.$nextTick(()=>{
				this.cellRowChange();
			})
			
		}
		
		@Watch('record')
		cellRowChange(){
			this.mode = this.record.data[this.cell.id]||'-'
		}
		
		rowClick(){
			// console.log('row click');
			//rowClick(cellId:any,rowId:number,data:any){
			this.$emit('cellClick',this.cell.id,this.rowId,this.record);
		}
	}
</script>

