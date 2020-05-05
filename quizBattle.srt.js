0
00:00:00,000 --> 00:00:00,999
/* CAUTION : Each sections of subtitle has independent scope. */
doOnce[index] = true;
//
const myApp = {
    state: {
        ButtonCheck : 0, //ボタンチェック待機
        Question    : 1, //問い読み中（早押し可能）
        MyAnswer    : 2, //自分が解答権を所持（解答入力・送信可能）
        OthAnswer   : 3, //他者が解答権を所持（早押し不可能）
        Talk        : 4, //その他（コントロールバー操作可能）
    },
    videoState: {
        Playing : 1,
        Stopped : 2,
    },
    elem: {
        text    : document.createElement("text"),
        ansCol  : document.createElement("textarea"), 
        ansBtn  : document.createElement("button"),
        numOX   : document.createElement("text"),
        pushBtn : document.createElement("img"),
        imgBtn1 : document.createElement("img"),
        imgBtn2 : document.createElement("img"),
        imgBtn3 : document.createElement("img"),
        imgBtn4 : document.createElement("img"),
        sndPush : document.createElement("audio"),
        sndO    : document.createElement("audio"),
        sndX    : document.createElement("audio"),
        br1     : document.createElement("br"),
        br2     : document.createElement("br"),
        br3     : document.createElement("br"),
        br4     : document.createElement("br"),
        br5     : document.createElement("br"),
        subText : document.createElement("text"),
    },
    val: {
        os　　　　　　　　　: null,
        //
        playerWidth      : 0,
        playerHeight     : 0,
        pushBtnWidth     : 0,
        pushBtnHeight    : 0,
        //
        pushBtnArea      : null,
        touchObject      : null,  
        //
        initOrientation  : null,
        imgErrorBool     : false,
        initBtnLoadBool  : false,
        orientAlertBool  : false,
        //
        prevPlayerWidth  : 0,
        prevPlayerHeight : 0,
        prevClientWidth  : 0,
        prevClientHeight : 0,
        //
        numQues     : 0,     //問題番号
        ansArray    : [],    //正答リスト
        cntO        : 0,     //正答数
        cntX        : 0,     //誤答数
        cntPush     : 0,     //1問あたりの解答回数
        limPush     : 5,     //1問あたりの上限解答回数
        correctBool : false, //答え合わせ結果(結果に応じて状態遷移)
        //
        /*  */
        srtFuncArray : null,
        //
        /* push button key (for pc keyboard) */
        btnCode : 32, //Space key
        //
        /* for status management */
        status   : this.state.Talk,
        cntIndex : 0, //index has current section of subtitle
        //
        /* for time management */
        ansTime: {
            limit   : 20000, //[ms]
            elapsed : 0,     //[ms]    
        },
        currTime: {
            playing : 0, //be updated during the video is playing
            stopped : 0, //be updated when the video is stopped
        },
        watchedTime : 0, //
        diffTime    : 0, //difference between watchedTime and currentTime (for preventing to jump playback position by seekbar)
        //
        /* for prevent specific touch action */
        numFingers    : 0,     //for pinch gesture
        firstTapBool  : false, //for double tap gesture
        composingBool : false, //for starting a new line in textarea
    },
};
//
/* set id to focus-usable elements */
myApp.elem.ansCol.id = 'anscol';
myApp.elem.ansBtn.id = 'ansbtn';
// document.getElementsByTagName("body")[0].id = 'body';
//
/* View */
/* test of viewport (pending) */
// let meta_viewport = document.createElement("meta");
// meta_viewport.setAttribute('name', 'viewport');
// meta_viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0');
// document.getElementsByTagName("head")[0].appendChild(meta_viewport);
//
/* add rule of body to style sheet */
document.styleSheets.item(0).insertRule('html {touch-action: manipulation;}'); //disable double tap gesture.
document.styleSheets.item(0).insertRule('body {text-align: center; margin: auto; background: #EFEFEF;}');
//
/* set elements */
document.getElementsByTagName("body")[0].appendChild(myApp.elem.text);
document.getElementsByTagName('body')[0].appendChild(myApp.elem.br1);
document.getElementsByTagName("body")[0].appendChild(myApp.elem.ansCol);
document.getElementsByTagName("body")[0].appendChild(myApp.elem.br2);    
document.getElementsByTagName("body")[0].appendChild(myApp.elem.ansBtn); 
document.getElementsByTagName("body")[0].appendChild(myApp.elem.br3);    
document.getElementsByTagName("body")[0].appendChild(myApp.elem.pushBtn);
document.getElementsByTagName("body")[0].appendChild(myApp.elem.br4);    
document.getElementsByTagName("body")[0].appendChild(myApp.elem.numOX);
document.getElementsByTagName("body")[0].appendChild(myApp.elem.br5); 
document.getElementsByTagName("body")[0].appendChild(myApp.elem.subText);
//
/* add textnodes to the elements */
const node_text    = document.createTextNode("");
const node_subText = document.createTextNode("");　
const node_numOX   = document.createTextNode("");
myApp.elem.text.appendChild(node_text);
myApp.elem.subText.appendChild(node_subText);
myApp.elem.numOX.appendChild(node_numOX);
//
/* set parameters to the elements */
myApp.val.os = fetchOSType();
if (myApp.val.os != 'other'){
    myApp.elem.text.style.fontSize    = '38px';
    myApp.elem.text.style.lineHeight  = '100px';
    myApp.elem.text.style.fontWeight  = 'bold';
    myApp.elem.ansCol.style.width     = '100%';
    myApp.elem.ansCol.style.fontSize  = '35px';
    myApp.elem.ansCol.style.textAlign = 'center';
    myApp.elem.ansBtn.style.fontSize  = '35px';
    myApp.elem.numOX.style.fontSize   = '40px';
    myApp.elem.numOX.style.lineHeight = '50px';
    myApp.elem.numOX.style.fontWeight = 'bold';   
} else {
    myApp.elem.text.style.fontSize    = '30px';
    myApp.elem.text.style.lineHeight  = '90px';
    myApp.elem.text.style.fontWeight  = 'bold';
    myApp.elem.ansCol.style.fontSize  = '25px';
    myApp.elem.ansCol.style.textAlign = 'center';
    myApp.elem.ansBtn.style.fontSize  = '25px';
    myApp.elem.numOX.style.fontSize   = '25px';
    myApp.elem.numOX.style.lineHeight = '35px';
    myApp.elem.numOX.style.fontWeight = 'bold';
}
//
/* test of playsinline for iOS (didn't work correctly. pending) */
// player.loadVideoByUrl({
//     mediaContentUrl:'https://www.youtube.com/v/gUcJ_27A6mU?playsinline=1'
// });
//
/* error handling for loading image */
myApp.elem.imgBtn1.onerror = function(){ myApp.val.imgErrorBool = true; };
myApp.elem.imgBtn2.onerror = function(){ myApp.val.imgErrorBool = true; };
myApp.elem.imgBtn3.onerror = function(){ myApp.val.imgErrorBool = true; };
myApp.elem.imgBtn4.onerror = function(){ myApp.val.imgErrorBool = true; };
myApp.elem.pushBtn.onerror = function(){ alert("画像の読み込みに失敗しました。ページを再読み込みしてください。"); }
//
/* change player and push button size after loading or changing orientation */
// initial resize
myApp.elem.pushBtn.onload = function(){
    if(myApp.val.imgErrorBool == false && myApp.val.initBtnLoadBool == false){
        resizePlayer();
        resizePushButton();
        myApp.val.initBtnLoadBool = true;
    }else if(myApp.val.imgErrorBool == true){
        alert("画像の読み込みに失敗しました。ページを再読み込みしてください。");
    }
}
// resize when the orientation is changed
window.addEventListener('orientationchange', function(){
    setTimeout(function(){
        resizePlayer();
        resizePushButton();
        if(Math.abs(window.orientation) != 90){
            if(myApp.val.status == myApp.state.MyAnswer){
                myApp.elem.pushBtn.src = myApp.elem.imgBtn3.src;
            }else{
                myApp.elem.pushBtn.src = myApp.elem.imgBtn1.src;
            }
        }else{
            myApp.elem.pushBtn.src = myApp.elem.imgBtn4.src;
            if(myApp.val.orientAlertBool == false && myApp.val.initOrientation == 'portrait'){
                alert("このサイトはスマートフォン・タブレットを縦向きにしてお楽しみください。");
                myApp.val.orientAlertBool = true;
            }
        }
        if(myApp.val.status == myApp.state.ButtonCheck && myApp.val.initOrientation == 'landscape'){
            if(Math.abs(window.orientation) != 90){
                myApp.elem.text.innerHTML = "下の早押しボタンをタップして動画を開始";
            }else{
                myApp.elem.text.innerHTML = "スマホ/タブレットを縦向きにしてクイズをはじめる";
            }
        }
    }, 500);
});
//
/* load image of push button */
myApp.elem.imgBtn1.src = "https://github.com/t-yokota/quizBattle/raw/devel/convertToES6/figures/button_portrait_1.png";
myApp.elem.imgBtn2.src = "https://github.com/t-yokota/quizBattle/raw/devel/convertToES6/figures/button_portrait_2.png";
myApp.elem.imgBtn3.src = "https://github.com/t-yokota/quizBattle/raw/devel/convertToES6/figures/button_portrait_3.png";
myApp.elem.imgBtn4.src = "https://github.com/t-yokota/quizBattle/raw/devel/convertToES6/figures/button_portrait_4.png";
//
/* load audio data */
myApp.elem.sndPush.src = "https://raw.githubusercontent.com/t-yokota/quizBattle/master/sounds/push.mp3";
myApp.elem.sndO.src    = "https://raw.githubusercontent.com/t-yokota/quizBattle/master/sounds/correct.mp3";
myApp.elem.sndX.src    = "https://raw.githubusercontent.com/t-yokota/quizBattle/master/sounds/discorrect.mp3";
//
/* load answer list */
const ansCSV = "https://raw.githubusercontent.com/t-yokota/quizBattle/master/answer_UTF-8.csv"; //UTF-8
const file = new XMLHttpRequest();
file.open("get", ansCSV, true);
file.send(null);
file.onload = function(){
    myApp.val.ansArray = CSVtoArray(file.responseText);
};
//
/* set init value to the elements */
myApp.elem.text.innerHTML   = "quizBattle.srt.js";   
myApp.elem.ansCol.value     = "ここに解答を入力";
myApp.elem.ansBtn.innerHTML = "解答を送信";
myApp.elem.numOX.innerHTML  = "⭕️："+myApp.val.cntO+"　❌："+myApp.val.cntX;
myApp.elem.ansCol.disabled  = true;
myApp.elem.ansBtn.disabled  = true;
//
/* assign init text and image of push button */
myApp.elem.pushBtn.width = document.documentElement.clientWidth/5; /* set init size before loading */
if(myApp.val.os != "other"){
    if(Math.abs(window.orientation) != 90){
        myApp.elem.pushBtn.src = myApp.elem.imgBtn1.src;
        myApp.elem.text.innerHTML = "下の早押しボタンをタップしてクイズをはじめる";
        myApp.val.initOrientation = 'portrait';
    }else{
        myApp.elem.pushBtn.src = myApp.elem.imgBtn4.src;
        myApp.elem.text.innerHTML = "スマホ/タブレットを縦向きにしてクイズをはじめる";
        myApp.val.initOrientation = 'landscape';
        // alert("このサイトはスマートフォン/タブレットを縦向きにしてお楽しみください。");
    }
}else{
    myApp.elem.pushBtn.src = myApp.elem.imgBtn1.src;
    if(detectTouchPanel() == true){
        myApp.elem.text.innerHTML = "早押しボタンのタップ/スペースキーの押下でクイズをはじめる"; 
    }else{
        myApp.elem.text.innerHTML = "スペースキーを押してクイズをはじめる";
    }
}
//
/* set button check state */
myApp.val.status = myApp.state.ButtonCheck;
player.pauseVideo();
//
setTimeout(function(){
    if(myApp.val.os != "other" && myApp.val.initOrientation == 'landscape'){
        alert("このサイトはスマートフォン/タブレットを縦向きにしてお楽しみください。");
    }
}, 500);
//
/* Event */
/* set main keydown event */
document.addEventListener("compositionstart", function(){ myApp.val.composingBool = true; });
document.addEventListener('compositionend', function(){ myApp.val.composingBool = false; });
document.onkeydown = myKeyDownEvent;
function myKeyDownEvent(){
    if(myApp.val.imgErrorBool == false && myApp.val.initBtnLoadBool == true && Math.abs(window.orientation) != 90){
        if(event.keyCode == myApp.val.btnCode){
            if(myApp.val.status == myApp.state.ButtonCheck){
                const interval = 1500;
                buttonCheck(interval);
                myApp.val.status = myApp.state.Talk;
                setTimeout(function(){ player.playVideo(); }, interval+1500);
            }
            if(myApp.val.status == myApp.state.Question){
                myApp.val.cntPush = pushButton();
                myApp.val.status  = myApp.state.MyAnswer;
                player.pauseVideo();
            }
        }
        if(event.keyCode == 13/* Enter key */){
            if(myApp.val.composingBool == false){
                return false;
            }
        }
    }
}
//
/* set main touchstart event (for smartphone) */
document.addEventListener("touchstart", myTouchEvent);
function myTouchEvent(event){    
    if(myApp.val.imgErrorBool == false && myApp.val.initBtnLoadBool == true && Math.abs(window.orientation) != 90){ 
        myApp.val.touchObject = event.changedTouches[0];
        if( myApp.val.pushBtnArea.left < myApp.val.touchObject.pageX && myApp.val.touchObject.pageX < myApp.val.pushBtnArea.right ){
            if( myApp.val.pushBtnArea.top < myApp.val.touchObject.pageY && myApp.val.touchObject.pageY < myApp.val.pushBtnArea.bottom ){
                if(myApp.val.status == myApp.state.ButtonCheck){
                    const interval = 1500; 
                    buttonCheck(interval);
                    myApp.val.status = myApp.state.Talk;
                    setTimeout(function(){ player.playVideo(); }, interval+1500);
                }
                if(myApp.val.status == myApp.state.Question){
                    pushButton();
                    myApp.val.status  = myApp.state.MyAnswer;
                    player.pauseVideo();
                }
            }
        }
    }
}
//
// /* set touchstart event for preventing pinch gesture (for smartphone) */
// document.addEventListener('touchstart', disablePinchGesture, {passive: false});
// function disablePinchGesture(){
//     myApp.val.numFingers = event.touches.length;
//     if(event.touches.length > 1){
//         event.preventDefault();
//     }
// }
// //
// /* set touchend event for preventing double tap gesture (for smartphone) */
// document.addEventListener('touchend', disableDoubleTapGesture, {passive: false});
// function disableDoubleTapGesture(){
//     if(myApp.val.firstTapBool){
//         event.preventDefault();
//     }else{
//         myApp.val.firstTapBool = true;
//         setTimeout(function(){ myApp.val.firstTapBool = false; }, 300);
//     }
// }
//
/* set main event listener */
player.addEventListener('onStateChange', myEventListener);
function myEventListener(){
    if(player.getPlayerState() == myApp.videoState.Playing){
        myApp.val.currTime.playing = player.getCurrentTime();
        myApp.val.watchedTime = updateWatchedTime(myApp.val.currTime.playing, myApp.val.watchedTime);
        /* check answer if the video is restarted manually (= without sending answer) */
        if(myApp.val.status == myApp.state.MyAnswer){
            player.pauseVideo();
            checkAnswer();
            if(myApp.val.correctBool == true || myApp.val.limPush - myApp.val.cntPush == 0){
                myApp.val.status = myApp.state.Talk;
            }else{
                myApp.val.status = myApp.state.Question;
            }
            player.playVideo();
        }
        /* prevent to jump video playback position by seekbar */
        if(myApp.val.status == myApp.state.Question){
            myApp.val.diffTime = Math.abs(myApp.val.currTime.playing - myApp.val.watchedTime);
            if(myApp.val.diffTime > 1.0){
                player.seekTo(myApp.val.watchedTime);
            }
        }else{
            myApp.val.diffTime = Math.abs(myApp.val.currTime.playing - myApp.val.watchedTime);
            // myApp.val.diffTime = myApp.val.currTime.playing - myApp.val.watchedTime; /* allow to jump to previous positon on timeline */
            if(myApp.val.diffTime > 1.0){
                player.seekTo(myApp.val.watchedTime);
            }
        }
    }
    if(player.getPlayerState() == myApp.videoState.Stopped){
        myApp.val.currTime.stopped = player.getCurrentTime();
        /* prepare to input and send answer */
        if(myApp.val.status == myApp.state.MyAnswer){
            setTimeout(function(){ focusToAnsCol(); }, 500);
        }
        /* prevent to jump video playback position by seekbar */
        /* and prevent to pause video during the thinking time of each question */
        if(myApp.val.status == myApp.state.Question || myApp.val.status == myApp.state.OthAnswer){
            myApp.val.diffTime = Math.abs(myApp.val.currTime.stopped - myApp.val.watchedTime);
            if(myApp.val.diffTime > 1.0){
                player.seekTo(myApp.val.watchedTime);
            }
            player.playVideo();
        }else{
            myApp.val.diffTime = Math.abs(myApp.val.currTime.stopped - myApp.val.watchedTime);
            // myApp.val.diffTime = myApp.val.currTime.stopped - myApp.val.watchedTime; /* allow to jump to previous position on timeline */
            if(myApp.val.diffTime > 1.0){
                player.seekTo(myApp.val.watchedTime);
                player.playVideo(); /* allow to pause video except during the question status */
            }
            // player.playVideo();
        }
    }
}
//
/* set main function that are executed at a certain interval  */
setInterval(myIntervalEvent, interval = 10/*[ms]*/);
function myIntervalEvent(){
    if(player.getPlayerState() == myApp.videoState.Playing){
        myApp.val.currTime.playing = player.getCurrentTime();
        myApp.val.watchedTime = updateWatchedTime(myApp.val.currTime.playing, myApp.val.watchedTime);
        /* prevent to play video before button check */
        if(myApp.val.status == myApp.state.ButtonCheck){
            player.pauseVideo();
        }
        /* execute srt function in each sections of subtitle */
        if(myApp.val.status != myApp.state.MyAnswer){
            if(index > myApp.val.cntIndex){
                myApp.val.srtFuncArray.shift()();
                myApp.val.cntIndex += 1;
            }
        }
    }
    if(myApp.val.status == myApp.state.MyAnswer){
        if(document.activeElement.id != "anscol" && myApp.elem.ansCol.value.valueOf() === ""){
            // myApp.elem.ansCol.focus();
        }
        /* answer time managemant */
        myApp.val.ansTime.elapsed += interval;
        myApp.elem.text.innerHTML = "のこり"+Math.floor((myApp.val.ansTime.limit-myApp.val.ansTime.elapsed)/1000)+"秒";
        if(myApp.val.ansTime.elapsed >= myApp.val.ansTime.limit){
            checkAnswer();
            if(myApp.val.correctBool == true || myApp.val.limPush - myApp.val.cntPush == 0){
                myApp.val.status = myApp.state.Talk;
            }else{
                myApp.val.status = myApp.state.Question;
            }
            player.playVideo();
        }
    }else{
        if(document.activeElement.id == "player"){
            instantFocusToElement(myApp.elem.ansCol);
        }
        myApp.val.ansTime.elapsed = 0;
    }
    /* for check params */
    printParams();
}
//
/* set onclick event of send answer button */
myApp.elem.ansBtn.onclick = myOnClickEvent;
function myOnClickEvent(){
    if(myApp.val.status == myApp.state.MyAnswer){
        checkAnswer();
        if(myApp.val.correctBool == true || myApp.val.limPush - myApp.val.cntPush == 0){
            myApp.val.status = myApp.state.Talk;
        }else{
            myApp.val.status = myApp.state.Question;
        }
        player.playVideo();
    }
}
//
myApp.val.srtFuncArray = [
    function(){
        myApp.val.status = myApp.state.Talk;
        myApp.elem.text.innerHTML = "quizBattle.srt.js";   
    },
    function(){
        /* 第１問 */
        myApp.val.status = myApp.state.Question;
        myApp.val.numQues = 1;
        myApp.val.cntPush = 0;
        myApp.elem.text.innerHTML = "第"+myApp.val.numQues+"問";
    },
    function(){
        /* 閑話1 */
        myApp.val.status = myApp.state.Talk;
    },
    function(){
        /* 第２問 */
        myApp.val.status = myApp.state.Question;
        myApp.val.numQues = 2;
        myApp.val.cntPush = 0;
        myApp.elem.text.innerHTML = "第"+myApp.val.numQues+"問";
    },
    function(){
        /* 閑話2 */
        myApp.val.status = myApp.state.Talk;
    },
    function(){
        /* 第３問 */
        myApp.val.status = myApp.state.Question;
        myApp.val.numQues = 3;
        myApp.val.cntPush = 0;
        myApp.elem.text.innerHTML = "第"+myApp.val.numQues+"問";
    },
    function(){
        /* 閑話3 */
        myApp.val.status = myApp.state.Talk;
    }
];
//
/* Function */
/* fetch device os type */
function fetchOSType(){
    let osType = null;
    const ua = navigator.userAgent;
    if (ua.match(/Android/)){
        osType = "Android";
        return osType;
    } else if (ua.match(/iPhone/)) {
        osType = "iOS";
        return osType;
    } else if (ua.match(/iPad/)) {
        osType = "iOS";
        return osType;
    } else {
        osType = "other";
        return osType;
    }
}
function detectTouchPanel(){
    return window.ontouchstart === null;
}
/**
 * import csv file into an array
 * @param {string} str
 * @returns {array} (rows: num of question, columns: num of patterns of answer）
 */
