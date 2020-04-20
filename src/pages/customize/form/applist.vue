<template>
	<view>
		<bip-search-con :cels="showCells" @query="queryCont"></bip-search-con>
		<mescroll-uni @down="downCallback" @up="upCallback" @init="mescrollInit" :up="upOption" :down="downOption" :fixed="false" :top="0" :bottom="0" class="bg-white">
			<view v-for="(item, index) in pdList" :key="index">
				<bip-list-unit2 :record="item" :cels="dsm.ccells.cels" :rowId="index" @openitem="openList" :obj_id="dsm.ccells.obj_id"></bip-list-unit2>
			</view>
		</mescroll-uni>
		<mLoad v-if="loading" :png="'/static/gs.png'" :msg="'加载中...'"></mLoad>
		<bip-bill-bar @tabSelect="execCmd" :attr="1"></bip-bill-bar>
	</view>
</template>

<script lang="ts">
import { Vue, Provide, Prop,Watch, Component } from 'vue-property-decorator';
import mLoad from '@/components/mLoad.vue';
import bipLay from '@/components/bip-ui/bip-lay/bip-lay.vue';
import bipSearchCon from '@/components/bip-ui/bip-search/bip-search-con.vue';
import MescrollUni from '@/components/mescroll-uni/mescroll-uni.vue';
import bipListUnit from '@/components/bip-ui/bip-unit/bip-list-unit.vue';
import bipListUnit2 from '@/components/bip-ui/bip-unit/bip-list-unit2.vue';
import uniFab from '@/components/uni-ui/uni-fab/uni-fab.vue';

import bipBillBar from '@/components/bip-ui/bip-menu-bar/bip-bill-bar.vue';
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
import { Tools } from '@/classes/tools/Tools';
import { icl } from '@/classes/tools/CommICL';

