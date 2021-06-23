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
	import QueryCont from '@/classes/search/QueryCont';
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
			// await this.loginIntegral();
			if(options.tabcur){
				this.tabcur = options.tabcur;
			}
		}
		/**
		 * 页面显示
		 */
		async onShow(){
			await this.loginIntegral();
			//#ifdef APP-PLUS
			uni.getSystemInfo({
			    success:(res) => {
			        //检测当前平台，如果是安卓则启动安卓更新  
			        if(res.platform=="android"){
						Tools.AndroidCheckUpdate();  
			        }  
			    }  
			})
			//#endif
			this.initGray();
		}
		async tabSelect(e:any){
			this.tabcur = e[0];
			// await this.loginIntegral();
		}
		get loginState(){
			let v = LoginModule.loginState
			if(!v){
				let value = uni.getStorageSync('isLogin');
				if(value){
					LoginModule.setState(true)
					let user = JSON.parse(uni.getStorageSync('user'))
					LoginModule.setUser(user)
					let menus = uni.getStorageSync('menus')
					if(menus){
						let ms = JSON.parse(menus)
						LoginModule.setMenus(ms)
					}
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
		async loginSys(user:any=null) {
			if (!user.userCode) {
				uni.showToast({
					title: '请输入账号密码',
					icon:"none"
				})
				return;
			} else {
				await tools.loginWithOutPwd(user.userCode,{}).then((res: any) => {
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
		async touristLogin(){
			let user: User = new User('portal', '', '')
			let u = LoginModule.user;
			if(u && u.userCode && u.userCode != user.userCode){
				user.userCode = u.userCode;
				uni.setStorageSync('userType','Official');
			}else{
				uni.setStorageSync('userType','Tourist')
			}
			await this.loginSys(user);
		}
	
		async loginIntegral(bl:any=true){
			let btn1 = new BipMenuBtn("DLG","登陆积分")
			btn1.setDlgType("D")
			btn1.setDlgCont("mine.serv.ExamServlet*203;0;0");//修改文章浏览量
			let b = JSON.stringify(btn1)
			let prarm = {"type":"login"}
			let v = JSON.stringify(prarm);
			let vv:any =await tools.getDlgRunClass(v,b);
			if(vv && vv.data && vv.data.id ==-2){
				await this.touristLogin();
				if(bl)
				this.loginIntegral(false)
			}
		}


		/**
		 * 查询是否是置灰效果
		 */
		async initGray(){
			let qe:QueryEntity = new QueryEntity('','');
			let qcont:QueryCont = new QueryCont("type",'gray',12);//查询条件
			qcont.setContrast(0)
			qe.cont = '~[['+JSON.stringify(qcont)+']]';
			let vv:any = await tools.getBipInsAidInfo('GETPF',210,qe);
			if(vv.data.id ==0){
				let vl = vv.data.data.data.values;
				if(vl.length>0){
					var elem:any=document.getElementsByTagName("body")[0];
					if(vl[0].state == '1'){
						// elem.style.overflow = 'hidden';
						// elem.style.filter = 'grayscale(100%)';
					}else{
						// elem.style.filter = 'grayscale(0%)';
					}
				}
			}
		}
	}
</script>

<style lang="scss">
	.cu-bar.tabbar .action [class*="cuIcon-"] {
		margin: 0 auto 8rpx !important;		
	}
</style>
