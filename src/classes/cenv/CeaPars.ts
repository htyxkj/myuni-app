export default class CeaPars{
    sid: string= ''
    sbuid:string = ''
    yjcontext:any = ''
    statefr:any = 0
    stateagr:any = 0
    stateto:any = 0
    bup:any = 1
    content:any = ''
    tousr:any = ''
    ckd:any = false
    schk_mk:string = ''
    sorg:string = ''
    signature:string = ''
    constructor(param:any){
        const options={
            sid:'',
            sbuid:'',
            yjcontext:'',
            statefr:0,
            stateagr:0,
            stateto:0,
            bup:1,
            content:'',
            tousr:'',
            ckd:false,
            schk_mk:'',
            sorg:'',
            signature:''
          }
        Object.assign(this,options,param);
    }
}