const socket = io.connect('https://www.vgoupgrade.com/');
var case1SKU = [100,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,10000,10001,10002,10003,10004,10005,10006,10007,10008,10009,10010,10011,10012,10013,10014,10015,10016,10017,10018,10019,10020,10021,10022,10023,10024];
var case2SKU = [117,118,119,120,121,122,123,124,125,126,127,128,129,130,131,132,133,10025,10026,10027,10028,10029,10030,10031,10032,10033,10034,10035,10036,10037,10038,10039,10040,10041,10042,10043,10044,10045,10046,10047,10048,10049];
var case3SKU = [134,135,136,137,138,139,140,141,142,143,144,145,146,147,148,149,150,10050,10051,10052,10053,10054,10055,10056,10057,10058,10059,10060,10061,10062,10063,10064,10065,10066,10067,10068,10069,10070,10071,10072,10073,10074,10075,10076,10077,10078,10079,10080,10081,10082,10083,10084,10085,10086,10087,10088,10089,10090,10091,10092,10093,10094,10095,10096,10097,10098,10099];
var case4SKU = [151,152,153,154,155,156,157,158,159,160,161,162,163,164,165,166,10100,10101,10102,10103,10104,10105,10106,10107,10108,10109,10110,10111,10112,10113,10114,10115,10116,10117,10118,10119,10120,10121,10122,10123,10124,10125,10126,10127,10128,10129,10130,10131,10132,10133,10134,10135,10136,10137,10138,10139,10140,10141,10142,10143,10144,10145,10146,10147,10148,10149,10150];
var case1 = {};
var case2 = {};
var case3 = {};
var case4 = {};
var userLoggedIn = "false";
var liveArray =[];
var check = false;
var webChatCheck = readCookie("webchat");
var myLevel;
var userProfile;
var lever = "off";
var accInv = [];
var userInv = [];

var url = window.location.search
var getQuery = url.split('?')[1]
console.log(getQuery);

if (getQuery != undefined) {
    if (getQuery.indexOf("ref") > -1) {
        var clientRefCode = getQuery.split("=")[1];
        console.log("referral code: " + clientRefCode);
        setTimeout(function() {
            socket.emit('checkReferralCode', clientRefCode);
            $('.refModalCodeContent').append(clientRefCode);
            $('#modal3')[0].M_Modal.open();
        }, 1000)
    }
}

socket.on('referralDoesNotExist', function() {
    $('#modal3')[0].M_Modal.close();
    M.toast({html: "Referral code does not exist!"})
})

socket.on('sendingReferralInfo', function(referralInfoObj) {
    console.log(referralInfoObj);
    $('.refProfile').append(
        '<img class="refFriendAvatar" src="' + referralInfoObj.avatar + '">\
        <p class="refFriendName">' + referralInfoObj.name + '</p>'
    );
})

$('#acceptReferral').on('click', function() {
    if (userLoggedIn == "false") {
        M.toast({html: "You need to be logged in to redeem referrals!"})
    }
    if (userLoggedIn == "true") {
        if (getQuery.indexOf("ref") > -1) {
            var clientRefCode = getQuery.split("=")[1];
            var steamid = userProfile.id;
            var steamAvatar = userProfile._json.avatar;
            var steamName = userProfile.displayName;
            socket.emit("redeemRefCode", clientRefCode, steamid, steamAvatar, steamName)
        }
        
    }
})

$('#declineReferral').on('click', function() {
    $('#modal3')[0].M_Modal.close();
    setTimeout(function() {
        window.location.replace('https://www.vgoupgrade.com/');
    }, 1000)
})

var isEdge = !isIE && !!window.StyleMedia;
var isIE = /*@cc_on!@*/false || !!document.documentMode;

$('.caseContainer').prepend(
    '<button class="btn affiliateButtonNotification"> Affiliates have just been added, highest on any site, $0.25 BACK PER CASE - Thats 100% of our cut! </button>'
)

$('.pageContainer').prepend(
    '<button class="btn affiliateButtonNotification"> Affiliates have just been added, highest on any site, $0.25 BACK PER CASE - Thats 100% of our cut! </button>'
)

$('.affiliateButtonNotification').on('click', function() {
    window.location.replace('https://www.vgoupgrade.com/affiliates');
})


if (isEdge == true || isIE == true) {
    $('.modal').addClass("is-active");
}

$('.delete').on('click', function() {
    $('.modal').removeClass("is-active");
})

socket.on('updateSocket', function(socketCount) {
    socketCount = Number(socketCount);
    console.log(socketCount);
    $('.userCountStat').text(socketCount);
})

socket.on ('sendTotalUsers', function(totalUsers) {
    totalUsers = Number(totalUsers);
    console.log(totalUsers);
    $('.usersRegCount').text(totalUsers);
})

socket.on('sendTotalCases', function(totalCases) {
    totalCases = Number(totalCases);
    $('.casesOpenedCount').text(totalCases);
})

socket.on('sendUnboxValue', function(unboxValue) {
    unboxValue = Number(unboxValue);
    unboxValue = (Math.round(unboxValue * 100))/100;
    $('.unboxValueCount').text(unboxValue);
})


socket.emit('getSteamId');
socket.on('emitSteamId', function(steamid) {
    if (steamid == undefined) {
     $('.chatUI').empty();
     $('.chatUI').append(
        '<a class="button chatLogoutCover" href="/auth/steam">\
            <span class="icon">\
                <img src="drawables/loginChatIcon.png">\
            </span>\
            <span class="loginChatContent">\
                Login To Chat\
            </span>\
        </a>'
        );
    }
})

$('#mobileToggle').on('click', function() {
    if ($('#navMenu').hasClass('is-active')) {
        $('.fadeDiv').css('display', 'block');
    } else {
        $('.fadeDiv').hide();
    }
})

$('.socials').on('click', function() {
    var win = window.open("https://twitter.com/VGOUpgradeCom", '_blank');
    win.focus();
})

socket.on('clearMessages', function() {
    $('.messageDiv').remove();
})

socket.on('connect', function(){
    $('#socketConnectionItem').text("Connected");
    $('#socketConnectionItem').css("color", "#29c78c");
});

socket.on('disconnect', function(){
    $('#socketConnectionItem').text("Disconnected");
    $('#socketConnectionItem').css("color", "#b92a2a");
});

if ((window.location.pathname == "/inventory") || (window.location.pathname == "/affiliates") || (window.location.pathname == "/account") || (window.location.pathname == "/case-1") || (window.location.pathname == "/case-2") || (window.location.pathname == "/case-3") || (window.location.pathname == "/case-4")) {
    if (webChatCheck == "webChatOn") {
        $('.pageContainer').css("left", "20%");
        $('.sideContainer').css("display", "flex");
        $('.pageContainer').css("right", "200px");
        webIconOff();
    }
    if (webChatCheck == "webChatOff") {
        $('.pageContainer').css("left", "0%");
        $('.pageContainer').css("right", "200px");
        $('.sideContainer').hide();
        webIconOn();
    }
}

if (window.location.pathname == "/") {
    if (webChatCheck == "webChatOn") {
        $('.indexPageContainer').css("left", "20%");
        $('.sideContainer').css("display", "flex");
        $('.indexPageContainer').css("right", "200px");
        webIconOff();
    }
    if (webChatCheck == "webChatOff") {
        $('.indexPageContainer').css("left", "0%");
        $('.indexPageContainer').css("right", "200px");
        $('.sideContainer').hide();
        webIconOn();
    }
}

