import {CGV,MEGA,LOTTE} from './theater';
export var getTheater= (lat,long,howmany)=>{
    var findTheater=[];
    CGV.map(em=>{
        var x = (lat-em.geo[0])*100000.0*0.884;
        var y = (long-em.geo[1])*100000.0*1.110;
        var distance = Math.sqrt((x*x)+(y*y));
        findTheater.push({
            name:em.name,
            type:'CGV',
            theaterCd:em.TheaterCode,
            RegionCode:em.RegionCode,
            distance
        })
    });
    MEGA.map(em=>{
        var x = (lat-em.geo[0])*100000.0*0.884;
        var y = (long-em.geo[1])*100000.0*1.110;
        var distance = Math.sqrt((x*x)+(y*y));
        findTheater.push({
            name:em.name,
            type:'MEGA',
            cinema:em.cinema,
            distance
        });
    });
    LOTTE.map(em=>{
        var x = (lat-em.geo[0])*100000.0*0.884;
        var y = (long-em.geo[1])*100000.0*1.110;
        var distance = Math.sqrt((x*x)+(y*y));
        findTheater.push({
            name:em.name,
            type:'LOTTE',
            divisionCode:em.divisionCode,
            detailDivisionCode:em.detailDivisionCode,
            cinemaID:em.cinemaID,
            distance
        });
    });
    findTheater.sort(function(a, b) { // 내림차순
        return a.distance - b.distance;
    });

    var output=findTheater.slice(0,howmany);
    var meganumber=0;
    for(var i=0;i<howmany;i++){
        if(findTheater[i].type==='MEGA'){
            meganumber++;
        }
    }
    if(meganumber===0){
        var find_leng=findTheater.length;
        for(var j=howmany;j<find_leng;j++){
            if(findTheater[j].type==='MEGA'){
                output.push({
                    ...findTheater[j]
                });
                break;
            }
        }
    }
    return output;
}
