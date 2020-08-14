<template>
	<view class="margin-sm">
		<template v-if="cells">
			<view v-for="(cel,idx) in cells.cels" :key="idx">
				<bip-comm-show-task :obj_id="cells.obj_id" :cell="cel" :rowId="-1" :record="record"></bip-comm-show-task>
			</view>
		</template>
	</view>
</template>

<script lang="ts">
    import { Vue, Provide, Prop, Component,Watch } from 'vue-property-decorator';
	import bipCommShowTask from '../bip-comm/bip-comm-show-task.vue';
	@Component({components:{bipCommShowTask}})
	export default class BipTaskUnit extends Vue{
		@Prop() record!:any;
		@Prop() cells!:any;
	}
</script>

<style>

</style>
