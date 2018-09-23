const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const passport = require('passport');
const expressSession = require('express-session');
const SteamStrategy = require('passport-steam').Strategy;
const ioCookieParser = require('socket.io-cookie-parser');
const sharedsession = require('express-socket.io-session');
const SQLiteStore = require('connect-sqlite3')(expressSession);
const request = require('request');
const sqlite3 = require('sqlite3').verbose();
const config = require('./config');
var finalLiveArray = [];
var liveItemQueue = []
var messageArray =[];
var socketCount = 10;
var totalUsers;
var casesOpened;
var totalUnboxValue;
var completeTopUnbox = [];
var topUnboxArray = [];
var case1obj = {};
var case2obj = {};
var case3obj = {};
var case4obj = {};
const db = new sqlite3.Database('VGOUpgradeDB');
const app = express();
const server = http.createServer(app);
const io = socketio(server);

getLiveItems();
usersRegistered();
totalCasesOpened();
unboxValue();
loadChat();
getTopItems();

db.serialize(function(){
    db.run("CREATE TABLE IF NOT EXISTS unbox (id INTEGER PRIMARY KEY AUTOINCREMENT, steamId TEXT, levelXP INT)");
    db.run("CREATE TABLE IF NOT EXISTS cases (id INTEGER PRIMARY KEY AUTOINCREMENT, steamId TEXT, caseOfferId INT, itemName TEXT, itemSKU INT, itemPrice INT)");
    db.run("CREATE TABLE IF NOT EXISTS messages (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, avatar TEXT, message TEXT, level INT, admin TEXT)");
});

function usersRegistered() {
    db.all('SELECT id FROM unbox', function(error, row) {
        if (error) {
            console.log(error);
            throw (error);
        }
        if (row) {
            totalUsers = row.length;
            console.log(totalUsers);
        }
    })
}

function totalCasesOpened() {
    db.all('SELECT id FROM cases', function(error, row) {
        if (error) {
            console.log(error);
            throw (error);
        }
        if (row) {
            casesOpened = row.length;
        }
    })
}

function unboxValue() {
    db.all('SELECT itemPrice FROM cases', function(error, row) {
        if (error) {
            console.log(error);
            throw (error);
        }
        if (row) {
            var totalValue = 0;
            var counter = 0;
            for (i = 0; i < row.length; i++) {
                totalValue = totalValue + row[i].itemPrice;
                counter = counter + 1;

                if (row.length == counter) {
                    totalUnboxValue = totalValue;
                }
            }
        }
    })
}

