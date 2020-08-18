<template>
	<view class="cu-bar tabbar bg-white shadow foot" style="z-index: 99999;">
		<view v-if="(attr & 1) == 1 && addBtn" class="submit solids light bg-blue padding-sm" @click="tabSelect(addBtn)" data-id="ADD" :data-btn="addBtn" ><text class="bip-btn text-bold">添加</text></view>
		<view v-if="(attr & 2) == 2 && saveBtn" class="submit solids light bg-cyan padding-sm" @click="tabSelect(saveBtn)" data-id="SAVE" :data-btn="saveBtn" ><text class="bip-btn text-bold">保存</text></view>
		<template v-if="bottomData&&bmore">
			<view class="submit solids bip-btn padding-sm " @tap="open"><text class="cuIcon-settingsfill text-blue lg"></text>更多操作</view>
			<uni-popup :show="showP" type="bottom" :custom="true" @change="change">
				<!-- <bip-share :arrdata="bottomData" @close="close" @itemClick="itemClick"></bip-share> -->
				<view class="cu-list grid col-4 border bg-white">
					<template v-for="(item,index) in bottomData">
						<template v-if="item.cmd !== 'ADD' && item.cmd !== 'SAVE'">
							<view class="cu-item" :key="index" @click="tabSelect(item)"  :data-id="item.cmd" :data-btn="item" :class="[item.cmd=='DEL'?'text-red':'',item.cmd=='COPY'?'text-green':'',item.cmd=='SUBMIT'?'text-blue':'',item.cmd=='CHECK'?'text-purple':'']">
								<view :class="['cuIcon-' + item.icon]"></view>
								<text class="text-lg">{{ item.name }}</text>
							</view>
						</template>
					</template>
				</view>
				<view class="cu-bar bg-yellow solid-bottom" @tap="close"><view class="action text-center text-white" :style="'font-size:14px;'">取消</view></view>
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

	addBtn:any = null;//添加按钮
	saveBtn:any = null;//保存按钮

	mounted() {
		this.bottomData = [];
		this.mbs.menuList.forEach((item: any) => {
			if(item.cmd == 'ADD'){
				this.addBtn = item;
			}
			if(item.cmd == 'SAVE'){
				this.saveBtn = item;
			}
			this.bottomData.push(item);
		});
		this.tabcur = this.tbI;
	}
	tabSelect(e: any) {
		this.$emit('tabSelect', e);
		this.close();
	}

	itemClick(index: number) {
		console.log(index);
	}

	openMenu(item: any, index: number) {}

	open() {
		this.showP = true;
	}
	close() {
		this.showP = false;
	}
	change(e: any) {
		this.showP = e.show;
	}

	@Watch('mbs', { deep: true })
	mbsChange() {
		this.bottomData = [];
		this.mbs.menuList.forEach((item: any) => {
			if(item.cmd == 'ADD'){
				this.addBtn = item;
			}
			if(item.cmd == 'SAVE'){
				this.saveBtn = item;
			}
			this.bottomData.push(item);
		});
	}
}
</script>

<style lang="scss">
.bip-btn {
	font-size: 36upx;
}
</style>
