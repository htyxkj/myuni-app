<template>
	<view>
		<cu-custom :bgColor="'bg-blue'" :isBack="true">
			<block slot="content"><view class="header-title">{{ cds.ccells.desc }}</view></block>
		</cu-custom>
		<template v-if="initOK">
			<view class="margin-lr-sm margin-tb-sm">
				<bip-comm v-for="(item) in laycell.uiCels" :obj_id="laycell.obj_id" :cell="item" :key="item.id"></bip-comm>
			</view>
			<bip-menu-bar @tabSelect="execCmd"></bip-menu-bar>
		</template>
		
	</view>
	
</template>

<script lang="ts">
	import { Vue, Provide,Prop, Component, Inject,Watch } from 'vue-property-decorator';
	import { EnvModule } from '@/store/module/envmode'; //导入vuex模块，自动注入
	import CDataSet from '@/classes/pub/CDataSet';
	import BipMenuBar from '@/classes/pub/BipMenuBar';
	import CCliEnv from '@/classes/cenv/CCliEnv';
	import bipComm from '@/components/bip-ui/bip-comm/bip-comm.vue';
	import bipMenuBar from '@/components/bip-ui/bip-menu-bar/bip-menu-bar.vue';
	import { Tools } from '@/classes/tools/Tools';
	@Component({
		components: {bipComm,bipMenuBar}
	})
	export default class editUnit extends Vue {
		@Provide('env') env:CCliEnv = new CCliEnv();
		cds: CDataSet = new CDataSet(null);
		@Provide('mbs') mbs: BipMenuBar = new BipMenuBar();
		initOK:boolean = false;
		onLoad(option: any) {
			setTimeout(() => {
				let objId = option.id;
				let rowId = option.rid;
				this.env.initInfo(this.env1.uriParams, this.env1.cells, this.env1.mbs, this.env1.dsm, this.env1.ds_ext);
				this.cds = this.env.getDataSet(objId);
				this.cds.index = rowId;
				this.initOK = true;
			}, 300);
		}
		
		execCmd(btn: any) {
			let cmd = btn.cmd;
		}
		get env1(){
			return EnvModule.env;
		}
		
		get laycell(){
			return EnvModule.laycell;
		}
	
	}
</script>

<style>

</style>
