<template>
	<view>
		<cu-custom :bgColor="'bg-blue'" :isBack="true">
			<block slot="content"><view class="header-title">{{ cds.ccells.desc }}</view></block>
		</cu-custom>
		<view class="margin-lr-sm margin-tb-sm">
			<bip-comm v-for="(item,index) in laycell.uiCels" :obj_id="laycell.obj_id" :cell="item" :key="index"></bip-comm>
		</view>
		<bip-menu-bar @tabSelect="execCmd"></bip-menu-bar>
	</view>
	
</template>

<script lang="ts">
	import { Vue, Provide,Prop, Component, Inject,Watch } from 'vue-property-decorator';
	import { EnvModule } from '@/store/module/envmode'; //导入vuex模块，自动注入
	import CDataSet from '@/classes/pub/CDataSet';
	import BipMenuBar from '@/classes/pub/BipMenuBar';
	import bipComm from '@/components/bip-ui/bip-comm/bip-comm.vue';
	import bipMenuBar from '@/components/bip-ui/bip-menu-bar/bip-menu-bar.vue'
	@Component({
		components: {bipComm,bipMenuBar}
	})
	export default class editUnit extends Vue {
		cds: CDataSet = new CDataSet(null);
		@Provide('mbs') mbs: BipMenuBar = new BipMenuBar();
		onLoad(option: any) {
			console.log(option)
			console.log(this.env)
			this.cds = this.env.getDataSet(this.laycell.obj_id);
		}
		
		execCmd(cmd:string){
			console.log(cmd)
		}
		@Provide('env')
		get env(){
			return EnvModule.env;
		}
		
		get laycell(){
			return EnvModule.laycell;
		}
	}
</script>

<style>

</style>
