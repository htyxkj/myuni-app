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
	
	size(){
		return this.data.length;
	}
}