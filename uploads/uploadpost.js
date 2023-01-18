var multer = require('multer');
var multerS3 = require('multer-s3');
var aws = require('aws-sdk');
var s3 = new aws.S3({});

var uploadtest = multer({
  storage: multerS3({
    s3: s3,
    bucket: 'dart190722',
    acl: 'public-read',  
    metadata: function (req, file, cb) {
        console.log('uploadpost metadata');
        cb(null, {fieldName: file.fieldname});
      
    },
    key: function (req, file, cb) {
        console.log('uploadpost key');
        cb(null, Date.now().toString())
    }
  })
});

var uploadpost = function(app){
  // 72: created_time 의 *10 제거 , 133-139 주석처리 제거
  app.post('/uploadpost', uploadtest.array('file',30), function(req, res, next) {
    var files=[];
    req.files.forEach((elm)=>{
      files.push({uri:elm.location,type:elm.mimetype});
    });
    console.log(files);
    var crypto = require('crypto');
    var _id = req.body._id||'';
    var id = req.body.id || '';
    var text = req.body.text || '';
    var PW = req.body.pw||0;
    var coin=req.body.coin||0;
    var imagemode=req.body.imagemode||'1';
    var kit=req.body.user_id||'1';
    console.log(coin);
    coin=parseInt(coin);
    console.log(`_id:${_id}
    id: ${id}
    text:${text}
    PW:${PW}
    coin:${coin}`);
    console.log('imagemode:'+imagemode);
    var created_time = parseInt(Date.now());
    var output = {}; 
    var database = req.app.get('database');
    if(coin<1){
      console.log('coin<1');
      output.status=500;
      res.send(output);
      return;    
    }
    console.log('_id'+_id);
    if(database){
      database.UserModel.find({_id:_id},async function(err,results){
        if(err){
          console.log('verifypw: err');
          output.status=401;
          res.send(output);
          return;
        }
        if(results.length>0){
          if(results[0]._doc.pwindex>=10){
            output.status=600;
            res.send(output);
            return;
          }
          var salt = results[0]._doc.salt;
          var encryptPW=await crypto.createHmac('sha256', salt).update(PW).digest('hex');
          if(encryptPW===results[0]._doc.pw){
            database.CoinModel.find({_id:_id},function(err,results){
              if(err){
                console.log('CoinModel.find err');
                output.status=402;
                res.send(output);
                return;    
              }
              if(results.length>0){
                var coin_amount=results[0]._doc.coin;    
                if(coin_amount<coin){
                  console.log('results[0]._doc.coin<coin :'+results[0]._doc.coin+'/'+coin);
                  output.status=900;
                  res.send(output);
                  return;  
                }   
                var post = new database.PostModel({"userid":id,"user_id":_id,"text":text,"created_time":created_time,'coin':0,clip:files,im:imagemode,idx:99,kit});
                post.save(function(err,results){
                  if(err){
                    console.log('uploadpost err 74');
                    output.status = 4;
                    res.send(output);
                    return;
                  }
                  if(results){
                    var post_id_temp=results._doc._id;
                    database.CoinModel.find({_id:_id},function(err,results){
                      if(err){
                        console.log('CoinModel.find err');
                        output.status=405;
                        res.send(output);
                        return;    
                      }
                      var coin_amount=results[0]._doc.coin;  
                      if(coin_amount<coin){
                        console.log('results[0]._doc.coin<coin :'+results[0]._doc.coin+'/'+coin);
                        output.status=900;
                        res.send(output);
                        return;  
                      }
                      var charr=results[0]._doc.charr.map((x)=>x);
                      var safetycheck=charr.filter((item, index) => charr.indexOf(item) !== index);
                      if(safetycheck.length>0){
                        console.log('safetycheck failed');
                        output.status=997;
                        res.send(output);
                        return;
                      }
                      var pp=results[0]._doc.p.map((x)=>x);
                      var ss=results[0]._doc.s.map((x)=>x);
                      var tt=results[0]._doc.t.map((x)=>x);
                      var gg=results[0]._doc.g.map((x)=>x);
                      var ee=results[0]._doc.e.map((x)=>x);
                      ee.unshift({post_id:post_id_temp.toString(),coin:coin,ct:parseInt(Date.now())}); 
                      function removeDuplicates(originalArray, prop) {
                        var newArray = [];
                        var lookupObject  = {};
                        for(var i in originalArray) {
                          lookupObject[originalArray[i][prop]] = originalArray[i];
                        }
                        for(i in lookupObject) {
                          newArray.push(lookupObject[i]);
                        }
                        return newArray;
                      }
                      var ppl=pp.length;
                      var ssl=ss.length;
                      var ttl=tt.length;
                      var ggl=gg.length;
                      var eel=ee.length;
                      ee = removeDuplicates(ee, "post_id");
                      pp = removeDuplicates(pp, "mct_id");
                      ss = removeDuplicates(ss,'ct');
                      tt = removeDuplicates(tt,'post_id');
                      gg = removeDuplicates(gg,'post_id');
                      if(eel!==ee.length){
                        console.log('safety check ee failed');
                        output.status=900;
                        res.send(output);
                        return;
                      }
                      if(ppl!==pp.length){
                        console.log('safety check pp failed');
                        output.status=901;
                        res.send(output);
                        return;
                      }
                      if(ssl!==ss.length){
                        console.log('safety check ss failed');
                        output.status=902;
                        res.send(output);
                        return;
                      }
                      if(ttl!==tt.length){
                        console.log('safety check tt failed');
                        output.status=901;
                        res.send(output);
                        return;
                      }
                      if(ggl!==gg.length){
                        console.log('safety check gg failed');
                        output.status=901;
                        res.send(output);
                        return;
                      }
                      var coin_price=0;  
                      for(var i=0;i<ppl;i++){
                        coin_price+=pp[i].coin;    
                      }
                      for(var i=0;i<ssl;i++){
                        coin_price-=ss[i].coin;    
                      }
                      for(var i=0;i<ttl;i++){
                        coin_price+=tt[i].coin;    
                      }
                      for(var i=0;i<ggl;i++){
                        coin_price+=gg[i].coin;    
                      }
                      for(var i=0;i<eel;i++){
                        coin_price-=ee[i].coin;    
                      }                              
                      if(coin_price!=(coin_amount-coin)){
                        console.log('11coin_price!=coin_amount :'+coin_price+'/'+coin_amount+'/'+coin);
                        output.status=901;
                        res.send(output);
                        return;  
                      }
                      var final_coin=coin_amount-coin;
                      //
                      //
                      database.CoinModel.find({ charr: { $in: charr }},(err,results)=>{
                        if(err){
                          console.log('mscp: CoinModel safety check err');
                          output.status=601;
                          res.send(output);
                          return;
                        }
                        console.dir(results);
                        if(results.length>1){
                          console.log('safetycheckfailed 999');
                          output.status=999;
                          res.send(output);
                          return;
                        }
                        if(results.length===0){
                          console.log('safetycheck err 998');
                          output.status=998;
                          res.send(output);
                          return;
                        }
                        if(_id.toString()!==results[0]._doc._id.toString()){
                          console.log('safetycheck err 996');
                          output.status=996;
                          res.send(output);
                          return;
                        }
                        database.CoinModel.update({_id},{coin:final_coin,e:ee},function(err){
                          if(err){
                            console.log('CoinModel.update err2');
                            output.status=406;
                            res.send(output);
                            return;  
                          }
                          database.PostModel.update({_id:post_id_temp},{coin:coin,idx:0},function(err){
                            if(err){
                              console.log('PostModel.update err');
                              output.status=407;
                              res.send(output);
                                // 이 경우 내 장부로 반드시 데이터 전송
                              return;    
                            }
                            console.log('my post success');
                            output.status=100;
                            output.coin=final_coin;
                            res.send(output);  
                          });    
                        });
                      }).limit(10);
                    });    
                  }else{
                    output.status=403;
                    res.send(output);    
                  }
                });                  
              }else{
                console.log('CoinModel.find results.length==0 -->err');
                output.status=403;
                res.send(output);    
              }  
            });
          }else{
            output.status=403;
            res.send(output);
            console.log('upload post verifying failed');
          }
        }else{
          console.log('upload post verifying failed: results.length==0 --> err');
          output.status=402;
          res.send(output);
        }
      });
    }else{
      console.log('uploadpost no database');
      output.status=410;
      res.send(output);
    } 
  });
}

 module.exports = uploadpost;