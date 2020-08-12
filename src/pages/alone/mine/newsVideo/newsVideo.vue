<template>
	<view>
		<view class="cu-bar search my-top-bar">
			<view class="cu-avatar round" style="background-image:url(https://ossweb-img.qq.com/images/lol/web201310/skin/big11010.jpg"></view>
			<view class="search-form round">
				<text class="cuIcon-search"></text>
				<input :adjust-position="false" type="text" placeholder="搜索文章、视频" confirm-type="search"></input>
			</view>
			<view class="action">
				<text>我的</text>
			</view>
		</view>

		<view v-if="type == 0">
			<scroll-view scroll-x class="mytypeTbs nav text-center">
				<view class="cu-item" :class="index==newsTabCur?'selTbs':''" v-for="(item,index) in newsTypeArr" :key="index" @tap="newsTabSelect" :data-id="index" :data-sid="item.sid">
					{{item.name}}
				</view>
			</scroll-view> 
			<view class="cu-bar btn-group padding-left-xl padding-right-xl" v-if="newsChileTypeArr.length>0">
				<button class="cu-btn bg-blue shadow-blur" :class="type_sid==item.sid?'selbtn':'noSelbtn'" v-for="(item,index) in newsChileTypeArr" :key="index" @tap="initData(item.sid)">
					{{item.name}}
				</button>
			</view>
		</view>
		<view v-if="type == 1">
			<scroll-view scroll-x class="mytypeTbs nav text-center">
				<view class="cu-item" :class="index==videoTabCur?'selTbs':''" v-for="(item,index) in videoTypeArr" :key="index" @tap="videoTabSelect" :data-id="index" :data-sid="item.sid">
					{{item.name}}
				</view>
			</scroll-view>
		</view>
		<scroll-view scroll-y class="page">
			<view v-for="(item,index) in articleData" :key="item.sid" class="solid-bottom">
				<template v-if="item.img.length>0 || (item.img.length == 0 && item.video.length == 0 )">
					<template v-if="item.img.length>=3">
						<view class="grid text-center col-3 padding-left padding-right">
							<view  v-for="(img,index) in item.img " :key="index" >
								<image mode="aspectFit" class="listImg1" :src="img"></image>
							</view>
						</view>
						<view class="flex justify-start">
							<view class="padding-top-sm padding-left">
								<view>
									<view><h4>{{item.title}}</h4></view>
									<view class="text-gray text-sm">
										<view class="flex justify-start">
											<view>{{item.smakename}}</view>
											<view class="padding-left-xl">{{item.mkdate}}</view>
										</view>
									</view>
								</view>
							</view>
						</view>
					</template>
					<template v-if="item.img.length<3">
						<view class="flex justify-start">
							<view class="padding-sm margin-xs">
								<view>
									<view><h4>{{item.title}}</h4></view>
									<view style="height: 40upx;"></view>
									<view class="text-gray text-sm">
										<view class="flex justify-start">
											<view>{{item.smakename}}</view>
											<view class="padding-left-xl">{{item.mkdate}}</view>
										</view>
									</view>
								</view>
							</view>
							<view class="padding-sm margin-xs" v-if="item.img.length>0">
								<view class="cu-avatar listImg1" :style="'background-image:url('+item.img[0]+');'"></view>
							</view>
						</view>
					</template>
				</template>
				<template v-else-if="item.video.length>0">
					
				</template>
			</view>
			<view style="height: 8vh;"></view>
		</scroll-view>
	</view>
</template>

