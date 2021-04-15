<template>
	<view>
		<view class="cu-bar bg-white solid-bottom margin-top">
			<view class="action">
				<text class="cuIcon-titles text-mauve"></text>{{m.menuName}}
			</view>
		</view>
		<view class="cu-list grid col-4 no-border">
			<template v-for="(item,index) in m.childMenu">
				<view v-if="item.menuattr<4" class="cu-item" :key="index" @tap.stop="openMenu(item,index)">
					<view>
						<view class='cu-avatar xs radius bg-white' :style="[{backgroundImage:'url('+BaseUri+item.menuIcon+')',width:'52px',height:'52px'}]">
							<view class="cu-tag badge" v-if="badge!=0">
								<block v-if="badge!=1">{{badge>99?'99+':badge}}</block>
							</view>
						</view>
					</view>
					<view><text>{{item.menuName}}</text></view>
				</view>
			</template>
		</view>	
	</view>
</template>

<script lang="ts">
	import {Vue,Provide,Prop,Component} from 'vue-property-decorator';
	import Menu from '@/classes/Menu';
	import comm from '@/static/js/comm.js';
	let commURL: any = comm;
	@Component({})
	export default class mMenu extends Vue{
		badge:number = 0
		BaseUri:any ="";//地址
		cuIconList:any = []//颜色 图标
		@Prop() m!:Menu

		created(){
			this.BaseUri = commURL.BaseUri;
			let cc =this.BaseUri.charAt(this.BaseUri.length-1)
			if(cc != "/"){
				this.BaseUri +="/"
			}
		}

		mounted(){

			this.cuIconList = [{
					cuIcon: 'cardboardfill',
					color: 'blue',
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
		}
	
		openMenu(item:Menu,index:number){
			// console.log(item)
			let cr = this.cuIconList[index%10].color;
			let vm:any = Object.assign(item);
			vm.color = cr;
			this.$emit('openM',vm)
		}
	}
</script>

<style>

</style>
