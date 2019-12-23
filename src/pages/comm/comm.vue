<template>
	<view class="my-comm">
		<cu-custom :bgColor="'bg-'+cr" :isBack="true">
			<block slot="backText">返回</block>
			<block slot="content">{{title}}</block>
		</cu-custom>
		<h1>我是通用</h1>
	</view>
</template>

<script lang="ts">
	import {
		Vue,
		Provide,
		Component
	} from 'vue-property-decorator';
	import {
		BIPUtil
	} from '@/classes/api/request';
	let tools = BIPUtil.ServApi;
	import mLoad from '../../components/mLoad.vue';
	import empty from '../../components/empty.vue';
	import mIndexBar from '../../components/mIndexBar.vue'
	import layout from '../layout/layout.vue'
	import URIParams from '@/classes/URIParams'
	@Component({components:{mLoad,mIndexBar,empty,layout}})
	export default class comm extends Vue {
		@Provide() title = '通用页面'
		@Provide() pbuid = ''
		@Provide() pmenuid = ''
		@Provide() cr = 'blue'
		@Provide() TabCur = 0
		@Provide() modalName: any = null
		@Provide() listTouchStart: number =  0
		@Provide() listTouchDirection: any = null
		@Provide() loading:boolean = true
		@Provide() getok:boolean = false
		@Provide() uriParams: URIParams = new URIParams();
		async onLoad(options:any){
			// console.log(options)

			this.title = options.menuName
			this.pbuid = options.pbuid
			this.pmenuid = options.pmenuid
			if(options.color){
				this.cr = options.color
			}
			await tools.getMenuParams(this.pbuid,this.pmenuid).then((res:any)=>{
				this.loading = false;
				let data = res.data
				// console.log(data);
				if(data.id>=0){
					this.getok = true;
					this.uriParams = data.data.mparams
				}else{
					this.getok = false;
				}
			}).catch((err:any)=>{
				this.loading = false;
				this.getok = false;
			})
		}
		
		tabSelect(index:number){
			uni.redirectTo({url:'/pages/index/index?tabcur='+index})
		}
	}
</script>

<style>
.my-comm{
	margin-bottom: 120upx;
}
</style>
