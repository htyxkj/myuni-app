<template>
	<view>
		<view v-if="maskShow && !insert" :class="{ 'ani-mask-show': aniMaskShow }" class="uni-calendar__mask" @touchmove.stop.prevent="clear" />
		<view v-if="maskShow || insert" :class="{ 'ani-calendar-show': aniMaskShow, 'uni-calendar__static': insert }" class="uni-calendar__box">
			<view v-if="!insert" class="uni-calendar__nav">
				<view class="uni-calendar__nav-item" @click="close">取消</view>
				<view class="uni-calendar__nav-item" @click="confirm">确认</view>
			</view>
			<view class="uni-calendar__wrapper">
				<view class="uni-calenda__content">
					<view class="uni-calendar__panel">
						<view class="uni-calendar__date-befor" @tap="dataBefor(-1, 'month')"><text class="iconfont icon-jiantou" /></view>
						<view class="uni-calendar__panel-box">
							<view>{{ canlender.year || '' }}年</view>
							<view>{{ canlender.month || '' }}月</view>
						</view>
						<view class="uni-calendar__date-after uni-calendar__rollback" @tap="dataBefor(1, 'month')"><text class="iconfont icon-jiantou " /></view>
						<view class="uni-calendar__backtoday" @tap="backtoday">回到今天</view>
					</view>
					<view v-if="isLunar" class="uni-calendar__day-detail">
						<view>{{ canlender.year + '年' + canlender.month + '月' + canlender.date + '日 （' + canlender.lunar.astro + ')' }}</view>
						<view>
							{{ canlender.lunar.gzYear + '年' + canlender.lunar.gzMonth + '月' + canlender.lunar.gzDay + '日 (' + canlender.lunar.Animal + '年)' }}
							{{ canlender.lunar.IMonthCn + canlender.lunar.IDayCn }} {{ canlender.lunar.isTerm ? canlender.lunar.Term : '' }}
						</view>
					</view>
					<view class="uni-calendar__header">
						<view class="uni-calendar__week">日</view>
						<view class="uni-calendar__week">一</view>
						<view class="uni-calendar__week">二</view>
						<view class="uni-calendar__week">三</view>
						<view class="uni-calendar__week">四</view>
						<view class="uni-calendar__week">五</view>
						<view class="uni-calendar__week">六</view>
					</view>
					<uni-calendar-item :canlender="canlender" :lunar="isLunar" @selectDays="selectDays" />
				</view>
			</view>
		</view>
	</view>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import CALENDAR from './calendar.js';
import uniCalendarItem from './uni-calendar-item.vue';
@Component({
	components: {
		uniCalendarItem
	}
})
export default class UniCalendar extends Vue {
	/**
	 * 当前日期
	 */
	@Prop({ type: String, default: '' }) date!: string;
	/**
	 * 打点日期
	 */
	@Prop({ type: Array, default: [] }) selected!: Array<any>;

	/**
	 * 是否开启阴历日期
	 */
	@Prop({ type: Boolean, default: false }) lunar!: boolean;
	/**
	 * 是否禁用今天之前的日期
	 */
	@Prop({ type: Boolean, default: false }) disableBefore!: boolean;
	@Prop({ type: String, default: '' }) startDate!: string;
	@Prop({ type: String, default: '' }) endDate!: string;
	/**
	 * 范围
	 */
	@Prop({ type: Boolean, default: false }) range!: boolean;
	/**
	 * 插入
	 */
	@Prop({ type: Boolean, default: false }) insert!: boolean;
	/**
	 * TODO 兼容新旧编译器
	 * 新编译器（自定义组件模式）下必须使用固定数值，否则部分平台下会获取不到节点。
	 * 随机数值是在旧编译器下使用的，旧编译器模式已经不推荐使用，后续直接废掉随机数值的写法。
	 */
	maskShow: boolean = false; // 显示日历
	aniMaskShow: boolean = false;
	dateShow: boolean = false; // 日期是否选择
	canlender: any = {
		weeks: []
	};
	multiple: number = 0;
	multipleDates: any = {
		begin: '',
		end: '',
		data: []
	};
	isLunar: boolean = false;
	@Watch('date')
	dateChange() {
		this.init();
	}
	@Watch('selected')
	selectedChange() {
		this.init();
	}

