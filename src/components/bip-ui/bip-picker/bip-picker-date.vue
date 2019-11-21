<template>
	<view class="w-picker">
		<view class="mask" :class="{ show: showPicker }" @tap="maskTap" @touchmove.stop.prevent catchtouchmove="true"></view>
		<view class="w-picker-cnt" :class="{ show: showPicker }">
			<!-- 【确定】【取消】按钮区域 -->
			<view class="w-picker-hd" @touchmove.stop.prevent catchtouchmove="true">
				<view class="w-picker-btn" @tap="pickerCancel">取消</view>
				<view class="w-picker-btn" :style="{ color: themeColor }" @tap="pickerConfirm">确定</view>
			</view>
			<!-- 年月 ym... -->
			<!-- 年月日 -->
			<view class="w-picker-view" v-if="mode == 'date'">
				<picker-view :indicator-style="itemHeight" :value="pickVal" @change="bindChange">
					<picker-view-column>
						<view class="w-picker-item" v-for="(item, index) in data.years" :key="index">{{ item }}年</view>
					</picker-view-column>
					<picker-view-column>
						<view class="w-picker-item" v-for="(item, index) in data.months" :key="index">{{ item }}月</view>
					</picker-view-column>
					<picker-view-column>
						<view class="w-picker-item" v-for="(item, index) in data.days" :key="index">{{ item }}日</view>
					</picker-view-column>
				</picker-view>
			</view>
			<!-- 年月日时分秒-->
			<view class="w-picker-view" v-if="mode == 'datetime'">
				<picker-view :indicator-style="itemHeight" :value="pickVal" @change="bindChange">
					<picker-view-column>
						<view class="w-picker-item" v-for="(item, index) in data.years" :key="index">{{ item }}年</view>
					</picker-view-column>
					<picker-view-column>
						<view class="w-picker-item" v-for="(item, index) in data.months" :key="index">{{ item }}月</view>
					</picker-view-column>
					<picker-view-column>
						<view class="w-picker-item" v-for="(item, index) in data.days" :key="index">{{ item }}日</view>
					</picker-view-column>
					<picker-view-column>
						<view class="w-picker-item" v-for="(item, index) in data.hours" :key="index">{{ item }}时</view>
					</picker-view-column>
					<picker-view-column>
						<view class="w-picker-item" v-for="(item, index) in data.minutes" :key="index">{{ item }}分</view>
					</picker-view-column>
					<picker-view-column>
						<view class="w-picker-item" v-for="(item, index) in data.seconds" :key="index">{{ item }}秒</view>
					</picker-view-column>
				</picker-view>
			</view>
		
		</view>
	</view>
</template>
<script lang="ts">
const modeList = ['half', 'date', 'datetime', 'ym', 'time', 'limit', 'limitHour', 'range', 'linkage']; //过滤无效mode; 以后做过滤使用
function oneOf(value: any, validList: Array<any>) {
	for (let i = 0; i < validList.length; i++) {
		if (value === validList[i]) {
			return true;
		}
	}
	throw new Error('mode无效，请选择有效的mode!');
	return false;
}
import { Vue, Provide, Prop, Component, Watch } from 'vue-property-decorator';
import moment from 'moment';
@Component({
	components: {}
})
export default class bipPickerDate extends Vue {
	@Prop({
		type: String,
		default: 'date',
		validator(m: any) {
			return oneOf(m, modeList);
		}
	})
	mode!: string; //类型
	@Prop({ type: String, default: '#f5a200' }) themeColor!: string; //确定按钮的颜色
	@Prop({ type: String, default: '' }) mode1!: string; //初始值
	data: any = {}; //日期数据组成
	checkArr: Array<any> = []; //选中的值
	pickVal: Array<Number> = []; //选中的下标
	showPicker: boolean = false; //是否显示
	resultStr: string = ''; //最终结果字符串
	itemHeight: string = `height: ${uni.upx2px(88)}px`; //每一个Item的高度

