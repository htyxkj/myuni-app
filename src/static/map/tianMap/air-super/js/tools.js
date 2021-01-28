
var servUrl = "";//服务端接口
var userCode = "";//当前用户
var snKey = "";//用户snkey


/******************************************************** 实时页面 ************************************************************/
//初始化实时页面
function initRealTime(){
    //查询全部设备
    
}

/******************************************************** 实时页面 ************************************************************/


/******************************************************** 回放页面 ************************************************************/
//初始化回放页面
function initPlayBack(){
    
}
/******************************************************** 回放页面 ************************************************************/



//http 请求封装
var http = {};
http.quest = function (option, callback) {
    var url = option.url;
    var method = option.method;
    var data = option.data;
    var timeout = option.timeout || 0;
    var xhr = new XMLHttpRequest();
    (timeout > 0) && (xhr.timeout = timeout);
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4) {
            if (xhr.status >= 200 && xhr.status < 400) {
            var result = xhr.responseText;
            try {result = JSON.parse(xhr.responseText);} catch (e) {}
                callback && callback(null, result);
            } else {
                callback && callback('status: ' + xhr.status);
            }
        }
    }.bind(this);
    xhr.open(method, url, true);
    if(typeof data === 'object'){
        try{
            data = JSON.stringify(data);
        }catch(e){}
    }
    xhr.send(data);
    xhr.ontimeout = function () {
        callback && callback('timeout');
        console.log('%c连%c接%c超%c时', 'color:red', 'color:orange', 'color:purple', 'color:green');
    };
};

http.get = function (url, callback) {
    var option = url.url ? url : { url: url };
    option.method = 'get';
    this.quest(option, callback);
};

http.post = function (option, callback) {
    option.method = 'post';
    this.quest(option, callback);
};

//拆分URL参数
function getQueryVariable(variable){
    var query = window.location.search.substring(1);
    var vars = query.split("&");
    for (var i=0;i<vars.length;i++) {
            var pair = vars[i].split("=");
            if(pair[0] == variable){return pair[1];}
    }
    return(false);
}


/**
 * 解析URL传参，设置页面
 */
function initPage(){
    var airMapDiv = document.getElementById("airMapDiv");
    airMapDiv.style.height = window.screen.availHeight+'px';
    let CustomBar =  getQueryVariable("CustomBar");
    CustomBar = CustomBar?CustomBar:80
    let StatusBar =  getQueryVariable("StatusBar");
    StatusBar = StatusBar?StatusBar:30
    let topColor =  getQueryVariable("topColor");//标题栏颜色
    topColor = topColor?topColor:'#0081ff'
    var top1 = document.getElementById("top1");
    top1.style.height = CustomBar+'px';
    top1.style["background-color"] = topColor;
    var top2 = document.getElementById("top2");
    top2.style.height = CustomBar+'px';
    top2.style['padding-top'] = StatusBar+'px';
    var top3 = document.getElementById("top3");
    top3.style.top = StatusBar+'px';
    var top4 = document.getElementById("top4");
    top4.style.top = StatusBar+'px';
    let cc =  getQueryVariable("cc");//标题栏高度
    top3.style.height = cc+'px';
    top3.style["line-height"] = cc+'px';
    let title =  getQueryVariable("title");//页面标题
    title = decodeURIComponent(title);
    top4.innerHTML=title;
    servUrl =  getQueryVariable("servUrl");//服务端API接口
    userCode =  getQueryVariable("usrCode");//当前用户编码
    snKey =  getQueryVariable("snKey");//当前用户snkey
}