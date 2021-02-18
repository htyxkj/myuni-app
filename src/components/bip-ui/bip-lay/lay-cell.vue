<template>
	<view class="margin-top">
		<!-- <template > -->
			<bip-comm v-for="(item,index) in laycell.uiCels" :obj_id="laycell.obj_id" :cell="item" :key="index"></bip-comm>
		<!-- </template> -->
	</view>
</template>

<script lang="ts">
	/**
	 * 页面布局单元
	 */
	import { Vue, Provide, Prop, Component ,Inject} from 'vue-property-decorator';
	import { Tools } from '@/classes/tools/Tools';
	import BipLayCells from '@/classes/ui/BipLayCells';
	import CCliEnv from '@/classes/cenv/CCliEnv'

	import bipComm from '../bip-comm/bip-comm.vue';
	@Component({
		components: {bipComm}
	})
	export default class layCell extends Vue{
		@Inject('env') env!:CCliEnv;
		@Provide('noLable') noLable: boolean = false;
		@Prop({type:Object}) laycell!:BipLayCells
		id:string = Tools.guid()
	}
</script>

<style>
</style>
