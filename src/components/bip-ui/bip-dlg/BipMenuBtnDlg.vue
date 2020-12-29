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

	</view>
</template>

<script lang="ts">
import { Vue, Provide, Prop, Component, Inject, Watch } from 'vue-property-decorator';
import CCliEnv from '@/classes/cenv/CCliEnv';
import { BIPUtil } from '@/classes/api/request';
let tools = BIPUtil.ServApi;
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
				url: '/pages/dlg/dlg?cellId=' + cellId + '&color=' + color + '&title=' + this.Title +'&key='+key+'&vl='+vl,
			});
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
				console.log(cc)
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

}
</script>

<style lang="scss">
</style>
