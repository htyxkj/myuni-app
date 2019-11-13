<template>
	<view>
		<template v-if="layout&&layout.layType === 'B'">
			<base-lay :laycfg="comps"></base-lay>
		</template>
		<template v-else>
			其他
		</template>
	</view>
</template>

<script lang="ts">
	/**
	 * 布局页面，在单据界面调用
	 */
	import { Vue, Provide, Prop, Component,Inject } from 'vue-property-decorator';
	import { Tools } from '@/classes/tools/Tools';
	import CCliEnv from '@/classes/cenv/CCliEnv';
	import BipLayConf from '@/classes/ui/BipLayConf';
	import BipLayout from '@/classes/ui/BipLayout';
	import baseLay from './base-lay.vue'
	@Component({
		components: {baseLay}
	})
	export default class bipLay extends Vue{
		// @Prop({type:Object}) env!:CCliEnv
		@Prop({type:Object}) layout!:BipLayout;
		@Inject('env') env!:CCliEnv;
		comps:Array<BipLayConf> = []
		id:string = Tools.guid()
		
		onLoad(){
			console.log('onload')
		}
		created(){
			console.log('订阅时间')
			console.log(this.env)
			uni.$on('appinfo',this.subMethod);
		}
		mounted(){
			this.comps = this.layout.compconfs
			console.log(this.comps)
			console.log(1111)
		}
		
		subMethod(env:CCliEnv){
			console.log(env,'99999');
		}
		
		beforeDestroy(){
			uni.$off('appinfo')
		}
		
	}
</script>

<style>
</style>
