import Menu from '@/classes/Menu';
import { BIPUtil } from '@/classes/api/request';
let tools = BIPUtil.ServApi;
import Cells from '@/classes/pub/coob/Cells';
import CDataSet from '@/classes/pub/CDataSet';
import comm from '@/static/js/comm.js';
let commURL: any = comm;
import QueryEntity from '@/classes/search/QueryEntity';
const bipRfid:any = uni.requireNativePlugin("bip-RfidModule")
export class Tools{
	static server_version:any=null;//版本号
	static upd_type:any=null;//更新类型
	static S4() {
		return (((1+Math.random())*0x10000)|0).toString(16).substring(1)+'';
	}
	static guid():string {
		return (this.S4()+this.S4()+"-"+this.S4()+"-"+this.S4()+"-"+this.S4()+"-"+this.S4()+this.S4()+this.S4());
	}
	/**
	 * & 运算
	 */
	static bitOperation(attr:any,val:any){
		attr = attr.toString(2);
		val = val.toString(2);
		let a = attr.split("");
		let v = val.split("");
		let num = "";
		if(a.length < v.length){
		let b = a;
		a = v;
		v = b;
		}
		if(a.length >= v.length){
			let c = a.length - v.length;
			for(var i = v.length-1;i>=0;i--){
				let a1 = a[c+i];
				let v1 =v[i];
				if((a1 == v1) && v1== 1){
				num = '1'+num
				}else{
				num = '0'+num
				}
			}
		}
		return parseInt(num,2);
	}
	/**
     * 根据菜单号查找菜单
     * @param menuId 菜单号
     * @returns 返回菜单或者是空
     */
    static findMenu(menuId:string){
		let menu = uni.getStorageSync("menus");
		let m1 =null;
		if(menu!=null){
		  let ml = JSON.parse(menu);
		  for (let index = 0; index < ml.length; index++) {
			const item = ml[index];
			m1 = this.findMenuById(menuId,item)
			if(m1!=null){
				return m1;
			}
		  }
		}else{
		  return  null;
		}
		return m1;
	}
	  /**
	   * @description 根据菜单号查找菜单
	   * @param menuId 菜单号
	   * @param menu 要查询的菜单
	   */
	static findMenuById(menuId:string,menu:Menu):any{
		if(menu.menuId==menuId){
			return menu
		}else{
			if(menu.haveChild){
				for(let i = 0;i<menu.childMenu.length;i++){
					let m1 = this.findMenuById(menuId,menu.childMenu[i])
					if(m1!=null){
						return m1;
					}
				}
			}
			return null;
		}
	}

	static async openMenu(param:any){
		let cc = param.command;
		let dd = cc.split("&");
		let pbuid = ''
		let pmenu ='';
		dd.forEach((aa:any)=>{
			let pbuids = aa.split('=')
			if(pbuids[0] == 'pbuid'){
				pbuid = pbuids[1]
			}
			if(pbuids[0] == 'pmenu'){
				pmenu = pbuids[1]
			}
		})
		let mid = param.menuId;
		if(pbuid&&mid){
			uni.showLoading({title:'页面跳转中...'});
			await tools.getMenuParams(pbuid,mid).then((res:any)=>{
				uni.hideLoading();
				let data = res.data
				if(data.id>=0){
					let uriParams = data.data.mparams
					uni.setStorageSync(pbuid,JSON.stringify(uriParams))
					if(uriParams.beBill){
						let uri = '/pages/appinfo/applist?color='+param.color+'&title='+param.menuName+"&pbuid="+pbuid;
						this.pageJump(uri)
					}else{
						let uri = '/pages/appreport/appreport?color='+param.color+'&title='+param.menuName+"&pbuid="+pbuid;
						this.pageJump(uri);
					}
				}else{
					uni.showToast({
						title:'没有权限!'
					})
				}
			}).catch((err:any)=>{
					uni.hideLoading();
					uni.showToast({
						title:'没有权限!'
					})
			})
		}else if(pmenu){
			let type = commURL.ItemType;
			let url = "";
			if(type =='air-super'){
				if(pmenu == 'RealTimeTrack'){//实时轨迹
					pmenu = "airMap?type=realTime";
				}else if(pmenu =='PlayBack'){//轨迹回放
					pmenu = "airMap?type=playBack";
				}else if(pmenu == 'TrackShow'){//航带航迹查询
					pmenu = "airMap?type=trackShow";
				}else if(pmenu =='SortiesInvoke'){//架次统计
					pmenu = "airSortiesInvoke?1=1";
				}else if(pmenu =='SortiesQuery'){//架次查询
					pmenu = "airSortiesQuery?1=1";
				}
				url = '/pages/alone/air-super/'+pmenu;
			}else if(type == 'Breeding'){
				url = '/pages/alone/breeding/pages/'+pmenu+'?1=1';
			}
			let uri = url+'&color='+param.color+'&title='+param.menuName;
			this.pageJump(uri);
		}
		return null;
	}
	static pageJump(uri:string){
		uni.showLoading({title:'跳转中...'})
		uni.navigateTo({
			url: uri,complete:()=>{
				uni.hideLoading();
			}
		});
	}