	@Watch('lunar')
	lunarChange(newVal: boolean) {
		this.isLunar = newVal;
		this.init();
	}
	@Watch('disableBefore')
	disableBeforeChange() {
		this.init();
	}

	@Watch('startDate')
	startDateChange() {
		this.init();
	}

	@Watch('endDate')
	endDateChange() {
		this.init();
	}

	created() {
		this.isLunar = this.lunar;
		this.init();
	}
	clear() {}
	init() {
		// 初始化日历
		// this.canlender = this.getWeek(this.date || new Date());
		this.getMonthAll(0, this.date);
	}
	open() {
		this.maskShow = true;
		this.multiple = 0;
		this.multipleDates.data = [];
		this.multipleDates.begin = '';
		this.multipleDates.end = '';
		this.init();
		this.$nextTick(() => {
			setTimeout(() => (this.aniMaskShow = true), 30);
		});
	}
	close() {
		this.aniMaskShow = false;
		this.$nextTick(() => {
			setTimeout(() => (this.maskShow = false), 300);
		});
	}
	confirm() {
		this.setEmit('confirm');
		this.close();
	}
	/**
	 * 获取当前月份全部日期
	 */
	getMonthAll(index: number, date: any) {
		if (date === '') {
			date = new Date();
		}
		// this.getDate(date, index, 'month')
		const canlender = this.getWeek(this.getDate(date, index, 'month'));
		this.canlender = canlender;
		if (this.insert) {
			this.setEmit('change');
		}
	}

	// 获取日历内容
	getWeek(dateData: any) {
		// 判断当前是 安卓还是ios ，传入不容的日期格式
		if (typeof dateData !== 'object') {
			dateData = dateData.replace(/-/g, '/');
		}
		const selected = this.selected;
		const nowDate = this.getDate(this.date || new Date());
		const { year, month, date, day } = this.getNewDate(dateData);
		let canlender:Array<any> = [];
		let dates: any = {
			firstDay: new Date(year, month - 1, 1).getDay(),
			lastMonthDays: [], // 上个月末尾几天
			currentMonthDys: [], // 本月天数
			nextMonthDays: [], // 下个月开始几天
			endDay: new Date(year, month, 0).getDay(),
			weeks: []
		};
		// 循环上个月末尾几天添加到数组
		for (let i = dates.firstDay; i > 0; i--) {
			const beforeDate = new Date(year, month - 1, -i + 1).getDate() + '';
			dates.lastMonthDays.push({
				date: beforeDate,
				month: month - 1,
				disable: this.isDisableBefore(year, month - 1, parseInt(beforeDate)),
				lunar: this.getlunar(year, month - 1, parseInt(beforeDate)),
				isDay: false
			});
		}
		let clockinfo: any = {
			have: false
		};
		// 循环本月天数添加到数组
		for (let i = 1; i <= new Date(year, month, 0).getDate(); i++) {
			let have = false;
			let clockinfoTemp: any = {};
			// 处理打卡信息
			for (let j = 0; j < selected.length; j++) {
				const selDate = selected[j].date.split('-');
				if (Number(year) === Number(selDate[0]) && Number(month) === Number(selDate[1]) && Number(i) === Number(selDate[2])) {
					have = true;
					clockinfoTemp.have = true;
					clockinfoTemp.date = selected[j].date;
					if (selected[j].info) {
						clockinfoTemp.info = selected[j].info;
					}
					if (JSON.stringify(selected[j].data) === '{}' || selected[j].data !== undefined) {
						clockinfoTemp.data = selected[j].data;
					}
					if (Number(year) === Number(selDate[0]) && Number(month) === Number(selDate[1]) && Number(date) === Number(selDate[2])) {
						clockinfo = clockinfoTemp;
					}
				}
			}

			// 多选
			const { begin, end, data } = this.multipleDates;
			const [bYear, bMonth, bDate] = begin.split('-');
			const [eYear, eMonth, eDate] = end.split('-');
			let checked = false;
			let multipleBegin = false;
			let multipleEnd = false;
			data.forEach((item: any, index: number) => {
				const [mYear, mMonth, mDate] = item.split('-');
				if (year === Number(mYear) && month === Number(mMonth) && i === Number(mDate)) {
					checked = true;
				}
			});

			// 开始日期
			if (year === Number(bYear) && month === Number(bMonth) && i === Number(bDate)) {
				multipleBegin = true;
			}

			// 结束日期
			if (year === Number(eYear) && month === Number(eMonth) && i === Number(eDate)) {
				// console.log(eYear, eMonth, eDate, 'end');
				multipleEnd = true;
			}
			let rdata: any = {
				checked: this.range ? checked : false,
				multipleBegin: this.range ? multipleBegin : false,
				multipleEnd: this.range ? multipleEnd : false,
				date: i + '',
				month: month,
				have: have,
				clockinfo: clockinfoTemp,
				disable: this.isDisableBefore(year, month, i),
				lunar: this.getlunar(year, month, i),
				isDay: nowDate === year + '-' + (month < 10 ? '0' + month : month) + '-' + (i < 10 ? '0' + i : i)
			};
			dates.currentMonthDys.push(rdata);
		}
		const surplus = 42 - (dates.lastMonthDays.length + dates.currentMonthDys.length);
		// 循环下个月开始几天 添加到数组
		for (let i = 1; i < surplus + 1; i++) {
			dates.nextMonthDays.push({
				date: i,
				month: month + 1,
				disable: this.isDisableBefore(year, month + 1, i),
				lunar: this.getlunar(year, month + 1, i),
				isDay: false
			});
		}
		canlender = canlender.concat(dates.lastMonthDays, dates.currentMonthDys, dates.nextMonthDays);
		// 拼接数组  上个月开始几天 + 本月天数+ 下个月开始几天
		for (let i = 0; i < canlender.length; i++) {
			if (i % 7 === 0) {
				dates.weeks[parseInt((i / 7)+'')] = new Array(7);
			}
			dates.weeks[parseInt((i / 7)+'')][i % 7] = canlender[i];
		}
		
		return {
			weeks: dates.weeks,
			month: month,
			date: date,
			day: day,
			year: year,
			clockinfo,
			lunar: CALENDAR.solar2lunar(year, month, date),
			lastDate: dates.currentMonthDys[dates.currentMonthDys.length - 1].date
		};
	
	}

