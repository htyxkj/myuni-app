<template>
	<uni-table stripe emptyText="暂无更多数据">
		<uni-tr>
			<uni-th align="center" v-for="(itm,index) in showCells" :key="index">{{itm.labelString}}</uni-th>
		</uni-tr>
		<template v-if="tableData">
			<uni-tr v-for="(row,_rowId) in tableData" :key="_rowId">
				<uni-td align="center" v-for="(itm,index1) in showCells" :key="index1">
					<bip-show-table :cell="itm" :record="row" :rowId="_rowId" :obj_id="ccells.obj_id"  @cellClick="rowClick"></bip-show-table>
				</uni-td>
			</uni-tr>
		</template>
		
	</uni-table>
</template>

<script lang="ts">
	import {Vue, Component,Prop,Watch,Inject} from 'vue-property-decorator';
	import Cell from '@/classes/pub/coob/Cell';
	import CDataSet from '@/classes/pub/CDataSet';
	import CRecord from '@/classes/pub/CRecord';
	import CCliEnv from '@/classes/cenv/CCliEnv'
	import uniTable from "@/components/uni-ui/uni-table/uni-table.vue";
	import uniTh from "@/components/uni-ui/uni-th/uni-th.vue";
	import uniTr from "@/components/uni-ui/uni-tr/uni-tr.vue";
	import uniTd from "@/components/uni-ui/uni-td/uni-td.vue";
	import bipShowTable from '../bip-show/bip-show-table.vue';
	@Component({components:{uniTable,uniTh,uniTr,uniTd,bipShowTable}})
	export default class bipTable extends Vue{
		@Prop({type:[Object,Boolean]}) ccells!:any;
		@Prop({type:[Array,Boolean]}) tableData!:any;
		get showCells(){
			if(this.ccells){
				let vr = this.ccells.cels.filter((item:any)=>{
					return item.isShow == true;
				});
				return vr;
			}
			return [];
		}
		
		rowClick(cellId:any,rowId:number,data:any){
			// console.log(cellId,'cellId');
			// console.log(rowId,'rowId');
			// console.log(data,'data');
			this.$emit('rowClick',cellId,rowId,data);
		}
	}
</script>

