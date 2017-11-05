# -*- coding: utf-8 -*-

{
    'name': '短信验证',
    'version': '1.0',
    'author': 'Kalway',
    'description': """
短信验证登录模块（腾讯云）
==============================================================
修改登录和注册界面。

    """,
    'website': 'https://kalway.cn',
    'depends': ['web','auth_signup','base'],
    'category': 'Website',
    'sequence': 10,
    'data': [
        'security/ir.model.access.csv',
        
        'views/register_view.xml',
        'views/login_view.xml',
        'views/sms_history_view.xml',
        'views/sms_account_views.xml',
    ],

    'installable': True,
    'application': True,
    'auto_install': False,

}