	/**
	 * 更具对象编码获取对象信息
	 * @param cellid 对象号
	 */
	static async getCell(cellid: string) {
		let res = await tools.getCCellsParams(cellid);
		let rtn: any = res.data;
		if (rtn.id == 0) {
			let kn: Array<Cells> = rtn.data.layCels;
			let cells = kn;
			return new CDataSet(cells[0]);
		} else {
			return new CDataSet("");
		}
	}

	/**
	 * 安卓应用的检测更新实现
	 */
	static async AndroidCheckUpdate(showMsg:boolean=false){ 
		let reminderInterval = 3600
		let qe:QueryEntity = new QueryEntity('','');
		let vv:any = await tools.getBipInsAidInfo('UNIAPPVERSION',300,qe);
		if( vv && vv.data.id ==0){
			let val = vv.data.data.data.values;
			for(var i=0;i<val.length;i++){
				if(val[i].code == "version"){
					this.server_version  = val[i].name
				}else if(val[i].code == "reminderInterval"){
					reminderInterval  = parseInt(val[i].name)
				}else if(val[i].code == "type"){
					this.upd_type = val[i].name
				}
			}
		}
		if(this.server_version == commURL.version){
			//当前程序为最新版
			if(showMsg){
				uni.showToast({
					icon:"none",
					mask: true,
					title: '当前程序为最新版',  
					duration: 3000,  
				}); 
			}
			return;
		}
		let _this = this;

		let currTimeStamp = new Date().getTime()/1000
		// 判断缓存时间
		uni.getStorage({
			key: 'tip_version_update_time',
			success: function (res) {
				var lastTimeStamp = res.data;
				//定义提醒的时间间隔，避免烦人的一直提示，一个小时：3600；一天：86400
				if((currTimeStamp - lastTimeStamp) < reminderInterval &&　!showMsg){
					//避免多次提醒，不要更新
				}else{
					//重新设置时间戳
					_this.setStorageForAppVersion(currTimeStamp);
					//进行版本型号的比对 以及下载更新请求
					_this.checkVersionToLoadUpdate();
				}
			},
			fail:function(res){
				_this.setStorageForAppVersion(currTimeStamp);
			}
		});
	}
	/**
	 * //设置应用版本号对应的缓存信息
	 * @param {Object} currTimeStamp 当前获取的时间戳
	 */
	 static setStorageForAppVersion(currTimeStamp:any){
		uni.setStorage({
			key: 'tip_version_update_time',
			data: currTimeStamp,
			success: function () {
				console.log('setStorage-success');
			}
		});
	}
	/**
	 * 进行版本型号的比对 以及下载更新请求
	 * @param {Object} server_version 服务器最新 应用版本号
	 * @param {Object} curr_version 当前应用版本号
	 */
	 static checkVersionToLoadUpdate(){
		let server_version = this.server_version;
		let _this = this;
		let curr_version = commURL.version;
		if(server_version > curr_version){
			uni.showModal({
				title: "版本更新",
				// content: '有新的版本发布，检测到您当前为Wifi连接，是否立即进行新版本下载？',
				content: '有新的版本发布，是否立即进行新版本下载？',
				confirmText:'立即更新',
				cancelText:'稍后进行',
				success: function (res) {
					if (res.confirm) {
						uni.showToast({
							icon:"none",
							mask: true,
							// title: '有新的版本发布，检测到您目前为Wifi连接，程序已启动自动更新。新版本下载完成后将自动弹出安装程序',  
							title: '有新的版本发布，程序已启动自动更新。新版本下载完成后将自动弹出安装程序',  
							duration: 3000,  
						}); 
						//设置 最新版本apk的下载链接
						if(_this.upd_type == null || _this.upd_type == 'apk'){
							var downloadApkUrl = commURL.BaseUri+"/apk/android.apk";
							var dtask = plus.downloader.createDownload( downloadApkUrl, {}, function ( d:any, status ) {  
									// 下载完成 
									if ( status == 200 ) {   
										uni.showToast({
											icon:"none",
											mask: true,
											// title: '有新的版本发布，检测到您目前为Wifi连接，程序已启动自动更新。新版本下载完成后将自动弹出安装程序',  
											title: '安装程序下载完成，安装中...',  
											duration: 3000,  
										}); 
										let dir: any = plus.io.convertLocalFileSystemURL(d.filename);
										plus.runtime.install(dir,{force:true},function(error){ 
											// uni.showToast({  
											// 	title: '安装失败', 
											// 	icon:"none",
											// 	mask: true,
											// 	duration: 5000  
											// });  
										})
									} else {  
										uni.showToast({  
											title: '更新失败',
											icon:"none",
											duration: 1500  
										});  
									}    
								});  
							dtask.start();
						}else if(_this.upd_type =='wgt'){
							var downloadApkUrl = commURL.BaseUri+"apk/android.wgt";
							uni.downloadFile({
								url: downloadApkUrl,
								success: (res) => {
									if (res.statusCode === 200) {
										let path:any = res.tempFilePath;
										plus.nativeUI.showWaiting("安装更新文件...");
										plus.runtime.install(path, {}, function() {
											plus.nativeUI.closeWaiting();
											plus.nativeUI.alert("应用资源更新完成！", function() {
												plus.runtime.restart();
											});
										}, function(e) {
											plus.nativeUI.closeWaiting();
											plus.nativeUI.alert("安装更新文件失败[" + e.code + "]：" + e.message);
											if (e.code == 10) {
												// alert('请清除临时目录');
											}
										});
									}else{
										console.log("??"+res.statusCode)
									}
								},
								fail: (res) => {
									plus.nativeUI.alert("下载失败！");
								}
							});
						}
					} else if (res.cancel) {
						console.log('稍后更新');
					}
				}
			});
		}
	}


	/**
	 * 芯联设备  发送系统广播进行上/下电操作  enable：true 上   false 下
	 */
	 static oPowerUpOrDown(enable:boolean){
		var Intent:any = plus.android.importClass("android.content.Intent");  
		var intent:any = new Intent("android.intent.action.SETTINGS_BJ");   
		var main:any = plus.android.runtimeMainActivity();  
		intent.putExtra("enable", enable);  
		main.sendBroadcast(intent);
	}
	/**
	 * 读取标签数据
	 */
	static async rfidReadCard(param:any,back:any){
		await bipRfid.startRead(param,back)
	}
	/**
	 * 向标签写数据
	 */
	static async rfidWriteCard(param:any,back:any){
		await bipRfid.writeCard(param,back)
	}
	/**
	 * 设备  手柄按键监听事件
	 */
	static initKeydown(keyNum:any,back:any){
		plus.key.addEventListener('keydown', event => {
			if(event.keyCode == keyNum){//手持机手柄按键
				back();
			}
		});
	}
	/**
	 * 设备  手柄按键移除监听事件
	 */
	static removeKeydown(back:any){
		if(back){
			plus.key.removeEventListener('keydown',back())	
		}else{
			plus.key.removeEventListener('keydown',event => {})	
		}
	}
}
