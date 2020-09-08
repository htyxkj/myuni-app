<template>
	<view>
		<template v-if="loginState">
			<news-video :type="tabcur" v-if="tabcur == 0 || tabcur == 1 "></news-video>
			<learning v-if="tabcur == 2"></learning>
			<ask-answer v-if="tabcur == 3"></ask-answer>
			<exam v-if="tabcur == 4"></exam>
		</template>
		<mIndexBar :tbI="tabcur" @tabSelect="tabSelect"></mIndexBar>
	</view>
</template>

<script lang="ts">
    import {Vue,Component} from 'vue-property-decorator';	
	import newsVideo from '../newsVideo/newsVideo.vue'//新闻视频
	import learning from '../learning/learning.vue';//学习园地
	import askAnswer from '../askAnswer/askAnswer.vue';//你问我答
	import exam from '../exam/exam.vue';//答题考试
	import mIndexBar from '../menuBar/mIndexBar.vue';//底部菜单
	import {LoginModule} from '@/store/module/login'; //导入vuex模块，自动注入
	import {Tools} from '../../../../classes/tools/Tools';
	@Component({
		components:{learning,mIndexBar,newsVideo,askAnswer,exam}
	})
	export default class Index extends Vue{
		tabcur:number = 0
		onLoad(options:any) {
			if(!this.loginState){
				uni.navigateTo({'url':'/pages/login/login'})
				return;
			}
			if(options.tabcur){
				this.tabcur = options.tabcur;
			}
		}
		tabSelect(e:any){
			this.tabcur = e[0];
		}
		get loginState(){
			let v = LoginModule.loginState
			if(!v){
				let value = uni.getStorageSync('isLogin');
				if(value){
					LoginModule.setState(true)
					let user = JSON.parse(uni.getStorageSync('user'))
					LoginModule.setUser(user)
					let ms = JSON.parse(uni.getStorageSync('menus'))
					LoginModule.setMenus(ms)
					let snkey = uni.getStorageSync('snkey')
					LoginModule.setSnKey(snkey)
					return true;
				}
			}
			return v;
		}
	}
</script>

<style lang="scss">
	.cu-bar.tabbar .action [class*="cuIcon-"] {
		margin: 0 auto 8rpx !important;		
	}
</style>