	//确认选择
	pickerConfirm(e: any) {
		console.log('pickerConfirm', e);
		switch (
			this.mode
			// case "date"
		) {
		}
		this.$emit('confirm', {
			checkArr: this.checkArr,
			defaultVal: this.pickVal,
			result: this.resultStr
		});
		this.showPicker = false;
	}
	// 绑定的值发生改变
	bindChange(val: any) {
		console.log('bindChange', val);
		let arr: Array<any> = val.detail.value;
		if (this.mode === 'date' || this.mode == 'datetime') {
			let year = this.data.years[arr[0]] || this.data.years[this.data.years.length - 1];
			let month = this.data.months[arr[1]] || this.data.months[this.data.months.length - 1];
			let day = this.data.days[arr[2]] || this.data.days[this.data.days.length - 1];
			let m0 = moment().year(year).month(parseInt(month) - 1).date(day);
			let rr = m0.format('YYYY-MM-DD');
			if(this.mode == 'datetime'){
				rr = m0.hour(arr[3]).minute(arr[4]).second(arr[5]).format('YYYY-MM-DD HH:mm:ss');
			}
			let yindex = arr[0];
			if(yindex != undefined){
				if(yindex<=3 ||(this.data.years.length-yindex<=3)){
					let years = this.makeYears(year);
					let _idx = years.findIndex((y:number)=>{
						return y == year;
					});
					arr[0] = _idx
					// console.log('123',_idx)
					this.$set(this.data, 'years', years);
				}
			}
			if (month != this.checkArr[1]) {
				let days = [];
				let d1 = moment()
					.year(year)
					.month(month - 1)
					.endOf('month')
					.format('DD');
				let dl = parseInt(d1);
				for (let i = 1; i <= dl; i++) {
					days.push(this.formatNum(i));
				}
				this.data.days.splice();
				// this.data.days = days;
				this.$set(this.data, 'days', days);
			}
			if (this.mode === 'date') {
				this.checkArr = [year, month, day];
			} else {
				let hour = this.data.hours[arr[3]];
				let mint = this.data.minutes[arr[4]];
				let second = this.data.seconds[arr[5]];
				this.checkArr = [year, month, day, hour, mint, second];
			}
			this.resultStr = rr;
			console.log(rr, this.checkArr);
		}
		this.$nextTick(() => {
			this.pickVal = arr;
		});
	}

	mounted() {
		switch(this.mode){
			case 'date':
				this.initYMDData();
				break;
			case 'datetime':
				this.initYMDData();
				this.initHms();
				break;
			default:
				break;
			
		}
		
	}
	
	initYMDData(){
		let years = [];
		let r0 = moment().year();
		console.log(r0);
		years = this.makeYears(r0);
		let mm = [];
		for (let i = 1; i <= 12; i++) {
			mm.push(this.formatNum(i));
		}
		let dd = [];
		for (let i = 1; i <= 31; i++) {
			dd.push(this.formatNum(i));
		}
		this.data = { years: years, months: mm, days: dd };
	}
	
	makeYears(start:number){
		let years = [];
		let y1 = start - 30;
		y1 = y1<=1700?1700:y1;
		for (let i = 0; i <=2*30 ; i++) {
			years.push(y1 + i);
		}
		return years;
	}
	
	initHms(){
		let h = [];
		for (let i = 0; i < 24; i++) {
			h.push(this.formatNum(i));
		}
		let m = [];
		for (let i = 0; i < 60; i++) {
			m.push(this.formatNum(i));
		}
		let s = m
		this.data.hours = h;
		this.data.minutes = m;
		this.data.seconds = s;
	}
	
	//点击区域之外的边框，自动隐藏
	maskTap() {
		this.showPicker = false;
	}

	show() {
		this.showPicker = true;
		if (this.pickVal.length == 0) {
			this.initInfo();
		}
	}

	formatNum(num: number) {
		return num < 10 ? '0' + num : num + '';
	}

	//取消选择
	pickerCancel() {
		this.$emit('cancel', {
			checkArr: this.checkArr,
			defaultVal: this.pickVal
		});
		this.showPicker = false;
	}

	initInfo() {
		if (this.mode == 'date' || this.mode == 'datetime') {
			let rr = this.mode1 ? moment(this.mode1) : moment();
			let y = rr.year();
			let m = rr.month();
			let day = rr.format('DD');
			console.log(day, rr.format('DD'));
			let idx = this.data.years.findIndex((item: any) => {
				return item == y;
			});
			let h = rr.hour();
			let mt = rr.minute();
			let se = rr.second();
			this.$nextTick(() => {
				this.pickVal = [idx, m, parseInt(day) - 1,h,mt,se];
			});
			this.checkArr = [y + '', m + 1 + '', day + ''];
			if(this.mode =='datetime'){
				this.checkArr[3] = this.formatNum(h);
				this.checkArr[4] = this.formatNum(mt);
				this.checkArr[5] = this.formatNum(se);
			}
			this.resultStr = rr.format(this.mode === 'date' ? 'YYYY-MM-DD' : 'YYYY-MM-DD HH:mm:ss');
		}
	}
}
</script>
<style lang="scss">
@import './picker.scss';
</style>