	/**
	 * 今天之前是否禁用
	 * @param {Object} year 年
	 * @param {Object} month 月
	 * @param {Object} date 日
	 */
	isDisableBefore(year: number, month: number, date: number) {
		const nowDate = this.date || new Date();
		const time = year + '-' + month + '-' + date;
		let startDate = false;
		let endDate = false;
		if (this.startDate) {
			startDate = this.dateCompare(this.startDate, time);
		}
		if (this.endDate) {
			endDate = this.dateCompare(this.getDate(this.endDate, 1), time);
		}

		if (this.disableBefore) {
			if (!this.startDate) {
				if (!this.endDate) {
					return !this.dateCompare(this.getDate(nowDate, 0), time);
				} else {
					return !this.dateCompare(this.getDate(nowDate, 0), time) || endDate;
				}
			} else {
				return !this.dateCompare(this.getDate(nowDate, 0), time) || !startDate || endDate;
			}
		} else {
			if (!this.startDate) {
				if (!this.endDate) {
					return false;
				} else {
					return endDate;
				}
			} else {
				return !startDate || endDate;
			}
		}
	}

	/**
	 * 比较时间大小
	 */
	dateCompare(startDate: string, endDate: string) {
		// 计算截止时间
		let sd = new Date(startDate.replace('-', '/').replace('-', '/'));
		// 计算详细项的截止时间
		let ed = new Date(endDate.replace('-', '/').replace('-', '/'));
		if (sd <= ed) {
			return true;
		} else {
			return false;
		}
	}

	/**
	 * 计算阴历日期显示
	 */
	getlunar(year: number, month: number, date: number) {
		let res: any = CALENDAR.solar2lunar(year, month, date);
		return res.IDayCn;
	}

	/**
	 * 获取日期
	 * @param {Object} dateData
	 */
	getNewDate(dateData: any) {
		const _date = new Date(dateData);
		let res: any = {
			year: _date.getFullYear(), // 年
			month: _date.getMonth() + 1, // 月
			date: _date.getDate(), // 日
			day: _date.getDay() // 天
		};
		return res;
	}

