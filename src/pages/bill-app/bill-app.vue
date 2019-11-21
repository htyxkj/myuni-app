<template>
	<view>
		<cu-custom :bgColor="'bg-'+cr" :isBack="true"><block slot="backText">返回</block><block slot="content">{{title}}</block></cu-custom>
		<scroll-view scroll-x class="bg-white nav text-center fixed" :style="[{top:customBar + 'px'}]">
			<view class="flex text-center">
				<view class="cu-item flex-sub" :class="index==TabCur?'text-'+cr+' cur':''" v-for="(item,index) in 3" :key="index" @tap="selectTab"
				 :data-id="index">
					<template v-if="index==0">
						<text class="cuIcon-circlefill"></text>暂存
					</template>
					<template v-else-if="index==1">
						<text class="cuIcon-usefullfill"></text>未完成
					</template>
					<template v-else>
						<text class="cuIcon-activityfill"></text>已完成
					</template>
				</view>
			</view>
		</scroll-view>
		<scroll-view scroll-y="true" >
			<block v-if="TabCur==0">
				<view class="cu-bar bg-white solid-bottom">
					<view class="action">
						<text class="cuIcon-title text-blue"></text>固定尺寸
					</view>
				</view>
				<view class="padding bg-white">
					<view class="flex flex-wrap">
						<view class="basis-xs bg-grey margin-xs padding-sm radius">xs(20%)</view>
						<view class="basis-df"></view>
						<view class="basis-sm bg-grey margin-xs padding-sm radius">sm(40%)</view>
						<view class="basis-df"></view>
						<view class="basis-df bg-grey margin-xs padding-sm radius">sub(50%)</view>
						<view class="basis-lg bg-grey margin-xs padding-sm radius">lg(60%)</view>
						<view class="basis-xl bg-grey margin-xs padding-sm radius">xl(80%)</view>
					</view>
				</view>
			</block>
			<block v-if="TabCur==1">
				<view class="margin-top">
					1
				</view>
			</block>
			<block v-if="TabCur==2">
				<view class="margin-top">
					2
				</view>
			</block>
		</scroll-view>
		
		<mLoad v-if="loading" :png="'/static/gs.png'" :msg="'加载中...'"></mLoad>
	</view>
</template>

<script lang="ts">
import { Vue, Provide, Prop, Component } from 'vue-property-decorator';
import { BIPUtil } from '@/classes/api/request';
let tools = BIPUtil.ServApi;
import mLoad from '../../components/mLoad.vue';
import URIParams from '@/classes/URIParams';
import  Cells  from '@/classes/pub/coob/Cells';
import CDataSet from '@/classes/pub/CDataSet';
import CCliEnv from '@/classes/cenv/CCliEnv';
import BipMenuBar from '@/classes/pub/BipMenuBar';
import BipLayout from '@/classes/ui/BipLayout';
import mescrollUni from '@/components/mescroll-uni/mescroll-uni.vue';
@Component({ components: { mLoad, mescrollUni } })
export default class billApp extends Vue {
	@Prop({ default: 'blue', type: String }) cr!: string;
	@Prop({ default: 'billApp', type: String }) title!: string;
	@Prop({ type: Object }) uriParam!: URIParams;
	@Provide() TabCur = 0;
	@Provide() modalName: any = null;
	@Provide() listTouchStart: number = 0;
	@Provide() listTouchDirection: any = null;
	@Provide() loading: boolean = true;
	@Provide() env: CCliEnv = new CCliEnv();
	@Provide() mbs: BipMenuBar = new BipMenuBar();
	//主对象数据集
	@Provide() dsm: CDataSet = new CDataSet(null);
	//条件对象数据集
	@Provide() dsm_cont: CDataSet = new CDataSet(null);
	//其他对象数据集
	@Provide() ds_ext: Array<CDataSet> = Array<CDataSet>();
	//界面组成对象信息
	@Provide() cells: Array<Cells> = new Array<Cells>();
	@Provide() lay: BipLayout = new BipLayout('');

	@Provide() tabIndex: number = 0;
	@Provide() tabs: Array<any> = [];

	@Provide() mescroll: any = null;
	@Provide() navTop: any = null;
	@Provide() isShowSticky: boolean = false;
	@Provide() isChangeTab: boolean = false;
	@Provide() pdList: Array<any>=  [];
	@Provide() upOption:any = {}
	
	@Provide() customBar:number = this.CustomBar
	
	async mounted() {
		console.log(this.uriParam);
		this.loading = true;
		await tools
			.getCCellsParams(this.uriParam.pcell)
			.then((res: any) => {
				this.loading = false;
				let rtn: any = res.data;
				if (rtn.id == 0) {
					this.initUIData(rtn.data.layCels);
					this.initU();
				} else {
					uni.showToast({
						title: '没有获取到对象定义'
					});
				}
			})
			.catch(err => {
				this.loading = false;
				console.log(err);
			});
	}

	initU() {
		this.tabs = [
			{ name: '全部', pdList: null, num: 1, y: 0, curPageLen: 0, hasNext: true },
			{ name: '母婴', pdList: null, num: 1, y: 0, curPageLen: 0, hasNext: true },
			{ name: '图书', pdList: null, num: 1, y: 0, curPageLen: 0, hasNext: true }
		]
		this.upOption = {
			onScroll: true 
		}
	}

	initUIData(layCels: any) {
		this.cells = layCels;
		this.dsm = new CDataSet(this.cells[0]);
		this.dsm_cont = new CDataSet(this.cells[0]);
		for (let i = 1; i < this.cells.length; i++) {
			this.ds_ext[i - 1] = new CDataSet(this.cells[i]);
		}
		this.mbs.init(this.uriParam.pattr, this.dsm);
		this.env.initInfo(this.uriParam, this.cells, this.mbs, this.dsm, this.ds_ext);
		let bipLay = new BipLayout(this.uriParam.playout, this.cells);
	}

	selectTab(e: any) {
		let i = parseInt(e.currentTarget.dataset.id);
		this.TabCur = i;
	}

	// ListTouch触摸开始
	ListTouchStart(e: any) {
		this.listTouchStart = e.touches[0].pageX;
	}

	// ListTouch计算方向
	ListTouchMove(e: any) {
		this.listTouchDirection = e.touches[0].pageX - this.listTouchStart > 0 ? 'right' : 'left';
	}

	// ListTouch计算滚动
	ListTouchEnd(e: any) {
		if (this.listTouchDirection == 'left') {
			this.modalName = e.currentTarget.dataset.target;
		} else {
			this.modalName = null;
		}
		this.listTouchDirection = null;
	}
}
</script>
<style scoped>
.flex-sub {
	font-size: 36upx;
}
/*调整item宽度 */
.cu-list > .cu-item.move-cur {
	-webkit-transform: translateX(-460upx) !important;
	transform: translateX(-460upx) !important;
}

.move {
	width: 460upx !important;
}
page {
		padding-top: 45px;
	}

</style>
