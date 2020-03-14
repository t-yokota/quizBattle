0
00:00:00,000 --> 00:00:00,999
/* CAUTION : 字幕区間ごとにスコープは独立している */
doOnce[index] = true;
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
        text    : document.createElement("h1"),       //動画タイトル等
        subText : document.createElement("text"),     //動画の説明文等
        numOX   : document.createElement("text"),       //◯正答数と✖誤答数
        ansCol  : document.createElement("textarea"), //解答を入力するテキストエリア
        ansBtn  : document.createElement("button"),   //解答を送信するボタン
        br1     : document.createElement("br"),       //改行用
        br2     : document.createElement("br"),       //改行用
        br3     : document.createElement("br"),       //改行用
        sndPush : document.createElement("audio"),    //ボタンの押下音
        sndO    : document.createElement("audio"),    //正解音
        sndX    : document.createElement("audio"),    //不正解音
        pushBtn : document.createElement("img"),      //ボタンの画像
        imgBtn1 : document.createElement("img"),
        imgBtn2 : document.createElement("img"),
        imgBtn3 : document.createElement("img"),
    },
    val: {
        playerWidth  : 0,
        playerHeight : 0,
        imgLoadBool  : false,
        pushBtnArea  : null,  
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
        /* preventDefault */
        numFingers    : 0,
        firstTapBool  : false,
        composingBool : false,
        //
        /* 時間管理 */
        ansTime: {
            limit   : 10000, //[ms], 解答の制限時間
            elapsed : 0,     //[ms], 解答権取得後の経過時間    
        },
        currTime: {
            playing : 0, //再生中に取得する動画位置
            stopped : 0, //停止時に取得する動画位置
        },
        watchedTime : 0, //視聴済みの範囲
        diffTime    : 0, //視聴済みの範囲と再生位置の差分
    },
};
//
// set ID to focus-usable elements
myApp.elem.ansCol.id = 'anscol';
myApp.elem.ansBtn.id = 'ansbtn';
document.getElementsByTagName("body")[0].id = 'body';
//
/* View */
// add rule of body to style sheet
document.styleSheets.item(0).insertRule('body {text-align: center; margin: auto; background: #EFEFEF;}');
//
// 各elementのフォントサイズ等を設定
myApp.os = fetchOSType();
if (myApp.os == "other" || myApp.os != 'other'){
    // set elements
    document.getElementsByTagName("body")[0].appendChild(myApp.elem.text);
    document.getElementsByTagName("body")[0].appendChild(myApp.elem.ansCol);
    document.getElementsByTagName("body")[0].appendChild(myApp.elem.br1);    
    document.getElementsByTagName("body")[0].appendChild(myApp.elem.ansBtn); 
    document.getElementsByTagName("body")[0].appendChild(myApp.elem.br2);    
    document.getElementsByTagName("body")[0].appendChild(myApp.elem.pushBtn);
    document.getElementsByTagName("body")[0].appendChild(myApp.elem.br3);    
    // document.getElementsByTagName("body")[0].appendChild(myApp.elem.subText);
    document.getElementsByTagName("body")[0].appendChild(myApp.elem.numOX);
    //
    myApp.elem.ansCol.cols            = 35;
    myApp.elem.ansCol.style.fontSize  = '30px';
    myApp.elem.ansCol.style.textAlign = 'center'; 
    myApp.elem.ansBtn.style.fontSize  = '30px';
    myApp.elem.numOX.style.fontSize   = '40px';
    myApp.elem.numOX.style.lineHeight = '150px';
    myApp.elem.numOX.style.fontWeight = 'bold';
    //
    myApp.elem.imgBtn1.src = "https://github.com/t-yokota/quizBattle/raw/devel/convertToES6/figures/button_1.png";
    myApp.elem.imgBtn2.src = "https://github.com/t-yokota/quizBattle/raw/devel/convertToES6/figures/button_2.png";
    myApp.elem.imgBtn3.src = "https://github.com/t-yokota/quizBattle/raw/devel/convertToES6/figures/button_3.png";
    // myApp.elem.imgBtn1.width = window.innerWidth;
    //
    myApp.elem.pushBtn.onload = function(){
        myApp.val.imgLoadBool = true;
        const tmpImgHeight = window.innerHeight - myApp.elem.pushBtn.getBoundingClientRect().top - parseInt(myApp.elem.numOX.style.lineHeight);
        const tmpImgWidth  = myApp.elem.pushBtn.naturalWidth * tmpImgHeight/myApp.elem.pushBtn.naturalHeight;
        if(tmpImgWidth < window.innerWidth){
            myApp.elem.pushBtn.width  = tmpImgWidth;
            myApp.elem.pushBtn.height = tmpImgHeight;
        }else{
            myApp.elem.pushBtn.width = window.innerWidth;
        }
        myApp.val.pushBtnArea = myApp.elem.pushBtn.getBoundingClientRect();
        // alert(parseInt(myApp.elem.numOX.style.lineHeight))
    }
    myApp.elem.pushBtn.width = window.innerWidth;
    myApp.elem.pushBtn.src   = myApp.elem.imgBtn1.src;
    //
    // change player size
    myApp.val.playerWidth  = window.innerWidth;
    myApp.val.playerHeight = window.innerWidth/16*9;
    player.setSize(myApp.val.playerWidth, myApp.val.playerHeight);
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
    myApp.elem.ansCol.value      = "解答をここに入力";
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
// audioデータの指定
myApp.elem.sndPush.src = "https://raw.githubusercontent.com/t-yokota/quizBattle/master/sounds/push.mp3";
myApp.elem.sndO.src    = "https://raw.githubusercontent.com/t-yokota/quizBattle/master/sounds/correct.mp3";
myApp.elem.sndX.src    = "https://raw.githubusercontent.com/t-yokota/quizBattle/master/sounds/discorrect.mp3";
//
//正答リストの指定・読み込み
const ansCSV = "https://raw.githubusercontent.com/t-yokota/quizBattle/master/answer_UTF-8.csv"; //UTF-8
const file = new XMLHttpRequest();
file.open("get", ansCSV, true);
file.send(null);
file.onload = function(){
    myApp.val.ansArray = CSVtoArray(file.responseText);
};
//
document.addEventListener('touchstart', disablePinchGesture, {passive: false});
function disablePinchGesture(){
    myApp.val.numFingers = event.touches.length;
    if(event.touches.length > 1){
        event.preventDefault();
    }
}
document.addEventListener('touchend', disableDoubleTapGesture, {passive: false});
function disableDoubleTapGesture(){
    if(myApp.val.firstTapBool){
        event.preventDefault();
    }else{
        myApp.val.firstTapBool = true;
        setTimeout(function(){ myApp.val.firstTapBool = false; }, 500);
    }
}
//早押しのためのキーイベントの設定
//
document.addEventListener("compositionstart", function(){ myApp.val.composingBool = true; });
document.addEventListener('compositionend', function(){ myApp.val.composingBool = false; });
//
document.onkeydown = myKeyDownEvent;
function myKeyDownEvent(){
    if(event.keyCode == myApp.val.btnCode){
        if(myApp.val.status == myApp.state.ButtonCheck){ 
            buttonCheck(myApp.elem.sndPush, myApp.elem.sndO);
            myApp.val.status = myApp.state.Talk;
            player.playVideo();
        }
        if(myApp.val.status == myApp.state.Question){
            myApp.val.cntPush = pushButton(myApp.val.cntPush, myApp.elem.sndPush);
            myApp.val.status  = myApp.state.MyAnswer;
            player.pauseVideo();
        }
    }
    if(event.keyCode == 13/* Enter */){
        if(myApp.val.composingBool == false){
            return false;
        }
    }
}
// myApp.elem.pushBtn.onmousedown = myTouchEvent;
document.addEventListener("touchstart", myTouchEvent);
function myTouchEvent(event){
    const touchObject = event.changedTouches[0];
    if( myApp.val.pushBtnArea.left < touchObject.pageX && touchObject.pageX < myApp.val.pushBtnArea.right ){
        if( myApp.val.pushBtnArea.top < touchObject.pageY && touchObject.pageY < myApp.val.pushBtnArea.bottom ){
            if(myApp.val.status == myApp.state.ButtonCheck){ 
                buttonCheck(myApp.elem.sndPush, myApp.elem.sndO);
                myApp.val.status = myApp.state.Talk;
                player.playVideo();
            }
            if(myApp.val.status == myApp.state.Question){
                myApp.val.cntPush = pushButton(myApp.val.cntPush, myApp.elem.sndPush);
                myApp.val.status  = myApp.state.MyAnswer;
                player.pauseVideo();
            }
        }
    }
}
//動画の再生・停止時のイベントリスナーの設定
player.addEventListener('onStateChange', myEventListener);
function myEventListener(){
    if(player.getPlayerState() == myApp.videoState.Playing){
        myApp.val.currTime.playing = player.getCurrentTime();
        myApp.val.watchedTime = updateWatchedTime(myApp.val.currTime.playing, myApp.val.watchedTime);
        if(myApp.val.status == myApp.state.MyAnswer){
            player.pauseVideo();
            checkAnswer(myApp.val, myApp.elem);
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
            focusToAnsCol(myApp.elem.ansBtn, myApp.elem.ansCol);
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
//定期実行する関数の設定
setInterval(myIntervalEvent, interval = 10); //[ms]
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
        myApp.elem.subText.innerHTML = "あと"+Math.floor((myApp.val.ansTime.limit-myApp.val.ansTime.elapsed)/1000)+"秒で解答を送信してください";
        if(myApp.val.ansTime.elapsed >= myApp.val.ansTime.limit){
            checkAnswer(myApp.val, myApp.elem);
            if(myApp.val.correctBool == true || myApp.val.limPush - myApp.val.cntPush == 0){
                myApp.val.status = myApp.state.Talk;
            }else{  
                myApp.val.status = myApp.state.Question;
            }
            player.playVideo();
        }
    }else{
        if(document.activeElement.id == "player"){
            focusToBody(myApp.elem.ansCol);
        }
        myApp.val.ansTime.elapsed = 0;
    }
    /* デバッグ用 */
    printParams(myApp.val, myApp.elem);
}
//
//解答送信ボタンのクリックイベントを設定
myApp.elem.ansBtn.onclick = myOnClickEvent;
function myOnClickEvent(){
    if(myApp.val.status == myApp.state.MyAnswer){ 
        const btn = this;
        btn.disabled = true;
        myApp.elem.ansCol.disabled = true;
        /* 1秒間を空けてから正誤判定をして適切な状態へ移行 -> 動画を再生 */
        window.setTimeout(function(){ checkAnswer(myApp.val, myApp.elem); }, 1000);
        busySleep(1000);
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
function focusToBody(focusUsableElement){
    focusUsableElement.disabled = false;
    focusUsableElement.focus();
    focusUsableElement.blur();
    focusUsableElement.disabled = true;
    // bodyに直接focusしたい
    // document.getElementsById("body")[0].focus();
}
/**
 * ボタンチェックのキーイベント用の関数 
 * 特定のキーが押されたら押下音+正解音を流して動画を再開する
 */
function buttonCheck(pushSound, correctSound){
    pushSound.play();
    window.setTimeout( function(){ correctSound.play() }, 800 );
}
/**
 * 早押しのキーイベント用の関数
 * 問題中に特定のキーが押下されたら押下音を再生して解答回数を記録
 */
function pushButton(pushCount, pushSound){
    pushSound.play();
    pushCount = pushCount+1;
    return pushCount;
}
/**
 * 解答入力欄への遷移するキーイベント用の関数
 * 早押し後のkeyup時に解答欄にフォーカスし、解答の送信と正誤判定を可能にする
 */
function focusToAnsCol(answerButtonElement, answerColumnElement){
    answerButtonElement.disabled = false;
    answerColumnElement.disabled = false;
    answerColumnElement.value = "";
    answerColumnElement.focus();
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
function checkAnswer(values, elements){
    const answer = elements.ansCol.value;
    const length = values.ansArray[values.numQues-1].length;
    for(let i = 0; i < length; i++){
        if(answer.valueOf() === values.ansArray[values.numQues-1][i].valueOf()){
            values.correctBool = true;
        }
    }
    if(values.correctBool == true){
        elements.sndO.play();
        values.cntO += 1;
        elements.subText.innerHTML = "正解です！";
    }else{
        elements.sndX.play();
        values.cntX += 1;
        elements.subText.innerHTML = "不正解です！ あと"+(values.limPush-values.cntPush)+"回解答できます。";
    }
    elements.numOX.innerHTML = "◯: "+values.cntO+", ✖: "+values.cntX;  
    elements.ansCol.disabled = true;
    elements.ansBtn.disabled = true;
}
/**
 * パラメータ表示（デバッグ用） 
 */
function printParams(values, elements){
    // elements.text.innerHTML = document.activeElement.id;
    // elements.text.innerHTML = index+", "+values.cntIndex+", "+values.cntExecutedIndex;
    elements.text.innerHTML = document.styleSheets.item(1).cssRules.length;
    elements.subText.innerHTML = 
        "device: "           + myApp.os+"<br>"+
        "activeElem: "       + document.activeElement.id+"<br>"+   
        "status: "           + values.status+"<br>"+
        "timePlay: "         + values.currTime.playing.toFixed(3)+"<br>"+
        "timeStop: "         + values.currTime.stopped.toFixed(3)+"<br>"+
        "WatchedTime: "      + values.watchedTime.toFixed(3)+"<br>"+
        "diffTime: "         + values.diffTime.toFixed(3)+"<br>"+
        "limPush: "          + values.limPush+"<br>"+ 
        "cntPush: "          + values.cntPush+"<br>"+
        "remainingAnsTime: " + Math.floor((myApp.val.ansTime.limit-myApp.val.ansTime.elapsed)/1000)+"<br>"+
        "answer: "           + values.ansArray[values.numQues-1][0].valueOf()+", "+
                               values.ansArray[values.numQues-1][1].valueOf()+", "+
                               values.ansArray[values.numQues-1][2].valueOf()+"<br>"+
        "answerLength: "     + values.ansArray[values.numQues-1].length+"<br>"+
        "correctBool: "      + values.correctBool+"<br>"+
        "composing: "        + values.composingBool+"<br>"+
        "touchLength: "      + values.numFingers+"<br>"+
        "index: "            + index+"<br>"+
        "cntIndex: "         + values.cntIndex+"<br>"+
        "executedIndex: "    + values.cntExecutedIndex +'<br>'+
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
        myApp.elem.pushBtn.src = myApp.elem.imgBtn2.src;
        myApp.val.status = myApp.state.Question;
        myApp.val.numQues = 1;
        myApp.val.cntPush = 0;
        myApp.elem.text.innerHTML = "第"+myApp.val.numQues+"問";
        myApp.elem.subText.innerHTML = "答えが分かったら、スペースキーを押して解答権を得る！";
        myApp.elem.numOX.innerHTML = "◯: "+myApp.val.cntO+", ✖: "+myApp.val.cntX;
        myApp.val.cntExecutedIndex += 1;
    },
    function(){
        // index = 3
        /* 閑話1 */
        myApp.elem.pushBtn.src = myApp.elem.imgBtn3.src;
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
myApp.elem.text.innerHTML = "ボタンチェック";
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