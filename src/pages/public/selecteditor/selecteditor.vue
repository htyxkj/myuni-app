<template>
	<view>
		<cu-custom bgColor="bg-blue" :isBack="true" cusBack @back="exitPage">
			<!-- <block slot="backText">返回单据</block> -->
			<block slot="content">
				<view class="header-title">{{ bipInsAid.title }}</view>
			</block>
		</cu-custom>
		<view class="cu-form-group solid-bottom">
			<view class="action padding-right" @tap="isShow = true">
				<template v-if="array&&array.length>0">
					<text class="text-blue">{{array[index].name||''}}</text>
					<text class="cuIcon-triangledownfill"></text>
				</template>
			</view>
			<input placeholder="查询什么呢" type="text" v-model="searchMode" @confirm="refresh" />
			<text class="cuIcon-search" @tap="refresh"></text>
		</view>
		<bip-select :arr="array" :show="isShow" @cancel="cancel" :index="index" @selectChange="selectChange" @select="selectOK" :showKey="'name'" :isStr="false"></bip-select>
		<view class="cu-form-group clear" @tap.stop="clear">
			<view class="content">
				<text class="cuIcon-delete"></text><text class="margin-left-xs">清空选择</text>
			</view>
		</view>
		<view class="margin-top-xs"></view>
		<load-refresh ref="loadRefresh" :isRefresh="true" :backgroundCover="'#F3F5F5'" :heightReduce="280" :pageNo="currPage" :totalPageNo="totalPage"
		 @loadMore="loadMore" @refresh="refresh">
		 <view slot="content-list">
		 	<bip-selector-unit v-for="(item,index) in pdList" :key='index' :item="item" :index="index" @select="select" :isMultiple="isMultiple"></bip-selector-unit>
		 </view>
		</load-refresh>
		<view class="cu-bar tabbar bg-white shadow foot my-b-menu" v-if="isMultiple || isRfid">
			<template v-if="isMultiple">
				<view class="submit bg-red margin-sm" @click="exitPage"><text>取消</text></view>
				<view class="submit bg-blue margin-sm" @click="celOk"><text>确定</text></view>
			</template>
			<template>
				<view class="submit bg-blue margin-sm" @click="readRfid"><text>读取标签信息</text></view>
			</template>
		</view>
		<mLoad v-if="loading" :msg="'加载中...'"></mLoad>
	</view>
</template>

<script lang="ts">
import { BIPUtil } from '@/classes/api/request';
let tools = BIPUtil.ServApi;
import { Tools } from '@/classes/tools/Tools';
import { icl } from '@/classes/tools/CommICL';
const ICL = icl;
import { InsAidModule } from '@/store/module/insaid'; //导入vuex模块，自动注入
import BipInsAidNew from '@/classes/BipInsAidNew';
import QueryEntity from '@/classes/search/QueryEntity';
import QueryCont from '@/classes/search/QueryCont';

