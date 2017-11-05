# -*- coding: utf-8 -*-
# Part of Odoo. See LICENSE file for full copyright and licensing details.
import logging
import xmltodict
import requests
import json
import random
import datetime

import odoo

import logging


from odoo.tools.translate import _

from odoo import http
from odoo.http import request, serialize_exception as _serialize_exception

from odoo.addons.web.controllers.main import ensure_db


from ..tools import sms as SmsSender

_logger = logging.getLogger(__name__)


class Testtest(http.Controller):

    @http.route([
        '/send_sms'
    ], type='json', auth='public', website=True)
    def send_sms(self, user_name=None,**kw):
        check_users = request.env['res.users'].sudo().search([('login', '=', user_name,)])

        if len(check_users):

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
                res_user_obj = request.env['res.users'].sudo().search([('login', '=', user_name,)]).history_lines
                res_user_id = request.env['res.users'].sudo().search([('login', '=', user_name,)]).id

                res_user_obj.sudo().create({
                    'set_history_line': res_user_id,
                    'user_name': user_name,
                    'security_code': verifyCode,
                    'mobile': mobile,
                    'state': 'ok'
                })

                return {'send': 'ok',
                        'phone':mobile[-4:]}
            else:
                return False
        else:

            return False




# class NewHome(odoo.addons.web.controllers.main.Home):
#     @http.route('/web/login', type='http', auth="none")
#     def web_login(self, redirect=None, **kw):
#         ensure_db()
#         request.params['login_success'] = False
#         if request.httprequest.method == 'GET' and redirect and request.session.uid:
#             return http.redirect_with_hash(redirect)
#
#         if not request.uid:
#             request.uid = odoo.SUPERUSER_ID
#
#         values = request.params.copy()
#         try:
#             values['databases'] = http.db_list()
#         except odoo.exceptions.AccessDenied:
#             values['databases'] = None
#
#         if request.httprequest.method == 'POST':
#             # 取前台输入验证码和用户名
#             text_code = request.params['codename']
#             login_name = request.params['login']
#
#
#             #输入超时60秒验证
#             code_create_time = request.env['lyt.sms.history'].sudo().search(
#                 [('user_name', '=', login_name)], order='id desc', limit=1
#             ).send_time
#             if code_create_time ==False:
#                 values['error'] = _(u"您输入的登录名错误，请重新输入或者注册后登录！")
#                 return request.render('web.login', values)
#             else:
#
#                 current_time = datetime.datetime.now()
#                 valid_time = (current_time - datetime.datetime.strptime(code_create_time, '%Y-%m-%d %H:%M:%S')).seconds
#
#                 if valid_time > 60:
#                     values['error'] = _(u"输入验证码超时或者错误，请重新获取验证码！")
#                     return request.render('web.login', values)
#                 else:
#
#
#                     #查找后台当前输入的用户名最后一条短信发送记录里的验证码
#                     check_code= request.env['lyt.sms.history'].sudo().search([('user_name','=',login_name,)],order='id desc', limit=1).security_code
#                     print check_code
#                     #检查输入验证码是否正确
#                     if text_code != check_code:
#                         values['error'] = _(u"短信验证码输入错误，请重新输入！")
#                         return request.render('web.login', values)
#                     else:
#                         old_uid = request.uid
#                         uid = request.session.authenticate(request.session.db, request.params['login'], request.params['password'])
#                         if uid is not False:
#                             request.params['login_success'] = True
#                             if not redirect:
#                                 redirect = '/web'
#                             return http.redirect_with_hash(redirect)
#                         request.uid = old_uid
#                         values['error'] = _(u"密码输入错误")
#         return request.render('web.login', values)