	/**
	 * 获取任意时间
	 */
	getDate(date: any, AddDayCount = 0, str = 'day') {
		if (typeof date !== 'object') {
			date = date.replace(/-/g, '/');
		}
		const dd = new Date(date);
		switch (str) {
			case 'day':
				dd.setDate(dd.getDate() + AddDayCount); // 获取AddDayCount天后的日期
				break;
			case 'month':
				if (dd.getDate() === 31) {
					dd.setDate(dd.getDate() + AddDayCount);
				} else {
					dd.setMonth(dd.getMonth() + AddDayCount); // 获取AddDayCount天后的日期
				}
				break;
			case 'year':
				dd.setFullYear(dd.getFullYear() + AddDayCount); // 获取AddDayCount天后的日期
				break;
		}
		const y = dd.getFullYear();
		const m = dd.getMonth() + 1 < 10 ? '0' + (dd.getMonth() + 1) : dd.getMonth() + 1; // 获取当前月份的日期，不足10补0
		const d = dd.getDate() < 10 ? '0' + dd.getDate() : dd.getDate(); // 获取当前几号，不足10补0
		return y + '-' + m + '-' + d;
	}

	/**
	 * 设置事件
	 * @param {Object} canlender
	 */
	setEmit(name: string) {
		const canlender: any = this.canlender;
		this.$emit(name, {
			range: this.range ? this.multipleDates : {},
			year: canlender.year,
			month: canlender.month,
			date: canlender.date,
			lunar: canlender.lunar,
			clockinfo: canlender.clockinfo || {},
			fulldate: canlender.year + '-' + canlender.month + '-' + canlender.date
		});
	}
}
</script>

<style lang="scss">
@font-face {
	font-family: 'iconfont';
	src: url('./font_989023_qdgy7euvg4.eot?t=1545961121132');
	/* IE9*/
	src: url('./font_989023_qdgy7euvg4.eot?t=1545961121132#iefix') format('embedded-opentype'),
		/* IE6-IE8 */
			url('data:application/x-font-woff;charset=utf-8;base64,d09GRgABAAAAAAPcAAsAAAAABiAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAABHU1VCAAABCAAAADMAAABCsP6z7U9TLzIAAAE8AAAARAAAAFY8fEf5Y21hcAAAAYAAAABLAAABcOcutbxnbHlmAAABzAAAACgAAAAoOZ2GtGhlYWQAAAH0AAAALwAAADYTtoNAaGhlYQAAAiQAAAAcAAAAJAfeA4NobXR4AAACQAAAAAgAAAAICAAAAGxvY2EAAAJIAAAABgAAAAYAFAAAbWF4cAAAAlAAAAAeAAAAIAENABJuYW1lAAACcAAAAUUAAAJtPlT+fXBvc3QAAAO4AAAAIQAAADLf6deseJxjYGRgYOBikGPQYWB0cfMJYeBgYGGAAJAMY05meiJQDMoDyrGAaQ4gZoOIAgCKIwNPAHicY2BkYWCcwMDKwMHUyXSGgYGhH0IzvmYwYuRgYGBiYGVmwAoC0lxTGByesT1jY27438AQw9zI0AAUZgTJAQDeIAvweJxjYGBgZWBgYAZiHSBmYWBgDGFgZAABP6AoI1icmYELLM7CoARWwwISf8b2/z+MBPJZwCQDIxvDKOABkzJQHjisIJiBEQA3lgmBAAABAAD/gAMAA4EABQAACQE1CQE1AQACAP6IAXgBgP4AiAF4AXiIAAB4nGNgZGBgAOLdZzma4vltvjJwszCAwA3v+QsR9P8GFgbmRiCXg4EJJAoAMzgKmgB4nGNgZGBgbvjfwBDDwgACQJKRARUwAQBHCAJrBAAAAAQAAAAAAAAAABQAAHicY2BkYGBgYmBjANEgFgMDFxAyMPwH8xkACS0BIAAAeJxlj01OwzAQhV/6B6QSqqhgh+QFYgEo/RGrblhUavdddN+mTpsqiSPHrdQDcB6OwAk4AtyAO/BIJ5s2lsffvHljTwDc4Acejt8t95E9XDI7cg0XuBeuU38QbpBfhJto41W4Rf1N2MczpsJtdGF5g9e4YvaEd2EPHXwI13CNT+E69S/hBvlbuIk7/Aq30PHqwj7mXle4jUcv9sdWL5xeqeVBxaHJIpM5v4KZXu+Sha3S6pxrW8QmU4OgX0lTnWlb3VPs10PnIhVZk6oJqzpJjMqt2erQBRvn8lGvF4kehCblWGP+tsYCjnEFhSUOjDFCGGSIyujoO1Vm9K+xQ8Jee1Y9zed0WxTU/3OFAQL0z1xTurLSeTpPgT1fG1J1dCtuy56UNJFezUkSskJe1rZUQuoBNmVXjhF6XNGJPyhnSP8ACVpuyAAAAHicY2BigAAuBuyAiZGJkZmBIyszMa8kv9SEgQEAGD0DTAAAAA==')
			format('woff'),
		url('//at.alicdn.com/t/font_989023_qdgy7euvg4.ttf?t=1545961121132') format('truetype'),
		/* chrome, firefox, opera, Safari, Android, iOS 4.2+*/ url('//at.alicdn.com/t/font_989023_qdgy7euvg4.svg?t=1545961121132#iconfont') format('svg');
	/* iOS 4.1- */
}

