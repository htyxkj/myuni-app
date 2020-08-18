<template>
	<view class="mescroll-uni-warp">
		<scroll-view
			:id="viewId"
			class="mescroll-uni"
			:class="{ 'mescroll-uni-fixed': fixed }"
			:style="{ 'padding-top': padTop, 'padding-bottom': padBottom, top: fixedTop, bottom: fixedBottom }"
			:scroll-top="scrollTop"
			:scroll-with-animation="scrollAnim"
			@scroll="scroll"
			@touchstart="touchstartEvent"
			@touchmove="touchmoveEvent"
			@touchend="touchendEvent"
			@touchcancel="touchendEvent"
			:scroll-y="scrollAble"
			:throttle="mescroll.optUp.onScroll == null"
			:enable-back-to-top="true"
		>
			<view :style="{ transform: translateY, transition: transition }">
				<!-- 下拉加载区域-->
				<view v-if="mescroll.optDown.use" class="mescroll-downwarp">
					<view class="downwarp-content">
						<view class="downwarp-progress" :class="{ 'mescroll-rotate': isDownLoading }" :style="{ transform: downRotate }"></view>
						<view class="downwarp-tip">{{ downText }}</view>
					</view>
				</view>

				<!-- 列表内容 -->
				<slot></slot>

				<!-- 空布局 -->
				<view v-if="isShowEmpty" class="mescroll-empty" :class="{ 'empty-fixed': optEmpty.fixed }" :style="{ 'z-index': optEmpty.zIndex, top: optEmpty.top }">
					<image v-if="optEmpty.icon" class="empty-icon" :src="optEmpty.icon" mode="widthFix" />
					<view v-if="optEmpty.tip" class="empty-tip">{{ optEmpty.tip }}</view>
					<view v-if="optEmpty.btnText" class="empty-btn" @click="emptyClick">{{ optEmpty.btnText }}</view>
				</view>

				<!-- 上拉加载区域 -->
				<view v-if="mescroll.optUp.use" class="mescroll-upwarp">
					<!-- 加载中.. -->
					<template v-if="isUpLoading">
						<view class="upwarp-progress mescroll-rotate"></view>
						<view class="upwarp-tip">{{ mescroll.optUp.textLoading }}</view>
					</template>
					<!-- 无数据 -->
					<view v-if="!isDownLoading && isUpNoMore" class="upwarp-nodata">{{ mescroll.optUp.textNoMore }}</view>
				</view>
			</view>
		</scroll-view>

		<!-- 回到顶部按钮 (fixed元素,需写在scroll-view外面,防止滚动的时候抖动)-->
		<image
			v-if="showUpBtn && mescroll.optUp.toTop.src"
			class="mescroll-totop"
			:class="{ 'mescroll-fade-in': isShowToTop }"
			:src="mescroll.optUp.toTop.src"
			mode="widthFix"
			@click="toTopClick"
		/>
	</view>
</template>

<script lang="ts">
// 引入mescroll-uni.js,处理核心逻辑
import MeScroll from './mescroll-uni.js';
// 引入全局配置
import GlobalOption from './mescroll-uni-option.js';
import { Vue, Prop, Component } from 'vue-property-decorator';
@Component({})
export default class mescrollUni extends Vue {
	mescroll: any = null;
	viewId: string =
		'id_' +
		Math.random()
			.toString(36)
			.substr(2);
	downHight: number = 0;
	downRotate: number = 0;
	downText: string = '';
	isDownReset: boolean = false;
	isDownLoading: boolean = false;
	isUpLoading: boolean = false;
	isUpNoMore: boolean = false;
	isShowEmpty: boolean = false;
	isShowToTop: boolean = false;
	scrollAble: boolean = true;
	scrollAnim: boolean = false;

	isExec: boolean = false;

	scrollTop: number = 0;
	windowTop: number = 0;
	windowBottom: number = 0;
	clientNum: number = 0;

	@Prop({type: Boolean,default:true}) showUpBtn !:true;
	@Prop({ type: Object }) down!: object; // 下拉刷新的参数配置
	@Prop({ type: Object,default:{} }) up!: object; // 上拉加载的参数配置
	@Prop({ type: [String, Number] }) top!: string | number; // 下拉布局往下偏移的数值, 已默认单位为upx.
	@Prop({ type: [String, Number] }) bottom!: string | number; // 上拉布局往上偏移的数值, 已默认单位为upx.
	@Prop({ type: Boolean, default: true }) fixed!: boolean; // 是否通过fixed固定mescroll的高度, 默认true

