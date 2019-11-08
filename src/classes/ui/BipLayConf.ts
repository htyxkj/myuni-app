export default class BipLayConf {
    bcells:boolean = false //是否是布局
    comp:object	//是界面组成还是布局
    name:string=''//名字
    span:number = 0.5//布局大小
    constructor(_bcomp:boolean,_comp:object,_name:string,_span:number = 0.5){
        this.bcells = _bcomp
        this.comp = _comp
        this.name = _name   
        this.span = _span     
    }

}