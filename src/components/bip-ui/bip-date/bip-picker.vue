<template>
	<view class="w-picker">
		<view class="mask" :class="{ show: showPicker }" @tap="maskTap" @touchmove.stop.prevent catchtouchmove="true"></view>
		<view class="w-picker-cnt" :class="{ show: showPicker }">
			<view class="w-picker-hd" @touchmove.stop.prevent catchtouchmove="true">
				<view class="w-picker-btn" @tap="pickerCancel">取消</view>
				<view class="w-picker-btn" :style="{ color: themeColor }" @tap="pickerConfirm">确定</view>
			</view>
			
			<view class="w-picker-view" v-if="mode == 'linkage'">
				<picker-view :indicator-style="itemHeight" :value="pickVal" @change="bindChange">
					<picker-view-column v-for="(col, colIndex) in data" :key="colIndex">
						<view class="w-picker-item" v-for="(item, index) in col" :key="index">{{ item.label }}</view>
					</picker-view-column>
				</picker-view>
			</view>
			
			<view class="w-picker-view" v-if="mode == 'half'">
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
						<view class="w-picker-item" v-for="(item, index) in data.areas" :key="index">{{ item.label }}</view>
					</picker-view-column>
				</picker-view>
			</view>
			
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
			
			<view class="w-picker-view" v-if="mode == 'yearMonth'">
				<picker-view :indicator-style="itemHeight" :value="pickVal" @change="bindChange">
					<picker-view-column>
						<view class="w-picker-item" v-for="(item, index) in data.years" :key="index">{{ item }}年</view>
					</picker-view-column>
					<picker-view-column>
						<view class="w-picker-item" v-for="(item, index) in data.months" :key="index">{{ item }}月</view>
					</picker-view-column>
				</picker-view>
			</view>
			
			<view class="w-picker-view" v-if="mode == 'dateTime'">
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
		
			<view class="w-picker-view" v-if="mode == 'range'">
				<picker-view :indicator-style="itemHeight" :value="pickVal" @change="bindChange">
					<picker-view-column>
						<view class="w-picker-item" v-for="(item, index) in data.fyears" :key="index">{{ item }}</view>
					</picker-view-column>
					<picker-view-column>
						<view class="w-picker-item" v-for="(item, index) in data.fmonths" :key="index">{{ item }}</view>
					</picker-view-column>
					<picker-view-column>
						<view class="w-picker-item" v-for="(item, index) in data.fdays" :key="index">{{ item }}</view>
					</picker-view-column>
					<picker-view-column><view class="w-picker-item">-</view></picker-view-column>
					<picker-view-column>
						<view class="w-picker-item" v-for="(item, index) in data.tyears" :key="index">{{ item }}</view>
					</picker-view-column>
					<picker-view-column>
						<view class="w-picker-item" v-for="(item, index) in data.tmonths" :key="index">{{ item }}</view>
					</picker-view-column>
					<picker-view-column>
						<view class="w-picker-item" v-for="(item, index) in data.tdays" :key="index">{{ item }}</view>
					</picker-view-column>
				</picker-view>
			</view>
			
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
			
			<view class="w-picker-view" v-if="mode == 'region'">
				<picker-view :indicator-style="itemHeight" :value="pickVal" @change="bindChange">
					<picker-view-column>
						<view class="w-picker-item" v-for="(item, index) in data.provinces" :key="index">{{ item.label }}</view>
					</picker-view-column>
					<picker-view-column>
						<view class="w-picker-item" v-for="(item, index) in data.citys" :key="index">{{ item.label }}</view>
					</picker-view-column>
					<picker-view-column v-if="!hideArea">
						<view class="w-picker-item" v-for="(item, index) in data.areas" :key="index">{{ item.label }}</view>
					</picker-view-column>
				</picker-view>
			</view>
			
			<view class="w-picker-view" v-if="mode == 'selector'">
				<picker-view :indicator-style="itemHeight" :value="pickVal" @change="bindChange">
					<picker-view-column>
						<view class="w-picker-item" v-for="(item, index) in data" :key="index">{{ item.label }}</view>
					</picker-view-column>
				</picker-view>
			</view>
			
			<view class="w-picker-view" v-if="mode=='limit'">
				<picker-view :indicator-style="itemHeight" :value="pickVal" @change="bindChange">
					<picker-view-column>
						<view class="w-picker-item" v-for="(item,index) in data.date" :key="index">{{item.label}}</view>
					</picker-view-column>
					<picker-view-column>
						<view class="w-picker-item" v-for="(item,index) in data.hours" :key="index">{{item.label}}时</view>
					</picker-view-column>
					<picker-view-column>
						<view class="w-picker-item" v-for="(item,index) in data.minutes" :key="index">{{item.label}}分</view>
					</picker-view-column>
				</picker-view>
			</view>
			
			<view class="w-picker-view" v-if="mode=='limitHour'">
				<picker-view :indicator-style="itemHeight" :value="pickVal" @change="bindChange">
					<picker-view-column>
						<view class="w-picker-item" v-for="(item,index) in data.date" :key="index">{{item.label}}</view>
					</picker-view-column>
					<picker-view-column>
						<view class="w-picker-item" v-for="(item,index) in data.areas" :key="index">{{item.label}}</view>
					</picker-view-column>
					<picker-view-column>
						<view class="w-picker-item" v-for="(item,index) in data.hours" :key="index">{{item.label}}时</view>
					</picker-view-column>
				</picker-view>
			</view>
			
		</view>
	</view>
