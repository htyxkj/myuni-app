<template>
	<view>
		<template v-if="myStyle.type == 2&&dsm.ccells">
			<bip-table :ccells="dsm.ccells" :tableData="pdList2" @rowClick="rowClick"></bip-table>
			<view style="padding-top: 8upx;padding-bottom: 30upx;">
				<u-row gutter="0" justify="between" style="background-color: #FFFFFF; padding: 10rpx 0rpx 10rpx 0;">
					<u-col span="3" text-align="center">
						<u-button type="primary" size="mini" @click="firstPage()" ripple plain>首页</u-button>
					</u-col>
					<u-col span="3" text-align="center">
						<u-button type="primary" size="mini" :disabled="currPage<=1" @click="upPageDatas()" ripple plain>上一页</u-button>
					</u-col>
					<u-col span="3" text-align="center">
						<u-button type="primary" size="mini" :disabled="currPage>=totalPage" @click="nextPageDatas()" ripple plain>下一页</u-button>
					</u-col>
					<u-col span="3" text-align="center">
						<u-button type="primary" size="mini" :disabled="currPage==totalPage" @click="lastPageDatas()" ripple plain>末页</u-button>
					</u-col>
				</u-row>
			</view>
		</template>
		<template v-else>
			<bip-search-con :cels="showCells" :dsm_cont="dsm_cont"  @query="queryCont"></bip-search-con>
			<load-refresh ref="loadRefresh" :isRefresh="true" :backgroundCover="'#F3F5F5'" :heightReduce="280" :pageNo="currPage" :totalPageNo="totalPage"
				@loadMore="loadMore" @refresh="refresh">
				<view slot="content-list">
					<view v-for="(item,index) in pdList" :key="index">
						<bip-list-unit2 v-if="myStyle == null" :record="item" :cels="dsm.ccells.cels" :rowId="index" @openitem="openList" :obj_id="dsm.ccells.obj_id"></bip-list-unit2>
						<bip-customize-list-unit-type1 v-else-if="myStyle.type == 1" :myStyle="myStyle" :record="item" :cels="dsm.ccells.cels" :rowId="index" @openitem="openList" :obj_id="dsm.ccells.obj_id"></bip-customize-list-unit-type1>
					</view>
				</view>
			</load-refresh>
		</template>
		
	</view>
</template>

<script lang="ts">
import { Vue, Provide, Prop,Watch, Component } from 'vue-property-decorator';
// import { UriPModule } from '@/store/module/uripm'; //导入vuex模块，自动注入
import mLoad from '@/components/mLoad.vue';
import bipSearchCon from '@/components/bip-ui/bip-search/bip-search-con.vue'
import bipListUnit2 from '@/components/bip-ui/bip-unit/bip-list-unit2.vue';

import bipCustomizeListUnitType1 from '@/components/bip-customize-ui/bip-unit/bip-list-unit-type1.vue';
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

import {dataTool} from '@/classes/tools/DataTools';

const DataUtil = dataTool.utils
import loadRefresh from '@/components/load-refresh/load-refresh.vue';
import bipTable from "@/components/bip-ui/bip-table/bip-table.vue";
let _ = require('lodash');
@Component({
	components: { mLoad,bipSearchCon,bipListUnit2,bipCustomizeListUnitType1,loadRefresh,bipTable}
})
//报表
export default class appReport extends Vue {
	vueId: string = Tools.guid();
	@Prop({default:null}) pbuid?:any;
	@Prop({default:null}) myStyle?:any;//样式
	@Prop({default:null}) title?:any;
	loading: boolean = true;
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
	pdList:Array<any> = []
	pdList2:Array<any> = []
	qe:QueryEntity = new QueryEntity('','');

	isjump:boolean = false;

	currPage: number = 1;
	totalPage: number = 0;
	pageSize:number = 15;

	get showCells(){
		if(this.dsm_cont.ccells){
			let vr = this.dsm_cont.ccells.cels.filter((item:any)=>{
				return item.isShow == true;
			});
			return vr;
		}
		return [];
	}
	
	rowClick(cellId:any,rowId:number,data:any){
		this.openList(rowId);
	}
	
	openList(rid:number){
		if (!this.isjump) {
			this.isjump = true;
			uni.showLoading({
				title: '跳转中...'
			});
			let cr0 = this.pdList[rid];
			let arr:Array<any> = this.dsm.pkCells();
			let qcont = ''
			if(arr.length>0){
				qcont = this.makeQueryCont(cr0,arr);
			}
			uni.navigateTo({
				url: '/pages/appreport/appreportdetail?pbuid=' + this.pbuid + '&color=' + "blue" + '&title=' + this.title +'&qcont='+encodeURIComponent(qcont),
				complete: () => {
					uni.hideLoading();
					this.isjump = false;
				}
			});
		}
	}

