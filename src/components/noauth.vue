<template>
	<view class="margin-top">
		<view class="bip-no-auth shadow">
			<image src="../static/noauth.png" mode="widthFix"></image>
			<text class="text-red text-shadow" style="font-size: 32upx;">没有权限！</text>
		</view>
	</view>
</template>

<script lang="ts">
	import {
		Vue,
		Provide,
		Prop,
		Component
	} from 'vue-property-decorator';
	@Component({})
	export default class noauth extends Vue {
		@Prop({
				default: true,
				type: Boolean
			}) showInfo!: boolean
			@Prop({
				type: Object
			}) skyDesc!: any

			resetLoading() {
				this.$emit('resetLoading');
			}
	}
</script>

<style>
.bip-no-auth {
	text-align: center;
	max-width: 70%;
	margin: auto;
	height: 100%;
}
</style>