.iconfont {
	font-family: 'iconfont' !important;
	font-size: 32upx;
	font-style: normal;
	-webkit-font-smoothing: antialiased;
	-moz-osx-font-smoothing: grayscale;
}

.icon-jiantou:before {
	content: '\e606';
}

.uni-calendar__mask {
	position: fixed;
	bottom: 0;
	top: 0;
	width: 100%;
	background: rgba(0, 0, 0, 0.4);
	transition: all 0.3s;
	opacity: 0;
	z-index: 998;

	&.ani-mask-show {
		opacity: 1;
	}
}

.header {
	display: flex;
	justify-content: center;
	align-items: center;
	position: relative;
	height: 100upx;
	background: #fff;
	z-index: 999;
	// background: $uni-bg-color-grey;
	font-size: $uni-font-size-lg;
}

.uni-calendar__box {
	position: fixed;
	bottom: 0;
	z-index: 999;
	width: 100%;
	box-sizing: border-box;
	transition: all 0.3s;
	transform: translateY(100%);

	&.ani-calendar-show {
		transform: translateY(0%);
	}

	&.uni-calendar__static {
		position: static;
		transform: translateY(0%);
	}

	.uni-calendar__nav {
		display: flex;
		justify-content: space-between;
		height: 100upx;
		border-bottom: 1px #f5f5f5 solid;
		background: #f5f5f5;
		padding: 0 10upx;

		.uni-calendar__nav-item {
			display: flex;
			justify-content: center;
			align-items: center;
			width: 100upx;
			height: 100upx;
			color: #333;
		}
	}
}

.uni-calendar__wrapper {
	width: 100%;
	box-sizing: border-box;
	font-size: 26rpx;
	background: #fff;
	transition: all 0.3s;

	.uni-calenda__content {
		.uni-calendar__panel {
			position: relative;
			display: flex;
			align-items: center;
			justify-content: center;
			font-size: 28rpx;
			height: 100rpx;

			.uni-calendar__date-befor,
			.uni-calendar__date-after {
				display: flex;
				justify-content: center;
				align-items: center;
				height: 80rpx;
				width: 80rpx;
				text-align: center;
				line-height: 80rpx;

				&.uni-calendar__rollback {
					transform: rotate(180deg);
				}
			}

			.uni-calendar__panel-box {
				display: flex;
				justify-content: center;
				align-items: center;
				width: 200upx;
			}

			.uni-calendar__backtoday {
				position: absolute;
				right: 0;
				top: 25rpx;
				padding: 0 10rpx;
				padding-left: 20rpx;
				height: 50rpx;
				line-height: 50rpx;
				border: 1px rgba(253, 46, 50, 0.5) solid;
				border-right: none;
				font-size: 24rpx;
				border-top-left-radius: 50rpx;
				border-bottom-left-radius: 50rpx;
				color: rgba(253, 46, 50, 0.7);
				background: rgba(241, 233, 233, 0.4);
			}
		}

		.uni-calendar__day-detail {
			padding: 20upx;
			padding-left: 30upx;
			border-top: 1px #f5f5f5 solid;
		}

		.uni-calendar__header {
			display: flex;
			font-size: $uni-font-size-base;
			border-top: 1px #f5f5f5 solid;

			.uni-calendar__week {
				width: 100%;
				text-align: center;
				line-height: 80rpx;
				color: #333;
				font-weight: bold;
			}
		}

		.uni-calendar__body {
			display: flex;
			flex-wrap: wrap;
			font-size: $uni-font-size-base;
		}
	}
}
</style>
