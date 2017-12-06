# openeo-sentinelhub-driver


## Testing

Create a job by posting:
```HTTP
POST /jobs HTTP/1.1
Host: localhost:8080
Content-Type: application/json

{
	"process_graph": {
    	"process_id": "min_time",
    	"args": {
    		"imagery" : {
        		"process_id": "NDI",
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
			        "band1": "B08",
        			"band2": "B04"
        		}
            }
        }
	}
}
```

Then retrieve an image through the OGC interface (it's called WCS, but it's actually a WMS at the moment):
```HTTP
GET /download/8b055750-da63-11e7-a7b4-717018423482/wcs?service=WMS&amp;request=GetMap HTTP/1.1
Host: localhost:8080
```