function webIconOn() {
    $('.rect1').css("height", "20px");
    $('.rect1').css("margin-top", "18px");

    $('.rect2').css("height", "40px");
    $('.rect2').css("margin-top", "9px");
    
    $('.rect3').css("height", "60px");
    $('.rect3').css("margin-top", "0px");

}
function webIconOff() {

    $('.rect1').css("height", "60px");
    $('.rect1').css("margin-top", "0px");

    $('.rect2').css("height", "40px");
    $('.rect2').css("margin-top", "9px");
    
    $('.rect3').css("height", "20px");
    $('.rect3').css("margin-top", "18px");
}


$('.spinner').on('click', function() {
    var curElem = $('.sideContainer');

    if ((window.location.pathname == "/inventory") || (window.location.pathname == "/affiliates") || (window.location.pathname == "/account") || (window.location.pathname == "/case-1") || (window.location.pathname == "/case-2") || (window.location.pathname == "/case-3") || (window.location.pathname == "/case-4")) {

        if (curElem.css("display") == "none") {
            setTimeout(function() {
                curElem.toggle();
            }, 500)
            $('.pageContainer').css("left", "20%");
            $('.pageContainer').css("right", "200px");
            webIconOff();
            Cookies.set('webchat', 'webChatOn');
        }
        if (curElem.css("display") == "flex") {
            curElem.toggle();
            $('.pageContainer').css("left", "0%");
            $('.pageContainer').css("right", "200px");
            webIconOn();
            Cookies.set('webchat', 'webChatOff');
        }
    }

    if (window.location.pathname == "/") {
        if (curElem.css("display") == "none") {
            setTimeout(function() {
                curElem.toggle();
            }, 500)
            $('.indexPageContainer').css("left", "20%");
            $('.indexPageContainer').css("right", "200px");
            webIconOff();
            Cookies.set('webchat', 'webChatOn');
        }
        if (curElem.css("display") == "flex") {
            curElem.toggle();
            $('.indexPageContainer').css("left", "0px");
            $('.indexPageContainer').css("right", "200px");
            webIconOn();
            Cookies.set('webchat', 'webChatOff');
        }
    }

    
});

$('.chatButton').on('click', function() {
    if ($('.chatInput').val().trim() == "") {
        toastr.error("Type a message before attempting to send it!");
    }
    else {
        var message = $('.chatInput').val();
        socket.emit('messageToServer', message);
        $('.chatInput').val("");
        $( ".chatInput" ).focus();
    }
})

function scrollChatBox(){
    $("#chatBox").scrollTop($("#chatBox")[0].scrollHeight);
}

$('.chatInput').on('keyup', function(event){
    if ($('.chatInput').val().trim() == "") {
        M.toast({html: "Type a message before attempting to send it!"})
    }
    else {
        if (event.keyCode == 13) {
            var message = $('.chatInput').val();
            socket.emit('messageToServer', message);
            $('.chatInput').val("");
            $( ".chatInput" ).focus();
        }
    }
    
})

socket.on('MessageToClient', function(steamName, steamAvatar, msgObj, profileUrl) {
    var msgCount = $('.messageDiv').length;
    if (msgObj.admin == "yes") {
        $('#chatBox').append(
            '<div class="messageDiv">\
                <div class="messageContent" style="border-left: 3px solid #ff0000c2">\
                    <span> <img class="chatUserAvatar" src=' + steamAvatar + '></span>\
                    <span class="adminTag">' + "ADMIN" + '</span>\
                    <span class="acclevel">' + msgObj.level + '</span>\
                    <a href="' + profileUrl + '" target="_blank" class="msgName" style="color: #ff0000;">' + " " + steamName + ": " + '</a>\
                    </div>\
                <span class="msgContent" style="color: #ffffff;">' + msgObj.message + '</span>\
            </div>'
        );
    } 
    if (msgObj.admin == "no") {
        $('#chatBox').append(
            '<div class="messageDiv" style="border-left: 3px solid #2ac78bc4">\
                <div class="messageContent" style="">\
                    <span> <img class="chatUserAvatar" src=' + steamAvatar + '></span>\
                    <span class="acclevel">' + msgObj.level+ '</span>\
                    <a href="' + profileUrl + '" target="_blank" style="color: #29c78c;">' + steamName + ": " + '</a>\
                    </div>\
                <span class="msgContent" style="color: #ffffff;">' + msgObj.message + '</span>\
            </div>'
        );
    }

    if (msgCount > 30) {
        $('.messageDiv').first().remove();
    }
    scrollChatBox(); 
})

socket.on('loadChat', function(messageArray) {
    var counter = 0;

    if ( $('#chatBox').children().length == 0 ) {
        for (i = 0; i < messageArray.length; i++) {
            counter = counter + 1;
            var curName = messageArray[i].name;
            var curAvatar = messageArray[i].avatar;
            var curMessage = messageArray[i].message;
            var ifAdmin = messageArray[i].admin;
            var profileUrl = messageArray[i].profileUrl;
            console.log(ifAdmin);
            var level = messageArray[i].level;
            if (ifAdmin == "yes") {
                $('#chatBox').append(
                    '<div class="messageDiv">\
                        <div class="messageContent" style="border-left: 3px solid #ff0000c2">\
                            <span> <img class="chatUserAvatar" src=' + curAvatar + '></span>\
                            <span class="adminTag">' + "ADMIN" + '</span>\
                            <span class="acclevel">' + level + '</span>\
                            <a href="' + profileUrl + '" target="_blank" class="msgName" style="color: #ff0000;">' + " " + curName + ": " + '</a>\
                        </div>\
                        <span class="msgContent" style="color: #ffffff;">' + curMessage + '</span>\
                    </div>'
                );
            } 
            if (ifAdmin == "no") {
                $('#chatBox').append(
                    '<div class="messageDiv">\
                        <div class="messageContent" style="border-left: 3px solid #2ac78bc4">\
                            <span> <img class="chatUserAvatar" src=' + curAvatar + '></span>\
                            <span class="acclevel">' + level + '</span>\
                            <a href="' + profileUrl + '" target="_blank" class="msgName" style="color: #29c78c; padding-left: 5px;">' + curName + ": " + '</a>\
                        </div>\
                        <span class="msgContent" style="color: #ffffff;">' + curMessage + '</span>\
                    </div>'
                );
            }
    
            if (counter == messageArray.length) {
                scrollChatBox(); 
            }
        }
   }
    
})

$(document).ready(function() {
    $(".navbar-burger").click(function() {
        $(".navbar-burger").toggleClass("is-active");
        $(".navbar-menu").toggleClass("is-active");
    });
  });

