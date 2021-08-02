<script lang="ts">
    import Vue from 'vue';	
	import comm from '@/static/js/comm.js';
	let commURL: any = comm;
    export default Vue.extend({
        mpType: 'app',
        onLaunch() {
			if(window && window.location && window.location.href){
				uni.setStorageSync("location.href",window.location.href.split("#")[0]);
			}
            uni.getSystemInfo({
				success:function(e:any){
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
					Vue.prototype.Custom = custom;
					Vue.prototype.CustomBar = custom.bottom + custom.top - e.statusBarHeight;
					// #endif		
					// #ifdef MP-ALIPAY
					Vue.prototype.StatusBar = e.statusBarHeight;
					Vue.prototype.CustomBar = e.statusBarHeight + e.titleBarHeight;
					// #endif
				}
			})
        },
        onShow() {
            console.log('App Show')
        },
        onHide() {
            console.log('App Hide')
			//#ifdef APP-PLUS
			if(commURL.ItemType == 'Breeding'){
				/**
				 * 芯联手持设备  发送系统广播进行下电操作
				 */
				var Intent:any = plus.android.importClass("android.content.Intent");  
				var intent:any = new Intent("android.intent.action.SETTINGS_BJ");   
				var main:any = plus.android.runtimeMainActivity();  
				intent.putExtra("enable", false);  
				main.sendBroadcast(intent);
			}
			//#endif
        }
    });
</script>

<style>
    /*每个页面公共css */
	/* #ifndef APP-PLUS-NVUE */
		@import url("./lib/colorui/main.css");
		@import url("./lib/colorui/icon.css");
	/* #endif */
</style>
