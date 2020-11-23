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
}
