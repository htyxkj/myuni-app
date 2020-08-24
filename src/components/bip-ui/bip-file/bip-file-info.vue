<template>
	<view>
	<view class="cu-modal" :class="show ? 'show' : ''">
		<view class="cu-dialog">
			<view class="cu-bar bg-white justify-end">
				<view class="content">文件列表</view>
				<view class="action" @tap="hideModal">
					<text class="cuIcon-close text-red"></text>
				</view>
			</view>
			<view class="padding">
				<view class="cu-form-group ">
					<view class="grid col-4 grid-square flex-sub margin-top">
						<view class="solids" v-for="(item,index) in imgList" :key="index" @tap="ViewImage" :data-url="imgList[index]">
						 <image :src="imgList[index]" mode="aspectFill"></image>
							<view class="cu-tag bg-red" @tap.stop="DelImg" :data-index="index">
								<text class='cuIcon-close'></text>
							</view>
						</view>
						<view class="solids" @tap="ChooseImage" v-if="imgList.length<12">
							<text class='cuIcon-cameraadd'></text>
						</view>
					</view>
				</view>
			</view>
			<view class="cu-bar bg-white justify-end">
				<view class="action">
					<button class="cu-btn line-green text-green" @tap="hideModal">取消</button>
					<button class="cu-btn bg-green margin-left" @tap="upFile">上传</button>
			
				</view>
			</view>
		</view>
	</view>
	</view>
</template>
<script lang="ts">
import { Vue, Provide, Prop, Component, Inject } from 'vue-property-decorator';
import { BIPUtil } from '@/classes/api/request';
let tools = BIPUtil.ServApi;
import Cell from '@/classes/pub/coob/Cell';
import CCliEnv from '@/classes/cenv/CCliEnv';
@Component({})
export default class bipFileInfo extends Vue {
	@Inject('env') env!:CCliEnv;
	@Prop({default:'text',type:String}) type!:string
	@Prop({default:false,type:Boolean}) clearable!:boolean
	@Prop({type:Object}) cell!:Cell;
	@Prop({type:String}) obj_id!:string;
	@Prop({ type: Boolean, default: false }) show!: boolean;
	imgList = [];
	imgList2 = [];
	count: number = 9;
	upLoadDid:any = null;

	hideModal(){
		this.$emit('hide')
	}
	ChooseImage() {
		uni.chooseImage({
			count: this.count, //默认9
			sizeType: ['original', 'compressed'], //可以指定是原图还是压缩图，默认二者都有
			sourceType: ['album'], //从相册选择
			success: (res: any) => {
				console.log(res);
				if (this.imgList.length != 0) {
					this.imgList = this.imgList.concat(res.tempFilePaths);
					this.imgList2 = this.imgList2.concat(res.tempFiles);
					
				} else {
					this.imgList = res.tempFilePaths;
					this.imgList2 = res.tempFiles;
				}
				console.log(this.imgList)
				console.log(this.imgList2)
			}
		});
	}

	DelImg(e: any) {
		uni.showModal({
			title: '删除',
			content: '确定要删除这个附件吗（同时会删除服务器上的文件）？',
			cancelText: '取消',
			confirmText: '删除',
			success: res => {
				if (res.confirm) {
					this.imgList.splice(e.currentTarget.dataset.index, 1);
					this.imgList2.splice(e.currentTarget.dataset.index, 1);
					console.log(this.imgList)
					console.log(this.imgList2)
				}
			}
		});
	}

	/**
	 * 上传文件
	 */
	upFile(){
		let params = {
			fjkey : this.obj_id,
			updid:37,
			snkey:uni.getStorageSync('snkey')
		}
		tools.uniAppUploadFile(this.imgList2,params,this.fileSuccess,this.fileFail); 
	}
	//文件上传成功
	fileSuccess(uploadFileRes:any){
		let data = uploadFileRes.data;
		data = JSON.parse(data)
		if(data.id ==0){
		 uni.showToast({title:"文件上传成功！",icon:'none'})
		} else{
			uni.showToast({title:"文件上传失败！！！",icon:'none'})
		}
	}
	//文件上传失败
	fileFail(e:any){
		console.log(e)
		uni.showToast({title:"文件上传失败！",icon:'none'})
	}
	ViewImage(e:any) {
		uni.previewImage({
			urls: this.imgList,
			current: e.currentTarget.dataset.url
		});
	}

	makePath(){
        const key = 999;
        let add1 = Math.floor(Math.random() * (key));
        return add1;
    }
}
</script>

<style scoped>
	.cu-modal{
		z-index: 10 !important;
	}
</style>