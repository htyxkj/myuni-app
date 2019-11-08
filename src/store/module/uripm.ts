import {VuexModule,Module,Mutation,Action,getModule} from 'vuex-module-decorators'
import store from '../../store'
import URIParams from '@/classes/URIParams';
export interface IUripm {
	// urip:URIParams;
	urip:Map<string,URIParams>;
}

@Module({ dynamic: true , store:store,name:'uripm'})
class Uripm extends VuexModule implements IUripm {
    //#region 属性
	// public urip = new URIParams()
	public urip = new Map<string,URIParams>();
    //#endregion
    //#region 业务代码
	@Mutation
	private SET_URIP(value:URIParams){
		this.urip.set(value.pbuid,value);
		uni.setStorage({key:'URIP_'+value.pbuid,data:JSON.stringify(value)})
	}
    //#endregion
	
    //#region API
	@Action({ commit: 'SET_URIP'})
	public setUriPM(urip:URIParams){
		// this.SET_USER(user)
		return urip;
	}
    //#endregion
}


export const UriPModule = getModule(Uripm)
