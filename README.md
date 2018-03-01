# openeo-sentinelhub-driver


## Testing

Host: `localhost:8080`

Create a job by posting:
```POST /jobs HTTP/1.1
Content-Type: application/json

{
	"process_graph": {
    	"process_id": "min_time",
    	"args": {
    		"imagery" : {
        		"process_id": "NDVI",
        		"args": {
        			"imagery": {
            			"process_id": "filter_daterange",
            			"args": {
            				"imagery": {
                				"process_id": "filter_bbox",
                				"args": {
                					"imagery": {
                						"product_id":"Sentinel2A-L1C"
                					},
                					"left": 16.1,
                					"right":16.6,
                					"top": 48.6,
                					"bottom" : 47.9,
                					"srs": "EPSG:4326"
                				}
            				},
            				"from": "2017-01-01",
            				"to": "2017-01-31"
            			}
        			},
			        "red": "B04",
        			"nir": "B08"
        		}
            }
        }
	}
}
```

Afterwards create a service:
```
POST /services HTTP/1.1
Content-Type: application/json; charset=utf-8

{
  "job_id":"<job_id>",
  "type":"wms",
  "args":{}
}
```

Then retrieve an image through the OGC WMS interface:
```GET /wms/<service_id>?service=WMS&amp;request=GetMap HTTP/1.1
```