socket.on('liveItems', function(vgoArray) {
    if ( $('.liveItemsContainer').children().length == 0 ) {
        for (i = 0; i < vgoArray.length; i++) {
            var vgoAvatar = vgoArray[i].avatar;
            var vgoName = vgoArray[i].name;
            var vgoId = vgoArray[i].id;
            var vgoColor = vgoArray[i].color;
            var vgoImage = vgoArray[i].image;
            var vgoPrice = vgoArray[i].price;
            var vgoUserName = vgoArray[i].userName;
            var offset = ((i * 160) + 0);

            if (vgoName.indexOf("Factory") > -1) {
                var vgoCondition = "FN";
            }
            if (vgoName.indexOf("Minimal") > -1) {
                var vgoCondition = "MW";
            }
            if (vgoName.indexOf("Field-Tested") > -1) {
                var vgoCondition = "FT";
            }
            if (vgoName.indexOf("Well-Worn") > -1) {
                var vgoCondition = "WW";
            }
            if (vgoName.indexOf("Battle-Scarred") > -1) {
                var vgoCondition = "BS";
            }
            
            $('.liveItemsContainer').append(
                '<div class="liveVGOitems" style="top: ' + offset +  ' ;border-left: 1px solid ' + vgoColor + ';border-right: 1px solid ' + vgoColor + ';">\
                    <div class="itemFilter"> </div>\
                    <p class="liveItemVGOId">#' + vgoId + '</p>\
                    <p class="liveItemVGOCondition" style="color: ' + vgoColor + '">' + vgoCondition + '</p>\
                    <p class="liveVGOprice"><span style="color: #29c78c;">$</span> ' + vgoPrice + '</p>\
                    <img class="liveVGOimage topImg" src=' + vgoImage + '>\
                    <img class="liveVGOimage bottomImg" src=' + vgoImage + '>\
                    <img class="liveVGOavatar" src=' + vgoAvatar + '>\
                    <p class="liveVGOName">' + vgoUserName + '</p>\
                </div>'
            )
        }
   }
})



function printRollCaseDiv(caseObj) {
    var refinedCaseObj = Object.values(caseObj.response.items);
    var offset = 0;

    for (var j = 0; j < 7; j++) {
        for (i = 0; i < refinedCaseObj.length; i++) {
            if (!refinedCaseObj[i]) {
                continue;
            }
            var curDivID = "parentDiv" + offset;
            var curChildID =  "childImg" + offset;
            var curName = refinedCaseObj[i]["1"].name.split("(")[0];
            var curName = curName.replace(/\s/g,"")
            var vgoImage = refinedCaseObj[i]["1"].image["300px"];
            var px = offset;
            offset = offset + 160;
            $('.rollContainer').append(
                '<div id=' + curDivID + ";" + curName + ' class="rollDivItem" style="left:' + px + 'px">\
                    <img id=' + curChildID + ";" + curName + ' class="rollDivItemImage" src=' + vgoImage + '>\
                </div>'
            )
        }
    }
    
}

socket.on('apiDown', function() {
    setTimeout(function() {
        M.toast({html: "VGO Api is down, try again"})
    }, 5000);
})

socket.on('sendAcceptedNotification', function() {
    M.toast({html: "Trade accepted, unbox is processing shortly..."})
})

function callRollAnimation(winningName, caseId) {
    var existingOffset = $('.rollContainer').css("transform");
    var winName = winningName;
    var winName = winName.split("(")[0]
    var winName = winName.replace(/\s/g,"")
    console.log("item name");
    console.log(winName);
    var offsetArray = getWinningNamePosition(winName, caseId);
    console.log(offsetArray);
    
    var randomIndexArray = [2, 3, 4, 5];
    var randomIndexOffset = randomIndexArray[Math.floor(Math.random()*randomIndexArray.length)];
    var randomOffset = offsetArray[randomIndexOffset];
    console.log("random offset chosen: " + randomOffset);

    randomOffset -= $(".rollDiv").width() / 2;
    randomOffset += Math.random() * 150;

    if (existingOffset == randomOffset) {
        callRollAnimation(winningName, caseId);
    } else {
        console.log("final roll div offset: " + randomOffset);
        $('.rollContainer').css("transform","translate(-" + randomOffset + "px)");
    }
}

function getWinningNamePosition(winningName, caseId) {
    var matchingOffsets = [];
    var curCaseLength = ("case" + caseId + "SKU").length;
    var numItems = $('.rollDivItem').length - curCaseLength;
    var curNumID = i * 150;
    $('.rollDivItem').each(function() {
        var curID = $(this).attr('id');
        var curName = curID.split(";")[1];
        var curOffset = $(this).css("left").replace("px", "");
        if (winningName == curName) {
            matchingOffsets.push(Number(curOffset));
        }
    });
    return matchingOffsets;
}
obj11 = {
    name: "Karambit | Cyberium",
    image: "https://files.opskins.media/file/vgo-img/item/karambit-cyberium-factory-new-300.png",
    suggested_price: "2543159",
    color: "#FFD700",
    wear: "0.0124428",
}

$(document).ready(function(){
    $('.modal').modal();
  });

//   printVGOItems(obj11);
//   printVGOItems(obj11);
//   printVGOItems(obj11);
//   printVGOItems(obj11);
//   printVGOItems(obj11);
//   printVGOItems(obj11);
//   printVGOItems(obj11);
//   printVGOItems(obj11);
//   printVGOItems(obj11);
//   printVGOItems(obj11);

function formatShowcase() {
    $('#displayShowcase').css('display', 'inline-block')
}

function printVGOItems(obj) {
    console.log(obj);
    formatShowcase();
    var vgoName = obj.name;
    var vgoImage = obj.image["300px"];
    var vgoPrice = obj.suggested_price/100;
    var vgoColor = obj.color;
    var vgoWear = obj.wear;

    $('.openedItemShowcase').append(
        '<div class="openedVGOItem">\
            <p class="vgoOpenedItemsText" style=color:' + vgoColor + '>' + vgoName + '</p>\
            <p class="vgoOpenedItemsPrice">' + "$ " + vgoPrice + '</p>\
            <img class="vgoOpenedItemsPicture" src=' + vgoImage + '>\
            <p class="vgoWear"> Item Wear:' + " " + '<span style=font-family: "stellar">' + vgoWear + '</span></p>\
        </div>'
    )

}


function updateLiveFeed(vgoObj) {
    var userName = vgoObj.userName;
    var vgoId = vgoObj.id;
    var vgoName = vgoObj.name;
    var userAvatar = vgoObj.avatar;
    var vgoImage = vgoObj.image;
    var vgoColor = vgoObj.color;
    var vgoPrice = vgoObj.price;

    if (vgoName.indexOf("Factory") > -1) {
        var vgoCondition = "FN";
    }
    if (vgoName.indexOf("Minimal") > -1) {
        var vgoCondition = "MW";
    }
    if (vgoName.indexOf("Field-Tested") > -1) {
        var vgoCondition = "FT";
    }
    if (vgoName.indexOf("Well-Worn") > -1) {
        var vgoCondition = "WW";
    }
    if (vgoName.indexOf("Battle-Scarred") > -1) {
        var vgoCondition = "BS";
    }

    $('.liveItemsContainer').prepend(
        '<div id="vgoitem" class="liveVGOitems" style="top: -160px;border-left: 1px solid ' + vgoColor + ';border-right: 1px solid ' + vgoColor + ';">\
            <div class="itemFilter"> </div>\
            <p class="liveItemVGOId">#' + vgoId + '</p>\
            <p class="liveItemVGOCondition" style="color: ' + vgoColor + '">' + vgoCondition + '</p>\
            <p class="liveVGOprice"> <span style="color: #29c78c"> $ </span> ' + vgoPrice + '</p>\
            <img class="liveVGOimage topImg" src=' + vgoImage + '>\
            <img class="liveVGOimage bottomImg" src=' + vgoImage + '>\
            <img class="liveVGOavatar" src=' + userAvatar + '>\
            <p class="liveVGOName">' + userName + '</p>\
        </div>'
    );

    $('.liveVGOitems').each(function() {
        $(this).css("top", "+=160px")
    });

    $('.liveVGOitems').last().remove();
}
		

