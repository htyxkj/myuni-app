<template>
	<view style="height: 100%;">
		<cu-custom bgColor="bg-blue" :isBack="true">
			<!-- <block slot="backText">返回单据</block> -->
			<block slot="content">
				<view class="header-title">{{ bipInsAid.title }}</view>
			</block>
		</cu-custom>
		<view>
			<view class="cu-form-group solid-bottom">
				<view class="action padding-right" @tap="isShow = true">
					<template v-if="array&&array.length>0">
						<text class="text-blue">{{array[index].name||''}}</text>
						<text class="cuIcon-triangledownfill"></text>
					</template>
				</view>
				<input placeholder="查询什么呢" type="text" v-model="searchMode" @confirm="query" />
				<text class="cuIcon-search" @tap="query"></text>
			</view>
			<bip-select :arr="array" :show="isShow" @cancel="cancel" :index="index" @selectChange="selectChange" @select="selectOK" :showKey="'name'" :isStr="false"></bip-select>
			<view class="margin-top"></view>
			<mescroll-uni @down="downCallback" @up="upCallback" @init="mescrollInit" :up="upOption" :fixed="true" :top="180" :bottom="0">
				<!-- 数据列表 -->
				<bip-selector-unit v-for="(item,index) in pdList" :key='index' :item="item" :index="index" @select="select"></bip-selector-unit>
			</mescroll-uni>
		</view>
		<mLoad v-if="loading" :png="'/static/gs.png'" :msg="'加载中...'"></mLoad>
	</view>
</template>

<script lang="ts">
import { BIPUtil } from '@/classes/api/request';
let tools = BIPUtil.ServApi;
import { icl } from '@/classes/tools/CommICL';
const ICL = icl;
import { InsAidModule } from '@/store/module/insaid'; //导入vuex模块，自动注入
import BipInsAidNew from '@/classes/BipInsAidNew';
import QueryEntity from '@/classes/search/QueryEntity';
import QueryCont from '@/classes/search/QueryCont';

import empty from '@/components/empty.vue';//空页面
import mescrollUni from '@/components/mescroll-uni/mescroll-uni.vue';//下拉刷新页面
import mLoad from '@/components/mLoad.vue';//加载页面
import bipSelectorUnit from '@/components/bip-ui/bip-unit/bip-selector-unit.vue';
import bipSelect from '@/components/bip-ui/bip-select/bip-select.vue'
import { Vue, Provide, Component, Prop, Watch } from 'vue-property-decorator';
@Component({components:{empty,mescrollUni,mLoad,bipSelectorUnit,bipSelect}})
export default class selecteditor extends Vue {
	aidKey = '';//辅助Key值
	editName='';
	methordName = '';
	@Provide('bipInsAid') bipInsAid: BipInsAidNew = new BipInsAidNew('');//辅助对象
	array: Array<any> = [];//列表显示
	index = 0;//选中项默认是0
	loading=false;//加载显示与否
	mescroll: any = {}//下拉对象
	upOption: any = {}//下拉数据列表参数配置
	pdList: Array<any> = []//数据列表
	qe:QueryEntity = new QueryEntity("","");//查询实体
	searchMode = '';//查询条件值
	//页面加载时，可以传递参数
	isShow = false;
	created(){
		this.initScoreUI()
	}
	async onLoad(option: any) {
		this.editName = option.editName;
		this.methordName = option.methordname||''
		this.aidKey = ICL.AID_KEY + this.editName;
		let rr:any = await this.getAidByKey();
		if (rr) {
			// this.bipInsAid = rr;
			this.bipInsAid.id = rr.id;
			this.bipInsAid.title = rr.title;
			this.bipInsAid.labers = rr.labers;
			this.bipInsAid.showColsIndex = rr.showColsIndex;
			this.bipInsAid.cells = rr.cells;
			this.bipInsAid.bType = rr.bType;
			this.bipInsAid.contCells = rr.contCells;
			this.bipInsAid.sflag = rr.sflag;
			this.bipInsAid.cl = rr.cl;
			this.bipInsAid.mutiple = rr.mutiple
			// this.bipInsAid = Object.assign({}, rr);
			console.log(this.bipInsAid,rr)
			this.bipInsAid.labers.forEach((item:any,index:number)=>{
				let ro = { id: index, name: item };
				this.array.push(ro);
			})
		}
	}
	//缓存数据
	get aidmaps() {
		return InsAidModule.aidInfos;
	}
	

