0
00:00:00,000 --> 00:00:03,330
/* CAUTION : Each sections of subtitle has independent scope. */
/* Ver1.0 */
doOnce[index] = true;
player.pauseVideo();
//
const myApp = {
    path : {
        answer : "https://raw.githubusercontent.com/t-yokota/quizBattle/master/contents/demo/forDemoQuizBattle/answer.csv",
        sound  : "https://raw.githubusercontent.com/t-yokota/quizBattle/master/sounds/sounds_3", //+ext;
        btn1   : "https://github.com/t-yokota/quizBattle/raw/master/figures/button_portrait_72ppi_1.png",
        btn2   : "https://github.com/t-yokota/quizBattle/raw/master/figures/button_portrait_72ppi_2.png",
        btn3   : "https://github.com/t-yokota/quizBattle/raw/master/figures/button_portrait_72ppi_3.png",
        btn4   : "https://github.com/t-yokota/quizBattle/raw/master/figures/button_portrait_72ppi_4.png",
    },
    state : {
        ButtonCheck : 0, //ボタンチェック待機
        Question    : 1, //問い読み中（早押し可能）
        MyAnswer    : 2, //自分が解答権を所持（解答入力・送信可能）
        OthAnswer   : 3, //他者が解答権を所持（早押し不可能）
        Talk        : 4, //その他
    },
    videoState : {
        Playing : 1,
        Stopped : 2,
    },
    elem : {
        text       : document.createElement("text"),
        subText    : document.createElement("text"),
        ansCol     : document.createElement("textarea"),
        ansBtn     : document.createElement("button"),
        numOX      : document.createElement("text"),
        pushBtn    : document.createElement("img"),
        imgBtn1    : document.createElement("img"),
        imgBtn2    : document.createElement("img"),
        imgBtn3    : document.createElement("img"),
        imgBtn4    : document.createElement("img"),
        sounds     : document.createElement("audio"),
        paramText  : document.createElement("text"),
        //
        divUI      : document.createElement('div'),
        divElem    : document.createElement('div'),
        divBtn     : document.createElement('div'),
    },
    val : {
        srtFuncArray  : null, //array of functions that are executed in each subtitle
        viewFuncArray : null, //array of functions for setting view elements
        //
        os : null,
        //
        touchObject : null,
        //
        audioExt : null,
        audioSpriteData : null,
        //
        loadCount     : 0,
        initLoadBool  : false,
        loadErrorBool : false,
        loadAlertBool : false,
        //
        initOrientation      : null,
        orientationAlertBool : false,
        //
        playingCount : 0,
        pageHiddenBool : false,
        processDelayAlertBool : false,
        //
        composingBool        : false,
        //
        playerWidth   : 0,
        playerHeight  : 0,
        pushBtnWidth  : 0,
        pushBtnHeight : 0,
        //
        prevPlayerWidth  : 0,
        prevPlayerHeight : 0,
        prevClientWidth  : 0,
        prevClientHeight : 0,
        //
        pushBtnArea : {
            left   : 0,
            right  : 0,
            top    : 0,
            bottom : 0,
        },
        //
        divUIHeight  : 0,
        divUIWidth   : 0,
        divElemWidth : 0,
        divBtnWidth  : 0,
        //
        /* keycode (for keyboard) */
        space : 32, //push buttion
        enter : 13,
        //
        /* button check param */
        btnCheck : {
            sndInterval  : 1500, //[ms]
            playInterval : 3000, //[ms]
        },
        //
        /* for question manegament */
        numQues     : 1,     //問題番号
        ansArray    : [],    //正答リスト
        cntO        : 0,     //正答数
        cntX        : 0,     //誤答数
        cntPush     : 0,     //1問あたりの解答回数
        limPush     : 1,     //1問あたりの上限解答回数
        correctBool : false, //答え合わせ結果(結果に応じて状態遷移)
        ansFile     : new XMLHttpRequest(), //正答ファイル.csv
        //
        /* for status management */
        status   : null,
        cntIndex : 0, //(index value has current section of subtitle)
        //
        /* for time management */
        ansTime : {
            limit   : 20000, //解答制限時間[ms]
            elapsed : 0,     //解答経過時間[ms]
        },
        currTime : {
            playing : 0, //be updated during the video is playing
            stopped : 0, //be updated when the video is stopped
        },
        watchedTime : 0, //
        diffTime    : 0, //difference between watchedTime and currentTime (for preventing to jump playback position by seekbar)
        //
        ansIndex: 0,
        ansIndexStartTime : 0,
        jumpToAnsBool: false,
    },
};
//
/* get os type */
myApp.val.os = fetchOSType();
//
/* set id to the elements */
myApp.elem.ansCol.id  = 'anscol';
myApp.elem.ansBtn.id  = 'ansbtn';
myApp.elem.pushBtn.id = 'pushbtn';
myApp.elem.divUI.id   = 'divui';
myApp.elem.divElem.id = 'divelem';
myApp.elem.divBtn.id  = 'divbtn';
//
/* set init value to the elements */
myApp.elem.ansCol.value     = "ここに解答を入力";
myApp.elem.ansBtn.innerHTML = "解答を送信";
myApp.elem.ansCol.disabled  = true;
myApp.elem.ansBtn.disabled  = true;
myApp.elem.numOX.innerHTML  = "⭕️："+myApp.val.cntO+"　❌："+myApp.val.cntX;
//
if(myApp.val.os != 'other'){
    myApp.elem.text.innerHTML = "早押しボタンをタップして動画を再生する";
}else{
    myApp.elem.text.innerHTML = "QuizBattle on YouTube";
    /* set tabindex for adding focus */
    myApp.elem.pushBtn.tabIndex = 0;
}
//
/* set initial state (button check) */
myApp.val.status = myApp.state.ButtonCheck;
//
/* set event functions */
window.addEventListener('orientationchange', myOrientationChangeEvent);
document.addEventListener("compositionstart", function(){ myApp.val.composingBool = true; });
document.addEventListener('compositionend',   function(){ myApp.val.composingBool = false; });
document.onkeydown = myKeyDownEvent;
document.addEventListener("touchstart", myTouchEvent);
player.addEventListener('onStateChange', myPlayerStateChangeEvent);
document.addEventListener('webkitvisibilitychange', myPageHiddenCheckEvent, false);
setInterval(myIntervalEvent, interval = 10);
myApp.elem.ansBtn.onclick = myOnClickEvent;
//
/* VIEW */
resizePlayer();
//
/* set style sheets */
document.styleSheets.item(0).insertRule('html { touch-action: manipulation; }'); //disable double tap gesture
document.styleSheets.item(0).insertRule('body { text-align: center; margin: auto; background: #EFEFEF; }');
//
/* set elements */
if(myApp.val.os != 'other'){
    myApp.elem.text.style.fontSize      = '42px';
    myApp.elem.text.style.lineHeight    = '60px';
    myApp.elem.text.style.fontWeight    = 'bold';
    myApp.elem.text.style.display       = 'block';
    myApp.elem.subText.style.fontSize   = '42px';
    myApp.elem.subText.style.lineHeight = '60px';
    myApp.elem.subText.style.display    = 'block';
    myApp.elem.ansCol.style.fontSize    = '42px';
    myApp.elem.ansCol.style.textAlign   = 'center';
    myApp.elem.ansCol.style.margin      = '0px auto 10px'
    myApp.elem.ansBtn.style.fontSize    = '35px';
    myApp.elem.ansBtn.style.width       = parseInt(myApp.elem.ansBtn.style.fontSize, 10)*8+'px';
    myApp.elem.ansBtn.style.margin      = '0px '+(document.documentElement.clientWidth-parseInt(myApp.elem.ansBtn.style.width, 10))/2+'px 20px';
    myApp.elem.numOX.style.fontSize     = '40px';
    myApp.elem.numOX.style.lineHeight   = '80px';
    myApp.elem.numOX.style.fontWeight   = 'bold';
    //
    myApp.val.viewFuncArray = [
        function(){
            myApp.elem.text.style.margin  = '32px auto';
            myApp.elem.text.style.padding = '0px 10px';
            document.getElementsByTagName("body")[0].appendChild(myApp.elem.text);
            document.getElementsByTagName("body")[0].appendChild(myApp.elem.ansCol);
            document.getElementsByTagName("body")[0].appendChild(myApp.elem.ansBtn);
            document.getElementsByTagName("body")[0].appendChild(myApp.elem.pushBtn);
            document.getElementsByTagName("body")[0].appendChild(myApp.elem.numOX);
            document.getElementsByTagName("body")[0].appendChild(myApp.elem.paramText);
        },
        function(){
            myApp.elem.text.style.margin  = '40px auto 20px';
            myApp.elem.subText.style.margin  = '0px auto 40px';
            myApp.elem.subText.style.padding = '0px 10px';
            document.getElementsByTagName("body")[0].insertBefore(myApp.elem.subText, myApp.elem.text.nextSibling);
        },
        function(){
            myApp.elem.text.style.margin = '32px auto';
            myApp.elem.text.parentNode.removeChild(myApp.elem.subText);
        },
    ];
    myApp.val.viewFuncArray.shift()();
}else{
    myApp.val.divUIHeight  = myApp.val.playerHeight*0.9;
    myApp.val.divUIWidth   = myApp.val.playerWidth;
    myApp.val.divElemWidth = myApp.val.playerWidth*2/3;
    myApp.val.divBtnWidth  = myApp.val.playerWidth*1/3;
    document.styleSheets.item(0).insertRule('body { width:'+myApp.val.playerWidth+'px; }');
    document.styleSheets.item(0).insertRule('div#divui   { width:'+myApp.val.divUIWidth  +'px; height:'+myApp.val.divUIHeight+'px; }');
    document.styleSheets.item(0).insertRule('div#divelem { width:'+myApp.val.divElemWidth+'px; height:'+myApp.val.divUIHeight+'px; float: left; display: flex; align-items: center; justify-content: center; flex-direction: column; }');
    document.styleSheets.item(0).insertRule('div#divbtn  { width:'+myApp.val.divBtnWidth +'px; height:'+myApp.val.divUIHeight+'px; float: left; display: flex; align-items: center; justify-content: center; }');
    document.getElementsByTagName("body")[0].appendChild(myApp.elem.divUI);
    myApp.elem.divUI.appendChild(myApp.elem.divElem); //divElem is assigned to ('div')[4]
    myApp.elem.divUI.appendChild(myApp.elem.divBtn);  //divBtn  is assigned to ('div')[5]
    //
    myApp.elem.text.style.fontSize      = '25px';
    myApp.elem.text.style.lineHeight    = '45px';
    myApp.elem.text.style.fontWeight    = 'bold';
    myApp.elem.text.style.display       = 'block';
    myApp.elem.subText.style.fontSize   = '20px';
    myApp.elem.subText.style.lineHeight = '30px';
    myApp.elem.subText.style.display    = 'block';
    myApp.elem.ansCol.style.fontSize    = '23px';
    myApp.elem.ansCol.style.textAlign   = 'center';
    myApp.elem.ansCol.style.width       = myApp.val.divElemWidth*0.75+'px';
    myApp.elem.ansCol.style.margin      = '0px ' +(myApp.val.divElemWidth-parseInt(myApp.elem.ansCol.style.width, 10))/2+'px 15px';
    myApp.elem.ansBtn.style.fontSize    = '23px';
    myApp.elem.ansBtn.style.width       = parseInt(myApp.elem.ansBtn.style.fontSize, 10)*8+'px';
    myApp.elem.ansBtn.style.margin      = '0px '+(myApp.val.divElemWidth-parseInt(myApp.elem.ansBtn.style.width, 10))/2+'px 20px';
    myApp.elem.numOX.style.fontSize     = '25px';
    myApp.elem.numOX.style.lineHeight   = '45px';
    myApp.elem.numOX.style.fontWeight   = 'bold';
    //
    myApp.val.viewFuncArray = [
        function(){
            myApp.elem.text.style.margin  = '0px auto';
            myApp.elem.text.style.padding = '0px 40px';
            document.getElementsByTagName("div")[4].appendChild(myApp.elem.text);
            document.getElementsByTagName("div")[4].appendChild(myApp.elem.paramText);
        },
        function(){
            myApp.elem.text.style.margin  = '0px auto 30px';
            myApp.elem.subText.style.margin  = '0px auto 50px';
            myApp.elem.subText.style.padding = '0px 40px';
            document.getElementsByTagName("div")[4].appendChild(myApp.elem.subText);
            document.getElementsByTagName("div")[4].appendChild(myApp.elem.paramText);
            document.getElementsByTagName("div")[5].appendChild(myApp.elem.pushBtn);
        },
        function(){
            myApp.elem.text.style.margin = '0px auto 15px';
            myApp.elem.text.parentNode.removeChild(myApp.elem.subText);
            document.getElementsByTagName("div")[4].appendChild(myApp.elem.ansCol);
            document.getElementsByTagName("div")[4].appendChild(myApp.elem.ansBtn);
            document.getElementsByTagName("div")[4].appendChild(myApp.elem.numOX);
            document.getElementsByTagName("div")[4].appendChild(myApp.elem.paramText);
        },
    ];
    myApp.val.viewFuncArray.shift()();
}
//
const num_of_materials = 6;
myApp.elem.sounds.onloadedmetadata = function(){ myApp.val.loadCount += 1; };
myApp.elem.imgBtn1.onload = function(){ myApp.val.loadCount += 1; };
myApp.elem.imgBtn2.onload = function(){ myApp.val.loadCount += 1; };
myApp.elem.imgBtn3.onload = function(){ myApp.val.loadCount += 1; };
myApp.elem.imgBtn4.onload = function(){ myApp.val.loadCount += 1; };
myApp.val.ansFile.onload  = function(){ myApp.val.loadCount += 1; myApp.val.ansArray = CSVtoArray(myApp.val.ansFile.responseText); };
//
myApp.elem.sounds.onerror  = function(){ myApp.val.loadErrorBool = true; };
myApp.elem.imgBtn1.onerror = function(){ myApp.val.loadErrorBool = true; };
myApp.elem.imgBtn2.onerror = function(){ myApp.val.loadErrorBool = true; };
myApp.elem.imgBtn3.onerror = function(){ myApp.val.loadErrorBool = true; };
myApp.elem.imgBtn4.onerror = function(){ myApp.val.loadErrorBool = true; };
myApp.val.ansFile.onerror  = function(){ myApp.val.loadErrorBool = true; };
//
/* load audio data */
if     (myApp.elem.sounds.canPlayType('audio/mp3') == 'probably'){ myApp.val.audioExt = '.mp3'; }
else if(myApp.elem.sounds.canPlayType('audio/aac') == 'probably'){ myApp.val.audioExt = '.aac'; }
else if(myApp.elem.sounds.canPlayType('audio/wav') == 'probably'){ myApp.val.audioExt = '.wav'; }
else if(myApp.elem.sounds.canPlayType('audio/mp3') == 'maybe'   ){ myApp.val.audioExt = '.mp3'; }
else if(myApp.elem.sounds.canPlayType('audio/aac') == 'maybe'   ){ myApp.val.audioExt = '.aac'; }
else if(myApp.elem.sounds.canPlayType('audio/wav') == 'maybe'   ){ myApp.val.audioExt = '.wav'; }
myApp.elem.sounds.src = myApp.path.sound+myApp.val.audioExt;
//
/* load push button image */
myApp.elem.imgBtn1.src = myApp.path.btn1;
myApp.elem.imgBtn2.src = myApp.path.btn2;
myApp.elem.imgBtn3.src = myApp.path.btn3;
myApp.elem.imgBtn4.src = myApp.path.btn4;
//
/* load answer file */
myApp.val.ansFile.open("get", myApp.path.answer, true);
myApp.val.ansFile.send(null);
//
/* set audio sprite */
myApp.val.audioSpriteData = {
    pushBtn : { start : 0.0, end : 2.0 }, //[sec]
    sndO    : { start : 3.0, end : 5.0 }, 
    sndX    : { start : 6.0, end : 8.0 },
};
myApp.elem.sounds.addEventListener('timeupdate', spriteHandler, false);
function spriteHandler(){
    if(Math.abs(myApp.val.audioSpriteData.pushBtn.end - this.currentTime) < 0.25){
        this.pause();
        myApp.elem.sounds.currentTime = myApp.val.audioSpriteData.pushBtn.start;
    }
    if(Math.abs(myApp.val.audioSpriteData.sndO.end - this.currentTime) < 0.25){
        this.pause();
        myApp.elem.sounds.currentTime = myApp.val.audioSpriteData.pushBtn.start;
    }
    if(Math.abs(myApp.val.audioSpriteData.sndX.end - this.currentTime) < 0.25){
        this.pause();
        myApp.elem.sounds.currentTime = myApp.val.audioSpriteData.pushBtn.start;
    }
};
//
/* set function executed after initial loading */
myApp.elem.pushBtn.onerror = function(){
    alert("画像の読み込みに失敗しました。ページを再読み込みしてください。" );
    myApp.val.loadErrorBool = true;
    myApp.val.loadAlertBool = true;
};
myApp.elem.pushBtn.onload = function(){
    if(myApp.val.initLoadBool == false){
        /* change player and push button size after loading image */
        resizePlayer();
        resizePushButton();
        myApp.val.initLoadBool = true;
        if(myApp.val.os == 'other'){ myApp.val.viewFuncArray.shift()(); }
    }
};
function materialCheckFunction(){
    if(myApp.val.loadErrorBool == false){
        if(myApp.val.initLoadBool == false && myApp.val.loadCount == num_of_materials){
            myApp.val.loadCount = 0;
            /* assign push button image and main text */
            myApp.elem.pushBtn.width = document.documentElement.clientWidth/5; /* init size before loading */
            if(myApp.val.os != "other"){
                if(Math.abs(window.orientation) != 90){
                    myApp.elem.pushBtn.src = myApp.elem.imgBtn1.src;
                    myApp.elem.text.innerHTML = "早押しボタンをタップして動画を再生する";
                    myApp.val.initOrientation = 'portrait';
                }else{
                    myApp.elem.pushBtn.src = myApp.elem.imgBtn4.src;
                    myApp.elem.text.innerHTML = "端末を縦向きにしてクイズをはじめる";
                    myApp.val.initOrientation = 'landscape';
                    alert("このサイトはスマートフォン/タブレットを縦向きにしてお楽しみください。");
                }
            }else{
                myApp.elem.pushBtn.src = myApp.elem.imgBtn1.src;
                if(detectTouchPanel() == true){
                    myApp.elem.subText.innerHTML = "早押しボタン(スペースキー)を押して動画を再生する";
                }else{
                    myApp.elem.subText.innerHTML = "早押しボタン(スペースキー)を押して動画を再生する";
                }
            }
        }else if(myApp.val.initLoadBool == true && myApp.val.loadAlertBool == false){
            if(myApp.val.os != 'other'){
                if(Math.abs(myApp.elem.numOX.getBoundingClientRect().top - myApp.elem.ansBtn.getBoundingClientRect().bottom) < 50){
                    player.pauseVideo();
                    alert("画像の表示に失敗しました。ページを再読み込みしてください。");
                    myApp.val.loadErrorBool = true;
                    myApp.val.loadAlertBool = true;
                }
            }
        }
    }else{
        if(myApp.val.loadAlertBool == false){
            alert("ページの読み込みに失敗しました。ページを再読み込みしてください。");
            myApp.val.loadAlertBool = true;
        }
    }
}
//
/* EVENT */
/* orientation change event function */
function myOrientationChangeEvent(){
    setTimeout(function(){
        resizePlayer();
        resizePushButton();
        if(Math.abs(window.orientation) != 90){
            if(myApp.val.status == myApp.state.MyAnswer){
                myApp.elem.pushBtn.src = myApp.elem.imgBtn3.src;
            }else{
                myApp.elem.pushBtn.src = myApp.elem.imgBtn1.src;
            }
            if(myApp.val.status == myApp.state.ButtonCheck){
                myApp.elem.text.innerHTML = "早押しボタンをタップして動画を再生する";
            }
        }else{
            myApp.elem.pushBtn.src = myApp.elem.imgBtn4.src;
            if(myApp.val.status == myApp.state.ButtonCheck){
                myApp.elem.text.innerHTML = "端末を縦向きにしてクイズをはじめる";
            }
            if(myApp.val.orientationAlertBool == false && myApp.val.initOrientation == 'portrait'){
                alert("このサイトはスマートフォン/タブレットを縦向きにしてお楽しみください。");
                myApp.val.orientationAlertBool = true;
            }
        }
    }, 800);
}
//
/* keydown event function */
function myKeyDownEvent(){
    if(myApp.val.loadErrorBool == false && myApp.val.initLoadBool == true && Math.abs(window.orientation) != 90){
        if(event.keyCode == myApp.val.space){
            myButtonAction();
        }
        /* prevent to start new line in text area */
        if(event.keyCode == myApp.val.enter){
            if(myApp.val.composingBool == false){
                return false;
            }
        }
    }
}
//
/* touchstart event function (for smartphonea and tablet) */
function myTouchEvent(event){
    if(myApp.val.loadErrorBool == false && myApp.val.initLoadBool == true && Math.abs(window.orientation) != 90){
        myApp.val.touchObject = event.changedTouches[0];
        if(myApp.val.pushBtnArea.left < myApp.val.touchObject.pageX && myApp.val.touchObject.pageX < myApp.val.pushBtnArea.right){
            if(myApp.val.pushBtnArea.top < myApp.val.touchObject.pageY && myApp.val.touchObject.pageY < myApp.val.pushBtnArea.bottom){
                myButtonAction();
            }
        }
    }
}
//
/* common button action */
function myButtonAction(){
    if(myApp.val.status == myApp.state.ButtonCheck){
        myApp.val.status = myApp.state.Talk;
        buttonCheck(myApp.val.btnCheck.sndInterval);
        setTimeout(function(){
            player.playVideo();
            if(myApp.val.os != 'other'){
                myApp.val.viewFuncArray.shift()();
                myApp.elem.text.innerHTML = "＜ 遊び方 ＞";
                myApp.elem.subText.innerHTML = "早押しボタンをタップすることで<br>動画内のクイズに答えることができます";
            }else{
                myApp.elem.text.innerHTML = "＜ 遊び方 ＞"
                myApp.elem.subText.innerHTML = "早押しボタン(スペースキー)を押すことで<br>動画内のクイズに答えることができます";
            }
        }, myApp.val.btnCheck.playInterval);
    }
    if(myApp.val.status == myApp.state.Question){
        myApp.val.status = myApp.state.MyAnswer;
        player.pauseVideo();
        pushButton();
    }
}
//
/* player's state change event function */
function myPlayerStateChangeEvent(){
    if(player.getPlayerState() == myApp.videoState.Playing){
        myApp.val.currTime.playing = player.getCurrentTime();
        myApp.val.watchedTime = updateWatchedTime(myApp.val.currTime.playing, myApp.val.watchedTime);
        /* check answer if the video is restarted manually without sending answer */
        if(myApp.val.status == myApp.state.MyAnswer){
            player.pauseVideo();
            checkAnswer();
            if(myApp.val.correctBool == true || myApp.val.limPush - myApp.val.cntPush == 0){
                myApp.val.status = myApp.state.Talk;
            }else{
                myApp.val.status = myApp.state.Question;
            }
            player.playVideo();
            instantFocusToElement(player);
        }
        /* prevent to jump playback position by seekbar */
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
        /* and prevent to pause video during each question */
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
/* page hidden check event function */
function myPageHiddenCheckEvent(){
    if(document.webkitHidden){
        myApp.val.pageHiddenBool = true;
        // console.log('Hidden.');
    }else{
        myApp.val.pageHiddenBool = false;
        myApp.val.currTime.playing = player.getCurrentTime();
        myApp.val.watchedTime  = myApp.val.currTime.playing;
        myApp.val.playingCount = 0;
        // console.log('Opened.');
    }
}
//
/* interval event function that are executed at a certain interval */
function myIntervalEvent(){
    if(myApp.val.pageHiddenBool == false){
        if(player.getPlayerState() == myApp.videoState.Playing){
            myApp.val.currTime.playing = player.getCurrentTime();
            myApp.val.watchedTime = updateWatchedTime(myApp.val.currTime.playing, myApp.val.watchedTime);
            if(myApp.val.playingCount < 10){ myApp.val.playingCount += 1; }
            if(myApp.val.currTime.playing -  myApp.val.watchedTime > 1.0 && myApp.val.playingCount >= 10){
                if(myApp.val.processDelayAlertBool == false){
                    alert('ページ内の処理が遅くなっています。早押しの判定に支障が出る可能性があるため、他のプロセスを終了してから改めてクイズをお楽しみください。このポップアップは一度のみ表示されます。');
                    myApp.val.processDelayAlertBool = true;
                }
                myApp.val.watchedTime  = myApp.val.currTime.playing;
            }
            /* prevent to play video before button check */
            if(myApp.val.status == myApp.state.ButtonCheck){
                player.pauseVideo();
            }
            /* execute srt function in each sections of subtitle */
            if(myApp.val.status != myApp.state.MyAnswer){
                if(index - myApp.val.cntIndex == 1){
                    myApp.val.srtFuncArray.shift()();
                    myApp.val.cntIndex += 1;
                }
            }
        }else if(player.getPlayerState() == myApp.videoState.Stopped){
            myApp.val.playingCount = 0;
        }
        if(myApp.val.status == myApp.state.ButtonCheck){
            if(myApp.val.cntIndex > 0 && myApp.val.loadAlertBool == false){
                player.pauseVideo();
                alert('ページの読み込みに失敗しました。ページを再読み込みしてください。');
                myApp.val.loadErrorBool = true;
                myApp.val.loadAlertBool = true;
            }
        }
        if(myApp.val.status == myApp.state.MyAnswer){
            /* reforcus when anscol is blank */
            // if(document.activeElement.id != "anscol" && myApp.elem.ansCol.value.valueOf() === ""){
            //     myApp.elem.ansCol.focus();
            // }
            /* answer time managemant */
            if(document.activeElement.id == "anscol" || myApp.val.ansTime.elapsed != 0){
                myApp.val.ansTime.elapsed += interval;
                myApp.elem.text.innerHTML = "のこり"+Math.floor((myApp.val.ansTime.limit-myApp.val.ansTime.elapsed)/1000+1)+"秒";
                if(myApp.val.ansTime.elapsed >= myApp.val.ansTime.limit){
                    checkAnswer();
                    if(myApp.val.correctBool == true || myApp.val.limPush - myApp.val.cntPush == 0){
                        myApp.val.status = myApp.state.Talk;
                    }else{
                        myApp.val.status = myApp.state.Question;
                    }
                    player.playVideo();
                    instantFocusToElement(player);
                }
            }
        }else{
            if(myApp.val.os == 'other' && document.activeElement.id == "player"){
                /* preparation of js keydown event */
                instantFocusToElement(myApp.elem.pushBtn);
            }
            myApp.val.ansTime.elapsed = 0;
        }
        /* check results of importing material */
        materialCheckFunction();
        /* update push button area (mainly for when the window is zoomed in iOS)*/
        updatePushButtonArea();
        /* print parameters for debug */
        printParams();
    }
}
//
/* onclick event function of send answer button */
function myOnClickEvent(){
    if(myApp.val.status == myApp.state.MyAnswer){
        checkAnswer();
        if(myApp.val.correctBool == true || myApp.val.limPush - myApp.val.cntPush == 0){
            myApp.val.status = myApp.state.Talk;
        }else{
            myApp.val.status = myApp.state.Question;
        }
        player.playVideo();
        instantFocusToElement(player);
    }
}
//
/* FUNCTION */
function fetchOSType(){
    let osType = null;
    const ua = navigator.userAgent;
    if(ua.match(/Android/)){
        osType = "Android";
        return osType;
    }else if(ua.match(/iPhone/)) {
        osType = "iOS"; // iPhone OS
        return osType;
    }else if(ua.match(/iPad/)) {
        osType = "iOS"; // iPad OS
        return osType;
    }else if(ua.match(/Macintosh/) && detectTouchPanel() == true){
        osType = 'iOS'; // iPad OS with Safari
        return osType;
    }else{
        osType = "other";
        return osType;
    }
}
//
function detectTouchPanel(){
    return window.ontouchstart === null;
}
/**
 * @param {string} str
 * @returns {array} (rows: num of question, columns: num of patterns of answer）
 */
function CSVtoArray(str){
    const array = new Array();
    const tmp = str.split("\r\n");
    for(let i = 0; i < tmp.length; i++){
        array[i] = tmp[i].split(",");
    }
    return array;
}
//
function resizePlayer(){
    if(myApp.val.os != 'other'){
        if(Math.abs(window.orientation) != 90){
            // myApp.val.playerWidth  = document.documentElement.clientWidth;
            if(myApp.val.os == 'Android'){ myApp.val.playerWidth = window.innerWidth; } // In Android, clientWidth doesn't include scrollbar.
            if(myApp.val.os == 'iOS'){ myApp.val.playerWidth = document.documentElement.clientWidth; } // In iOS, innerWidth isn't static (it changes with device orientation).
            myApp.val.playerHeight = myApp.val.playerWidth/16*9;
        }else{
            myApp.val.playerWidth  = document.documentElement.clientWidth*2/3;
            myApp.val.playerHeight = myApp.val.playerWidth/16*9;
        }
        /* set special width of anscol to prevent the window is zoomed when the focus moveds to anscol */
        if(myApp.val.os == 'Android' && navigator.userAgent.match(/Firefox/)){
            myApp.elem.ansCol.style.width = myApp.val.playerWidth+'px';
        }else{
            myApp.elem.ansCol.style.width = myApp.val.playerWidth*0.9+'px';
        }
    }else{
        const tmpPlayerHeight = document.documentElement.clientHeight/2;
        const tmpPlayerWidth  = tmpPlayerHeight/9*16;
        if(tmpPlayerWidth < document.documentElement.clientWidth){
            myApp.val.playerHeight = tmpPlayerHeight;
            myApp.val.playerWidth  = tmpPlayerWidth;
        }else{
            myApp.val.playerWidth  = document.documentElement.clientWidth;
            myApp.val.playerHeight = myApp.val.playerWidth/16*9;
        }
    }
    if(myApp.val.initLoadBool == false || myApp.val.prevPlayerWidth != myApp.val.playerWidth){
        player.setSize(myApp.val.playerWidth, myApp.val.playerHeight);
        //
        myApp.val.prevPlayerWidth  = myApp.val.playerWidth;
        myApp.val.prevPlayerHeight = myApp.val.playerHeight;
    }
}
//
function resizePushButton(){
    if(myApp.val.os != "other"){
        if(Math.abs(window.orientation) != 90){
            const tmpImgHeight = document.documentElement.clientHeight-myApp.elem.pushBtn.getBoundingClientRect().top-parseInt(myApp.elem.numOX.style.lineHeight, 10);
            const tmpImgWidth  = myApp.elem.pushBtn.naturalWidth*tmpImgHeight/myApp.elem.pushBtn.naturalHeight;
            if(tmpImgWidth < document.documentElement.clientWidth){
                if(tmpImgHeight <= myApp.val.playerHeight){
                    myApp.val.pushBtnWidth  = tmpImgWidth;
                    myApp.val.pushBtnHeight = tmpImgHeight;
                }else{
                    myApp.val.pushBtnWidth  = myApp.elem.pushBtn.naturalWidth*myApp.val.playerHeight/myApp.elem.pushBtn.naturalHeight;
                    myApp.val.pushBtnHeight = myApp.val.playerHeight;
                }
            }else{
                myApp.val.pushBtnWidth  = document.documentElement.clientWidth/5;
                myApp.val.pushBtnHeight = myApp.elem.pushBtn.naturalHeight*myApp.val.pushBtnWidth/myApp.elem.pushBtn.naturalWidth;
            }
        }else{
            myApp.val.pushBtnWidth  = document.documentElement.clientWidth/5;
            myApp.val.pushBtnHeight = myApp.elem.pushBtn.naturalHeight*myApp.val.pushBtnWidth/myApp.elem.pushBtn.naturalWidth;
        }
        myApp.elem.pushBtn.style.margin = 'auto '+(document.documentElement.clientWidth-myApp.val.pushBtnWidth)/2+'px';
    }else{
        myApp.val.pushBtnWidth  = myApp.val.divBtnWidth;
        myApp.val.pushBtnHeight = myApp.elem.pushBtn.naturalHeight*myApp.val.pushBtnWidth/myApp.elem.pushBtn.naturalWidth;
    } 
    if(myApp.val.initLoadBool == false || myApp.val.prevClientHeight != document.documentElement.clientHeight){
        myApp.elem.pushBtn.width  = myApp.val.pushBtnWidth;
        myApp.elem.pushBtn.height = myApp.val.pushBtnHeight;
        updatePushButtonArea();
        //
        myApp.val.prevClientWidth  = document.documentElement.clientWidth;
        myApp.val.prevClientHeight = document.documentElement.clientHeight;
    }
}
//
function updatePushButtonArea(){
    myApp.val.pushBtnArea.left   = myApp.elem.pushBtn.getBoundingClientRect().left;
    myApp.val.pushBtnArea.right  = myApp.elem.pushBtn.getBoundingClientRect().right;
    myApp.val.pushBtnArea.top    = myApp.elem.pushBtn.getBoundingClientRect().top;
    myApp.val.pushBtnArea.bottom = myApp.elem.pushBtn.getBoundingClientRect().bottom;
    //
    /* In iOS, value of getBoundingClientRect is changed when the window is zoomed */
    if(myApp.val.os == 'iOS'){
        myApp.val.pushBtnArea.left   += window.pageXOffset;
        myApp.val.pushBtnArea.right  += window.pageXOffset;
        myApp.val.pushBtnArea.top    += window.pageYOffset;
        myApp.val.pushBtnArea.bottom += window.pageYOffset;
    }
}
//
function instantFocusToElement(focusUsableElement){
    /* keydown event is ready during the focus is in a js element */
    focusUsableElement.disabled = false;
    focusUsableElement.focus();
    focusUsableElement.blur();
    focusUsableElement.disabled = true;
}
//
function updateWatchedTime(currentPlayingTime, watchedTime){
    if(0.0 < currentPlayingTime - watchedTime && currentPlayingTime - watchedTime < 1.0){
        watchedTime = currentPlayingTime;
    }
    return watchedTime;
}
//
function playSndPushBtn(){
    if(myApp.elem.sounds.currentTime != myApp.val.audioSpriteData.pushBtn.start){
        myApp.elem.sounds.currentTime = myApp.val.audioSpriteData.pushBtn.start;
    }
    myApp.elem.sounds.play();
}
//
function playSndO(){
    myApp.elem.sounds.currentTime = myApp.val.audioSpriteData.sndO.start;
    myApp.elem.sounds.play();
}
//
function playSndX(){
    myApp.elem.sounds.currentTime = myApp.val.audioSpriteData.sndX.start;
    myApp.elem.sounds.play();
}
//
function hidePlayer(){
    player.setSize(myApp.val.playerWidth, 0);
}
//
function opposePlayer(){
    player.setSize(myApp.val.playerWidth, myApp.val.playerHeight);
}
//
function buttonCheck(responseInterval){
    playSndPushBtn();
    if(myApp.val.os == 'iOS'){
        myApp.elem.pushBtn.src = myApp.elem.imgBtn3.src;
    }else{
        myApp.elem.pushBtn.src = myApp.elem.imgBtn2.src;
        setTimeout(function(){ myApp.elem.pushBtn.src = myApp.elem.imgBtn3.src; }, 100);
    }
    setTimeout(function(){
        playSndO();
        myApp.elem.pushBtn.src = myApp.elem.imgBtn1.src;
    }, responseInterval);
}
//
function pushButton(){
    playSndPushBtn();
    // if(myApp.val.os != 'other'){ hidePlayer(); }
    hidePlayer();
    if(myApp.val.os == 'iOS'){
        myApp.elem.pushBtn.src = myApp.elem.imgBtn3.src;
    }else{
        myApp.elem.pushBtn.src = myApp.elem.imgBtn2.src;
        setTimeout(function(){ myApp.elem.pushBtn.src = myApp.elem.imgBtn3.src; }, 100);    
    }
    myApp.val.cntPush = myApp.val.cntPush+1;
}
//
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
        playSndO();
        myApp.val.cntO += 1;
        myApp.elem.text.innerHTML = "正解！";
        if(myApp.val.jumpToAnsBool){ jumpToAnswerIndex(myApp.val.ansIndex, myApp.val.ansIndexStartTime); }
    }else{
        playSndX();
        myApp.val.cntX += 1;
        myApp.elem.text.innerHTML = "不正解！"; //あと"+(myApp.val.limPush-myApp.val.cntPush)+"回解答できます。";
        if(myApp.val.jumpToAnsBool){ jumpToAnswerIndex(myApp.val.ansIndex, myApp.val.ansIndexStartTime); }
    }
    // if(myApp.val.os != 'other'){ opposePlayer(); }
    opposePlayer();
    myApp.elem.numOX.innerHTML  = "⭕️："+myApp.val.cntO+"　❌："+myApp.val.cntX;
    //
    if(window.orientation != 90){
        if(myApp.val.correctBool == false && myApp.val.limPush - myApp.val.cntPush == 0){
            myApp.elem.pushBtn.src = myApp.elem.imgBtn4.src;
        }else{
            myApp.elem.pushBtn.src = myApp.elem.imgBtn1.src;
        }
    }else{
        myApp.elem.pushBtn.src = myApp.elem.imgBtn4.src;
    }
}
function jumpToAnswerIndex(index, time){
    myApp.val.cntIndex = index-1;
    myApp.val.watchedTime = time-0.1;
    player.seekTo(time-0.1);
}
//
function printParams(){
    // myApp.elem.subText.innerHTML = myApp.val.os + ', ' + navigator.userAgent;
    // myApp.elem.paramText.innerHTML = document.styleSheets.item(0).cssRules;
    // myApp.elem.subText.innerHTML = myApp.elem.sounds.src;
    // myApp.elem.subText.innerHTML = "sounds.currentTime: " + Math.abs(Math.floor(myApp.elem.sounds.currentTime*1000)/1000);
    // myApp.elem.subText.innerHTML = "docWidth: " + document.documentElement.clientWidth +", "+
    //                             "docHeight: "+ document.documentElement.clientHeight + ", "+
    //                             "inWidth: "  + window.innerWidth + ", "+
    //                             "inHeight: " + window.innerHeight;
    // myApp.elem.subText.innerHTML = Math.floor(myApp.val.touchObject.pageX)      +', '+ Math.floor(myApp.val.touchObject.pageY) +' '+
    //                             '[' + Math.floor(myApp.val.pushBtnArea.left) +', '+ Math.floor(myApp.val.pushBtnArea.right) +'] '+
    //                             '[' + Math.floor(myApp.val.pushBtnArea.top)  +', '+ Math.floor(myApp.val.pushBtnArea.bottom)+'] '+
    //                             '| '+ window.pageXOffset +', '+ window.pageYOffset;
    // myApp.elem.subText.innerHTML = myApp.elem.numOX.getBoundingClientRect().top - myApp.elem.ansBtn.getBoundingClientRect().bottom;
    // myApp.elem.subText.innerHTML = 'loadErrorBool: ' + myApp.val.loadErrorBool + ', initLoadBool: ' + myApp.val.initLoadBool + ', loadCount: ' + myApp.val.loadCount;
    // myApp.elem.subText.innerHTML = 'playerWidth: '  + myApp.val.playerWidth  + ', innerWidth: '      + window.innerWidth;
    // myApp.elem.paramText.innerHTML = "<br>"+ 
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
    //                            myApp.val.ansArray[myApp.val.numQues-1][2].valueOf()+", "+
    //                            myApp.val.ansArray[myApp.val.numQues-1][3].valueOf()+", "+
    //                            myApp.val.ansArray[myApp.val.numQues-1][4].valueOf()+", "+
    //                            myApp.val.ansArray[myApp.val.numQues-1][5].valueOf()+"<br>"+
    //     "numAnswer: "        + myApp.val.ansArray.length+"<br>"+
    //     "answerLength: "     + myApp.val.ansArray[myApp.val.numQues-1].length+"<br>"+
    //     "correctBool: "      + myApp.val.correctBool+"<br>"+
    //     "composing: "        + myApp.val.composingBool+"<br>"+
    //     "index: "            + index+"<br>"+
    //     "cntIndex: "         + myApp.val.cntIndex+"<br>"+
    //     "cssRules: "         + document.styleSheets.item(0).cssRules.item(0).selectorText;
}
//
//---------------------------------------------------------------------------------------------------------------
/* set functions executed in each subtitle */
myApp.val.jumpToAnsBool = true;
myApp.val.srtFuncArray = [
    function(){
        myApp.val.viewFuncArray.shift()();
        /* 第1問 */
        myApp.val.ansIndex = 2;
        myApp.val.ansIndexStartTime = 20.78;
        //
        myApp.val.status = myApp.state.Question;
        myApp.val.numQues = 1;
        myApp.val.cntPush = 0;
        myApp.val.correctBool = false;
        myApp.elem.text.innerHTML = "第"+myApp.val.numQues+"問";
        myApp.elem.ansCol.value = "";
        if(Math.abs(window.orientation) != 90){ myApp.elem.pushBtn.src = myApp.elem.imgBtn1.src; }
    },
    function(){
        myApp.val.status = myApp.state.Talk;
    },
    function(){
        /* 第2問 */
        myApp.val.ansIndex = 4;
        myApp.val.ansIndexStartTime = 35.93;
        //
        myApp.val.status = myApp.state.Question;
        myApp.val.numQues = 2;
        myApp.val.cntPush = 0;
        myApp.val.correctBool = false;
        myApp.elem.text.innerHTML = "第"+myApp.val.numQues+"問";
        myApp.elem.ansCol.value = "";
        if(Math.abs(window.orientation) != 90){ myApp.elem.pushBtn.src = myApp.elem.imgBtn1.src; }
    },
    function(){
        myApp.val.status = myApp.state.Talk;
    },
    function(){
        /* 第3問 */
        myApp.val.ansIndex = 6;
        myApp.val.ansIndexStartTime = 54.61;
        //
        myApp.val.status = myApp.state.Question;
        myApp.val.numQues = 3;
        myApp.val.cntPush = 0;
        myApp.val.correctBool = false;
        myApp.elem.text.innerHTML = "第"+myApp.val.numQues+"問";
        myApp.elem.ansCol.value = "";
        if(Math.abs(window.orientation) != 90){ myApp.elem.pushBtn.src = myApp.elem.imgBtn1.src; }
    },
    function(){
        myApp.val.status = myApp.state.Talk;
    },
    function(){
        /* 第4問 */
        myApp.val.ansIndex = 8;
        myApp.val.ansIndexStartTime = 69.5;
        //
        myApp.val.status = myApp.state.Question;
        myApp.val.numQues = 4;
        myApp.val.cntPush = 0;
        myApp.val.correctBool = false;
        myApp.elem.text.innerHTML = "第"+myApp.val.numQues+"問";
        myApp.elem.ansCol.value = "";
        if(Math.abs(window.orientation) != 90){ myApp.elem.pushBtn.src = myApp.elem.imgBtn1.src; }
    },
    function(){
        myApp.val.status = myApp.state.Talk;
    },
    function(){
        /* 第5問 */
        myApp.val.ansIndex = 10;
        myApp.val.ansIndexStartTime = 86.39;
        //
        myApp.val.status = myApp.state.Question;
        myApp.val.numQues = 5;
        myApp.val.cntPush = 0;
        myApp.val.correctBool = false;
        myApp.elem.text.innerHTML = "第"+myApp.val.numQues+"問";
        myApp.elem.ansCol.value = "";
        if(Math.abs(window.orientation) != 90){ myApp.elem.pushBtn.src = myApp.elem.imgBtn1.src; }
    },
    function(){
        myApp.val.status = myApp.state.Talk;
    },
];

1
00:00:06,010 --> 00:00:20,780


2
00:00:20,780 --> 00:00:23,800


3
00:00:23,800 --> 00:00:35,930


4
00:00:35,930 --> 00:00:38,950


5
00:00:38,950 --> 00:00:54,610


6
00:00:54,610 --> 00:00:57,630


7
00:00:57,630 --> 00:01:09,500


8
00:01:09,500 --> 00:01:12,510


9
00:01:12,510 --> 00:01:26,390


10
00:01:26,390 --> 00:01:29,420

