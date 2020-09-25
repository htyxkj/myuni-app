<template>
	<view>
		<cu-custom bgColor="bg-zk-top" :isBack="true">
			<block slot="content"><view class="header-title">{{title}}</view></block>
		</cu-custom>
		<template v-if="type_sid">
			<data-list :type_sid="type_sid" :type="2" :isrecommend="0"></data-list>
		</template>
	</view>
</template>

<script lang="ts">
	/**
	 * 张矿微平台移动端学习园地
	 */
	import {Vue,Provide,Prop,Component} from 'vue-property-decorator';
	import dataList from '../components/dataList.vue';
	@Component({
		components:{dataList}
	})
	export default class LearningList extends Vue {
		type_sid:any = null//当前选中类型
		title:any = "";
		onLoad(e:any) {
			this.type_sid = e.sid
			this.title = e.name
		}
	}
</script>
<style scoped>
	uni-page-body{
		background-color: #FFFFFF
	}
	.page {
		height: 93vh;
	}
	.listImg1{
		width: 220upx;
		height: 164upx;
	}
</style>