	/**
	 *  根据辅助的Key值获取辅助对象
	 *  @returns 返回辅助对象
	 */
	getAidByKey(){
		return this.aidmaps.get(this.aidKey) || JSON.parse(uni.getStorageSync(this.aidKey));
	}
	
	select(item:any,index:number){
		console.log(item,index)
		if(this.methordName){
			uni.$emit(this.methordName,item)
		}
		uni.navigateBack({delta:1});
	}
	
	//查询字段列表发生改变
	selectChange(e: any) {
		console.log(e)
		this.index = e.id;
		this.isShow = false;
		// this.index = e.target.value;
	}

	bindPickerChange(e: any) {
		this.index = e.target.value;
	}

	selectOK(e:any){
		console.log(e)
		this.index = e.id;
		this.isShow = false;
	}

	cancel(){
		this.isShow = false;
	}
	
	// mescroll组件初始化的回调,可获取到mescroll对象
	mescrollInit(mescroll: any) {
		this.mescroll = mescroll;
	}
	
	query(){
		this.mescroll.resetUpScroll();
	}
	//滚动页面
	initScoreUI() {
		this.upOption = {
			use: true, // 是否启用上拉加载; 默认true
			auto: true, // 是否在初始化完毕之后自动执行上拉加载的回调; 默认true
			isLock: true, // 是否锁定上拉加载,默认false;
			isBoth: true, // 上拉加载时,如果滑动到列表顶部是否可以同时触发下拉刷新;默认true,两者可同时触发;
			isBounce: false, // 默认禁止橡皮筋的回弹效果, 必读事项: http://www.mescroll.com/qa.html?v=190725#q25
			page: {
				num: 0, // 当前页码,默认0,回调之前会加1,即callback(page)会从1开始
				size: 15, // 每页数据的数量
				time: null // 加载第一页数据服务器返回的时间; 防止用户翻页时,后台新增了数据从而导致下一页数据重复;
			},
			noMoreSize: 3, // 如果列表已无数据,可设置列表的总数量要大于等于5条才显示无更多数据;避免列表数据过少(比如只有一条数据),显示无更多数据会不好看
			offset: 1000, // 距底部多远时,触发upCallback
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
			onScroll: true // 是否监听滚动事件, 默认false (配置为true时,可@scroll="scroll"获取到滚动条位置和方向)
		};
	}
	
	downCallback(mescroll: any) {
		console.log('downcallback');
		// 这里加载你想下拉刷新的数据, 比如刷新轮播数据
		// loadSwiper();
		// return ;
		// 下拉刷新的回调,默认重置上拉加载列表为第一页 (自动执行 mescroll.num=1, 再触发upCallback方法 )
		mescroll.resetUpScroll();
	}
	
