<template>
	<view class="my-unit">
		<view class="unit-head">
			<text>求购编号：12346579812</text>
			<text class="fr bg-red">正在报价</text>
		</view>
		<view class="unit-body">			
			<text v-for="(item, index) in laycell.uiCels" :key="index">
				<text class="bg-gradual-orange">{{ item.labelString }}：</text>
				<!-- <text v-if="item.isMoney" :class="item.class">￥</text> -->
				<text :class="item.class">{{record.data[item.id]}}</text>
				<!-- <text v-if="item.isMoney" :class="item.class">元</text> -->
			</text>
		</view>
		<view class="unit-foot solids-bottom">
			<!-- <text class="bg-blue" @tap="editRow">编辑</text> -->
			<button type="primary" class="fl btn" @click="editRow">编辑行</button>
			<button class="fr btn" type="warn" @click="delRow">删除行</button>
		</view>
	</view>
</template>
<script lang="ts">
import { Vue, Prop, Component, Inject,Watch } from 'vue-property-decorator';
import Cell from '@/classes/pub/coob/Cell';
import Cells from '@/classes/pub/coob/Cells';
import BipLayCells from '@/classes/ui/BipLayCells';
import CCliEnv from '@/classes/cenv/CCliEnv';
import CDataSet from '@/classes/pub/CDataSet';
import CRecord from '@/classes/pub/CRecord';
@Component({
	components: {}
})
export default class bipUnit extends Vue {
	unitModel1: Array<Object> = [];
	@Prop({type:Object}) laycell!:BipLayCells;
	@Prop({type:Number,default:0}) rowId!:number;
	@Inject('env') env!:CCliEnv;
	record:CRecord = new CRecord();
	cds: CDataSet = new CDataSet(null);
	mounted(){
		this.cds = this.env.getDataSet(this.laycell.obj_id);
		this.record = this.cds.getRecord(this.rowId);
	}
	
	delRow() {
		this.$emit('delRow',this.rowId)
	}
	
	editRow(){
		this.$emit('editRow',this.rowId)
	}
}
</script>
<style lang="scss">
.my-unit {
	margin-top: 10upx;
	background-color: #ffffff;
	font-size: 28upx;
	transform: all 1s;

	.unit-head {
		padding: 20upx;
		height: 80upx;
		box-sizing: border-box;
		border-bottom: 2upx solid #f5f5f5;
	}
	.unit-body {
		padding: 20upx;
		display: flex;
		flex-wrap: wrap;

		text {
			width: 50%;
			font-size: 28upx;
			line-height: 55upx;
		}
	}
	.unit-foot {
		height: 88upx;
		padding: 0 20upx;
		border-top: 2upx solid #f5f5f5;
		border-bottom: none;
		line-height: 88upx;

		.btn {
			height: 60upx;
			font-size: 28upx;
			line-height: 60upx;
			margin: 14upx 0;
		}
	}
}
</style>
