0
00:00:00,000 --> 00:00:00,999
/* CAUTION : Each sections of subtitle has independent scope. */
doOnce[index] = true;
//
/*  */
const myApp = {
    os: null,
    state: {
        ButtonCheck : 0, //ボタンチェックの待機
        Question    : 1, //問い読み中（その間は早押し可能）
        MyAnswer    : 2, //自分が解答権を所持（解答の入力と送信が可能）
        OthAnswer   : 3, //他者が解答権を所持（その間は早押し不可能）
        Talk        : 4, //導入,解説,閑話,締めなど（コントロールバーの操作が可能）
    },
    videoState: {
        Playing : 1,
        Stopped : 2,
    },
    elem: {
        text    : document.createElement("text"),     //動画タイトル等
        ansCol  : document.createElement("textarea"), //解答を入力するテキストエリア
        ansBtn  : document.createElement("button"),   //解答を送信するボタン
        numOX   : document.createElement("text"),     //◯正答数と✖誤答数
        pushBtn : document.createElement("img"),      //ボタンの画像
        imgBtn1 : document.createElement("img"),
        imgBtn2 : document.createElement("img"),
        imgBtn3 : document.createElement("img"),
        sndPush : document.createElement("audio"),    //ボタンの押下音
        sndO    : document.createElement("audio"),    //正解音
        sndX    : document.createElement("audio"),    //不正解音
        br1     : document.createElement("br"),       //改行用
        br2     : document.createElement("br"),       //改行用
        br3     : document.createElement("br"),       //改行用
        br4     : document.createElement("br"),       //改行用
        subText : document.createElement("text"),     //予備
    },
    val: {
        playerWidth   : 0,
        playerHeight  : 0,
        pushBtnWidth  : 0,
        pushBtnHeight : 0,
        imgLoadBool   : false,
        pushBtnArea   : null,  
        //
        numQues     : 0,  //設問番号
        ansArray    : [], //正答リスト
        cntO        : 0,  //合計正答数
        cntX        : 0,  //合計誤答数
        cntPush     : 0,  //解答した回数
        limPush     : 5,  //1問あたりの解答可能な回数
        correctBool : false, //答え合わせ結果(結果に応じて状態遷移)
        //
        /* 早押しボタン用のキー設定 */
        btnCode : 32, //スペースキー
        //
        /* 状態の管理 */
        status           : this.state.Talk, //現在の状態
        cntIndex         : 0,               //字幕区間をカウント
        cntExecutedIndex : 0,
        //
        /* 時間管理 */
        ansTime: {
            limit   : 20000, //[ms], 解答の制限時間
            elapsed : 0,     //[ms], 解答権取得後の経過時間    
        },
        currTime: {
            playing : 0, //再生中に取得する動画位置
            stopped : 0, //停止時に取得する動画位置
        },
        watchedTime : 0, //視聴済みの範囲
        diffTime    : 0, //視聴済みの範囲と再生位置の差分
        //
        /* for prevent specific action */
        numFingers    : 0,     // (pinch gesture)
        firstTapBool  : false, // (double tap gesture)
        composingBool : false, // (starting a new line in textarea)
    },
};
//
/* set ID to focus-usable elements */
myApp.elem.ansCol.id = 'anscol';
myApp.elem.ansBtn.id = 'ansbtn';
document.getElementsByTagName("body")[0].id = 'body';
//
/* View */
/* add rule of body to style sheet */
document.styleSheets.item(0).insertRule('body {text-align: center; margin: auto; background: #EFEFEF;}');
//
/*  */
myApp.os = fetchOSType();
if (myApp.os == "other" || myApp.os != 'other'){
    //
    /* set elements */
    document.getElementsByTagName("body")[0].appendChild(myApp.elem.text);
    document.getElementsByTagName('body')[0].appendChild(myApp.elem.br1)
    document.getElementsByTagName("body")[0].appendChild(myApp.elem.ansCol);
    document.getElementsByTagName("body")[0].appendChild(myApp.elem.br2);    
    document.getElementsByTagName("body")[0].appendChild(myApp.elem.ansBtn); 
    document.getElementsByTagName("body")[0].appendChild(myApp.elem.br3);    
    document.getElementsByTagName("body")[0].appendChild(myApp.elem.pushBtn);
    document.getElementsByTagName("body")[0].appendChild(myApp.elem.br4);    
    document.getElementsByTagName("body")[0].appendChild(myApp.elem.numOX);
    // document.getElementsByTagName("body")[0].appendChild(myApp.elem.subText);
    //
    myApp.elem.text.style.fontSize    = '40px' 
    myApp.elem.text.style.lineHeight  = '100px'
    myApp.elem.text.style.fontWeight  = 'bold';
    // myApp.elem.ansCol.cols            = '35';
    myApp.elem.ansCol.style.fontSize  = '35px';
    myApp.elem.ansCol.style.textAlign = 'center'; 
    myApp.elem.ansBtn.style.fontSize  = '35px';
    myApp.elem.numOX.style.fontSize   = '40px';
    myApp.elem.numOX.style.lineHeight = '50px';
    myApp.elem.numOX.style.fontWeight = 'bold';
    //
    /* load image of push button */
    myApp.elem.imgBtn1.src = "https://github.com/t-yokota/quizBattle/raw/devel/convertToES6/figures/button_1.png";
    myApp.elem.imgBtn2.src = "https://github.com/t-yokota/quizBattle/raw/devel/convertToES6/figures/button_2.png";
    myApp.elem.imgBtn3.src = "https://github.com/t-yokota/quizBattle/raw/devel/convertToES6/figures/button_3.png";
    //
    /* resize image to fit window size */
    myApp.elem.pushBtn.onload = function(){
        if(myApp.val.imgLoadBool == false){
            myApp.val.imgLoadBool = true;
            const tmpImgHeight = window.innerHeight-myApp.elem.pushBtn.getBoundingClientRect().top-parseInt(myApp.elem.numOX.style.lineHeight)-20;
            const tmpImgWidth  = myApp.elem.pushBtn.naturalWidth*tmpImgHeight/myApp.elem.pushBtn.naturalHeight;
            if(tmpImgWidth < window.innerWidth){
                myApp.val.pushBtnWidth = tmpImgWidth;
                myApp.val.pushBtnHeight = tmpImgHeight;
            }else{
                myApp.val.pushBtnWidth = window.innerWidth;
                myApp.val.pushBtnHeight = myApp.elem.pushBtn.naturalHeight*myApp.val.pushBtnWidth/myApp.elem.pushBtn.naturalWidth;
            }
            myApp.elem.pushBtn.width = myApp.val.pushBtnWidth;
            myApp.elem.pushBtn.height = myApp.val.pushBtnHeight;
            myApp.val.pushBtnArea = myApp.elem.pushBtn.getBoundingClientRect();
        }
    }
    myApp.elem.pushBtn.width = window.innerWidth;
    //
    /* assign default image to push button */
    myApp.elem.pushBtn.src   = myApp.elem.imgBtn1.src;
    //
    /* change player size */
    myApp.val.playerWidth  = window.innerWidth;
    myApp.val.playerHeight = window.innerWidth/16*9;
    player.setSize(myApp.val.playerWidth, myApp.val.playerHeight);
    //
    /* add textnodes to the elements */
    const node_text    = document.createTextNode("");
    const node_subText = document.createTextNode("");　
    const node_numOX   = document.createTextNode("");
    myApp.elem.text.appendChild(node_text);
    myApp.elem.subText.appendChild(node_subText);
    myApp.elem.numOX.appendChild(node_numOX);
    //
    /* set init value to the elements */
    myApp.elem.text.innerHTML    = "quizBattle.srt.js";
    myApp.elem.ansCol.value      = "ここに解答を入力";
    myApp.elem.ansBtn.innerHTML  = "解答を送信";
    myApp.elem.numOX.innerHTML   = "⭕️："+myApp.val.cntO+"　❌："+myApp.val.cntX;
    myApp.elem.ansCol.disabled   = true;
    myApp.elem.ansBtn.disabled   = true;
} else {
    myApp.elem.subText.style.fontSize   = '20px'; 
    myApp.elem.subText.style.lineHeight = '32px';
    myApp.elem.ansCol.style.fontSize    = '20px'; 
    myApp.elem.ansBtn.style.fontSize    = '20px';
    //
    myApp.elem.imgBtn1.width = document.body.clientWidth;
    myApp.elem.imgBtn2.width = document.body.clientWidth;
    myApp.elem.imgBtn3.width = document.body.clientWidth;
    myApp.elem.imgBtn1.src = "https://github.com/t-yokota/quizBattle/raw/devel/convertToES6/figures/button1.png";
    myApp.elem.imgBtn2.src = "https://github.com/t-yokota/quizBattle/raw/devel/convertToES6/figures/button2.png";
    myApp.elem.imgBtn3.src = "https://github.com/t-yokota/quizBattle/raw/devel/convertToES6/figures/button3.png";
    //
    myApp.elem.pushBtn.width = document.body.clientWidth;
    myApp.elem.pushBtn.src = myApp.elem.imgBtn1.src;
    // elementを表示
    document.getElementsByTagName("body")[0].appendChild(myApp.elem.pushBtn);
    document.getElementsByTagName("body")[0].appendChild(myApp.elem.text);
    document.getElementsByTagName("body")[0].appendChild(myApp.elem.subText);
    document.getElementsByTagName("body")[0].appendChild(myApp.elem.br1);
    document.getElementsByTagName("body")[0].appendChild(myApp.elem.br2);
    document.getElementsByTagName("body")[0].appendChild(myApp.elem.ansCol);
    document.getElementsByTagName("body")[0].appendChild(myApp.elem.br3);
    document.getElementsByTagName("body")[0].appendChild(myApp.elem.ansBtn);
    document.getElementsByTagName("body")[0].appendChild(myApp.elem.numOX);
    //
    // textNodeを作成してelementに追加
    const node_text    = document.createTextNode("");
    const node_subText = document.createTextNode("");　
    const node_numOX   = document.createTextNode("");
    myApp.elem.text.appendChild(node_text);
    myApp.elem.subText.appendChild(node_subText);
    myApp.elem.numOX.appendChild(node_numOX);
    //
    // elementの初期値の設定
    myApp.elem.text.innerHTML    = "quizBattle.srt.js";  //動画タイトル
    myApp.elem.subText.innerHTML = "動画の相手とクイズ対決"; //動画の説明
    myApp.elem.ansCol.value      = "ここに解答を入力してください";
    myApp.elem.ansBtn.innerHTML  = "解答を送信";
    myApp.elem.ansCol.disabled   = true;
    myApp.elem.ansBtn.disabled   = true;
}
//
/* get audio data */
myApp.elem.sndPush.src = "https://raw.githubusercontent.com/t-yokota/quizBattle/master/sounds/push.mp3";
myApp.elem.sndO.src    = "https://raw.githubusercontent.com/t-yokota/quizBattle/master/sounds/correct.mp3";
myApp.elem.sndX.src    = "https://raw.githubusercontent.com/t-yokota/quizBattle/master/sounds/discorrect.mp3";
//
/* get answer list */
const ansCSV = "https://raw.githubusercontent.com/t-yokota/quizBattle/master/answer_UTF-8.csv"; //UTF-8
const file = new XMLHttpRequest();
file.open("get", ansCSV, true);
file.send(null);
file.onload = function(){
    myApp.val.ansArray = CSVtoArray(file.responseText);
};
//
/* set main keydown event */
document.addEventListener("compositionstart", function(){ myApp.val.composingBool = true; });
document.addEventListener('compositionend', function(){ myApp.val.composingBool = false; });
document.onkeydown = myKeyDownEvent;
function myKeyDownEvent(){
    if(event.keyCode == myApp.val.btnCode){
        if(myApp.val.status == myApp.state.ButtonCheck && myApp.val.imgLoadBool == true){
            const interval = 1000;
            buttonCheck(interval);
            myApp.val.status = myApp.state.Talk;
            setTimeout(function(){ player.playVideo(); }, interval+1000);
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
//
/* set main touchstart event (for smartphone) */
document.addEventListener("touchstart", myTouchEvent);
function myTouchEvent(event){
    const touchObject = event.changedTouches[0];
    if( myApp.val.pushBtnArea.left < touchObject.pageX && touchObject.pageX < myApp.val.pushBtnArea.right ){
        if( myApp.val.pushBtnArea.top < touchObject.pageY && touchObject.pageY < myApp.val.pushBtnArea.bottom ){
            if(myApp.val.status == myApp.state.ButtonCheck){
                const interval = 1000; 
                buttonCheck(interval);
                myApp.val.status = myApp.state.Talk;
                setTimeout(function(){ player.playVideo(); }, interval+1000);
            }
            if(myApp.val.status == myApp.state.Question){
                pushButton();
                myApp.val.status  = myApp.state.MyAnswer;
                player.pauseVideo();
            }
        }
    }
}
//
/* set touchstart event for preventing pinch gesture (for smartphone) */
document.addEventListener('touchstart', disablePinchGesture, {passive: false});
function disablePinchGesture(){
    myApp.val.numFingers = event.touches.length;
    if(event.touches.length > 1){
        event.preventDefault();
    }
}
//
/* set touchend event for preventing double tap gesture (for smartphone) */
document.addEventListener('touchend', disableDoubleTapGesture, {passive: false});
function disableDoubleTapGesture(){
    if(myApp.val.firstTapBool){
        event.preventDefault();
    }else{
        myApp.val.firstTapBool = true;
        setTimeout(function(){ myApp.val.firstTapBool = false; }, 100);
    }
}
//
/* set main event listener */
player.addEventListener('onStateChange', myEventListener);
function myEventListener(){
    if(player.getPlayerState() == myApp.videoState.Playing){
        myApp.val.currTime.playing = player.getCurrentTime();
        myApp.val.watchedTime = updateWatchedTime(myApp.val.currTime.playing, myApp.val.watchedTime);
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
        // シークバーによる再生位置のジャンプを無効にする処理
        if(myApp.val.status == myApp.state.Question){
            myApp.val.diffTime = Math.abs(myApp.val.currTime.playing - myApp.val.watchedTime);
            if(myApp.val.diffTime > 1.0){
                player.seekTo(myApp.val.watchedTime);
            }
        }else{
            myApp.val.diffTime = Math.abs(myApp.val.currTime.playing - myApp.val.watchedTime);
            // 前に戻る処理は有効とする場合 
            // myApp.val.diffTime = myApp.val.currTime.playing - myApp.val.watchedTime;
            if(myApp.val.diffTime > 1.0){
                player.seekTo(myApp.val.watchedTime);
            }
        }
    }
    if(player.getPlayerState() == myApp.videoState.Stopped){
        myApp.val.currTime.stopped = player.getCurrentTime();
        if(myApp.val.status == myApp.state.MyAnswer){
            setTimeout(function(){ focusToAnsCol(); }, 500);
        }
        // シークバーによる再生位置のジャンプを無効にする処理
        // 動画の一時停止を無効にする処理
        if(myApp.val.status == myApp.state.Question){
            myApp.val.diffTime = Math.abs(myApp.val.currTime.stopped - myApp.val.watchedTime);
            if(myApp.val.diffTime > 1.0){
                player.seekTo(myApp.val.watchedTime);
            }
            player.playVideo();
        }else{
            myApp.val.diffTime = Math.abs(myApp.val.currTime.stopped - myApp.val.watchedTime);
            // 前に戻る処理は有効とする場合
            // myApp.val.diffTime = myApp.val.currTime.stopped - myApp.val.watchedTime;
            if(myApp.val.diffTime > 1.0){
                player.seekTo(myApp.val.watchedTime);
                // 動画の一時停止は有効にする場合
                player.playVideo();
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
        if(myApp.val.status == myApp.state.ButtonCheck){
            player.pauseVideo();
        }
        if(myApp.val.status != myApp.state.MyAnswer){
            if(index > myApp.val.cntIndex){
                srtFuncArray.shift()();
                myApp.val.cntIndex += 1;
            }
        }
    }
    if(myApp.val.status == myApp.state.MyAnswer){
        if(document.activeElement.id != "anscol" && myApp.elem.ansCol.value.valueOf() === ""){
            myApp.elem.ansCol.focus();
        }
        /* 解答権を所持したまま一定時間経過したときの処理 */
        /* 一定時間経過 -> その時点の入力内容で正誤判定をして適切な状態へ移行 -> 動画を再生 */
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
//解答送信ボタンのクリックイベントを設定
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
//各種関数の定義
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
/**
 * csvファイルを読み込んで配列に格納する関数
 * @param {string} str
 * @returns {array} n行m列の配列を返す（n:問題数, m:最大の解答のパターン数）
 */
function CSVtoArray(str){
    const array = new Array();
    const tmp = str.split("\n");
    for (let i = 0; i < tmp.length; i++) {
        array[i] = tmp[i].split(",");
    }
    return array;
}
/**
 * キーイベントを発生させるためのイベントリスナー用の関数 
 * jsの描画範囲内にフォーカスすることで、キーイベントが発生可能な状態にする
 */
function instantFocusToElement(focusUsableElement){
    focusUsableElement.disabled = false;
    focusUsableElement.focus();
    focusUsableElement.blur();
    focusUsableElement.disabled = true;
}
/**
 * ボタンチェックのキーイベント用の関数 
 * 特定のキーが押されたら押下音+正解音を流して動画を再開する
 */
function buttonCheck(responseInterval){
    myApp.elem.sndPush.play();
    myApp.elem.pushBtn.src = myApp.elem.imgBtn2.src;
    setTimeout(function(){ myApp.elem.pushBtn.src = myApp.elem.imgBtn3.src; }, 100);
    setTimeout(function(){ myApp.elem.sndO.play(); myApp.elem.pushBtn.src = myApp.elem.imgBtn1.src; }, responseInterval);
}
/**
 * 早押しのキーイベント用の関数
 * 問題中に特定のキーが押下されたら押下音を再生して解答回数を記録
 */
function pushButton(){
    myApp.elem.sndPush.play();
    myApp.elem.pushBtn.src = myApp.elem.imgBtn2.src;
    setTimeout(function(){ myApp.elem.pushBtn.src = myApp.elem.imgBtn3.src; }, 100);
    myApp.val.cntPush = myApp.val.cntPush+1;
}
/**
 * 解答入力欄への遷移するキーイベント用の関数
 * 早押し後のkeyup時に解答欄にフォーカスし、解答の送信と正誤判定を可能にする
 */
function focusToAnsCol(){
    myApp.elem.ansCol.disabled = false;
    myApp.elem.ansCol.value = "";
    myApp.elem.ansCol.focus();
    myApp.elem.ansBtn.disabled = false;
}
/**
 * 視聴範囲取得用の関数
 */
function updateWatchedTime(currentPlayingTime, watchedTime){
    if(0.0 < currentPlayingTime - watchedTime && currentPlayingTime - watchedTime < 1.0){
        watchedTime = currentPlayingTime;
    }
    return watchedTime;
}
/**
 * sleep関数
 */
function busySleep(waitMsec) {
    const startMsec = new Date();
    while (new Date() - startMsec < waitMsec);
}
/**
 * 正誤判定用の関数
 */
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
        myApp.elem.text.innerHTML = "正解です！";
    }else{
        myApp.elem.sndX.play();
        myApp.val.cntX += 1;
        myApp.elem.text.innerHTML = "不正解です！";// あと"+(myApp.val.limPush-myApp.val.cntPush)+"回解答できます。";
    }
    myApp.elem.numOX.innerHTML  = "⭕️："+myApp.val.cntO+"　❌："+myApp.val.cntX;
    myApp.elem.pushBtn.src = myApp.elem.imgBtn1.src;
}
/**
 * パラメータ表示（デバッグ用） 
 */
function printParams(){
    // myApp.elem.text.innerHTML = document.activeElement.id;
    // myApp.elem.text.innerHTML = index+", "+myApp.val.cntIndex+", "+myApp.val.cntExecutedIndex;
    myApp.elem.text.innerHTML = document.styleSheets.item(1).cssRules.length;
    myApp.elem.subText.innerHTML = 
        "device: "           + myApp.os+"<br>"+
        "activeElem: "       + document.activeElement.id+"<br>"+   
        "status: "           + myApp.val.status+"<br>"+
        "timePlay: "         + myApp.val.currTime.playing.toFixed(3)+"<br>"+
        "timeStop: "         + myApp.val.currTime.stopped.toFixed(3)+"<br>"+
        "WatchedTime: "      + myApp.val.watchedTime.toFixed(3)+"<br>"+
        "diffTime: "         + myApp.val.diffTime.toFixed(3)+"<br>"+
        "limPush: "          + myApp.val.limPush+"<br>"+ 
        "cntPush: "          + myApp.val.cntPush+"<br>"+
        "remainingAnsTime: " + Math.floor((myApp.val.ansTime.limit-myApp.val.ansTime.elapsed)/1000)+"<br>"+
        "answer: "           + myApp.val.ansArray[myApp.val.numQues-1][0].valueOf()+", "+
                               myApp.val.ansArray[myApp.val.numQues-1][1].valueOf()+", "+
                               myApp.val.ansArray[myApp.val.numQues-1][2].valueOf()+"<br>"+
        "answerLength: "     + myApp.val.ansArray[myApp.val.numQues-1].length+"<br>"+
        "correctBool: "      + myApp.val.correctBool+"<br>"+
        "composing: "        + myApp.val.composingBool+"<br>"+
        "touchLength: "      + myApp.val.numFingers+"<br>"+
        "index: "            + index+"<br>"+
        "cntIndex: "         + myApp.val.cntIndex+"<br>"+
        "executedIndex: "    + myApp.val.cntExecutedIndex +'<br>'+
        'cssRules: '         + document.styleSheets.item(0).cssRules.item(0).selectorText+'<br>'+
        'cssRules: '         + document.styleSheets.item(0).cssRules.item(1).selectorText+'<br>'+
        'cssRules: '         + document.styleSheets.item(0).cssRules.item(2).selectorText+'<br>'+
        'cssRules: '         + document.styleSheets.item(0).cssRules.item(3).selectorText+'<br>'+
        'cssRules: '         + document.styleSheets.item(0).cssRules.item(4).selectorText+'<br>'+
        'cssRules: '         + document.styleSheets.item(0).cssRules.item(5).selectorText+'<br>'+
        'cssRules: '         + document.styleSheets.item(0).cssRules.item(6).selectorText+'<br>'+
        'cssRules: '         + document.styleSheets.item(0).cssRules.item(7).selectorText+'<br>'+
        'cssRules: '         + document.styleSheets.item(0).cssRules.item(8).selectorText
}
/**
 * 各字幕区間で実行する関数
 */
const srtFuncArray = [
    function(){
        // index = 2
        /* 第１問 */
        myApp.val.status = myApp.state.Question;
        myApp.val.numQues = 1;
        myApp.val.cntPush = 0;
        myApp.elem.text.innerHTML = "第"+myApp.val.numQues+"問";
        myApp.elem.subText.innerHTML = "答えが分かったら、スペースキーを押して解答権を得る！";
        myApp.val.cntExecutedIndex += 1;
    },
    function(){
        // index = 3
        /* 閑話1 */
        myApp.val.status = myApp.state.Talk;
        myApp.elem.subText.innerHTML = "解説";
        myApp.val.cntExecutedIndex += 1;
    },
    function(){
        // index = 4
        /* 第２問 */
        myApp.val.status = myApp.state.Question;
        myApp.val.numQues = 2;
        myApp.val.cntPush = 0;
        myApp.elem.text.innerHTML = "第"+myApp.val.numQues+"問";
        myApp.elem.subText.innerHTML = "答えが分かったら、スペースキーを押して解答権を得る！";
        myApp.val.cntExecutedIndex += 1;
    },
    function(){
        // index = 5
        /* 閑話2 */
        myApp.val.status = myApp.state.Talk;
        myApp.elem.subText.innerHTML = "解説";
        myApp.val.cntExecutedIndex += 1;
    },
    function(){
        // index = 6
        /* 第３問 */
        myApp.val.status = myApp.state.Question;
        myApp.val.numQues = 3;
        myApp.val.cntPush = 0;
        myApp.elem.text.innerHTML = "第"+myApp.val.numQues+"問";
        myApp.elem.subText.innerHTML = "答えが分かったら、スペースキーを押して解答権を得る！";
        myApp.val.cntExecutedIndex += 1;
    },
    function(){
        // index = 7
        /* 閑話3 */
        myApp.val.status = myApp.state.Talk;
        myApp.elem.subText.innerHTML = "解説";
        myApp.val.cntExecutedIndex += 1;
    }
];
/* button check */
myApp.val.status = myApp.state.ButtonCheck;
player.pauseVideo();
myApp.elem.text.innerHTML = "ボタンチェックして再生開始";
myApp.elem.subText.innerHTML = "スペースキーが早押しボタンです。"+
    "スペースキーを押して音と動作を確認してください。<br>"+
    "動画の進行に合わせてクイズが始まります。";

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