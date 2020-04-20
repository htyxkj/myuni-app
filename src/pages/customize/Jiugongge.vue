<template>
	<view>
		<view v-if="type ==0" :class="myclass">
			<view class="cu-item" v-for="(item,index) in groupMenus" :key="index" @tap.stop="openMenu(item,index)">
				<view>
					<view class="cu-avatar lg radius" :style="'background-image:url('+BaseUri+item.menuIcon+')'"></view>
				</view>
				<text>{{item.menuName}}</text>
			</view>
		</view>	
		<view v-else>
			<view class="cu-list menu sm-border" >
				<view class="cu-item arrow"  v-for="(item,index) in groupMenus" :key="index" @tap.stop="openMenu(item,index)">
					<button class="cu-btn content" open-type="contact">
						<image :src="BaseUri+item.menuIcon" class="png img" mode="aspectFit"></image>
						<text class="text-grey">{{item.menuName}}</text>
					</button>
				</view>
			</view>
		</view>
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
	import mMenu from '@/components/mMenu.vue'
	import URIParams from '@/classes/URIParams'
	@Component({
		components:{}
	})
	export default class Jiugongge extends Vue {
		@Prop({default:null}) data?:any;
		myclass:string ="cu-list grid no-border col-4 ";
		groupMenus:any=[];
		menuIDS:any=[];
		uriParams: URIParams = new URIParams();
		BaseUri:any ="";
		cuIconList = [ 'blue','orange','yellow','olive','cyan','purple','mauve','cyan','purple','mauve']
		type:any =0;//0:九宫格   1:list
		async mounted() {
			this.BaseUri = commURL.BaseUri;
			let cc =this.BaseUri.charAt(this.BaseUri.length-1)
			if(cc != "/"){
				this.BaseUri +="/"
			}
			let d1 = JSON.parse(this.data.content)
			if(d1["column-num"]){
				this.type = 0;
				this.myclass = "cu-list grid no-border col-"+d1["column-num"];
			}else{
				this.type = 1;
			}
			let menus = LoginModule.menus;
			this.menuIDS = d1.list;
			this.makeMenus(menus)
		}
		//初始化 菜单集合
		makeMenus(menus:any){
			for(let i=0;i<menus.length;i++){
				let mt:Menu = menus[i]
				if(mt.childMenu){
					this.makeMenus(mt.childMenu)
				}else{
					let index = this.menuIDS.indexOf(mt.menuId)
					if(index >= 0){
						this.groupMenus[index] = mt;
					}
				}
			}
		}
		//打开菜单
		async openMenu(item:Menu,index:number){
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
<style scoped>
	.page {
		height: 100Vh;
		width: 100vw;
	}
</style>
