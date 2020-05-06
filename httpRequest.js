

const querystring = require('querystring');
const http = require('https');
const fs = require('fs');
const url = require('url');

class Request {
    constructor() {
        this.headers = {};
        this.header('Content-Type' ,'application/x-www-form-urlencoded');
        // this.header('User-Agent' ,'PostmanRuntime/7.23.0');
        // this.header('Accept' ,'*/*');
        // this.header('Cache-Control' ,'no-cache');
        // this.header('Accept' ,'*/*');
        // this.header('Accept' ,'*/*');
        // this.header('Accept' ,'*/*');
        this.sended = false;
        this.dataReceived = '';
        this.body = null;
    }

    reset(){} 

    parseUrl(urlString){
        this.reset();
        this.host =  url.parse(urlString).hostname
        this.path =  url.parse(urlString).pathname + url.parse(urlString).search
     
    }


    get(url){
        this.reset();
        this.parseUrl(url);
        this.method = "GET";
        return this;
    }
    post(url){
        this.reset();
        this.parseUrl(url);
        this.method = "POST";
        return this;
    }
    put(url){
        this.reset();
        this.parseUrl(url);
        this.method = "PUT";
        return this;
    }

    header(headerName, headerVal){
        this.headers[headerName] = headerVal;
        
        return this;
    } 

    param(paramName, paramVal){
        if(this.body  == null) this.body = {};

        this.body[paramName] = paramVal;
        
        return this;
    }

    data(data){
        this.body  = data;
        
        return this;
    } 


    end(cb){
        setTimeout(() => {


            

            if(this.sended) throw "already ended"
            if(this.body){

                if(this.headers["Content-Type"] == "application/x-www-form-urlencoded"){
                    this.body = querystring.stringify(this.body);
                }else if ( this.headers["Content-Type"] ==  "application/json"){
                    this.body = JSON.stringify(this.body);
                }
            }
            // console.log(this.body)
            var post_options = {
                host: this.host,
            
                path: this.path,
                method: this.method,
                headers: { ... this.headers, 
                    'Content-Length': this.body ? Buffer.byteLength(this.body ) : 0
                }
            };
            let that = this;

            var post_req = http.request(post_options, function(res) {
                // if (res.statusCode < 200 || res.statusCode >= 300) {
                //     return cb({status : res.statusCode },null )
                // }

                res.setEncoding('utf8');
                res.on('data', function (chunk) {
                    that.dataReceived += chunk
                });
                res.on('error', (err) => {
                    that.log("error",err)
                    cb(err,null )
                })
                res.on('abort', (err) => {
                    that.log("abort",err)
                    cb(err,null )
                })
                res.on('end', () => {
                    try{
                        cb(null,JSON.parse(that.dataReceived) )
                        
                    }catch(e){
                        that.log(e.message)
                        cb(null,that.dataReceived )
                    }
                    // require("fs").writeFileSync("test.json", that.dataReceived)

                })
            }).on("error", (err) => {
                console.log("Error: " + err.message);
            });;



            // post the data
            if(this.body){
                post_req.write(this.body);
            }

            this.sended = true;

            post_req.end();
        },1000)
        return this;


    }

    log(msg) {
        console.log('[HTTPREQUEST]',msg);
    }

    debug() {
        
        this.log(this.host);
        this.log(this.path);
        this.log(this.method);
        this.log(this.headers);
        this.log(this.body);

        return this;

    }
}


module.exports.obj= Request;
module.exports.new = () => new Request();
// function request() {
     
 

//     // function PostCode(codestring) {
//     // // Build the post string from an object
//     // var post_data = querystring.stringify({
//     //     'compilation_level' : 'ADVANCED_OPTIMIZATIONS',
//     //     'output_format': 'json',
//     //     'output_info': 'compiled_code',
//     //         'warning_level' : 'QUIET',
//     //         'js_code' : codestring
//     // });

//     // // An object of options to indicate where to post to
//     // var post_options = {
//     //     host: 'closure-compiler.appspot.com',
//     //     port: '80',
//     //     path: '/compile',
//     //     method: 'POST',
//     //     headers: {
//     //         'Content-Type': 'application/x-www-form-urlencoded',
//     //         'Content-Length': Buffer.byteLength(post_data)
//     //     }
//     // };

//     // Set up the request
//     var post_req = http.request(post_options, function(res) {
//         res.setEncoding('utf8');
//         res.on('data', function (chunk) {
//             console.log('Response: ' + chunk);
//         });
//     });

//     // post the data
//     post_req.write(post_data);
//     post_req.end();

//     }

//     // This is an async file read
//     fs.readFile('LinkedList.js', 'utf-8', function (err, data) {
//     if (err) {
//         // If this were just a small part of the application, you would
//         // want to handle this differently, maybe throwing an exception
//         // for the caller to handle. Since the file is absolutely essential
//         // to the program's functionality, we're going to exit with a fatal
//         // error instead.
//         console.log("FATAL An error occurred trying to read in the file: " + err);
//         process.exit(-2);
//     }
//     // Make sure there's data before we post it
//     if(data) {
//         PostCode(data);
//     }
//     else {
//         console.log("No data to post");
//         process.exit(-1);
//     }
//     });
// }

 