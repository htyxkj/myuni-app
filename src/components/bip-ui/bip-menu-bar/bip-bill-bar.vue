<template>
	<view class="cu-bar tabbar bg-white shadow foot my-b-menu">
		<template v-for="(item,index) in bottomData">
			<view v-if="index<=1" :key="index" class="submit margin-sm" :class="[index==0?'bg-blue':'bg-green']" @click="tabSelect(item)"  :data-id="item.cmd" :data-btn="item">
				<text>{{ item.name }}</text>
			</view>
		</template>
		<!-- <view v-if="(attr & 1) == 1 && addBtn" class="submit bg-blue margin-sm" @click="tabSelect(addBtn)" data-id="ADD" :data-btn="addBtn" ><text>添加</text></view>
		<view v-if="(attr & 2) == 2 && saveBtn" class="submit bg-green margin-sm" @click="tabSelect(saveBtn)" data-id="SAVE" :data-btn="saveBtn" ><text>保存</text></view> -->
		<template v-if="bottomData&&bottomData.length>2&&bmore">
			<view class="submit margin-sm" @tap="open"><text class="cuIcon-settingsfill text-blue lg"></text>更多操作</view>
			<uni-popup :show="showP" type="bottom" :custom="true" @change="change">
				<view class=" bg-white myradius">
					<view class="padding mytitle">更多操作</view>
					<view class="cu-list grid col-4">
						<template v-for="(item,index) in bottomData">
							<view v-if="index>1" class="cu-item" :key="index" @click="tabSelect(item)"  :data-id="item.cmd" :data-btn="item" :class="[item.cmd=='DEL'?'text-red':'',item.cmd=='COPY'?'text-green':'',item.cmd=='SUBMIT'?'text-blue':'',item.cmd=='CHECK'?'text-purple':'',item.cmd=='CHECKPROCESS'?'text-mauve':getTextClor()]">
								<view :class="['cuIcon-' + item.icon]"></view>
								<text class="text-lg">{{ item.name }}</text>
							</view>
						</template>
					</view>
				</view>
				<view class="cu-bar bg-gray" @tap="close"><view class="action text-center" :style="'font-size:14px;'">取消</view></view>
			</uni-popup>
		</template>
	</view>
</template>

<script lang="ts">
/**
 * 移动端下方按钮区域
 */
import { Vue, Provide, Prop, Component, Inject, Watch } from 'vue-property-decorator';
import BipMenuBar from '@/classes/pub/BipMenuBar';
import uniPopup from '@/components/uni-ui/uni-popup/uni-popup.vue';
import bipShare from '@/components/bip-ui/bip-share/bip-share.vue';
@Component({
	components: { uniPopup, bipShare }
})
export default class bipBillBar extends Vue {
	tabcur: string = '';
	tabcurColor: string = 'text-green';
	@Prop({ default: '', type: String }) tbI!: string;
	@Prop({ default: 1, type: Number }) attr!: number;
	@Prop({ default: false, type: Boolean }) bmore!: number;
	@Inject('mbs') mbs!: BipMenuBar;
	showP: boolean = false;
	bottomData: Array<any> = [];

	mounted() {
		this.bottomData = this.mbs.menuList;
		this.tabcur = this.tbI;
	}
	tabSelect(e: any) {
		this.$emit('tabSelect', e);
		this.close();
	}
	open() {
		this.showP = true;
	}
	close() {
		this.showP = false;
	}
	change(e: any) {
		this.showP = e.show;
	}
	getTextClor(){
		let color = ['text-red','text-green','text-blue','text-purple','text-mauve'];
		let num = Math.ceil(Math.random()*color.length);
		return color[num];
	}
	@Watch('mbs', { deep: true })
	mbsChange() {
		this.bottomData = this.mbs.menuList;
	}
}
</script>

<style lang="scss">
.bip-btn {
	font-size: 36upx;
}
.myradius{
	border-radius: 10px 10px 0 0;
}
.mytitle{
	padding-bottom: 0px;
    color: black;
}
.my-b-menu{
	z-index: 99999 !important;
}
</style>
