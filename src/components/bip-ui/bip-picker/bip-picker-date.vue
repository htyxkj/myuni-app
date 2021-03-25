<template>
<view>
	<view class="w-picker my-w-picker" v-show="showPicker">
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
			<!-- 时分秒-->
			<view class="w-picker-view" v-if="mode == 'time'">
				<picker-view :indicator-style="itemHeight" :value="pickVal" @change="bindChange">
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
			<view class="w-picker-view" v-if="mode == 'ym'">
				<picker-view :indicator-style="itemHeight" :value="pickVal" @change="bindChange">
					<picker-view-column>
						<view class="w-picker-item" v-for="(item, index) in data.years" :key="index">{{ item }}年</view>
					</picker-view-column>
					<picker-view-column>
						<view class="w-picker-item" v-for="(item, index) in data.months" :key="index">{{ item }}月</view>
					</picker-view-column>
				</picker-view>
			</view>
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
	@Prop() limitDate!:any;//时间限制
	data: any = {}; //日期数据组成
	checkArr: Array<any> = []; //选中的值
	pickVal: Array<Number> = []; //选中的下标
	showPicker: boolean = false; //是否显示
	resultStr: string = ''; //最终结果字符串
	itemHeight: string = `height: ${uni.upx2px(88)}px`; //每一个Item的高度

	//确认选择
	pickerConfirm(e: any) {
		switch (
			this.mode
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
		let arr: Array<any> = val.detail.value;
		if (this.mode === 'date' || this.mode == 'datetime') {
			let year = this.data.years[arr[0]] || this.data.years[this.data.years.length - 1];
			let month = this.data.months[arr[1]] || this.data.months[this.data.months.length - 1];
			let day = this.data.days[arr[2]] || this.data.days[this.data.days.length - 1];
			let m0 = moment().year(year).month(parseInt(month) - 1).date(day);
			let rr = m0.format('YYYY-MM-DD');
			if(this.mode == 'datetime'){
				let hour = this.data.hours[arr[3]] || this.data.hour[this.data.hours.length - 1];
				let minute = this.data.minutes[arr[4]] || this.data.minute[this.data.minutes.length - 1];
				let second = this.data.seconds[arr[5]] || this.data.days[this.data.seconds.length - 1];
				rr = m0.hour(hour).minute(minute).second(second).format('YYYY-MM-DD HH:mm:ss');
			}
			let yindex = arr[0];
			if(yindex != undefined){
				if(yindex<=3 ||(this.data.years.length-yindex<=3)){
					let years = this.makeYears(year);
					let _idx = years.findIndex((y:number)=>{
						return y == year;
					});
					arr[0] = _idx
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
		}else if(this.mode ==='ym'){
			let year = this.data.years[arr[0]] || this.data.years[this.data.years.length - 1];
			let month = this.data.months[arr[1]] || this.data.months[this.data.months.length - 1];
			this.checkArr = [year, month];
			this.resultStr = year+"-"+month;
		}
		this.$nextTick(() => {
			this.pickVal = arr;
		});
		this.init();
	}

	mounted() {
		this.init();
	}
	init(){
		switch(this.mode){
			case 'date':
				this.initYMDData();
				break;
			case 'datetime':
				this.initYMDData();
				this.initHms();
				break;
			case 'time':
				this.initHms();
				break;
			case 'ym':
				this.initYMData();
				break;
			default:
				break;
		}
	}
	
	initYMDData(){
		let years = [];
		let r0 = moment().year();
		years = this.makeYears(r0);
		let mm = this.makeMonths();
		let dd = this.makeDays();
		this.data = { years: years, months: mm, days: dd };
	}
	initYMData (){
		let years = [];
		let r0 = moment().year();
		years = this.makeYears(r0);
		let mm = this.makeMonths();
		let dd:any = [];
		this.data = { years: years, months: mm, days: dd };
	}
	makeYears(start:number){
		let years = [];
		let arr:any = this.checkYMDHMS(1);
		for (let i = arr[0]; i <=arr[1] ; i++) {
			years.push(i);
		}
		return years;
	}
	makeMonths(){
		let mm = [];
		let arr:any = this.checkYMDHMS(2);
		let minM = arr[0];
		let maxM = arr[1];
		for (let i = minM; i <= maxM; i++) {
			mm.push(this.formatNum(i));
		}
		return mm;
	}
	makeDays(){
		let dd = [];
		let arr:any = this.checkYMDHMS(3)
		let minD = arr[0];
		let maxD = arr[1];
		for (let i = minD; i <= maxD; i++) {
			dd.push(this.formatNum(i));
		}
		return dd;
	}

	initHms(){
		let h = [];
		let arr:any = this.checkYMDHMS(4);
		let minH = arr[0];
		let maxH = arr[1]
		for (let i = minH; i < maxH; i++) {
			h.push(this.formatNum(i));
		}
		let m = [];
		arr = this.checkYMDHMS(5);
		let minm = arr[0];
		let maxm = arr[1] 
		for (let i = minm; i < maxm; i++) {
			m.push(this.formatNum(i));
		}
		let s = [];
		arr = this.checkYMDHMS(5);
		let mins = arr[0];
		let maxs = arr[1] 
		for (let i = mins; i < maxs; i++) {
			s.push(this.formatNum(i));
		}
		this.data.hours = h;
		this.data.minutes = m;
		this.data.seconds = s;
	}
	
	/**
	 * 判断当前时间是否与最大最小时间有交集
	 */
	checkYMDHMS(type:any){
		let checkY = 0,checkM = 0,checkD = 0,checkH = 0,checkm = 0,checkS = 0
		if(this.checkArr){
			checkY = parseInt(this.checkArr[0])
			if(isNaN(checkY)){
				checkY = moment().year();
			}
			checkM = parseInt(this.checkArr[1])
			if(isNaN(checkM)){
				checkM = moment().month();
			}
			checkD = parseInt(this.checkArr[2])
			if(isNaN(checkD)){
				checkD = moment().date();
			}
			checkH = parseInt(this.checkArr[3])
			if(isNaN(checkH)){
				checkH = 0;
			}
			checkm = parseInt(this.checkArr[4])
			if(isNaN(checkm)){
				checkm = 0;
			}
			checkS = parseInt(this.checkArr[5])
			if(isNaN(checkS)){
				checkS = 0;
			}
		}
		if(type == 1){ //年
			let arr = [];
			let start = moment().year();
			let y1 = start - 30;
			y1 = y1<=1700?1700:y1;
			arr[0] = y1
			arr[1] = y1 + 3*30;
			if(this.limitDate.min && this.limitDate.min[0]){
				arr[0] = this.limitDate.min [0];
			}
			if(this.limitDate.max && this.limitDate.max[0]){
				arr[1] = this.limitDate.max[0];
			}
			return arr;
		}else if(type ==2){//月
			let mm = [];
			let minM = 1;
			let maxM = 12;
			if(this.limitDate.min && checkY ==  this.limitDate.min[0]){
				minM = this.limitDate.min[1]
			}
			if(this.limitDate.max && checkY ==  this.limitDate.max[0]){
				maxM = this.limitDate.max[1]
			}
			mm.push(minM)
			mm.push(maxM)
			return mm;
		}else if (type ==3){//日
			let minD = 1;
			let maxD = 31;
			let liMin = this.limitDate.min
			if(liMin && checkY ==  liMin[0] && checkM == liMin[1]){
				minD = liMin[2]
			}
			let liMax = this.limitDate.max
			maxD = moment(checkY+"-"+checkM, "YYYY-MM").daysInMonth();
			if(liMax && checkY ==  liMax[0] && checkM == liMax[1]){
				if(liMax[2] <=maxD)
					maxD = liMax[2]
			}
			return [minD,maxD];
		}else if (type == 4){//时
			let minH = 0;
			let maxH = 24;
			let liMin = this.limitDate.min
			if(liMin && checkY ==  liMin[0] && checkM == liMin[1] && checkD == liMin[2]){
				minH = liMin[3]
			}
			let liMax = this.limitDate.max
			if(liMax && checkY ==  liMax[0] && checkM == liMax[1]&& checkD == liMax[2]){
				minH = liMax[3]
			}
			return [minH,maxH];
		}else if(type ==5){
			let minm = 0;
			let maxm = 60;
			let liMin = this.limitDate.min
			if(liMin && checkY ==  liMin[0] && checkM == liMin[1] && checkD == liMin[2] && checkH == liMin[3]){
				minm = liMin[4]
			}
			let liMax = this.limitDate.max
			if(liMax && checkY ==  liMax[0] && checkM == liMax[1]&& checkD == liMax[2] && checkH == liMax[3]){
				maxm = liMax[4]
			}
			return [minm,maxm];
		}else if(type ==5){
			let minS = 0;
			let maxS = 60;
			let liMin = this.limitDate.min
			if(liMin && checkY ==  liMin[0] && checkM == liMin[1] && checkD == liMin[2] && checkH == liMin[3] && checkm == liMin[4]){
				minS = liMin[5]
			}
			let liMax = this.limitDate.max
			if(liMax && checkY ==  liMax[0] && checkM == liMax[1]&& checkD == liMax[2] && checkH == liMax[3] && checkm == liMax[4]){
				maxS = liMax[5]
			}
			return [minS,maxS];
		}
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
		}else if(this.mode ==='ym'){
			let rr = this.mode1 ? moment(this.mode1) : moment();
			let y = rr.year();
			let m = rr.month();
			this.checkArr = [y + '', m + 1 + ''];
			this.resultStr = y + '-'+ m+1 ;
			let idx = this.data.years.findIndex((item: any) => {
				return item == y;
			});
			this.$nextTick(() => {
				this.pickVal = [idx, m];
			});
		}
	}
	
	@Watch("limitDate",{deep:true})
	limitDateChange(){
		this.init();
	}
}
</script>
<style lang="scss">
@import './picker.scss';
.my-w-picker{
	position: fixed;
    z-index: 1000;
    top: 0;
    right: 0;
    left: 0;
    bottom: 0;
}
</style>
