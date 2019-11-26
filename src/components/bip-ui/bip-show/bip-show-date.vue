<template>
	<view class="flex text-cut justify-between" :style="'width:100%'">
		<view class="basis-xs">
			<text>{{ cell.labelString }}：</text>
			<text>{{mode}}</text>
		</view>
		<text class="cuIcon-calendar text-progress text-bold"></text>
	</view>
</template>

<script lang="ts">
	import {Vue, Component,Prop,Watch,Inject} from 'vue-property-decorator';
	import Cell from '@/classes/pub/coob/Cell';
	import CDataSet from '@/classes/pub/CDataSet';
	import CRecord from '@/classes/pub/CRecord';
	import CCliEnv from '@/classes/cenv/CCliEnv'
	@Component({})
	export default class bipShowDate extends Vue{
		@Prop({type:Object}) cell!:Cell;
		@Prop() record!:any;
		mode:string = ''
		created(){
			this.mode = this.record.data[this.cell.id]||''
		}
	}
</script>

