<template>
	<view>
		<view  v-if="ifDefaultIndex">
			<cu-custom v-show="!isSpDeatilPage" bgColor="bg-gradual-pink" :isBack="false">
				<block slot="content"><view class="header-title">{{title}}</view></block>
			</cu-custom>
			<template v-if="loginState">
				<template v-if="tabcur==-1">
					<customize :menu="menubarr"></customize>
				</template>
				<template v-else-if="tabcur==0">
					<home ></home>
				</template>
				<template v-else-if="tabcur==1">
					<menuPage></menuPage>
				</template>
				<template v-else-if="tabcur==2">
					<bip-task @setShowBtn="setShowBtn"></bip-task>
				</template>
				<template v-else>
					<my></my>
				</template>
				<!-- <message v-if="tabcur==2"></message> -->
			</template>
			<mIndexBar v-if="ifDefaultIndex" v-show="!isSpDeatilPage" :tbI="tabcur" @tabSelect="tabSelect"></mIndexBar>
		</view>
		<bip-protocol v-if="showpp" :showTY="-1" :showpp="showpp" @AgreeToTerms="AgreeToTerms"></bip-protocol>
	</view>
</template>

<script lang="ts">
    import {Vue,Component} from 'vue-property-decorator';
	import home from './home.vue';
	import menuPage from '@/components/bip-comp/menu/menuPage.vue';
	import BipTask from '@/components/bip-comp/task/BipTask.vue';
	import my from '@/components/bip-comp/my/my.vue';
	import customize from '@/components/bip-comp/customize/Index.vue';
	import mIndexBar from '../../components/mIndexBar.vue'
	import {
		LoginModule
	} from '@/store/module/login'; //导入vuex模块，自动注入
	import {
		Tools
	} from '../../classes/tools/Tools';
	import comm from '@/static/js/comm.js';
	let commURL: any = comm;
	import {singIn} from '@/pages/index/singIn/singIn'
	import bipProtocol from '@/components/bip-ui/bip-protocol/bip-protocol.vue';
	import QueryEntity from '@/classes/search/QueryEntity';
	import {BIPUtil} from '@/classes/api/request';
	let tools = BIPUtil.ServApi;
	@Component({
		components:{home,my,menuPage,mIndexBar,customize,BipTask,bipProtocol}
	})
	export default class Index extends Vue{
		title:string = '首页'
		tabcur:number = 0
		tabcurColor:string = 'text-green'
		vueId: string = Tools.guid()
		
		menubarr:any=null

		olOption:any = null;
		ifDefaultIndex:boolean = false;//是否显示首页

		isSpDeatilPage:boolean = false;
		showpp:boolean = false;//显示隐私政策 服务协议

		options:any = null;

		server_version:any=null;//版本号
		upd_type:any=null;//更新类型
		
		onLoad(options:any) {
			//#ifdef APP-PLUS
				// let value = uni.getStorageSync('AgreeToTerms');
				// if(!value){
				// 	this.showpp=true;
				// 	return;
				// }
			//#endif
			this.options = options
			this._onLoad();
		}
		_onLoad(){
			this.showpp=false;
			let options:any = this.options;
			if(commURL && commURL.ItemType && commURL.ItemType == 'mine'){
				uni.reLaunch({
					'url': '/pages/alone/mine/index/index'
				})
				return;
			}else{
				if(!this.loginState || options.corpId){
					singIn.ServApi.init(options,this.loginOk,this.loginFailure);
				}
				this.olOption = options
				this.ifDefaultIndex = true;
			}
		}

		//同意隐私条款
		AgreeToTerms(){
			this._onLoad();
		}
		/**
		 * 页面显示
		 */
		async onShow(){
			//#ifdef APP-PLUS
			if(this.loginState){
				uni.getSystemInfo({
					success:(res) => {
						//检测当前平台，如果是安卓则启动安卓更新  
						if(res.platform=="android"){
							console.log(res.platform)
							this.AndroidCheckUpdate();  
						}  
					}  
				})
			}
			//#endif
		}
		/**
		 * 安卓应用的检测更新实现
		 */
		async AndroidCheckUpdate(){ 
			let reminderInterval = 3600
			let qe:QueryEntity = new QueryEntity('','');
			let vv:any = await tools.getBipInsAidInfo('UNIAPPVERSION',300,qe);
			if( vv && vv.data.id ==0){
				let val = vv.data.data.data.values;
				for(var i=0;i<val.length;i++){
					if(val[i].code == "version"){
						this.server_version  = val[i].name
					}else if(val[i].code == "reminderInterval"){
						reminderInterval  = parseInt(val[i].name)
					}else if(val[i].code == "type"){
						this.upd_type = val[i].name
					}
				}
			}
			if(this.server_version == commURL.version){
				return;
			}
			let _this = this;

			let currTimeStamp = new Date().getTime()/1000
			// 判断缓存时间
			uni.getStorage({
				key: 'tip_version_update_time',
				success: function (res) {
					var lastTimeStamp = res.data;
					//定义提醒的时间间隔，避免烦人的一直提示，一个小时：3600；一天：86400
					if((currTimeStamp - lastTimeStamp) < reminderInterval){
						//避免多次提醒，不要更新
					}else{
						//重新设置时间戳
						_this.setStorageForAppVersion(currTimeStamp);
						//进行版本型号的比对 以及下载更新请求
						_this.checkVersionToLoadUpdate();
					}
				},
				fail:function(res){
					_this.setStorageForAppVersion(currTimeStamp);
				}
			});
		}
		/**
		 * //设置应用版本号对应的缓存信息
		 * @param {Object} currTimeStamp 当前获取的时间戳
		 */
		setStorageForAppVersion(currTimeStamp:any){
			uni.setStorage({
				key: 'tip_version_update_time',
				data: currTimeStamp,
				success: function () {
					console.log('setStorage-success');
				}
			});
		}
		/**
		 * 进行版本型号的比对 以及下载更新请求
		 * @param {Object} server_version 服务器最新 应用版本号
		 * @param {Object} curr_version 当前应用版本号
		 */
		checkVersionToLoadUpdate(){
			let server_version = this.server_version;
			let _this = this;
			let curr_version = commURL.version;
			if(server_version > curr_version){
				uni.showModal({
					title: "版本更新",
					// content: '有新的版本发布，检测到您当前为Wifi连接，是否立即进行新版本下载？',
					content: '有新的版本发布，是否立即进行新版本下载？',
					confirmText:'立即更新',
					cancelText:'稍后进行',
					success: function (res) {
						if (res.confirm) {
							uni.showToast({
								icon:"none",
								mask: true,
								// title: '有新的版本发布，检测到您目前为Wifi连接，程序已启动自动更新。新版本下载完成后将自动弹出安装程序',  
								title: '有新的版本发布，程序已启动自动更新。新版本下载完成后将自动弹出安装程序',  
								duration: 5000,  
							}); 
							//设置 最新版本apk的下载链接
							if(_this.upd_type == null || _this.upd_type == 'apk'){
								var downloadApkUrl = commURL.BaseUri+"/apk/android.apk";
								var dtask = plus.downloader.createDownload( downloadApkUrl, {}, function ( d:any, status ) {  
										// 下载完成 
										if ( status == 200 ) {   
											uni.showToast({
												icon:"none",
												mask: true,
												// title: '有新的版本发布，检测到您目前为Wifi连接，程序已启动自动更新。新版本下载完成后将自动弹出安装程序',  
												title: '安装程序下载完成，安装中...',  
												duration: 3000,  
											}); 
											let dir: any = plus.io.convertLocalFileSystemURL(d.filename);
											plus.runtime.install(dir,{force:true},function(error){ 
												// uni.showToast({  
												// 	title: '安装失败', 
												// 	icon:"none",
												// 	mask: true,
												// 	duration: 5000  
												// });  
											})
										} else {  
											uni.showToast({  
												title: '更新失败',
												icon:"none",
												duration: 1500  
											});  
										}    
									});  
								dtask.start();
							}else if(_this.upd_type =='wgt'){
								var downloadApkUrl = commURL.BaseUri+"apk/android.wgt";
								uni.downloadFile({
									url: downloadApkUrl,
									success: (res) => {
										if (res.statusCode === 200) {
											let path:any = res.tempFilePath;
											plus.nativeUI.showWaiting("安装更新文件...");
											plus.runtime.install(path, {}, function() {
												plus.nativeUI.closeWaiting();
												plus.nativeUI.alert("应用资源更新完成！", function() {
													plus.runtime.restart();
												});
											}, function(e) {
												plus.nativeUI.closeWaiting();
												plus.nativeUI.alert("安装更新文件失败[" + e.code + "]：" + e.message);
												if (e.code == 10) {
													// alert('请清除临时目录');
												}
											});
										}else{
											console.log("??"+res.statusCode)
										}
									},
									fail: (res) => {
										plus.nativeUI.alert("下载失败！");
									}
								});
							}
						} else if (res.cancel) {
							console.log('稍后更新');
						}
					}
				});
			}
		}


		//登录成功
		loginOk(){
			if(commURL.ItemType == 'mine'){
				uni.reLaunch({
					'url': '/pages/alone/mine/index/index'
				})
				return;
			}
			if(this.olOption.tabcur){
				this.tabcur = this.olOption.tabcur;
			}
			this.title = this.makeTitle(this.tabcur)
		}
		//登录失败
		loginFailure(){
			if(!this.loginState){
				uni.reLaunch({'url':'/pages/login/login'})
				return;
			}else{
				uni.reLaunch({'url':'/pages/login/login'})
				// if(commURL.ItemType == 'mine'){
				// 	uni.reLaunch({
				// 		'url': '/pages/alone/mine/index/index'
				// 	})
				// 	return;
				// }
			}
		}
		
		tabSelect(e:any){
			this.tabcur = e[0];
			this.menubarr = e[1]
			this.title = this.makeTitle(parseInt(this.menubarr.url))
		}
		
		/**
		 * 根据导航设置首页标题
		 * @param {number} index 
		 */
		makeTitle(index:number){
			let tt = '首页';
			switch (index){
				case 1:
					tt = '菜单';
					break;
				case 2:
					tt = '消息中心';
					break;
				case 3:
					tt = '我';
					break;
				default:
				tt = '首页'
					break;
			}
			return tt;
		}
		
		get loginState(){
			let v = LoginModule.loginState
			if(!v){
				let value = uni.getStorageSync('isLogin');
				if(value){
					LoginModule.setState(true)
					let _user = uni.getStorageSync('user');
					if(_user){
						let user = JSON.parse(_user)
						LoginModule.setUser(user)
					}
					let _ms = uni.getStorageSync('menus');
					if(_ms){
						let ms = JSON.parse(_ms)
						LoginModule.setMenus(ms)
					}
					let snkey = uni.getStorageSync('snkey')
					LoginModule.setSnKey(snkey)
					v = true;
				}
			}
			return v;
		}
		//消息中心  点击详情隐藏头部标题底部按钮
		setShowBtn(res:any){
			this.isSpDeatilPage = res;
		}
	}
</script>

<style lang="scss">
	page {
	    margin-bottom: 0 !important;
	}
	.cu-bar.tabbar .action [class*="cuIcon-"] {
		margin: 0 auto 8rpx !important;		
	}
</style>
