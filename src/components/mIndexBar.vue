<template>
	<view  class="cu-bar tabbar bg-white shadow foot" style="z-index: 1000;">
		<template v-if="menuArry.length ==0">
			<view class="action" :class="tabcur==0?tabcurColor:''" @tap="tabSelect" data-id="0">
				<view :class="tabcur==0?'cuIcon-homefill':'cuIcon-home'" style="font-size: 50upx;"></view> 首页
			</view>
			<view class="action" :class="tabcur==1?tabcurColor:''" @tap="tabSelect" data-id="1">
				<view :class="tabcur==1?'cuIcon-formfill':'cuIcon-form'" style="font-size: 50upx;"></view> 菜单
			</view>
			<view class="action" :class="tabcur==2?tabcurColor:''" @tap="tabSelect" data-id="2">
				<view :class="tabcur==2?'cuIcon-messagefill':'cuIcon-message'" style="font-size: 50upx;"></view> 消息
			</view>
			<view class="action" :class="tabcur==3?tabcurColor:''" @tap="tabSelect" data-id="3">
				<view :class="tabcur==3?'cuIcon-profilefill':'cuIcon-profile'" style="font-size: 50upx;"></view> 我
			</view>
		</template>
		<template v-else>
			<view v-for="(item,index) in menuArry" :key="index"
				class="action" :class="tabcur==item.url?tabcurColor:''" @tap="tabSelect" :data-id="item.url" :data-index="index">
				<view :class="tabcur==item.url?item.img+'fill':item.img" style="font-size: 50upx;"></view>{{item.name}}
			</view>
		</template>
	</view>
</template>

<script lang="ts">
	/**
	 * 移动端下方按钮区域
	 */
	import {Vue,Provide,Prop,Component} from 'vue-property-decorator';
	import { BIPUtil } from '@/classes/api/request';
	let tools = BIPUtil.ServApi;
	import QueryEntity from '@/classes/search/QueryEntity';
	import QueryCont from '@/classes/search/QueryCont';	
	import {LoginModule} from '@/store/module/login'; //导入vuex模块，自动注入
	@Component({})
	export default class mIndexBar extends Vue {
		tabcur:number = 0
		tabcurColor:string = 'text-green'
		menuArry:any =[];
		@Prop({
			default:0
		}) tbI!:any
		
		mounted(){
			this.tabcur = this.tbI;
			if(this.loginState)
				this.initMenu();
		}
		tabSelect(e:any){
			this.tabcur = parseInt(e.currentTarget.dataset.id)
			if(this.menuArry.length>0){
				let index = parseInt(e.currentTarget.dataset.index)
				let m1 = this.menuArry[index];
				if(m1.isdefault == '0'){
					this.$emit('tabSelect',[-1,m1])
				}else{
					this.$emit('tabSelect',[this.tabcur,m1])
				}
			}else{
				let m1 = {url:e.currentTarget.dataset.index}
				this.$emit('tabSelect',[this.tabcur,m1])
			}
		}
		//初始化底部菜单
		async initMenu(){
			this.menuArry = [];
			let qe:QueryEntity = new QueryEntity("SS09001","SS09001");//查询实体
			qe.oprid = 13;
			qe.type = 0;
			await tools.query(qe).then((res:any)=>{
				if(res.data.id ==0){
					let data = res.data.data.data.data;
					for(var i=0;i<data.length;i++){
						let m = data[i].data;
						this.menuArry.push(data[i].data)
					}
				}
			});
			if(this.menuArry.length>0){
				let m1 = this.menuArry[0]	
				if(m1.isdefault == '0'){
					this.$emit('tabSelect',[-1,m1])
				}else{
					this.$emit('tabSelect',[m1.url,m1])
				}
			}
		}
		get loginState(){
			let v = LoginModule.loginState
			if(!v){
				let value = uni.getStorageSync('isLogin');
				if(value){
					LoginModule.setState(true)
					let user = JSON.parse(uni.getStorageSync('user'))
					LoginModule.setUser(user)
					let ms = JSON.parse(uni.getStorageSync('menus'))
					LoginModule.setMenus(ms)
					let snkey = uni.getStorageSync('snkey')
					LoginModule.setSnKey(snkey)
					return true;
				}
			}
			return v;
		}
	}
</script>