socket.on('sendCase1', function(case1obj) {
    case1 = case1obj;

    if (window.location.pathname == '/case-1') {
        printCaseItems(case1, case1SKU);
        printRollCaseDiv(case1);
    }
})

socket.on('sendCase2', function(case2obj) {
    case2 = case2obj;

    if (window.location.pathname == '/case-2') {
        printCaseItems(case2, case2SKU);
        printRollCaseDiv(case2);
    }
})

socket.on('sendCase3', function(case3obj) {
    case3 = case3obj;

    if (window.location.pathname == '/case-3') {
        printCaseItems(case3, case3SKU);
        printRollCaseDiv(case3);
    }
})

socket.on('sendCase4', function(case4obj) {
    case4 = case4obj;

    if (window.location.pathname == '/case-4') {
        printCaseItems(case4, case4SKU);
        printRollCaseDiv(case4);
    }
})

socket.on('noUserInv', function(body) {
    $('.pageContainer').css('height', '100%');
    $('#inventoryHeader').empty();
    $('#inventoryHeader').append("You do not have an account on OPskins, please register one");
})

if (['/case-1', '/case-2', '/case-3', '/case-4'].indexOf(window.location.pathname) > -1) {
    $('.twitterIcon').css('bottom', '3px');
    $('.twitterIcon').css('position', 'relative');
}

if (window.location.pathname == '/inventory') {
    $('.twitterNavBarText').css('bottom', '0');
    $('#socketConnectionHeader').css('bottom', '0');
    $('#socketConnectionItem').css('bottom', '0');
    $('.chatUI').css('bottom', '8px');
    $('.chatInput').css('margin-bottom', '0px');
    socket.emit('getSteamId');
    socket.on('emitSteamId', function(steamid) {
        if (steamid == undefined) {
            $('#accHeader').text("Login to view your ExpressTrade Inventory");
        } else {
            socket.emit('getInv');
        }
    });
} 

if (window.location.pathname == '/account') {
    $('.twitterNavBarText').css('bottom', '0');
    $('#socketConnectionHeader').css('bottom', '0');
    $('#socketConnectionItem').css('bottom', '0');
    $('.chatUI').css('bottom', '8px');
    $('.chatInput').css('margin-bottom', '0px');
    socket.emit('getSteamId');
    socket.on('emitSteamId', function(steamid) {
        socket.emit('getUnboxedCases', steamid);
        socket.on('sendUserUnboxedItems', function(itemArray) {
            accInv = itemArray;
            itemArray = itemArray.sort(function(a, b) {
                return a.id - b.id;
            });
            if (itemArray.length == 0) {
                $('.accountTitleText').text("It seems you haven't unboxed any VGO cases on our site, lets change that and display your rewards here!");
                return;
            }
            if (itemArray.length > 0) {
                var count = $(".accShowcaseContainer").children().length;
                if (count == 0) {


                    var counter = 0;
                    var totalPrice = 0;
                    var highestPrice = 0;
                    for (i = 0; i < itemArray.length; i++) {
                        vgoName = itemArray[i].name;
                        vgoWear = itemArray[i].wear;
                        vgoImage = itemArray[i].image;
                        vgoColor = itemArray[i].color;
                        vgoPrice = itemArray[i].price;
                        vgoId = itemArray[i].id;
                        vgoWear = itemArray[i].wear;
        
                        counter = counter + 1;
                        totalPrice = totalPrice + vgoPrice;
                        if (vgoPrice > highestPrice) {
                            highestPrice = vgoPrice;
                        }
                        $('.accShowcaseContainer').append(
                            '<div class="vgoitem">\
                                <p class="vgoItemText" style=color:' + vgoColor + '>' + vgoName + '</p>\
                                <img class="vgoItemsPictures topVgoInvImage" src=' +  vgoImage + '/>\
                                <img class="vgoItemsPictures bottomVgoInvImage" src=' +  vgoImage + '/>\
                                <p class="vgoInvItemPrice"> <span style="color: #29c78c">$</span>' + " " + (vgoPrice) + '  </p>\
                                <p class="vgoInvItemFloat">Float: ' + vgoWear + '</p>\
                                <p class="vgoInvItemId">Item ID: ' + vgoId + '</p>\
                            </div>'
                        )
                        $('#statsCaseOpened').text(counter);
                        $('#statsTotalPrice').text("$ " + Math.round(totalPrice * 100) / 100);
                        $('#statsHighestPrice').text("$ " + highestPrice);
                        var totalCost = (counter * 2.5);
                        var profit = (Math.round((totalPrice - totalCost) * 100)) / 100;
                        $('#statsProfit').text("$ " + (profit));
                    }
                }
            }
        })
    });
} 

$('.dropdown-trigger').dropdown();

$('#invSortOldToNew').on('click', function() {
    $('.vgoContainer').empty();
    userInv = userInv.sort(function(a, b) {
        return a.id - b.id;
    });
    
    for (i = 0; i < userInv.length; i++) {
        $('.vgoContainer').append(
            '<div class="vgoitem">\
                <p class="vgoItemText" style=color:' + userInv[i].color + '>' + userInv[i].name + '</p>\
                <img class="vgoItemsPictures topVgoInvImage" src=' +  userInv[i].image["300px"] + '/>\
                <img class="vgoItemsPictures bottomVgoInvImage" src=' +  userInv[i].image["300px"] + '/>\
                <p class="vgoInvItemPrice"> <span style="color: #29c78c">$</span>' + " " + userInv[i].suggested_price/100 + '  </p>\
                <p class="vgoInvItemFloat">Float: ' + userInv[i].wear + '</p>\
                <p class="vgoInvItemId">Item ID: ' + userInv[i].id + '</p>\
            </div>'
        )
    }

})

$('#invSortNewToOld').on('click', function() {
    $('.vgoContainer').empty();
    userInv = userInv.sort(function(a, b) {
        return b.id - a.id;
    });
    
    for (i = 0; i < userInv.length; i++) {
        $('.vgoContainer').append(
            '<div class="vgoitem">\
                <p class="vgoItemText" style=color:' + userInv[i].color + '>' + userInv[i].name + '</p>\
                <img class="vgoItemsPictures topVgoInvImage" src=' +  userInv[i].image["300px"] + '/>\
                <img class="vgoItemsPictures bottomVgoInvImage" src=' +  userInv[i].image["300px"] + '/>\
                <p class="vgoInvItemPrice"> <span style="color: #29c78c">$</span>' + " " + userInv[i].suggested_price/100 + '  </p>\
                <p class="vgoInvItemFloat">Float: ' + userInv[i].wear + '</p>\
                <p class="vgoInvItemId">Item ID: ' + userInv[i].id + '</p>\
            </div>'
        )
    }

})