</template>
<script lang="ts">
import { Vue, Prop, Component, Watch } from 'vue-property-decorator';
import initPicker from './w-picker.js';
import provinces from './city-data/province.js';
import citys from './city-data/city.js';
import areas from './city-data/area.js';
function oneOf(value: any, validList: Array<any>) {
	for (let i = 0; i < validList.length; i++) {
		if (value === validList[i]) {
			return true;
		}
	}
	throw new Error('mode无效，请选择有效的mode!');
	return false;
}

const modeList = ['half', 'date', 'dateTime', 'yearMonth', 'time', 'region', 'selector', 'limit', 'limitHour', 'range', 'linkage']; //过滤无效mode;
@Component({})
export default class bipPicker extends Vue {
	result: Array<any> = [];
	data: any = {};
	checkArr: Array<any> = [];
	checkValue: Array<any> = [];
	pickVal: Array<Number> = [];
	tempSS: Array<Number> = [];
	showPicker: boolean = false;
	resultStr: string = '';
	itemHeight: string = `height: ${uni.upx2px(88)}px`;
	@Prop({
		type: String,
		validator(mode: string) {
			return oneOf(mode, modeList);
		},
		default: 'date'
	})
	mode!: string;
	@Prop({ type: String, default: '#f5a200' }) themeColor!: string;
	@Prop({ type: [String, Number], default: '1900' }) startYear!: string;
	@Prop({ type: [String, Number], default: new Date().getFullYear() + '' }) endYear!: string;
	@Prop({ type: Array, default: [0, 0, 0, 0, 0, 0, 0] }) defaultVal!: [];
	@Prop({ type: Array, default: null }) areaCode!: [];
	@Prop({ type: Boolean, default: false }) hideArea!: boolean;
	@Prop({ type: [String, Number], default: 1 }) step!: number;
	@Prop({ type: Boolean, default: false }) current!: boolean;
	@Prop({ type: Array, default: [] }) selectList!: [];
	//以下参数仅对mode==limit有效
	@Prop({ type: [String, Number], default: 7 }) dayStep!: number;
	@Prop({ type: [String, Number], default: 8 }) startHour!: number;
	@Prop({ type: [String, Number], default: 20 }) endHour!: number;
	@Prop({ type: [String, Number], default: 10 }) minuteStep!: number;
	@Prop({ type: [String, Number], default: 30 }) afterStep!: number;
	@Prop({ type: Boolean, default: false }) disabledAfter!: boolean;
	@Prop({ type: Array, default: [] }) linkList!: [];
	@Prop({ type: Array, default: null }) value!: [];
	@Prop({ type: [String, Number], default: 2 }) level!: number;
	clickNum:number = 0;
	mounted() {
		this.initData();
		// // this.pickVal = this.defaultVal;
		// this.pickVal.splice(1, 1, 0)
		// console.log(this.pickVal)
	}

