<template>
    <view>
        <cu-custom :bgColor="'bg-' + color" :isBack="true">
            <block slot="backText">返回</block>
            <block slot="content"><view class="header-title">{{ title }}</view></block>
        </cu-custom>	
        <view v-if="src">
            <web-view :src="src" @message="view_message"></web-view>
        </view>
    </view>    
</template>

<script lang="ts">
    import {Vue,Provide,Prop,Component} from 'vue-property-decorator';
    import { LoginModule } from '@/store/module/login'; //导入vuex模块，自动注入
    import comm from '@/static/js/comm.js';
    let commURL: any = comm;
    @Component({components:{}})
	export default class airMap extends Vue {
        src:any = null;
        pageType:any = null;//页面类型  实时轨迹
        color:any = "blue";//头部颜色
        title:any = "";//头部标题
        StatusBar:any =0;
        CustomBar:any =0;
        onLoad(options:any) {
            this.StatusBar = Vue.prototype.StatusBar;
            this.CustomBar = Vue.prototype.CustomBar;
            this.pageType = options.type;
            this.color = options.color;
            this.title = options.title;
            let usrCode = "";
            let snKey ="";
            //判断是否登陆
            if(this.loginState){
                let _user = uni.getStorageSync('user');
                if(_user){
                    let user = JSON.parse(_user)
                    usrCode = user.userCode;
                }
                snKey = uni.getStorageSync('snkey')
            }
            
            let _src = "/static/map/tianMap/air-super/map.html?pageType="+this.pageType;//页面类型
            _src += "&usrCode="+usrCode;            //用户编码
            _src += "&snKey="+snKey;                //snkey
            _src += "&CustomBar="+this.CustomBar;   //导航栏
            _src += "&StatusBar="+this.StatusBar;   //状态栏高度
            _src += "&cc="+uni.upx2px(60);          //标题栏高度
            _src += "&title="+this.title;           //标题
            _src += "&servUrl="+commURL.BaseUri;    //服务端URL
            _src += "&dbid="+commURL.BaseDBID;      //数据库连接标识
            _src += "&vs="+new Date().getTime();      //数据库连接标识
            // _src += "&servUrl=";
            this.src = _src;
            
        }
        //获取登陆状态
        get loginState(){
			let v = LoginModule.loginState
			if(!v){
				let value = uni.getStorageSync('isLogin');
				if(value){
					LoginModule.setState(true)
					let _user = uni.getStorageSync('user');
					if(_user){
						let user = JSON.parse(_user)
						LoginModule.setUser(user)
					}
					let _ms = uni.getStorageSync('menus');
					if(_ms){
						let ms = JSON.parse(_ms)
						LoginModule.setMenus(ms)
					}
					let snkey = uni.getStorageSync('snkey')
					LoginModule.setSnKey(snkey)
					v = true;
				}
			}
			return v;
        }

        view_message(data:any){
            uni.navigateBack({
                delta: 1
            });
        }
	}
</script>
<style scoped>

</style>