# -*- coding: utf-8 -*-
# Part of Odoo. See LICENSE file for full copyright and licensing details.
import logging
import xmltodict
import requests
import werkzeug
import random
import datetime
import json

import logging
import odoo
from odoo import http, _
from odoo.addons.auth_signup.models.res_users import SignupError
from odoo.http import request

from ..tools import sms as SmsSender

_logger = logging.getLogger(__name__)

class sign_up_sms(http.Controller):

    @http.route([
        '/send_signup_sms'
    ], type='json', auth='public', website=True)
    def send_signup_sms(self, user_name=None,mobile=None,code_input=None,**kw):

        check_moblie = request.env['res.partner'].sudo().search([('mobile', '=', mobile,)])

        if len(check_moblie):
            return {'mobile_error':'error'}
        else:
            #随机验证码生成方法，4位数
            chars = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']
            x = random.choice(chars), random.choice(chars), random.choice(chars), random.choice(chars)
            verifyCode = "".join(x)

            # sms account
            account = request.env['sms.account'].search([('send_type', '=', 'reg')], limit=1)
            if not account:
                return False

            single_sender = SmsSender.SmsSingleSender(int(account.appid), account.appkey)

            _template_id = int(account.templateId)
            _params = [verifyCode]
            # 普通单发
            result = single_sender.send_with_param("86", mobile, _template_id, _params, "", "", "")
            rsp = json.loads(result)
            print result

            if rsp.get('result') == 0:
                # 创建发送短信记录的方法
                res_user_obj = request.env['lyt.sms.history']

                res_user_obj.sudo().create({
                    'user_name': user_name,
                    'security_code': verifyCode,
                    'mobile': mobile,
                    'state': 'ok'
                })

                return {'send': 'ok', 'phone':mobile[-4:]}
            else:
                return False


class AuthSignupHome(odoo.addons.auth_signup.controllers.main.AuthSignupHome):

	def do_signup(self, qcontext):
		""" Shared helper that creates a res.partner out of a token """
		values = dict((key, qcontext.get(key)) for key in ('login', 'name', 'password', 'mobile'))
		assert any([k for k in values.values()]), "The form was not properly filled in."
		assert values.get('password') == qcontext.get('confirm_password'), "Passwords do not match; please retype them."
		self._signup_with_values(qcontext.get('token'), values)
		request.cr.commit()



class AuthSignupnewHome(odoo.addons.auth_signup.controllers.main.AuthSignupHome):
    @http.route('/web/signup', type='http', auth='public', website=True)
    def web_auth_signup(self, *args, **kw):
        qcontext = self.get_auth_signup_qcontext()

        if not qcontext.get('token') and not qcontext.get('signup_enabled'):
            raise werkzeug.exceptions.NotFound()

        if 'error' not in qcontext and request.httprequest.method == 'POST':
            #取得前端用户登录邮箱
            login_name = request.params['login']
            print login_name
            #取得前端用户的验证码
            input_code = request.params['codename']
            print  input_code


            # 输入超时60秒验证
            code_create_time = request.env['lyt.sms.history'].sudo().search(
                [('user_name', '=', login_name)], order='id desc', limit=1
            ).send_time

            if code_create_time ==False:
                qcontext["error"] = _(u"请点击‘获取手机验证码’，获取验证码！")
                return request.render('auth_signup.signup',qcontext)
            else:

                current_time = datetime.datetime.now()
                valid_time = (current_time - datetime.datetime.strptime(code_create_time, '%Y-%m-%d %H:%M:%S')).seconds
                if valid_time >60:
                    qcontext["error"] = _(u"输入验证码超时或者错误，请重新获取验证码！")
                    return request.render('auth_signup.signup', qcontext)
                else:
                    #检查输入验证码的正确性
                    check_input_code = request.env['lyt.sms.history'].sudo().search([('user_name','=',login_name,)],order='id desc', limit=1).security_code
                    print check_input_code
                    if input_code != check_input_code:
                        qcontext["error"] = _(u"短信验证码输入错误，请重新输入！")
                        return request.render('auth_signup.signup', qcontext)
                    else:
                        #执行官方的用户名和密码验证
                        try:
                            self.do_signup(qcontext)
                            return super(AuthSignupHome, self).web_login(*args, **kw)
                        except (SignupError, AssertionError), e:
                            if request.env["res.users"].sudo().search([("login", "=", qcontext.get("login"))]):
                                qcontext["error"] = _("Another user is already registered using this email address.")
                            else:
                                _logger.error(e.message)
                                qcontext['error'] = _("Could not create a new account.")

        return request.render('auth_signup.signup', qcontext)