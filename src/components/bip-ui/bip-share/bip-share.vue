<template>
	<view class="uni-share">
		<view class="uni-share-title">分享到</view>
		<view class="uni-share-content">
			<view v-for="(item, index) in arrdata" :key="index" class="uni-share-content-box" @tap.prevent="itemClick(index)">
				<view class="uni-share-content-image"><image :src="item.icon" class="image" /></view>
				<view class="uni-share-content-text">{{ item.text }}</view>
			</view>
		</view>
		<view class="uni-share-btn bg-yellow text-white sm" @click="close">取消分享</view>
	</view>
</template>
<script lang="ts">
import { Vue, Provide, Prop, Component } from 'vue-property-decorator';
@Component({
	components: {}
})
export default class bipShare extends Vue {
	@Prop({ type: Array, default: [] }) arrdata!: Array<any>;
	itemClick(index: number) {
		this.$emit('itemClick', index);
		// this.bottomData = [{
		//           text: '微信',
		//           icon: 'https://img-cdn-qiniu.dcloud.net.cn/uni-ui/grid-2.png',
		//           name: 'wx'
		//         },
		//         {
		//           text: '支付宝',
		//           icon: 'https://img-cdn-qiniu.dcloud.net.cn/uni-ui/grid-8.png',
		//           name: 'wx'
		//         },
		//         {
		//           text: 'QQ',
		//           icon: 'https://img-cdn-qiniu.dcloud.net.cn/uni-ui/gird-3.png',
		//           name: 'qq'
		//         },
		//         {
		//           text: '新浪',
		//           icon: 'https://img-cdn-qiniu.dcloud.net.cn/uni-ui/grid-1.png',
		//           name: 'sina'
		//         },
		//         {
		//           text: '百度',
		//           icon: 'https://img-cdn-qiniu.dcloud.net.cn/uni-ui/grid-7.png',
		//           name: 'copy'
		//         },
		//         {
		//           text: '其他',
		//           icon: 'https://img-cdn-qiniu.dcloud.net.cn/uni-ui/grid-5.png',
		//           name: 'more'
		//         }
		//       ]
	}
	close() {
		this.$emit('close');
	}
}
</script>

<style lang="scss" scoped>
/* 底部分享 */
.uni-share {
	background: #fff;
}

.uni-share-title {
	line-height: 60upx;
	font-size: 24upx;
	padding: 15upx 0;
	text-align: center;
}

.uni-share-content {
	display: flex;
	flex-wrap: wrap;
	padding: 15px;
}

.uni-share-content-box {
	display: flex;
	flex-direction: column;
	align-items: center;
	width: 25%;
	box-sizing: border-box;
}

.uni-share-content-image {
	display: flex;
	justify-content: center;
	align-items: center;
	width: 60upx;
	height: 60upx;
	overflow: hidden;
	border-radius: 10upx;
}

.uni-share-content-image .image {
	width: 100%;
	height: 100%;
}

.uni-share-content-text {
	font-size: 26upx;
	color: #333;
	padding-top: 5px;
	padding-bottom: 10px;
}

.uni-share-btn {
	height: 90upx;
	line-height: 90upx;
	border-top: 1px #f5f5f5 solid;
	text-align: center;
	color: #666;
}
</style>
