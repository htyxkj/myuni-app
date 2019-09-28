<script lang="ts">
	/// <reference path="./main.d.ts" />
	import Vue from 'vue'
	export default Vue.extend({
		mpType: 'app',
		onLaunch() {
			// console.log('App 121')
			uni.getSystemInfo({
				success: function(e:any) {
					// #ifndef MP
					Vue.prototype.StatusBar = e.statusBarHeight;
					if (e.platform == 'android') {
						Vue.prototype.CustomBar = e.statusBarHeight + 50;
					} else {
						Vue.prototype.CustomBar = e.statusBarHeight + 45;
					};
					// #endif
					
					// #ifdef MP-WEIXIN
					Vue.prototype.StatusBar = e.statusBarHeight;
					let custom = wx.getMenuButtonBoundingClientRect();
					// console.log(custom,9999)
					Vue.prototype.Custom = custom;
					Vue.prototype.CustomBar = custom.bottom + custom.top - e.statusBarHeight;
					// #endif		
					
					// #ifdef MP-ALIPAY
					Vue.prototype.StatusBar = e.statusBarHeight;
					Vue.prototype.CustomBar = e.statusBarHeight + e.titleBarHeight;
					// #endif
				},
			});
		},
		onShow() {
			console.log('App Show')
		},
		onHide() {
			console.log('App Hide')
		}
	})
</script>

<style lang="scss">
	/*每个页面公共css */
	@import "./lib/colorui/main.css";
	@import "./lib/colorui/icon.css";
	@import "./uni.scss";
</style>
