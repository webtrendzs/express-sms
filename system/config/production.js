module.exports.config = function (params) {

    //defaults
    _.merge(params, {
        locale: 'en',
        port: 8188,
        logErrors:true,
        useHttps:false,
        disableCron:false,
        event_prices:[
            {price:300,price_key:'1-Day'}
        ],
        crons:[
            {
                cronName:'timeLog',
                active:false,
                options:{
                    cronTime:'0 */1 * * * *',
                    start: false,
                    timeZone: 'Africa/Nairobi'
                }

            }
        ],
        db:{
            url:'postgres://postgres:passadmin@127.0.0.1:5432/mticketing',
            name:'mticketing',
            password:'passadmin',
            host:'127.0.0.1',
            options:{
                timezone: '+03:00',
                dialect:'postgres',
                quoteIdentifiers: true,
                forceSync:false,
                syncOnAssociation: true,
                define: {
                    timestamps: false
                }
            }
        },
        max_file_size: 5 * 1024 * 1024,
        tmpFolder: '/tmp/',
        timeZone: 'Africa/Nairobi',
        secretStr: '1D2K3ss2f53f322k5d9E9F5K2K8D',
        salt: "IOz6`|q686iGim(!LN712d5Or6*s*KzBca,2).*bNW)-8@Nf]r^:93Kok8tR",
        redis: {
            port: 6379,
            host: '127.0.0.1',
            options: {
                no_ready_check: true,
                selected_db: 3
            }
        },
        pagination: {
            limit: 50,
            min: 5
        },
        download: {
            pdf: 5000,
            excel: 50000,
            csv: 100000
        },
        pdf: {

            "format": "Letter",        // allowed units: A3, A4, A5, Legal, Letter, Tabloid
            "orientation": "portrait", // portrait or landscape

            // Page options
            "border": "0",             // default is 0, units: mm, cm, in, px

            // File options
            "type": "pdf",             // allowed file types: png, jpeg, pdf
            "quality": "75"
        }
    });

    return params;
};