	@Watch('mode')
	modeChange() {
		this.initData();
	}

	@Watch('selectList')
	selectListChange() {
		this.initData();
	}
	@Watch('linkList')
	linkListChange() {
		this.initData();
	}
	
	/**
	 * 取消选择
	 */
	pickerCancel(){
		this.$emit("cancel",{
			checkArr:this.checkArr,
			defaultVal:this.pickVal
		});
		this.showPicker = false;
	}
	/**
	 * 确认选择
	 */
	pickerConfirm(e:any){
		switch(this.mode){
			case "range":
				let checkArr:Array<any>=this.checkArr;
				let fDateTime=new Date(checkArr[0],checkArr[1],checkArr[2]);
				let tDateTime=new Date(checkArr[3],checkArr[4],checkArr[5]);
				let dVal=this.pickVal;
				if(fDateTime>tDateTime){
					this.checkArr=[checkArr[3],checkArr[4],checkArr[5],checkArr[0],checkArr[1],checkArr[2]];
					this.pickVal=[dVal[4],dVal[5],dVal[6],0,dVal[0],dVal[1],dVal[2]];
					this.$emit("confirm",{
						checkArr:this.checkArr,
						from:checkArr[3]+"-"+checkArr[4]+"-"+checkArr[5],
						to:checkArr[0]+"-"+checkArr[1]+"-"+checkArr[2],
						defaultVal:this.pickVal,
						result:this.resultStr
					});
				}else{
					this.$emit("confirm",{
						checkArr:this.checkArr,
						from:checkArr[0]+"-"+checkArr[1]+"-"+checkArr[2],
						to:checkArr[3]+"-"+checkArr[4]+"-"+checkArr[5],
						defaultVal:this.pickVal,
						result:this.resultStr
					});
				}
				break;
			case "limit":
				let aTime=new Date().getTime();
				let bTime=new Date(this.resultStr.replace(/-/g,'/')).getTime();
				if(aTime>bTime){
					uni.showModal({
						title:"提示",
						content:"选择时间必须大于当前时间",
						confirmColor:this.themeColor
					});
					return;
				}
				this.$emit("confirm",{
					checkArr:this.checkArr,
					defaultVal:this.pickVal,
					result:this.resultStr
				});
				break;
			case "region":
			case "linkage":
				this.$emit("confirm",{
					checkArr:this.checkArr,
					checkValue:this.checkValue,
					defaultVal:this.pickVal,
					result:this.resultStr
				});
				break;
			default:
				this.$emit("confirm",{
					checkArr:this.checkArr,
					defaultVal:this.pickVal,
					result:this.resultStr
				});
				break;
		}
		this.showPicker = false;
	}
	
	useCurrent(){
		let aToday=new Date();
		let tYear=aToday.getFullYear().toString();
		let tMonth=this.formatNum(aToday.getMonth()+1).toString();
		let tDay=this.formatNum(aToday.getDate()).toString();
		let tHours=this.formatNum(aToday.getHours()).toString();
		let tMinutes:any=this.formatNum(aToday.getMinutes()).toString();
		let tSeconds=this.formatNum(aToday.getSeconds()).toString();
		if(this.current){
			return [tYear,tMonth,tDay,tHours,(Math.floor(tMinutes/this.step)*this.step).toString(),tSeconds];
		}else{
			return this.defaultVal;
		}
	}
	
