<template>
	<view class="bip-list-unit" @tap="openlist">
		<view class="bip-list-unit-head">
			<text>{{pkList[0].labelString}}：{{record.data[pkList[0].id]}}</text>
			<text class="fr bg-red">正在报价</text>
		</view>
		<view class="bip-list-unit-body">			
			<text v-for="(item, index) in sList" :key="index">
					<text>{{ item.labelString }}：</text>
					<text>{{record.data[item.id] ||''}}</text>
			</text>
		</view>
	</view>
</template>
<script lang="ts">
import { Vue, Prop, Component, Inject,Watch } from 'vue-property-decorator';

@Component({
	components: {}
})
export default class bipListUnit extends Vue {
	@Prop({type:Array,default:[]}) cels!:Array<any>;
	@Prop({type:Number,default:0}) rowId!:number;
	@Prop() record!:any;
	mounted(){
		
	}
	
	openlist(){
		this.$emit('openitem',this.rowId);
	}
	
	get sList(){
		return this.cels.filter((item:any)=>{
			return item.isShow == true&&((item.attr&1)==0);
		})
	}
	get pkList(){
		return this.cels.filter((item:any)=>{
			return item.isShow&&(item.attr&1)>0;
		})
	}
	editRow(){
		this.$emit('editRow',this.rowId)
	}
}
</script>
<style lang="scss">
.bip-list-unit {
	margin-top: 10upx;
	background-color: #ffffff;
	font-size: 28upx;
	transform: all 1s;

	.bip-list-unit-head {
		padding: 20upx;
		height: 80upx;
		box-sizing: border-box;
		border-bottom: 2upx solid #f5f5f5;
	}
	.bip-list-unit-body {
		padding: 20upx;
		display: flex;
		flex-wrap: wrap;

		text {
			width: 50%;
			font-size: 28upx;
			line-height: 55upx;
		}
	}
}
</style>
