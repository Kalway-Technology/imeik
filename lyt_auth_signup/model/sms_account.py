# -*- coding: utf-8 -*-
from odoo import fields, api, models



class SmsAccount(models.Model):
    _name = 'sms.account'

    name = fields.Char("名称", default="腾讯云")
    appid = fields.Char("AppID")
    appkey = fields.Char("AppKey")
    templateId = fields.Char("模板ID")
    send_type = fields.Selection([('reg' ,'注册')], string="类型", default="reg")