	initData() {
		let _this = this;
		let data:any = {};
		let mode = _this.mode;
		let year, month, day, hour, minute, second, province, city, area;
		let col1, col2, col3;
		let dVal:Array<any> = [];
		switch (mode) {
			case 'linkage':
				let init:any;
				if (_this.value) {
					init = _this.getLinkageVal(_this.value, true);
				} else {
					init = _this.getLinkageVal(_this.defaultVal);
				}
				dVal = init.dval;
				data = init.data;
				_this.checkArr = init.checkArr;
				_this.checkValue = init.checkValue;
				_this.resultStr = init.resultStr;
				break;
			case 'region':
				if (_this.areaCode) {
					dVal= _this.getRegionVal(_this.areaCode, true);
				} else {
					dVal = _this.getRegionVal(_this.defaultVal);
				}
				if (_this.hideArea) {
					data = {
						provinces: provinces,
						citys: citys[dVal[0]]
					};
				} else {
					data = {
						provinces: provinces,
						citys: citys[dVal[0]],
						areas: areas[dVal[0]][dVal[1]]
					};
				}
				break;
			case 'selector':
				data = _this.selectList;
				dVal = _this.defaultVal;
				break;
			case 'limit':
				data = initPicker.limit.init(_this.dayStep, _this.startHour, _this.endHour, _this.minuteStep, _this.afterStep);
				dVal = data.defaultVal && _this.current ? data.defaultVal : _this.defaultVal;
				break;
			case 'limitHour':
				data = initPicker.limitHour.init(_this.dayStep);
				dVal = data.defaultVal && _this.current ? data.defaultVal : _this.defaultVal;
				break;
			case 'range':
				data = initPicker.range.init(_this.startYear, _this.endYear, _this.useCurrent(), _this.current);
				dVal = data.defaultVal && _this.current ? data.defaultVal : _this.defaultVal;
				break;
			default:
				data = initPicker.date.init(_this.startYear, _this.endYear, _this.mode, _this.step, _this.useCurrent(), _this.current, _this.disabledAfter);
				dVal = data.defaultVal && _this.current ? data.defaultVal : _this.defaultVal;
				break;
		}
		_this.data = data;
		switch (mode) {
			case 'limitHour':
				col1 = data.date[dVal[0]] || data.date[data.date.length - 1];
				col2 = data.areas[dVal[2]] || data.areas[data.areas.length - 1];
				col3 = data.hours[dVal[1]] || data.hours[data.hours.length - 1];
				_this.checkArr = [col1, col2, col3];
				_this.resultStr = `${col1.value + ' ' + col2.label + ' ' + col3.label + '时'}`;
				break;
			case 'limit':
				col1 = data.date[dVal[0]] || data.date[data.date.length - 1];
				col2 = data.hours[dVal[1]] || data.hours[data.hours.length - 1];
				col3 = data.minutes[dVal[2]] || data.minutes[data.minutes.length - 1];
				_this.checkArr = [col1, col2, col3];
				_this.resultStr = `${col1.value + ' ' + col2.value + ':' + col3.value + ':' + '00'}`;
				break;
			case 'range':
				let fYear = data.fyears[dVal[0]] || data.fyears[data.fyears.length - 1];
				let fmonth = data.fmonths[dVal[1]] || data.fmonths[data.fmonths.length - 1];
				let fday = data.fdays[dVal[2]] || data.fdays[data.fdays.length - 1];
				let tYear = data.tyears[dVal[4]] || data.tyears[data.tyears.length - 1];
				let tmonth = data.tmonths[dVal[5]] || data.tmonths[data.tmonths.length - 1];
				let tday = data.tdays[dVal[6]] || data.tdays[data.tdays.length - 1];
				_this.checkArr = [fYear, fmonth, fday, tYear, tmonth, tday];
				_this.resultStr = `${fYear + '-' + fmonth + '-' + fday + '至' + tYear + '-' + tmonth + '-' + tday}`;
				break;
			case 'half':
				year = data.years[dVal[0]] || data.years[data.years.length - 1];
				month = data.months[dVal[1]] || data.months[data.months.length - 1];
				day = data.days[dVal[2]] || data.days[data.days.length - 1];
				area = data.areas[dVal[3]] || data.areas[data.areas.length - 1];
				_this.checkArr = [year, month, day, area];
				_this.resultStr = `${year + '-' + month + '-' + day + ' ' + area.label}`;
				break;
			case 'date':
				year = data.years[dVal[0]] || data.years[data.years.length - 1];
				month = data.months[dVal[1]] || data.months[data.months.length - 1];
				day = data.days[dVal[2]] || data.days[data.days.length - 1];
				_this.checkArr = [year, month, day];
				_this.resultStr = `${year + '-' + month + '-' + day}`;
				break;
			case 'yearMonth':
				year = data.years[dVal[0]] || data.years[data.years.length - 1];
				month = data.months[dVal[1]] || data.months[data.months.length - 1];
				_this.checkArr = [year, month];
				_this.resultStr = `${year + '-' + month}`;
				break;
			case 'dateTime':
				year = data.years[dVal[0]] || data.years[data.years.length - 1];
				month = data.months[dVal[1]] || data.months[data.months.length - 1];
				day = data.days[dVal[2]] || data.days[data.days.length - 1];
				hour = data.hours[dVal[3]] || data.hours[data.hours.length - 1];
				minute = data.minutes[dVal[4]] || data.minutes[data.minutes.length - 1];
				second = data.seconds[dVal[5]] || data.seconds[data.seconds.length - 1];
				_this.resultStr = `${year + '-' + month + '-' + day + ' ' + hour + ':' + minute + ':' + second}`;
				_this.checkArr = [year, month, day, hour, minute];
				break;
			case 'time':
				hour = data.hours[dVal[0]] || data.hours[data.hours.length - 1];
				minute = data.minutes[dVal[1]] || data.minutes[data.minutes.length - 1];
				second = data.seconds[dVal[2]] || data.seconds[data.seconds.length - 1];
				_this.checkArr = [hour, minute, second];
				_this.resultStr = `${hour + ':' + minute + ':' + second}`;
				break;
			case 'region':
				province = data.provinces[dVal[0]];
				city = data.citys[dVal[1]];
				if (!_this.hideArea) {
					area = data.areas[dVal[2]];
					_this.checkArr = [province.label, city.label, area.label];
					_this.checkValue = [province.value, city.value, area.value];
					_this.resultStr = province.label + city.label + area.label;
				} else {
					_this.checkArr = [province.label, city.label];
					_this.checkValue = [province.value, city.value];
					_this.resultStr = province.label + city.label;
				}
				break;
			case 'selector':
				_this.checkArr = data[dVal[0]] || data[data.length - 1];
				_this.resultStr = data[dVal[0]].label || data[data.length - 1].label;
				break;
		}
		_this.$nextTick(() => {
			_this.tempSS = dVal;
		});
	}
	
