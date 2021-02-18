<template>
	<view>
		<template v-if="cell">
			<view class="solid-bottom edit_title">
				<view class="title" :class="[cell.isReq?'text-red':'']">{{cell.labelString}}</view>
				<view class="container">
					<view class="page-body">
						<view class='wrapper'>
							<view class='toolbar solid-bottom bg-white' @tap="format" style="height: 260rpx;overflow-y: auto;">
								<view :class="formats.bold ? 'ql-active' : ''" class="iconfont icon-zitijiacu" data-name="bold"></view>
								<view :class="formats.italic ? 'ql-active' : ''" class="iconfont icon-zitixieti" data-name="italic"></view>
								<view :class="formats.underline ? 'ql-active' : ''" class="iconfont icon-zitixiahuaxian" data-name="underline"></view>
								<view :class="formats.strike ? 'ql-active' : ''" class="iconfont icon-zitishanchuxian" data-name="strike"></view>
								<view :class="formats.align === 'left' ? 'ql-active' : ''" class="iconfont icon-zuoduiqi" data-name="align"
								data-value="left"></view>
								<view :class="formats.align === 'center' ? 'ql-active' : ''" class="iconfont icon-juzhongduiqi" data-name="align"
								data-value="center"></view>
								<view :class="formats.align === 'right' ? 'ql-active' : ''" class="iconfont icon-youduiqi" data-name="align"
								data-value="right"></view>
								<view :class="formats.align === 'justify' ? 'ql-active' : ''" class="iconfont icon-zuoyouduiqi" data-name="align"
								data-value="justify"></view>
								<view :class="formats.lineHeight ? 'ql-active' : ''" class="iconfont icon-line-height" data-name="lineHeight"
								data-value="2"></view>
								<view :class="formats.letterSpacing ? 'ql-active' : ''" class="iconfont icon-Character-Spacing" data-name="letterSpacing"
								data-value="2em"></view>
								<view :class="formats.marginTop ? 'ql-active' : ''" class="iconfont icon-722bianjiqi_duanqianju" data-name="marginTop"
								data-value="20px"></view>
								<view :class="formats.previewarginBottom ? 'ql-active' : ''" class="iconfont icon-723bianjiqi_duanhouju" data-name="marginBottom"
								data-value="20px"></view>
								<view class="iconfont icon-clearedformat" @tap="removeFormat"></view>
								<view :class="formats.fontFamily ? 'ql-active' : ''" class="iconfont icon-font" data-name="fontFamily" data-value="Pacifico"></view>
								<view :class="formats.fontSize === '24px' ? 'ql-active' : ''" class="iconfont icon-fontsize" data-name="fontSize"
								data-value="24px"></view>

								<view :class="formats.color === '#0000ff' ? 'ql-active' : ''" class="iconfont icon-text_color" data-name="color"
								data-value="#0000ff"></view>
								<view :class="formats.backgroundColor === '#00ff00' ? 'ql-active' : ''" class="iconfont icon-fontbgcolor"
								data-name="backgroundColor" data-value="#00ff00"></view>

								<view class="iconfont icon-date" @tap="insertDate"></view>
								<view class="iconfont icon--checklist" data-name="list" data-value="check"></view>
								<view :class="formats.list === 'ordered' ? 'ql-active' : ''" class="iconfont icon-youxupailie" data-name="list"
								data-value="ordered"></view>
								<view :class="formats.list === 'bullet' ? 'ql-active' : ''" class="iconfont icon-wuxupailie" data-name="list"
								data-value="bullet"></view>
								<view class="iconfont icon-undo" @tap="undo"></view>
								<view class="iconfont icon-redo" @tap="redo"></view>

								<view class="iconfont icon-outdent" data-name="indent" data-value="-1"></view>
								<view class="iconfont icon-indent" data-name="indent" data-value="+1"></view>
								<view class="iconfont icon-fengexian" @tap="insertDivider"></view>
								<view class="iconfont icon-charutupian" @tap="insertImage"></view>
								<view :class="formats.header === 1 ? 'ql-active' : ''" class="iconfont icon-format-header-1" data-name="header"
								:data-value="1"></view>
								<view :class="formats.script === 'sub' ? 'ql-active' : ''" class="iconfont icon-zitixiabiao" data-name="script"
								data-value="sub"></view>
								<view :class="formats.script === 'super' ? 'ql-active' : ''" class="iconfont icon-zitishangbiao" data-name="script"
								data-value="super"></view>
								<view class="iconfont icon-shanchu" @tap="clear"></view>
								<view :class="formats.direction === 'rtl' ? 'ql-active' : ''" class="iconfont icon-direction-rtl" data-name="direction"
								data-value="rtl"></view>

							</view>
							<view class="editor-wrapper">
								<editor id="editor" class="ql-container" placeholder="开始输入..." showImgSize showImgToolbar showImgResize
								@statuschange="onStatusChange" :read-only="this.disabled" @ready="onEditorReady" @input="dataChange">
								</editor>
							</view>
						</view>
					</view>
				</view>
			</view>
		</template>
	</view>
