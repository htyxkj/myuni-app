<template>
	<view>
		<cu-custom :bgColor="'bg-' + cr" :isBack="true">
			<block slot="backText">返回</block>
			<block slot="content"><view class="header-title">{{ title }}</view></block>
		</cu-custom>
		<bip-search-con :cels="showCells" :dsm_cont="dsm_cont" @query="queryCont"></bip-search-con>
		<template v-if="dsm.ccells">
			<bip-table :ccells="dsm.ccells"  :tableData="pdList2" @rowClick="rowClick" @onSort="onSort"></bip-table>
			<view class="padding-xs margin-xs"></view>
			<view class="padding-xs margin"></view>
			<view class="cu-bar foot bg-white" :style="mbs.menuList.length>0?'bottom:100rpx':''">
				<u-row gutter="0" justify="between" style="width:100%;padding: 10rpx 0rpx 10rpx 0;">
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
			<view class="cu-bar tabbar bg-white shadow foot my-b-menu">
				<view class="submit margin-sm bg-blue" @click="writeCardValue">
					<text>写卡</text>
				</view>
			</view>
		</template> 
		<mLoad v-if="loading" :msg="'操作中...'"></mLoad>
		<u-toast ref="breedingWriteCardToast" />
	</view>
</template>

<script lang="ts">
import { Vue, Provide, Prop, Component } from 'vue-property-decorator';
import { InsAidModule } from '@/store/module/insaid'; //导入vuex模块，自动注入
import mLoad from '@/components/mLoad.vue';
import bipSearchCon from '@/components/bip-ui/bip-search/bip-search-con.vue'
import bipListUnit2 from '@/components/bip-ui/bip-unit/bip-list-unit2.vue';
import bipGpsShow from '@/components/bip-ui/bip-gps/bip-gps-show.vue';
import bipBillBar from '@/components/bip-ui/bip-menu-bar/bip-bill-bar.vue';
import BipMenuBtnDlg from '@/components/bip-ui/bip-dlg/BipMenuBtnDlg.vue';
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
import loadRefresh from '@/components/load-refresh/load-refresh.vue';
import bipTable from "@/components/bip-ui/bip-table/bip-table.vue";
let _ = require('lodash');
import comm from '@/static/js/comm.js';
import { dataTool } from '@/classes/tools/DataTools';
const DataUtil = dataTool.utils;
let commURL: any = comm;
@Component({
	components: { mLoad,bipSearchCon,bipListUnit2,bipGpsShow,loadRefresh,bipTable,bipBillBar,BipMenuBtnDlg}
})
export default class BreedingWriteCard extends Vue {
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
	pdList:any = []
	pdList2:any = []
	qe:QueryEntity = new QueryEntity('','');
	isjump:boolean = false;//

	currPage: number = 1;
	totalPage: number = 0;
	pageSize:number = 15;
	
	get showCells(){
		if(this.dsm_cont.ccells){
			let vr = []
			for(var i=0;i<this.dsm_cont.ccells.cels.length;i++){
				let cel = this.dsm_cont.ccells.cels[i]
				if(cel.isShow){
					if((cel.attr &(0x40))>0)
            			cel.attr = cel.attr ^ (0x40)
					vr.push(cel)
				}
			}
			return vr;
		}
		return [];
	}
	showText(val:any){
		let _refs:any = this.$refs;
		if(val){
			_refs.uToast.show({
					title: val+''
					// type: 'success'
				})
		}
	}
	
	onSort(param:any){
		let orderby = param.key+" "+param.type;
		this.qe.orderBy=orderby;
        this.getListDataFromNet2(this.currPage,this.pageSize)
	}
	