$('#invSortHighToLow').on('click', function() {
    $('.vgoContainer').empty();
    userInv = userInv.sort(function(a, b) {
        return b.suggested_price - a.suggested_price;
    });
    
    for (i = 0; i < userInv.length; i++) {
        $('.vgoContainer').append(
            '<div class="vgoitem">\
                <p class="vgoItemText" style=color:' + userInv[i].color + '>' + userInv[i].name + '</p>\
                <img class="vgoItemsPictures topVgoInvImage" src=' +  userInv[i].image["300px"] + '/>\
                <img class="vgoItemsPictures bottomVgoInvImage" src=' +  userInv[i].image["300px"] + '/>\
                <p class="vgoInvItemPrice"> <span style="color: #29c78c">$</span>' + " " + userInv[i].suggested_price/100 + '  </p>\
                <p class="vgoInvItemFloat">Float: ' + userInv[i].wear + '</p>\
                <p class="vgoInvItemId">Item ID: ' + userInv[i].id + '</p>\
            </div>'
        )
    }

})

$('#invSortLowToHigh').on('click', function() {
    $('.vgoContainer').empty();
    userInv = userInv.sort(function(a, b) {
        return a.suggested_price - b.suggested_price;
    });
    
    for (i = 0; i < userInv.length; i++) {
        $('.vgoContainer').append(
            '<div class="vgoitem">\
                <p class="vgoItemText" style=color:' + userInv[i].color + '>' + userInv[i].name + '</p>\
                <img class="vgoItemsPictures topVgoInvImage" src=' +  userInv[i].image["300px"] + '/>\
                <img class="vgoItemsPictures bottomVgoInvImage" src=' +  userInv[i].image["300px"] + '/>\
                <p class="vgoInvItemPrice"> <span style="color: #29c78c">$</span>' + " " + userInv[i].suggested_price/100 + '  </p>\
                <p class="vgoInvItemFloat">Float: ' + userInv[i].wear + '</p>\
                <p class="vgoInvItemId">Item ID: ' + userInv[i].id + '</p>\
            </div>'
        )
    }

})

$('#accSortOldToNew').on('click', function() {
    $('.accShowcaseContainer').empty();
    accInv = accInv.sort(function(a, b) {
        return a.id - b.id;
    });
    
    for (i = 0; i < accInv.length; i++) {
        $('.accShowcaseContainer').append(
            '<div class="vgoitem">\
                <p class="vgoItemText" style=color:' + accInv[i].color + '>' + accInv[i].name + '</p>\
                <img class="vgoItemsPictures topVgoInvImage" src=' +  accInv[i].image + '/>\
                <img class="vgoItemsPictures bottomVgoInvImage" src=' +  accInv[i].image + '/>\
                <p class="vgoInvItemPrice"> <span style="color: #29c78c">$</span>' + " " + accInv[i].price + '  </p>\
                <p class="vgoInvItemFloat">Float: ' + accInv[i].wear + '</p>\
                <p class="vgoInvItemId">Item ID: ' + accInv[i].id + '</p>\
            </div>'
        )
    }

})

$('#accSortNewToOld').on('click', function() {
    $('.accShowcaseContainer').empty();
    accInv = accInv.sort(function(a, b) {
        return b.id - a.id;
    });
    
    for (i = 0; i < accInv.length; i++) {
        $('.accShowcaseContainer').append(
            '<div class="vgoitem">\
                <p class="vgoItemText" style=color:' + accInv[i].color + '>' + accInv[i].name + '</p>\
                <img class="vgoItemsPictures topVgoInvImage" src=' +  accInv[i].image + '/>\
                <img class="vgoItemsPictures bottomVgoInvImage" src=' +  accInv[i].image + '/>\
                <p class="vgoInvItemPrice"> <span style="color: #29c78c">$</span>' + " " + accInv[i].price + '  </p>\
                <p class="vgoInvItemFloat">Float: ' + accInv[i].wear + '</p>\
                <p class="vgoInvItemId">Item ID: ' + accInv[i].id + '</p>\
            </div>'
        )
    }

})

$('#accSortHighToLow').on('click', function() {
    $('.accShowcaseContainer').empty();
    accInv = accInv.sort(function(a, b) {
        return b.price - a.price;
    });
    
    for (i = 0; i < accInv.length; i++) {
        $('.accShowcaseContainer').append(
            '<div class="vgoitem">\
                <p class="vgoItemText" style=color:' + accInv[i].color + '>' + accInv[i].name + '</p>\
                <img class="vgoItemsPictures topVgoInvImage" src=' +  accInv[i].image + '/>\
                <img class="vgoItemsPictures bottomVgoInvImage" src=' +  accInv[i].image + '/>\
                <p class="vgoInvItemPrice"> <span style="color: #29c78c">$</span>' + " " + accInv[i].price + '  </p>\
                <p class="vgoInvItemFloat">Float: ' + accInv[i].wear + '</p>\
                <p class="vgoInvItemId">Item ID: ' + accInv[i].id + '</p>\
            </div>'
        )
    }

})

$('#accSortLowToHigh').on('click', function() {
    $('.accShowcaseContainer').empty();
    accInv = accInv.sort(function(a, b) {
        return a.price - b.price;
    });
    
    for (i = 0; i < accInv.length; i++) {
        $('.accShowcaseContainer').append(
            '<div class="vgoitem">\
                <p class="vgoItemText" style=color:' + accInv[i].color + '>' + accInv[i].name + '</p>\
                <img class="vgoItemsPictures topVgoInvImage" src=' +  accInv[i].image + '/>\
                <img class="vgoItemsPictures bottomVgoInvImage" src=' +  accInv[i].image + '/>\
                <p class="vgoInvItemPrice"> <span style="color: #29c78c">$</span>' + " " + accInv[i].price + '  </p>\
                <p class="vgoInvItemFloat">Float: ' + accInv[i].wear + '</p>\
                <p class="vgoInvItemId">Item ID: ' + accInv[i].id + '</p>\
            </div>'
        )
    }

})






socket.on('keyCount', function(keyObj){
    var userKeys = keyObj.response.key_count;
    console.log(keyObj);
    console.log("keycount")
    $('#keyContainer').remove();
    $('#signbutton').before(
        '<a id="keyContainer" class="navbar-item draw-bottom keyContainer" target="_blank" href="https://opskins.com/?loc=shop_search&app=1912_1&search_item=key&sort=lh">\
            <div class="field is-grouped">\
                <div class="keyDiv">\
                    <img class="navKeysImage" src="drawables/keyicon.png">\
                    <p class="navKeysText" style="padding-right: 25px">' + userKeys + '</p> \
                    <span class="buyMoreKeys">\
                        +\
                    </span>\
                </div>\
             </div> \
         </a>'
    );
})




$('#caseopen1button').on('click', function(){

    // callRollAnimation("Karambit|Toucan", "1");

    var caseKeyCount = $('.caseInput').val();
    var caseNo = "1";
    var actualKeys = $(".navKeysText").text();

    if (caseKeyCount == "") {
        M.toast({html: "You haven't entered an amount of cases you want to open"})
        
    } else 

    if (actualKeys >= caseKeyCount) {
        socket.emit('keyOpen', caseKeyCount, caseNo);
    } else {
        M.toast({html: "You do not have sufficient keys in your ExpressTrade Inventory to open these cases, please add more"})
        
    }
    
})

