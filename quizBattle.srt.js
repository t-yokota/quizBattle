0
00:00:00,000 --> 00:00:00,100
doOnce[index] = true;
//crateElement
text = document.createElement("h1");        //動画のタイトルを表示
subTex = document.createElement("h2");      //説明文等を表示
numOX = document.createElement("h1");       //◯正解数と✖不正解数を表示
ansCol = document.createElement("textarea");//解答を入力するテキストエリア
ansBtn = document.createElement("button");  //解答を送信するボタン
sndPush = document.createElement("audio");  //ボタンの押下音
sndO = document.createElement("audio");     //正解音
sndX = document.createElement("audio");     //不正解音
br = document.createElement("br");          //改行用
//idを用意
text.id = "text";
subTex.id = "subtex";
numOX.id = "numox";
ansCol.id = "anscol";
ansBtn.id = "ansbtn";
//textNodeを作成し，見出しのElementに追加
_text = document.createTextNode("");
_subTex = document.createTextNode("");
_numOX = document.createTextNode("");
text.appendChild(_text);
subTex.appendChild(_subTex);
numOX.appendChild(_numOX);
//音のデータ
sndPush.src = "https://raw.githubusercontent.com/t-yokota/quizBattle/master/sounds/push.mp3";
sndO.src = "https://raw.githubusercontent.com/t-yokota/quizBattle/master/sounds/correct.mp3";
sndX.src = "https://raw.githubusercontent.com/t-yokota/quizBattle/master/sounds/discorrect.mp3";
//キーイベントを設定（押しによる解答権の取得）
//キー押下
//document.onkeydown = pushButton_keydown;
//document.onkeyup = pushButton_keyup;
//画面にタッチ(スマホでの視聴用に実装したい)
//document.ontouchstart = pushButton_touch;
//イベントリスナーの設定（キーイベント実行のためにJSの描画範囲にフォーカス）
player.addEventListener('onStateChange', focusJS);
//関数の定義
function focusJS(event){//動画の再生又は停止後に必ずカーソルのフォーカスをjs描画範囲内に移動し、キーイベントが呼び出せるようにする
    if(event.data == 1){
        document.getElementById("ansbtn").focus();
        document.getElementById("ansbtn").blur();
    }
}
buttonCheck = function(){
    if(event.keyCode == 32){
        //ボタンチェック（問題開始前に動画を自動停止->スペースキーが押されたら再び再生）
        if(player.getPlayerState() == 2){
            sndPush.play();
            window.setTimeout( function(){ sndO.play() }, 800 );
            window.setTimeout( function(){ player.playVideo() }, 1000 );
        }
    }
}
pushButton_keydown = function(cntAns){
    if(event.keyCode == 32){
        if(player.getPlayerState() == 1){
            cntAns++;
            if(limAns-cntAns>=0){
                sndPush.play();
                player.pauseVideo();
                document.getElementById("anscol").focus();
                ansCol.value = "";
                pushBool = 1;
            }
        }
    }
    return cntAns;
}
pushButton_keyup = function(){
    if(event.keyCode == 32){
        //押し（キーを離した瞬間に解答欄にフォーカス）
        if(pushBool == 1){
            document.getElementById("subtex").innerHTML = "解答はひらがなと半角数字で入力してください。";
            document.getElementById("anscol").focus();
            ansCol.value = "";          
            pushBool = 0;  
        }
    }
}
/*function pushButton_keydown(cntAns){
    if(event.keyCode == 32){
        //ボタンチェック（問題開始前に動画を自動停止->スペースキーが押されたら再び再生）
        if(player.getPlayerState() == 2){
            if(index == 2){
                sndPush.play();
                window.setTimeout( function(){ sndO.play() }, 800 );
                window.setTimeout( function(){ player.playVideo() }, 1000 );
            }
        }
        //押し（問題中に動画を停止）
        if(player.getPlayerState() == 1){
            cntAns++;
            //if(limAnswer-cntAns>0){
                sndPush.play();
                player.pauseVideo();
                document.getElementById("anscol").focus();
                ansCol.value = "";
                pushBool = 1;
            //}
        }
    }
}
function pushButton_keyup(){
    if(event.keyCode == 32){
        //押し（キーを離した瞬間に解答欄にフォーカス）
        if(pushBool == 1){
            document.getElementById("subtex").innerHTML = "解答はひらがなと半角数字で入力してください。";
            document.getElementById("anscol").focus();
            ansCol.value = "";          
            pushBool = 0;  
        }
    }
}*/
/*function pushButton_touch(){
    //ボタンチェック
    if(player.getPlayerState() == 2){
        if(index == 2){
            sndPush.play();
            window.setTimeout( function(){ sndO.play() }, 800 );
            window.setTimeout( function(){ player.playVideo() }, 1000 );
        }
    }
    //押し
    if(player.getPlayerState() == 1){
        sndPush.play();
        player.pauseVideo();
        document.getElementById("anscol").focus();
        ansCol.value = "";                
    }
}*/
checkAnswer = function(correctAns, cntAns, cntO, cntX){
    var ans = ansCol.value; 
    if(ans.valueOf() === correctAns.valueOf()){
        sndO.play();
        cntO += 1;
        document.getElementById("subtex").innerHTML = "正解です！";
    }else{
        sndX.play();
        cntX += 1;
        document.getElementById("subtex").innerHTML = "不正解です！ あと"+(limAns-cntAns)+"回解答できます。";
    }
    document.getElementById("numox").innerHTML = "◯: "+cntO+", ✖: "+cntX;    
    player.playVideo();
    return [cntO, cntX];
}
//解答の設定
correctAns = [];
correctAns[0] = "1";
correctAns[1] = "2";
correctAns[2] = "3";
//解答可能回数の設定
var limAns = 3;