	formatNum(num:number){
		return num<10?'0'+num:num+'';
	}
	
	maskTap(){
		this.showPicker = false;
	}
	
	show(){
		this.showPicker = true;
		this.clickNum++;
		if(this.current){
			this.initData();
			this.pickVal = this.tempSS;
			return ;
		}
		if(this.clickNum==1){
			this.pickVal = this.tempSS;
			return ;
		}
	}
	
	hide(){
		this.showPicker = false;
	}
	
	getLinkageVal(value:Array<any>,flag:any = false){
		let dval:Array<any>=[];
		let arr:Array<any>=value;
		let list=this.linkList;
		let lev=this.level;
		let k=0;
		let checkArr:Array<any>=[];
		let checkValue:Array<any>=[];
		let resultStr="";
		let data:Array<any>=[];
		switch(lev){
			case 2:
				dval=[0,0];
				break;
			case 3:
				dval=[0,0,0];
				break;
		}
		const getData=(obj:any,key:number)=>{
			if(key<lev){
				data.push(obj);
				obj.map((v:any,j:number)=>{
					if(flag?v.value==arr[key]:v.label==arr[key]){
						dval[key]=j;
						checkArr.push(v.label);
						checkValue.push(v.value);
						resultStr+=v.label;
						if(v.children){
							getData(v.children,key+=1);
						}
					}
				});
				return {
					data,
					dval,
					checkArr,
					checkValue,
					resultStr
				};
			}else{
				return false;
			}
		};
		return getData(list,k);
	}
	
	getRegionVal(value:Array<any>,useCode:any=false){
		let province=value[0];
		let city=value[1];
		let a=0,b=0,c=0,dval:Array<any>=[];
		let _this=this;
		provinces.map((v:any,k:number)=>{
			if(useCode?v.value==province:v.label==province){
				a=k;
			}
		})
		citys[a].map((v:any,k:number)=>{
			if(useCode?v.value==city:v.label==city){
				b=k;
			}
		})
		if(!_this.hideArea){
			let area=value[2];
			areas[a][b].map((v:any,k:number)=>{
				if(useCode?v.value==area:v.label==area){
					c=k;
				}
			})
			dval=[a,b,c];
		}else{
			dval=[a,b];
		}
		return dval;
	}

