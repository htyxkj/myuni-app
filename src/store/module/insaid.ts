import {VuexModule,Module,Mutation,Action,getModule} from 'vuex-module-decorators'
import store from '../../store'
import BipInsAidNew from '@/classes/BipInsAidNew';
import {icl} from '@/classes/tools/CommICL';
const ICL = icl; 
import {BIPUtil} from '@/classes/api/request';
let tools = BIPUtil.ServApi;
export interface IInsAid {
	aidInfos: Map<string,BipInsAidNew>;//辅助ID,对象信息
    inProcess: Map<string,boolean>;//辅助ID,是否正在访问
    aidValues: Map<string,any>;//辅助ID+查询条件,values值
}

@Module({ dynamic: true , store:store,name:'insaid'})
class InsAid extends VuexModule implements IInsAid {
    //#region 属性
	public aidInfos = new Map<string,BipInsAidNew>();
	public inProcess = new Map<string,boolean>();
	public aidValues = new Map<string,any>();
    //#endregion
    //#region 业务代码
	@Mutation
	private SET_AID_INFOS(vals:any){
		this.aidInfos.set(vals.key,vals.value);
		this.aidInfos = new Map(this.aidInfos)
		uni.setStorageSync(vals.key,JSON.stringify(vals.value))
		
	}
	@Mutation
	private SET_IN_PROCESS(vals:any){
		this.inProcess.set(vals.key,vals.value);
	}
	
	@Mutation
	private SET_IN_PROCESS_CANCEL(key:string){
		this.inProcess.set(key,false);	
	}
    //#endregion
	
    //#region API
	@Action
	public fetchInsAid(val:any){
		 let id = val.id;
		let aid = val.aid;
		let k1 = aid
		let k = "";
		if(val.ak){
			k  = val.ak
		}
		if(id==300){
			k1 = ICL.AID_KEYCL+k+aid;
		}else{
			k1 = ICL.AID_KEY+k+aid;
		}
		
		let rr = uni.getStorageSync(k1);
		if(rr){
			const rtn = JSON.parse(rr)
			this.SET_IN_PROCESS({key:k1,value:true});
			this.SET_AID_INFOS({key:k1,value:rtn});
			return rtn;
		}		
		return tools.getBipInsAidInfo(aid, id).then((res:any)=>{
			if(res.data.id==0){
				let vrr = res.data.data.data
				this.SET_IN_PROCESS({key:k1,value:true});
				this.SET_AID_INFOS({key:k1,value:vrr});
			}
			return res;
		}).catch((err:any)=>{
			this.SET_IN_PROCESS_CANCEL(k1)
			return err;
		});
		return val;
	}
    //#endregion
}


export const InsAidModule = getModule(InsAid)
