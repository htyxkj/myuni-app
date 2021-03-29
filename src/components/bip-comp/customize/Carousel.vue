<template>
	<view>
		<!-- 全屏限高 -->
		<template v-if="type == '0'">
			<swiper class="screen-swiper square-dot"  :indicator-dots="true" :circular="true"
			 :autoplay="true" interval="5000" duration="500">
				<swiper-item v-for="(item,index) in swiperList" :key="index"  @tap.stop="openMenu(item.menu,index)">
					<image :src="item.url" mode="scaleToFill" v-if="item.type=='image'"></image>					
				</swiper-item>
			</swiper>
		</template>
		
		<!-- 卡片式 -->
		<template v-if="type == '1'">
			<swiper class="card-swiper square-dot" :indicator-dots="true" :circular="true"
			 :autoplay="true" interval="5000" duration="500" @change="cardSwiper" indicator-color="#8799a3"
			 indicator-active-color="#0081ff">
				<swiper-item v-for="(item,index) in swiperList" :key="index" :class="cardCur==index?'cur':''"   @tap.stop="openMenu(item.menu,index)">
					<view class="swiper-item">
						<image :src="item.url" mode="scaleToFill" v-if="item.type=='image'"></image>
					</view>
				</swiper-item>
			</swiper>
		</template>
		<!-- 堆叠式 -->
		<template v-if="type == '2'">
			<view class="tower-swiper" @touchmove="TowerMove" @touchstart="TowerStart" @touchend="TowerEnd"   >
				<view class="tower-item" :class="item.zIndex==1?'none':''" v-for="(item,index) in swiperList" @tap.stop="openMenu(item.menu,index)" :key="index" :style="[{'--index': item.zIndex,'--left':item.mLeft}]" :data-direction="direction">
					<view class="swiper-item">
						<image :src="item.url" mode="scaleToFill" v-if="item.type=='image'"></image>
					</view>
				</view>
			</view>
		</template>
	</view>
