0
00:00:00,000 --> 00:00:00,100
doOnce[index] = true;
//crateElement
text    = document.createElement("h1");       //動画のタイトル等
subText = document.createElement("h2");       //説明文等
numOX   = document.createElement("h1");       //◯正解数と✖不正解数
ansCol  = document.createElement("textarea"); //解答を入力するテキストエリア
ansBtn  = document.createElement("button");   //解答を送信するボタン
sndPush = document.createElement("audio");    //ボタンの押下音
sndO    = document.createElement("audio");    //正解音
sndX    = document.createElement("audio");    //不正解音
br      = document.createElement("br");       //改行用
//textNodeを作成してelementに追加
_text    = document.createTextNode("");
_subText = document.createTextNode("");
_numOX   = document.createTextNode("");
text.appendChild(_text);
subText.appendChild(_subText);
numOX.appendChild(_numOX);
//audioデータの設定
sndPush.src = "https://raw.githubusercontent.com/t-yokota/quizBattle/master/sounds/push.mp3";
sndO.src    = "https://raw.githubusercontent.com/t-yokota/quizBattle/master/sounds/correct.mp3";
sndX.src    = "https://raw.githubusercontent.com/t-yokota/quizBattle/master/sounds/discorrect.mp3";
//正答リストの設定
var answerCSV = "https://raw.githubusercontent.com/t-yokota/quizBattle/master/quizknock/geinoujinQuiz/answer_geinoujinQuiz.csv";
file = new XMLHttpRequest();
file.open("get", answerCSV, true);
file.send(null);
file.onload = function(){ setAnswerArray(file.responseText); }
function setAnswerArray(str){
    correctAnswer = new Array();
    var tmp = str.split("\n");
    for (var i = 0; i < tmp.length; i++) {
        correctAnswer[i] = tmp[i].split(",");
    }
}
//動画の再生・停止後に必ずjsの描画範囲内にフォーカスし、常にキーイベントが発生するようにする
player.addEventListener('onStateChange', focusJS);
function focusJS(){
    ansCol.focus();
    ansCol.blur();
}
//ボタンチェックのキーイベント関数
//(一度動画を自動停止した後、)スペースキーを押して音のチェック＋動画の再生
buttonCheck = function(){
    if(event.keyCode == 32){
        if(player.getPlayerState() == 2){
            sndPush.play();
            window.setTimeout( function(){ sndO.play() }, 800 );
            window.setTimeout( function(){ player.playVideo() }, 1000 );
        }
    }
}
//早押しのキーイベント関数１
//問題中にスペースキーが押下されると動画を停止する
var cntPush;
var limPush     = 50;
var enablePush  = 1; //1のとき早押し可能
var enableKeyup = 0; //1のときkeyupイベントが発生
var enableCheck = 0; //1のとき答え合わせ可能
pushButton_keydown = function(cntPush){
    if(event.keyCode == 32){
        if(player.getPlayerState() == 1){
            if(enablePush == 1){
                //押しの回数(cntPush)をカウントし、上限(limPush)を超えたら停止は不可に
                if(limPush-cntPush > 0){
                    cntPush++;
                    sndPush.play();
                    enableKeyup = 1;
                    player.pauseVideo();
                }
            }
        }
    }
    return cntPush;
}
//早押しのキーイベント関数２
//keyupの瞬間に解答欄にフォーカス、解答の送信及び正誤判定を可能にする(enableCheckを1に)
//(keydownのタイミングで解答欄にフォーカスすると、キーを離す瞬間に解答欄に文字(スペース)を入力してしまう)
pushButton_keyup = function(){
    if(event.keyCode == 32){
        if(enableKeyup == 1){
            //subText.innerHTML = "解答は全角のひらがなと数字で入力してください。";
            ansCol.focus();
            ansCol.value = "";
            enablePush  = 0;
            enableKeyup = 0;
            enableCheck = 1;
        }
    }
}
//正誤判定の関数
//(正答のcsvファイルはUTF-8でエンコードしておく)
checkAnswer = function(correctAnswer, cntQues, cntPush, cntO, cntX){
    if(enableCheck == 1){
        var correctBool = 0;
        var ans = ansCol.value;
        var length = correctAnswer[cntQues-1].length;
        for(var i = 0; i < length; i++){
            //alert(correctAnswer[cntQues-1][i].valueOf());
            if(ans.valueOf() === correctAnswer[cntQues-1][i].valueOf()){
                correctBool = 1;
            }
        }
        if(correctBool == 1){
            cntO += 1;
            sndO.play();
            cntPush = limPush;
            subText.innerHTML = "正解です！";
        }else{
            cntX += 1;
            sndX.play();
            subText.innerHTML = "不正解です！ あと"+(limPush-cntPush)+"回解答できます。";
        }
        numOX.innerHTML = "◯: "+cntO+", ✖: "+cntX;    
    }
    enablePush  = 1;
    enableCheck = 0;
    player.playVideo();
    return [cntPush, cntO, cntX];
}
//解答入力の制限時間を設定
inputTime = 10;//[sec]
setInterval(timeLimit, 100);
function timeLimit(){
    //押しで動画が停止されたとき
    if(enableCheck == 0){
        elapsedTime = 0;
    }else if(enableCheck == 1){
        elapsedTime += 100;
        subText.innerHTML = "あと"+(inputTime-Math.floor(elapsedTime/1000))+"秒で解答を送信してください";        
        //subText.innerHTML = elapsedTime+", pushed";        
        //解答の制限時間を超えたら動画を再生
        if(Math.floor(elapsedTime) >= inputTime*1000){
            player.playVideo();
        }
    }
}
//コントロールバーの使用制限
//押し以外での動画の一時停止不可，シークバーによる再生位置のジャンプ不可
var currentTime1 = 0;
var currentTime2 = 0;
setInterval(getTime1, 1000);
player.addEventListener('onStateChange', getTime2);
function getTime1(){
    if(player.getPlayerState() == 1){
        //時間取得（再生中） 
        currentTime1 = player.getCurrentTime();
        //subText.innerHTML = currentTime1+", "+currentTime2;
    }
}
function getTime2(){
    //押し以外で動画が停止された場合
    if(player.getPlayerState() == 2 && enableKeyup == 0){
        //時間取得（停止した瞬間）
        currentTime2 = player.getCurrentTime();
        //subText.innerHTML = currentTime1+", "+currentTime2;
        //２つの時間が一致しない場合，シークバーによるジャンプとしてバーの位置を戻す
        if(Math.floor(currentTime1) != Math.floor(currentTime2)){
            player.seekTo(currentTime1);
            currentTime2 = currentTime1;
        }
        //ボタンチェックの場合を除外して動画を再生
        if(index != 2){
            player.playVideo();
        }
    }
}