	// top数值,单位upx,需转成px. 目的是使下拉布局往下偏移
	get numTop() {
		return uni.upx2px(Number(this.top || 0));
	}
	get fixedTop() {
		return this.fixed ? this.numTop + this.windowTop + 'upx' : 0;
	}
	get padTop() {
		return !this.fixed ? this.numTop + 'upx' : 0;
	}
	// bottom数值,单位upx,需转成px 目的是使上拉布局往上偏移
	get numBottom() {
		return uni.upx2px(Number(this.bottom || 0));
	}
	get fixedBottom() {
		return this.fixed ? this.numBottom + this.windowBottom + 'upx' : 0;
	}
	get padBottom() {
		return !this.fixed ? this.numBottom + 'upx' : 0;
	}
	// 空布局的配置
	get optEmpty() {
		return this.mescroll.optUp.empty;
	}
	// 过渡
	get transition() {
		return this.isDownReset ? 'transform 300ms' : '';
	}
	get translateY() {
		return this.downHight > 0 ? 'translateY(' + this.downHight + 'upx)' : ''; // transform会使fixed失效,需注意把fixed元素写在mescroll之外
	}
	//注册列表滚动事件,用于下拉刷新
	scroll(e: any) {
		this.mescroll.scroll(e.detail, () => {
			this.$emit('scroll', this.mescroll); // 此时可直接通过 this.mescroll.scrollTop获取滚动条位置; this.mescroll.isScrollUp获取是否向上滑动
		});
	}
	//注册列表touchstart事件,用于下拉刷新
	touchstartEvent(e: any) {
		this.mescroll.touchstartEvent(e);
	}
	//注册列表touchmove事件,用于下拉刷新
	touchmoveEvent(e: any) {
		this.mescroll.touchmoveEvent(e);
	}
	//注册列表touchend事件,用于下拉刷新
	touchendEvent(e: any) {
		this.mescroll.touchendEvent(e);
	}
	// 点击空布局的按钮回调
	emptyClick() {
		this.$emit('emptyclick', this.mescroll);
	}
	// 点击回到顶部的按钮回调
	toTopClick() {
		this.isShowToTop = false; // 回到顶部按钮需要先隐藏,再执行回到顶部,避免闪动
		this.mescroll.scrollTo(0, this.mescroll.optUp.toTop.duration); // 执行回到顶部
		this.$emit('topclick', this.mescroll); // 派发点击回到顶部按钮的回调
	}
	// 更新滚动区域的高度 (使内容不满屏和到底,都可继续翻页)
	setClientHeight() {
		if (this.mescroll.getClientHeight(true) === 0 && !this.isExec) {
			this.isExec = true; // 避免多次获取
			this.$nextTick(() => {
				// 确保dom已渲染
				let view = uni
					.createSelectorQuery()
					.in(this)
					.select('#' + this.viewId);
				view.boundingClientRect(data => {
					this.isExec = false;
					if (data) {
						this.mescroll.setClientHeight(data.height);
					} else if (this.clientNum != 3) {
						// 极少部分情况,可能dom还未渲染完毕,递归获取,最多重试3次
						this.clientNum = this.clientNum == null ? 1 : this.clientNum + 1;
						setTimeout(() => {
							this.setClientHeight();
						}, this.clientNum * 100);
					}
				}).exec();
			});
		}
	}
	// 使用created初始化mescroll对象; 如果用mounted部分css样式编译到H5会失效
	created() {
		let vm: any = this;
		let diyOption: any = {
			// 下拉刷新的配置
			down: {
				inOffset(mescroll: any) {
					// 下拉的距离进入offset范围内那一刻的回调
					vm.scrollAble = false; // 禁止下拉,避免抖动 (自定义mescroll组件时,此行不可删)
					vm.isDownReset = false; // 不重置高度 (自定义mescroll组件时,此行不可删)
					vm.isDownLoading = false; // 不显示加载中
					vm.downText = mescroll.optDown.textInOffset; // 设置文本
				},
				outOffset(mescroll: any) {
					// 下拉的距离大于offset那一刻的回调
					vm.scrollAble = false; // 禁止下拉,避免抖动 (自定义mescroll组件时,此行不可删)
					vm.isDownReset = false; // 不重置高度 (自定义mescroll组件时,此行不可删)
					vm.isDownLoading = false; // 不显示加载中
					vm.downText = mescroll.optDown.textOutOffset; // 设置文本
				},
				onMoving(mescroll: any, rate: number, downHight: number) {
					// 下拉过程中的回调,滑动过程一直在执行; rate下拉区域当前高度与指定距离的比值(inOffset: rate<1; outOffset: rate>=1); downHight当前下拉区域的高度
					vm.downHight = downHight; // 设置下拉区域的高度 (自定义mescroll组件时,此行不可删)
					vm.downRotate = 'rotate(' + 360 * rate + 'deg)'; // 设置旋转角度
				},
				showLoading(mescroll: any, downHight: number) {
					// 显示下拉刷新进度的回调
					vm.scrollAble = true; // 开启下拉 (自定义mescroll组件时,此行不可删)
					vm.isDownReset = true; // 重置高度 (自定义mescroll组件时,此行不可删)
					vm.isDownLoading = true; // 显示加载中
					vm.downHight = downHight; // 设置下拉区域的高度 (自定义mescroll组件时,此行不可删)
					vm.downText = mescroll.optDown.textLoading; // 设置文本
				},
				endDownScroll(mescroll: any) {
					vm.scrollAble = true; // 开启下拉 (自定义mescroll组件时,此行不可删)
					vm.isDownReset = true; // 重置高度 (自定义mescroll组件时,此行不可删)
					vm.isDownLoading = false; // 不显示加载中
					vm.downHight = 0; // 设置下拉区域的高度 (自定义mescroll组件时,此行不可删)
				},
				// 派发下拉刷新的回调
				callback: function(mescroll: any) {
					vm.$emit('down', mescroll);
				}
			},
			// 上拉加载的配置
			up: {
				// 显示加载中的回调
				showLoading() {
					vm.isUpLoading = true;
					vm.isUpNoMore = false;
				},
				// 显示无更多数据的回调
				showNoMore() {
					vm.isUpLoading = false;
					vm.isUpNoMore = true;
				},
				// 隐藏上拉加载的回调
				hideUpScroll() {
					vm.isUpLoading = false;
					vm.isUpNoMore = false;
				},
				// 空布局
				empty: {
					onShow(isShow: boolean) {
						// 显示隐藏的回调
						vm.isShowEmpty = isShow;
					}
				},
				// 回到顶部
				toTop: {
					onShow(isShow: boolean) {
						// 显示隐藏的回调
						vm.isShowToTop = isShow;
					}
				},
				// 派发上拉加载的回调
				callback: function(mescroll: any) {
					vm.$emit('up', mescroll);
					// 更新容器的高度 (多mescroll的情况)
					vm.setClientHeight();
				}
			}
		};
		MeScroll.extend(diyOption, GlobalOption); // 混入全局的配置
		let myOption = JSON.parse(
			JSON.stringify({
				down: vm.down,
				up: vm.up
			})
		); // 深拷贝,避免对props的影响
		MeScroll.extend(myOption, diyOption); // 混入具体界面的配置
		// 初始化MeScroll对象
		vm.mescroll = new MeScroll(myOption);
		vm.mescroll.viewId = vm.viewId; // 附带id
		// init回调mescroll对象
		vm.$emit('init', vm.mescroll);

		// 设置高度
		uni.getSystemInfo({
			success(res: any) {
				if (res.windowTop) vm.windowTop = res.windowTop; // 修正app和H5的top值
				if (res.windowBottom) vm.windowBottom = res.windowBottom; // 修正app和H5的bottom值
				vm.mescroll.setBodyHeight(res.windowHeight); // 使down的bottomOffset生效
			}
		});
		// 因为使用的是scrollview,这里需自定义scrollTo
		vm.mescroll.resetScrollTo((y: number, t: number) => {
			let curY = vm.mescroll.getScrollTop();
			if (t === 0) {
				vm.scrollAnim = false;
				vm.scrollTop = curY;
				vm.$nextTick(function() {
					vm.scrollTop = y;
				});
			} else {
				vm.scrollAnim = true;
				vm.mescroll.getStep(
					curY,
					y,
					(step: any) => {
						// 此写法可支持配置t
						vm.scrollTop = step;
					},
					t
				);
			}
		});
	}
	mounted() {
		// 设置容器的高度
		this.setClientHeight();
	}
}
</script>

<style>
@import './mescroll-uni.css';
</style>
