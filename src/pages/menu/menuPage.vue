<template>
	<view class="my-menu">
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
		cuIconList:any = []
		groupMenus:Array<Menu> = new Array<Menu>()
		uriParams: URIParams = new URIParams();
		mounted(){
			this.makeGroups();
			this.cuIconList = [{
					cuIcon: 'cardboardfill',
					color: 'red',
					badge: 120,
					name: '检测'
				}, {
					cuIcon: 'recordfill',
					color: 'orange',
					badge: 1,
					name: '录像'
				}, {
					cuIcon: 'picfill',
					color: 'yellow',
					badge: 0,
					name: '图像菜单哈哈'
				}, {
					cuIcon: 'noticefill',
					color: 'olive',
					badge: 22,
					name: '通知'
				}, {
					cuIcon: 'upstagefill',
					color: 'cyan',
					badge: 0,
					name: '排行榜'
				}, {
					cuIcon: 'clothesfill',
					color: 'blue',
					badge: 0,
					name: '皮肤'
				}, {
					cuIcon: 'discoverfill',
					color: 'purple',
					badge: 0,
					name: '发现'
				}, {
					cuIcon: 'questionfill',
					color: 'mauve',
					badge: 0,
					name: '帮助'
				}, {
					cuIcon: 'commandfill',
					color: 'purple',
					badge: 0,
					name: '问答'
				}, {
					cuIcon: 'brandfill',
					color: 'mauve',
					badge: 0,
					name: '版权'
				}]
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
				uni.showLoading();
				await tools.getMenuParams(pbuid,mid).then((res:any)=>{
					uni.hideLoading();
					let data = res.data
					// console.log(data);
					if(data.id>=0){
						this.uriParams = data.data.mparams
						if(this.uriParams.beBill){
							let item = encodeURIComponent(JSON.stringify(this.uriParams))
							uni.navigateTo({
							    url: '/pages/appinfo/appinfo?item='+item+'&color='+param.color+'&title='+param.menuName
							});
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
	}
</script>

<style>
.my-menu{
	margin-bottom: 100upx;
}
.cu-list.grid.no-border {
	padding: 20upx 20upx !important;
}

</style>