1
00:00:00,100 --> 00:00:00,200
//doOnce[index] = true;
document.getElementsByTagName("body")[0].appendChild(text);
document.getElementsByTagName("body")[0].appendChild(subTex);
document.getElementById("text").innerHTML = "quizBattle.srt.js";
document.getElementById("subtex").innerHTML = "動画の中の相手とクイズ対決";
//TextNodeの内容をdoOnce内から隔離し、他のindex内でinnerHTMLを用いて編集する
//->動画をはじめに戻したときに表示をリセットすることができる

2
00:00:04,000 --> 00:00:04,100
//doOnce[index] = true;
//解答入力欄と解答送信ボタンを表示
document.getElementsByTagName("body")[0].appendChild(ansCol);
document.getElementsByTagName("body")[0].appendChild(br);
document.getElementsByTagName("body")[0].appendChild(ansBtn);
document.getElementsByTagName("body")[0].appendChild(numOX);
ansCol.value = "ここに解答を入力して下さい";
ansBtn.innerHTML = "解答を送信";
//ボタンチェック
player.pauseVideo();
document.getElementById("text").innerHTML = "ボタンチェック";
document.getElementById("subtex").innerHTML = "スペースキーが早押しボタンです。キーを押してボタンの動作を確認してください。";
document.getElementById("anscol").focus();//カーソルのフォーカスをjsの描画範囲(のボタンUI)に移動する->キーイベントが呼び出せるようになる
document.getElementById("anscol").blur(); //ボタン自体にフォーカスをしている意味はないため、すぐにbulrでそれを解除
document.onkeydown = buttonCheck;

3
00:00:05,000 --> 00:00:06,000
//doOnce[index] = true;
//第１問
cntQues = 1;
var cntO = 0; var cntX = 0;
cntAns = 0;
document.getElementById("text").innerHTML = "第"+cntQues+"問";
document.getElementById("subtex").innerHTML = "答えが分かったら、スペースキーを押して解答権を得る！";
document.getElementById("numox").innerHTML = "◯: "+cntO+", ✖: "+cntX;
document.onkeydown = function(){ cntAns = pushButton_keydown(cntAns); };
document.onkeyup = pushButton_keyup;
ansBtn.onclick = function(){ window.setTimeout( function(){ [cntO, cntX] = checkAnswer(correctAns[cntQues-1], cntAns, cntO, cntX) }, 1000 ); };

4
00:00:10,000 --> 00:00:11,000
//doOnce[index] = true;
//第２問
cntQues = 2;
cntAns = 0;
document.getElementById("text").innerHTML = "第"+cntQues+"問";
document.getElementById("subtex").innerHTML = "答えが分かったら、スペースキーを押して解答権を得る！";
document.getElementById("numox").innerHTML = "◯: "+cntO+", ✖: "+cntX;
document.onkeydown = function(){ cntAns = pushButton_keydown(cntAns); };
ansBtn.onclick = function(){ window.setTimeout( function(){ [cntO, cntX] = checkAnswer(correctAns[cntQues-1], cntAns, cntO, cntX) }, 1000 ); };

5
00:00:15,000 --> 00:00:16,000
//doOnce[index] = true;
//第３問
cntQues = 3;
cntAns = 0;
document.getElementById("text").innerHTML = "第"+cntQues+"問";
document.getElementById("subtex").innerHTML = "答えが分かったら、スペースキーを押して解答権を得る！";
document.getElementById("numox").innerHTML = "◯: "+cntO+", ✖: "+cntX;
document.onkeydown = function(){ cntAns = pushButton_keydown(cntAns); };
ansBtn.onclick = function(){ window.setTimeout( function(){ [cntO, cntX] = checkAnswer(correctAns[cntQues-1], cntAns, cntO, cntX) }, 1000 ); };
