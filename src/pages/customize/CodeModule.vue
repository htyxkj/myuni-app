<template>
	<view>
		<air-home-chart-map v-if="moduleName=='air-home-chart-map'" :data="d1"></air-home-chart-map>
		<air-map v-else-if="moduleName=='air-home-map'" :data="d1" :option="option" class="air-map"></air-map><!-- 作废 -->
	</view>
</template>
<script lang="ts">
	import {Vue,Prop,Component} from 'vue-property-decorator';
	import AirHomeChartMap from '@/pages/alone/air-super/components/airHomeChartMap.vue';
	@Component({
		components:{AirHomeChartMap}
	})
	export default class CodeModule extends Vue {
		@Prop({default:null}) layoutdata?:any;
		moduleName:any = null;
		d1:any = null;
		option:any = {};
		mounted() {
			this.d1 = JSON.parse(this.layoutdata.content)
			this.moduleName = this.d1.module
			if(this.moduleName == 'air-home-map'){
				this.option['type']='realTime'
			}
		}
	}
</script> 
<style scoped>
.air-map{
	width: 100%;
	height: 500px;
}
</style>