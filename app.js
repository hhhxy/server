var port = 3333;
var url = require('url');
var http = require('http');
var fs = require('fs');
var path = require("path");
var mine = require("./mime").types;
var config = require("./confige");

var server = http.createServer(function(request,response){
	var pathname = url.parse(request.url).pathname;//转换格式
	// console.log(pathname);
	var realPath = "assets"+pathname;//assets目录下
	// console.log(realPath);
	var ext = path.extname(realPath);
	ext = ext ? ext.slice(1):'unknown';
	var contentType = mine[ext]||"text/plain";
	
	fs.exists(realPath, function (exists) {
		if(!exists){
			response.writeHead(404,{'Content-Type':'text/plain'});
			response.write("this request URL "+realPath+" is not found");
			response.end();
		}
		else{
			response.setHeader("Content-Type", contentType);
			fs.stat(realPath, function (err, stat) {
            var lastModified = stat.mtime.toUTCString();//转换为世界时间
            var ifModifiedSince = "If-Modified-Since".toLowerCase();
            response.setHeader("Last-Modified", lastModified);
            if(ext.match(config.Expires.fileMatch)){
				var expires = new Date();
				expires.setTime(expires.getTime() + config.Expires.maxAge*1000);
				response.setHeader("Expires",expires.toUTCString());
				response.setHeader("Cache-Control","max-age="+config.Expires.maxAge);
			}
			if (request.headers[ifModifiedSince] && lastModified == request.headers[ifModifiedSince]) {
                response.writeHead(304, "Not Modified");
                response.end();
            } else {
				fs.readFile(realPath,"binary",function(err,file){
					if(err){
						console.log(1);
						response.writeHead(500,{'Content-Type':contentType});
						response.end(err);
					}
					else{
						response.writeHead(200,{'Content-Type':contentType});
						response.write(file,"binary");
						response.end();
					}
				});
			}
		});
	}
});
});
server.listen(port);
console.log("Server running at port:"+port+".");