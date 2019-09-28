import {VuexModule,Module,Mutation,Action,getModule} from 'vuex-module-decorators'
import store from '../../store'

export interface IComponent {
    Name: string;
    //sendmsg 組件 input 值
    SendMsg: string;
}

@Module({ dynamic: true,namespaced:true,store: store, name: 'App' })
class App extends VuexModule implements IComponent {
    //#region 属性
    public Name = '11';
    //sendmsg 組件 input 值
    public SendMsg = '';
    //#endregion
    //#region 业务代码
    @Mutation
    private SendMsg_Edit(Value: string) {
        this.SendMsg = Value
    }
    @Mutation
    private SendMsg_Close() {
        this.SendMsg = ''
    }
    /**
     * 數據發生改變時
     * @param Name 
     */
    @Mutation
    private SetName(Name: string) {
        this.Name = Name;
    }
    //#endregion
    //#region API
    /**
     * 關閉彈窗
     */
    @Action({ commit: 'SendMsg_Close' })
    public SendMsg_Exit() { }
    /**
     * 
     * @param Value 
     */
    @Action({ commit: 'SendMsg_Edit' })
    public SendMsg_Update(Value: string) {
        return Value;
    }
    @Action({ commit: 'SetName' })
    public EditName(Name: string) {
        return Name;
    }
    //#endregion
}


export const ComponentModule = getModule(App)