	async rowClick(cellId:any,rowId:number,data:any){
		this.dsm.currRecord = data
		let _cellIndex = _.findIndex(this.dsm.ccells.cels,(itm:any)=>{
			return itm.id == cellId;
		})
		let cell = this.dsm.ccells.cels[_cellIndex];
		let cr0 = this.pdList[rowId];
		if( (cell.attr & 1) >0 || (cell.attr & (0x80000)) >0 ) { // 0主键   0x80000关联
			let row = cr0.data;
			let slkid = row[cell.id];
			if ((cell.attr & 0x80000) > 0) {//关联
				let allCels = this.dsm.ccells.cels;
				let slkbuidCell = null;
				for(var i=0;i<allCels.length;i++){
					let oneCel = allCels[i];
					if(oneCel.id == cell.id){
						slkbuidCell = allCels[i+1];
						break;
					}
				} 
				let slkbuid = ''
				if(slkbuidCell)
					slkbuid = row[slkbuidCell.id];
				let name = "BL_"+this.pbuid+"_"+cell.id;
				let qe = new QueryEntity('','');
				let vv:any = await tools.getBipInsAidInfo(name,300,qe);
				console.log(vv)
				if(vv.data.id==-1){
					//没有定义BL_xxx
					// console.log(slkid,slkbuid);
					if (slkid && slkbuid) { 
						//获取业务定义
						let param = await tools.getBULinks(slkbuid);
						// console.log(param);
						if(param.data.id ==0){
							let opera = param.data.data.opt;
							if (opera&&!opera.pmenuid) {
								uni.showToast({title:"业务" + slkbuid + "没有绑定菜单!"}); 
								return false;
							}
							let me = Tools.findMenu(opera.pmenuid);
							if (!me) {
								uni.showToast({title: "没有" + opera.pmenuid + "菜单权限!" });
								return false;
							}else{

								let command = me.command.split("&");
								let pbuid = command[0].split("=");
								let pmenuid = command[1].split("="); 
								if(pbuid[0] == 'pmenu'){
									let pmenu = pbuid[1];
									let type = commURL.ItemType;
									let url = "";
									if(type =='credit'){
										if(pmenu =='checkRecord'){
											pmenu = "checkRecord?1=1";
										}
										url = '/pages/alone/credit/'+pmenu;
									}
									let rr = ""+opera['pkfld']+"='"+slkid+"'"
									let qcont:any =rr;
									let uri = url+'&title='+opera.pname+'&qcont='+encodeURIComponent(qcont);
									uni.navigateTo({
										url: uri,
										complete: () => {
											uni.hideLoading();
										}
									});
								}else{
									await tools.getMenuParams(pbuid[1],pmenuid[1]).then((res:any)=>{
										let data = res.data
										if(data.id>=0){
											let _uriParams = data.data.mparams
											uni.setStorageSync(pbuid[1],JSON.stringify(_uriParams));
											let rr = ""+opera['pkfld']+"='"+slkid+"'"
											let qcont:any =rr;
											if(_uriParams.beBill){
												let uri = '/pages/appinfo/appdetail?color='+this.cr+'&title='+opera.pname+"&pbuid="+pbuid[1]+'&qcont='+encodeURIComponent(qcont);
												uni.navigateTo({
													url: uri,
													complete: () => {
														uni.hideLoading();
														this.isjump = false;
													}
												});
											}else{
												this.openList(rowId);
											}
										}else{
											uni.showToast({
												title:'没有权限!'
											})
										}
									}).catch((err:any)=>{
											uni.showToast({
												title:'没有权限!'
											})
									})
								}
							}
						}  
					}
				}else{
					//BL字段点击
					let data = vv.data.data.data;//获取常量定义的 BL_菜单参数_字段ID 进行菜单打开
					let slink = data.slink;
					if(slink){
						slink = slink.split("&");
						let menuid = slink[0]
						let me = Tools.findMenu(menuid);
						if (!me) {
							uni.showToast({
								title:"没有" + menuid + "菜单权限!" 
							})
							return false;
						}else{
							let jsontj:any={};
							for(var i=1;i<slink.length;i++){
								let oneTJ = slink[i].split("=")
								let key = oneTJ[0];
								let vl = oneTJ[1]
								if(vl.indexOf("*") !=-1 ){
									let cds = this.env.getDataSet(vl.split("*")[0]);
									vl = cds.currRecord.data[vl.split("*")[1]]
								}else{
									vl = this.dsm.currRecord.data[vl]
								}
								jsontj[key] = vl;
							}
							jsontj = JSON.stringify(jsontj)
							let command = me.command.split("&");
							let pbuid = command[0].split("=");
							let pmenuid = command[1].split("=");
							let res = await tools.getMenuParams(pbuid[1],pmenuid[1]);
							let data = res.data
							if(data.id>=0){
								let _uriParams = data.data.mparams
								uni.setStorageSync(pbuid[1],JSON.stringify(_uriParams));
								let uri = '/pages/appreport/appreport?color='+this.cr+'&title='+me.menuName+"&source=BL&pbuid="+pbuid[1]+'&qcont='+encodeURIComponent(jsontj);
								uni.navigateTo({
									url: uri,
									complete: () => {
										uni.hideLoading();
										this.isjump = false;
									}
								});
							}else{
								uni.showToast({
									title:"没有" + pbuid[1] + "菜单参数!" 
								})
							}
						}
					}
				}
			}
		}
		//this.openList(rowId);
	}
	get aidmaps(){
		return InsAidModule.aidInfos;
	}
	get aidValues(){
		return InsAidModule.aidValues;
	}
	get inProcess(){
		return InsAidModule.inProcess;
	}
	//跳转到详情页面
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
	//组成条件项
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
	//页面初始化
	async onLoad(option: any) {
		this.cr = option.color ? option.color : 'blue';
		this.title = option.title ? option.title : 'billPage';
		this.pbuid = "720307";
		await tools.getMenuParams(this.pbuid,"720319").then((res:any)=>{
			let data = res.data
			if(data.id>=0){
				this.uriParam = data.data.mparams
			}
		});
		if(this.uriParam){
			this.loading = true;
			await tools.getCCellsParams(this.uriParam.pcell).then((res: any) => {
				this.loading = false;
				let rtn = res.data;
				if (rtn.id == 0) {
					this.initUIData(rtn.data.layCels);
					if(option.source && option.source=='BL'){
						let qcont = decodeURIComponent(option.qcont);
						qcont = JSON.parse(qcont);
						Object.assign(this.dsm_cont.currRecord.data,qcont);
					}
					this.queryCont(this.dsm_cont.currRecord.data,true);
				}else{
					uni.showToast({title:'没有获取到对象定义'+this.uriParam})
				}
			})
			.catch((err: any) => {
				this.loading = false;
				console.log(err);
			});
		}
		//#ifdef APP-PLUS
			Tools.removeKeydown(null);
			Tools.oPowerUpOrDown(true);
			Tools.initKeydown(139,this.writeCardValue);
		//#endif
	}
	// 初始化界面参数
	// 后台获取的cell信息
	async initUIData(layCels: any) {
		this.cells = layCels;
		this.dsm_cont = new CDataSet(this.cells[0]);
		this.dsm = new CDataSet(this.cells[1]);
		// console.log(this.dsm)
		this.qe.pcell = this.dsm.ccells.obj_id;
		this.qe.tcell = this.dsm_cont.ccells.obj_id;
		this.qe.oprid = 13;
        this.qe.type = 1
		for (let i = 2; i < this.cells.length; i++) {
			this.ds_ext[i - 1] = new CDataSet(this.cells[i]);
		}
		this.mbs.init(this.uriParam.pattr, this.dsm,true);
		this.env.initInfo(this.uriParam, this.cells, this.mbs, this.dsm, this.ds_ext);
		this.env.ds_cont = this.dsm_cont
		this.lay = new BipLayout(this.uriParam.playout, this.cells);
		this.dsm_cont.currRecord = DataUtil.createRecord(this.dsm_cont,this.env);
		this.$forceUpdate()		
	} 
	