1
00:00:00,100 --> 00:00:00,200
doOnce[index] = true;
//各種elementを表示
document.getElementsByTagName("body")[0].appendChild(text);
document.getElementsByTagName("body")[0].appendChild(subText);
document.getElementsByTagName("body")[0].appendChild(ansCol);
document.getElementsByTagName("body")[0].appendChild(br);
document.getElementsByTagName("body")[0].appendChild(ansBtn);
document.getElementsByTagName("body")[0].appendChild(numOX);
text.innerHTML = "quizBattle.srt.js";
subText.innerHTML = "動画の中の相手とクイズ対決";
ansCol.value = "ここに解答を入力";
ansBtn.innerHTML = "解答を送信";
ansCol.disabled = true;
ansBtn.disabled = true;

2
00:00:04,000 --> 00:00:04,100
doOnce[index] = true;
text.innerHTML = "ボタンチェック";
subText.innerHTML = "スペースキーが早押しボタンです。キーを押して音と動作を確認してください。";
//ボタンチェックのキーイベントを設定
document.onkeydown = buttonCheck;
//jsの描画範囲(のelement)にfocusすることで、キーイベントが呼び出せるようになる
ansCol.disabled = false;
ansCol.focus();
ansCol.blur();
ansCol.disabled = true;
//動画の停止
player.pauseVideo();

3
00:00:04,500 --> 00:00:04,600
doOnce[index] = true;
//早押しのキーイベントを設定
document.onkeydown = function(){ cntPush = pushButton_keydown(cntPush); };
document.onkeyup   = pushButton_keyup;
//正誤判定をするonclickイベントを設定 (解答送信ボタンを押すと１秒後に正誤を判定する。押された後はボタンをdisabledにする)
ansBtn.onclick = function(){
    var btn = this;
    btn.disabled = true;
    window.setTimeout( function(){ [cntPush, cntO, cntX] = checkAnswer(correctAnswer, cntQues, cntPush, cntO, cntX) }, 1000 );
};
//解答を送信する前に動画を再生した場合は、その時点の入力内容で正誤判定をする
player.addEventListener('onStateChange', whenNoSendAnswer);
function whenNoSendAnswer(){
    if(player.getPlayerState() == 1){
        [cntPush, cntO, cntX] = checkAnswer(correctAnswer, cntQues, cntPush, cntO, cntX);
    }
}
//解答入力フォーム、解答送信ボタンは動画の停止中のみ有効にする
player.addEventListener('onStateChange', ansBtnDisbled);
function ansBtnDisbled(){
    if(player.getPlayerState() == 1){
        ansBtn.disabled = true;
        ansCol.disabled = true;
        ansCol.value = "ここに解答を入力";
    }else if(player.getPlayerState() == 2){
        ansBtn.disabled = false;
        ansCol.disabled = false;
    }
}

4
00:00:05,000 --> 00:00:06,000
//doOnce[index] = true;
//問題開始
//ansCol.disabled = false;
cntO = 0;
cntX = 0;
//第１問
cntQues = 1;
cntPush = 0;
text.innerHTML = "第"+cntQues+"問";
subText.innerHTML = "答えが分かったら、スペースキーを押して解答権を得る！";
numOX.innerHTML = "◯: "+cntO+", ✖: "+cntX;

5
00:00:10,000 --> 00:00:11,000
//doOnce[index] = true;
//第２問
cntQues = 2;
cntPush = 0;
text.innerHTML = "第"+cntQues+"問";
subText.innerHTML = "答えが分かったら、スペースキーを押して解答権を得る！";

6
00:00:15,000 --> 00:00:16,000
//doOnce[index] = true;
//第３問
cntQues = 3;
cntPush = 0;
text.innerHTML = "第"+cntQues+"問";
subText.innerHTML = "答えが分かったら、スペースキーを押して解答権を得る！";
