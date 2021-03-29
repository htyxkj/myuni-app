<template>
	<view>
		<bip-search-con :cels="showCells" :dsm_cont="dsm_cont" @query="queryCont"></bip-search-con>
		<load-refresh ref="loadRefresh" :isRefresh="true" :backgroundCover="'#F3F5F5'" :heightReduce="280" :pageNo="currPage" :totalPageNo="totalPage"
			@loadMore="loadMore" @refresh="refresh">
			<view slot="content-list">
				<view v-for="(item, index) in pdList" :key="index">
					<bip-list-unit2 :record="item" :cels="dsm.ccells.cels" :rowId="index" @openitem="openList" :obj_id="dsm.ccells.obj_id"></bip-list-unit2>
				</view>
			</view>
		</load-refresh>
	</view>
</template>

<script lang="ts">
import { Vue, Provide, Prop,Watch, Component } from 'vue-property-decorator';
import mLoad from '@/components/mLoad.vue';
import bipLay from '@/components/bip-ui/bip-lay/bip-lay.vue';
import bipSearchCon from '@/components/bip-ui/bip-search/bip-search-con.vue';
import bipListUnit from '@/components/bip-ui/bip-unit/bip-list-unit.vue';
import bipListUnit2 from '@/components/bip-ui/bip-unit/bip-list-unit2.vue';
import uniFab from '@/components/uni-ui/uni-fab/uni-fab.vue';

import bipBillBar from '@/components/bip-ui/bip-menu-bar/bip-bill-bar.vue';
import { BIPUtil } from '@/classes/api/request';
let tools = BIPUtil.ServApi;

import URIParams from '@/classes/URIParams';
import Cells from '@/classes/pub/coob/Cells';
import CDataSet from '@/classes/pub/CDataSet';
import CCliEnv from '@/classes/cenv/CCliEnv';
import BipMenuBar from '@/classes/pub/BipMenuBar';
import BipLayout from '@/classes/ui/BipLayout';
import QueryEntity from '@/classes/search/QueryEntity';
import { Tools } from '@/classes/tools/Tools';
@Component({
	components: { mLoad, bipLay, bipSearchCon, uniFab, bipListUnit, bipListUnit2, bipBillBar }
})
export default class appList extends Vue {
	vueId: string = Tools.guid();
	cr: string = 'blue';
	title: string = '单据页面';
	@Prop({default:null}) pbuid?:any;
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
	pdList: Array<any> = [];
	qe: QueryEntity = new QueryEntity('', '');
	isjump: boolean = false;
	currPage: number = 1;
	totalPage: number = 0;
	pageSize:number = 15;

	get showCells() {
		if (this.dsm.ccells) {
			let vr = this.dsm.ccells.cels.filter((item: any) => {
				return item.isShow == true;
			});
			return vr;
		}
		return [];
	}

	openList(rid: number) {
		if (!this.isjump) {
			this.isjump = true;
			uni.showLoading({
				title: '跳转中...'
			});
			// let item = encodeURIComponent(JSON.stringify(this.uriParam));
			let cr0 = this.pdList[rid];
			let arr:Array<any> = this.dsm.pkCells();
			let qcont = ''
			if(arr.length>0){
				qcont = this.makeQueryCont(cr0,arr);
			}
			uni.navigateTo({
				url: '/pages/appinfo/appdetail?pbuid=' + this.pbuid + '&color=' + this.cr + '&title=' + this.title +'&qcont='+encodeURIComponent(qcont),
				complete: () => {
					uni.hideLoading();
					this.isjump = false;
				}
			});
		}
	}

