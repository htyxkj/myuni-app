<template>
	<view class="bip-selector" :class="show? 'show':''">
		<template v-if="arr.length>0">
			<view class="cu-bar bg-white solid">
				<view class="action text-red" @tap="cancel">取消</view>
				<view class="action text-blue" @tap="selectOK">确定</view>
			</view>
			<scroll-view scroll-y class="cu-list bg-white">
				<view class="cu-item solid-bottom" v-for="(item,index) in arr" :key="index">
					<view class="bip-bar padding text-left" @tap="selectChange(index)" :class="sindex==index?'text-blue':''">
						<template v-if="isStr">
							<text class="cuIcon-titles bip-item">{{item}}</text>
						</template>
						<template v-else>
							<text class="cuIcon-titles bip-item">{{item[showKey]}}</text>
						</template>
						<text v-if="sindex==index" class="cuIcon-check text-right text-bold"></text>
					</view> 
				</view>
			</scroll-view>
		</template>
		<template v-else>
			<view class="bip-bar padding text-center bg-white text-red" @tap="cancel">
				<text class="cuIcon-titles bip-item">没有数据</text>
			</view>
		</template>
		
	</view>
</template>
<script lang="ts">
import { Vue,Prop, Component,Watch} from 'vue-property-decorator';
@Component({
	components: {}
})
export default class bipSelect extends Vue{
	//下拉列表选择数据
	@Prop({type:Array,default:[]}) arr!:Array<any>;
	//数据id列
	@Prop({type:String,default:'id'}) idKey!:string;
	//数据显示名称列name
	@Prop({type:String,default:'name'}) showKey!:string;
	//是否是字符串，默认是true
	@Prop({type:Boolean,default:true}) isStr!:boolean;
	//是否显示下拉框
	@Prop({type:Boolean,default:false}) show!:boolean;
	//是否显示下拉框
	@Prop({type:Number,default:-1}) index!:number;
	//选中项，默认是-1
	sindex = -1;
	// style=''

	mounted(){
		this.sindex = this.index
	}
	selectChange(itm:number){
		this.sindex = itm;
		this.$emit('selectChange',this.arr[this.sindex]);
		
	}
	selectOK(){
		//返回选择项给引用界面
		this.$emit('select',this.arr[this.sindex]);
	}
		
	cancel(){
		this.$emit('cancel');
	}
	
}
</script>

<style>
	.bip-selector{
	position: absolute;
	/* top: 0; 
		bottom: 0;
	*/
	right: 0;
	left: 0;
	z-index: 99999;
	opacity: 0;
	outline: 0;
	text-align: center;
	-ms-transform: scale-down(1.185);
	transform: scale-down(1.185);
	backface-visibility: hidden;
	perspective: 2000upx;
	background: rgba(255, 255, 255, 0.6);
	transition: all 0.3s ease-in-out 0s;
	pointer-events: none;
	margin-top: 10upx;
	width: 100%;
}
.bip-selector.show{
	opacity: 1;
	transition-duration: 0.3s;
	-ms-transform: scale(1);
	transform: scale(1);
	overflow-x: hidden;
	overflow-y: auto;
	pointer-events: auto;
}
.bip-selector .action{
	max-height: 30upx;
	min-height: 12upx;
}
.bip-selector .cu-list{
	max-height: 300upx;
	min-height: 120upx;
	margin-bottom: -10upx;
}
.bip-bar {
    display: -webkit-box;
    display: -webkit-flex;
    display: flex;
    position: relative;
    -webkit-box-align: center;
    -webkit-align-items: center;
    align-items: center;
    min-height: 32px;
    -webkit-box-pack: justify;
    -webkit-justify-content: space-between;
    justify-content: space-between;
}
.bip-item{
	width: 95%;
	white-space: nowrap;
	text-overflow: ellipsis;
	overflow: hidden;
	word-break: break-all;
	
}
</style>