<script lang="ts">
	/**
	 * 张矿微平台移动端新闻视频
	 */
	import {BIPUtil} from '@/classes/api/request';
	let tools = BIPUtil.ServApi;
	import QueryEntity from '@/classes/search/QueryEntity';
	import QueryCont from '@/classes/search/QueryCont';
	import PageInfo from '@/classes/search/PageInfo';
	import {Vue,Provide,Prop,Component,Watch} from 'vue-property-decorator';
	import moment from 'moment'
	import { GlobalVariable } from '@/classes/tools/ICL';
	import comm from '@/static/js/comm.js';
	let commURL: any = comm;
	import {LoginModule} from '@/store/module/login'; //导入vuex模块，自动注入
	@Component({
		
	})
	export default class NewsVideo extends Vue {
		@Prop({ default:0, type:Number }) type!:number;//类型 0：新闻；1：视频
		newsTabCur:any = 0;
		newsTypeArr:Array<any>=[];//新闻类别
		newsChileTypeArr:Array<any>=[];//新闻子类别

		videoTabCur:any = 0;
		videoTypeArr:Array<any>=[];//视频类别
		videoChileTypeArr:Array<any>=[];//视频子类别
		key:any = "NVKEY_";
		type_sid:any ="";//当前选中类型
		qe:QueryEntity = new QueryEntity('','');
		page:PageInfo = new PageInfo();	
		articleData:Array<any> = [];

		uri:any ="";//
		snkey:any = "";//
		mounted(){
			this.uri = commURL.BaseUri+''+GlobalVariable.API_UPD
			this.snkey = LoginModule.snkey
			this.initType();
		}
		//新闻类别切换
		async newsTabSelect(e:any){
			this.newsTabCur = e.currentTarget.dataset.id;
			let sid = e.currentTarget.dataset.sid;
			let dd = await this.getTypeByFather(sid);
			this.newsChileTypeArr = dd;
			let _sid = null;
			if(dd.length == 0){
				_sid = sid;
			}else{
				_sid = dd[0].sid;
			}
			this.initData(_sid);
		}
		//视频类别切换
		async videoTabSelect(e:any){
			this.videoTabCur = e.currentTarget.dataset.id;
			let sid = e.currentTarget.dataset.sid;
			let dd = await this.getTypeByFather(sid);
			this.videoChileTypeArr = dd;
			let _sid = null;
			if(dd.length == 0){
				_sid = sid;
			}else{
				_sid = dd[0].sid;
			}
			this.initData(_sid);
		}

		//查询类别
		async initType(){
			if(this.type == 0){ //0：新闻
				let type= await this.getTypeByFather('LX20080013');
				this.newsTypeArr = type;
				if(this.newsTypeArr.length>0){
					let e = {currentTarget:{dataset:{sid:this.newsTypeArr[0].sid,id:0}}}
					this.newsTabSelect(e)
				}
			}else if(this.type == 1){//1：视频
				let type= await this.getTypeByFather('LX20080003');
				this.videoTypeArr = type;
				if(this.videoTypeArr.length>0){
					let e = {currentTarget:{dataset:{sid:this.videoTypeArr[0].sid,id:0}}}
					this.videoTabSelect(e)
				}
			}
		}
		/**
		 * 根据分类编码查询数据
		 */
		async initData(type:any){
			if(this.type_sid == type)
				return;
			if(type)
				this.type_sid = type;
			this.articleData = [];
			this.qe.page = new PageInfo();
			let oneCont = []; 
			let qCont = new QueryCont('type',this.type_sid,12);
			qCont.setContrast(0);
			oneCont.push(qCont);
			this.qe.cont = "~["+JSON.stringify(oneCont)+"]"
			let vv = await tools.getBipInsAidInfo('ALLARTICLEL',210,this.qe);
			if(vv.data.id ==0){
				let cc = vv.data.data.data.values;
				this.page = vv.data.data.data.page;
				for(let i=0;i<cc.length;i++){
					let j1:any = {sid:"",title:"",description:"",smakename:"",mkdate:"",img:[],video:[]};
					let d1 = cc[i];
					j1.title = d1.title;
					j1.description = d1.description;
					j1.smakename = d1.smakename;
					j1.sid = d1.sid;
					j1.mkdate = moment(d1.mkdate).format('YYYY-MM-DD')
					let fjn = d1.fj_name;
					let fjroot = d1.fj_root;
					if(fjn){
						let nameArr = fjn.split(";");
						for(var j=0;j<nameArr.length;j++){
							let name =nameArr[j].toLowerCase();
							let url = this.uri+'?snkey='+this.snkey+'&fjroot='+fjroot+'&updid=36&fjname='+nameArr[j];
							var imgReg = /\.(png|jpg|gif|jpeg|webp|tiff|psd)$/; //图片名为汉字的也可以匹配到
							let isImg:boolean = imgReg.test(name); //返回true ,false
							if(isImg){
								j1.img.push(url);
							}
							var videoReg = /\.(mp4|flv|m3u8|rtmp|hls|rtsp)$/;
							let isVideo:boolean = videoReg.test(name);
							if(isVideo){
								j1.video.push(url);
							}
						}
					}
					this.articleData.push(j1)
				}
			}
		}
		
		/**
		 * 滑动到底部 查询下一页
		 */
		async getNextPage(){
			this.page.currPage++;
			this.qe.page = this.page;
			let oneCont = []; 
			let qCont = new QueryCont('type',this.type_sid,12);
			qCont.setContrast(0);
			oneCont.push(qCont);
			this.qe.cont = "~["+JSON.stringify(oneCont)+"]"
			let vv = await tools.getBipInsAidInfo('ALLARTICLEL',210,this.qe);
			if(vv.data.id ==0){
				let cc = vv.data.data.data.values;
				this.page = vv.data.data.data.page;
			}
			console.log(vv)
		}
		
		
		/**
		 * 根据父级分类编码 查询分类
		 */
		async getTypeByFather(father:any){
			var _key:any = this.key+''+father;
			let data = uni.getStorageSync(_key);
			if(data){
				let dd = JSON.parse(data);
				return dd;
			}else{
				let qe:QueryEntity = new QueryEntity('','');
				qe.page.currPage = 1;
				qe.page.pageSize = 100; 
				let oneCont = []; 
				let qCont = new QueryCont('father',father,12);
				qCont.setContrast(0);
				oneCont.push(qCont);
				qe.cont = "~["+JSON.stringify(oneCont)+"]"
				let vv = await tools.getBipInsAidInfo('ARTICLETYPE',210,qe);
				if(vv.data.id ==0){
					let cc = vv.data.data.data.values;
					uni.setStorageSync(_key, JSON.stringify(cc));
					return cc;
				}else{
					console.log(vv)
				}
			}
			return [];
		}
		@Watch("type")
		typeChange(){
			this.initType();
		}
	}
</script>
<style scoped>
	uni-page-body{
		background-color: #FFFFFF
	}
	.page {
		height: 78vh;
	}
	.myBtn{
		position: absolute;
		right: 0px;
		margin: auto;
		height: 30px;
		font-size: 16px;
		line-height: 30px;
	}
	.myimg{
		width: 200upx;
		height: 60upx;
	}
	.mytypeTbs{
		background-color: #FEEEEF;
		font-size: 16px;
		font-weight: 540;
	}
	.selTbs{
		color: #EF1823;
	}
	.my-top-bar{
		background-color: #ED1B24;
	}

	.selbtn{
		background-color: #ED1B24;
		color: #FFFFFF;
		font-size: 12px;
		height: 28px;
		transform: none;
	}
	.noSelbtn{
		background-color: #F9F9F9;
		color: #858585;
		font-size: 12px;
		height: 28px;
		transform: none;
	}
	.listImg1{
		width: 220upx;
		height: 164upx;
	}
</style>