$('#caseopen2button').on('click', function(){
    var caseKeyCount = $('.caseInput').val();
    var caseNo = "2";
    var actualKeys = $(".navKeysText").text();

    if (caseKeyCount == "") {
        M.toast({html: "You haven't entered an amount of cases you want to open"})
    } else 

    if (actualKeys >= caseKeyCount) {
        socket.emit('keyOpen', caseKeyCount, caseNo);
    } else {
        M.toast({html: "You do not have sufficient keys in your ExpressTrade Inventory to open these cases, please add more"})
    }
    
})

$('#caseopen3button').on('click', function(){
    
    var caseKeyCount = $('.caseInput').val();
    var caseNo = "3";
    var actualKeys = $(".navKeysText").text();


    if (caseKeyCount == "") {
        M.toast({html: "You haven't entered an amount of cases you want to open"})
    } 

    if (actualKeys >= caseKeyCount) {
        socket.emit('keyOpen', caseKeyCount, caseNo);
    } else {
        M.toast({html: "You do not have sufficient keys in your ExpressTrade Inventory to open these cases, please add more"})
    }

    
})

$('#caseopen4button').on('click', function(){
    var caseKeyCount = $('.caseInput').val();
    var caseNo = "4";
    var actualKeys = $(".navKeysText").text();


    if (caseKeyCount == "") {
        M.toast({html: "You haven't entered an amount of cases you want to open"})
    } 

    if (actualKeys >= caseKeyCount) {
        socket.emit('keyOpen', caseKeyCount, caseNo);
    } else {
        M.toast({html: "You do not have sufficient keys in your ExpressTrade Inventory to open these cases, please add more"})
    }
})

socket.on('caseTrade', function(tradeObj){
    console.log("reached here");
    var tradeOffer = tradeObj.response.offer_url;
    toastr.options.onclick = function() {
        var win = window.open(tradeOffer, '_blank');
        win.focus();
    }
    toastr.info("A trade offer has been sent, or click here to open the trade offer <br>" + tradeOffer);
    toastr.options.onclick = null;

})

socket.on('notAccepted', function(){
    console.log("trade not accepted yet");
})

socket.on('offerCancelled', function(){
    toastr.error("We're sorry, the offer has been cancelled, if you wish to open another case, try again");
})

socket.on('offerDeclined', function(){
    toastr.error("You have declined the offer");
})

socket.on('caseOpenedObj', function(caseObj){
    var amountOfItems = caseObj.cases.length;
    var curCase = caseObj.cases[0].case_id;
    var counter = 0;
    callCaseOpen();
    function callCaseOpen() {
            $('.rollContainer').css("transition","all 10s cubic-bezier(.15,.85,.08,1)");
            var caseName = caseObj.cases[counter].item.name.split("(")[0];
            caseName = caseName.replace(/\s/g,"");
            callRollAnimation(caseName, curCase);
            var curItemObj = caseObj.cases[counter].item;
            console.log(curItemObj);
            setTimeout(function(){
                printVGOItems(curItemObj, curCase);
            }, 11000)
            counter = counter + 1;
            console.log("rolling/printingitem index: " + counter);
            if (counter < amountOfItems) {
                setTimeout(callCaseOpen, 11000);
            }
    }
    
})

socket.on('printLiveObj', function(vgoObj) {
    updateLiveFeed(vgoObj);
})

socket.on('sendLevel', function(accLevel) {
    myLevel = Number(accLevel);
    var levelString = String(("Level "));
    var levelContent = String(myLevel);
    $('.accountLevel').remove();
    $('.navbar-end ').prepend(
        '<a class="navbar-item accountLevel">\
            <p class="userLvl">' + levelString + '<span style="color: #2ac78b">' + levelContent + '</span></p>\
        </a>'
    )
});

socket.on('updateLevel', function() {
    myLevel = myLevel + 1;

    var levelString = String(("Level "));
    var levelContent = String(myLevel);
    $('.accountLevel').remove();
    $('.navbar-end ').prepend(
        '<a class="navbar-item accountLevel">\
            <p class="userLvl">' + levelString + '<span style="color: #2ac78b">' + levelContent + '</span></p>\
        </a>'
    )
})



socket.on('data', function(profile) {
    userProfile = profile;
    console.log(userProfile);
    userLoggedIn = "true";
    checkAffiliates(profile);
    console.log("user is logged in?");
    console.log(userLoggedIn);
    $("#sign-button").attr("href", "/logout");
    $("#sign-button > span:nth-child(2)").text("Sign Out");

    $('#userAvatar').parent().remove();
    $('.divUser').remove();
    $('.avatarSpan').remove();
    userName = profile.displayName;
    userAvatar = profile._json.avatar;
    userId = profile.id;
    socket.emit('updateUserDB', userId);
    appendProfileData(userName, userAvatar);
    socket.emit('getKeys');
    $('.chatUI').css("display", "flex");
    $('.chatUI').prepend(
        '<span class="avatarSpan"> <img class="chatUIAvatar" src=' + userAvatar + '> </span>'
    );

    if (['/inventory', '/account'].indexOf(window.location.pathname) > -1) {
        $('.avatarSpan').css('bottom', '0px');
        $('.sendMessageIcon ').css('bottom', '0px');
        $('.twitterNavBarText ').css('bottom', '20px');
        $('#socketConnectionHeader ').css('bottom', '20px');
        $('#socketConnectionItem ').css('bottom', '20px');
        $('.pageContainer').css('padding-left', '10px');
    }
});

socket.on('sendData', function(steamObj){
    appendUserInventory(steamObj);
    
})

socket.on('sendTopItems', function(topItemsArray) {
    $('.TopItemsContainer').empty();
    console.log("top length");
    console.log(topItemsArray.length);
    if ( $('.TopItemsContainer').children().length == 0 ) {
        for (i = 0; i < topItemsArray.length; i++) {

            var vgoId = topItemsArray[i].id;
            var vgoName = topItemsArray[i].name;

            if (vgoName.indexOf("Factory") > -1) {
                var vgoCondition = "FN";
            }
            if (vgoName.indexOf("Minimal") > -1) {
                var vgoCondition = "MW";
            }
            if (vgoName.indexOf("Field-Tested") > -1) {
                var vgoCondition = "FT";
            }
            if (vgoName.indexOf("Well-Worn") > -1) {
                var vgoCondition = "WW";
            }
            if (vgoName.indexOf("Battle-Scarred") > -1) {
                var vgoCondition = "BS";
            }

            var vgoColor = topItemsArray[i].color;
            var vgoImage = topItemsArray[i].image;
            var vgoPrice = topItemsArray[i].price/100;
            var vgoUserName = topItemsArray[i].steamName;
            var vgoAvatar = topItemsArray[i].steamAvatar;
            var offset = ((i * 160) + 0);
            
            $('.TopItemsContainer').append(
                '<div class="topVGOItems" style="top: ' + offset +  ' ;border-left: 1px solid  ' + vgoColor + ';border-right: 1px solid ' + vgoColor + ';">\
                    <div class="itemFilter"> </div>\
                    <p class="liveItemVGOId">#' + vgoId + '</p>\
                    <p class="liveItemVGOCondition" style="color: ' + vgoColor + '">' + vgoCondition + '</p>\
                    <p class="liveVGOprice"><span style="color: #29c78c">$</span> ' + vgoPrice + '</p>\
                    <img class="liveVGOimage topImg" src=' + vgoImage + '>\
                    <img class="liveVGOimage bottomImg" src=' + vgoImage + '>\
                    <img class="liveVGOavatar" src=' + vgoAvatar + '>\
                    <p class="liveVGOName">' + vgoUserName + '</p>\
                </div>'
            )
        }
   }
console.log(topItemsArray);
})