import { dataTool } from '@/classes/tools/DataTools';
const DataUtil = dataTool.utils;
@Component({
	components: { mLoad, bipLay, MescrollUni, bipSearchCon, uniFab, bipListUnit, bipListUnit2, bipBillBar }
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
	mescroll: any = {}; //下拉对象
	upOption: any = {}; //上拉数据列表参数配置
	downOption: any = {}; //下拉数据列表参数配置
	qe: QueryEntity = new QueryEntity('', '');
	isjump: boolean = false;
	created() {
		this.initScoreUI();
	}

	onShow() {
		// console.log('onShow')
		if (this.dsm.p_cell) {
			this.downCallback(this.mescroll);
		}
	}
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

	execCmd(cmd: string) {
		// console.log('addOne item'+cmd)
		uni.showLoading({
			title: '跳转中...'
		});
		// let item = encodeURIComponent(JSON.stringify(this.uriParam));
		uni.navigateTo({
			url: '/pages/appinfo/appinfo?pbuid=' + this.pbuid + '&color=' + this.cr + '&title=' + this.title,
			complete: () => {
				uni.hideLoading();
			}
		});
	}

	async mounted() { 
		this.init();
	}
	async init(){
		this.uriParam = JSON.parse(uni.getStorageSync(this.pbuid));
		console.log(this.uriParam,'999')
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
		// this.initScoreUI()
		// this.downCallback(this.mescroll)
	}

	// mescroll组件初始化的回调,可获取到mescroll对象
	mescrollInit(mescroll: any) {
		this.mescroll = mescroll;
		this.mescroll.endSuccess([]);
	}

	downCallback(mescroll: any) {
		// console.log('downcallback');
		if (mescroll && mescroll.resetUpScroll) mescroll.resetUpScroll();
	}

	upCallback(mescroll: any) {
		// console.log('upCallback', mescroll);
		if (this.qe.pcell) {
			this.getListDataFromNet(
				mescroll.num,
				mescroll.size,
				(curPageData: any) => {
					//联网成功的回调
					// console.log('mescroll.num=' + mescroll.num + ', mescroll.size=' + mescroll.size + ', curPageData.length=' + curPageData.length);
					//设置列表数据
					if (mescroll.num == 1) this.pdList = []; //如果是第一页需手动制空列表
					this.pdList = this.pdList.concat(curPageData); //追加新数据
					// 数据渲染完毕再隐藏加载状态
					this.$nextTick(() => {
						mescroll.endSuccess(curPageData.length);
						if (this.loading) {
							this.loading = false;
						}
						// 设置nav到顶部的距离 (需根据自身的情况获取navTop的值, 这里放到列表数据渲染完毕之后)
						// 也可以放到onReady里面,或者菜单顶部的数据(轮播等)加载完毕之后..
					});
					this.dsm.cdata.data = this.pdList;
				},
				() => {
					//联网失败的回调,隐藏下拉刷新的状态
					mescroll.endErr();
					this.loading = false;
				}
			);
		} else {
			// 数据渲染完毕再隐藏加载状态
			this.$nextTick(() => {
				mescroll.endSuccess(0);
				// 设置nav到顶部的距离 (需根据自身的情况获取navTop的值, 这里放到列表数据渲染完毕之后)
				// 也可以放到onReady里面,或者菜单顶部的数据(轮播等)加载完毕之后..
			});
		}
	}

	getListDataFromNet(pageNum: number, pageSize: number, successCallback: any, errorCallback: any) {
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
					listData = vvr;
				}
				successCallback && successCallback(listData);
			})
			.catch((e: any) => {
				console.log(e);
				errorCallback && errorCallback();
			});
	}

	queryCont(cellId: string, mo: any) {
		this.loading = true;
		let cont: any = {};
		cont[cellId] = mo;
		if (mo && mo.length > 0) this.qe.cont = cont;
		else {
			this.qe.cont = '';
		}
		this.pdList = [];
		this.downCallback(this.mescroll);
	}
	//滚动页面
	initScoreUI() {
		this.upOption = {
			use: true, // 是否启用上拉加载; 默认true
			auto: true, // 是否在初始化完毕之后自动执行上拉加载的回调; 默认true
			isLock: false, // 是否锁定上拉加载,默认false;
			isBoth: false, // 上拉加载时,如果滑动到列表顶部是否可以同时触发下拉刷新;默认true,两者可同时触发;
			isBounce: false, // 默认禁止橡皮筋的回弹效果, 必读事项: http://www.mescroll.com/qa.html?v=190725#q25
			page: {
				num: 0, // 当前页码,默认0,回调之前会加1,即callback(page)会从1开始
				size: 10, // 每页数据的数量
				time: null // 加载第一页数据服务器返回的时间; 防止用户翻页时,后台新增了数据从而导致下一页数据重复;
			},
			noMoreSize: 3, // 如果列表已无数据,可设置列表的总数量要大于等于5条才显示无更多数据;避免列表数据过少(比如只有一条数据),显示无更多数据会不好看
			offset: 100, // 距底部多远时,触发upCallback
			textLoading: '加载中 ...', // 加载中的提示文本
			textNoMore: '没有更多数据了', // 没有更多数据的提示文本
			toTop: {
				// 回到顶部按钮,需配置src才显示

				offset: 1000, // 列表滚动多少距离才显示回到顶部按钮,默认1000
				duration: 300 // 回到顶部的动画时长,默认300ms
			},
			empty: {
				use: true, // 是否显示空布局
				tip: '~ 暂无相关数据 ~', // 提示
				btnText: '去逛逛 >', // 按钮
				fixed: false, // 是否使用fixed定位,默认false; 配置fixed为true,以下的top和zIndex才生效
				top: '35%', // fixed定位的top值 (完整的单位值,如 "35%"; "300upx")
				zIndex: 99 // fixed定位z-index值
			},
			onScroll: false // 是否监听滚动事件, 默认false (配置为true时,可@scroll="scroll"获取到滚动条位置和方向)
		};
		this.downOption = {
			use: true, // 是否启用上拉加载; 默认true
			auto: false // 是否在初始化完毕之后自动执行上拉加载的回调; 默认true
		};
	}
	@Watch('pbuid')
	aidMapChange() {
		console.log("watch")
		this.init();
	}
}
</script>

<style lang="scss">
page {
	margin-bottom: 120upx;
}
</style>