	/**
	 * 绑定的值发生改变
	 */
	bindChange(val:any){
		let _this=this;
		let arr=val.detail.value;
		let year="",month="",day="",hour="",minute="",second="",note:Array<any>=[],province,city,area;
		let checkArr=_this.checkArr;
		let days:Array<any>=[];
		let months:Array<any>=[];
		let mode=_this.mode;
		let col1,col2,col3,d,a,h,m;
		switch(mode){
			case "limitHour":
				col1=_this.data.date[arr[0]];
				col2=_this.data.areas[arr[1]];
				col3=_this.data.hours[arr[2]];
				if(col1.value!=checkArr[0].value){
					arr[1]=0;
					arr[2]=0;
					let areas=initPicker.limitHour.initAreas(col1);
					_this.data.areas=areas;
					let hours=initPicker.limitHour.initHours(col1,_this.data.areas[arr[1]]);
					_this.data.hours=hours;
				};
				if(col2.value!=checkArr[1].value){
					arr[2]=0;
					let hours=initPicker.limitHour.initHours(col1,_this.data.areas[arr[1]]);
					_this.data.hours=hours;
				};
				d=_this.data.date[arr[0]]||_this.data.date[_this.data.date.length-1];
				a=_this.data.areas[arr[1]]||_this.data.areas[_this.data.areas.length-1];
				h=_this.data.hours[arr[2]]||_this.data.hours[_this.data.hours.length-1];
				_this.checkArr=[d,a,h];
				_this.resultStr=`${d.value+' '+a.label+' '+h.label+"时"}`;
				break;
			case "limit":
				col1=_this.data.date[arr[0]];
				col2=_this.data.hours[arr[1]];
				if(col1.value!=checkArr[0].value){
					let hours=initPicker.limit.initHours(_this.startHour,_this.endHour,_this.minuteStep,_this.afterStep,col1.value);
					let minutes=initPicker.limit.initMinutes(_this.startHour,_this.endHour,_this.minuteStep,_this.afterStep,col1.value,col2.value);
					_this.data.hours=hours;
					_this.data.minutes=minutes;
				};
				if(col2.value!=checkArr[1].value){
					let minutes=initPicker.limit.initMinutes(_this.startHour,_this.endHour,_this.minuteStep,_this.afterStep,col1.value,col2.value);
					_this.data.minutes=minutes;
				};
				d=_this.data.date[arr[0]]||_this.data.date[_this.data.date.length-1];
				h=_this.data.hours[arr[1]]||_this.data.hours[_this.data.hours.length-1];
				m=_this.data.minutes[arr[2]]||_this.data.minutes[_this.data.minutes.length-1];
				_this.checkArr=[d,h,m];
				_this.resultStr=`${d.value+' '+h.value+':'+m.value+":"+"00"}`;
				break;
			case "range":
				let fyear=_this.data.fyears[arr[0]]||_this.data.fyears[_this.data.fyears.length-1];
				let fmonth=_this.data.fmonths[arr[1]]||_this.data.fmonths[_this.data.fmonths.length-1];
				let fday=_this.data.fdays[arr[2]]||_this.data.fdays[_this.data.fdays.length-1];
				let tyear=_this.data.tyears[arr[4]]||_this.data.tyears[_this.data.tyears.length-1];
				let tmonth=_this.data.tmonths[arr[5]]||_this.data.tmonths[_this.data.tmonths.length-1];
				let tday=_this.data.tdays[arr[6]]||_this.data.tdays[_this.data.tdays.length-1];
				if(fyear!=checkArr[0]){
					days=initPicker.range.initDays(fyear,fmonth);
					_this.data.fdays=days;
				};
				if(fmonth!=checkArr[1]){
					days=initPicker.range.initDays(fyear,fmonth);
					_this.data.fdays=days;
				};
				if(tyear!=checkArr[3]){
					days=initPicker.range.initDays(tyear,tmonth);
					_this.data.tdays=days;
				};
				if(tmonth!=checkArr[4]){
					days=initPicker.range.initDays(tyear,tmonth);
					_this.data.tdays=days;
				};
				_this.checkArr=[fyear,fmonth,fday,tyear,tmonth,tday];
				_this.resultStr=`${fyear+'-'+fmonth+'-'+fday+'至'+tyear+'-'+tmonth+'-'+tday}`;
				break;
			case "half":
				year=_this.data.years[arr[0]]||_this.data.years[_this.data.years.length-1];
				month=_this.data.months[arr[1]]||_this.data.months[_this.data.months.length-1];
				day=_this.data.days[arr[2]]||_this.data.days[_this.data.days.length-1];
				area=_this.data.areas[arr[3]]||_this.data.areas[_this.data.areas.length-1];
				if(year!=checkArr[0]){
					days=initPicker.date.initDays(year,month,_this.disabledAfter);
					months=initPicker.date.initMonths(year,_this.disabledAfter);
					_this.data.days=days;
					_this.data.months=months;
				};
				if(month!=checkArr[1]){
					days=initPicker.date.initDays(year,month,_this.disabledAfter);
					_this.data.days=days;
				};
				_this.checkArr=[year,month,day,area];
				_this.resultStr=`${year+'-'+month+'-'+day+area.label}`;
				break;		
			case "date":
				year=_this.data.years[arr[0]]||_this.data.years[_this.data.years.length-1];
				month=_this.data.months[arr[1]]||_this.data.months[_this.data.months.length-1];
				day=_this.data.days[arr[2]]||_this.data.days[_this.data.days.length-1];
				if(year!=checkArr[0]){
					days=initPicker.date.initDays(year,month,_this.disabledAfter);
					months=initPicker.date.initMonths(year,_this.disabledAfter);
					_this.data.days=days;
					_this.data.months=months;
				};
				if(month!=checkArr[1]){
					days=initPicker.date.initDays(year,month,_this.disabledAfter);
					_this.data.days=days;
				};
				_this.checkArr=[year,month,day];
				_this.resultStr=`${year+'-'+month+'-'+day}`;
				break;
			case "yearMonth":
				year=_this.data.years[arr[0]]||_this.data.years[_this.data.years.length-1];
				month=_this.data.months[arr[1]]||_this.data.months[_this.data.months.length-1];
				if(year!=checkArr[0]){
					months=initPicker.date.initMonths(year,_this.disabledAfter);
					_this.data.months=months;
				};
				_this.checkArr=[year,month];
				_this.resultStr=`${year+'-'+month}`;
				break;
			case "dateTime":
				year=_this.data.years[arr[0]]||_this.data.years[_this.data.years.length-1];
				month=_this.data.months[arr[1]]||_this.data.months[_this.data.months.length-1];
				day=_this.data.days[arr[2]]||_this.data.days[_this.data.days.length-1];
				hour=_this.data.hours[arr[3]]||_this.data.hours[_this.data.hours.length-1];
				minute=_this.data.minutes[arr[4]]||_this.data.minutes[_this.data.minutes.length-1];
				second=_this.data.seconds[arr[5]]||_this.data.seconds[_this.data.seconds.length-1];
				if(year!=checkArr[0]){
					days=initPicker.date.initDays(year,month);
					_this.data.days=days;
				};
				if(month!=checkArr[1]){
					days=initPicker.date.initDays(year,month);
					_this.data.days=days;
				};
				_this.checkArr=[year,month,day,hour,minute,second];
				_this.resultStr=`${year+'-'+month+'-'+day+' '+hour+':'+minute+':'+second}`;
				break;
			case "time":
				hour=_this.data.hours[arr[0]]||_this.data.hours[_this.data.hours.length-1];
				minute=_this.data.minutes[arr[1]]||_this.data.minutes[_this.data.minutes.length-1];
				second=_this.data.seconds[arr[2]]||_this.data.seconds[_this.data.seconds.length-1];
				_this.checkArr=[hour,minute,second];
				_this.resultStr=`${hour+':'+minute+':'+second}`;
				break;
			case "linkage":
				let c1,c2,c3;
				let list:Array<any>=this.linkList;
				c1=_this.data[0][arr[0]]||_this.data[0][0];
				c2=_this.data[1][arr[1]]||_this.data[1][0];
				if(this.level==3){
					c3=_this.data[2][arr[2]]||_this.data[2][0];
					if(c1.label!=checkArr[0]){
						_this.data[1]=list[arr[0]].children;
						_this.data[2]=list[arr[0]].children[arr[1]].children;
						arr[1] = 0;
						arr[2] = 0;
						c2=_this.data[1][arr[1]]||_this.data[1][0];
						c3=_this.data[2][arr[2]]||_this.data[2][0];
					};
					if(c2.label!=checkArr[1]){
						_this.data[2]=list[arr[0]].children[arr[1]].children;
						arr[2] = 0;
						c3=_this.data[2][arr[2]]||_this.data[2][0];
					};
					_this.checkArr=[c1.label,c2.label,c3.label];
					_this.checkValue=[
						_this.data[0][arr[0]]?_this.data[0][arr[0]].value:_this.data[0][0].value,
						_this.data[1][arr[1]]?_this.data[1][arr[1]].value:_this.data[1][0].value,
						_this.data[2][arr[2]]?_this.data[2][arr[2]].value:_this.data[2][0].value
					];
					_this.resultStr=c1.label+c2.label+c3.label;
				}else{
					if(c1.label!=checkArr[0]){
						_this.data[1]=list[arr[0]].children;
						arr[1] = 0;
						c2=_this.data[1][arr[1]]||_this.data[1][0];
					};
					_this.checkArr=[c1.label,c2.label];
					_this.checkValue=[
						_this.data[0][arr[0]]?_this.data[0][arr[0]].value:_this.data[0][0].value,
						_this.data[1][arr[1]]?_this.data[1][arr[1]].value:_this.data[1][0].value
					];
					_this.resultStr=c1.label+c2.label;
				}
				break;
			case "region":
				province=_this.data.provinces[arr[0]]||_this.data.provinces[0];
				city=_this.data.citys[arr[1]]||_this.data.citys[0];
				if(!_this.hideArea){
					area=_this.data.areas[arr[2]]||_this.data.areas[0];
				}
				
				if(province.label!=checkArr[0]){
					_this.data.citys = citys[arr[0]]||citys[0];
					if(!_this.hideArea){
						_this.data.areas = areas[arr[0]][0]||areas[0][0];
					}
					arr[1] = 0;
					arr[2] = 0;
					city=_this.data.citys[arr[1]]||_this.data.citys[0];
					if(!_this.hideArea){
						area=_this.data.areas[arr[2]]||_this.data.areas[0];
					}
				};
				if(city.label!=checkArr[1]&&!_this.hideArea){
					_this.data.areas = areas[arr[0]][arr[1]]||areas[0][0];
					arr[2]=0;
					area=_this.data.areas[arr[2]]||_this.data.areas[0];
				};
				if(!_this.hideArea){
					_this.checkArr=[province.label,city.label,area.label];
					_this.checkValue=[
						_this.data.provinces[arr[0]]?_this.data.provinces[arr[0]].value:_this.data.provinces[0].value,
						_this.data.citys[arr[1]]?_this.data.citys[arr[1]].value:_this.data.citys[0].value,
						_this.data.areas[arr[2]]?_this.data.areas[arr[2]].value:_this.data.areas[0].value
					];
					_this.resultStr=province.label+city.label+area.label;
				}else{
					_this.checkArr=[province.label,city.label];
					_this.checkValue=[
						_this.data.provinces[arr[0]]?_this.data.provinces[arr[0]].value:_this.data.provinces[0].value,
						_this.data.citys[arr[1]]?_this.data.citys[arr[1]].value:_this.data.citys[0].value
					];
					_this.resultStr=province.label+city.label;
				};
				break;
			case "selector":
				_this.checkArr=_this.data[arr[0]]||_this.data[_this.data.length-1];
				_this.resultStr=_this.data[arr[0]]?_this.data[arr[0]].label:_this.data[_this.data.length-1].label;
				break;	
		}
		_this.$nextTick(()=>{
			_this.pickVal=arr;
		})
	}
	
	
}
</script>

<style lang="scss">
@import './picker.scss';
</style>
