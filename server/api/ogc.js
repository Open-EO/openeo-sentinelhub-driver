const http = require('http');
const wkt = require('wellknown');

module.exports = function (server_storage) {
    var module = {};
    const jobs = require('./jobs')(server_storage);
    
    module.wcs = function (req, res, next) {
        const job_id = req.params.job_id;
        const job = new jobs.job_data(server_storage.get(jobs.createJobCacheKey(job_id)));
        const job_script = new Buffer(job.generateScript()).toString('base64');

        console.log("\n\n"+"Y29uc3QgZmluZE1pbkluZGV4ID0gYXJyID0%2BIHsKICBsZXQgbWluID0gSW5maW5pdHk7CiAgbGV0IG1pbklkeCA9IC0xOwogIGZvciAodmFyIGkgPSAwOyBpIDwgYXJyLmxlbmd0aDsgaSsrKSB7CiAgICBsZXQgY3VyID0gYXJyW2ldOwogICAgaWYgKGN1ciA8IG1pbikgewogICAgICBtaW4gPSBjdXI7CiAgICAgIG1pbklkeCA9IGk7CiAgICB9CiAgfQogIHJldHVybiBtaW5JZHg7Cn07CmNvbnN0IGZpbmRNaW4gPSBhcnI9PiBhcnJbZmluZE1pbkluZGV4KGFycildOwpjb25zdCBpbmRleCA9IChhLCBiKSA9PiAoYSAtIGIpIC8gKGEgKyBiKTsKY29uc3QgZGF0ZVJhbmdlRmlsdGVyID0gKGZyb20sIHRvKSA9PiB7CiAgICByZXR1cm4gKHNjZW5lID0%2BIGZyb20gPCBzY2VuZS5kYXRlLmdldFRpbWUoKSAmJiBzY2VuZS5kYXRlLmdldFRpbWUoKSA8IHRvKTsKfTsKZnVuY3Rpb24gc2V0dXAoZHNzKSB7CiAgc2V0SW5wdXRDb21wb25lbnRzKFtkc3MuQjA0LGRzcy5CMDhdKTsKICBzZXRPdXRwdXRDb21wb25lbnRDb3VudCgxKTsKfQoKZnVuY3Rpb24gZmlsdGVyU2NlbmVzKHNjZW5lcywgaW5wdXRNZXRhZGF0YSkgewogIHNjZW5lcyA9IHNjZW5lcy5maWx0ZXIoZGF0ZVJhbmdlRmlsdGVyKERhdGUucGFyc2UoJzIwMTctMDEtMDEnKSxEYXRlLnBhcnNlKCcyMDE3LTAxLTMxJykpKTsKICByZXR1cm4gc2NlbmVzOwp9CgpmdW5jdGlvbiBldmFsKHNhbXBsZXMsIHNjZW5lcykgewogIHNhbXBsZXMgPSBzYW1wbGVzLm1hcChzID0%2BIGluZGV4KHMuQjA4LCBzLkIwNCkpOwogIHNhbXBsZXMgPSBbZmluZE1pbihzYW1wbGVzKV07CgogIHJldHVybiBzYW1wbGVzOwp9");
        console.log("\n\n"+job_script);

        const reqUrl = "http://services.sentinel-hub.com/v1/wms/b7b5e3ef-5a40-4e2a-9fd3-75ca2b81cb32?"+
        "service=WMS&request=GetMap&version=1.1.1&layers=&styles=&format=image%2Fjpeg&height=512&width=512&srs=EPSG%3A4326"+
        "&bbox=15,47,17,49" +
        "&TEMPORAL=true"+
        "&time=2015-01-01%2F2017-01-31"+
        "&evalsource=S2"+
        "&PREVIEW=3"+
        ((job.geometry) ? ("&GEOMETRY="+wkt.stringify(job.geometry)) : "") +
        "&evalscript="+encodeURIComponent(job_script);

        console.log(reqUrl);

        http.get(reqUrl , serverResponse => {
                const responseHeaders = serverResponse.headers;
                responseHeaders["job_id"] = job_id;
                responseHeaders["job_script"] = JSON.stringify(job_script);
                res.writeHeader(serverResponse.statusCode, responseHeaders);
                serverResponse.pipe(res);
            });
        return next();
    };

    return module;
}