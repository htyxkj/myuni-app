import Menu from '@/classes/Menu';
import { BIPUtil } from '@/classes/api/request';
let tools = BIPUtil.ServApi;
import Cells from '@/classes/pub/coob/Cells';
import CDataSet from '@/classes/pub/CDataSet';
import comm from '@/static/js/comm.js';
let commURL: any = comm;
export class Tools{
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
}
