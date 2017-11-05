odoo.define('lyt_auth_signup.signup', function (require) {
"use strict";
   var ajax = require('web.ajax');

    $(document).ready(function () {

        var b = getCookieValue("secondsremained_a");//获取cookie值
        if(b>0){
            settime($("#getsms"));//开始倒计时
        }


        //开始倒计时
        var countdown;
        function settime(obj) {
            countdown=getCookieValue("secondsremained_a");
            if (countdown == 0) {
                obj.removeAttr("disabled");
                obj.val("点击获取验证码");
                return;
            } else {
                obj.attr("disabled", true);
                obj.val("重新发送验证码(" + countdown + ")");
                countdown--;
                editCookie("secondsremained_a",countdown,countdown+1);
            }
            setTimeout(function() { settime(obj) },1000) //每1000毫秒执行一次
        }


        //发送验证码时添加cookie
        function addCookie(name,value,expiresHours){
            var cookieString=name+"="+escape(value);
            //判断是否设置过期时间,0代表关闭浏览器时失效
            if(expiresHours>0){
                var date=new Date();
                date.setTime(date.getTime()+expiresHours*1000);
                cookieString=cookieString+";expires=" + date.toUTCString();
            }
                document.cookie=cookieString;
        }

        //修改cookie的值
        function editCookie(name,value,expiresHours){
            var cookieString=name+"="+escape(value);
            if(expiresHours>0){
              var date=new Date();
              date.setTime(date.getTime()+expiresHours*1000); //单位是毫秒
              cookieString=cookieString+";expires=" + date.toGMTString();
            }
              document.cookie=cookieString;
        }
        //根据名字获取cookie的值
        function getCookieValue(name){
              var strCookie=document.cookie;
              var arrCookie=strCookie.split("; ");
              for(var i=0;i<arrCookie.length;i++){
                var arr=arrCookie[i].split("=");
                if(arr[0]==name){
                  return unescape(arr[1]);
                  break;
                }else{
                     return "";
                     break;
                 }
              }

        }

            //点击获取短信验证码按钮动作事件
            $('#getsms').on('click', function (event) {

                var login =$('#login').val();//取前端邮箱
                var email =$('#name').val();//取前端输入的用户名
                var password =$('#password').val();//取前端输入的密码
                var confirm_password =$('#confirm_password').val();//取确认密码
                var phone = $('#mobile').val();//取前端输入的手机号码
                var phonecheck = /^(((13[0-9]{1})|(15[0-9]{1})|(18[0-9]{1}))+\d{8})$/; //手机号码现正则表达式
                var inputcode = $('codename').val();//取输入的验证码

                    if (login.length==0) {
                        Lobibox.notify('info', {
                        //delay: false,
                        title:'提示信息',
                        img: '/lyt_auth_signup/static/src/images/1.jpg',
                        msg: '请输入您的电子邮箱!'});
                    }
                    else if(email.length == 0) {
                        Lobibox.notify('info', {
                        //delay: false,
                        title:'提示信息',
                        img: '/lyt_auth_signup/static/src/images/1.jpg',
                        msg: '请输入您的姓名!'});
                    } else if (password==0 || confirm_password == 0) {
                        Lobibox.notify('info', {
                        //delay: false,
                        title:'提示信息',
                        img: '/lyt_auth_signup/static/src/images/1.jpg',
                        msg: '请输入密码，确认密码并保持一致！'});

                    }
                    if (login.length!=0 &&email.length != 0 && password.length != 0 && confirm_password != 0) {
                    if (phone.length == 0) {
                        Lobibox.notify('info', {
                        //delay: false,
                        title:'提示信息',
                        img: '/lyt_auth_signup/static/src/images/1.jpg',
                        msg: '请输入手机号码！'});

                    }
                    else if (phone.length != 11 && !phonecheck.test(phone)) {
                        Lobibox.notify('error', {
                        //delay: false,
                        title:'提示信息',
                        img: '/lyt_auth_signup/static/src/images/1.jpg',
                        msg: '请输入有效格式的手机号码！'});

                    }
                    if (phone.length == 11 && phonecheck.test(phone)) {

                            //调用后台Python方法
                            ajax.jsonRpc("/send_signup_sms", 'call', {
                                'mobile': phone,
                                'user_name': login,
                                'code_input': inputcode
                            }).then(function (data) {
                                if (data['mobile_error']=='error'){
                                    Lobibox.notify('error', {
                                    //delay: false,
                                    title:'错误提示信息',
                                    img: '/lyt_auth_signup/static/src/images/1.jpg',
                                    msg: '您输入的手机号码已经注册过，请直接登录！'});

                                }
                                else if(data['send'] == 'ok') {
                                    Lobibox.notify('success', {
                                    delay: false,
                                    title:'成功提示信息',
                                    img: '/lyt_auth_signup/static/src/images/1.jpg',
                                    msg: "验证码已经发送至手机尾号"+'['+data['phone']+']'+',请注意查收！'});

                                    addCookie("secondsremained_a",60,60);//添加cookie记录,有效时间60s
                                    settime($("#getsms"));//开始倒计时

                                    //短信验证码
                                    // var InterValObj; //timer变量，控制时间
                                    // var count = 60; //间隔函数，1秒执行
                                    // var curCount;//当前剩余秒


                                    // 设置按钮显示效果，倒计时
                                    // curCount = count;
                                    // $("#getsms").attr("disabled", "true");
                                    // $("#getsms").val("请在" + curCount + "秒内输入验证码");
                                    // InterValObj = window.setInterval(SetRemainTime, 1000); // 启动计时器，1秒执行一次

                                } else {
                                    Lobibox.notify('error', {
                                    //delay: false,
                                    title:'错误提示信息',
                                    img: '/lyt_auth_signup/static/src/images/1.jpg',
                                    msg: '验证码发送失败!请重新发送验证码或者联系系统管理员！'});

                                }

                                //timer处理函数
                                // function SetRemainTime() {
                                //     if (curCount == 0) {
                                //         window.clearInterval(InterValObj);// 停止计时器
                                //         $("#getsms").removeAttr("disabled");// 启用按钮
                                //         $("#getsms").val("重新发送验证码");
                                //
                                //     } else {
                                //         curCount--;
                                //         $("#getsms").val("请在" + curCount + "秒内输入验证码");
                                //     }
                                // }

                            });

                        }


                    }


            });

    });


});          

    





























