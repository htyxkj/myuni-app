<template>
	<view style="z-index: 999999;">
		<!-- dlg 执行完成后弹框提示 -->
		<view class="cu-modal" :class="showMsg==true?'show':''">
			<view class="cu-dialog">
				<view class="cu-bar bg-white justify-end">
					<view class="content">提示</view>
					<view class="action" @tap="showMsg = false">
						<text class="cuIcon-close text-red"></text>
					</view>
				</view>
				<view class="padding-xl">
					{{msg}}
				</view>
			</view>
		</view>
		<!-- A -->
		<view class="cu-modal" :class="sqlDlg0==true?'show':''">
			<view class="cu-dialog">
				<view class="cu-bar bg-white justify-end">
					<view class="content">{{Title}}</view>
					<view class="action" @tap="sqlOk(false,0)">
						<text class="cuIcon-close text-red"></text>
					</view>
				</view>
				<view class="padding-xl">
					<span :style="sqlStyle[0]">{{sqlCont[0]}}</span>
				</view>
				<view class="cu-bar bg-white justify-end">
					<view class="action">
						<button class="cu-btn line-green text-green" @tap="sqlOk(false,0)">取消</button>
						<button class="cu-btn bg-green margin-left" @tap="sqlOk(true,0)">确定</button>
					</view>
				</view>
			</view>
		</view>
		<view class="cu-modal" :class="sqlDlg1==true?'show':''">
			<view class="cu-dialog">
				<view class="cu-bar bg-white justify-end">
					<view class="content">{{Title}}</view>
					<view class="action" @tap="sqlOk(false,1)">
						<text class="cuIcon-close text-red"></text>
					</view>
				</view>
				<view class="padding-xl">
					<span :style="sqlStyle[1]">{{sqlCont[1]}}</span>
				</view>
				<view class="cu-bar bg-white justify-end">
					<view class="action">
						<button class="cu-btn line-green text-green" @tap="sqlOk(false,1)">取消</button>
						<button class="cu-btn bg-green margin-left" @tap="sqlOk(true,1)">确定</button>
					</view>
				</view>
			</view>
		</view>
		<message ref="msg"></message>
	</view>
</template>

<script lang="ts">
import { Vue, Provide, Prop, Component, Inject, Watch } from 'vue-property-decorator';
import CCliEnv from '@/classes/cenv/CCliEnv';
import { BIPUtil } from '@/classes/api/request';
let tools = BIPUtil.ServApi;
import CDataSet from '@/classes/pub/CDataSet';
import { Tools } from '@/classes/tools/Tools';
@Component({
	components: {}
})
export default class bipMenuBtnDlg extends Vue { 
	@Inject('env') env!: CCliEnv; 
	Title:string = "";//按钮名称
	btn:any = null;//按钮

	showMsg:boolean = false;
	msg:string="";

	sqlCont:Array<any> = [];//SQL
	sqlStyle:Array<any> = [];//SQL样式
	sqlDlg0:boolean = false;//是否显示弹出框
	sqlDlg1:boolean = false;//是否显示弹出框

