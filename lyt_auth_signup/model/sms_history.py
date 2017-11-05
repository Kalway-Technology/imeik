# -*- coding: utf-8 -*-
from odoo import fields, api, _, models
import datetime
import random


class res_partner(models.Model):
    _inherit = 'res.users'

    history_lines = fields.One2many('lyt.sms.history', 'set_history_line', string='短信历史记录')


class LytSmsHistory(models.Model):
    _name = 'lyt.sms.history'

    send_time = fields.Datetime(string="时间", default=fields.Datetime.now)
    security_code = fields.Char("验证码",)
    state = fields.Char("状态")
    user_name = fields.Char("用户名")
    mobile = fields.Char("手机号")
    set_history_line = fields.Many2one("res.users", string="历史记录")