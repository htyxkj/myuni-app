<template>
	<view>
	</view>
</template>

<script lang="ts">
	import {
		Vue,
		Provide,
		Component
	} from 'vue-property-decorator';
	import {
		LoginModule
	} from '@/store/module/login'; //导入vuex模块，自动注入
	import { BIPUtil } from '@/classes/api/request';
	let tools = BIPUtil.ServApi;
	import QueryEntity from '@/classes/search/QueryEntity';
	import QueryCont from '@/classes/search/QueryCont';
	@Component({
		components: {}
	})
	export default class home extends Vue {
		mounted() {
			let user = LoginModule.user;
			let gwCode = user.gwCode.split(";");
			for(var i=0;i<gwCode.length;i++){
				this.initLayout(user.gwCode)
			}
		}
		//初始化首页布局
		async initLayout(gwCode:any){
			let qe:QueryEntity = new QueryEntity("SS09007","SS09007");//查询实体
			qe.cont = JSON.stringify( {gwcode:gwCode});
			qe.oprid = 13;
			qe.type = 0;
			await tools.query(qe).then((res:any)=>{
				if(res.data.id ==0){
					let data = res.data.data.data.data;
					for(var i=0;i<data.length;i++){
					}
				}
			});
		}
	}
</script>

<style lang="scss">
 
</style>