function insertNewUser(steamid) {
    db.get("SELECT steamId FROM unbox WHERE steamId = ?", steamid, function(error, row) {
        if (error) {
            console.log(error);
            setTimeout(function(){
                insertNewUser(steamid);
            }, 5000);
        }
        if (row == undefined) {
            console.log("pushing new steamid to db");
            console.log(steamid);
            var statement1 = db.prepare("INSERT INTO unbox VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
            statement1.run(null, steamid, "0", "0", null, null, null, null, null);
            statement1.finalize();
            totalUsers = totalUsers + 1;
            io.sockets.emit('sendTotalUsers', totalUsers);
        }
    })
}

function loadChat() {
    db.all('SELECT * FROM messages ORDER BY id DESC LIMIT 30', function(error, row) {
        if (error) {
            console.log(error);
            throw (error);
        } 
        if (row) {
            var row = row.reverse();
            for (i = 0; i < row.length; i++) {
                messageArray.push(row[i]);
            }
        }
    })
}

function pushNewLiveItem(socket, itemObj) {
    var vgoArray = [];
    var counter = 0;

    for (i = 0; i < itemObj.cases.length; i++) {
        var curItem = itemObj.cases[i];

        vgoArray.push({
            id: curItem.item.id,
            name: curItem.item.name,
            avatar: itemObj.offer.recipient.avatar,
            userName: itemObj.offer.recipient.display_name,
            image: curItem.item.image["300px"],
            color: curItem.item.color,
            price: curItem.item.suggested_price/100,
        });

        finalLiveArray.unshift(vgoObject);
        finalLiveArray.pop();
        counter = counter + 1;
    }

}

function getLiveItems() {
    db.serialize(function() {
        db.all("SELECT caseOfferId FROM cases ORDER BY id DESC LIMIT 16", function(error, row) {
            if (row) {
                var itemArray = [];
                var counter = 0;
                var uniqueArray = removeDups(itemArray);
                for (i = 0; i < row.length; i++) {
                    itemArray.push(row[i].caseOfferId);
                    counter = counter + 1;
                    if (counter == row.length) {
                        var uniqueArray = removeDups(itemArray);
                        var vgoObjArray = [];
                        var arrayCounter = 0;
                        console.log(uniqueArray);
                        for (x = 0; x < uniqueArray.length; x++) {
                            var curOffer = uniqueArray[x];
                            console.log(curOffer);
                            request('https://api-trade.opskins.com/ICaseSite/GetTradeStatus/v1?key=' + config.vgoKey + '&offer_id=' + curOffer, function(error, response, body) {
                                if (body) {
                                    if (response.statusCode == 200) {
                                        body = JSON.parse(body);
                                        for (j = 0; j < body.response.cases.length; j++) {
                                            console.log(body.response.cases[j].case_site_trade_offer_id);
                                            var curItem = body.response.cases[j];
            
                                            vgoObjArray.push({
                                                id: curItem.item.id,
                                                name: curItem.item.name,
                                                userName: body.response.offer.recipient.display_name,
                                                avatar: body.response.offer.recipient.avatar,
                                                color: curItem.item.color,
                                                image: curItem.item.image["300px"],
                                                price: curItem.item.suggested_price/100,
                                            });
                                        }
                                        arrayCounter = arrayCounter + 1;
                                        if (arrayCounter == uniqueArray.length) {
                                            vgoObjArray = vgoObjArray.sort(function(a, b) {
                                                return a.id - b.id;
                                            });
                                            vgoObjArray = vgoObjArray.slice(vgoObjArray.length-16, vgoObjArray.length)
                                            console.log(vgoObjArray.length);
                                            vgoObjArray.forEach(function(value, index) {
                                                console.log("name: " + vgoObjArray[index].name + " <> offerId: " + vgoObjArray[index].id);
                                            })
                                            vgoObjArray.reverse();
                                            finalLiveArray = vgoObjArray;
                                        }
                                    } else {
                                        setTimeout(function() {
                                            getLiveItems();
                                        }, 5000);
                                    }
                                }
                            })
                            
                        }
                    }
                }
            }
        })
    })
}

function removeDups(itemArray) {
  let unique = {};
  itemArray.forEach(function(i) {
    if(!unique[i]) {
      unique[i] = true;
    }
  });
  return Object.keys(unique);
}

function addNewCaseToDB(caseObj, steamid) {
    db.serialize(function() {
        console.log("Started Inserting New Unbox Data to DB", steamid);
        console.log(caseObj.cases.length);
        console.log(caseObj);
        for (var i = 0; i < caseObj.cases.length; i ++) {
            console.log("pushing item");
            var statement1 = db.prepare("INSERT INTO cases VALUES (?, ?, ?, ?, ?, ?)");
            statement1.run(null, steamid, Number(caseObj.offer.id), caseObj.cases[i].item.name, Number(caseObj.cases[i].item.sku), Number(caseObj.cases[i].item.suggested_price/100));
            statement1.finalize();
        }
    });
}

function getTopItems() {
    db.serialize(function() {
        db.all("SELECT * FROM (SELECT * FROM cases ORDER BY itemPrice DESC LIMIT 16) ORDER BY itemPrice ASC;", async function(error, rows) {
            var topArray = [];

            rows.forEach(function(row) {
                topUnboxArray.push(row.caseOfferId);
            });

            for (var j = 0; j < topUnboxArray.length; j++) {
                const body = await promiseRequest('https://api-trade.opskins.com/ICaseSite/GetTradeStatus/v1?key=' + config.vgoKey + "&offer_id=" + topUnboxArray[j]);

                body.response.cases.forEach(function (caseObject) {
                    topArray.push({
                        name: caseObject.item.name,
                        id: caseObject.item.id,
                        price: caseObject.item.suggested_price,
                        color: caseObject.item.color,
                        image: caseObject.item.image["300px"],
                        steamName: body.response.offer.recipient.display_name,
                        steamAvatar: body.response.offer.recipient.avatar,
                    });
                });
            }

            completeTopUnbox = topArray.sort(({ price: a }, { price: b }) => b - a).slice(0, 16);
            console.log("TOP ITEMS");
            console.log(completeTopUnbox);
        })
    })
}

function promiseRequest(url) {
    return new Promise((resolve, reject) => {
        request(url, function(error, response, body) {
            if (error) {
                resolve([]);
                return;
            }
            resolve(JSON.parse(body));
        });
    });
}

function getUnboxedCasesFromUser(steamid, callback) {
    db.serialize(function() {
        db.all("SELECT caseOfferId FROM cases WHERE steamId = ?", steamid, function(error, row) {
            if (error) {
                console.log(error)
                return;
            }
            var curArray = [];
            var checkedRows = 0;
            for (i = 0; i < row.length; i++) {
                curArray.push(row[i].caseOfferId);
                checkedRows = checkedRows + 1;
            }
            if (checkedRows == row.length) {
                var uniqueArray = removeDups(curArray);
                var finalAccountItemObj = [];
                var counterOfItems = 0;
                for (i = 0; i < uniqueArray.length; i++) {
                    var curOfferId = uniqueArray[i];
                    request('https://api-trade.opskins.com/ICaseSite/GetTradeStatus/v1?key=' + config.vgoKey + "&offer_id=" + curOfferId, function(error, response, body) {
                        if (response && response.statusCode) {
                            if (response.statusCode == 200) {
                                body = JSON.parse(body);
                                var itemCount = body.response.cases.length;
                                for (j = 0; j < itemCount; j++) {

                                    finalAccountItemObj.push({
                                        name: currentItem.item.name,
                                        wear: currentItem.item.wear,
                                        image: currentItem.item.image["300px"],
                                        color: currentItem.item.color,
                                        price: currentItem.item.suggested_price / 100,
                                        id: currentItem.item.id,
                                        wear: currentItem.item.wear,
                                    });
    
                            }
                            counterOfItems = counterOfItems + 1;
                            if (uniqueArray.length == counterOfItems) {
                                callback("apiWorking", finalAccountItemObj);
                            } 
                        }
                        } else {
                            callback("apiNotWorking", finalAccountItemObj);
                        }
                    })
                }    
            }    
        })
    })
}

function setCommission(refBonus, refWaxId) {

    if (refBonus == "true") {
        console.log("ref active");

        var data2 = {
            "key": config.vgoKey,
            "network_id": "1",
            "network_user_id": refWaxId,
            "referral_commission_rate": 10,
        };
    
        request.post({
            url: 'https://api-trade.opskins.com/ICaseSite/UpdateCommissionSettings/v1',
            form: data2
        },
            function (err, httpResponse, body) {
                if (err) {
                    console.log(err);
                }
                if (body) {
                    body = JSON.parse(body)
                    console.log(body);
                    console.log("Status Code: " + httpResponse.statusCode);
                }
            }
        );
        return;
    }

    if (refBonus == "false") {
        console.log("ref inactive");

        var data3 = {
            "key": config.vgoKey,
            "network_id": "1",
            "network_user_id": 1830137,
            "referral_commission_rate": 10,
        };
    
        request.post({
            url: 'https://api-trade.opskins.com/ICaseSite/UpdateCommissionSettings/v1',
            form: data3
        },
            function (err, httpResponse, body) {
                if (err) {
                    console.log(err);
                }
                if (body) {
                    body = JSON.parse(body)
                    console.log(body);
                    console.log("Status Code: " + httpResponse.statusCode);
                }
            }
        );
        return;
    }
}

var session = expressSession({
    store: new SQLiteStore,
    secret: "doesnt matter",
    resave: true,
    saveUninitialized: true
});

app.use(session);

io.use(sharedsession(session, {
    autoSave: true
}));

app.use(express.static('public', {
    extensions: ['html']
}));

app.use(passport.initialize());
app.use(passport.session());

io.use(ioCookieParser());

//case1
request('https://api-trade.opskins.com/IItem/GetItems/v1/?key=' + config.opskinsKey + '&sku_filter=100,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,10000,10001,10002,10003,10004,10005,10006,10007,10008,10009,10010,10011,10012,10013,10014,10015,10016,10017,10018,10019,10020,%2010021,10022,10023,10024', function (error, response, body) {
    if (error) {
        console.log(error);
    }
    if (body) {
        try {
            case1obj = JSON.parse(body);
        } catch (e) {
            console.log('error', body, e);
        }
    }
    
})

//case2
request('https://api-trade.opskins.com/IItem/GetItems/v1/?key=' + config.opskinsKey + '&sku_filter=117,118,119,120,121,122,123,124,125,126,127,128,129,130,131,132,133,10025,10026,10027,10028,10029,10030,10031,10032,10033,10034,10035,10036,10037,10038,10039,10040,10041,10042,10043,10044,10045,10046,10047,10048,10049', function (error, response, body) {
    if (error) {
        console.log(error);
    }

    if (body) {
        try {
            case2obj = JSON.parse(body);
        } catch (e) {
            console.log('error', body, e);
        }
    }
})

//case3
request('https://api-trade.opskins.com/IItem/GetItems/v1/?key=' + config.opskinsKey + '&sku_filter=134,135,136,137,138,139,140,141,142,143,144,145,146,147,148,149,150,10050,10051,10052,10053,10054,10055,10056,10057,10058,10059,10060,10061,10062,10063,10064,10065,10066,10067,10068,10069,10070,10071,10072,10073,10074,10075,10076,10077,10078,10079,10080,10081,10082,10083,10084,10085,10086,10087,10088,10089,10090,10091,10092,10093,10094,10095,10096,10097,10098,10099', function (error, response, body) {
    if (error) {
        console.log(error);
    }

    if (body) {
        try {
            case3obj = JSON.parse(body);
        } catch (e) {
            console.log('error', body, e);
        }
    }
})

//case4
request('https://api-trade.opskins.com/IItem/GetItems/v1/?key=' + config.opskinsKey + '&sku_filter=151,152,153,154,155,156,157,158,159,160,161,162,163,164,165,166,10100,10101,10102,10103,10104,10105,10106,10107,10108,10109,10110,10111,10112,10113,10114,10115,10116,10117,10118,10119,10120,10121,10122,10123,10124,10125,10126,10127,10128,10129,10130,10131,10132,10133,10134,10135,10136,10137,10138,10139,10140,10141,10142,10143,10144,10145,10146,10147,10148,10149,10150', function (error, response, body) {
    if (error) {
        console.log(error);
    }

    if (body) {
        try {
            case4obj = JSON.parse(body);
        } catch (e) {
            console.log('error', body, e);
        }
    }
})

io.on('connection', function (socket) {

    socketCount = socketCount + 1;
    io.sockets.emit('updateSocket', socketCount);
    socket.emit('sendTotalUsers', totalUsers);
    socket.emit('sendTotalCases', casesOpened);
    socket.emit('sendUnboxValue', totalUnboxValue);
    socket.emit('sendTopItems', completeTopUnbox);


    if (socket && socket.handshake && socket.handshake.session && socket.handshake.session.passport && socket.handshake.session.passport.user) {
        var steamid = socket.handshake.session.passport.user._json.steamid;
        db.get('SELECT levelExp FROM unbox WHERE steamId = ?', steamid, function(error, row) {
            if (error) {
                console.log(error);
                throw (error);
            }
            if (row) {
                console.log(row.levelExp);
                socket.emit('sendLevel', row.levelExp);
            }
        })
    }

    socket.on('checkReferralCode', function(clientRefCode) {
        console.log(clientRefCode);
        db.get("SELECT avatar, name FROM unbox WHERE refCodeCreated = ? COLLATE NOCASE", clientRefCode, function(error, row) {
            if (row && row.name && row.avatar) {
                socket.emit("sendingReferralInfo", row);
                return;
            }
            else {
                socket.emit("referralDoesNotExist");
                socket.emit("sendEmptyRefList");
                return;
            }
        })
    })

    socket.on('getRefCode', function(steamid) {
        db.get("SELECT refCodeCreated FROM unbox WHERE steamId = ? COLLATE NOCASE", steamid, function(error, row) {
            if (row && row.refCodeCreated) {
                socket.emit("sendRefCode",  row.refCodeCreated);
                console.log(row.refCodeCreated);
            }
        })
    })

    socket.on('getUsersOnRef', function(userProfile) {
        if (userProfile && userProfile.id) {
            db.get("SELECT refCodeCreated FROM unbox WHERE steamId = ? COLLATE NOCASE", userProfile.id, function(error, row) {
                console.log(row);
                if (row.refCodeCreated == "" || row.refCodeCreated == null) {
                    socket.emit("sendNoRefCreated");
                }
                if (row && row.refCodeCreated) {
                    var curRefCode = row.refCodeCreated;
                    db.all("SELECT steamId, avatar, name, casesOnRef FROM unbox WHERE refCodeRedeemed = ? COLLATE NOCASE", curRefCode, function(error, row) {
                        console.log(row);
                        if (row.refCodeRedeemed == null || row.refCodeRedeemed == undefined || row.refCodeRedeemed == "") {
                            console.log("no ref code created");
                            socket.emit("sendEmptyRefList");
                        }
                        if (row) {
                            if (row.length > 0) {
                                console.log(row);
                                socket.emit("sendRefList", row);
                            }
                            if (row.length == 0) {
                                console.log("no ref code created");
                                socket.emit("sendEmptyRefList");
                            }
                        }
                    })
                }
            })
        }
    })

    socket.on('sendingWaxId', function(waxId, steamid) {
        console.log(waxId);
        console.log(steamid);
        waxId = Number(waxId);
        db.get("SELECT waxId FROM unbox WHERE steamId = ?", steamid, function(error, row) {
            console.log(row);
            if (row) {
                var statement1 = db.prepare("UPDATE unbox SET waxId = ? WHERE steamid=?");
                statement1.run(waxId, steamid);
                statement1.finalize();
                socket.emit("waxIdSet");
            }
        })
    })

    socket.on('createRefCode', function(refCode, steamid, steamName, steamAvatar) {
        if (refCode.indexOf(" ") > -1) {
            socket.emit("invalidRefCodeWithSpaces");
            return;
        }
        db.get("SELECT refCodeCreated FROM unbox WHERE steamId = ? COLLATE NOCASE", steamid, function(error, row) {
            if (row.refCodeCreated == undefined || row.refCodeCreated == null) {
                db.get("SELECT refCodeCreated FROM unbox WHERE refCodeCreated = ? COLLATE NOCASE", refCode, function(error, row) {
                    if (row == "" || row == null || row == undefined) {
                        var statement = db.prepare("UPDATE unbox SET refCodeCreated = ?, avatar = ?, name = ? WHERE steamId = ?");
                        statement.run(refCode, steamAvatar, steamName, steamid);
                        statement.finalize();
                        socket.emit("refCodeSet");
                    }
                    if (row && row.refCodeCreated && refCode) {
                        
                        if (row.refCodeCreated.toLowerCase() == refCode.toLowerCase()) {
                            socket.emit("refCodeExistsAlready");
                            console.log(row.refCodeCreated);
                            console.log("refcode already exists by someone else");
                        }
                    }
                })
            }
            if (row.refCodeCreated != undefined || row.refCodeCreated != null) {
                socket.emit("refCodeAlreadySet");
            }
        })
    })

    socket.on('redeemRefCode', function(refCode, steamid, steamAvatar, steamName) {
        db.get("SELECT refCodeRedeemed FROM unbox WHERE steamId = ? COLLATE NOCASE", steamid, function(error, row) {
            if (row.refCodeRedeemed == undefined || row.refCodeRedeemed == null) {

                db.get("SELECT refCodeCreated FROM unbox WHERE refCodeCreated = ? COLLATE NOCASE", refCode, function(error, row) {
                    if (row == null || row == undefined) {
                        socket.emit("noRefCodeExists");
                        return;
                    }
                    if (row && row.refCodeCreated) {
                        if (row.refCodeCreated = "saassa") {
                            var statement = db.prepare("UPDATE unbox SET refCodeRedeemed = ?, avatar = ?, name = ?, casesOnRef = ? WHERE steamId = ?");
                            statement.run(refCode, steamAvatar, steamName, "0", steamid);
                            statement.finalize();
                            socket.emit("refCodeRedeemSet");
                        }
                    }
                })
            }
            if (row.refCodeRedeemed != undefined || row.refCodeRedeemed != null) {
                socket.emit("refCodeRedeemAlreadySet");
            }
        })
    })

    socket.on('checkRefCodeRedeemed', function(steamid) {
        db.get("SELECT refCodeRedeemed FROM unbox WHERE steamId = ? COLLATE NOCASE", steamid, function(error, row) {
            if (row && row.refCodeRedeemed) {
                socket.emit('sendRefCodeRedeemCheck', row);
            }
            if (row.refCodeRedeemed == null || row.refCodeRedeemed == undefined || row.refCodeRedeemed == "") {
                socket.emit('noRefCodeRedeemed');
            }
        })
    })
    
    
    socket.emit('loadChat', messageArray);
    socket.emit('liveItems', finalLiveArray);
    socket.on('messageToServer', function(message){
        if (socket && socket.handshake && socket.handshake.session && socket.handshake.session.passport && socket.handshake.session.passport.user) {
            var steamName = socket.handshake.session.passport.user._json.personaname;
            var steamAvatar = socket.handshake.session.passport.user._json.avatar;
            var steamid = socket.handshake.session.passport.user._json.steamid;
            console.log("messagetoserver hit");
            controlMessage(socket, steamName, steamAvatar, steamid, message);
        }
    })

    socket.on('getSteamId', function(){
        if (socket.handshake.session && socket.handshake.session.passport && socket.handshake.session.passport.user) {
            socket.emit('emitSteamId', socket.handshake.session.passport.user.id);
        } else {
            socket.emit('emitSteamId');
        }
        
    })

    socket.on('getUnboxedCases', function(steamid){
        getUnboxedCasesFromUser(steamid, function (apiCheck, finalAccountItemObj) {
            if (apiCheck == "apiWorking") {
            socket.emit('sendUserUnboxedItems', finalAccountItemObj);
            console.log("jaja");
            }
            if (apiCheck == "apiNotWorking") {
                socket.emit('apiDown');
            }
        })
    })
   

    socket.on('updateUserDB', function(userId){
        insertNewUser(userId);
    })

    socket.emit('joined');

    if (socket.handshake.session && socket.handshake.session.passport && socket.handshake.session.passport.user) {
        var profile = socket.handshake.session.passport.user;
        socket.emit('data', profile);
    }
    socket.on('disconnect', function () {
        socketCount = socketCount - 1;
        console.log("socket count: " + socketCount)
        io.sockets.emit('updateSocket', socketCount);
    })

    socket.on('getKeys', function() {
        getKeys(socket);
    })

    socket.emit('sendCase1', case1obj);
    socket.emit('sendCase2', case2obj);
    socket.emit('sendCase3', case3obj);
    socket.emit('sendCase4', case4obj);

    socket.on('getInv', function () {
        if (socket.handshake.session && socket.handshake.session.passport && socket.handshake.session.passport.user && socket.handshake.session.passport.user._json && socket.handshake.session.passport.user._json.steamid) {
            var profile = socket.handshake.session.passport.user;
            var steamid = profile._json.steamid;
            console.log(steamid);
            request('https://api-trade.opskins.com/ITrade/GetUserInventoryFromSteamId/v1/?app_id=1&steam_id=' + steamid + '&key=' + config.opskinsKey, function (error, response, body) {
                if (error) {
                    console.log(error);
                    return;
                }
                body = JSON.parse(body);
                if (response.statusCode == 200) {
                    if (body && body.message) {
                        if (body.message == "No such user found") {
                            socket.emit('noUserInv', body);
                        }
                    }
                    if (body && body.response && body.response.items) {
                        var items = body.response.items;
                        socket.emit('sendData', items);
                    } 
                }
            });
        };
    });



    socket.on('keyOpen', function (caseKeyCount, caseNo) {
        if (socket && socket.handshake && socket.handshake.session && socket.handshake.session.passport && socket.handshake.session.passport.user && socket.handshake.session.passport.user._json && socket.handshake.session.passport.user._json.steamid) {
            var steamid = socket.handshake.session.passport.user._json.steamid;
            if (caseKeyCount > 0) {
                openCase(caseKeyCount, caseNo, steamid, socket);
                console.log("on keyopen event");
            }
        }
    })
});

function openCase(caseKeyCount, caseNo, steamid, socket) {

    var ethAddress = "0x345589242868f00c33a7aF77CcfD4420E5d10eE2";
    console.log(steamid);
    db.get("SELECT refCodeRedeemed FROM unbox WHERE steamId = ? COLLATE NOCASE", steamid, function(error, row) {
        if (error) {
            console.log(error);
            setTimeout(function() {
                openCase(caseKeyCount, caseNo, steamid, socket);
            })
        }
        if (row.refCodeRedeemed == undefined || row.refCodeRedeemed == null || row.refCodeRedeemed == "") {
            console.log(row);
            console.log("NO REF CODE USED");
            if (caseKeyCount > 0) {

                var refBonus = "false";
                var refWaxId = "";

                setCommission(refBonus, refWaxId);

                var data = {
                    "key": config.vgoKey,
                    "steam_id": steamid,
                    "case_id": caseNo,
                    "affiliate_eth_address": ethAddress,
                    "amount": caseKeyCount,
                    "referral_uid": 1830137,
                };
        
                request.post({
                    url: 'https://api-trade.opskins.com/ICaseSite/SendKeyRequest/v1',
                    form: data
                }, function (err, httpResponse, body) {
                        body = JSON.parse(body)
                        if (body && body.response && body.response.offer && body.response.offer.id) {
                            console.log("sent key successful");
                            var offerID = body.response.offer.id;
                            socket.emit('caseTrade', body);
                            refreshTradeOfferState(socket, offerID);
                            return;
                        } else {
                                setTimeout(function() {
                                    openCase(caseKeyCount, caseNo, steamid, socket);
                                    console.log("retrying sending key");
                                }, 5000);
                        }
                    });
            } 
            return;
        }
        if (row && row.refCodeRedeemed) {
            console.log("user has redeemed this code: " + row.refCodeRedeemed);
            console.log("REF CODE USED");

            db.get("SELECT refCodeCreated, waxId FROM unbox WHERE refCodeCreated = ? COLLATE NOCASE", row.refCodeRedeemed, function(error, row) {
                console.log("inside db.get");
                console.log(row);
                if (row && row.refCodeCreated && row.waxId) {
                    console.log("user is now opening a case on the code created by waxID: " + row.waxId);
                    console.log(row);
                    console.log("inside ifStatement of refcode USED")

                    var refWaxId = row.waxId;
                    var refBonus = "true";

                    setCommission(refBonus, refWaxId);

                    if (caseKeyCount > 0) {
                        var data = {
                            "key": config.vgoKey,
                            "steam_id": steamid,
                            "case_id": caseNo,
                            "affiliate_eth_address": ethAddress,
                            "amount": caseKeyCount,
                            "referral_uid": refWaxId,
                        };
                
                        request.post({
                            url: 'https://api-trade.opskins.com/ICaseSite/SendKeyRequest/v1',
                            form: data
                        }, function (err, response, body) {
                                body = JSON.parse(body)
                                if (response.statusCode == 200) {
                                    console.log("sent key successful");
                                    var offerID = body.response.offer.id;
                                    socket.emit('caseTrade', body);
                                    refreshTradeOfferState(socket, offerID);
                                    return;
                                } else {
                                        setTimeout(function() {
                                            openCase(caseKeyCount, caseNo, steamid, socket);
                                            console.log("retrying sending key");
                                        }, 5000);
                                }
                            });
                    } 

                }
            })
            return;
        }
    })

}

function controlMessage(socket, steamName, steamAvatar, steamid, message, profileUrl) {
    message = message.replace(/>/g, "" ).replace(/</g, "" ).replace(/script/g, "" ).replace(/&lt;/g, "" ).replace(/&gt;/g, "" ).replace(/src/g, "" );
    var adminId = 76561198311345227;
    var newSteamId = String(steamid);
    db.get("SELECT levelExp FROM unbox WHERE steamId = ?", newSteamId, function(error, row) {
        if (error) {
            throw (error);
        }
        if (row) {
            var level = row.levelExp;
            if ((steamid == adminId) && (message == "clear")) {
                console.log(steamid);
                messageArray =[];
                io.sockets.emit('clearMessages');
                var statement1 = db.prepare("DELETE FROM messages");
                statement1.run();
                statement1.finalize();
                return;
            }
            if (message != "") {
                if (steamid == adminId) {
                    var profileUrl = ("https://steamcommunity.com/profiles/" + newSteamId);
                    var msgObj = {
                        name: steamName,
                        avatar: steamAvatar,
                        message: message,
                        level: level,
                        admin: "yes",
                        profileUrl: profileUrl,
                    }
                }
                if (steamid != adminId) {
                    var profileUrl = ("https://steamcommunity.com/profiles/" + newSteamId);
                    var msgObj = {
                        name: steamName,
                        avatar: steamAvatar,
                        message: message,
                        level: level,
                        admin: "no",
                        profileUrl: profileUrl,
                    }
                }
                messageArray.push(msgObj);
                if (messageArray.length > 30) {
                    messageArray.shift();
                }
                console.log("controlMessage")
                var statement = db.prepare("INSERT INTO messages VALUES (?, ?, ?, ?, ?, ?, ?)");
                statement.run(null, msgObj.name, msgObj.avatar, msgObj.message, msgObj.level, msgObj.admin, profileUrl);
                statement.finalize();
                io.sockets.emit('MessageToClient', steamName, steamAvatar, msgObj, profileUrl);
            }

        }

    })

}

function getKeys(socket) {
    if (socket && socket.handshake && socket.handshake.session && socket.handshake.session.passport && socket.handshake.session.passport.user && socket.handshake.session.passport.user._json && socket.handshake.session.passport.user._json.steamid) {
        var steamid = socket.handshake.session.passport.user._json.steamid;
        request('https://api-trade.opskins.com/ICaseSite/GetKeyCount/v1?steam_id=' + steamid + '&key=' + config.vgoKey, function (error, response, body) {
            if (error) {
                console.log(error);
                setTimeout(getKeys.bind(this, socket), 5000);
                return;
            }

            if (body) {
                body = JSON.parse(body);
                if (body && body.response && body.response.key_count) {
                    socket.emit('keyCount', body);
                }
                else {
                    console.log("got here xd", body);
                    setTimeout(function() {
                        getKeys(socket);
                    }, 5000);
                }
            } else {
                setTimeout(function() {
                    getKeys(socket);
                }, 5000);
                console.log("error, retrying getKeys event in 5000ms");
            }
        })
    } else {
        setTimeout(function() {
            getKeys(socket);
        }, 5000);
        console.log("didnt work keysss");
    }
}

function refreshTradeOfferState(socket, offerID) {
    request('https://api-trade.opskins.com/ICaseSite/GetTradeStatus/v1?key=' + config.vgoKey + '&offer_id=' + offerID, function (error, response, body) {
        if (error) {
            console.log(error);
            setTimeout(function() {
                refreshTradeOfferState(socket, offerID)
            }, 5000);
            return;
        }

        console.log("Status Code: " + response.statusCode);

        if (response.statusCode != 200) {
            setTimeout(function() {
                refreshTradeOfferState(socket, offerID)
            }, 5000);
            console.log("bad request, status code: " + response.statusCode)
            socket.emit("badstatus", response.statusCode);
            return;
        }
        
        body = JSON.parse(body);

        if (!body || !body.response || !body.response.offer || !body.response.offer.state) {
            console.log("no response");
            setTimeout(function() {
                refreshTradeOfferState(socket, offerID)
            }, 5000);
            return;
        }

        
        if (response.statusCode == 200) {
            var offerState = body.response.offer.state;
            console.log("Offer State: " + offerState);
            if (offerState == 2) {
                // offer still active, user has not accepted, call HTTP req again
                console.log('Offer not accepted');
                socket.emit('notAccepted');
                setTimeout(function() {
                    refreshTradeOfferState(socket, offerID)
                }, 5000);
            }
    
            if (offerState == 8) {
                // offer still active, user has not accepted, call HTTP req again
                console.log('Offer not accepted');
                socket.emit('notAccepted');
                setTimeout(function() {
                    refreshTradeOfferState(socket, offerID)
                }, 5000);
            }
    
            if (offerState == 3) {
                // offer accepted, get case unboxing data
                var openedCaseObj = body.response;
                var steamid = openedCaseObj.offer.recipient.steam_id;
                console.log("trade accepted");
                socket.emit('caseOpenedObj', openedCaseObj);
                addNewCaseToDB(openedCaseObj, steamid);
                addExp(openedCaseObj, steamid);
                setTimeout(function() {
                    pushNewLiveItem(socket, openedCaseObj);
                    liveItemPush(socket, openedCaseObj);
                    handleTopItems(openedCaseObj);
                }, 11000);
                var itemLength = openedCaseObj.cases.length;
                console.log('caseOpenedObj', JSON.stringify(openedCaseObj, null, 3));
                for (i = 0; i < itemLength; i++) {
                    setTimeout(handle.bind(this, i), i * 11000);
                }

                function handle(index) {
                    casesOpened = casesOpened + 1;
                    socket.emit('updateLevel');
                    io.sockets.emit('sendTotalCases', casesOpened);
                    var curPrice = openedCaseObj.cases[index].item.suggested_price;
                    var price = Number(curPrice/100);
                    console.log(price);
                    totalUnboxValue = totalUnboxValue + price;
                    setTimeout(function() {
                        io.sockets.emit('sendUnboxValue', totalUnboxValue);
                    }, 11000)
                    console.log("pushing total new price");
                    console.log(totalUnboxValue);
                }

                db.get("SELECT casesOnRef FROM unbox WHERE steamid = ?", steamid, function(error, row) { 
                    console.log(row)
                        if (row.casesOnRef == undefined || row.casesOnRef == null || row.casesOnRef == "" || row.casesOnRef == "0" || row.casesOnRef == 0) {
                            var curCases = 0;
                            console.log(curCases)
                            console.log("jaja")
                            var statement1 = db.prepare("UPDATE unbox SET casesOnRef = ? WHERE steamId = ?");
                            statement1.run(itemLength, steamid);
                            statement1.finalize();
                        }
                        if (row && row.casesOnRef) {
                            if (row.casesOnRef > 0) {
                                var curCases = row.casesOnRef;
                                var newCaseAmount = Number(curCases) + Number(itemLength);
                                console.log(curCases);
                                console.log("heall yeah")
                                var statement1 = db.prepare("UPDATE unbox SET casesOnRef = ? WHERE steamId = ?");
                                statement1.run(newCaseAmount, steamid);
                                statement1.finalize();
                            }
                        }
                })
                
            }
    
            if (offerState == 7) {
                // offer declined
                socket.emit('offerDeclined');
                console.log("status 7");
            }
    
            if (offerState == 9) {
                // trade accepted, outcome pending, refresh for outcome
                socket.emit('sendAcceptedNotification');
                setTimeout(function() {
                    refreshTradeOfferState(socket, offerID)
                }, 10000);
            }
    
            if ([5, 6, 10, 11, 12].indexOf(offerState) > -1) {
                socket.emit('offerCancelled');
                console.log("status 5, 6, 10, 11, 12");
            }
        } else {
            setTimeout(function() {
                refreshTradeOfferState(socket, offerID)
            }, 5000);
        }
    })
}


function handleTopItems(openedCaseObj) {
    var itemArray = [];
    var counter = 0;

    for (x=0; x < openedCaseObj.cases.length; x++) {

        console.log(JSON.stringify(openedCaseObj.cases[x]))
        itemArray.push({
            color: openedCaseObj.cases[x].item.color,
            name: openedCaseObj.cases[x].item.name,
            image: openedCaseObj.cases[x].item.image["300px"],
            id: openedCaseObj.cases[x].item.id,
            price: openedCaseObj.cases[x].item.suggested_price,
            steamName: openedCaseObj.offer.recipient.display_name,
            steamAvatar: openedCaseObj.offer.recipient.avatar,
        });
        counter = counter + 1;
        if (counter == openedCaseObj.length) {
            for (var i = 0; i < itemArray.length; i++) {
                setTimeout(controlTopItems.bind(this, itemArray[i]), i * 11000);
            }
        }
    }
}

function controlTopItems(vgoObj) {
    console.log("total length: " + completeTopUnbox.length);

    if (completeTopUnbox.length === 0) {
        return;
    }

    console.log("Current item price: " + vgoObj.price);
    console.log("Cheapest top item price: " + completeTopUnbox[0].price);

    for (var j = 0; j < completeTopUnbox.length; j++) {
        if (vgoObj.price <= completeTopUnbox[j].price) {
            continue; 
        }

        completeTopUnbox.splice(j, 0, vgoObj);
        completeTopUnbox = completeTopUnbox.slice(0, 16);
        getTopItems();
        io.sockets.emit('sendTopItems', completeTopUnbox);
    }
}

function addExp(openedCaseObj, steamid) {
    var amountOfCases = openedCaseObj.cases.length;
    db.get("SELECT levelExp FROM unbox WHERE steamId = ?", steamid, function(error, row) {
        if (error) {
            throw (error);
        }
        
        if (row) {
            console.log("curexp")
            console.log(row);
            var curExp = Number(row.levelExp);
            var newExp = Number(curExp + (1 * amountOfCases));
            console.log("newexp");
            console.log(newExp);
            var newSteamId = String(steamid);
            var statement1 = db.prepare("UPDATE unbox SET levelExp = ? WHERE steamId = ?");
            statement1.run(newExp, newSteamId);
            statement1.finalize();
        }
    })
}

function liveItemPush(socket, openedCaseObj) {
    var length = openedCaseObj.cases.length;
    var counter = 0;
    
    for (i = 0; i < length; i++) {

        liveItemQueue.push({
            userName: openedCaseObj.offer.recipient.display_name,
            name: openedCaseObj.cases[i].item.name,
            id: openedCaseObj.cases[i].item.id,
            avatar: openedCaseObj.offer.recipient.avatar,
            price: openedCaseObj.cases[i].item.suggested_price/100,
            image: openedCaseObj.cases[i].item.image["300px"],
            color: openedCaseObj.cases[i].item.color,
        });
        counter = counter + 1;

        if (counter == length) {
            console.log("arrived at live array queue pushing to client");
            var length = liveItemQueue.length;
            for (i = 0; i < length; i++) {
                var curTime = i*11000;
                console.log(curTime);
                setTimeout(function() {
                    var curItem = liveItemQueue[0];
                    console.log("inside setTimeout");
                    //console.log(curItem);
                    io.sockets.emit('printLiveObj', curItem);
                    liveItemQueue.shift();
                }, curTime);
            }
        }
    }
    console.log("arrived at liveitempush func")
}


var cases = {"response":{"cases":[{"id":1,"name":"Weapon Case 1","image":{"300px":"https://files.opskins.media/file/vgo-img/case/weapon-case-1-300.png"},"skus":[100,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,10000,10001,10002,10003,10004,10005,10006,10007,10008,10009,10010,10011,10012,10013,10014,10015,10016,10017,10018,10019,10020,10021,10022,10023,10024]},{"id":2,"name":"Weapon Case 2","image":{"300px":"https://files.opskins.media/file/vgo-img/case/weapon-case-2-300.png"},"skus":[117,118,119,120,121,122,123,124,125,126,127,128,129,130,131,132,133,10025,10026,10027,10028,10029,10030,10031,10032,10033,10034,10035,10036,10037,10038,10039,10040,10041,10042,10043,10044,10045,10046,10047,10048,10049]},{"id":3,"name":"Weapon Case 3","image":{"300px":"https://files.opskins.media/file/vgo-img/case/weapon-case-3-300.png"},"skus":[134,135,136,137,138,139,140,141,142,143,144,145,146,147,148,149,150,10050,10051,10052,10053,10054,10055,10056,10057,10058,10059,10060,10061,10062,10063,10064,10065,10066,10067,10068,10069,10070,10071,10072,10073,10074,10075,10076,10077,10078,10079,10080,10081,10082,10083,10084,10085,10086,10087,10088,10089,10090,10091,10092,10093,10094,10095,10096,10097,10098,10099]},{"id":4,"name":"Weapon Case 4","image":{"300px":"https://files.opskins.media/file/vgo-img/case/weapon-case-4-300.png"},"skus":[151,152,153,154,155,156,157,158,159,160,161,162,163,164,165,166,10100,10101,10102,10103,10104,10105,10106,10107,10108,10109,10110,10111,10112,10113,10114,10115,10116,10117,10118,10119,10120,10121,10122,10123,10124,10125,10126,10127,10128,10129,10130,10131,10132,10133,10134,10135,10136,10137,10138,10139,10140,10141,10142,10143,10144,10145,10146,10147,10148,10149,10150]}]}};


var case1SKU = [100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 10000, 10001, 10002, 10003, 10004, 10005, 10006, 10007, 10008, 10009, 10010, 10011, 10012, 10013, 10014, 10015, 10016, 10017, 10018, 10019, 10020, 10021, 10022, 10023, 10024]
var case2SKU = [117, 118, 119, 120, 121, 122, 123, 124, 125, 126, 127, 128, 129, 130, 131, 132, 133, 10025, 10026, 10027, 10028, 10029, 10030, 10031, 10032, 10033, 10034, 10035, 10036, 10037, 10038, 10039, 10040, 10041, 10042, 10043, 10044, 10045, 10046, 10047, 10048, 10049]
var case3SKU = [134, 135, 136, 137, 138, 139, 140, 141, 142, 143, 144, 145, 146, 147, 148, 149, 150, 10050, 10051, 10052, 10053, 10054, 10055, 10056, 10057, 10058, 10059, 10060, 10061, 10062, 10063, 10064, 10065, 10066, 10067, 10068, 10069, 10070, 10071, 10072, 10073, 10074, 10075, 10076, 10077, 10078, 10079, 10080, 10081, 10082, 10083, 10084, 10085, 10086, 10087, 10088, 10089, 10090, 10091, 10092, 10093, 10094, 10095, 10096, 10097, 10098, 10099]
var case4SKU = [151, 152, 153, 154, 155, 156, 157, 158, 159, 160, 161, 162, 163, 164, 165, 166, 10100, 10101, 10102, 10103, 10104, 10105, 10106, 10107, 10108, 10109, 10110, 10111, 10112, 10113, 10114, 10115, 10116, 10117, 10118, 10119, 10120, 10121, 10122, 10123, 10124, 10125, 10126, 10127, 10128, 10129, 10130, 10131, 10132, 10133, 10134, 10135, 10136, 10137, 10138, 10139, 10140, 10141, 10142, 10143, 10144, 10145, 10146, 10147, 10148, 10149, 10150]

// for (i = 0; i < case1SKU.length; i++) {
//     var finalsku = finalsku + "," + case1SKU[i];
// }
// console.log(finalsku);

passport.serializeUser(function (user, done) {
    done(null, user);
});

passport.deserializeUser(function (obj, done) {
    done(null, obj);
});

passport.use(new SteamStrategy({
    returnURL: 'https://www.vgoupgrade.com/auth/steam/return',
    realm: 'https://www.vgoupgrade.com/',
    apiKey: config.steamKey,
}, function (identifier, profile, done) {
    console.log("profile");
    done(false, profile);
}));

app.get('/auth/steam', passport.authenticate('steam'), function (req, res) {
    // The request will be redirected to Steam for authentication, so
    // this function will not be called.
});

app.get('/auth/steam/return', passport.authenticate('steam', { failureRedirect: '/login' }), function (req, res) {
    // Successful authentication, redirect home.
    res.redirect('/');
    console.log("logged in successfully");
});

app.get('/logout', function (req, res) {
    req.logout();
    res.redirect('/');
});

server.listen(8888);