function appendUserInventory(itemsObj) {
    if (itemsObj.length == 0) {
        $('.pageContainer').css('height', '100%');
        $('#accHeader').text("You have no items in your inventory, start opening some cases!");
        console.log("no items");
    }
    if (itemsObj.length > 0) {
        userInv = itemsObj;
        var totalInvValue = 0;
        var counter = 0;
        sortedArray = itemsObj.sort(function(a, b) {
            return b.suggested_price - a.suggested_price;
        });
        for (i = 0; i < sortedArray.length; i++){
            var totalInvValue = totalInvValue + itemsObj[i].suggested_price/100;
            var counter = counter + 1;

            $('#accHeader').text("Your Express Trade Inventory");
            $('.vgoContainer').append(
                '<div class="vgoitem">\
                    <p class="vgoItemText" style=color:' + itemsObj[i].color + '>' + itemsObj[i].name + '</p>\
                    <img class="vgoItemsPictures topVgoInvImage" src=' +  itemsObj[i].image['300px'] + '/>\
                    <img class="vgoItemsPictures bottomVgoInvImage" src=' +  itemsObj[i].image['300px'] + '/>\
                    <p class="vgoInvItemPrice"> <span style="color: #29c78c">$</span>' + " " + (itemsObj[i].suggested_price/100) + '  </p>\
                    <p class="vgoInvItemFloat">Float: ' + itemsObj[i].wear + '</p>\
                    <p class="vgoInvItemId">Item ID: ' + itemsObj[i].id + '</p>\
                </div>'
            )

            if (counter == itemsObj.length) {
                var value = Math.round(totalInvValue * 100)
                $('.userInvValue').text("Inventory Value: $" + value/100);
            }


        }
    }
}


$('#signInButton').on('click', function(){
    location.href = "/auth/steam";
})


function appendProfileData(userName, userAvatar) {
    $('.userIdDiv').remove();
    $('.navbar-end').prepend(
        '<div class="navbar-item has-dropdown is-hoverable userIdDiv">\
            <a class="navbar-link divUser">' + userName + '</a>\
            <div class="navbar-dropdown is-boxed userDropDown">\
                <a class="navbar-item userDropDown" href="https://www.vgoupgrade.com/account"> Account </a>\
             </div>\
        </div>'
    );
    $('.navbar-end').prepend(
        '<a class="navbar-item userProfilePicture">\
            <img id="userAvatar" src=' + userAvatar + '>\
        </a>'
    );
}

$('.case-opening').on('click', function(){
    window.location.replace('https://www.vgoupgrade.com');
})

$('.inventory').on('click', function(){
    window.location.replace('https://www.vgoupgrade.com/inventory');
})

$('.mainLogo').on('click', function(){
    window.location.replace('https://www.vgoupgrade.com/');
})

$('#case1button').on('click', function(){
    window.location.replace('https://www.vgoupgrade.com/case-1');
})

$('#case2button').on('click', function(){
    window.location.replace('https://www.vgoupgrade.com/case-2');
})

$('#case3button').on('click', function(){
    window.location.replace('https://www.vgoupgrade.com/case-3');
})

$('#case4button').on('click', function(){
    window.location.replace('https://www.vgoupgrade.com/case-4');
})

$('.affiliates').on('click', function(){
    window.location.replace('https://www.vgoupgrade.com/affiliates');
})

$('.profileDiv').append(
    '<span class="affiliatesNotLoggedIn"> You are not logged in, login to view the affiliates page </span>'
)
$('.affiliatesContent').css('display', 'none')

function checkAffiliates(profile) {
    console.log(profile);
    if (window.location.pathname == "/affiliates") {
        if (userLoggedIn == "true") {
            $('.affiliatesNotLoggedIn').remove();
            $('.affiliatesContent').css('display', 'block')
            $('.displayAffiliates').remove();
            $('.affiliatesContainer').prepend(
                '<a class="waves-effect waves-light btn modal-trigger displayAffiliates" href="#modal2">\
                    <span class="icon affiliateButtonIcon">\
                        <img src="drawables/settings.png">\
                    </span>\
                    <span> Configure Affiliates </span> \
                </a>'
            )
            $('.profileDiv').empty();

            $('.profileDiv').append(
                '<p class="affiliatesUserName">' + profile.displayName + '</p>\
                <img class="affiliatesUserImage" src="' + profile._json.avatarfull + '">'
            )

            socket.emit("getRefCode", userProfile.id);
            socket.emit("checkRefCodeRedeemed", userProfile.id);
        }
     }
}

socket.on('sendRefCodeRedeemCheck', function(refCode) {
    console.log(refCode);
    $('.displayRefCodeUsed').empty();
    $('.displayRefCodeUsed').append(
        '<p class="refCodeUsedHeader"> You have used this code: </p>\
        <p class="refCodeUsedContent">' + refCode.refCodeRedeemed + '</p>'
    )
})

$('#affInfo').on('click', function() {
    $('.affiliatesContent').css('display', 'block');
    $('.affRedeemedUsersContaienr').css('display', 'none');
})

$('#affAcc').on('click', function() {
    $('.affiliatesContent').css('display', 'none');
    $('.affRedeemedUsersContaienr').css('display', 'block');
    socket.emit("getUsersOnRef", userProfile);
    socket.emit("getRefCode", userProfile.id);
})


$(function(){
    if (window.location.pathname == "/affiliates") {
        new Clipboard('.shareLinkIcon');
    }
});

$('.shareLinkIcon').on('click', function() {
    $('.shareLinkContent').focus();
	$('.shareLinkContent').select();
	document.execCommand('copy');
})

$(document).ready(function(){
    $('.tooltipped').tooltip();
  });

socket.on("sendRefCode", function(refCode) {
    $('.shareLink').empty();
    refCode = refCode.toUpperCase();
    $('.refCodeContent').text(refCode);
    var shareLinkURL = "https://vgoupgrade.com?ref=" + refCode;
    $('.shareLink').append(
        '<p class="shareLinkHeader"> Share your link: </p>\
        <input type="text" value="' + shareLinkURL + '" class="input shareLinkContent">\
        <img class="icon shareLinkIcon" src="drawables/sharelink.png" data-clipboard-target = ".shareLinkContent">'
    )
})

socket.on("sendEmptyRefList", function() {
    console.log("EMPTY REFLIST");
    $('#usersOnRefList').empty();
    $('#usersOnRefList').append(
        '<p class="affNoRefsText"> No one has used your code, lets change that! Start referring friends to get back <span class="affHighlightedText">$0.25 </span> on every case they open! <br><span class="affHighlightedText"> $0.25 </span>\
        back per case opened by either you or anyone who has used your referral</p>'
    )
})

