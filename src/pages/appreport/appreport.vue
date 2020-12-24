<template>
	<view>
		<cu-custom :bgColor="'bg-' + cr" :isBack="true">
			<block slot="backText">返回</block>
			<block slot="content"><view class="header-title">{{ title }}</view></block>
		</cu-custom>
		<bip-search-con :cels="showCells" @query="queryCont"></bip-search-con>
		<template v-if="!isMap">
			<template v-if="dsm&&dsm.ccells">
				<load-refresh ref="loadRefresh" :isRefresh="true" :backgroundCover="'#F3F5F5'" :heightReduce="280" :pageNo="currPage" :totalPageNo="totalPage"
					@loadMore="loadMore" @refresh="refresh">
					<view slot="content-list">
						<view v-for="(item,index) in pdList" :key="index">
							<bip-list-unit2 :record="item" :cels="dsm.ccells.cels" :rowId="index" @openitem="openList" :obj_id="dsm.ccells.obj_id"></bip-list-unit2>
						</view>
					</view>
				</load-refresh>
			</template>
		</template>
		<template v-else-if="isMap">
			<bip-gps-show v-if="dsm&&dsm.ccells" :cels="dsm.ccells.cels" :pdList="pdList"></bip-gps-show>
		</template>
		<view v-if="i_isMap" class="solid-bottom text-xsl padding-xl map-conv" @click="isMapConv">
			<text v-if="isMap" class="cuIcon-wenzi text-green"></text>
			<text v-if="!isMap" class="cuIcon-global text-green"></text>
		</view>
		<mLoad v-if="loading" :png="'/static/gs.png'" :msg="'加载中...'"></mLoad>
	</view>
</template>

<script lang="ts">
import { Vue, Provide, Prop, Component } from 'vue-property-decorator';
// import { UriPModule } from '@/store/module/uripm'; //导入vuex模块，自动注入
import mLoad from '@/components/mLoad.vue';
import bipSearchCon from '@/components/bip-ui/bip-search/bip-search-con.vue'
import bipListUnit2 from '@/components/bip-ui/bip-unit/bip-list-unit2.vue';
import bipGpsShow from '@/components/bip-ui/bip-gps/bip-gps-show.vue';
import { BIPUtil } from '@/classes/api/request';
let tools = BIPUtil.ServApi;

import URIParams from '@/classes/URIParams';
import Cells from '@/classes/pub/coob/Cells';
import CDataSet from '@/classes/pub/CDataSet';
import CRecord from '@/classes/pub/CRecord';
import CCliEnv from '@/classes/cenv/CCliEnv';
import BipMenuBar from '@/classes/pub/BipMenuBar';
import BipLayout from '@/classes/ui/BipLayout';
import QueryEntity from '@/classes/search/QueryEntity';
import { Tools } from '../../classes/tools/Tools';
import { icl } from '../../classes/tools/CommICL';

import {dataTool} from '@/classes/tools/DataTools';
const DataUtil = dataTool.utils
@Component({
	components: { mLoad,bipSearchCon,bipListUnit2,bipGpsShow}
})
export default class appReport extends Vue {
	vueId: string = Tools.guid();
	cr: string = 'blue';
	title: string = '报表页面';
	pbuid:string = '';
	
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
	qe:QueryEntity = new QueryEntity('','');
	isjump:boolean = false;//

	currPage: number = 1;
	totalPage: number = 0;
	pageSize:number = 15;

	isMap:boolean = false;//是否是地图展示页面
	i_isMap:boolean = false;//是否是地图展示页面
 
	get showCells(){
		if(this.dsm_cont.ccells){
			let vr = this.dsm_cont.ccells.cels.filter((item:any)=>{
				return item.isShow == true;
			});
			return vr;
		}
		return [];
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
	makeQueryCont(cr0:any,cels:Array<any>){
		let qs = '';
		if(cels.length>0){
			for(var i=0;i<cels.length;i++){
				let item = cels[i];
				let vr = cr0.data[item.id];
				let type = item.type;
				if(type==12){
					if(vr){
						qs+=item.id+"='"+vr+"'";
					}
				}else{
					if(vr !== undefined &&vr != null &&vr !==''){
						qs+=item.id+"="+vr;
					}
				}
				if(i<cels.length-1){
					qs+=" and ";
				}
			}
		}
		return qs;
	}
	async onLoad(option: any) {
		if (option.pbuid) {
			this.cr = option.color ? option.color : 'blue';
			this.title = option.title ? option.title : 'billPage';
			this.pbuid = option.pbuid;
			this.uriParam = JSON.parse(uni.getStorageSync(this.pbuid));
			if(this.uriParam.pbds.ismap){
				this.isMap = true;
				this.i_isMap = true;
			}
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
		
	}

	// 初始化界面参数
	// 后台获取的cell信息
	async initUIData(layCels: any) {
		this.cells = layCels;
		this.dsm_cont = new CDataSet(this.cells[0]);
		this.dsm = new CDataSet(this.cells[1]);
		console.log(this.dsm)
		this.qe.pcell = this.dsm.ccells.obj_id;
		this.qe.tcell = this.dsm_cont.ccells.obj_id;
		this.qe.oprid = 13;
        this.qe.type = 1
		for (let i = 2; i < this.cells.length; i++) {
			this.ds_ext[i - 1] = new CDataSet(this.cells[i]);
		}
		
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
		if(this.isMap){
			pageNum = 1;
			pageSize = 30000;
		}
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
				this.currPage = this.qe.page.currPage;
				this.pageSize = this.qe.page.pageSize;
				this.totalPage = Math.ceil(this.qe.page.total/this.pageSize);
				listData = vvr;
			}
			if (this.currPage == 1) this.pdList = []; //如果是第一页需手动制空列表
			this.pdList = this.pdList.concat(listData); //追加新数据
			this.$nextTick(() => {
				this.loading = false;
			});
			this.dsm.cdata.data = this.pdList;
		}).catch((e:any)=>{
			console.log(e);
			this.loading = false;
		})
		
	}

	queryCont(cellId:string,mo:any){
		this.loading = true
		let cont:any = {};
		cont[cellId] = mo;
		if(mo&&mo.length>0)
			this.qe.cont = cont;
		else{
			this.qe.cont = ''
		}
		this.pdList = [];
		this.refresh()
	}
	//右下角 地图  列表切换
	isMapConv(){
		this.isMap = !this.isMap;
		this.pageSize = 10;
		this.refresh()
	}
}
</script>

<style lang="scss">
	.map-conv{
		position: absolute;
		bottom: 0px;
		right: 0px;
		z-index: 9999;
	}
</style>
