<template>
	<view>
		<uni-table stripe emptyText="暂无更多数据">
			<uni-tr>
				<uni-th align="center" v-for="(itm,index) in showCells" :key="index" :width="itm.width">
					<view class="z-table-col-text text-center" @click="sort(itm.id, index)" :style="{width:itm.width + 'px'}">
						<view>{{itm.labelString}}</view>
						<view v-if='(itm.attr&ODATTR)>0' class="sort">
							<view class="up-arrow" :class="{ action: nowSortKey == itm.id && sortType == 'asc'}"></view>
							<view class="down-arrow" :class="{ action: nowSortKey == itm.id && sortType == 'desc'}"></view>
						</view>
					</view>

				</uni-th>
			</uni-tr>
			<template v-if="tableData">
				<uni-tr v-for="(row,_rowId) in tableData" :key="_rowId" :style="{'background-color':getBackColor(_rowId)}">
					<uni-td align="center" v-for="(itm,index1) in showCells" :key="index1" :width="itm.width">
						<bip-show-table :cell="itm" :record="row" :rowId="_rowId" :obj_id="ccells.obj_id"  @cellClick="rowClick"></bip-show-table>
					</uni-td>
				</uni-tr>
			</template>
			
		</uni-table>
	</view>
</template>

<script lang="ts">
	import {Vue, Component,Prop,Watch,Inject} from 'vue-property-decorator';
	import uniTable from "@/components/uni-ui/uni-table/uni-table.vue";
	import uniTh from "@/components/uni-ui/uni-th/uni-th.vue";
	import uniTr from "@/components/uni-ui/uni-tr/uni-tr.vue";
	import uniTd from "@/components/uni-ui/uni-td/uni-td.vue";
	import bipShowTable from '../bip-show/bip-show-table.vue';	
	@Component({components:{uniTable,uniTh,uniTr,uniTd,bipShowTable}})
	export default class bipTable extends Vue{
		@Prop({type:[Object,Boolean]}) ccells!:any;
		@Prop({type:[Array,Boolean]}) tableData!:any;
		@Prop() checkValueId!:any;
		sortType:String = '';
		nowSortKey:String = '';
		ODATTR:number = 4194304;
		checkRowId:any = null;
		get showCells(){
			if(this.ccells){
				let vr = this.ccells.cels.filter((item:any)=>{
					item['width'] = ((item.ccCharleng<4?4:item.ccCharleng)<100?(item.ccCharleng<4?4:item.ccCharleng):100)*9;
					return item.isShow == true && ( item.attr & (0x200) )>0;
				});
				if(vr.length ==0){
					vr = this.ccells.cels.filter((item:any)=>{
						item['width'] = ((item.ccCharleng<4?4:item.ccCharleng)<100?(item.ccCharleng<4?4:item.ccCharleng):100)*9;
						return item.isShow == true
					});
				}
				return vr;
			}
			return [];
		}
		
		rowClick(cellId:any,rowId:number,data:any){
			// console.log(cellId,'cellId');
			// console.log(rowId,'rowId');
			// console.log(data,'data');
			this.checkRowId = rowId;
			this.$emit('rowClick',cellId,rowId,data);
		}
		
		sort(key:any, index:number) {
			
			if (!key || (this.showCells[index].attr&this.ODATTR)<=0) {
				return
			}
			// console.log('sort')
			// 排序功能: 如果点击的排序按钮是原先的 那么更改排序类型
			//			如果点击的另一个排序按钮 那么选择当前排序并且排序类型改为降序(desc)
			if (key != this.nowSortKey) {
				this.nowSortKey = key
				this.sortType = 'desc'
			} else {
				this.toggleSort()
			}
			this.$emit('onSort', {
				key: this.nowSortKey,
				type: this.sortType
			})
		}
		
		toggleSort() {
			this.sortType = this.sortType == 'asc' ? 'desc' : 'asc'
		}
		/**
		 * 获取行背景色 `5
		 */
		getBackColor(rowId:any){
			let row = this.tableData [rowId]
			if(rowId == this.checkRowId || rowId == this.checkValueId){
				return " #c3dbff"
			}
			let sctrls = this.ccells.sctrl;
			if(sctrls){
				let cc = sctrls.split(";");
           		for(var i=0;i<cc.length;i++){
                	let oneSc = cc[i];
					if(oneSc.startsWith("`5")){
						let zd = oneSc.substring(2,oneSc.indexOf("/"))
						let vl =  sctrls.split("/")[1].split(",");
						let rowVl = row.data[zd];
						for(var j=0;j<vl.length;j++){
							let oneV = vl[j].split(":");
							if(rowVl == oneV[0]){
								return oneV[1];
							}
						}
					}
				}
			}
		}
	}
</script>

<style lang="scss">
	// 三角形
	%triangle-basic {
		content: '';
		height: 0;
		width: 0;
		overflow: hidden;
	}
	
	@mixin triangle($direction, $size, $borderColor) {
		@extend %triangle-basic;
	
		@if $direction==top {
			border-bottom: $size solid $borderColor;
			border-left: $size dashed transparent;
			border-right: $size dashed transparent;
			border-top: 0;
		}
	
		@else if $direction==right {
			border-left: $size solid $borderColor;
			border-top: $size dashed transparent;
			border-bottom: $size dashed transparent;
			border-right: 0;
		}
	
		@else if $direction==bottom {
			border-top: $size solid $borderColor;
			border-left: $size dashed transparent;
			border-right: $size dashed transparent;
			border-bottom: 0;
		}
	
		@else if $direction==left {
			border-right: $size solid $borderColor;
			border-top: $size dashed transparent;
			border-bottom: $size dashed transparent;
			border-left: 0;
		}
	}
	
	.sort {
		display: flex;
		padding: 5rpx;
		flex-direction: column;
		justify-content: center;
	
		.up-arrow {
			@include triangle(top, 10rpx, #ccc);
			display: block;
			margin-bottom: 5rpx;
	
			&.action {
				@include triangle(top, 10rpx, #4298f7);
			}
		}
	
		.down-arrow {
			@include triangle(bottom, 10rpx, #ccc);
			display: block;
	
			&.action {
				@include triangle(bottom, 10rpx, #4298f7);
			}
		}
	}
	
	.z-table-col-text {
		display: flex;
		width: 100%;
		flex: 1;
		justify-content: flex-start;
		align-content: center;
		
		&.text-center {
			justify-content: center;
		}
		
		&.text-right {
			justify-content: flex-end;
		}
	}
</style>