	// 下拉刷新数据列表
	refresh() {
		this.currPage = 1;
		this.getListDataFromNet2(this.currPage,this.pageSize)
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
	//加载下一页
	loadMore() {
		if(this.totalPage>=this.currPage){
			this.currPage++;
			this.getListDataFromNet2(this.currPage,this.pageSize)
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
			this.pdList2 = listData; //如果是第一页需手动制空列表
			this.$nextTick(() => {
				this.loading = false;
			});
			this.dsm.cdata.data = this.pdList;
			if(this.pdList.length>0){
				this.dsm.currRecord = this.dsm.cdata.data[0]
			}
		}).catch((e:any)=>{
			console.log(e);
			this.loading = false;
		})
	}

	queryCont(vl:any,isFirst:boolean = false) {
		this.loading = true;
		if(this.uriParam.pbds.ptran){
			let ptran = this.uriParam.pbds.ptran;
			ptran = ptran.split("&")
			for(var i=0 ; i< ptran.length;i++){
				let cc = ptran[i].split("=");
				if(!vl.hasOwnProperty(cc[0])){
					vl[cc[0]] = cc[1];
				}else{
					if(!vl[cc[0]] || isFirst){
						vl[cc[0]] = cc[1];
					}
				}
			}
		}
		if(Object.keys(vl).length>0){
			this.qe.cont = vl;
		}else {
			this.qe.cont = '';
		}
		if(this.uriParam.pbds.polnk){
			this.qe.polnk = this.uriParam.pbds.polnk;
		}
		this.pdList = [];
		this.refresh()
	}
	writeCardValue(){
		this.loading = true;
		let rec = this.dsm.currRecord;
		let id = rec.data.earnumb;
		let data = {'value':id};
		setTimeout(() => {
			let ref:any = this.$refs.breedingWriteCardToast;
			Tools.rfidWriteCard(data,(e:any)=>{
				let type = 'success';
				if(e.id == -1){
					type = 'error'
				}
				ref.show({
					title: e.message,
					type: type,
				})
				this.loading = false
			})
			this.loading = false
		}, 300);
	}
	onUnload(){
		//#ifdef APP-PLUS
			Tools.oPowerUpOrDown(false);
			Tools.removeKeydown(null);
		//#endif
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
	.table {
		text-align: center;
	}
	.menuBar{
		text-align: center;
		background-color: white;
		height: 40px;
		line-height: 40px;
		color: #2d64ff;
	}
</style>
