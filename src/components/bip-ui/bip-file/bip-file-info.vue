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
						<view class="solids" v-for="(item,index) in imgList" :key="index" @tap="ViewImage" :data-url="imgList[index].path">
						 <image :src="imgList[index].path" mode="aspectFill"></image>
							<view v-show="!mdisabled" class="cu-tag bg-red" @tap.stop="DelImg" :data-index="index">
								<text class='cuIcon-close'></text>
							</view>
						</view>
						<view class="solids" @tap="ChooseImage" v-show="!mdisabled" v-if="imgList.length<12">
							<text class='cuIcon-cameraadd'></text>
						</view>
					</view>
				</view>
			</view>
			<view class="cu-bar bg-white justify-end">
				<view class="action">
					<button class="cu-btn line-green text-green" @tap="hideModal">取消</button>
					<button class="cu-btn bg-green margin-left" @tap="upFile"  v-show="!mdisabled">上传</button>
			
				</view>
			</view>
		</view>
	</view>
	</view>
</template>
<script lang="ts">
import { Vue, Provide, Prop, Component, Inject, Watch } from 'vue-property-decorator';
import { BIPUtil } from '@/classes/api/request';
let tools = BIPUtil.ServApi;
import { Tools } from '@/classes/tools/Tools';
import Cell from '@/classes/pub/coob/Cell';
import CCliEnv from '@/classes/cenv/CCliEnv';
import CDataSet from '@/classes/pub/CDataSet';
import comm from '@/static/js/comm.js';
import { fn } from 'moment';
let commURL: any = comm;
import { dataTool } from '@/classes/tools/DataTools';
const DataUtil = dataTool.utils;
@Component({})
export default class bipFileInfo extends Vue {
	@Inject('env') env!:CCliEnv;
	@Prop({default:'text',type:String}) type!:string
	@Prop({default:false,type:Boolean}) clearable!:boolean
	@Prop({type:Object}) cell!:Cell;
	@Prop({type:String}) obj_id!:string;
	@Prop({ type: Boolean, default: false }) show!: boolean;
	imgList:any = [];
	imgList2:any = [];
	count: number = 9;
	fj_root:any = "";

	fjrootCell:any =null;
	cds:CDataSet = new CDataSet("");

	mdisabled:boolean = false;

