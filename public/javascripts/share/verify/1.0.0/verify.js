define(function(require, exports, module) {
    


    if(typeof VeryIDE!='object'){
            var VeryIDE={script:[]};
    }
     
    VeryIDE.Password ={
            Level : ["很好","中等","较弱"],
            //强度值
            LevelValue : [30,20,0],
            //字符加数,分别为字母，数字，其它
            Factor : [1,2,5],
            //密码含几种组成的加数
            KindFactor : [0,0,10,20],
            //字符正则数字正则其它正则
            Regex : [/[a-zA-Z]/g,/\d/g,/[^a-zA-Z0-9]/g]
    }
     
    //返回级别数值
    VeryIDE.Password.StrengthValue = function(pwd){
            var strengthValue = 0;
            var ComposedKind = 0;
            for(var i = 0 ; i < this.Regex.length;i++){
                    var chars = pwd.match(this.Regex[i]);
                    if(chars != null){
                            strengthValue += chars.length * this.Factor[i];
                            ComposedKind ++;
                    }
            }
            strengthValue += this.KindFactor[ComposedKind];
            return strengthValue;
    }
     
    //返回级别信息
    VeryIDE.Password.StrengthLevel = function(pwd){
            var value = this.StrengthValue(pwd);
            for(var i = 0 ; i < this.LevelValue.length ; i ++){
                    if(value >= this.LevelValue[i] )
                            return this.Level[i];
            }
    }
     
    //全角转半角
    VeryIDE.switchChar = function (str){
            var str1="1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
            var str2="１２３４５６７８９０ａｂｃｄｅｆｇｈｉｊｋｌｍｎｏｐｑｒｓｔｕｖｗｘｙｚＡＢＣＤＥＦＧＨＩＪＫＬＭＮＯＰＱＲＳＴＵＶＷＸＹＺ";
           
            var len=str.length;
            for(var i=0; i<len; i++){
                    var n = str2.indexOf(str.charAt(i));
                    if(n != -1) str = str.replace(str.charAt(i), str1.charAt(n));
            }
            return str;
    }
     
    //***
     
    //校验是为电子邮件地址
    VeryIDE.isEmail = function (v){
            var filter=/^\s*([A-Za-z0-9_-]+(\.\w+)*@(\w+\.)+\w{2,3})\s*$/;
            if(!filter.test(v)){return false;}return true;
    }
     
    //校验是否为Http地址
    VeryIDE.isHttp = function (v){
            var regExp=/((^http)|(^https)|(^ftp)):\/\/(\w)+.(\w)+/;
            var rtn=v.match(regExp);
            if (rtn==null){
                    return false;
            }else{
                    return true;
            }
    }
     
    //校验是否为URL
    VeryIDE.isURL = function (v){
            var re =/^[a-zA-z]+:\/\/(\w+(-\w+)*)(\.(\w+(-\w+)*))*(\?\S*)?$/;
            alert(re.test(v))
            if(!re.test(v)){
                    return false;
            }else{
                    return true;
            }
    }
     
    /*检测字符串中是否含有非法字符*/
    VeryIDE.isSafe = function (str){
            var chkstr;
            var i;
            chkstr="'*%@#^$`~!^&*()=+{}\\|{}[];:/?<>,.";
            for (i=0;i<str.length;i++){
                    if (chkstr.indexOf(str.charAt(i))!=-1) return false;
            }
            return true;
    }
     
    /* 检测身份证号 */
    VeryIDE.isIDCard = function (str){
            if(str.length==15){
                    return isDigit(str.substring(0,14));
            }else if(str.length==18){
                    return isDigit(str);
            }
            else{
                    return false;
            }
    }
     
    //日期比较,返回时间差
    VeryIDE.compareDate = function (year,month,day,hour,mins,secs){
            dateFuture = new Date(year,month,day,hour,mins,secs);
            dateNow = new Date();                                                                  
            amount = dateFuture.getTime() - dateNow.getTime();
            if(amount < 0){
                    this.days=0;
                    this.hours=0;
                    this.mins=0;
                    this.secs=0;
            }else{
                    days=0;
                    hours=0;
                    mins=0;
                    secs=0;
                    thistextt="";
                    amount = Math.floor(amount/1000);//kill the "milliseconds" so just secs
                    days=Math.floor(amount/86400);//days
                    amount=amount % 86400;
                    hours=Math.floor(amount/3600);//hours
                    amount=amount % 3600;
                    mins=Math.floor(amount/60);//minutes
                    amount=amount % 60;
                    secs=Math.floor(amount);//seconds
     
                    this.days=days;
                    this.hours=hours;
                    this.mins=mins;
                    this.secs=secs;
            }
    }
     
    //校验是否全由数字组成
    VeryIDE.isDigit = function (s){
            var patrn=/^[0-9]{1,20}$/;
            if (!patrn.exec(s)) return false
            return true
    }
     
    //校验登录名：只能输入5-20个以字母开头、可带数字、“_”、“.”的字串
    //----可以含有中文，不能含有全角
    VeryIDE.isRegisterUserName = function (s){
            var patrn=/^[a-zA-Z]{1}([a-zA-Z0-9]|[._]){4,19}$/;
            if (!patrn.exec(s)) return false
            return true
    }
    //是否为中文
    VeryIDE.isChinese = function(s){
        var reg = /[\u4E00-\u9FA5\uF900-\uFA2D]/;
        return reg.test(s);
    }
    //是否含有全角符号
    VeryIDE.isFullwidthChar = function(s){
        var reg = /[\uFF00-\uFFEF]/;
        return reg.test(str);
    }
    //校验用户姓名：只能输入1-30个以字母开头的字串
    VeryIDE.isTrueName = function (s){
            var patrn=/^[a-zA-Z]{1,30}$/;
            if (!patrn.exec(s)) return false
            return true
    }
     
    //校验密码：只能输入6-20个字母、数字、下划线
    VeryIDE.isPassword = function (s){
            var patrn=/^(\w){6,20}$/;
            if (!patrn.exec(s)) return false
            return true
    }
     
    //校验普通电话、传真号码：可以“+”开头，除数字外，可含有“-”
    VeryIDE.isPhone = function (s){
            var patrn=/(?:^0{0,1}1\d{10}$)|(?:^[+](\d){1,3}1\d{10}$)|(?:^0[1-9]{1,2}\d{1}\-{0,1}[2-9]\d{6,7}$)|(?:^\d{7,8}$)|(?:^0[1-9]{1,2}\d{1}\-{0,1}[2-9]\d{6,7}[\-#]{1}\d{1,5}$)/;
            if (!patrn.exec(s)) return false
            return true
    }
     
    //校验手机号码：必须以数字开头，除数字外，可含有“-”
    /*
    function isMobile(s){
            var patrn=/^[+]{0,1}(\d){1,3}[ ]?([-]?((\d)|[ ]){1,12})+$/;
            if (!patrn.exec(s)) return false
            return true
    }
    */
    VeryIDE.isMobile = function (s){
            var patrn=/^[1][0-9]{10}$/;
            if (!patrn.exec(s)) return false
            return true
    }
     
    //校验邮政编码
    VeryIDE.isZip = function (s){
            //var patrn=/^[a-zA-Z0-9]{3,12}$/;
            var patrn=/^[a-zA-Z0-9 ]{3,12}$/;
            if (!patrn.exec(s)) return false
            return true
    }
     
    //校验搜索关键字
    VeryIDE.isSearch = function (s){
            var patrn=/^[^`~!@#$%^&*()+=|\\\][\]\{\}:;\'\,.<>/?]{1}[^`~!@$%^&()+=|\\\][\]\{\}:;\\,.<>?]{0,19}$/;// \'\
            if (!patrn.exec(s)) {
                   return false 
            }
                    
            return true
    }
     
    //校验IP地址
    VeryIDE.isIP = function (s){
            var patrn=/^[0-9.]{1,20}$/;
            if (!patrn.exec(s)) return false
            return true
    }
     
     
    /*********************************************************************************
    * FUNCTION: isBetween
    * PARAMETERS: val AS any value
    * lo AS Lower limit to check
    * hi AS Higher limit to check
    * CALLS: NOTHING
    * RETURNS: TRUE if val is between lo and hi both inclusive, otherwise false.
    **********************************************************************************/
    VeryIDE.isBetween = function  (val, lo, hi) {
            if ((val < lo) || (val > hi)) { return(false); }
            else { return(true); }
    }
     
    /*********************************************************************************
    * FUNCTION: isDate checks a valid date
    * PARAMETERS: theStr AS String
    * CALLS: isBetween, isInt
    * RETURNS: TRUE if theStr is a valid date otherwise false.
    **********************************************************************************/
    VeryIDE.isDate = function  (theStr) {
            var the1st = theStr.indexOf('-');
            var the2nd = theStr.lastIndexOf('-');
           
            if (the1st == the2nd) { return(false); }
            else {
            var y = theStr.substring(0,the1st);
            var m = theStr.substring(the1st+1,the2nd);
            var d = theStr.substring(the2nd+1,theStr.length);
            var maxDays = 31;
           
            if (isInt(m)==false || isInt(d)==false || isInt(y)==false) {
            return(false); }
            else if (y.length < 4) { return(false); }
            else if (!isBetween (m, 1, 12)) { return(false); }
            else if (m==4 || m==6 || m==9 || m==11) maxDays = 30;
            else if (m==2) {
            if (y % 4 > 0) maxDays = 28;
            else if (y % 100 == 0 && y % 400 > 0) maxDays = 28;
            else maxDays = 29;
            }
            if (isBetween(d, 1, maxDays) == false) { return(false); }
            else { return(true); }
            }
    }
     
    /*********************************************************************************
    * FUNCTION: isEuDate checks a valid date in British format
    * PARAMETERS: theStr AS String
    * CALLS: isBetween, isInt
    * RETURNS: TRUE if theStr is a valid date otherwise false.
    **********************************************************************************/
    VeryIDE.isEuDate = function  (theStr) {
            if (isBetween(theStr.length, 8, 10) == false) { return(false); }
            else {
            var the1st = theStr.indexOf('/');
            var the2nd = theStr.lastIndexOf('/');
           
            if (the1st == the2nd) { return(false); }
            else {
            var m = theStr.substring(the1st+1,the2nd);
            var d = theStr.substring(0,the1st);
            var y = theStr.substring(the2nd+1,theStr.length);
            var maxDays = 31;
           
            if (isInt(m)==false || isInt(d)==false || isInt(y)==false) {
            return(false); }
            else if (y.length < 4) { return(false); }
            else if (isBetween (m, 1, 12) == false) { return(false); }
            else if (m==4 || m==6 || m==9 || m==11) maxDays = 30;
            else if (m==2) {
            if (y % 4 > 0) maxDays = 28;
            else if (y % 100 == 0 && y % 400 > 0) maxDays = 28;
            else maxDays = 29;
            }
           
            if (isBetween(d, 1, maxDays) == false) { return(false); }
            else { return(true); }
            }
            }
    }
     
    /********************************************************************************
    * FUNCTION: Compare Date! Which is the latest!
    * PARAMETERS: lessDate,moreDate AS String
    * CALLS: isDate,isBetween
    * RETURNS: TRUE if lessDate<moreDate
    *********************************************************************************/
    VeryIDE.isComdate = function  (lessDate , moreDate)
    {
            if (!isDate(lessDate)) { return(false);}
            if (!isDate(moreDate)) { return(false);}
            var less1st = lessDate.indexOf('-');
            var less2nd = lessDate.lastIndexOf('-');
            var more1st = moreDate.indexOf('-');
            var more2nd = moreDate.lastIndexOf('-');
            var lessy = lessDate.substring(0,less1st);
            var lessm = lessDate.substring(less1st+1,less2nd);
            var lessd = lessDate.substring(less2nd+1,lessDate.length);
            var morey = moreDate.substring(0,more1st);
            var morem = moreDate.substring(more1st+1,more2nd);
            var mored = moreDate.substring(more2nd+1,moreDate.length);
            var Date1 = new Date(lessy,lessm,lessd);
            var Date2 = new Date(morey,morem,mored);
            if (Date1>Date2) { return(false);}
            return(true);
    }
     
    /*********************************************************************************
    * FUNCTION isEmpty checks if the parameter is empty or null
    * PARAMETER str AS String
    **********************************************************************************/
    VeryIDE.isEmpty = function  (str) {
            if ((str==null)||(str.length==0)) return true;
            else return(false);
    }
     
    /*********************************************************************************
    * FUNCTION: isInt
    * PARAMETER: theStr AS String
    * RETURNS: TRUE if the passed parameter is an integer, otherwise FALSE
    * CALLS: isDigit
    **********************************************************************************/
    VeryIDE.isInt = function  (theStr) {
            var flag = true;
           
            if (isEmpty(theStr)) { flag=false; }
            else
            { for (var i=0; i<theStr.length; i++) {
            if (isDigit(theStr.substring(i,i+1)) == false) {
            flag = false; break;
            }
            }
            }
            return(flag);
    }
     
    /*********************************************************************************
    * FUNCTION: isReal
    * PARAMETER: heStr AS String
    decLen AS Integer (how many digits after period)
    * RETURNS: TRUE if theStr is a float, otherwise FALSE
    * CALLS: isInt
    **********************************************************************************/
    VeryIDE.isReal = function  (theStr, decLen) {
            var dot1st = theStr.indexOf('.');
            var dot2nd = theStr.lastIndexOf('.');
            var OK = true;
           
            if (isEmpty(theStr)) return false;
           
            if (dot1st == -1) {
            if (!isInt(theStr)) return(false);
            else return(true);
            }
           
            else if (dot1st != dot2nd) return (false);
            else if (dot1st==0) return (false);
            else {
            var intPart = theStr.substring(0, dot1st);
            var decPart = theStr.substring(dot2nd+1);
           
            if (decPart.length > decLen) return(false);
            else if (!isInt(intPart) || !isInt(decPart)) return (false);
            else if (isEmpty(decPart)) return (false);
            else return(true);
            }
    }
     
    /*********************************************************************************
    * FUNCTION: isEmail
    * PARAMETER: String (Email Address)
    * RETURNS: TRUE if the String is a valid Email address
    * FALSE if the passed string is not a valid Email Address
    * EMAIL FORMAT: AnyName@EmailServer e.g; webmaster@hotmail.com
    * @ sign can appear only once in the email address.
    *********************************************************************************/
    VeryIDE.isEmail = function  (theStr) {
            var atIndex = theStr.indexOf('@');
            var dotIndex = theStr.indexOf('.', atIndex);
            var flag = true;
            theSub = theStr.substring(0, dotIndex+1)
           
            if ((atIndex < 1)||(atIndex != theStr.lastIndexOf('@'))||(dotIndex < atIndex + 2)||(theStr.length <= theSub.length))
            { return(false); }
            else { return(true); }
    }
     
    /*********************************************************************************
    * FUNCTION: DecimalFormat
    * PARAMETERS: paramValue -> Field value
    * CALLS: NONE
    * RETURNS: Formated string
    **********************************************************************************/
    VeryIDE.DecimalFormat = function  (paramValue) {
            var intPart = parseInt(paramValue);
            var decPart =parseFloat(paramValue) - intPart;
           
            str = "";
            if ((decPart == 0) || (decPart == null)) str += (intPart + ".00");
            else str += (intPart + decPart);
           
            return (str);
    }
     
    /*state*/
    VeryIDE.script["verify"]=true;


    module.exports = VeryIDE;
});