	async mounted() {
		await this.init();
	}
	async init(){
		this.uriParam = JSON.parse(uni.getStorageSync(this.pbuid));
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
						this.refresh();
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
	// 初始化界面参数
	// 后台获取的cell信息
	async initUIData(layCels: any) {
		this.cells = layCels;
		this.dsm_cont = new CDataSet(this.cells[0]);
		let curr = DataUtil.createRecord(this.dsm_cont,this.env);
		this.dsm_cont.addRecord(curr);
		this.dsm = new CDataSet(this.cells[1]);
		
		this.qe.pcell = this.dsm.ccells.obj_id;
		this.qe.tcell = this.dsm_cont.ccells.obj_id;
		this.qe.oprid = 13;
        this.qe.type = 1
		// console.log(this.qe)
		
		for (let i = 2; i < this.cells.length; i++) {
			this.ds_ext[i - 1] = new CDataSet(this.cells[i]);
		}
		// let buid = this.uriParam.pflow
		// await tools.getBULinks(buid).then((res:any)=>{
		// 	let rtn1 = res.data;
		// 	if(rtn1.id==0){
		// 		let ope = rtn1.data.opt;
		// 		this.dsm.opera = ope;
		// 		this.dsm.initContrlIndex();
		// 	}
		// });
		
		this.mbs.init(this.uriParam.pattr, this.dsm);
		this.env.initInfo(this.uriParam, this.cells, this.mbs, this.dsm, this.ds_ext);
		this.lay = new BipLayout(this.uriParam.playout, this.cells);
	}

	// 下拉刷新数据列表
	refresh() {
		this.currPage = 1;
		if(this.myStyle.type == 2){
			this.getListDataFromNet2(this.currPage,this.pageSize)
		}else{
			this.getListDataFromNet(this.currPage,this.pageSize)
		}
		// this.getListDataFromNet(this.currPage,this.pageSize)
	}
	//加载下一页
	loadMore() {
		if(this.totalPage>=this.currPage){
			this.currPage++;
			if(this.myStyle.type == 2){
				this.getListDataFromNet2(this.currPage,this.pageSize)
			}else{
				this.getListDataFromNet(this.currPage,this.pageSize)
			}
		}
	}
	//查询数据
	getListDataFromNet(pageNum: number, pageSize: number) {
		this.qe.page.currPage = pageNum
		this.qe.page.pageSize = pageSize
		this.loading = true;
		tools.query(this.qe).then((res:any)=>{
			// console.log(res)
			let listData:Array<any> = [];
			let rtn = res.data;
			if(rtn.id==0){
				let vvr = rtn.data.data.data;
				this.qe.page = rtn.data.data.page;
				listData = vvr;
			}
			if (this.currPage == 1) 
				this.pdList = []; //如果是第一页需手动制空列表
			this.pdList = this.pdList.concat(listData); //追加新数据
			// 数据渲染完毕再隐藏加载状态
			this.pdList2 = listData;
			this.$nextTick(() => {
				this.loading = false;
			});
			this.dsm.cdata.data = this.pdList;
		}).catch((e:any)=>{
			this.loading = false;
		})
		
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
	
	firstPage(){
		this.refresh();
	}
	upPageDatas(){
		if(this.currPage>1){
			this.currPage--;
			this.getListDataFromNet2(this.currPage,this.pageSize);
			
		}
	}
	
	nextPageDatas(){
		if(this.currPage<this.totalPage){
			this.currPage++;
			this.getListDataFromNet2(this.currPage,this.pageSize);
		}
	}
	
	lastPageDatas(){
		if(this.currPage<this.totalPage){
			this.currPage=this.totalPage;
			this.getListDataFromNet2(this.currPage,this.pageSize);
		}
	}
	
	getListDataFromNet2(pageNum: number, pageSize: number) {
		this.qe.page.currPage = pageNum
		this.qe.page.pageSize = pageSize
		this.loading = true;
		tools.query(this.qe).then((res:any)=>{
			let listData:Array<any> = [];
			let rtn = res.data;
			if(rtn.id==0){
				let vvr = rtn.data.data.data;
				this.qe.page = rtn.data.data.page;
				this.currPage = this.qe.page.currPage;
				this.pageSize = this.qe.page.pageSize;
				this.totalPage = Math.ceil(this.qe.page.total/this.pageSize);
				listData = vvr;
			}
			this.pdList = []; //如果是第一页需手动制空列表
			this.pdList = listData; //追加新数据
			this.pdList2 = []; //如果是第一页需手动制空列表
			_.forEach(listData,(row:any)=>{
				this.pdList2.push(row);
			})
			this.$nextTick(() => {
				this.loading = false;
			});
			this.dsm.cdata.data = this.pdList;
		}).catch((e:any)=>{
			console.log(e);
			this.loading = false;
		})
	}
	
	@Watch('pbuid')
	aidMapChange() {
		console.log("watch")
		this.init();
	}
}
</script>

<style lang="scss">
.myHeight{
	height: 650upx !important;
}
</style>
