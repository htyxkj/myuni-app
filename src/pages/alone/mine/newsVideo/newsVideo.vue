<template>
	<view>
		<scroll-view scroll-y class="page">
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
				<view class="cu-bar btn-group padding-left-xl padding-right-xl">
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
	import {Vue,Provide,Prop,Component,Watch} from 'vue-property-decorator';
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
		
		type_sid:any ="";
		
		mounted(){
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
		initData(type:any){
			console.log(type)
			this.type_sid = type;
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
				qe.cont = JSON.stringify( {father:father});
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
	.page {
		height: 100vh;
		background-color: #FFFFFF
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
</style>