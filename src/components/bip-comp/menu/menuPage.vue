<template>
	<scroll-view scroll-y="true" class="scroll-Y" style="height:100vh">
		<view >
			<mMenu v-for="(m,index) in groupMenus" :key="index" :m="m" @openM="openMenu" ></mMenu>
		</view>
		<view class="padding-xl margin-xl"></view>
		<view class="padding-xs margin-xs"></view>
	</scroll-view>	
</template>

<script lang="ts">
	import {Vue,Provide,Component} from 'vue-property-decorator';
	import {
		LoginModule
	} from '@/store/module/login'; //导入vuex模块，自动注入
	import {
		BIPUtil
	} from '@/classes/api/request';
	let tools = BIPUtil.ServApi;
	import Menu from '@/classes/Menu';
	import mMenu from '@/components/mMenu.vue'
	import URIParams from '@/classes/URIParams'
	import comm from '@/static/js/comm.js';
	let commURL: any = comm;
	@Component({
		components:{mMenu}
	})
	export default class MenuPage extends Vue{
		groupMenus:Array<Menu> = new Array<Menu>()
		uriParams: URIParams = new URIParams();
		mounted(){
			this.makeGroups();
		}
		
		get menus(){
			return LoginModule.menus
		}
		
		async openMenu(param:any){
			let cc = param.command;
			let dd = cc.split("&");
			let pbuid = ''
			let pmenu ='';
			dd.forEach((aa:any)=>{
				let pbuids = aa.split('=')
				if(pbuids[0] == 'pbuid'){
					pbuid = pbuids[1]
				}
				if(pbuids[0] == 'pmenu'){
					pmenu = pbuids[1]
				}
			})
			let mid = param.menuId;
			if(pbuid&&mid){
				uni.showLoading({title:'页面跳转中...'});
				await tools.getMenuParams(pbuid,mid).then((res:any)=>{
					uni.hideLoading();
					let data = res.data
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
			}else if(pmenu){
				let type = commURL.ItemType;
				let url = "";
				if(type =='air-super'){
					if(pmenu == 'RealTimeTrack'){//实时轨迹
						pmenu = "airMap?type=realTime";
					}else if(pmenu =='PlayBack'){//轨迹回放
						pmenu = "airMap?type=playBack";
					}else if(pmenu == 'TrackShow'){//航带航迹查询
						pmenu = "airMap?type=trackShow";
					}else if(pmenu =='SortiesInvoke'){//架次统计
						pmenu = "airSortiesInvoke?1=1";
					}else if(pmenu =='SortiesQuery'){//架次查询
						pmenu = "airSortiesQuery?1=1";
					}
					url = '/pages/alone/air-super/pages/'+pmenu;
				}else if(type == 'Breeding'){
					url = '/pages/alone/breeding/pages/'+pmenu+'?1=1';
				}
				let uri = url+'&color='+param.color+'&title='+param.menuName;
				this.pageJump(uri);
			}
		}
		
		makeGroups(){
			let m0 = new Menu('','QT菜单')
			for(let i=0;i<this.menus.length;i++){
				let mt:Menu = this.menus[i]
				if(mt.childMenu){
					this.groupMenus.push(mt)
				}else{
					if(mt.menuAttr<4)//4是子菜单
						m0.addChild(mt);
				}
			}
			if(m0.childMenu.length>0){
				this.groupMenus.push(m0)
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

<style>
.cu-list.grid.no-border {
	padding: 20upx 20upx !important;
}

</style>
