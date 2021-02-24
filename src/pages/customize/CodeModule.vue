<template>
	<view>
		<air-home-chart-map v-if="moduleName=='air-home-chart-map'" :data="d1"></air-home-chart-map>
	</view>
</template>
<script lang="ts">
	import {Vue,Prop,Component} from 'vue-property-decorator';
	import AirHomeChartMap from '@/pages/alone/air-super/airHomeChartMap.vue';
	@Component({
		components:{AirHomeChartMap}
	})
	export default class CodeModule extends Vue {
		@Prop({default:null}) layoutdata?:any;
		moduleName:any = null;
		d1:any = null;
		mounted() {
			this.d1 = JSON.parse(this.layoutdata.content)
			this.moduleName = this.d1.module
		}
	}
</script> 
<style scoped>
</style>