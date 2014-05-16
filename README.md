ironalloy
=========

Flatiron + Redis


Caching
=======

req
 |_ ETag (get from Redis)
     |_ res 304

req
 |_ ETag old (get from Redis)
     |_ negotiate
         |_ get HTML cache
             |_ HTML cache
                 |_ rubberStamp
                     |_ res 200

req
 |_ ETag old (get from Redis)
     |_ negotiate
         |_ get HTML cache
             |_ HTML cache
                 |_ rubberStamp
                     |_ res 200

req
 |_ ETag old (get from Redis)
     |_ negotiate
         |_ get GZIP cache
             |_ GZIP cache
                 |_ rubberStamp
                     |_ res 200

req
 |_ ETag old (get from Redis)
     |_ negotiate
         |_ get HTML cache
             |_ no HTML cache
                 |_ renderView
                     |_ rubberStamp
                         |_ res 200
                             |_ set ETag Cache
                             |_ set HTML Cache
                             |_ set GZIP Cache
req
 |_ ETag old (get from Redis)
     |_ negotiate
         |_ get GZIP cache
             |_ no GZIP cache
                 |_ get HTML cache
                     |_ no HTML cache
                         |_ renderView
                             |_ rubberStamp
                                 |_ res 200
                                     |_ set ETag Cache
                                     |_ set HTML Cache
                                     |_ set GZIP Cache

req
 |_ no ETag in Redis
     |_ negotiate
         |_ renderView
             |_ rubberStamp
                 |_ res 200
                     |_ set ETag Cache
                     |_ set HTML Cache
                     |_ set GZIP Cache
