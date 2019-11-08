<template>
	<view>
		<cu-custom :bgColor="'bg-' + cr" :isBack="true">
			<block slot="backText">返回</block>
			<block slot="content"><view class="header-title">{{ title }}</view></block>
		</cu-custom>		
		<view class="margin-lr-sm margin-tb-sm">
			<bip-lay v-if="lay.binit" :layout="lay" :key="index"></bip-lay>
		</view>
		<mLoad v-if="loading" :png="'/static/gs.png'" :msg="'加载中...'"></mLoad>
		<template v-if="mbs.initOK">
			<bip-menu-bar @tabSelect="execCmd"></bip-menu-bar>
		</template>
		
	</view>
</template>

<script lang="ts">
import { Vue, Provide, Prop, Component } from 'vue-property-decorator';
// import { UriPModule } from '@/store/module/uripm'; //导入vuex模块，自动注入
import mLoad from '@/components/mLoad.vue';
// import bipInput from '@/components/bip-ui/bip-input/bip-input.vue'
import bipLay from '@/components/bip-ui/bip-lay/bip-lay.vue'
import uniCard from '@/components/uni-ui/uni-card/uni-card.vue'
import bipMenuBar from '@/components/bip-ui/bip-menu-bar/bip-menu-bar.vue'
// import bipTabs from '@/components/bip-ui/bip-tabs/bipTabs.vue';
// import MescrollUni from '@/components/mescroll-uni/mescroll-uni.vue';
// import PdList from '@/components/others/pd-list.vue';
// import mockData from '@/static/js/pdlist.js'; // 模拟数据

import { BIPUtil } from '@/classes/api/request';
let tools = BIPUtil.ServApi;

import URIParams from '@/classes/URIParams';
import Cells from '@/classes/pub/coob/Cells';
import CDataSet from '@/classes/pub/CDataSet';
import CRecord from '@/classes/pub/CRecord';
import CCliEnv from '@/classes/cenv/CCliEnv';
import BipMenuBar from '@/classes/pub/BipMenuBar';
import { BipLayout } from '@/classes/ui/BipLayout';
import { Tools } from '../../classes/tools/Tools';
import { icl } from '../../classes/tools/CommICL';

import {dataTool} from '@/classes/tools/DataTools';
const DataUtil = dataTool.utils
@Component({
	components: { mLoad,bipLay,bipMenuBar }
})
export default class appInfo extends Vue {
	vueId: string = Tools.guid();
	cr: string = 'blue';
	title: string = '单据页面';
	
	loading: boolean = false;
	uriParam: URIParams = new URIParams();
	@Provide('env') env: CCliEnv = new CCliEnv();
	@Provide('mbs') mbs: BipMenuBar = new BipMenuBar();
	//主对象数据集
	dsm: CDataSet = new CDataSet(null);
	//条件对象数据集
	dsm_cont: CDataSet = new CDataSet(null);
	//其他对象数据集
	ds_ext: Array<CDataSet> = Array<CDataSet>();
	//界面组成对象信息
	cells: Array<Cells> = new Array<Cells>();
	lay: BipLayout = new BipLayout('');


	execCmd(cmd:any){
		console.log(cmd)
		if(cmd == icl.B_CMD_ADD){
			console.log('添加')
			let cr = DataUtil.createRecord(this.dsm,this.env);
			this.dsm.addRecord(cr)
			console.log(cr);
		}
	}

	async onLoad(option: any) {
		if (option.item) {
			this.cr = option.color ? option.color : 'blue';
			this.title = option.title ? option.title : 'billPage';
			this.uriParam = JSON.parse(decodeURIComponent(option.item));
			if(this.uriParam){
				this.loading = true;
				await tools
					.getCCellsParams(this.uriParam.pcell)
					.then((res: any) => {
						// console.log(res);
						this.loading = false;
						let rtn = res.data;
						if (rtn.id == 0) {
							this.initUIData(rtn.data.layCels);
						}else{
							uni.showToast({title:'没有获取到对象定义'+this.uriParam})
						}
					})
					.catch((err: any) => {
						this.loading = false;
						console.log(err);
					});
			}
			
		}
		
	}
	
	

	async initUIData(layCels: any) {
		this.cells = layCels;
		this.dsm = new CDataSet(this.cells[0]);
		this.dsm_cont = new CDataSet(this.cells[0]);
		for (let i = 1; i < this.cells.length; i++) {
			this.ds_ext[i - 1] = new CDataSet(this.cells[i]);
		}
		let buid = this.uriParam.pflow
		await tools.getBULinks(buid).then((res:any)=>{
			let rtn1 = res.data;
			if(rtn1.id==0){
				let ope = rtn1.data.opt;
				this.dsm.opera = ope;
				this.dsm.initContrlIndex();
			}
		});
		
		this.mbs.init(this.uriParam.pattr, this.dsm);
		this.env.initInfo(this.uriParam, this.cells, this.mbs, this.dsm, this.ds_ext);
		this.lay = new BipLayout(this.uriParam.playout, this.cells);
	}
}
</script>

<style lang="scss">
page{
	margin-bottom: 120upx;
}
</style>
