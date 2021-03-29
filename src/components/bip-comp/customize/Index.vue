<template>
	<view style="margin-top:8px">
		<!-- <load-refresh ref="loadRefresh" :isRefresh="true" :backgroundCover="'#F3F5F5'" 
			:heightReduce="210" :pageNo="1" :totalPageNo="1" @refresh="refresh" :isShowGoToTop="false">
			<view  slot="content-list"> -->
				<view v-for="(item,index) in layout" :key="index" class="margin-bottom-xs bg-white">
					<template v-if="item.comid == '001' || item.comid == '005'">
						<jiugongge :layoutdata="item"></jiugongge>
					</template>
					<template v-if="item.comid == '002'">
						<carousel :layoutdata="item"></carousel>
					</template>
					<template v-if="item.comid == '003'">
						<tabs :layoutdata="item"></tabs>
					</template>
					<template v-if="item.comid == '006'">
						<customChart :layoutdata="item"></customChart>
					</template>
					<template v-if="item.comid == '007'">
						<myTop :layoutdata="item"></myTop>
					</template>
					<template v-if="item.comid == '009'">
						<codeModule :layoutdata="item"></codeModule>
					</template>
					<template v-if="item.comid == '010'">
						<bipCard :layoutdata="item"></bipCard>
					</template>
					<template v-if="item.comid == '011'">
						<bipList :layoutdata="item"></bipList>
					</template>
				</view>
			<!-- </view>
		</load-refresh> -->
		
		<view class="padding margin"></view>
	</view>
</template>
<script lang="ts">
	/**
	 * 加载页面通用类
	 */
	import {Vue,Prop,Watch,Component} from 'vue-property-decorator';
	import {LoginModule} from '@/store/module/login'; //导入vuex模块，自动注入
	import { BIPUtil } from '@/classes/api/request';
	let tools = BIPUtil.ServApi;
	import QueryEntity from '@/classes/search/QueryEntity';
	import jiugongge from './Jiugongge.vue';
	import tabs from './Tabs.vue';
	import carousel from './Carousel.vue';
	import customChart from './CustomChart.vue';
	import myTop from './MyTop.vue';
	import codeModule from './CodeModule.vue';
	import bipCard from './BipCard.vue';
	import bipList from './BipList.vue';
	import loadRefresh from '@/components/load-refresh/load-refresh.vue';
	@Component({
		components:{jiugongge,carousel,tabs,customChart,myTop,loadRefresh,codeModule,bipCard,bipList}
	})
	export default class Customize extends Vue {
		@Prop({default:null}) menu?:any;
		layout:any=[];
		async mounted() {
			let user = LoginModule.user;
			let gwCode:any = [];
			if(user.gwCode){
				gwCode = user.gwCode.split(";");
			}
			gwCode.push("-1")
			this.layout = [];
			if(this.layout.length == 0 && user.attr > 0){
				for(var i=0;i<gwCode.length;i++){
					await this.initLayout(gwCode[i],this.menu.id)	
				}
			}
			if(this.layout.length == 0  && user.attr == 0){
				await this.initLayout(null,this.menu.id)
			}
		}
		//初始化首页布局
		async initLayout(gwCode:any,id:any){
			let qe:QueryEntity = new QueryEntity("SS09007","SS09007");//查询实体
			if(!gwCode){
				qe.cont = JSON.stringify( {menuid:id});
			}else{
				qe.cont = JSON.stringify( {gwcode:gwCode,menuid:id});
			}
			qe.oprid = 13;
			qe.type = 0;
			qe.page.pageSize = 10000
			await tools.query(qe).then((res:any)=>{
				if(res.data.id ==0){ 
					let data = res.data.data.data.data;
					for(var i=0;i<data.length;i++){
						let d1 = data[i].data;
						this.layout.push(d1)
					}
				}
			});
		}

		refresh(){

		}
		@Watch('menu')
		async menuChange() {
			this.layout = [];
			let user = LoginModule.user;
			let gwCode:any = [];
			if(user.gwCode){
				gwCode = user.gwCode.split(";");
			}
			gwCode.push("-1")
			if(this.layout.length == 0 && user.attr > 0){
				for(var i=0;i<gwCode.length;i++){
					await this.initLayout(gwCode[i],this.menu.id)	
				}
			}
			if(this.layout.length == 0  && user.attr == 0){
				await this.initLayout(null,this.menu.id)
			}
		}
	}
</script> 
<style scoped>
	
</style>
