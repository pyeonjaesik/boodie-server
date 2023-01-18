//52.79.242.96
module.exports = {
        server_port: 3000,
        db_url: 'mongodb://localhost:27017/190912',
        db_schemas: [
                {file:'./theater_schema', collection:'theater', schemaName:'TheaterSchema', modelName:'TheaterModel'},
                {file:'./detail_schema', collection:'detail', schemaName:'DetailSchema', modelName:'DetailModel'},
        ],
        route_info: [
                {file:'./getschedule',path:'/getschedule', method:'getschedule', type:'post'},
                {file:'./getoption',path:'/getoption', method:'getoption', type:'post'},
                {file:'./findtheater',path:'/findtheater', method:'findtheater', type:'post'},
                {file:'./getdetail',path:'/getdetail', method:'getdetail', type:'post'}
                
        ]
}