function CSVtoArray(str){
    const array = new Array();
    const tmp = str.split("\n");
    for (let i = 0; i < tmp.length; i++) {
        array[i] = tmp[i].split(",");
    }
    return array;
}
//
function resizePlayer(){
    if(myApp.val.os != 'other'){
        if(Math.abs(window.orientation) != 90){
            // myApp.val.playerWidth  = document.documentElement.clientWidth;
            if(myApp.val.os == 'Android'){ myApp.val.playerWidth = window.innerWidth; }
            if(myApp.val.os == 'iOS'){ myApp.val.playerWidth = document.documentElement.clientWidth; }
            myApp.val.playerHeight = myApp.val.playerWidth/16*9;
        }else{
            myApp.val.playerWidth  = document.documentElement.clientWidth*2/3;
            myApp.val.playerHeight = myApp.val.playerWidth/16*9;
            // myApp.val.playerHeight = document.documentElement.clientHeight-parseInt(myApp.elem.text.style.lineHeight)-20;
            // myApp.val.playerWidth  = myApp.val.playerHeight/9*16;
        }
    }else{
        myApp.val.playerHeight = document.documentElement.clientHeight/2;
        myApp.val.playerWidth  = myApp.val.playerHeight/9*16;
        myApp.elem.ansCol.style.width = myApp.val.playerWidth/document.documentElement.clientWidth*90+'%';
    }
    if(myApp.val.initBtnLoadBool == false || myApp.val.prevPlayerWidth != myApp.val.playerWidth){
        player.setSize(myApp.val.playerWidth, myApp.val.playerHeight);
        //
        myApp.val.prevPlayerWidth  = myApp.val.playerWidth;
        myApp.val.prevPlayerHeight = myApp.val.playerHeight;
    }
}
//
function resizePushButton(){
    if(myApp.val.os != "other" && Math.abs(window.orientation) != 90 || myApp.val.os == 'other'){
        const tmpImgHeight = document.documentElement.clientHeight-myApp.elem.pushBtn.getBoundingClientRect().top-parseInt(myApp.elem.numOX.style.lineHeight)-20;
        const tmpImgWidth  = myApp.elem.pushBtn.naturalWidth*tmpImgHeight/myApp.elem.pushBtn.naturalHeight;
        if(tmpImgWidth < document.documentElement.clientWidth){
            myApp.val.pushBtnWidth  = tmpImgWidth;
            myApp.val.pushBtnHeight = tmpImgHeight;
        }else{
            myApp.val.pushBtnWidth  = document.documentElement.clientWidth/5;
            myApp.val.pushBtnHeight = myApp.elem.pushBtn.naturalHeight*myApp.val.pushBtnWidth/myApp.elem.pushBtn.naturalWidth;
        }
    }else{
        myApp.val.pushBtnWidth  = document.documentElement.clientWidth/5;
        myApp.val.pushBtnHeight = myApp.elem.pushBtn.naturalHeight*myApp.val.pushBtnWidth/myApp.elem.pushBtn.naturalWidth;
    }
    if(myApp.val.initBtnLoadBool == false || myApp.val.prevClientHeight != document.documentElement.clientHeight){
        myApp.elem.pushBtn.width  = myApp.val.pushBtnWidth;
        myApp.elem.pushBtn.height = myApp.val.pushBtnHeight;
        myApp.val.pushBtnArea = myApp.elem.pushBtn.getBoundingClientRect();
        //
        myApp.val.prevClientWidth  = document.documentElement.clientWidth;
        myApp.val.prevClientHeight = document.documentElement.clientHeight;
    }
}
/**
 * focus to js element for an instant
 * (keydown event is ready during the focus is in the js element (not player))
 */
