<template>
	<view>
		<scroll-view scroll-x class="bg-white nav" scroll-with-animation :scroll-left="scrollLeft">
			<view class="flex text-center">
				<view class="cu-item flex-sub" :class="index==TabCur?'text-red cur':''" v-for="(item,index) in tabs" :key="index" @tap="tabSelect" :data-id="index">
					{{item.name}}
				</view>
			</view>
		</scroll-view>
		<view v-if="tabs.length>0 && showTabs" style="">
			<applist v-if="formType ==0 " :pbuid="pbuid" :myStyle="myStyle" :title="title"></applist>
			<appreport v-if="formType ==1 " :pbuid="pbuid" :myStyle="myStyle" :title="title"></appreport>
		</view>
	</view>
</template>
<script lang="ts">
	import {Vue,Prop,Component} from 'vue-property-decorator';
	import {LoginModule} from '@/store/module/login'; //导入vuex模块，自动注入
	import Menu from '@/classes/Menu';
	import {BIPUtil} from '@/classes/api/request';
	let tools = BIPUtil.ServApi;
	import URIParams from '@/classes/URIParams'
	import applist from './form/applist.vue';
	import appreport from './form/appreport.vue';
	@Component({
		components:{applist,appreport}
	})
	export default class Tabs extends Vue {
		@Prop({default:null}) layoutdata?:any;
		uriParams: URIParams = new URIParams();
		tabs:any =[];
		TabCur:any =0;
		scrollLeft:any =0;
		pbuid:any =""//菜单参数
		formType:any =-1;
		myStyle:any = null;//样式
		title:any = "";//菜单标题
		showTabs:any = true;
		async mounted() {
			let menus = LoginModule.menus;
			let d1 = JSON.parse(this.layoutdata.content)
			let list = d1.list;
			for(var i=0;i<list.length;i++){
				let l1 = list[i];
				let menuID = l1.url;
				let myStyle = l1.style;
				let tab ={name:l1.name,index:i,menu:null,myStyle:myStyle};
				let menu = this.makeMenuByID(menus,menuID)
				tab.menu = menu;
				this.tabs.push(tab)
			}
			let item = this.tabs[this.TabCur].menu;
			this.myStyle = this.tabs[this.TabCur].myStyle;
			if(item)
			this.initMenu(item);
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
		async tabSelect(e:any) {
			this.showTabs = false;
			this.TabCur = e.currentTarget.dataset.id;
			this.scrollLeft = (e.currentTarget.dataset.id - 1) * 60 
			let item = this.tabs[this.TabCur].menu;
			this.myStyle = this.tabs[this.TabCur].myStyle;
			if(item)
				await this.initMenu(item);
			this.showTabs = true;
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
			this.title = item.menuName;
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