socket.on("sendNoRefCreated", function() {
    console.log("NO REF CREATED")
    $('#usersOnRefList').empty();
    $('#usersOnRefList').append(
        '<p class="affNoRefsText"> You have not created a referral code yet! Lets change that! Create a code by clicking the button at the top of the page and start referring friends to get back <span class="affHighlightedText">$0.25 </span> on every case they open! <br> With "vgoupgrade.com" in your name\
        a combined <span class="affHighlightedText"> $0.25 </span> back per case opened by either you or anyone who has used your referral</p>'
    )
})

socket.on('sendRefList', function(refList) {
    console.log(typeof refList);
    console.log(refList)
    console.log("REFLIST ABOVE");
    $('#usersOnRefList').empty();
    refList = refList.sort(function(a, b) {
        return b.casesOnRef - a.casesOnRef;
    });
    var totalCasesOpened = 0;
    var counter = 0;
    for (i = 0; i < refList.length; i++) {
        $('#usersOnRefList').append(
            '<div class="affUserObject">\
                <div class="affUserProfile">\
                    <img class="affObjAvatar" src="' + refList[i].avatar + '">\
                    <p class="affObjName">' + refList[i].name + '</p>\
                </div>\
                <p class="casesOpenedOnRef">' + refList[i].casesOnRef + '</p>\
            </div>'
        );

        counter = counter + 1;
        totalCasesOpened = totalCasesOpened + refList[i].casesOnRef;

        if (counter == refList.length) {
            $('.refProfitContent').empty();
            $('.refProfitContent').append(totalCasesOpened);
        }
    }
})

socket.on('sendEmptyRefList', function() {
    $('.refProfitContent').empty();
    $('.refProfitContent').append("0");
})

socket.on("badstatus", function(statuscode) {
    M.toast({html: "Bad Status Code: " + statuscode + ". Sorry about this problem."});
})

$('.setWaxId').on('click', function() {
    var waxId = Number($('#waxId').val());
    var steamid = userProfile.id;
    console.log(steamid);
    if (waxId) {
        socket.emit("sendingWaxId", waxId, steamid);
    }
})

$('.setReferral').on('click', function() {
    var refCode = $('#setReferral').val();
    var steamid = userProfile.id;
    var steamAvatar = userProfile._json.avatar;
    var steamName = userProfile.displayName;
    socket.emit("createRefCode", refCode, steamid, steamName, steamAvatar)
})

$('.redeemRef').on('click', function() {
    var refCode = $('#redeemReferral').val();
    var steamid = userProfile.id;
    var steamAvatar = userProfile._json.avatar;
    var steamName = userProfile.displayName;
    socket.emit("redeemRefCode", refCode, steamid, steamAvatar, steamName)
})


socket.on('waxIdSet', function() {
    M.toast({html: "WaxId has been set!"})
})

socket.on('refCodeSet', function() {
    M.toast({html: "Referral code has been created!"})
})

socket.on('refCodeAlreadySet', function() {
    M.toast({html: "You have already created a referral code, therefore you can not create anymore!"})
})

socket.on('refCodeExistsAlready', function() {
    M.toast({html: "Someone has already used this referral code, please use another one!"})
})

socket.on("invalidRefCodeWithSpaces", function() {
    M.toast({html: "Referral codes can not include spaces! Please create another referral code!"})
})

socket.on('refCodeRedeemSet', function() {
    M.toast({html: "Referral code has been used!"})
    setTimeout(function() {
        window.location.replace('https://www.vgoupgrade.com/');
    }, 1500)
})

socket.on('refCodeRedeemAlreadySet', function() {
    M.toast({html: "You have already used a referral code, therefore you can not use anymore!"})
})

socket.on('noRefCodeExists', function() {
    M.toast({html: "This referral code you are trying to redeem does not exist, please redeem an existing referral code!"})
})

$('.lever').on('click', function() {

    var switchVal = $('.switchCheck').prop('checked');
    console.log(switchVal);

    if (switchVal == true) {

        $('.liveItemsContainer').css('display','block');
        $('.topItemsDiv').css('display','none');
        $('.liveItemsContainerHeader').text("Live Unboxings");
        return;
    }
    if (switchVal == false) {

        $('.liveItemsContainer').css('display','none');
        $('.topItemsDiv').css('display','block');
        $('.liveItemsContainerHeader').text("Top Unboxings")
        return;
    }

})






function printCaseItems(caseObj, caseSKU, callback) {
    var sortedObj = [];

    for (i = 0; i < caseSKU.length; i++) {
        var curSKU = caseSKU[i];
        var vgoType = caseObj.response.items[curSKU]["1"].type;
        console.log(vgoType);
        var vgoName = caseObj.response.items[curSKU]["1"].name
        var vgoPic = caseObj.response.items[curSKU]["1"].image["300px"];
        var vgoPrice = caseObj.response.items[curSKU]["1"].suggested_price;
        var vgoColor = caseObj.response.items[curSKU]["1"].color;
        sortedObj.push({
            name: vgoName,
            picture: vgoPic,
            price: vgoPrice,
            color: vgoColor,
            type: vgoType,
        })
    }

    sortedArray = sortedObj.sort(function(a, b) {
        return b.price - a.price;
    });

    appendItems(sortedArray);
} 

function appendItems(array) {
    $('.caseitem').remove();
    $('.caseItemCount').remove();
    $('.itemsInCaseCount').append(
        '<p class="caseItemCount"> <span style="color: #29c78c">' + array.length + '</span>' + " " + 'Items in this case </p>'
    );
    for (i = 0; i < array.length; i++) {
        var vgoName = array[i].name.split("(Factory New)")[0];
        var vgoImage = array[i].picture;
        var vgoPrice = array[i].price/100;
        var vgoColor = array[i].color;

        if (array[i].name.indexOf("Karambit") > -1) {
            var transformType = "transform: rotate(250deg) scaleX(-1);";
            var knifeClass = "karambitPulseObj";
        }
        if (array[i].type != "Knife") {
            var transformType = "transform: rotate(-35deg) scaleX(-1);";
            var knifeClass = "nonKnifePulseObj";
        }
        if (array[i].type == "Knife" && array[i].name.indexOf("Karambit") == -1) {
            var transformType = "transform: rotate(345deg) scaleX(-1);";
            var knifeClass = "knifePulseObj";
        }
        console.log(transformType);

        $('.caseItemsContainer').append(
            '<div class="caseitem ' + knifeClass + '" style="border: 1px groove#1a1e25; background: repeating-radial-gradient( circle at 0 0,' + vgoColor + ', #1a1e25 100% );">\
                <p class="case-item-text">' + vgoName + '</p>\
                <img style="filter: saturate(120%) drop-shadow(3px 3px 2px black);' + transformType + '" class="case-item-picture" src=' + vgoImage + '>\
                <p class="case-item-price"> <span style="color: 29c78c">$</span>' + " " + vgoPrice + '</p>\
            </div>'
        )
    }
}

function readCookie(name) {
    name += '=';
    for (var ca = document.cookie.split(/;\s*/), i = ca.length - 1; i >= 0; i--)
        if (!ca[i].indexOf(name))
            return ca[i].replace(name, '');
}