	upCallback(mescroll: any) {
		console.log('upCallback', mescroll);
		// if (this.isChangeTab) {
		// 	mescroll.hideUpScroll(); // 切换菜单,不显示mescroll进度, 显示系统进度条
		// 	// uni.showLoading();
		// 	this.loading = true;
		// }
		
		this.getListDataFromNet(
			mescroll.num,
			mescroll.size,
			(curPageData: any) => {
				//联网成功的回调
				console.log('mescroll.num=' + mescroll.num + ', mescroll.size=' + mescroll.size + ', curPageData.length=' + curPageData.length);

				//设置列表数据
				if (mescroll.num == 1) this.pdList = []; //如果是第一页需手动制空列表
				this.pdList = this.pdList.concat(curPageData); //追加新数据

				// 数据渲染完毕再隐藏加载状态
				this.$nextTick(() => {
					mescroll.endSuccess(curPageData.length);
					// 设置nav到顶部的距离 (需根据自身的情况获取navTop的值, 这里放到列表数据渲染完毕之后)
					// 也可以放到onReady里面,或者菜单顶部的数据(轮播等)加载完毕之后..
					// if(!this.navTop) this.setNavTop()
					// // 保持tab悬浮,列表数据显示第一条
					// if (this.isChangeTab) {
					// 	this.isChangeTab = false;
					// 	// uni.hideLoading();
					// 	this.loading = false;
					// 	// if(this.isShowSticky) mescroll.scrollTo(this.navTop, 0)
					// }
				});
			},
			() => {
				//联网失败的回调,隐藏下拉刷新的状态
				mescroll.endErr();
				this.loading = false;
			}
		);
	}
	
	/*联网加载列表数据
	在您的实际项目中,请参考官方写法: http://www.mescroll.com/uni.html#tagUpCallback
	请忽略getListDataFromNet的逻辑,这里仅仅是在本地模拟分页数据,本地演示用
	实际项目以您服务器接口返回的数据为准,无需本地处理分页.
	* */
	getListDataFromNet(pageNum: number, pageSize: number, successCallback: any, errorCallback: any) {
		this.qe.page.pageSize = pageSize;
		this.qe.page.currPage = pageNum;
		if(this.searchMode){
			let ii = this.bipInsAid.showColsIndex[this.index];
			let cell :any = this.bipInsAid.cells.cels[ii];
			let qcont:QueryCont = new QueryCont(cell.id,this.searchMode,cell.type);//查询条件
			qcont.setContrast(cell.type =='12'?3:0)
			this.qe.cont = '~[['+JSON.stringify(qcont)+']]';
		}else{
			this.qe.cont = ''
		}
		tools.getBipInsAidInfo(this.editName,210,this.qe).then((res:any)=>{
			let listData:Array<any> = [];
			if(res.data.id==0){
				let vrr = res.data.data.data;
				listData = listData.concat(vrr.values);
				this.qe.page = vrr.page;
				console.log(vrr,'取值回来了');
				successCallback && successCallback(listData);
			}else{
				successCallback && successCallback(listData);
			}
		}).catch((e:any)=>{
			errorCallback && errorCallback();
		})
		//延时一秒,模拟联网
		// setTimeout(() => {
		// 	try {
		// 		let listData = [];
		// 		// tabIndex 全部商品0; 母婴1; 图书2;
		// 		if (this.tabIndex === 0) {
		// 			// 全部商品 (模拟分页数据)
		// 			for (let i = (pageNum - 1) * pageSize; i < pageNum * pageSize; i++) {
		// 				if (i === mockData.length) break;
		// 				listData.push(mockData[i]);
		// 			}
		// 		} else if (this.tabIndex === 1) {
		// 			// 母婴
		// 			for (let j = 0; j < mockData.length; j++) {
		// 				if (mockData[j].pdName.indexOf('婴') !== -1) {
		// 					listData.push(mockData[j]);
		// 				}
		// 			}
		// 		} else if (this.tabIndex === 2) {
		// 			// 图书
		// 			for (let k = 0; k < mockData.length; k++) {
		// 				if (mockData[k].pdName.indexOf('图书') !== -1) {
		// 					listData.push(mockData[k]);
		// 				}
		// 			}
		// 		}
		// 		// 回调
		// 		successCallback && successCallback(listData);
		// 	} catch (e) {
		// 		//联网失败的回调
		// 		errorCallback && errorCallback();
		// 	}
		// }, 1000);
	}
	
}
</script>

<style>
.cu-form-group .mtitle {
	padding-right: 30rpx;
	font-size: 36rpx;
	position: relative;
	height: 60rpx;
	line-height: 60rpx;
	margin-top: -40rpx;
}
</style>
