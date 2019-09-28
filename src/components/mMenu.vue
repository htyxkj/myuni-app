<template>
	<view>
		<view class="cu-bar bg-white solid-bottom margin-top">
			<view class="action">
				<text class="cuIcon-titles text-blue "></text>{{m.menuName}}
			</view>
		</view>
		<view class="cu-list grid col-4 no-border">
			<view class="cu-item" v-for="(item,index) in m.childMenu" :key="index">
				<view :class="['cuIcon-' + cuIconList[index%10].cuIcon,'text-' + cuIconList[index%10].color]">
					<view class="cu-tag badge" v-if="badge!=0">
						<block v-if="badge!=1">{{badge>99?'99+':badge}}</block>
					</view>
				</view>
				<text>{{item.menuName}}</text>
			</view>
		</view>	
	</view>
</template>

<script lang="ts">
	import {Vue,Provide,Prop,Component} from 'vue-property-decorator';
	import {Menu} from '@/classes/Menu';
	@Component({})
	export default class mMenu extends Vue{
		@Provide() badge:number = 0
		@Provide() cuIconList:any = []//颜色 图标
		@Prop() m!:Menu
	
		mounted(){
			this.cuIconList = [{
					cuIcon: 'cardboardfill',
					color: 'red',
				}, {
					cuIcon: 'recordfill',
					color: 'orange',
				}, {
					cuIcon: 'picfill',
					color: 'yellow',
				}, {
					cuIcon: 'noticefill',
					color: 'olive',
				}, {
					cuIcon: 'upstagefill',
					color: 'cyan',
				}, {
					cuIcon: 'clothesfill',
					color: 'blue',
				}, {
					cuIcon: 'discoverfill',
					color: 'purple',
				}, {
					cuIcon: 'questionfill',
					color: 'mauve',
				}, {
					cuIcon: 'commandfill',
					color: 'purple',
				}, {
					cuIcon: 'brandfill',
					color: 'mauve',
				}]
				console.log(this.cuIconList.length)
		}
	}
</script>

<style>

</style>
