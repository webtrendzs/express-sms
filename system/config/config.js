module.exports = (function(){
	switch(process.env.NODE_ENV) {
		case 'development':
		case 'production':
        default:
            var settings = {
        		name: 'Q-SMS Service',
                port: 8185,
                max_file_size: 5 * 1024 * 1024,
                secretStr : '1D2K3ss2f53f322k5d9E9F5K2K8D',
                salt : "IOz6`|q686iGim(!LN712d5Or6*s*KzBca,2).*bNW)-8@Nf]r^:93Kok8tR",
                redis: {
                	port: 6379,
                	host: '127.0.0.1',
					//auth_pass:'lIqERCHVasaFw3VJamov0EEBghW7fotgqsVMB_movas'
                },
                pagination: {
                	limit: 100,
                	min: 5
                },
                acl_index:function(type){

                    if(type=='asArray'){
                        return [
                            {index: 10, name: 'Super Admin'},
                            {index: 9, name: 'Admin/Manager'},
                            {index: 8, name: 'User'}
                        ]
                    } else {
                        return {
                            '10': 'Super Admin',
                            '9': 'Admin/Manager',
                            '8': 'User'
                        }
                    }

                },
                download: {
                	pdf: 5000,
                	excel: 50000,
                	csv: 100000
                }
        	};
        return settings;
	}
})();
