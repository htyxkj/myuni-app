import Menu from '@/classes/Menu';
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
}
