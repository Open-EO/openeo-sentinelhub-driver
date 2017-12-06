const http = require('http');
const wkt = require('wellknown');
const errors = require('restify-errors')

module.exports = function (server_storage) {
    var module = {};
    const jobs = require('./jobs')(server_storage);
    
    module.wcs = function (req, res, next) {
        const job_id = req.params.job_id;
        const cached_job = server_storage.get(jobs.createJobCacheKey(job_id));
        if (!cached_job) {
            return next(new errors.NotFoundError("job:" + job_id));
        }
        const job = new jobs.job_data(cached_job);
        const job_script = new Buffer(job.generateScript()).toString('base64');

        const reqUrl = "http://services.sentinel-hub.com/ogc/wms/ef60cfb1-53db-4766-9069-c5369c3161e6?"+
        "service=WMS&request=GetMap&version=1.1.1&layers=CUSTOM&styles=&format=image%2Fjpeg&height=512&width=512&srs=EPSG%3A4326"+
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