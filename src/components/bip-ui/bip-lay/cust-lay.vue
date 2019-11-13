<template>
	<view>
		{{id}}
	</view>
</template>

<script lang="ts">
	import { Vue, Provide, Prop, Component } from 'vue-property-decorator';
	import { Tools } from '@/classes/tools/Tools';
	import CCliEnv from '@/classes/cenv/CCliEnv';
	import BipLayConf from '@/classes/ui/BipLayConf';
	import BipLayout from '@/classes/ui/BipLayout';
	@Component({
		components: {}
	})
	export default class custLay extends Vue{
		@Prop({type:Object}) env!:CCliEnv
		@Prop({type:Object}) layout!:BipLayout
		comps:Array<BipLayConf> = []
		id:string = Tools.guid()
		mounted(){
			this.comps = this.layout.compconfs
			console.log(this.comps)
		}
	}
</script>

<style>
</style>
