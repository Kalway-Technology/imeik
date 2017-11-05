odoo.define('lyt_auth_signup.base', function (require) {
"use strict";
   var ajax = require('web.ajax');

    $(document).ready(function () {

        var v = getCookieValue("secondsremained");//获取cookie值
        if(v>0){
            settime($("#getcode"));//开始倒计时
        }


        //开始倒计时
        var countdown;
        function settime(obj) {
            countdown=getCookieValue("secondsremained");
            if (countdown == 0) {
                obj.removeAttr("disabled");
                obj.val("点击获取验证码");
                return;
            } else {
                obj.attr("disabled", true);
                obj.val("重新发送验证码(" + countdown + ")");
                countdown--;
                editCookie("secondsremained",countdown,countdown+1);
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



             
           


            $('#getcode').on('click', function (event) {

                var user_name =$('#login').val();//取前端输入的用户名
                var password =$('#password').val();//取前端输入的密码
                var phone = $('#phonum').val();//取前端输入的手机号码
                //var phonecheck = /^(((13[0-9]{1})|(15[0-9]{1})|(18[0-9]{1}))+\d{8})$/; //手机号码现正则表达式

                //var inputcode = $('codename').val();//取输入的验证码
                
                // if (phone.length==0){
                //     alert('请输入手机号码！');
                // }
                // else if (phone.length!=11 && !phonecheck.test(phone)) {
                //     alert('请输入有效的手机号码！');
                //
                // }
                // if  (phone.length==11 && phonecheck.test(phone)) {

                if (user_name.length==0) {

                    Lobibox.notify('error', {
                        //delay: false,
                        title:'错误提示信息',
                        img: '/lyt_auth_signup/static/src/images/1.jpg',
                        msg: '请输入登录名或者登录邮箱！'
                });
                } else  if (password.length==0){
                    Lobibox.notify('error', {
                        //delay: false,
                        title:'错误提示信息',
                        img: '/lyt_auth_signup/static/src/images/1.jpg',
                        msg: '请输入您的密码!'});


                }
                if (user_name.length!=0 &&password.length!=0){

                    //调用后台Python方法
                    ajax.jsonRpc("/send_sms", 'call', {
                        //'mobile': phone,
                        'user_name':user_name,
                        //'code_input':inputcode
                    }).then(function (data) {
                        if (data['send'] == 'ok') {
                            Lobibox.notify('success', {
                            delay: false,
                            title:'成功提示信息',
                            img: '/lyt_auth_signup/static/src/images/1.jpg',
                            msg: "验证码已经发送至手机尾号"+'['+data['phone']+']'+',请注意查收！'});


                            addCookie("secondsremained",60,60);//添加cookie记录,有效时间60s
                            settime($("#getcode"));//开始倒计时

                            
                            // //短信验证码
                            // var InterValObj; //timer变量，控制时间
                            // var count = 60; //间隔函数，1秒执行
                            // var curCount;//当前剩余秒
                            //
                            //
                            // // 设置按钮显示效果，倒计时
                            // curCount = count;
                            // $("#getcode").attr("disabled", "true");
                            // $("#getcode").val("请在" + curCount + "秒内输入验证码");
                            // InterValObj = window.setInterval(SetRemainTime, 1000); // 启动计时器，1秒执行一次


                            

                            

                            
                        }else{
                            Lobibox.notify('error', {
                            //delay: false,
                            title:'错误提示信息',
                            img: '/lyt_auth_signup/static/src/images/1.jpg',
                            msg: '验证码发送失败!登录用户不存在或者手机号码格式不对！'});


                        }
                        // //timer处理函数
                        // function SetRemainTime() {
                        //         if (curCount == 0) {
                        //             window.clearInterval(InterValObj);// 停止计时器
                        //             $("#getcode").removeAttr("disabled");// 启用按钮
                        //             $("#getcode").val("重新发送验证码");
                        //
                        //         } else {
                        //             curCount--;
                        //             $("#getcode").val("请在" + curCount + "秒内输入验证码");
                        //         }
                        //     }
                        
                    });

                }

                


            });

    });


});          

    





























