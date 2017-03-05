module.exports =(function () {

    var get_tree = function () {

        return tree || {};
    };

    var space = Config.get('space');

    var tree =[
        {
            name: 'Reports',
            has_items: true,
            items:[
                {
                    name: 'SMS Outbox',
                    permissions: {
                        view: 'view_outbox_logs'
                    },
                    url: '/'+space+'/report/sms-outbox'
                },
                {
                    name: 'Daily Outbox Summary',
                    permissions: {
                        view: 'view_outbox_logs'
                    },
                    url: '/'+space+'/report/summary-outgoing-day'
                },
                {
                    name: 'Monthly Outbox Summary',
                    permissions: {
                        view: 'view_outbox_logs'
                    },
                    url: '/'+space+'/report/summary-outgoing-month'
                },
                {
                    name: 'SMS Inbox',
                    url: '/'+space+'/report/sms-inbox',
                    permissions: {
                        view: 'view_inbox_logs'
                    }
                },
                {
                    name: 'Daily Inbox Summary',
                    url: '/'+space+'/report/summary-incoming-day',
                    permissions: {
                        view: 'view_inbox_logs'
                    }
                },
                {
                    name: 'Monthly Inbox Summary',
                    url: '/'+space+'/report/summary-incoming-month',
                    permissions: {
                        view: 'view_inbox_logs'
                    }
                }
            ]
        },
        {
            name: 'SMS Notifications',
            has_items: true,
            items: [
                {
                    name: 'Manage Groups',
                    url: '/'+space+'/notification/groups',
                    permissions: {
                        view: 'view_notification_groups'
                    }
                },
                {
                    name: 'Notifications',
                    url: '/'+space+'/notification/approve',
                    permissions: {
                        view: 'view_notifications'
                    }
                }
            ]
        },
        {
            name: 'System A/c Management',
            has_items: true,
            permissions: {
                view: 'view_system ac_management_panel'
            },
            items: [
                {
                    name: 'Change A/c Password',
                    url: '/change-password'
                },
                {
                    name: 'System User Accounts',
                    url: '/'+space+'/users',
                    permissions: {
                        view: 'view_system_users',
                        create: 'add_system_users',
                        edit: 'edit_system_users'
                    }
                },
                {
                    name: 'System User Groups',
                    url: '/'+space+'/groups',
                    permissions: {
                        view: 'view_user_groups',
                        create: 'add_user_groups',
                        edit: 'edit_user_groups'
                    }
                },
                {
                    name: 'System User Profiles',
                    url: '/'+space+'/profiles',
                    permissions: {
                        view: 'view_user_profiles',
                        create: 'add_user_profiles',
                        edit: 'edit_user_profiles'
                    }
                }
            ]
        }
    ];

    return {

        get_item_name: function (url) {

            return this.tree().filter('name', url);
        },
        get_item_permissions: function (url) {

            return this.tree().filter('permissions', url);
        },
        menu: function () {
            return get_tree();
        },
        tree: function () {

            var tree = this.menu();

            return {
                filter: function (by, url) {

                    for (var i = 0; i < tree.length; i++) {
                        var row = tree[i];

                        if (row.has_items) {

                            for (var x = 0; x < row.items.length; x++) {
                                var item = row.items[x];

                                if (item.url && item.url === url)
                                    return item[by];
                            }

                        } else {
                            if (by === 'name' && row.url && row.url === url)
                                return row.name;
                            if (by === 'permissions' && row.permissions)
                                return row.permissions;
                            return null;
                        }
                    }
                }
            }
        }

    }

})();