	/**
     * DLG入口
     */
    async open(btn:any,color:any){
        this.btn = btn; 
        this.Title = btn.name;
        if(btn.dlgType == 'A'){ // 执行SQL
            this.sqlCont = [];
            this.sqlStyle = []; 
            let cont = btn.dlgCont.split(";")[0];
            let ts = cont.split(",");
            ts.forEach((item:any) => {
                let tt = item.split("_style:");
                this.sqlCont .push(tt[0]);
                if(tt[1]){
                    let st = tt[1].replace(new RegExp("\\|",'g')," ;");    
                    this.sqlStyle.push(st);
                }
            });
            //请确认，是否注销该读者?_style:color:red|font-size:12px,请确认，是否注销该读者?_style:color:red|font-size:12px,;update insuser set  usrattr='9'  where  usrcode=@usrcode;0:注销失败;1:注销成功
            this.sqlDlg0 = true;
		}else if(btn.dlgType == 'B'){//弹出对象
            let cellId = btn.dlgCont.split(";")[0];
            let key = btn.dlgCont.split(";")[1];
			let vl = this.env.dsm.currRecord.data[key]
			uni.navigateTo({
				url: '/pages/public/dlg/dlg?cellId=' + cellId + '&color=' + color + '&title=' + this.Title +'&key='+key+'&vl='+vl,
			});
		}else if(btn.dlgType == 'C'){
			let cont = btn.dlgCont.split(";");
            let cont0 = cont[0]; //打开的菜单
            let cont1 = cont[1]; //数据值
            let cont2 = "";
            if(cont.length>=3){
                cont2 = cont[2]; //条件值
            }
			let cell = cont1.substring(0,cont1.indexOf(",")).split("=")
			if(cont1.indexOf(",") !=-1){
				cont1 = cont1.substring(cont1.indexOf(",")+1)
			}else{
				cell = cont1.split("=");
			}
			let data = this.finCellData(this.env.dsm,cell[0])
            if(data.length ==0){
                return;
			}
            let cont1arr = cont1.split(",")
            let jsoncont:any = [];//传递的内容
            for(var j=0;j<data.length;j++){
                let d1:any={}
                for(var i=0;i<cont1arr.length;i++){
                    let zd = cont1arr[i].split("=")
                    d1[zd[1]] = data[j][zd[0]]
                }
                jsoncont.push(d1);
            }
            let jsontj:any = {};//传递的条件
            if(cont2 != ""){
                let cont2arr = cont2.split(",")
                for(var i=0;i<cont2arr.length;i++){
                    let zd = cont2arr[i].split("=")
                    let vl = data[0][zd[1]];
                    if(!vl)
                        vl = zd[1]
                    jsontj[zd[0]] = vl
                }  
			}
            //打开的菜单
			let me = Tools.findMenu(cont0);
            if (!me) {
				let msg:any = this.$refs['msg'];
				msg.error({background: true,content:"没有" + cont0 + "菜单权限!" })
                return false;
            }else{
				me.color = 'blue';
                this.openMenu(me,jsontj,jsoncont);
            }
		}
	}

/******************************** A *****************************/
	/**
     * sql弹出框确定
     */
    async sqlOk(ok:boolean,index:number){
        if(ok){
            if(index < this.sqlCont.length -1){ 
                this.sqlDlg1 = true;
            }else{
                console.log("执行SQL语句修改")
                let b = JSON.stringify(this.btn);
                let v = JSON.stringify(this.env.dsm.currRecord.data);
                let cc:any = await tools.getDlgRunSql(v,b)
				this.showMsg = true;
				this.msg = cc.data.message
                this.sqlDlg0 = false;
                this.sqlDlg1 = false;
                this.$emit("Recheck")
            }
        }else{
            this.sqlDlg0 = false;
            this.sqlDlg1 = false;
        }
    }
/******************************** A *****************************/


    /**
     * 获取某个对象的当前选中的内容
     */
    finCellData(dsm:CDataSet,obj_id:string):any{
        if(dsm.ccells.obj_id == obj_id){
            if((dsm.ccells.attr & 0x40)>0){
                // if(dsm.currRecordArr.length>0){
                //     let data =[];
                //     for(var i=0;i<dsm.currRecordArr.length;i++){
                //         data.push(dsm.currRecordArr[i].data);
                //     }
                //     return data;
                // }else{
                //     return [];
                // }
            }else{            
                return [dsm.currRecord.data];
            }
        }
        for(var i =0;i< dsm.ds_sub.length ;i++){
            return this.finCellData(dsm.ds_sub[i],obj_id)
        }
        return null;
	}
	/**
	 * DLG C 打开菜单
	 */
	async openMenu(param:any,tjJson:any,contJson:any){
		let msg:any = this.$refs['msg'];
		let cc = param.command;
		let dd = cc.split("&");
		let pbuid = ''
		dd.forEach((aa:any)=>{
			let pbuids = aa.split('=')
			if(pbuids[0] == 'pbuid'){
				pbuid = pbuids[1]
			}
		})
		let mid = param.menuId;
		if(pbuid&&mid){
			uni.showLoading({title:'页面跳转中...'});
			await tools.getMenuParams(pbuid,mid).then((res:any)=>{
				uni.hideLoading();
				let data = res.data
				if(data.id>=0){
					let uriParams = data.data.mparams
					uni.setStorageSync(pbuid,JSON.stringify(uriParams))
					if(uriParams.beBill){//单据页面
						let tj = encodeURIComponent(JSON.stringify(tjJson))
						let cont = encodeURIComponent(JSON.stringify(contJson));
						let uri = '/pages/appinfo/appdetail?color='+param.color+'&title='+param.menuName+"&pbuid="+pbuid;
						uri += "&method=dlg";
						uri += "&tran_value="+cont;
						uri += "&tran_tj="+tj;
						this.pageJump(uri)
					}else{
						let uri = '/pages/appreport/appreport?color='+param.color+'&title='+param.menuName+"&pbuid="+pbuid;
						this.pageJump(uri);
					}
				}else{
					msg.error({background: true,content:"没有权限!" })
				}
			}).catch((err:any)=>{
				uni.hideLoading();
				msg.error({background: true,content:"没有权限!" })
			})
		}
	}
	pageJump(uri:string){
		uni.showLoading({title:'跳转中...'})
		uni.navigateTo({
			url: uri,complete:()=>{
				uni.hideLoading();
			}
		});
	}
}
</script>

<style lang="scss">
</style>
