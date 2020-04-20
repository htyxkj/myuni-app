<template>
	<view style="padding-bottom:55px">
		<view class="padding-bottom" v-for="(item,index) in layout" :key="index">
			<template v-if="item.comid == '001' || item.comid == '005'">
				<Jiugongge :data="item"></Jiugongge>
			</template>
			<template v-if="item.comid == '002'">
				<Carousel :data="item"></Carousel>
			</template>
			<template v-if="item.comid == '003'">
				<Tabs :data="item"></Tabs>
			</template>
		</view>
	</view>
</template>
<script lang="ts">
	/**
	 * 加载页面通用类
	 */
	import {Vue,Prop,Component} from 'vue-property-decorator';
	import {LoginModule} from '@/store/module/login'; //导入vuex模块，自动注入
	import { BIPUtil } from '@/classes/api/request';
	let tools = BIPUtil.ServApi;
	import QueryEntity from '@/classes/search/QueryEntity';
	import QueryCont from '@/classes/search/QueryCont';
	import Jiugongge from './Jiugongge.vue';
	import Tabs from './Tabs.vue';
	import Carousel from './Carousel.vue';
	@Component({
		components:{Jiugongge,Carousel,Tabs}
	})
	export default class customize extends Vue {
		@Prop({default:null}) menu?:any;
		layout:any=[];
		async mounted() {
			this.layout = [];
			let user = LoginModule.user;
			let gwCode = user.gwCode.split(";");
			for(var i=0;i<gwCode.length;i++){
				await this.initLayout(user.gwCode,this.menu.id)
			}
		}
		//初始化首页布局
		async initLayout(gwCode:any,id:any){
			let qe:QueryEntity = new QueryEntity("SS09007","SS09007");//查询实体
			qe.cont = JSON.stringify( {gwcode:gwCode,id:id});
			qe.oprid = 13;
			qe.type = 0;
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
	}
</script> 
<style scoped>
	
</style>
