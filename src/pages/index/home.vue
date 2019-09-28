<template>
	<view class="my-home">
		<view class="cu-bar bg-white solid-bottom margin-top">
			<view class="action">
				<text class="cuIcon-titles text-blue "></text>混合图
			</view>
		</view>
		<view class="qiun-charts">
			<!--#ifdef MP-ALIPAY -->
			<canvas canvas-id="canvasMix" id="canvasMix" class="charts" :width="cWidth*pixelRatio" :height="cHeight*pixelRatio"
			 :style="{'width':cWidth+'px','height':cHeight+'px'}" disable-scroll=true @touchstart="touchMix" @touchmove="moveMix"
			 @touchend="touchEndMix"></canvas>
			<!--#endif-->
			<!--#ifndef MP-ALIPAY -->
			<canvas canvas-id="canvasMix" id="canvasMix" class="charts" disable-scroll=true @touchstart="touchMix" @touchmove="moveMix"
			 @touchend="touchEndMix"></canvas>
			<!--#endif-->
		</view>
		
		<view class="cu-bar bg-white solid-bottom margin-top">
			<view class="action">
				<text class="cuIcon-titles text-red "></text>柱状图
			</view>
		</view>
		<view class="cu-bar bg-white solid-bottom">
			<canvas canvas-id="canvasBar" id="canvasBar" class="charts-bar" disable-scroll=true @touchstart="touchBar" @touchmove="moveBar"	 @touchend="touchEndBar"></canvas>
		</view>
		
		<view class="cu-bar bg-white solid-bottom margin-top">
			<view class="action">
				<text class="cuIcon-titles text-green "></text>其他图
			</view>
		</view>
		<view class="cu-bar bg-white solid-bottom">
			<canvas canvas-id="canvasBar2" id="canvasBar2" class="charts-bar" disable-scroll=true @touchstart="touchBar" @touchmove="moveBar"	 @touchend="touchEndBar"></canvas>
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
	let canvaMix: any = null;
	let canvaBar: any = null;
	let charData = {
		"success": true,
		"data": {
			"Column": {
				"categories": ["2012", "2013", "2014", "2015", "2016", "2017"],
				"series": [{
					"name": "成交量1",
					"data": [15, {
						"value": 20,
						"color": "#f04864"
					}, 45, 37, 43, 34]
				}, {
					"name": "成交量2",
					"data": [30, {
						"value": 40,
						"color": "#facc14"
					}, 25, 14, 34, 18]
				}]
			},
			"ColumnB": {
				"categories": ["2013", "2014", "2015", "2016", "2017", "2018"],
				"series": [{
					"name": "新成交量3",
					"data": [35, 36, 31, 33, 13, 34]
				}, {
					"name": "新成交量4",
					"data": [18, 27, 21, 24, 6, 28]
				}]
			},
			"ColumnMeter": {
				"categories": ["2013", "2014", "2015", "2016", "2017", "2018"],
				"series": [{
					"name": "目标值",
					"data": [35, 36, 31, 33, 13, 34],
					"color": "#2fc25b"
				}, {
					"name": "完成量",
					"data": [18, 27, 21, 24, 6, 28],
					"color": "#1890ff"
				}]
			},
			"ColumnStack": {
				"categories": ["2013", "2014", "2015", "2016", "2017", "2018"],
				"series": [{
					"name": "新成交量3",
					"data": [35, 36, 31, 33, 13, 34]
				}, {
					"name": "新成交量4",
					"data": [18, 27, 21, 24, 6, 28]
				}, {
					"name": "新成交量5",
					"data": [18, 27, 21, 24, 6, 28]
				}]
			},
			"Mix": {
				"categories": ["2012", "2013", "2014", "2015", "2016", "2017"],
				"series": [{
					"name": "曲面",
					"data": [70, 55, 85, 130, 64, 88],
					"type": "area",
					"style": "curve"
				}, {
					"name": "柱1",
					"data": [40, 30, 55, 110, 24, 58],
					"type": "column"
				}, {
					"name": "柱2",
					"data": [50, 20, 75, 60, 34, 38],
					"type": "column"
				}, {
					"name": "曲线",
					"data": [70, 50, 85, 130, 64, 88],
					"type": "line",
					"style": "curve",
					"color": "#1890ff",
					"disableLegend": true
				}, {
					"name": "折线",
					"data": [120, 140, 105, 170, 95, 160],
					"type": "line",
					"color": "#2fc25b"
				}, {
					"name": "点",
					"data": [100, 80, 125, 150, 112, 132],
					"type": "point",
					"color": "#f04864"
				}]
			},
			"LineA": {
				"categories": ["2012", "2013", "2014", "2015", "2016", "2017"],
				"series": [{
					"name": "成交量A",
					"data": [35, 8, 25, 37, 4, 20]
				}, {
					"name": "成交量B",
					"data": [70, 40, 65, 100, 44, 68]
				}, {
					"name": "成交量C",
					"data": [100, 80, 95, 150, 112, 132]
				}]
			},
			"LineB": {
				"categories": ["2012", "2013", "2014", "2015", "2016", "2017"],
				"series": [{
					"name": "成交量A",
					"data": [35, 20, 25, 37, 4, 20]
				}, {
					"name": "成交量B",
					"data": [70, 40, 65, 100, 44, 68]
				}, {
					"name": "成交量C",
					"data": [100, 80, 95, 150, 112, 132]
				}]
			},
			"Area": {
				"categories": ["2012", "2013", "2014", "2015", "2016", "2017"],
				"series": [{
					"name": "成交量A",
					"data": [100, 80, 95, 150, 112, 132],
					"color": "#facc14"
				}, {
					"name": "成交量B",
					"data": [70, 40, 65, 100, 44, 68],
					"color": "#2fc25b"
				}, {
					"name": "成交量C",
					"data": [35, 20, 25, 37, 4, 20],
					"color": "#1890ff"
				}]
			},
			"Pie": {
				"series": [{
					"name": "一班",
					"data": 50
				}, {
					"name": "二班",
					"data": 30
				}, {
					"name": "三班",
					"data": 20
				}, {
					"name": "四班",
					"data": 18
				}, {
					"name": "五班",
					"data": 8
				}]
			},
			"Ring": {
				"series": [{
					"name": "一班",
					"data": 50
				}, {
					"name": "二班",
					"data": 30
				}, {
					"name": "三班",
					"data": 20
				}, {
					"name": "四班",
					"data": 18
				}, {
					"name": "五班",
					"data": 8
				}]
			},
			"Radar": {
				"categories": ["维度1", "维度2", "维度3", "维度4", "维度5", "维度6"],
				"series": [{
					"name": "成交量1",
					"data": [90, 110, 165, 195, 187, 172]
				}, {
					"name": "成交量2",
					"data": [190, 210, 105, 35, 27, 102]
				}]
			},
			"Arcbar1": {
				"series": [{
					"name": "正确率",
					"data": 0.29,
					"color": "#2fc25b"
				}]
			},
			"Arcbar2": {
				"series": [{
					"name": "错误率",
					"data": 0.65,
					"color": "#f04864"
				}]
			},
			"Arcbar3": {
				"series": [{
					"name": "完成率",
					"data": 0.85,
					"color": "#1890ff"
				}]
			},
			"Gauge": {
				"categories": [{
					"value": 0.2,
					"color": "#1890ff"
				}, {
					"value": 0.8,
					"color": "#2fc25b"
				}, {
					"value": 1,
					"color": "#f04864"
				}],
				"series": [{
					"name": "完成率",
					"data": 0.66
				}]
			},
			"Candle": {
				"categories": [
					"2013/1/24", "2013/1/25", "2013/1/28", "2013/1/29", "2013/1/30",
					"2013/1/31", "2013/2/1", "2013/2/4", "2013/2/5", "2013/2/6",
					"2013/2/7", "2013/2/8", "2013/2/18", "2013/2/19", "2013/2/20",
					"2013/2/21", "2013/2/22", "2013/2/25", "2013/2/26", "2013/2/27",
					"2013/2/28", "2013/3/1", "2013/3/4", "2013/3/5", "2013/3/6",
					"2013/3/7", "2013/3/8", "2013/3/11", "2013/3/12", "2013/3/13",
					"2013/3/14", "2013/3/15", "2013/3/18", "2013/3/19", "2013/3/20",
					"2013/3/21", "2013/3/22", "2013/3/25", "2013/3/26", "2013/3/27",
					"2013/3/28", "2013/3/29", "2013/4/1", "2013/4/2", "2013/4/3",
					"2013/4/8", "2013/4/9", "2013/4/10", "2013/4/11", "2013/4/12",
					"2013/4/15", "2013/4/16", "2013/4/17", "2013/4/18", "2013/4/19",
					"2013/4/22", "2013/4/23", "2013/4/24", "2013/4/25", "2013/4/26",
					"2013/5/2", "2013/5/3", "2013/5/6", "2013/5/7", "2013/5/8",
					"2013/5/9", "2013/5/10", "2013/5/13", "2013/5/14", "2013/5/15",
					"2013/5/16", "2013/5/17", "2013/5/20", "2013/5/21", "2013/5/22",
					"2013/5/23", "2013/5/24", "2013/5/27", "2013/5/28", "2013/5/29",
					"2013/5/30", "2013/5/31", "2013/6/3", "2013/6/4", "2013/6/5",
					"2013/6/6", "2013/6/7", "2013/6/13"
				],
				"series": [{
					"name": "上证指数",
					"data": [
						[2320.26, 2302.6, 2287.3, 2362.94],
						[2300, 2291.3, 2288.26, 2308.38],
						[2295.35, 2346.5, 2295.35, 2346.92],
						[2347.22, 2358.98, 2337.35, 2363.8],
						[2360.75, 2382.48, 2347.89, 2383.76],
						[2383.43, 2385.42, 2371.23, 2391.82],
						[2377.41, 2419.02, 2369.57, 2421.15],
						[2425.92, 2428.15, 2417.58, 2440.38],
						[2411, 2433.13, 2403.3, 2437.42],
						[2432.68, 2434.48, 2427.7, 2441.73],
						[2430.69, 2418.53, 2394.22, 2433.89],
						[2416.62, 2432.4, 2414.4, 2443.03],
						[2441.91, 2421.56, 2415.43, 2444.8],
						[2420.26, 2382.91, 2373.53, 2427.07],
						[2383.49, 2397.18, 2370.61, 2397.94],
						[2378.82, 2325.95, 2309.17, 2378.82],
						[2322.94, 2314.16, 2308.76, 2330.88],
						[2320.62, 2325.82, 2315.01, 2338.78],
						[2313.74, 2293.34, 2289.89, 2340.71],
						[2297.77, 2313.22, 2292.03, 2324.63],
						[2322.32, 2365.59, 2308.92, 2366.16],
						[2364.54, 2359.51, 2330.86, 2369.65],
						[2332.08, 2273.4, 2259.25, 2333.54],
						[2274.81, 2326.31, 2270.1, 2328.14],
						[2333.61, 2347.18, 2321.6, 2351.44],
						[2340.44, 2324.29, 2304.27, 2352.02],
						[2326.42, 2318.61, 2314.59, 2333.67],
						[2314.68, 2310.59, 2296.58, 2320.96],
						[2309.16, 2286.6, 2264.83, 2333.29],
						[2282.17, 2263.97, 2253.25, 2286.33],
						[2255.77, 2270.28, 2253.31, 2276.22],
						[2269.31, 2278.4, 2250, 2312.08],
						[2267.29, 2240.02, 2239.21, 2276.05],
						[2244.26, 2257.43, 2232.02, 2261.31],
						[2257.74, 2317.37, 2257.42, 2317.86],
						[2318.21, 2324.24, 2311.6, 2330.81],
						[2321.4, 2328.28, 2314.97, 2332],
						[2334.74, 2326.72, 2319.91, 2344.89],
						[2318.58, 2297.67, 2281.12, 2319.99],
						[2299.38, 2301.26, 2289, 2323.48],
						[2273.55, 2236.3, 2232.91, 2273.55],
						[2238.49, 2236.62, 2228.81, 2246.87],
						[2229.46, 2234.4, 2227.31, 2243.95],
						[2234.9, 2227.74, 2220.44, 2253.42],
						[2232.69, 2225.29, 2217.25, 2241.34],
						[2196.24, 2211.59, 2180.67, 2212.59],
						[2215.47, 2225.77, 2215.47, 2234.73],
						[2224.93, 2226.13, 2212.56, 2233.04],
						[2236.98, 2219.55, 2217.26, 2242.48],
						[2218.09, 2206.78, 2204.44, 2226.26],
						[2199.91, 2181.94, 2177.39, 2204.99],
						[2169.63, 2194.85, 2165.78, 2196.43],
						[2195.03, 2193.8, 2178.47, 2197.51],
						[2181.82, 2197.6, 2175.44, 2206.03],
						[2201.12, 2244.64, 2200.58, 2250.11],
						[2236.4, 2242.17, 2232.26, 2245.12],
						[2242.62, 2184.54, 2182.81, 2242.62],
						[2187.35, 2218.32, 2184.11, 2226.12],
						[2213.19, 2199.31, 2191.85, 2224.63],
						[2203.89, 2177.91, 2173.86, 2210.58],
						[2170.78, 2174.12, 2161.14, 2179.65],
						[2179.05, 2205.5, 2179.05, 2222.81],
						[2212.5, 2231.17, 2212.5, 2236.07],
						[2227.86, 2235.57, 2219.44, 2240.26],
						[2242.39, 2246.3, 2235.42, 2255.21],
						[2246.96, 2232.97, 2221.38, 2247.86],
						[2228.82, 2246.83, 2225.81, 2247.67],
						[2247.68, 2241.92, 2231.36, 2250.85],
						[2238.9, 2217.01, 2205.87, 2239.93],
						[2217.09, 2224.8, 2213.58, 2225.19],
						[2221.34, 2251.81, 2210.77, 2252.87],
						[2249.81, 2282.87, 2248.41, 2288.09],
						[2286.33, 2299.99, 2281.9, 2309.39],
						[2297.11, 2305.11, 2290.12, 2305.3],
						[2303.75, 2302.4, 2292.43, 2314.18],
						[2293.81, 2275.67, 2274.1, 2304.95],
						[2281.45, 2288.53, 2270.25, 2292.59],
						[2286.66, 2293.08, 2283.94, 2301.7],
						[2293.4, 2321.32, 2281.47, 2322.1],
						[2323.54, 2324.02, 2321.17, 2334.33],
						[2316.25, 2317.75, 2310.49, 2325.72],
						[2320.74, 2300.59, 2299.37, 2325.53],
						[2300.21, 2299.25, 2294.11, 2313.43],
						[2297.1, 2272.42, 2264.76, 2297.1],
						[2270.71, 2270.93, 2260.87, 2276.86],
						[2264.43, 2242.11, 2240.07, 2266.69],
						[2242.26, 2210.9, 2205.07, 2250.63],
						[2190.1, 2148.35, 2126.22, 2190.1]
					]
				}]
			},

			"CandleColumn": {
				"categories": [
					"2013/1/24", "2013/1/25", "2013/1/28", "2013/1/29", "2013/1/30",
					"2013/1/31", "2013/2/1", "2013/2/4", "2013/2/5", "2013/2/6",
					"2013/2/7", "2013/2/8", "2013/2/18", "2013/2/19", "2013/2/20",
					"2013/2/21", "2013/2/22", "2013/2/25", "2013/2/26", "2013/2/27",
					"2013/2/28", "2013/3/1", "2013/3/4", "2013/3/5", "2013/3/6",
					"2013/3/7", "2013/3/8", "2013/3/11", "2013/3/12", "2013/3/13",
					"2013/3/14", "2013/3/15", "2013/3/18", "2013/3/19", "2013/3/20",
					"2013/3/21", "2013/3/22", "2013/3/25", "2013/3/26", "2013/3/27",
					"2013/3/28", "2013/3/29", "2013/4/1", "2013/4/2", "2013/4/3",
					"2013/4/8", "2013/4/9", "2013/4/10", "2013/4/11", "2013/4/12",
					"2013/4/15", "2013/4/16", "2013/4/17", "2013/4/18", "2013/4/19",
					"2013/4/22", "2013/4/23", "2013/4/24", "2013/4/25", "2013/4/26",
					"2013/5/2", "2013/5/3", "2013/5/6", "2013/5/7", "2013/5/8",
					"2013/5/9", "2013/5/10", "2013/5/13", "2013/5/14", "2013/5/15",
					"2013/5/16", "2013/5/17", "2013/5/20", "2013/5/21", "2013/5/22",
					"2013/5/23", "2013/5/24", "2013/5/27", "2013/5/28", "2013/5/29",
					"2013/5/30", "2013/5/31", "2013/6/3", "2013/6/4", "2013/6/5",
					"2013/6/6", "2013/6/7", "2013/6/13"
				],
				"series": [{
					"name": "成交量1",
					"data": [15, 20, 45, 37, 43, 15, 20, 45, 37, 43, 15, 20, 45, 37, 43, 15, 20,
						45, 37, 43, 15, 20, 45, 37, 43, 15, 20, 45, 37, 43, 15, 20, 45, 37, 43, 15, 20,
						45, 37, 43, 15, 20, 45, 37, 43, 15, 20, 45, 37, 43, 15, 20, 45, 37, 43, 15, 20,
						45, 37, 43, 15, 20, 45, 37, 43, 15, 20, 45, 37, 43, 15, 20, 45, 37, 43, 15, 20,
						45, 37, 43, 15, 20, 45, 37, 43, 15, 20, 45
					]
				}]
			},
			"tips": "【开源不易、改造不易、哪(拿)来简单】uCharts将始终坚持开源，为您提供最便捷的高性能图表工具！"
		}
	}

	@Component({})
	export default class home extends Vue {
		@Provide() cWidth: number = 100
		@Provide() cHeight: number = 100
		@Provide() cHeight2: number = 100
		@Provide() pixelRatio: number = 1
		@Provide() arcbarWidth: number = 1 //圆弧进度图，进度条宽度,此设置可使各端宽度一致
		mounted() {
			console.log(uCharts)
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
			this.cWidth = uni.upx2px(750);
			this.cHeight = uni.upx2px(500);
			this.cHeight2 = uni.upx2px(400);
			this.arcbarWidth=uni.upx2px(24);
			this.getServerData();
		}

		getServerData() {
			let Mix: any = {
				categories: [],
				series: []
			};
			let Bar: any = {
				series: []
			};
			//这里我后台返回的是数组，所以用等于，如果您后台返回的是单条数据，需要push进去
			Mix.categories = charData.data.Mix.categories;
			Mix.series = charData.data.Mix.series;
			//这里后台数据没有指定数据用哪个Y轴，我人为定义了一下，仅做示例
			Mix.series[1].index = 1;
			Mix.series[2].index = 1;
			Mix.series[5].index = 2;
			//第二根线为虚线的设置
			Mix.series[4].lineType = 'dash';
			Mix.series[4].dashLength = 10;
			Mix.series[4].pointShape = 'triangle';
			Mix.series[4].addPoint = true;
			this.showMix("canvasMix", Mix);
			Bar.series = charData.data.Arcbar1.series;
			this.showBar("canvasBar", Bar);
		}
		showBar(canvasId: string, chartData: any) {
			let _self = this;
			canvaBar = new uCharts({
					$this:_self,
					canvasId: canvasId,
					type: 'arcbar',
					fontSize:11,
					legend:{show:false},
					background:'#FFFFFF',
					pixelRatio:_self.pixelRatio,
					series: chartData.series,
					animation: true,
					width: _self.cWidth*_self.pixelRatio,
					height: _self.cHeight2*_self.pixelRatio,
					dataLabel: true,
					title: {
						name: Math.round(chartData.series[0].data*100)+'%',
						color: chartData.series[0].color,
						fontSize: 25*_self.pixelRatio
					},
					subtitle: {
						name: chartData.series[0].name,
						color: '#666666',
						fontSize: 15*_self.pixelRatio
					},
					extra: {
						arcbar:{
							type:'default',
							width: _self.arcbarWidth*_self.pixelRatio,//圆弧的宽度
						}
					}
				});
		}
		showMix(canvasId: string, chartData: any) {
			let _self = this;
			canvaMix = new uCharts({
				$this: _self,
				canvasId: canvasId,
				type: 'mix',
				fontSize: 11,
				padding: [5, 5, 0, 5],
				legend: {
					show: true,
					position: 'bottom',
					float: 'center',
					padding: 5,
					lineHeight: 11,
					margin: 6,
				},
				background: '#FFFFFF',
				pixelRatio: _self.pixelRatio,
				categories: chartData.categories,
				series: chartData.series,
				animation: true,
				enableScroll: true, //开启图表拖拽功能
				xAxis: {
					disableGrid: false,
					type: 'grid',
					gridType: 'dash',
					itemCount: 4,
					scrollShow: true,
					scrollAlign: 'left',
				},
				yAxis: {
					data: [{
						calibration: true,
						position: 'left',
						title: '折线',
						titleFontSize: 12,
						format: (val: number) => {
							return val.toFixed(0) + '度'
						}
					}, {
						calibration: true,
						position: 'right',
						min: 0,
						max: 200,
						title: '柱状图',
						titleFontSize: 12,
						format: (val: number) => {
							return val.toFixed(0) + '元'
						}
					}, {
						calibration: true,
						position: 'right',
						min: 0,
						max: 200,
						title: '点',
						titleFontSize: 12
					}],
					showTitle: true,
					gridType: 'dash',
					dashLength: 4,
					splitNumber: 5
				},
				width: _self.cWidth * _self.pixelRatio,
				height: _self.cHeight * _self.pixelRatio,
				dataLabel: true,
				dataPointShape: true,
				extra: {
					column: {
						width: 20 * _self.pixelRatio
					},
					tooltip: {
						showBox: false, //是否显示半透明黑色的提示区域
						bgColor: '#000000',
						bgOpacity: 0.7,
						gridType: 'dash',
						dashLength: 8,
						gridColor: '#1890ff',
						fontColor: '#FFFFFF',
						horizentalLine: true,
						xAxisLabel: true,
						yAxisLabel: true,
						labelBgColor: '#DFE8FF',
						labelBgOpacity: 0.95,
						labelAlign: 'left',
						labelFontColor: '#666666'
					}
				},
			});
			/*下面是渲染完成时的事件，不需要请删除，注：拖动和图表交互的时候都会重新渲染
			canvaMix.addEventListener('renderComplete', () => {
			    console.log("图表渲染完成");
			});
			*/
			//下面是拖动滚动条到尽头的事件，不需要请删除
			canvaMix.addEventListener('scrollLeft', () => {
				console.log("已经到最【左】边啦");
			});
			//下面是拖动滚动条到尽头的事件，不需要请删除
			canvaMix.addEventListener('scrollRight', () => {
				console.log("已经到最【右】边啦");
			});
		}

		touchMix(e: any) {
			canvaMix.scrollStart(e);
		}
		moveMix(e: any) {
			canvaMix.scroll(e);
		}
		touchEndMix(e: any) {
			canvaMix.scrollEnd(e);
			//下面是toolTip事件，如果滚动后不需要显示，可不填写
			canvaMix.touchLegend(e);
			canvaMix.showToolTip(e, {
				format: function(item: any, category: any) {
					return category + ' ' + item.name + ':' + item.data
				}
			});
		}
		
		touchBar(e:any){
			canvaBar.scrollStart(e)
		}
		
		moveBar(e:any){
			canvaBar.scroll(e)
		}
		
		touchEndBar(e:any){
			canvaBar.scrollEnd(e);
			//下面是toolTip事件，如果滚动后不需要显示，可不填写
			canvaBar.touchLegend(e);
			canvaBar.showToolTip(e, {
				format: function(item: any, category: any) {
					return category + ' ' + item.name + ':' + item.data
				}
			});
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

	.charts {
		width: 750upx;
		height: 500upx;
		background-color: #FFFFFF;
	}
	
	.charts-bar {
		width: 750upx;
		height: 400upx;
		background-color: #FFFFFF;
	}
</style>
