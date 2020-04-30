<template>
	<view style="padding-bottom:120upx">
		<mMenu v-for="(m,index) in groupMenus" :key="index" :m="m" @openM="openMenu" ></mMenu>
	</view>
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
			// console.log(param)
			// console.log(param.command)
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
		
		makeGroups(){
			let m0 = new Menu('','QT菜单')
			for(let i=0;i<this.menus.length;i++){
				let mt:Menu = this.menus[i]
				if(mt.childMenu){
					this.groupMenus.push(mt)
				}else{
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
