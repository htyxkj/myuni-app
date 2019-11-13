import {VuexModule,Module,Mutation,Action,getModule} from 'vuex-module-decorators'
import store from '../../store'
import CCliEnv from '@/classes/cenv/CCliEnv';
import BipLayCells from '@/classes/ui/BipLayCells';
export interface IEnvInfo {
	env:CCliEnv;
	laycell:any;
}

@Module({ dynamic: true , store:store,name:'envInfo'})
class EnvInfo extends VuexModule implements IEnvInfo {
	public env:CCliEnv = new CCliEnv();
	public laycell:any = null;
	@Mutation
	private SET_ENV(_env:CCliEnv){
		this.env = _env;
	}
	
	@Mutation
	private SET_LAYCELL(lay:Object){
		this.laycell = lay;
	}
	
	//设置环境变量
	@Action({ commit: 'SET_ENV' })
	public setEnvInf(_env:CCliEnv){
		return _env;
	}	
	//设置环境变量
	@Action({ commit: 'SET_LAYCELL' })
	public setLay(lay:Object){
		return lay;
	}
	
}

export const EnvModule = getModule(EnvInfo)