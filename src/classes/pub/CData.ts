import CRecord from './CRecord';
import PageInfo from '../search/PageInfo';

export default class CData{
    data:Array<CRecord> //数据集合
    rmdata:Array<CRecord>//删除的数据
    sumData:Array<any>
    obj_id:string//对象ID
    index:number = -1
    attr!:number;
    _bnull:boolean = true;
    page:PageInfo = new PageInfo()
    constructor(_obj_id:string){
        this.data = new Array<CRecord>()
        this.rmdata = new Array<CRecord>()
        this.obj_id = _obj_id
        this.sumData = new Array<any>();
    }
    public clearValues():void{
        this.data.length = 0
        this.rmdata.length = 0
        this.data = []
        this.index = 0
        this.attr &= ~(0x20000|0x80000)
    }
	size(){
		return this.data.length;
    }
    getDataAtIndex(_i:number):CRecord{
        return this.data[_i];
    }
	
	setStateSub(state: number){
		this.data.forEach((crd:CRecord) => {
			crd.c_state = state;
			if(crd.subs.length > 0){
				crd.subs.forEach(cd0=>{
				cd0.setStateSub(state)
				}) 
			}
		});
	}
}