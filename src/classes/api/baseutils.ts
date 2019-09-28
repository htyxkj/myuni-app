import {GlobalVariable} from './icl'
import comm from '@/static/js/comm.js';
let commURL:any = comm;
/**
 * @description 基础工具类，用于包装访问API参数
 */
export namespace baseUtils{
	class Utils{
		getLoginParmasUri():any{
			return Object.assign({
			        apiId: GlobalVariable.API_ID_LOGIN,
			        dbid: commURL.BaseDBID
			});
		}
	}
	
	  export const tools = new Utils();
}