	hideModal(){
		this.$emit('hide')
	}
	ChooseImage() {
		uni.chooseImage({
			count: this.count, //默认9
			sizeType: ['original', 'compressed'], //可以指定是原图还是压缩图，默认二者都有
			sourceType: ['album'], //从相册选择
			success: (res: any) => {
				let filePath:any = [];
				for(var i=0;i<res.tempFilePaths.length;i++){
					let file = {path:res.tempFilePaths[i],fjid:Tools.guid(),fj_name:'',fj_root:'',upstate:0}
					filePath.push(file);
				}
				if (this.imgList.length != 0) {
					this.imgList = this.imgList.concat(filePath);
					this.imgList2 = this.imgList2.concat(res.tempFiles);
				} else {
					this.imgList = filePath;
					this.imgList2 = res.tempFiles;
				}
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
					let file1:any = this.imgList[e.currentTarget.dataset.index];
					let file2:any = this.imgList2[e.currentTarget.dataset.index];
					if(file1.upstate == 1){//已经上传至服务器
						let params = {
							fname:file2.name,
							updid:34,
							snkey:uni.getStorageSync('snkey'),
							fjroot:file1.fj_root,
							fjname:file1.fj_name
						}
						tools.uniAppUploadFile(file1.path,params,null,null); 
					}
					this.imgList.splice(e.currentTarget.dataset.index, 1);
					this.imgList2.splice(e.currentTarget.dataset.index, 1);
					this.makeData();
				}
			}
		});
	}

	/**
	 * 上传文件
	 */
	async upFile(){
		let params = {
			fjkey : this.obj_id,
			fname:"",
			updid:37,
			snkey:uni.getStorageSync('snkey'),
			fjid:'',
			fjroot:this.fj_root
		}
		let num =0;
		for(var i=0;i<this.imgList.length;i++){
			let fileP:any = this.imgList[i];
			let file:any = this.imgList2[i];
			if(fileP.upstate == 0 ){
				num++;
				params.fjid = fileP.fjid;
				params.fname = file.name;
				await tools.uniAppUploadFile(fileP.path,params,this.fileSuccess,this.fileFail); 
			}
		}
		if(num ==0){
			uni.showToast({title:"文件已上传完毕！",icon:'none'})
		}
	}
	//文件上传成功
	fileSuccess(uploadFileRes:any){
		let data = uploadFileRes.data;
		data = JSON.parse(data)
		if(data.id ==0){
			let fjid = data.data.fjid;
			let fj_root = data.data.fj_root;
			let fj_name = data.data.fname;
			for(var i=0;i<this.imgList.length;i++){
				let file:any = this.imgList[i];
				if(file.fjid == fjid){
					file.fj_name = fj_name;
					file.fj_root = fj_root;
					file.upstate = 1;
					this.fj_root = fj_root;
				}
			}
			uni.showToast({title:"文件上传成功！",icon:'none'})
			this.cds.cellChange(fj_root,this.fjrootCell.id);
			this.makeData();
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
		let urls = [e.currentTarget.dataset.url]
		uni.previewImage({
			urls: urls,
			current: e.currentTarget.dataset.url
		});
	}

	makePath(){
        const key = 999;
        let add1 = Math.floor(Math.random() * (key));
        return add1;
	}

	makeData(){
		let fname = "";
		for(var i=0;i<this.imgList.length;i++){
			let file = this.imgList[i]
			if(file.upstate ==1){
				fname = fname + ";" + file.fj_name;
			}
		}
		if(fname && fname.length>1){
			fname = fname.substring(1,fname.length);
		}
		this.$emit('success',fname)
	}
	
	/**
	 * 初始化 fj_root  已上传附件
	 */
	init(){
		this.cds = this.env.getDataSet(this.obj_id)
		if(this.cds){
			let cels = this.cds.ccells.cels;
			for(var i=0;i<cels.length;i++){
				let cel = cels[i];
				if(cel.id == this.cell.id){
					this.fjrootCell = cels[i-1];
					break;
				}
			}
		}
		let data = this.cds.currRecord.data;
		let fjname = "";
		if(data){
			this.fj_root = data[this.fjrootCell.id]	
			fjname = data[this.cell.id]
		}
		if(fjname){
			this.imgList =[];
			this.imgList2 =[];
			let names = fjname.split(";")
			for(var i=0;i<names.length;i++){
				let path = this.makeImgUrl(this.fj_root,names[i])
				let file:any = {path:path,fjid:Tools.guid(),fj_name:names[i],fj_root:this.fj_root,upstate:1}
				this.imgList.push(file);
				this.imgList2.push(file)
			}
		}
		this.mdisabled = this.disabled;
	}
	get disabled(){
		if(this.cds.ccells!=null){
			let attr = this.cell.attr&0x40;
			if(attr>0){
				return true;
			}else{
				return !DataUtil.currCanEdit(this.cds,this.env);
			}
		}
		else{
			if(this.cell){
				let attr = this.cell.attr&0x40;
				return attr>0 ;
			}
			return false;
		}
	}
	@Watch("show")
	showWatch(){
		if(this.show){
			this.init();
		}
	}
	//拼接图像地址
	makeImgUrl(fj_root:any,fj_name:any){
		return commURL.BaseUri+'/sysupd?updid=36&snkey='+uni.getStorageSync('snkey')+"&fjroot="+fj_root+"&fjname="+fj_name;
	}
}
</script>

<style scoped>
	.cu-modal{
		z-index: 10 !important;
	}
</style>