<template>
	<view class="my-menu">
<!-- 		<view class="cu-bar bg-white solid-bottom">
			<view class="action">
				<text class="cuIcon-titles text-orange "></text>销售管理
			</view> -->
<!-- 			<view class="action">
				<button class="cu-btn bg-gradual-blue shadow" data-target="gridModal">设置</button>
			</view> -->
		<!-- </view> -->
		<!-- <view class="cu-list grid col-4 no-border">
			<view class="cu-item" v-for="(item,index) in cuIconList" :key="index" v-if="index<5*2">
				<view :class="['cuIcon-' + item.cuIcon,'text-' + item.color]">
					<view class="cu-tag badge" v-if="item.badge!=0">
						<block v-if="item.badge!=1">{{item.badge>99?'99+':item.badge}}</block>
					</view>
				</view>
				<text>{{item.name}}</text>
			</view>
		</view> -->
		<!-- <view class="cu-bar bg-white solid-bottom margin-top">
			<view class="action">
				<text class="cuIcon-titles text-red "></text>采购管理
			</view>
		</view>
		<view class="cu-list grid col-5 no-border">
			<view class="cu-item" v-for="(item,index) in cuIconList" :key="index" v-if="index<4*2">
				<view :class="['cuIcon-' + item.cuIcon,'text-' + item.color]">
					<view class="cu-tag badge" v-if="item.badge!=0">
						<block v-if="item.badge!=1">{{item.badge>99?'99+':item.badge}}</block>
					</view>
				</view>
				<text>{{item.name}}</text>
			</view>
		</view> -->
		
		<!-- <view class="cu-bar bg-white solid-bottom margin-top">
			<view class="action">
				<text class="cuIcon-titles text-blue "></text>OA管理
			</view>
		</view>
		<view class="cu-list grid col-4 no-border">
			<view class="cu-item" v-for="(item,index) in cuIconList" :key="index" v-if="index<1*2">
				<view :class="['cuIcon-' + item.cuIcon,'text-' + item.color]">
					<view class="cu-tag badge" v-if="item.badge!=0">
						<block v-if="item.badge!=1">{{item.badge>99?'99+':item.badge}}</block>
					</view>
				</view>
				<text>{{item.name}}</text>
			</view>
		</view>	 -->
		<mMenu v-for="(m,index) in groupMenus" :key="index" :m="m" ></mMenu>
	</view>
</template>

<script lang="ts">
	import {Vue,Provide,Component} from 'vue-property-decorator';
	import {
		LoginModule
	} from '@/store/module/login'; //导入vuex模块，自动注入
	import {Menu} from '@/classes/Menu';
	import mMenu from '@/components/mMenu.vue'
	@Component({
		components:{mMenu}
	})
	export default class MenuPage extends Vue{
		@Provide() cuIconList:any = []
		@Provide() groupMenus:Array<Menu> = new Array<Menu>()
		mounted(){
			console.log(this.menus)
			this.makeGroups();
			this.cuIconList = [{
					cuIcon: 'cardboardfill',
					color: 'red',
					badge: 120,
					name: '检测'
				}, {
					cuIcon: 'recordfill',
					color: 'orange',
					badge: 1,
					name: '录像'
				}, {
					cuIcon: 'picfill',
					color: 'yellow',
					badge: 0,
					name: '图像菜单哈哈'
				}, {
					cuIcon: 'noticefill',
					color: 'olive',
					badge: 22,
					name: '通知'
				}, {
					cuIcon: 'upstagefill',
					color: 'cyan',
					badge: 0,
					name: '排行榜'
				}, {
					cuIcon: 'clothesfill',
					color: 'blue',
					badge: 0,
					name: '皮肤'
				}, {
					cuIcon: 'discoverfill',
					color: 'purple',
					badge: 0,
					name: '发现'
				}, {
					cuIcon: 'questionfill',
					color: 'mauve',
					badge: 0,
					name: '帮助'
				}, {
					cuIcon: 'commandfill',
					color: 'purple',
					badge: 0,
					name: '问答'
				}, {
					cuIcon: 'brandfill',
					color: 'mauve',
					badge: 0,
					name: '版权'
				}]
		}
		
		get menus(){
			return LoginModule.menus
		}
		
		makeGroups(){
			let m0 = new Menu('','QT菜单')
			for(let i=0;i<this.menus.length;i++){
				let mt:Menu = this.menus[i]
				if(mt.childMenu){
					this.groupMenus.push(mt)
				}else{
					m0.addChild(mt);
				}
			}
			if(m0.childMenu.length>0){
				this.groupMenus.push(m0)
			}
			console.log(this.groupMenus)
		}
	}
</script>

<style>
.my-menu{
	margin-bottom: 100upx;
}
.cu-list.grid.no-border {
	padding: 20upx 20upx !important;
}

</style>
