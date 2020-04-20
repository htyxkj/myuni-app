<template>
	<view>
		<scroll-view scroll-x class="bg-white nav" scroll-with-animation :scroll-left="scrollLeft">
			<view class="cu-item" :class="index==TabCur?'text-green cur':''" v-for="(item,index) in tabs" :key="index" @tap="tabSelect" :data-id="index">
				{{item.name}}
			</view>
		</scroll-view>
		<view v-if="tabs.length>0" style="">
			<applist v-if="formType ==0 " :pbuid="pbuid"></applist>
			<appreport v-if="formType ==1 " :pbuid="pbuid"></appreport>
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
	import applist from './form/applist.vue';
	import appreport from './form/appreport.vue';
	@Component({
		components:{applist,appreport}
	})
	export default class Tabs extends Vue {
		@Prop({default:null}) data?:any;
		uriParams: URIParams = new URIParams();
		tabs:any =[];
		TabCur:any =0;
		scrollLeft:any =0;
		pbuid:any =""//菜单参数
		formType:any =-1;
		async mounted() {
			let menus = LoginModule.menus;
			let d1 = JSON.parse(this.data.content)
			let list = d1.list;
			for(var i=0;i<list.length;i++){
				let l1 = list[i];
				let menuID = l1.url;
				let tab ={name:l1.name,index:i,menu:null};
				let menu = this.makeMenuByID(menus,menuID)
				console.log(menu)
				tab.menu = menu;
				this.tabs.push(tab)
				
				let item = this.tabs[this.TabCur].menu;
				this.initMenu(item);
			}
		}
		//更具菜单号获取菜单
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
		//tabs选中
		tabSelect(e:any) {
			this.TabCur = e.currentTarget.dataset.id;
			this.scrollLeft = (e.currentTarget.dataset.id - 1) * 60 
			let item = this.tabs[this.TabCur].menu;
			this.initMenu(item);
		}

		async initMenu(item:any){
			let param:any = Object.assign(item);
			let cc = param.command;
			let dd = cc.split("&");
			let pbuid = ''
			dd.forEach((aa:any)=>{
				let pbuids = aa.split('=')
				if(pbuids[0] == 'pbuid'){
					pbuid = pbuids[1]
				}
			})
			let mid = item.menuId;
			if(pbuid&&mid){
				await tools.getMenuParams(pbuid,mid).then((res:any)=>{
					this.pbuid = pbuid
					let data = res.data
					if(data.id>=0){
						this.uriParams = data.data.mparams
						uni.setStorageSync(pbuid,JSON.stringify(this.uriParams))
						if(this.uriParams.beBill){
							this.formType = 0
						}else{
							this.formType = 1
						}
					}else{
						uni.showToast({
							title:'没有权限!',
							icon:"none"
						})
					}
				}).catch((err:any)=>{
					uni.showToast({
						title:'没有权限!',
						icon:"none"
					})
				})
			}
		}
	}
</script> 
<style scoped>

</style>