</template>

<script lang="ts">
	import {Vue, Component,Prop,Watch,Inject} from 'vue-property-decorator';
	import Cell from '@/classes/pub/coob/Cell';
	import CDataSet from '@/classes/pub/CDataSet';
	import CRecord from '@/classes/pub/CRecord';
	import CCliEnv from '@/classes/cenv/CCliEnv';
	import { dataTool } from '@/classes/tools/DataTools';
	const DataUtil = dataTool.utils;
	import { BIPUtil } from '@/classes/api/request';
	let tools = BIPUtil.ServApi;
	import { Tools } from '@/classes/tools/Tools';
	import comm from '@/static/js/comm.js';
	let commURL: any = comm;
	import { GlobalVariable } from '@/classes/tools/ICL';
	@Component({})
	export default class bipEdit extends Vue{
		@Inject('env') env!:CCliEnv;
		@Prop({type:Object}) cell!:Cell;
		@Prop({type:String}) obj_id!:string;
		cds:CDataSet = new CDataSet(null)
		mode:string = ''
		

		editorCtx:any=null;
		formats:any={};//操作条
		fj_root:any = 'UEDITRO/IMG';

		snkey:any=null;
		uri:any = null;
		mounted(){
			let sk = window.sessionStorage.getItem('snkey')
			if(sk)
				this.snkey = JSON.parse(sk);
			this.uri = commURL.BaseUri+GlobalVariable.API_UPD
			let mkey = this.obj_id+"_"+this.cell.id
			uni.$on(mkey,this.cellDataChange)
			this.$nextTick(()=>{
				this.cds = this.env.getDataSet(this.obj_id);
				this.mode = this.record.data[this.cell.id];
			})
		}
		get record():CRecord{
			return this.cds.getRecord(this.cds.index)
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
		cellDataChange(){
			this.$nextTick(()=>{
				this.recordChange();
			})
		}
		@Watch('record',{deep:true})
		recordChange(){
			this.$nextTick(()=>{
				let rr = this.record.data[this.cell.id];
				if(rr !== this.mode){
					this.mode = rr||''
				}
				if(this.mode == undefined)
					this.mode = '';
				let _editorCtx = this.editorCtx;
				if(_editorCtx){
					let model1 = this.mode;
					model1 = model1.replace(/snkey={BIPSNKEY}/g,'snkey='+this.snkey);
					model1 = model1.replace(/{BIPURI}/g,this.uri)
					_editorCtx.getContents({
						success: function(res:any) {
							if(res.html != model1){
								_editorCtx.setContents({
									html: model1
								})
							}
						}
					})
				}
			});
		}
		@Watch('mode')
		modeChange(){
			// if(this.editorCtx && this.mode){
				// let _editorCtx = this.editorCtx;
				// let model1 = this.mode;
 				// model1 = model1.replace(/snkey={BIPSNKEY}/g,'snkey='+this.snkey);
				// model1 = model1.replace(/{BIPURI}/g,this.uri)
				// _editorCtx.getContents({
				// 	success: function(res:any) {
				// 		if(res.html != model1){
				// 			_editorCtx.setContents({
				// 				html: model1
				// 			})
				// 		}
				// 	}
				// })
			// }else if(this.editorCtx && !this.mode){
			// 	this.clear();
			// }
		}

		dataChange(e:any){
			let html = e.target.html;
			let cc = 'snkey='+this.snkey;
			html= html.replace(new RegExp(cc,'gm'),'snkey={BIPSNKEY}')
			html= html.replace(new RegExp(this.uri,'gm'),'{BIPURI}')
			this.$nextTick(()=>{
				if(html != this.record.data[this.cell.id])
					this.cds.cellChange(html,this.cell.id);
			})
		}

		/*************************************** 富文本 工具栏方法 ******************************************/
		onEditorReady() {
			uni.createSelectorQuery().select('#editor').context((res) => {
				this.editorCtx = res.context
				// this.clear();
			}).exec()
			if(this.mode){
				this.editorCtx.setContents({
					html: this.mode
				})
			}
		}
		undo() {
			this.editorCtx.undo()
		}
		redo() {
			this.editorCtx.redo()
		}
		format(e:any) {
			let {
				name,
				value
			} = e.target.dataset
			if (!name) return
			// console.log('format', name, value)
			this.editorCtx.format(name, value)

		}
		onStatusChange(e:any) {
			const formats = e.detail
			this.formats = formats
		}
		insertDivider() {
			this.editorCtx.insertDivider({
				success: function() {
					console.log('insert divider success')
				}
			})
		}
		clear() {
			this.editorCtx.clear({
				success: function(res:any) {
					console.log("clear success")
				}
			})
		}
		removeFormat() {
			this.editorCtx.removeFormat()
		}
		insertDate() {
			const date = new Date()
			const formatDate = `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`
			this.editorCtx.insertText({
				text: formatDate
			})
		}
		insertImage() {
			uni.chooseImage({
				count: 1,
				success: (res:any) => {
					this.upFile(res);
				}
			})
		}

		/**
		 * 上传文件
		 */
		async upFile(res:any){
			let params = {
				fjkey : this.obj_id,
				fname:"",
				updid:37,
				snkey:uni.getStorageSync('snkey'),
				fjid:'',
				fj_root:this.fj_root,
				fileName:""
			}
			let num =0;
			res.tempFiles
			let fileP = {path:res.tempFilePaths[0],fjid:Tools.guid(),fj_name:'',fj_root:'',upstate:0}
			let file:any = res.tempFiles[0];
			if(fileP.upstate == 0 ){
				num++;
				params.fjid = fileP.fjid;
				params.fname = file.name;
				if(!params.fname){
					let path = file.path;
					path = path.substring(path.lastIndexOf("."),path.length);
					params.fname = new Date().getTime()+path;
				}
				params.fileName = params.fname
				await tools.uniAppUploadFile(fileP.path,params,this.fileSuccess,this.fileFail); 
			}
		}
		//文件上传成功
		fileSuccess(uploadFileRes:any){
			let data = uploadFileRes.data;
			data = JSON.parse(data)
			if(data.id ==0){
				let url = this.makeImgUrl(data.data.fj_root,data.data.fname);
				this.editorCtx.insertImage({
					src: url,
					alt: data.data.fname,
					success: function() {
						console.log('insert image success')
					}
				})
			} else{
				uni.showToast({title:"文件上传失败！！！",icon:'none'})
			}
		}
		//文件上传失败
		fileFail(e:any){
			uni.showToast({title:"图片上传失败！",icon:'none'})
		}
		//拼接图像地址
		makeImgUrl(fj_root:any,fj_name:any){
			let snkey = uni.getStorageSync('snkey');
			snkey = encodeURIComponent(snkey);
			fj_name = encodeURIComponent(fj_name);
			return commURL.BaseUri+'/sysupd?updid=36&snkey='+snkey+"&fjroot="+fj_root+"&fjname="+fj_name;
		}
	}
</script>

<style scoped>
	@import "./editor-icon.css";
	.edit_title{
		background-color: #fff;
		min-height: 100upx;
		padding: 1upx 30upx;
	}
	.title{
		text-align: justify;
		padding-right: 16px;
		font-size: 16px;
		position: relative;
		height: 32px;
		line-height: 32px;
	}
	.page-body {
		height: calc(100vh - var(--window-top) - var(--status-bar-height));
	}
	.wrapper {
		height: 100%;
	}
	.editor-wrapper {
		height: calc(100vh - var(--window-top) - var(--status-bar-height) - 112px);
		background: #fff;
	}
	.iconfont {
		display: inline-block;
		margin: 4px 4px;
		width: 24px;
		height: 24px;
		cursor: pointer;
		font-size: 20px;
	}
	.toolbar {
		box-sizing: border-box;
		border-bottom: 0;
		font-family: 'Helvetica Neue', 'Helvetica', 'Arial', sans-serif;
	}
	.ql-container {
		box-sizing: border-box;
		padding: 12px 15px;
		width: 100%;
		min-height: 30vh;
		height: 100%;
		/* margin-top: 20px; */
		font-size: 16px;
		line-height: 1.5;
	}
	.ql-active {
		color: #06c;
	}
</style>
