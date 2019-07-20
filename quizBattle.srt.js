0
00:00:00,000 --> 00:00:00,100
/* 各種宣言 */
doOnce[index] = true;
//
//elementを作成
text    = document.createElement("h1");       //動画タイトル等
subText = document.createElement("h2");       //説明文等
numOX   = document.createElement("h1");       //◯正解数と✖不正解数
ansCol  = document.createElement("textarea"); //解答を入力するテキストエリア
ansBtn  = document.createElement("button");   //解答を送信するボタン
sndPush = document.createElement("audio");    //ボタンの押下音
sndO    = document.createElement("audio");    //正解音
sndX    = document.createElement("audio");    //不正解音
br      = document.createElement("br");       //改行用
//
//elementを表示
document.getElementsByTagName("body")[0].appendChild(text);
document.getElementsByTagName("body")[0].appendChild(subText);
document.getElementsByTagName("body")[0].appendChild(ansCol);
document.getElementsByTagName("body")[0].appendChild(br);
document.getElementsByTagName("body")[0].appendChild(ansBtn);
document.getElementsByTagName("body")[0].appendChild(numOX);
//
//textNodeを作成＋elementに追加
node_text    = document.createTextNode("");
node_subText = document.createTextNode("");
node_numOX   = document.createTextNode("");
text.appendChild(node_text);
subText.appendChild(node_subText);
numOX.appendChild(node_numOX);
//
//audioデータの指定
sndPush.src = "https://raw.githubusercontent.com/t-yokota/quizBattle/master/sounds/push.mp3";
sndO.src    = "https://raw.githubusercontent.com/t-yokota/quizBattle/master/sounds/correct.mp3";
sndX.src    = "https://raw.githubusercontent.com/t-yokota/quizBattle/master/sounds/discorrect.mp3";
//
//正答リストの読み込み
//正答のcsvファイルはUTF-8でエンコードしておく
var answerCSV = "https://raw.githubusercontent.com/t-yokota/quizBattle/master/quizknock/geinoujinQuiz/answer_geinoujinQuiz.csv";
var file = new XMLHttpRequest();
file.open("get", answerCSV, true);
file.send(null);
file.onload = function(){
    correctAns = CSVtoArray(file.responseText);
}
function CSVtoArray(str){
    var array = new Array();
    var tmp = str.split("\n");
    for (var i = 0; i < tmp.length; i++) {
        array[i] = tmp[i].split(",");
    }
    return array;
}
//
//キーイベント発生用の関数
//動画の再生・停止後に必ずjsの描画範囲内にフォーカスする
player.addEventListener('onStateChange', focusToJS);
function focusToJS(){
    ansCol.disabled = false;
    ansCol.focus();
    ansCol.blur();
    ansCol.disabled = true;
}
//
//ボタンチェック用の関数式
//（動画を停止してボタンチェックを待機->）スペースキーが押されたら押下音を再生＋動画を再開する
buttonCheck = function(){
    if(event.keyCode == 32){
        if(player.getPlayerState() == 2){
            sndPush.play();
            window.setTimeout( function(){ sndO.play() }, 800 );
            window.setTimeout( function(){ player.playVideo() }, 1000 );
        }
    }
}
//
//押し用の関数式
//問題中にスペースキーが押下されると動画を停止する
cntPush = 0; //解答回数
limPush = 2; //1問あたりの解答可能数を設定
enablePushBtn  = true;  //1のとき早押し可能
enableToAnsCol = false; //1のとき解答欄に遷移
enableCheckAns = false; //1のとき答え合わせ可能
pushButton = function(cntPush){
    if(event.keyCode == 32){
        if(player.getPlayerState() == 1){
            if(enablePushBtn == true){
                //押しの回数(cntPush)をカウントし、上限(limPush)を超えたら停止は不可に
                if(limPush-cntPush > 0){
                    //alert("test");
                    cntPush++;
                    sndPush.play();
                    player.pauseVideo();
                    enablePushBtn  = false;
                    enableToAnsCol = true;
                    enableCheckAns = false;
                }
            }
        }
    }
    return cntPush;
}
//
//解答入力遷移のキーイベント関数
//押し後のkeyup時に解答欄にフォーカス、解答の送信と正誤判定を可能にする(enableCheckAnsをtrueに)
focusToAnsCol = function(){
    if(event.keyCode == 32){
        if(enableToAnsCol == true){
            //subText.innerHTML = "解答は全角のひらがなと数字で入力してください。";
            ansCol.disabled = false;
            ansBtn.disabled = false;
            ansCol.focus();
            ansCol.value = "";
            enablePushBtn  = false;
            enableToAnsCol = false;
            enableCheckAns = true;
        }
    }
}
//
//正誤判定の関数
cntO = 0; //正答数
cntX = 0; //誤答数
cntQues = 0; //設問番号ß
checkAnswer = function(){
    alert(correctAnswers[0][0]);
    if(enableCheckAns == true){
        var correctBool = false;
        var ans = ansCol.value;
        var length = correctAnswers[cntQues-1].length;
        for(var i = 0; i < length; i++){
            if(ans.valueOf() === correctAnswers[cntQues-1][i].valueOf()){
                correctBool = true;
            }
        }
        if(correctBool == true){
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
    ansCol.disabled = true;
    ansBtn.disabled = true;
    enablePushBtn   = true;
    enableToAnsCol  = false;
    enableCheckAns  = false;
    player.playVideo();
    return [cntPush, cntO, cntX];
}
//
//正誤判定を実行するonclickイベント
//(解答送信ボタンを押すと１秒後に正誤を判定する。押された後はボタンをdisabledにする)
ansBtn.onclick = function(){
    var btn = this;
    btn.disabled = true;
    window.setTimeout( function(){ [cntPush, cntO, cntX] = checkAnswer() }, 1000 );
};

1
00:00:00,100 --> 00:00:00,200
/* タイトル表示 */
doOnce[index] = true;
//
text.innerHTML = "quizBattle.srt.js";
subText.innerHTML = "動画の中の相手とクイズ対決";
ansCol.value = "ここに解答を入力";
ansBtn.innerHTML = "解答を送信";
ansCol.disabled = true;
ansBtn.disabled = true;

2
00:00:04,000 --> 00:00:04,100
/* ボタンチェック開始 */
doOnce[index] = true;
//
text.innerHTML = "ボタンチェック";
subText.innerHTML = "スペースキーが早押しボタンです。キーを押して音と動作を確認してください。";
//
//ボタンチェックのキーイベントを設定
document.onkeydown = buttonCheck;
//
//動画の停止
player.pauseVideo();

3
00:00:04,500 --> 00:00:04,600
/* ボタンチェック終了 */
doOnce[index] = true;
//
//押しのキーイベントを設定
document.onkeydown = function(){ cntPush = pushButton(cntPush); }
document.onkeyup   = focusToAnsCol;

4
00:00:05,000 --> 00:00:06,000
/* 第１問 */
doOnce[index] = true;
//
cntQues = 1;
cntPush = 0;
text.innerHTML = "第"+cntQues+"問";
subText.innerHTML = "答えが分かったら、スペースキーを押して解答権を得る！";
numOX.innerHTML = "◯: "+cntO+", ✖: "+cntX;

5
00:00:10,000 --> 00:00:11,000
/* 第２問 */
doOnce[index] = true;
//
cntQues = 2;
cntPush = 0;
text.innerHTML = "第"+cntQues+"問";
subText.innerHTML = "答えが分かったら、スペースキーを押して解答権を得る！";

6
00:00:15,000 --> 00:00:16,000
/* 第３問 */
doOnce[index] = true;
//第３問
cntQues = 3;
cntPush = 0;
text.innerHTML = "第"+cntQues+"問";
subText.innerHTML = "答えが分かったら、スペースキーを押して解答権を得る！";