</template>
<script lang="ts">
	import comm from '@/static/js/comm.js';
	let commURL: any = comm;
	import {Vue,Prop,Component} from 'vue-property-decorator';
	import {LoginModule} from '@/store/module/login'; //导入vuex模块，自动注入
	import Menu from '@/classes/Menu';
	import {BIPUtil} from '@/classes/api/request';
	let tools = BIPUtil.ServApi;
	import URIParams from '@/classes/URIParams'
	@Component({
		components:{}
	})
	export default class Carousel extends Vue {
		@Prop({default:null}) layoutdata?:any;
		uriParams: URIParams = new URIParams();
		BaseUri:any ="";//地址
		cardCur:any =0;//卡片选择
		towerStart:any = 0;//堆叠
		direction:any = '';//堆叠
		type:any = "0";//类型
		swiperList:any = []; 
		cuIconList = [ 'blue','orange','yellow','olive','cyan','purple','mauve','cyan','purple','mauve']
		async mounted() {
			this.BaseUri = commURL.BaseUri;
			let cc =this.BaseUri.charAt(this.BaseUri.length-1)
			if(cc != "/"){
				this.BaseUri +="/"
			}
			let d1 = JSON.parse(this.layoutdata.content)
			let menus = LoginModule.menus;
			this.type = d1.type;
			this.initSwiperList(d1.list)
			this.TowerSwiper();
		} 
		
		initSwiperList(list:any){
			let menus = LoginModule.menus;
			for(var i=0;i<list.length;i++){
				let l1 = list[i];
				let img = l1.images;
				img = this.BaseUri+img
				let menuid = l1.url;
				let menu = this.makeMenuByID(menus,menuid)
				let carousel ={
					id: i,
					type: 'image',
					url: img,
					menu:menu
				}
				this.swiperList.push(carousel)
			}
		}
		
		makeMenuByID(menus:any,menuID:any ):any{
			for(let i=0;i<menus.length;i++){
				let mt:Menu = menus[i]
				if(mt.childMenu){
					let m1 = this.makeMenuByID(mt.childMenu,menuID)
					if(m1)
						return m1;
				}else{
					if(mt.menuId == menuID){
						return mt;
						break;
					}
				}
			}
		}
		//卡片发生变化
		cardSwiper(e:any) {
			this.cardCur = e.detail.current
		}
		// 堆叠式
		// towerSwiper触摸开始
		TowerStart(e:any) {
			this.towerStart = e.touches[0].pageX
		}
		// 堆叠式
		// towerSwiper计算方向
		TowerMove(e:any) {
			this.direction = e.touches[0].pageX - this.towerStart > 0 ? 'right' : 'left'
		}
		// 堆叠式
		// towerSwiper计算滚动
		TowerEnd(e:any) {
			let direction = this.direction;
			let list = this.swiperList;
			if (direction == 'right') {
				let mLeft = list[0].mLeft;
				let zIndex = list[0].zIndex;
				for (let i = 1; i < this.swiperList.length; i++) {
					this.swiperList[i - 1].mLeft = this.swiperList[i].mLeft
					this.swiperList[i - 1].zIndex = this.swiperList[i].zIndex
				}
				this.swiperList[list.length - 1].mLeft = mLeft;
				this.swiperList[list.length - 1].zIndex = zIndex;
			} else {
				let mLeft = list[list.length - 1].mLeft;
				let zIndex = list[list.length - 1].zIndex;
				for (let i = this.swiperList.length - 1; i > 0; i--) {
					this.swiperList[i].mLeft = this.swiperList[i - 1].mLeft
					this.swiperList[i].zIndex = this.swiperList[i - 1].zIndex
				}
				this.swiperList[0].mLeft = mLeft;
				this.swiperList[0].zIndex = zIndex;
			}
			this.direction = ""
			this.swiperList = this.swiperList
		}
		// 堆叠式
		// 初始化towerSwiper
		TowerSwiper() {
			let list = this.swiperList;
			for (let i = 0; i < list.length; i++) {
				list[i].zIndex = parseInt((list.length / 2)+'') + 1 - Math.abs(i - parseInt((list.length / 2)+''))
				list[i].mLeft = i - parseInt((list.length / 2)+'')
			}
			this.swiperList = list
		}
		//打开菜单
		async openMenu(item:Menu,index:any){
			if(!item)
				return;
			let cr = this.cuIconList[index%10];
			let param:any = Object.assign(item);
			param.color = cr;
			let cc = param.command;
			let dd = cc.split("&");
			let pbuid = ''
			dd.forEach((aa:any)=>{
				// console.log(aa)
				let pbuids = aa.split('=')
				if(pbuids[0] == 'pbuid'){
					pbuid = pbuids[1]
				}
			})
			let mid = param.menuId;
			if(pbuid&&mid){
				uni.showLoading({title:'页面跳转中...'});
				await tools.getMenuParams(pbuid,mid).then((res:any)=>{
					uni.hideLoading();
					let data = res.data
					// console.log(data);
					if(data.id>=0){
						this.uriParams = data.data.mparams
						uni.setStorageSync(pbuid,JSON.stringify(this.uriParams))
						if(this.uriParams.beBill){
							let item = encodeURIComponent(JSON.stringify(this.uriParams))
							let uri = '/pages/appinfo/applist?color='+param.color+'&title='+param.menuName+"&pbuid="+pbuid;
							this.pageJump(uri)
						}else{
							let item = encodeURIComponent(JSON.stringify(this.uriParams))
							let uri = '/pages/appreport/appreport?color='+param.color+'&title='+param.menuName+"&pbuid="+pbuid;
							this.pageJump(uri);
						}
					}else{
						uni.showToast({
							title:'没有权限!'
						})
					}
				}).catch((err:any)=>{
						uni.hideLoading();
						uni.showToast({
							title:'没有权限!'
						})
				})
			}
		}
		pageJump(uri:string){
			uni.showLoading({title:'跳转中...'})
			uni.navigateTo({
			    url: uri,complete:()=>{
					uni.hideLoading();
				}
			});
		}
	}
</script> 
<style lang="scss" scoped>
	.tower-swiper .tower-item {
		transform: scale(calc(0.5 + var(--index) / 10));
		margin-left: calc(var(--left) * 100upx - 150upx);
		z-index: var(--index);
	}
	.img{
		div { 
			background-size: contain !important; 
		}
	}
</style>
