<template>
	<view>
		<template v-for="(item,index) in laycfg">
			<template v-if="item.bcells&&item.comp">
				<template v-if="!item.comp.btable">
					<lay-cell :laycell="item.comp" ></lay-cell>
				</template>
				<template v-else>
					<lay-grid :laycell="item.comp" ></lay-grid>
				</template>
			</template>
			<template v-else>
				<view>其他布局</view>
			</template>
		</template>
		<!-- <lay-cell v-for="(item,index) in laycfg" :key="index" :laycell="item.comp" :env="env"></lay-cell> -->
	</view>
</template>

<script lang="ts">
	/**
	 * 基础布局
	 */
	import { Vue, Provide, Prop, Component,Inject } from 'vue-property-decorator';
	import { Tools } from '@/classes/tools/Tools';
	import CCliEnv from '@/classes/cenv/CCliEnv';
	import BipLayConf from '@/classes/ui/BipLayConf';
	import layCell from './lay-cell.vue'
	import layGrid from './lay-grid.vue'
	@Component({
		components: {layCell,layGrid}
	})
	export default class baseLay extends Vue{
		@Inject('env') env!:CCliEnv;
		@Prop({type:Array}) laycfg!:Array<BipLayConf>
		id:string = Tools.guid()
	}
</script>

<style>
</style>