function instantFocusToElement(focusUsableElement){
    focusUsableElement.disabled = false;
    focusUsableElement.focus();
    focusUsableElement.blur();
    focusUsableElement.disabled = true;
}
//
/*  */
function updateWatchedTime(currentPlayingTime, watchedTime){
    if(0.0 < currentPlayingTime - watchedTime && currentPlayingTime - watchedTime < 1.0){
        watchedTime = currentPlayingTime;
    }
    return watchedTime;
}
//
function buttonCheck(responseInterval){
    myApp.elem.sndPush.play();
    myApp.elem.pushBtn.src = myApp.elem.imgBtn2.src;
    setTimeout(function(){ myApp.elem.pushBtn.src = myApp.elem.imgBtn3.src; }, 100);
    setTimeout(function(){ myApp.elem.sndO.play(); myApp.elem.pushBtn.src = myApp.elem.imgBtn1.src; }, responseInterval);
}
//
function pushButton(){
    myApp.elem.sndPush.play();
    myApp.elem.pushBtn.src = myApp.elem.imgBtn2.src;
    setTimeout(function(){ myApp.elem.pushBtn.src = myApp.elem.imgBtn3.src; }, 100);
    myApp.val.cntPush = myApp.val.cntPush+1;
}
//
/* make the answer column and button enabled after getting the right to answer */
function focusToAnsCol(){
    myApp.elem.ansCol.disabled = false;
    myApp.elem.ansCol.value = "";
    myApp.elem.ansCol.focus();
    myApp.elem.ansBtn.disabled = false;
}
//
function checkAnswer(){
    myApp.val.correctBool = false;
    myApp.elem.ansCol.disabled  = true;
    myApp.elem.ansBtn.disabled  = true;
    const answer = myApp.elem.ansCol.value;
    const length = myApp.val.ansArray[myApp.val.numQues-1].length;
    for(let i = 0; i < length; i++){
        if(answer.valueOf() === myApp.val.ansArray[myApp.val.numQues-1][i].valueOf()){
            myApp.val.correctBool = true;
        }
    }
    if(myApp.val.correctBool == true){
        myApp.elem.sndO.play();
        myApp.val.cntO += 1;
        myApp.elem.text.innerHTML = "正解！";
    }else{
        myApp.elem.sndX.play();
        myApp.val.cntX += 1;
        myApp.elem.text.innerHTML = "不正解！"; //あと"+(myApp.val.limPush-myApp.val.cntPush)+"回解答できます。";
    }
    myApp.elem.numOX.innerHTML  = "⭕️："+myApp.val.cntO+"　❌："+myApp.val.cntX;
    if(window.orientation != 90){
        myApp.elem.pushBtn.src = myApp.elem.imgBtn1.src;
    }else{
        myApp.elem.pushBtn.src = myApp.elem.imgBtn4.src;
    }
}
//
function printParams(){
    // myApp.elem.text.innerHTML = "docWidth: " + document.documentElement.clientWidth +', docHeight: '+ document.documentElement.clientHeight + ', inWidth: '+ window.innerWidth + ', inHeight: '+ window.innerHeight;
    // myApp.elem.text.innerHTML = "curr: " + myApp.elem.pushBtn.width +', new: '+ Math.floor(myApp.val.pushBtnWidth) + ', inWidth: '+ window.innerWidth + ', inHeight: '+ window.innerHeight;
    // myApp.elem.text.innerHTML = Math.floor(myApp.val.touchObject.pageX) +', '+ Math.floor(myApp.val.touchObject.pageY) +' ['+ Math.floor(myApp.val.pushBtnArea.left) +', '+ Math.floor(myApp.val.pushBtnArea.right) +'] ['+  Math.floor(myApp.val.pushBtnArea.top) +', '+ Math.floor(myApp.val.pushBtnArea.bottom)+']';
    // myApp.elem.text.innerHTML = document.body.clientWidth / window.innerWidth;
    //myApp.elem.text.innerHTML = myApp.val.os + ', ' + navigator.userAgent;
    // myApp.elem.text.innerHTML = detectTouchPanel();
    // myApp.elem.subText.innerHTML = 'imgErrorBool: ' + myApp.val.imgErrorBool + ', initBtnLoadBool: ' + myApp.val.initBtnLoadBool;
    //myApp.elem.subText.innerHTML = 'playerWidth: ' + myApp.val.playerWidth + ', innerWidth: ' + window.innerWidth;
    // myApp.elem.text.innerHTML = document.styleSheets.item(1).cssRules.length;
    // myApp.elem.subText.innerHTML = 
    //     "device: "           + myApp.val.os+"<br>"+
    //     "activeElem: "       + document.activeElement.id+"<br>"+   
    //     "status: "           + myApp.val.status+"<br>"+
    //     "timePlay: "         + myApp.val.currTime.playing.toFixed(3)+"<br>"+
    //     "timeStop: "         + myApp.val.currTime.stopped.toFixed(3)+"<br>"+
    //     "WatchedTime: "      + myApp.val.watchedTime.toFixed(3)+"<br>"+
    //     "diffTime: "         + myApp.val.diffTime.toFixed(3)+"<br>"+
    //     "limPush: "          + myApp.val.limPush+"<br>"+ 
    //     "cntPush: "          + myApp.val.cntPush+"<br>"+
    //     "remainingAnsTime: " + Math.floor((myApp.val.ansTime.limit-myApp.val.ansTime.elapsed)/1000)+"<br>"+
    //     "answer: "           + myApp.val.ansArray[myApp.val.numQues-1][0].valueOf()+", "+
    //                            myApp.val.ansArray[myApp.val.numQues-1][1].valueOf()+", "+
    //                            myApp.val.ansArray[myApp.val.numQues-1][2].valueOf()+"<br>"+
    //     "answerLength: "     + myApp.val.ansArray[myApp.val.numQues-1].length+"<br>"+
    //     "correctBool: "      + myApp.val.correctBool+"<br>"+
    //     "composing: "        + myApp.val.composingBool+"<br>"+
    //     "touchLength: "      + myApp.val.numFingers+"<br>"+
    //     "index: "            + index+"<br>"+
    //     "cntIndex: "         + myApp.val.cntIndex+"<br>"+
    //     'cssRules: '         + document.styleSheets.item(0).cssRules.item(0).selectorText;
}
//

1
00:00:01,000 --> 00:00:02,999


2
00:00:03,000 --> 00:00:06,999


3
00:00:07,000 --> 00:00:10,999


4
00:00:11,000 --> 00:00:14,999


5
00:00:15,000 --> 00:00:18,999


6
00:00:19,000 --> 00:00:22,999


7
00:00:23,000 --> 00:00:26,999