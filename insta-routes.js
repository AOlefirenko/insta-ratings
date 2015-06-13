var express = require('express');
var router = express.Router();
var request = require('request');
var Rx = require('rx');

router.all('*', function (req, res, next) {
    var header = req.get('Authorization');
    var exists = header.indexOf('Bearer') == 0;
    console.log(header.indexOf('Bearer'));
    if (exists) {
        req.token = header.substr(7);
    }
    next();
});

router.get('/popular', function (req, res) {
    var url = "https://api.instagram.com/v1/media/popular";
    console.time('get popular users');
    Rx.Observable.
        repeat(tokenizeUrl(url, req.token), 3).
        concatMap(doRequest).
        flatMap(normalizeResponse).
        map(function (item) {
            return item.user;
        }).
        distinct(function (x) {
            return x.id;
        }).
        toArray().
        subscribe(function (data) {
            res.send(data);
            console.timeEnd('get popular users');
        });
});
router.get('/stat', function (req, res) {
    var url = 'https://api.instagram.com/v1/users/self/media/recent';
    var urlWithToken = tokenizeUrl(url, req.token) + '&count=30';


    function fetchPartial(url) {
        return doRequest(url)
            .map(function (x) {
                return JSON.parse(x[1]);
            });
    }

    var source = fetchPartial(urlWithToken).expand(function (x) {
        return fetchPartial(x.pagination.next_url);
    }).takeWhile(function (x) {
        return x.pagination && x.pagination.next_url;
    });


    var medias = source.
        flatMap(function (x) {
            return x.data;
        });
    var published = medias.publish();
    var averageLikes = published.average(function (x) {
        return x.likes.count;
    })
    var averageComents = published.average(function (x) {
        return x.comments.count;
    });
    var accumulator = {
        topByLikes: [],
        topByComments: []
    };

    var topMedia = published.
        map(function (x) {
            return {
                commentsCount: x.comments.count,
                likesCount:x.likes.count,
                pic:x.standard_resolution && x.standard_resolution.url
            }
        });
        //.startWith(accumulator).
        //scan(function (acc, x) {
        //
        //})
    published.connect();

    Rx.Observable.zip(
        averageLikes,
        averageComents,
        topMedia.toArray(),
        function (likes, comments,topMedia) {
            return {likesAvg: likes, commentsAvg: comments,topMedia:topMedia};
        }).subscribe(function (x) {
            res.send(x);
        });

    //subscription.toArray()
});

router.get('/locations', function (req, res) {
    var url = 'https://api.instagram.com/v1/users/self/media/recent';
    var urlWithToken = tokenizeUrl(url, req.token);

    var request = doRequest(urlWithToken);
    request.
        flatMap(normalizeResponse).
        map(function (item) {
            return item.location;
        }).
        filter(function (item) {
            return !!item;
        }).
        take(10).
        toArray().
        subscribe(function (data) {
            res.send(data);
        })
});

module.exports = router;

function tokenizeUrl(url, token) {
    return url + "?access_token=" + token;
}
function doRequest(url) {
    return Rx.Observable.fromNodeCallback(request.get)(url);
}

function normalizeResponse(data) {
    return Rx.Observable.fromArray(JSON.parse(data[1]).data);
}