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
	import {BIPUtil} from '@/classes/api/request';
	let tools = BIPUtil.ServApi;
	import User from '@/classes/User';
	import QueryEntity from '@/classes/search/QueryEntity';
	import comm from '@/static/js/comm.js';
	let commURL: any = comm;
	import {BipMenuBtn} from '@/classes/BipMenuBtn'
	@Component({
		components:{learning,mIndexBar,newsVideo,askAnswer,exam}
	})
	export default class Index extends Vue{
		server_version:any=null;
		tabcur:number = 0
		async onLoad(options:any) {
			if(!this.loginState){
				// uni.reLaunch({'url':'/pages/login/login'})
				// 以游客身份登陆
				await this.touristLogin();
				return;
			}
			let btn1 = new BipMenuBtn("DLG","登陆积分")
			btn1.setDlgType("D")
			btn1.setDlgCont("mine.serv.ExamServlet*203;0;0");//修改文章浏览量
			let b = JSON.stringify(btn1)
			let prarm = {"type":"login"}
			let v = JSON.stringify(prarm);
			let vv:any =await tools.getDlgRunClass(v,b);
			if(vv && vv.data && vv.data.id ==-2){
				this.touristLogin();
			}
			if(options.tabcur){
				this.tabcur = options.tabcur;
			}
		}
		/**
		 * 页面显示
		 */
		onShow(){
			uni.getSystemInfo({
			    success:(res) => {
			        //检测当前平台，如果是安卓则启动安卓更新  
			        if(res.platform=="android"){  
			            this.AndroidCheckUpdate();  
			        }  
			    }  
			})
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


		/**
		 * 登录系统
		 */
		loginSys(user:any=null) {
			if (!user.userCode) {
				uni.showToast({
					title: '请输入账号密码',
					icon:"none"
				})
				return;
			} else {
				tools.loginWithOutPwd(user.userCode,{}).then((res: any) => {
					let data = res.data
					if (data && data.id != -1) {
						let _u = data.data.user
						LoginModule.setState(true) 
						LoginModule.setSnKey(data.data.snkey)
						LoginModule.setUser(_u)
						LoginModule.setState(true)
					} else {
						uni.showToast({
							title: data.message,
							icon:"none"
						})
					}
				}).catch((err: any) => {
					console.log(JSON.stringify(err))
					uni.showToast({
						title: '链接服务失败',
						icon:"none"
					})
				});
			}
		}
		/**
		 * 张矿微平台 游客登陆
		 */
		touristLogin(){
			let user: User = new User('portal', '', '')
			let u = LoginModule.user;
			if(u && u.userCode && u.userCode != user.userCode){
				user.userCode = u.userCode;
				uni.setStorageSync('userType','Official');
			}else{
				uni.setStorageSync('userType','Tourist')
			}
			this.loginSys(user);
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
			let curr_version = commURL.version;
			if(server_version > curr_version){
				//TODO 此处判断是否为 WIFI连接状态
				// if(plus.networkinfo.getCurrentType()!=3){
				// 	uni.showToast({  
				// 		title: '有新的版本发布，检测到您目前非Wifi连接，为节约您的流量，程序已停止自动更新，将在您连接WIFI之后重新检测更新',  
				// 		mask: true,  
				// 		duration: 5000,
				// 		icon:"none"
				// 	});  
				// 	return;  
				// }else{
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
								var downloadApkUrl = commURL.BaseUri+"/apk/apk.apk";
								var dtask = plus.downloader.createDownload( downloadApkUrl, {}, function ( d, status ) {  
										// 下载完成 
										if ( status == 200 ) {   
											plus.runtime.install(plus.io.convertLocalFileSystemURL(d.filename),{force:true},function(error){ 
												// uni.showToast({  
												// 	title: '安装失败', 
												// 	icon:"none",
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
							} else if (res.cancel) {
								console.log('稍后更新');
							}
						}
					});
				// }
			}
		}
	}
</script>

<style lang="scss">
	.cu-bar.tabbar .action [class*="cuIcon-"] {
		margin: 0 auto 8rpx !important;		
	}
</style>