	makeQueryCont(cr0:any,cels:Array<any>){
		let qs = '';
		if(cels.length>0){
			cels.forEach((item:any)=>{
				let vr = cr0.data[item.id];
				let type = item.type;
				if(type==12){
					if(vr){
						qs+=item.id+"='"+vr+"' and";
					}
				}else{
					if(vr !== undefined &&vr != null &&vr !==''){
						qs+=item.id+"="+vr+" and";
					}
				}
			})
			qs = qs.substring(0,qs.length-3);
		}
		return qs;
	}
	async mounted() { 
		this.init();
	}
	async init(){
		this.uriParam = JSON.parse(uni.getStorageSync(this.pbuid));
		if (this.uriParam) {
			this.loading = true;
			await tools
				.getCCellsParams(this.uriParam.pcell)
				.then((res: any) => {
					// console.log(res);
					this.loading = false;
					let rtn = res.data;
					if (rtn.id == 0) {
						this.initUIData(rtn.data.layCels);
						this.refresh();
					} else {
						uni.showToast({ title: '没有获取到对象定义' + this.uriParam });
					}
				})
				.catch((err: any) => {
					this.loading = false;
					console.log(err);
				});
		} 
	}
	// 初始化界面参数
	// 后台获取的cell信息
	async initUIData(layCels: any) {
		this.cells = layCels;
		this.dsm = new CDataSet(this.cells[0]);
		this.qe.pcell = this.dsm.ccells.obj_id;
		this.qe.tcell = this.dsm.ccells.obj_id;
		this.qe.oprid = 13;
		// console.log(this.qe)
		this.dsm_cont = new CDataSet(this.cells[0]);
		for (let i = 1; i < this.cells.length; i++) {
			this.ds_ext[i - 1] = new CDataSet(this.cells[i]);
		}
		let buid = this.uriParam.pflow;
		await tools.getBULinks(buid).then((res: any) => {
			let rtn1 = res.data;
			if (rtn1.id == 0) {
				let ope = rtn1.data.opt;
				this.dsm.opera = ope;
				this.dsm.initContrlIndex();
			}
		});

		this.mbs.init(this.uriParam.pattr, this.dsm);
		this.env.initInfo(this.uriParam, this.cells, this.mbs, this.dsm, this.ds_ext);
		this.lay = new BipLayout(this.uriParam.playout, this.cells);
	}
	// 下拉刷新数据列表
	refresh() {
		this.currPage = 1;
		this.getListDataFromNet(this.currPage,this.pageSize)
	}
	//加载下一页
	loadMore() {
		if(this.totalPage>=this.currPage){
			this.currPage++;
			this.getListDataFromNet(this.currPage,this.pageSize)
		}
	}
	getListDataFromNet(pageNum: number, pageSize: number) {
		this.qe.page.currPage = pageNum;
		this.qe.page.pageSize = pageSize;
		if (pageNum == 1) this.loading = true;
		tools
			.query(this.qe)
			.then((res: any) => {
				// console.log(res)
				let listData: Array<any> = [];
				let rtn = res.data;
				if (rtn.id == 0) {
					let vvr = rtn.data.data.data;
					this.qe.page = rtn.data.data.page;
					this.currPage = this.qe.page.currPage;
					this.pageSize = this.qe.page.pageSize;
					this.totalPage = Math.ceil(this.qe.page.total/this.pageSize);
					listData = vvr;
				}
				if (pageNum == 1) this.pdList = []; //如果是第一页需手动制空列表
				this.pdList = this.pdList.concat(listData); //追加新数据
				this.$nextTick(() => {
					this.loading = false;
				});
				this.dsm.cdata.data = this.pdList;
			})
			.catch((e: any) => {
				console.log(e);
				this.loading = false;
			});
	}

	queryCont(vl:any) {
		this.loading = true;
		if(Object.keys(vl).length>0){
			this.qe.cont = vl;
		}else {
			this.qe.cont = '';
		}
		this.pdList = [];
		this.refresh();
	}
	@Watch('pbuid')
	aidMapChange() {
		console.log("watch")
		this.init();
	}
}
</script>

<style lang="scss" scoped>
page {
	margin-bottom: 120upx;
}
.myHeight{
	height: 650upx !important;
}
</style>