import empty from '@/components/empty.vue';//空页面
import mLoad from '@/components/mLoad.vue';//加载页面
import bipSelectorUnit from '@/components/bip-ui/bip-unit/bip-selector-unit.vue';
import bipSelect from '@/components/bip-ui/bip-select/bip-select.vue'
import loadRefresh from '@/components/load-refresh/load-refresh.vue';
import { Vue, Provide, Component, Prop, Watch } from 'vue-property-decorator';
@Component({components:{empty,loadRefresh,mLoad,bipSelectorUnit,bipSelect}})
export default class selecteditor extends Vue {
	aidKey = '';//辅助Key值
	editName='';
	methordName = '';
	@Provide('bipInsAid') bipInsAid: BipInsAidNew = new BipInsAidNew('');//辅助对象
	index = 1;//选中项默认是0
	loading=false;//加载显示与否
	pdList: Array<any> = []//数据列表
	array: Array<any> = []//数据列表
	qe:QueryEntity = new QueryEntity("","");//查询实体
	searchMode = '';//查询条件值
	//页面加载时，可以传递参数
	isShow = false;
	currPage: number = 1;
	totalPage: number = 0;
	pageSize:number = 15;
	groupV:any = '';
	cellAttr:any =0;
	isMultiple:boolean = false;//多选
	isRfid:boolean = false;//是否是RFID选项
	checkAll:any =[];
	initRfidTj:any = null;
	async onLoad(option: any) {
		this.initRfidTj = option.rfid_tj
		if(this.initRfidTj == 'null'){
			this.initRfidTj = null;
		}
		this.groupV = option.groupV;
		this.editName = option.editName;
		//#ifdef APP-PLUS
			if(this.editName.startsWith("RFID_")){
				this.isRfid = true;
				Tools.oPowerUpOrDown(true);
				Tools.initKeydown(139,this.readRfid);
			}
		//#endif
		this.methordName = option.methordname||''
		this.aidKey = ICL.AID_KEY + this.editName;
		this.cellAttr = option.cellAttr;
		this.isMultiple = (this.cellAttr & (0x200000))>0
		let rr:any = await this.getAidByKey();
		if (rr) {
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
			this.bipInsAid.labers.forEach((item:any,index:number)=>{
				let ro = { id: index, name: item };
				this.array.push(ro);
			})
			this.getListDataFromNet(this.currPage,this.pageSize)
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
	
	select(item:any,index:number,ischeck:any){
		if(!this.isMultiple){
			this.checkAll = [];
		}
		if(ischeck){
			this.checkAll.push(item);
		}else{
			for(var i=0;i<this.checkAll.length;i++){
				let element = this.checkAll[i];
				if(element == item){
					this.checkAll.splice(i,1)
				}
			}
		}
		if(this.methordName){
			uni.$emit(this.methordName,this.checkAll)
		}
		if(!this.isMultiple){
			this.exitPage();
		}
	}
	celOk(){
		uni.$emit(this.methordName,this.checkAll)
		this.exitPage();
	}
	clear(){
		let item = {};
		if(this.methordName){
			uni.$emit(this.methordName,item)
		}
		this.exitPage();
	}
	loadMore() {
		// console.log('loadMore')
		// 请求新数据完成后调用 组件内loadOver()方法
		// 注意更新当前页码 currPage
		if(this.totalPage>=this.currPage){
			this.currPage++;
			// console.log('查询第'+this.currPage+'也数据')
			this.getListDataFromNet(this.currPage,this.pageSize)
			// console.log(this.pdList.length)
		}
	}
	// 下拉刷新数据列表
	refresh() {
		// console.log('refresh')
		this.initRfidTj = null;
		this.currPage = 1;
		this.getListDataFromNet(this.currPage,this.pageSize)
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
		this.index = e.id;
		this.isShow = false;
	}

	cancel(){
		this.isShow = false;
	}
	/**
	 * 查询数据
	 */
	getListDataFromNet(pageNum: number, pageSize: number) {
		this.qe.page.pageSize = pageSize;
		this.qe.page.currPage = pageNum;
		if(this.groupV != null && this.groupV != ""){
			this.qe.groupV = this.groupV;
		}
		if(this.searchMode || this.initRfidTj){
			let ii = this.bipInsAid.showColsIndex[this.index];
			let cell :any = this.bipInsAid.cells.cels[ii];
			let cont:any = [];
			if(this.searchMode){
				let qcont:QueryCont = new QueryCont(cell.id,this.searchMode,cell.type);//查询条件
				qcont.setContrast(cell.type =='12'?3:0)
				qcont.setLink(1)
				cont.push(qcont)
			}
			if(this.initRfidTj){
				cell = this.bipInsAid.cells.cels[0]
				let qcont:QueryCont  = new QueryCont(cell.id,this.initRfidTj,cell.type);//查询条件
				qcont.setContrast(5)
				cont.push(qcont)
			}
			this.qe.cont = '~['+JSON.stringify(cont)+']';
		}else{
			this.qe.cont = ''
		}
		this.loading = true;
		tools.getBipInsAidInfo(this.editName,210,this.qe).then((res:any)=>{
			let listData:Array<any> = [];
			if(res.data.id==0){
				let vrr = res.data.data.data;
				listData = listData.concat(vrr.values);
				this.qe.page = vrr.page;
				this.currPage = this.qe.page.currPage;
				this.pageSize = this.qe.page.pageSize;
				this.totalPage = Math.ceil(this.qe.page.total/this.pageSize);
				if(pageNum==1){
					this.pdList = []
				}
				this.pdList = this.pdList.concat(listData); //追加新数据
				let lrf: any = this.$refs.loadRefresh;
				if(lrf){
					lrf.loadOver();
				}
			}
			this.loading = false;
		}).catch((e:any)=>{
			console.log(e);
			this.loading = false;
		})
	}
	/**
	 * 退出当前页面
	 */
	exitPage(){
		//#ifdef APP-PLUS
			Tools.removeKeydown(this.back);
		//#endif
		//#ifndef APP-PLUS
			this.back();
		//#endif
	}
	back():any{
		uni.navigateBack({delta:1})
		return true;
	}
	/**
	 * RFID 标签读取数据
	 */
	async readRfid(){
		this.loading = true;
		Tools.oPowerUpOrDown(true);
		setTimeout(()=>{
			Tools.rfidReadCard({},(e:any)=>{
				if(e.id ==0){
					if(e.value){
						let values = e.value.toString();
						this.initRfidTj = values;
						this.getListDataFromNet(1,10);
					}else{
						this.initRfidTj = null;
					}
				}
				this.loading = false;
			})
			this.loading = false;
		},300)
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
.clear{
	max-height: 60upx;
	min-height: 60upx;
	color: #ff6666;
}
</style>
