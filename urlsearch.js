function UrlSearch() 
{
    var name,value; 
    var str=location.href; //取得整个地址栏
    var num=str.indexOf("?") 
    str=str.substr(num+1); //取得所有参数   stringvar.substr(start [, length ]
    
    var arr=str.split("&"); //各个参数放到数组里
    for(var i=0;i < arr.length;i++){ 
        num=arr[i].indexOf("="); 
        if(num>0){ 
            name=arr[i].substring(0,num);
            value=arr[i].substr(num+1);
            this[name]=value;
            // 写入html
            if (undefined != document.getElementById(name)) {
                document.getElementById(name).value = value;
            }
        } 
    }
    
} 
//var Request=new UrlSearch(); //实例化
UrlSearch.prototype.get = function(name, type) {
    var value;
    if (undefined != this.name) {
        value = this.name;
    } else if (undefined != document.getElementById(name)) {
        value = document.getElementById(name).value;
    }
    if (type=='float') {
        return parseFloat(value);
    } else if (type=='ori') {
        return value;
    }
    return parseInt(value);
    //return value;
}
