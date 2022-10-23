0
00:00:00,000 --> 00:00:04,010
/* CAUTION : Each sections of subtitle has independent scope. */
/* Ver1.0 */
doOnce[index] = true;
player.pauseVideo();
//
const PATH = {
    answer : "https://raw.githubusercontent.com/t-yokota/quizBattle/master/src/answer.csv",
    sound  : "https://raw.githubusercontent.com/t-yokota/quizBattle/master/sounds/sounds_3.mp3",
    btn1   : "https://github.com/t-yokota/quizBattle/raw/master/images/button_1.png",
    btn2   : "https://github.com/t-yokota/quizBattle/raw/master/images/button_2.png",
    btn3   : "https://github.com/t-yokota/quizBattle/raw/master/images/button_3.png",
    btn4   : "https://github.com/t-yokota/quizBattle/raw/master/images/button_4.png",
};
const QUIZ_STATE = {
    Initializing : 0, // 初期化中
    ButtonCheck  : 1, // ボタンチェック待機
    Question     : 2, // 問い読み中（早押し可能）
    MyAnswer     : 3, // 自分が解答権を所持（解答入力・送信可能）
    OthAnswer    : 4, // 他者が解答権を所持（早押し不可能）
    Talk         : 5, // その他
};
const VIDEO_STATE = {
    Playing : 1,
    Stopped : 2,
};
const KEY_CODE = {
    space : 32,
    enter : 13,
};
const MY_ELEM = {
    text      : document.createElement("text"),
    subText   : document.createElement("text"),
    ansCol    : document.createElement("textarea"),
    ansBtn    : document.createElement("button"),
    numOX     : document.createElement("text"),
    pushBtn   : document.createElement("img"),
    paramText : document.createElement("text"),
    //
    divUI     : document.createElement('div'),
    divElem   : document.createElement('div'),
    divBtn    : document.createElement('div'),
};
Object.freeze(PATH);
Object.freeze(QUIZ_STATE);
Object.freeze(VIDEO_STATE);
Object.freeze(KEY_CODE);
Object.freeze(MY_ELEM);
//
const quizManager = {
    currIndex     : 0,
    srtFuncArray  : null,
    viewFuncArray : null,
    //
    /* For exteranl source */
    buttonImages    : null,
    audioBuffer     : null,
    audioBufferNode : null,
    //
    /* For quiz management */
    state       : QUIZ_STATE.Initializing,
    quesNum     : 1,     // Questoin number
    ansArray    : [],    // List of answers
    cntO        : 0,     // Number of player's correct answers
    cntX        : 0,     // Number of player's wrong answers
    cntPush     : 0,     // Number of button pushed
    limPush     : 1,     // Maximum number of answers
    correctBool : false, // Result of answer
    ansIndex    : 0,
    //
    /* For time management */
    btnCheckInterval : {
        playSound : 1500, // [ms]
        playVideo : 3000, // [ms]
    },
    ansTime : {
        limit   : 20000, // [ms]
        elapsed : 0,     // [ms]
    },
    currTime : {
        playing : 0, // be updated during the video is playing
        stopped : 0, // be updated when the video is stopped
    },
    watchedTime        : 0,
    diffTime           : 0, // difference between watchedTime and currentTime
    ansIndexStartTime  : 0,
    firstQuesStartTime : 0,
    //
    pageHiddenBool     : false,
    composingBool      : false,
    jumpToAnsBool      : false,
    hidePlayerBool     : false,
    disableSeekbarBool : false,
};
//
/* FUNCTION */
/* Get information of user environment */
const detectTouchPanel = () => {
    return window.ontouchstart === null;
}
//
const fetchOSType = () => {
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
    }else if(ua.match(/Macintosh/) && detectTouchPanel() === true){
        osType = 'iOS'; // iPad OS with Safari
        return osType;
    }else{
        osType = "other";
        return osType;
    }
}
//
const fetchBrowserType = () => {
    let brType = null;
    const ua = navigator.userAgent;
    if(ua.match(/Firefox/)){
        brType = "Firefox";
        return brType;
    }else if(ua.match(/EdgiOS/) || ua.match(/EdgA/)){
        brType = "Edge";
        return brType;
    }else if(ua.match(/OPR/)){
        brType = "Opera";
        return brType;
    }else if(ua.match(/OPT/)){
        brType = "OperaTouch";
        return brType;
    }else if(ua.match(/YJApp/)){
        brType = "Yahoo";
        return brType;
    }else if(ua.match(/Smooz/)){
        brType = "Smooz";
        return brType;
    }else if(ua.match(/CriOS/) || ua.match(/Chrome/)){ //Chrome or Others ...
        brType = "Chrome";
        return brType;
    }else{ //Safari, Firefox(iOS), Brave or Others ...
        brType = "Other";
        return brType;
    }
}
//
/* Get contents */
const loadImage = async (path) => {
    const img = new Image();
    img.src = path;
    await img.decode().catch(() => alert("画像の読み込みに失敗しました。ページを再読み込みしてください。"));
    return img
}
//
const csvToArray = (str) => {
    const array = new Array();
    const tmp = str.split("\r\n");
    for(let i = 0; i < tmp.length; i++){
        array[i] = tmp[i].split(",");
    }
    return array;
}
//
/* Sound player */
const prepareAudioBufferNode = () => {
    const audioContext = new AudioContext();
    quizManager.audioBufferNode = audioContext.createBufferSource();
    quizManager.audioBufferNode.buffer = quizManager.audioBuffer;
    quizManager.audioBufferNode.connect(audioContext.destination);
}
//
const playSndPushBtn = () => {
    quizManager.audioBufferNode.start(0,0,2);
    prepareAudioBufferNode();
}
//
const playSndO = () => {
    quizManager.audioBufferNode.start(0,3,2);
    prepareAudioBufferNode();
}
//
const playSndX = () => {
    quizManager.audioBufferNode.start(0,6,2);
    prepareAudioBufferNode();
}
//
/* Set appearances */
const getElemHeight = () => {
    let response = 0;
    if(USER_OS !== 'other'){
        response += parseInt(MY_ELEM.text.style.lineHeight, 10);
        response += parseInt(MY_ELEM.text.style.marginTop, 10);
        response += parseInt(MY_ELEM.text.style.marginBottom, 10);
        response += parseInt(MY_ELEM.ansCol.style.height, 10);
        response += parseInt(MY_ELEM.ansCol.style.marginBottom, 10);
        response += parseInt(MY_ELEM.ansBtn.style.height, 10);
        response += parseInt(MY_ELEM.ansBtn.style.marginBottom, 10);
        response += parseInt(MY_ELEM.numOX.style.lineHeight, 10);
    }
    return response
}
//
const resizePlayer = () => {
    let playerWidth, playerHeight;
    if(USER_OS !== 'other'){
        if(Math.abs(window.orientation) !== 90){
            if(USER_OS === 'Android'){ playerWidth = window.innerWidth; } // In Android, clientWidth doesn't include scrollbar.
            if(USER_OS === 'iOS'){ playerWidth = document.documentElement.clientWidth; } // In iOS, innerWidth isn't static (it changes with device orientation).
            playerHeight = playerWidth/16*9;
        }else{
            playerWidth  = document.documentElement.clientWidth*2/3;
            playerHeight = playerWidth/16*9;
        }
        if(USER_OS === 'Android' && USER_BROWSER === "Firefox"){ // set special width of anscol to prevent the window is zoomed when the focus moveds to anscol.
            MY_ELEM.ansCol.style.width = playerWidth*0.98+'px';
        }else{
            MY_ELEM.ansCol.style.width = playerWidth*0.9+'px';
        }
    }else{
        const tmpPlayerHeight = document.documentElement.clientHeight/2;
        const tmpPlayerWidth  = tmpPlayerHeight/9*16;
        if(tmpPlayerWidth < document.documentElement.clientWidth){
            playerHeight = tmpPlayerHeight;
            playerWidth  = tmpPlayerWidth;
        }else{
            playerWidth  = document.documentElement.clientWidth;
            playerHeight = playerWidth/16*9;
        }
    }
    player.setSize(playerWidth, playerHeight);
}
//
const resizePushButton = (playerHeight, elemHeight) => {
    let pushBtnWidth, pushBtnHeight;
    if(USER_OS !== "other"){
        if(Math.abs(window.orientation) !== 90){
            const tmpImgHeight = document.documentElement.clientHeight-playerHeight-elemHeight-20;
            const tmpImgWidth  = MY_ELEM.pushBtn.naturalWidth*tmpImgHeight/MY_ELEM.pushBtn.naturalHeight;
            if(tmpImgWidth < document.documentElement.clientWidth){
                if(tmpImgHeight <= playerHeight){
                    pushBtnWidth  = tmpImgWidth;
                    pushBtnHeight = tmpImgHeight;
                }else{
                    pushBtnWidth  = MY_ELEM.pushBtn.naturalWidth*playerHeight*1.25/MY_ELEM.pushBtn.naturalHeight;
                    pushBtnHeight = playerHeight*1.25;
                }
            }else{
                pushBtnWidth  = document.documentElement.clientWidth/5;
                pushBtnHeight = MY_ELEM.pushBtn.naturalHeight*pushBtnWidth/MY_ELEM.pushBtn.naturalWidth;
            }
        }else{
            pushBtnWidth  = document.documentElement.clientWidth/5;
            pushBtnHeight = MY_ELEM.pushBtn.naturalHeight*pushBtnWidth/MY_ELEM.pushBtn.naturalWidth;
        }
        MY_ELEM.pushBtn.style.margin = 'auto '+(document.documentElement.clientWidth-pushBtnWidth)/2+'px';
    }else{
        pushBtnWidth  = document.getElementById("divbtn").clientWidth;
        pushBtnHeight = MY_ELEM.pushBtn.naturalHeight*pushBtnWidth/MY_ELEM.pushBtn.naturalWidth;
    } 
    MY_ELEM.pushBtn.width  = pushBtnWidth;
    MY_ELEM.pushBtn.height = pushBtnHeight;
}
//
const getPushButtonArea = () => {
    let left   = MY_ELEM.pushBtn.getBoundingClientRect().left;
    let right  = MY_ELEM.pushBtn.getBoundingClientRect().right;
    let top    = MY_ELEM.pushBtn.getBoundingClientRect().top;
    let bottom = MY_ELEM.pushBtn.getBoundingClientRect().bottom;
    if(USER_OS === 'iOS'){ // In iOS, value of getBoundingClientRect is changed when the window is zoomed.
        left   += window.pageXOffset;
        right  += window.pageXOffset;
        top    += window.pageYOffset;
        bottom += window.pageYOffset;
    }
    return {
        left,
        right,
        top,
        bottom,
    }
}
//
const hidePlayer = () => {
    player.setSize(0, 0);
}
//
const opposePlayer = () => {
    resizePlayer();
}
//
/* Event functions */
const updateWatchedTime = (currentPlayingTime, watchedTime) => {
    if(0.0 < currentPlayingTime - watchedTime && currentPlayingTime - watchedTime < 1.0){
        watchedTime = currentPlayingTime;
    }
    return watchedTime;
}
//
const instantFocusToElement = (focusUsableElement) => {
    focusUsableElement.disabled = false;  // set focus is in a js element for preparing keydown event.
    focusUsableElement.focus();
    focusUsableElement.blur();
    focusUsableElement.disabled = true;
}
//
const focusToAnsCol = () => {
    MY_ELEM.ansBtn.disabled = false;
    MY_ELEM.ansCol.disabled = false;
    MY_ELEM.ansCol.value = "";
    MY_ELEM.ansCol.focus();
}
//
const jumpToAnswerIndex = (index, time) => {
    quizManager.currIndex = Number(index)-1;
    quizManager.watchedTime = time-0.1;
    player.seekTo(time-0.1);
}
//
const buttonCheck = (responseInterval) => {
    playSndPushBtn();
    if(USER_OS === 'iOS'){
        MY_ELEM.pushBtn.src = quizManager.buttonImages[2].src;
    }else{
        MY_ELEM.pushBtn.src = quizManager.buttonImages[1].src;
        setTimeout(() => { 
            MY_ELEM.pushBtn.src = quizManager.buttonImages[2].src; 
        }, 100);
    }
    setTimeout(() => {
        playSndO();
        MY_ELEM.pushBtn.src = quizManager.buttonImages[0].src;
    }, responseInterval);
}
//
const pushButton = () => {
    if(USER_OS !== 'other' && quizManager.hidePlayerBool === true){
        hidePlayer();
    }
    playSndPushBtn();
    if(USER_OS === 'iOS'){
        MY_ELEM.pushBtn.src = quizManager.buttonImages[2].src;
        if(USER_BROWSER === 'Chrome' || USER_BROWSER === 'Edge' || USER_BROWSER === 'Smooz'){
                setTimeout(() => { focusToAnsCol(); }, 500); // In above browsers, focus() doesn't work by the script below.
        }else{
            focusToAnsCol(); // In iOS, focus() doesn't work properly in setTimeout (keyboard doesn't appear).
        }
    }else{
        MY_ELEM.pushBtn.src = quizManager.buttonImages[1].src;
        setTimeout(() => { MY_ELEM.pushBtn.src = quizManager.buttonImages[2].src; }, 100);    
        setTimeout(() => { focusToAnsCol(); }, 500);
    }
    quizManager.cntPush = quizManager.cntPush+1;
}
//
const myButtonAction = () => {
    if(quizManager.state === QUIZ_STATE.ButtonCheck){
        quizManager.state = QUIZ_STATE.Talk;
        MY_ELEM.pushBtn.className = "";
        buttonCheck(quizManager.btnCheckInterval.playSound);
        setTimeout(() => {
            player.playVideo();
            MY_ELEM.ansBtn.disabled = false;
            if(USER_OS !== 'other'){
                quizManager.viewFuncArray.shift()();
                MY_ELEM.text.innerHTML = "＜ 遊び方 ＞";
                MY_ELEM.subText.innerHTML = "画面上の早押しボタンで<br>動画内のクイズに参加することができます";
            }else{
                quizManager.viewFuncArray.shift()();
                MY_ELEM.text.innerHTML = "＜ 遊び方 ＞"
                MY_ELEM.subText.innerHTML = "スペースキーを早押しボタンにして<br>動画内のクイズに参加することができます";
            }
        }, quizManager.btnCheckInterval.playVideo);
    }
    if(quizManager.state === QUIZ_STATE.Question){
        quizManager.state = QUIZ_STATE.MyAnswer;
        player.pauseVideo();
        pushButton();
    }
}
//
const checkAnswer = () => {
    quizManager.correctBool = false;
    MY_ELEM.ansCol.blur();
    MY_ELEM.ansCol.disabled = true;
    MY_ELEM.ansBtn.disabled = true;
    const answer = MY_ELEM.ansCol.value;
    const length = quizManager.ansArray[quizManager.quesNum-1].length;
    for(let i = 0; i < length; i++){
        if(answer.valueOf() === quizManager.ansArray[quizManager.quesNum-1][i].valueOf()){
            quizManager.correctBool = true;
        }
    }
    if(quizManager.correctBool === true){
        playSndO();
        quizManager.cntO += 1;
        MY_ELEM.text.innerHTML = "正解！";
        if(quizManager.jumpToAnsBool){ jumpToAnswerIndex(quizManager.ansIndex, quizManager.ansIndexStartTime); }
    }else{
        playSndX();
        quizManager.cntX += 1;
        MY_ELEM.text.innerHTML = "不正解！"; //あと"+(quizManager.limPush-quizManager.cntPush)+"回解答できます。";
        if(quizManager.jumpToAnsBool){ jumpToAnswerIndex(quizManager.ansIndex, quizManager.ansIndexStartTime); }
    }
    MY_ELEM.numOX.innerHTML  = "⭕️："+quizManager.cntO+"　❌："+quizManager.cntX;
    if(window.orientation !== 90){
        if(quizManager.correctBool === false && quizManager.limPush - quizManager.cntPush === 0){
            MY_ELEM.pushBtn.src = quizManager.buttonImages[3].src;
        }else{
            MY_ELEM.pushBtn.src = quizManager.buttonImages[0].src;
        }
    }else{
        MY_ELEM.pushBtn.src = quizManager.buttonImages[3].src;
    }
    if(USER_OS !== 'other' && quizManager.hidePlayerBool === true){
        opposePlayer();
    }
}
//
const myOrientationChangeEvent = () => {
    setTimeout(() => {
        resizePlayer();
        resizePushButton(document.getElementById('player').clientHeight, getElemHeight());
        if(quizManager.state === QUIZ_STATE.MyAnswer){
            if(USER_OS !== 'other' && quizManager.hidePlayerBool === true){
                hidePlayer();
            }
        }
        if(Math.abs(window.orientation) !== 90){
            if(quizManager.state === QUIZ_STATE.MyAnswer){
                MY_ELEM.pushBtn.src = quizManager.buttonImages[2].src;
            }else{
                MY_ELEM.pushBtn.src = quizManager.buttonImages[0].src;
            }
            if(quizManager.state === QUIZ_STATE.ButtonCheck){
                MY_ELEM.text.innerHTML = "早押しボタンをタップして動画を開始する";
            }
        }else{
            MY_ELEM.pushBtn.src = quizManager.buttonImages[3].src;
            if(quizManager.state === QUIZ_STATE.ButtonCheck){
                MY_ELEM.text.innerHTML = "端末を縦向きにしてクイズをはじめる";
            }
            alert("このサイトはスマートフォン/タブレットを縦向きにしてお楽しみください。");
        }
    }, 800);
}
//
const myPageHiddenCheckEvent = () => {
    if(document.webkitHidden){
        quizManager.pageHiddenBool = true;
    }else{
        quizManager.pageHiddenBool = false;
        quizManager.currTime.playing = player.getCurrentTime();
        quizManager.watchedTime  = quizManager.currTime.playing;
    }
}
//
const myKeyDownEvent = (event) => {
    if(Math.abs(window.orientation) !== 90){
        if(event.keyCode === KEY_CODE.space){
            myButtonAction();
        }
        if(event.keyCode === KEY_CODE.enter){ // for preventing new line in text area.
            if(quizManager.composingBool === false){
                return false;
            }
        }
    }
}
//
const myTouchEvent = (event) => {
    if(Math.abs(window.orientation) !== 90){
        const touchObject = event.changedTouches[0];
        const { left, right, top, bottom } = getPushButtonArea()
        if(left < touchObject.pageX && touchObject.pageX < right){
            if(top < touchObject.pageY && touchObject.pageY < bottom){
                myButtonAction();
            }
        }
    }
}
//
const myPlayerStateChangeEvent = () => {
    if(player.getPlayerState() === VIDEO_STATE.Playing){
        quizManager.currTime.playing = player.getCurrentTime();
        quizManager.watchedTime = updateWatchedTime(quizManager.currTime.playing, quizManager.watchedTime);
        if(quizManager.state === QUIZ_STATE.MyAnswer){ // check answer if the video is restarted manually without sending answer.
            player.pauseVideo();
            checkAnswer();
            if(quizManager.correctBool === true || quizManager.limPush - quizManager.cntPush === 0){
                quizManager.state = QUIZ_STATE.Talk;
            }else{
                quizManager.state = QUIZ_STATE.Question;
            }
            player.playVideo();
        }
        if(quizManager.disableSeekbarBool === true){ // prevent to jump playback position by seekbar.
            quizManager.diffTime = Math.abs(quizManager.currTime.playing - quizManager.watchedTime);
            if(quizManager.diffTime > 1.0){
                player.seekTo(quizManager.watchedTime);
            }
        }
    }
    if(player.getPlayerState() === VIDEO_STATE.Stopped){
        quizManager.currTime.stopped = player.getCurrentTime();
        if(quizManager.disableSeekbarBool === true){ // prevent to jump video playback position by seekbar and prevent to pause video during each question.
            quizManager.diffTime = Math.abs(quizManager.currTime.stopped - quizManager.watchedTime);
            if(quizManager.diffTime > 1.0){
                player.seekTo(quizManager.watchedTime);
            }
            if(quizManager.state !== QUIZ_STATE.MyAnswer){
                player.playVideo();
            }
        }
    }
}
//
const myIntervalEvent = () => {
    if(quizManager.pageHiddenBool === false){
        if(player.getPlayerState() === VIDEO_STATE.Playing){
            quizManager.currTime.playing = player.getCurrentTime();
            quizManager.watchedTime = updateWatchedTime(quizManager.currTime.playing, quizManager.watchedTime);
            if(quizManager.state === QUIZ_STATE.ButtonCheck){ // prevent to play video before button check.
                player.pauseVideo();
            }
            if(quizManager.state !== QUIZ_STATE.MyAnswer){ // execute srt function in each sections of subtitle.
                if(quizManager.disableSeekbarBool === true){
                    if(Number(index) - quizManager.currIndex === 1){
                        quizManager.srtFuncArray.shift()();
                        quizManager.currIndex += 1;
                    }
                }else{
                    if(Number(index) - quizManager.currIndex >= 1){
                        for(let i = 0; i < Number(index)-quizManager.currIndex; i++){
                            quizManager.srtFuncArray.shift()();
                        }
                        quizManager.currIndex = Number(index);
                    }
                }
            }
        }
        if(quizManager.state === QUIZ_STATE.ButtonCheck){
            if(quizManager.currIndex > 0){
                player.pauseVideo();
                alert('ページの読み込みに失敗しました。ページを再読み込みしてください。');
            }
        }
        if(quizManager.state === QUIZ_STATE.MyAnswer){ // answer time managemant
            if(document.activeElement.id === "anscol" || quizManager.ansTime.elapsed !== 0){
                quizManager.ansTime.elapsed += interval;
                MY_ELEM.text.innerHTML = "のこり"+Math.floor((quizManager.ansTime.limit-quizManager.ansTime.elapsed)/1000+1)+"秒";
                if(quizManager.ansTime.elapsed >= quizManager.ansTime.limit){
                    checkAnswer();
                    if(quizManager.correctBool === true || quizManager.limPush - quizManager.cntPush === 0){
                        quizManager.state = QUIZ_STATE.Talk;
                    }else{
                        quizManager.state = QUIZ_STATE.Question;
                    }
                    player.playVideo();
                }
            }
        }else{
            if(USER_OS === 'other' && document.activeElement.id === "player"){
                instantFocusToElement(MY_ELEM.pushBtn); // preparation of js keydown event
            }
            quizManager.ansTime.elapsed = 0;
        }
    }
}
//
const myOnClickEvent = () => {
    if(Number(index) === 0){ // jump to init question.
        console.log('here')
        let tmpTime = quizManager.firstQuesStartTime-0.1;
        if(quizManager.currTime.playing < tmpTime){
            MY_ELEM.ansBtn.disabled = true;
            quizManager.watchedTime = tmpTime;
            player.seekTo(tmpTime);
        }
    }
    if(quizManager.state === QUIZ_STATE.MyAnswer){ // send answer.
        checkAnswer();
        if(quizManager.correctBool === true || quizManager.limPush - quizManager.cntPush === 0){
            quizManager.state = QUIZ_STATE.Talk;
        }else{
            quizManager.state = QUIZ_STATE.Question;
        }
        player.playVideo();
    }
}
//
/* INITIALIZE */
const USER_OS = fetchOSType();
const USER_BROWSER = fetchBrowserType();
resizePlayer();
//
MY_ELEM.ansCol.id  = 'anscol';
MY_ELEM.ansBtn.id  = 'ansbtn';
MY_ELEM.pushBtn.id = 'pushbtn';
MY_ELEM.divUI.id   = 'divui';
MY_ELEM.divElem.id = 'divelem';
MY_ELEM.divBtn.id  = 'divbtn';
//
MY_ELEM.ansCol.value     = "ここに解答を入力";
MY_ELEM.ansBtn.innerHTML = "１問目まで移動";
MY_ELEM.ansCol.disabled  = true;
MY_ELEM.ansBtn.disabled  = true;
MY_ELEM.numOX.innerHTML  = "⭕️："+quizManager.cntO+"　❌："+quizManager.cntX;
if(USER_OS !== 'other'){
    MY_ELEM.text.innerHTML = "早押しボタンをタップして動画を開始する";
}else{
    MY_ELEM.text.innerHTML = "QuizBattle on YouTube";
    MY_ELEM.pushBtn.tabIndex = 0; // set tabindex for adding focus
}
//
document.styleSheets.item(0).insertRule('html { touch-action: manipulation; }'); //disable double tap gesture
document.styleSheets.item(0).insertRule('body { text-align: center; margin: auto; background: #EFEFEF; }');
document.styleSheets.item(0).insertRule('.blinkImg { animation: blinkImg 0.7s infinite alternate; }');
document.styleSheets.item(0).insertRule('@keyframes blinkImg{ 0% { opacity: 0.3; } 100% { opacity: 1; }}');
document.styleSheets.item(0).insertRule('.blinkText { animation: blinkText 0.7s infinite alternate; }');
document.styleSheets.item(0).insertRule('@keyframes blinkText{ 0% { opacity: 0; } 100% { opacity: 1; }}');
//
if(USER_OS !== 'other'){
    MY_ELEM.text.style.fontSize       = '42px';
    MY_ELEM.text.style.lineHeight     = '60px';
    MY_ELEM.text.style.fontWeight     = 'bold';
    MY_ELEM.text.style.display        = 'block';
    MY_ELEM.text.style.marginTop      = '32px';
    MY_ELEM.text.style.marginBottom   = '32px';
    MY_ELEM.text.style.padding        = '0px 10px';
    MY_ELEM.subText.style.fontSize    = '42px';
    MY_ELEM.subText.style.lineHeight  = '60px';
    MY_ELEM.subText.style.display     = 'block';
    MY_ELEM.ansCol.style.fontSize     = '50px';
    MY_ELEM.ansCol.style.height       = '100px';
    MY_ELEM.ansCol.style.textAlign    = 'center';
    MY_ELEM.ansCol.style.marginBottom = '10px';
    MY_ELEM.ansCol.style.marginLeft   = 'auto';
    MY_ELEM.ansCol.style.marginRight  = 'auto';
    MY_ELEM.ansCol.style.display      = 'block'
    MY_ELEM.ansBtn.style.fontSize     = '42px';
    MY_ELEM.ansBtn.style.width        = parseInt(MY_ELEM.ansBtn.style.fontSize, 10)*10+'px';
    MY_ELEM.ansBtn.style.height       = parseInt(MY_ELEM.ansBtn.style.fontSize, 10)*2+'px';
    MY_ELEM.ansBtn.style.marginBottom = '20px';
    MY_ELEM.ansBtn.style.marginLeft   = 'auto';
    MY_ELEM.ansBtn.style.marginRight  = 'auto';
    MY_ELEM.ansBtn.style.display      = 'block';
    MY_ELEM.numOX.style.fontSize      = '42px';
    MY_ELEM.numOX.style.lineHeight    = '80px';
    MY_ELEM.numOX.style.fontWeight    = 'bold';
    MY_ELEM.numOX.style.display       = 'block';
    //
    quizManager.viewFuncArray = [
        function(){
            document.getElementsByTagName("body")[0].appendChild(MY_ELEM.text);
            document.getElementsByTagName("body")[0].appendChild(MY_ELEM.ansBtn);
            // document.getElementsByTagName("body")[0].appendChild(MY_ELEM.pushBtn);
            document.getElementsByTagName("body")[0].appendChild(MY_ELEM.numOX);
            document.getElementsByTagName("body")[0].appendChild(MY_ELEM.paramText);
        },
        function(){
            MY_ELEM.text.style.marginTop = '40px';
            MY_ELEM.text.style.marginBottom = '20px';
            MY_ELEM.subText.style.marginBottom = '40px';
            MY_ELEM.subText.style.padding = '0px 10px';
            document.getElementsByTagName("body")[0].insertBefore(MY_ELEM.subText, MY_ELEM.text.nextSibling);
        },
        function(){
            MY_ELEM.text.style.marginTop    = '32px';
            MY_ELEM.text.style.marginBottom = '32px';
            MY_ELEM.text.parentNode.removeChild(MY_ELEM.subText);
            document.getElementsByTagName("body")[0].insertBefore(MY_ELEM.ansCol, MY_ELEM.text.nextSibling);
        },
    ];
    quizManager.viewFuncArray.shift()();
}else{
    const playerHeight = document.getElementById('player').clientHeight;
    const playerWidth  = document.getElementById('player').clientWidth;
    const divUIHeight  = playerHeight*0.9;
    const divUIWidth   = playerWidth;
    const divElemWidth = playerWidth*2/3;
    const divBtnWidth  = playerWidth*1/3;
    document.styleSheets.item(0).insertRule('body { width:'+playerWidth+'px; }');
    document.styleSheets.item(0).insertRule('div#divui   { width:'+divUIWidth  +'px; height:'+divUIHeight+'px; }');
    document.styleSheets.item(0).insertRule('div#divelem { width:'+divElemWidth+'px; height:'+divUIHeight+'px; float: left; display: flex; align-items: center; justify-content: center; flex-direction: column; }');
    document.styleSheets.item(0).insertRule('div#divbtn  { width:'+divBtnWidth +'px; height:'+divUIHeight+'px; float: left; display: flex; align-items: center; justify-content: center; }');
    document.getElementsByTagName("body")[0].appendChild(MY_ELEM.divUI);
    MY_ELEM.divUI.appendChild(MY_ELEM.divElem);
    MY_ELEM.divUI.appendChild(MY_ELEM.divBtn);
    //
    MY_ELEM.text.style.fontSize      = '25px';
    MY_ELEM.text.style.lineHeight    = '45px';
    MY_ELEM.text.style.fontWeight    = 'bold';
    MY_ELEM.text.style.display       = 'block';
    MY_ELEM.subText.style.fontSize   = '20px';
    MY_ELEM.subText.style.lineHeight = '30px';
    MY_ELEM.subText.style.display    = 'block';
    MY_ELEM.ansCol.style.fontSize    = '23px';
    MY_ELEM.ansCol.style.textAlign   = 'center';
    MY_ELEM.ansCol.style.width       = divElemWidth*0.75+'px';
    MY_ELEM.ansCol.style.margin      = '0px ' +(divElemWidth-parseInt(MY_ELEM.ansCol.style.width, 10))/2+'px 15px';
    MY_ELEM.ansBtn.style.fontSize    = '23px';
    MY_ELEM.ansBtn.style.width       = parseInt(MY_ELEM.ansBtn.style.fontSize, 10)*8+'px';
    MY_ELEM.ansBtn.style.margin      = '0px '+(divElemWidth-parseInt(MY_ELEM.ansBtn.style.width, 10))/2+'px 20px';
    MY_ELEM.numOX.style.fontSize     = '25px';
    MY_ELEM.numOX.style.lineHeight   = '45px';
    MY_ELEM.numOX.style.fontWeight   = 'bold';
    MY_ELEM.numOX.style.display      = 'block';
    //
    quizManager.viewFuncArray = [
        () => {
            MY_ELEM.text.style.margin  = '0px auto';
            MY_ELEM.text.style.padding = '0px 40px';
            document.getElementById("divelem").appendChild(MY_ELEM.text);
            document.getElementById("divelem").appendChild(MY_ELEM.paramText);
        },
        () => {
            MY_ELEM.text.style.margin  = '0px auto 30px';
            MY_ELEM.subText.style.margin  = '0px auto 50px';
            MY_ELEM.subText.style.padding = '0px 40px';
            document.getElementById("divelem").insertBefore(MY_ELEM.subText, MY_ELEM.text.nextSibling);
            // document.getElementById("divbtn").appendChild(MY_ELEM.pushBtn);
        },
        () => {
            document.getElementById("divelem").insertBefore(MY_ELEM.ansBtn, MY_ELEM.subText.nextSibling);
        },
        () => {
            MY_ELEM.text.style.margin = '0px auto 15px';
            MY_ELEM.text.parentNode.removeChild(MY_ELEM.subText);
            document.getElementById("divelem").insertBefore(MY_ELEM.ansCol, MY_ELEM.text.nextSibling);
            document.getElementById("divelem").appendChild(MY_ELEM.numOX);
        },
    ];
    quizManager.viewFuncArray.shift()();
}
//
const initAppearance = async () => {
    if(USER_OS !== "other"){
        if(Math.abs(window.orientation) !== 90){
            MY_ELEM.pushBtn.src = quizManager.buttonImages[0].src;
            MY_ELEM.text.innerHTML = "早押しボタンをタップして動画を開始する";
        }else{
            MY_ELEM.pushBtn.src = quizManager.buttonImages[3].src;
            MY_ELEM.text.innerHTML = "端末を縦向きにしてクイズをはじめる";
            alert("このサイトはスマートフォン/タブレットを縦向きにしてお楽しみください。");
        }
    }else{
        MY_ELEM.pushBtn.src = quizManager.buttonImages[0].src;
        if(detectTouchPanel() === true){
            MY_ELEM.subText.innerHTML = "<span class='blinkText'>スペースキーを押して動画を開始する</span>";
        }else{
            MY_ELEM.subText.innerHTML = "<span class='blinkText'>スペースキーを押して動画を開始する</span>";
        }
    }
    await MY_ELEM.pushBtn.decode().catch(() => alert("画像の読み込みに失敗しました。ページを再読み込みしてください。"));
    resizePlayer();
    resizePushButton(document.getElementById('player').clientHeight, getElemHeight());
    if( USER_OS !== 'other' ){ 
        MY_ELEM.pushBtn.className = "blinkImg";
        document.getElementsByTagName("body")[0].appendChild(MY_ELEM.pushBtn);
        // document.getElementsByTagName("body")[0].insertBefore(MY_ELEM.pushBtn, MY_ELEM.numOX);
    } else {
        document.getElementById("divbtn").appendChild(MY_ELEM.pushBtn); 
        quizManager.viewFuncArray.shift()(); 
    }
}
//
(async () => {
    /* load push button image */
    const list = [PATH.btn1, PATH.btn2, PATH.btn3, PATH.btn4];
    quizManager.buttonImages = await Promise.all(list.map(path => loadImage(path)));
    //
    /* load audio data */
    const audioContext = new AudioContext();
    const response1 = await fetch(PATH.sound).catch(() => alert("サウンドの読み込みに失敗しました。ページを再読み込みしてください。"));
    const responseBuffer = await response1.arrayBuffer();
    quizManager.audioBuffer = await audioContext.decodeAudioData(responseBuffer);
    prepareAudioBufferNode();
    //
    /* load answer file */
    const response2 = await fetch(PATH.answer).catch(() => alert("外部ファイルの読み込みに失敗しました。ページを再読み込みしてください。"));
    const responseText = await response2.text();
    quizManager.ansArray = csvToArray(responseText);
    //
    await initAppearance();
    quizManager.state = QUIZ_STATE.ButtonCheck;
    //
    window.addEventListener('orientationchange', myOrientationChangeEvent);
    document.addEventListener('webkitvisibilitychange', myPageHiddenCheckEvent, false);
    document.addEventListener("touchstart", myTouchEvent);
    document.addEventListener("compositionstart", () => { quizManager.composingBool = true; });
    document.addEventListener('compositionend',   () => { quizManager.composingBool = false; });
    player.addEventListener('onStateChange', myPlayerStateChangeEvent);
    document.onkeydown = myKeyDownEvent;
    MY_ELEM.ansBtn.onclick = myOnClickEvent;
    MY_ELEM.ansCol.onfocus = () => { MY_ELEM.ansCol.val = ""; }
    setInterval(myIntervalEvent, interval = 10);
})();
//
//---------------------------------------------------------------------------------------------------------------
/* set functions executed in each subtitle */
quizManager.jumpToAnsBool = true;
quizManager.hidePlayerBool = true;
quizManager.disableSeekbarBool = true;
quizManager.firstQuesStartTime = 4.01;
quizManager.srtFuncArray = [
    () => {
        quizManager.viewFuncArray.shift()();
        MY_ELEM.ansBtn.innerHTML = "解答を送信";
        /* 第1問 */
        quizManager.ansIndex = 2;
        quizManager.ansIndexStartTime = 18.78;
        //
        quizManager.state = QUIZ_STATE.Question;
        quizManager.quesNum = 1;
        quizManager.cntPush = 0;
        quizManager.correctBool = false;
        MY_ELEM.text.innerHTML = "第"+quizManager.quesNum+"問";
        MY_ELEM.ansCol.value = "ここに解答を入力";
        MY_ELEM.ansCol.disabled = true;
        MY_ELEM.ansBtn.disabled = true;
        if(Math.abs(window.orientation) !== 90){ MY_ELEM.pushBtn.src = quizManager.buttonImages[0].src; }
    },
    () => {
        quizManager.state = QUIZ_STATE.Talk;
        MY_ELEM.ansCol.disabled = true;
        MY_ELEM.ansBtn.disabled = true;
        MY_ELEM.pushBtn.src = quizManager.buttonImages[3].src;
    },
    () => {
        /* 第2問 */
        quizManager.ansIndex = 4;
        quizManager.ansIndexStartTime = 33.93;
        //
        quizManager.state = QUIZ_STATE.Question;
        quizManager.quesNum = 2;
        quizManager.cntPush = 0;
        quizManager.correctBool = false;
        MY_ELEM.text.innerHTML = "第"+quizManager.quesNum+"問";
        MY_ELEM.ansCol.value = "ここに解答を入力";
        MY_ELEM.ansCol.disabled = true;
        MY_ELEM.ansBtn.disabled = true;
        if(Math.abs(window.orientation) !== 90){ MY_ELEM.pushBtn.src = quizManager.buttonImages[0].src; }
    },
    () => {
        quizManager.state = QUIZ_STATE.Talk;
        MY_ELEM.ansCol.disabled = true;
        MY_ELEM.ansBtn.disabled = true;
        MY_ELEM.pushBtn.src = quizManager.buttonImages[3].src;
    },
    () => {
        /* 第3問 */
        quizManager.ansIndex = 6;
        quizManager.ansIndexStartTime = 52.61;
        //
        quizManager.state = QUIZ_STATE.Question;
        quizManager.quesNum = 3;
        quizManager.cntPush = 0;
        quizManager.correctBool = false;
        MY_ELEM.text.innerHTML = "第"+quizManager.quesNum+"問";
        MY_ELEM.ansCol.value = "ここに解答を入力";
        MY_ELEM.ansCol.disabled = true;
        MY_ELEM.ansBtn.disabled = true;
        if(Math.abs(window.orientation) !== 90){ MY_ELEM.pushBtn.src = quizManager.buttonImages[0].src; }
    },
    () => {
        quizManager.state = QUIZ_STATE.Talk;
        MY_ELEM.ansCol.disabled = true;
        MY_ELEM.ansBtn.disabled = true;
        MY_ELEM.pushBtn.src = quizManager.buttonImages[3].src;
    },
    () => {
        /* 第4問 */
        quizManager.ansIndex = 8;
        quizManager.ansIndexStartTime = 67.5;
        //
        quizManager.state = QUIZ_STATE.Question;
        quizManager.quesNum = 4;
        quizManager.cntPush = 0;
        quizManager.correctBool = false;
        MY_ELEM.text.innerHTML = "第"+quizManager.quesNum+"問";
        MY_ELEM.ansCol.value = "ここに解答を入力";
        MY_ELEM.ansCol.disabled = true;
        MY_ELEM.ansBtn.disabled = true;
        if(Math.abs(window.orientation) !== 90){ MY_ELEM.pushBtn.src = quizManager.buttonImages[0].src; }
    },
    () => {
        quizManager.state = QUIZ_STATE.Talk;
        MY_ELEM.ansCol.disabled = true;
        MY_ELEM.ansBtn.disabled = true;
        MY_ELEM.pushBtn.src = quizManager.buttonImages[3].src;
    },
    () => {
        /* 第5問 */
        quizManager.ansIndex = 10;
        quizManager.ansIndexStartTime = 84.39;
        //
        quizManager.state = QUIZ_STATE.Question;
        quizManager.quesNum = 5;
        quizManager.cntPush = 0;
        quizManager.correctBool = false;
        MY_ELEM.text.innerHTML = "第"+quizManager.quesNum+"問";
        MY_ELEM.ansCol.value = "ここに解答を入力";
        MY_ELEM.ansCol.disabled = true;
        MY_ELEM.ansBtn.disabled = true;
        if(Math.abs(window.orientation) !== 90){ MY_ELEM.pushBtn.src = quizManager.buttonImages[0].src; }
    },
    () => {
        quizManager.state = QUIZ_STATE.Talk;
        MY_ELEM.ansCol.disabled = true;
        MY_ELEM.ansBtn.disabled = true;
        MY_ELEM.pushBtn.src = quizManager.buttonImages[3].src;
    },
];

1
00:00:04,010 --> 00:00:18,780


2
00:00:18,780 --> 00:00:21,800


3
00:00:21,800 --> 00:00:33,930


4
00:00:33,930 --> 00:00:36,950


5
00:00:36,950 --> 00:00:52,610


6
00:00:52,610 --> 00:00:55,630


7
00:00:55,630 --> 00:01:07,500


8
00:01:07,500 --> 00:01:10,510


9
00:01:10,510 --> 00:01:24,390


10
00:01:24,390 --> 00:01:27,420

