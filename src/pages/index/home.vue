<template>
	<view class="my-home">
		<view class="cu-bar bg-white solid-bottom margin-top">
			<view class="action">
				<text class="cuIcon-titles text-blue "></text>混合图
			</view>
		</view>
		<uni-card :title="'标题文字'" extra="额外信息" :note="'Tips'"  images="" :isFull="true">
			<image src="https://p0.meituan.net/wedding/6c888c3bd67b1839b57c360cd9bcbf6c136741.jpg%40800w_600h_0e_1l%7Cwatermark%3D1%26%26r%3D1%26p%3D9%26x%3D2%26y%3D2%26relative%3D1%26o%3D20" mode="scaleToFill" class="demoimages"></image>
			<form class="content">
				<view class="cu-form-group uni-radio-input-disabled">
					<view class="title" style="width: 60upx; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;"
					>普通输入框</view>
					<input placeholder="两字短标题" name="input"></input>
				</view>
				
				<view class="cu-form-group">
					<view class="title" style="width:60upx;white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">普通输入</view>
					<input placeholder="统一标题的宽度" name="input"></input>
				</view>
				<view class="cu-form-group">
					<view class="title" style="width:60upx;white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">普通输入框2</view>
					<input name="input"></input>
				</view>
				
				<view class="cu-form-group">
					<view class="title">
						<view class="cu-capsule radius">
							<view class="cu-tag bg-green" style="font-size: 30upx; font-weight: bold;">
								中国大陆
							</view>	
						</view>
						
					</view>
					<!-- <view class="title">带清除按钮的输入框</view> -->
						<input class="uni-input" placeholder="带清除按钮的输入框" :value="inputClearValue" @input="clearInput" /><text class='cuIcon-close text-red' v-if="showClearIcon" @click="clearIcon"></text>
				</view>
			</form>
		</uni-card>
		<view>
			
		</view>
		<view class="cu-bar bg-white solid-bottom margin-top">
			<view class="action">
				<text class="cuIcon-titles text-green "></text>下拉列表
			</view>
		</view>
		<view >
			<view class="cu-form-group margin-top">
				<view class="title">普通选择</view>
				<view class="title" @tap="select">选择器</view>
				<text :class="isShow?'cuIcon-triangleupfill':'cuIcon-triangledownfill'" style="font-size: 38upx;" @tap="select"></text>
			</view>
			<bip-select :arr="data2.days" :show="isShow" @cancel="cancel" @selectChange="selectChange" @select="selectOK"></bip-select>
		</view>
		
		<view class="cu-bar bg-white solid-bottom margin-top">
			<view class="action">
				<text class="cuIcon-titles text-red "></text>柱状图
			</view>
		</view>
		<!-- 	<uni-fab :content="content"></uni-fab> -->
		<view class="cu-form-group margin-top">
			<view class="title">BIPpicker选择</view>
			<view class="title" @tap="pkdate">选择器</view>
		</view>
		<bip-picker-date :mode="'datetime'" ref="bippkdate" @confirm="confirm"></bip-picker-date>
		<view>

		</view>
		<view class="cu-bar bg-white solid-bottom margin-top">
			<view class="action">
				<text class="cuIcon-titles text-red "></text>柱状图
			</view>
		</view>
		<view class="cu-bar bg-white solid-bottom margin-top">
			<view class="action">
				<text class="cuIcon-titles text-red "></text>柱状图
			</view>
		</view>
		
		
	</view>
</template>

<script lang="ts">
	import {
		Vue,
		Provide,
		Component
	} from 'vue-property-decorator';
	import uCharts from '@/lib/u-chars/u-charts.js';
	import uniCard from "@/components/uni-ui/uni-card/uni-card.vue";
	import uniFab from "@/components/uni-ui/uni-fab/uni-fab.vue";
	import bipInput from '@/components/bip-ui/bip-input/bip-input.vue'
	// import uniCalendar from '@/components/uni-ui/uni-calendar/uni-calendar.vue'
	import bipSelect from '@/components/bip-ui/bip-select/bip-select.vue'
	import bipPickerDate from '@/components/bip-ui/bip-picker/bip-picker-date.vue'
	// import pickermView from '@/components/bip-picker-view/picker-m-view.vue'
	@Component({
		components: {uniCard,bipInput,uniFab,bipSelect,bipPickerDate}
	})
	export default class home extends Vue {
		cWidth: number = 100
		cHeight: number = 100
		cHeight2: number = 100
		pixelRatio: number = 1
		rcbarWidth: number = 1 //圆弧进度图，进度条宽度,此设置可使各端宽度一致
		canvaMix:any = {}
		canvaBar:any =  {}
		selectIndex:Array<number>=[0,1,10,11,2,5]
		date:string='2019-11-01'
		data2:any = {}
		content:Array<any> = []
		bindDateChange(e:any){
			console.log(e)
		}
		onConfirm(e:any){
			this.selectIndex = e.defaultVal;
			console.log(this.selectIndex)
			console.log(e)
		}
		isShow = false;
		select(){
			this.isShow = !this.isShow;
		}
		
		pkdate(){
			let rr:any = this.$refs.bippkdate;
			rr.show();
		}
		
		selectChange(e:any){
			console.log(e)
		}
		
		confirm(v:any){
			console.log(v)
		}
		
		selectOK(e:any){
			console.log(e)
		}
		cancel(){
			this.isShow =false;
		}
		
		mounted() {
			this.data2.years = [2018,2019,2020,2021,2022];
			this.data2.months = [1,2,3,4,5,6,7,8,9,10,11,12];
			this.data2.days = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16]
			for(let i=0;i<5;i++){
				this.content.push({text:('tuuuuuuuuuuut'+i)})
			}
				
			// console.log(uCharts)
			let _self = this
			//#ifdef MP-ALIPAY
			uni.getSystemInfo({
				success: (res: any) => {
					if (res.pixelRatio > 1) {
						_self.pixelRatio = 2;
					}
				}
			});
			//#endif
			// this.cWidth = uni.upx2px(750);
			// this.cHeight = uni.upx2px(500);
			// this.cHeight2 = uni.upx2px(400);
			// this.arcbarWidth=uni.upx2px(24);
			// this.getServerData();
		}
		
		open(){
			let rr:any = this.$refs.mm;
			rr.show();
		}
		
		inputClearValue:string = ''
		showClearIcon:boolean = true
		
		clearIcon(){
			this.inputClearValue = '';
			this.showClearIcon = false;
		}
		
		clearInput(event:any){
			console.log(321321);
			this.inputClearValue = event.target.value;
			if (event.target.value.length > 0) {
				this.showClearIcon = true;
				console.log(11)
			} else {
				this.showClearIcon = false;
			}
		}

		

	}
</script>

<style>
	.my-home{
		margin-bottom: 100upx;
	}
	.qiun-charts {
		width: 750upx;
		height: 500upx;
		background-color: #FFFFFF;
	}
</style>
