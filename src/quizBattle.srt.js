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
    button : "https://github.com/t-yokota/quizBattle/raw/master/images/button.webp",
};
const QUIZ_STATE = {
    Initializing : 0, // Introduction part for initializing.
    ButtonCheck  : 1, // Waiting for button check.
    Question     : 2, // Reading the question（button enabled）
    MyAnswer     : 3, // Player has the right to answer (answer input and submission possible)
    OthersAnswer : 4, // Others have the right to answer (button disabled)
    Talk         : 5, // Talk time (button disabled)
};
const BUTTON_STATE = {
    standby  : 0,
    pushed   : 1,
    released : 2,
    disabled : 3,
}
const VIDEO_STATE = {
    Playing : 1,
    Stopped : 2,
};
const KEY_CODE = {
    space : 32,
    enter : 13,
};
const ORIENTATION = {
    portrait  : 0,
    landscape : 90,
};
Object.freeze(PATH);
Object.freeze(QUIZ_STATE);
Object.freeze(BUTTON_STATE);
Object.freeze(VIDEO_STATE);
Object.freeze(KEY_CODE);
Object.freeze(ORIENTATION);
//
const myElem = {
    text      : document.createElement("text"),
    subText   : document.createElement("text"),
    ansCol    : document.createElement("textarea"),
    ansBtn    : document.createElement("button"),
    numOX     : document.createElement("text"),
    pushBtn   : null,
    //
    divUI     : document.createElement('div'),
    divElem   : document.createElement('div'),
    divBtn    : document.createElement('div'),
};
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
    divBtnWidth : 0,
    divBtnHeight : 0,
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
const messages = {
    alert: {
        image: "画像ファイルの読み込みに失敗しました。ページを再読み込みしてください。",
        sound: "音声ファイルの読み込みに失敗しました。ページを再読み込みしてください。",
        answer: "正答データの読み込みに失敗しました。ページを再読み込みしてください。",
        page: "ページの読み込みに失敗しました。ページを再読み込みしてください。",
        orientation: "このサイトはスマートフォン/タブレットを縦向きにしてお楽しみください。",
    },
    buttonCheck: {
        intro: {
            mobile: "早押しボタンをタップして動画を再生する",
            other:  "スペースキーを押して動画を再生する",
        },
        checking: "ボタンの動作確認中...",
        success: "OK!",
        orientation: "端末を縦向きにしてクイズをはじめる",
    },
    question: {
        number: (number) => "第"+number+"問",
        column: "ここに解答を入力",
        button: "解答を送信",
        remainedPush: (limit, count) => "あと"+(limit-count)+"回解答できます。",
    },
    myAnswer: {
        correct: "正解！",
        incorrect: "不正解！",
        remainedTime: (limit, elapsed) => "のこり"+Math.floor((limit-elapsed)/1000+1)+"秒",
    },
    othersAnswer: {
        intro: "他の方が解答中です。",
    },
    talk: {
        intro: "＜ 遊び方 ＞",
        introSub: {
            mobile: "画面上の早押しボタンを使って<br>動画内のクイズに参加することができます",
            other:  "スペースキーを早押しボタンにして<br>動画内のクイズに参加することができます",
        },
        jump: "１問目まで移動",
    },
}
//
/* FUNCTION */
const isPageHidden = () => document.webkitHidden;
const isSpaceKeyPressed = (event) => event.keyCode === KEY_CODE.space;
const isEnterKeyPressed = (event) => event.keyCode === KEY_CODE.enter;
const isPortraitOrientation = () => Math.abs(window.orientation) !== ORIENTATION.landscape;
const isWithinPushButtonArea = (touchObject, { left, right, top, bottom }) =>
    left < touchObject.pageX && touchObject.pageX < right && top < touchObject.pageY && touchObject.pageY < bottom;
//
/* Get information of user environment */
const detectTouchPanel = () => {
    return window.ontouchstart === null;
}
//
const getOsType = () => {
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
const getDeviceType = () => {
    const os = getOsType();
    return os === 'Android' || os === 'iOS' ? 'mobile' : 'other';
}
//
const isMobileDevice = () => getDeviceType() === 'mobile';
const isAndroid = () => getOsType() === 'Android';
const isIOS = () => getOsType() === 'iOS';
//
const getBrowserType = () => {
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
    await img.decode().catch(() => alert(messages.alert.image));
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
    if(isMobileDevice()){
        response += parseInt(myElem.text.style.lineHeight, 10);
        response += parseInt(myElem.text.style.marginTop, 10);
        response += parseInt(myElem.text.style.marginBottom, 10);
        response += parseInt(myElem.ansCol.style.height, 10);
        response += parseInt(myElem.ansCol.style.marginBottom, 10);
        response += parseInt(myElem.ansBtn.style.height, 10);
        response += parseInt(myElem.ansBtn.style.marginBottom, 10);
        response += parseInt(myElem.numOX.style.lineHeight, 10);
    }
    return response
}
//
const resizePlayer = () => {
    let playerWidth, playerHeight;
    if(isMobileDevice()){
        if(isPortraitOrientation()){
            if(isAndroid()){ playerWidth = window.innerWidth; } // In Android, clientWidth doesn't include scrollbar.
            if(isIOS()){ playerWidth = document.documentElement.clientWidth; } // In iOS, innerWidth isn't static (it changes with device orientation).
            playerHeight = playerWidth/16*9;
        }else{
            playerWidth  = document.documentElement.clientWidth*2/3;
            playerHeight = playerWidth/16*9;
        }
        if(isAndroid() && getBrowserType() === "Firefox"){ // set special width of anscol to prevent the window is zoomed when the focus moveds to anscol.
            myElem.ansCol.style.width = playerWidth*0.98+'px';
        }else{
            myElem.ansCol.style.width = playerWidth*0.9+'px';
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
    if(isMobileDevice()){
        if(isPortraitOrientation()){
            const tmpDivBtnHeight = document.documentElement.clientHeight-playerHeight-elemHeight-20;
            const tmpDivBtnWidth  = myElem.pushBtn.naturalWidth*tmpDivBtnHeight/myElem.pushBtn.naturalHeight;
            if(tmpDivBtnWidth < document.documentElement.clientWidth){
                if(tmpDivBtnHeight <= playerHeight){
                    quizManager.divBtnWidth  = tmpDivBtnWidth;
                    quizManager.divBtnHeight = tmpDivBtnHeight;
                }else{
                    quizManager.divBtnWidth  = myElem.pushBtn.naturalWidth*playerHeight*1.25/myElem.pushBtn.naturalHeight;
                    quizManager.divBtnHeight = playerHeight*1.25;
                }
            }else{
                quizManager.divBtnWidth  = document.documentElement.clientWidth/5;
                quizManager.divBtnHeight = myElem.pushBtn.naturalHeight*quizManager.divBtnWidth/myElem.pushBtn.naturalWidth;
            }
        }else{
            quizManager.divBtnWidth  = 0;
            quizManager.divBtnHeight = 0;
        }
        myElem.divBtn.style.margin = 'auto';
    }else{
        quizManager.divBtnWidth  = document.getElementById('player').clientWidth*1/3;
        quizManager.divBtnHeight = quizManager.divBtnWidth/myElem.pushBtn.naturalWidth*myElem.pushBtn.naturalHeight;
        myElem.divBtn.style.top = (parseInt(myElem.divUI.style.height, 10)-quizManager.divBtnHeight)/2+'px';
    }
    myElem.divBtn.style.width = quizManager.divBtnWidth+'px';
    myElem.divBtn.style.height = quizManager.divBtnHeight+'px';
    myElem.pushBtn.width  = quizManager.divBtnWidth*2;
    myElem.pushBtn.height = quizManager.divBtnHeight*2;
}
//
const getPushButtonArea = () => {
    let left   = myElem.divBtn.getBoundingClientRect().left;
    let right  = myElem.divBtn.getBoundingClientRect().right;
    let top    = myElem.divBtn.getBoundingClientRect().top;
    let bottom = myElem.divBtn.getBoundingClientRect().bottom;
    if(isIOS()){ // In iOS, value of getBoundingClientRect is changed when the window is zoomed.
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
const switchPushButton = (button_state) => {
    if(button_state === BUTTON_STATE.standby){
        myElem.pushBtn.style.left = '0px';
        myElem.pushBtn.style.top  = '0px';
    }else if(button_state === BUTTON_STATE.pushed){
        myElem.pushBtn.style.left = -quizManager.divBtnWidth +'px';
        myElem.pushBtn.style.top  = '0px';
    }else if(button_state === BUTTON_STATE.released){
        myElem.pushBtn.style.left = '0px';
        myElem.pushBtn.style.top  = -quizManager.divBtnHeight+'px';
    }else if(button_state === BUTTON_STATE.disabled){
        myElem.pushBtn.style.left = -quizManager.divBtnWidth +'px';
        myElem.pushBtn.style.top  = -quizManager.divBtnHeight+'px';
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
    myElem.ansBtn.disabled = false;
    myElem.ansCol.disabled = false;
    myElem.ansCol.value = "";
    myElem.ansCol.focus();
}
//
const jumpToAnswerIndex = (index, time) => {
    quizManager.currIndex = Number(index)-1;
    quizManager.watchedTime = time-0.1;
    player.seekTo(time-0.1);
}
//
const buttonCheck = (responseInterval) => {
    if(isMobileDevice()){
        myElem.text.innerHTML = messages.buttonCheck.checking;
    }else{
        myElem.subText.innerHTML = messages.buttonCheck.checking;
    }
    playSndPushBtn();
    if(isIOS()){
        switchPushButton(BUTTON_STATE.released);
    }else{
        switchPushButton(BUTTON_STATE.pushed);
        setTimeout(() => { 
            switchPushButton(BUTTON_STATE.released);
        }, 100);
    }
    setTimeout(() => {
        if(isMobileDevice()){
            myElem.text.innerHTML = messages.buttonCheck.success;
        }else{
            myElem.subText.innerHTML = messages.buttonCheck.success;
        }
        playSndO();
        switchPushButton(BUTTON_STATE.standby);
    }, responseInterval);
}
//
const pushButton = () => {
    if(isMobileDevice() && quizManager.hidePlayerBool === true){
        hidePlayer();
    }
    playSndPushBtn();
    if(isIOS()){
        const browserType = getBrowserType();
        switchPushButton(BUTTON_STATE.released);
        if(browserType === 'Chrome' || browserType === 'Edge' || browserType === 'Smooz'){
                setTimeout(() => { focusToAnsCol(); }, 500); // In above browsers, focus() doesn't work by the script below.
        }else{
            focusToAnsCol(); // In iOS, focus() doesn't work properly in setTimeout (keyboard doesn't appear).
        }
    }else{
        switchPushButton(BUTTON_STATE.pushed);
        setTimeout(() => { switchPushButton(BUTTON_STATE.released); }, 100);
        setTimeout(() => { focusToAnsCol(); }, 500);
    }
    quizManager.cntPush = quizManager.cntPush+1;
}
//
const myButtonAction = () => {
    if(quizManager.state === QUIZ_STATE.ButtonCheck){
        quizManager.state = QUIZ_STATE.Talk;
        myElem.pushBtn.className = "";
        buttonCheck(quizManager.btnCheckInterval.playSound);
        setTimeout(() => {
            player.playVideo();
            myElem.ansBtn.disabled = false;
            if(isMobileDevice()){
                quizManager.viewFuncArray.shift()();
                myElem.text.innerHTML = messages.talk.intro;
                myElem.subText.innerHTML = messages.talk.introSub.mobile;
            }else{
                quizManager.viewFuncArray.shift()();
                myElem.text.innerHTML = messages.talk.intro;
                myElem.subText.innerHTML = messages.talk.introSub.other;
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
    myElem.ansCol.blur();
    myElem.ansCol.disabled = true;
    myElem.ansBtn.disabled = true;
    const answer = myElem.ansCol.value;
    const length = quizManager.ansArray[quizManager.quesNum-1].length;
    for(let i = 0; i < length; i++){
        if(answer.valueOf() === quizManager.ansArray[quizManager.quesNum-1][i].valueOf()){
            quizManager.correctBool = true;
        }
    }
    if(quizManager.correctBool === true){
        playSndO();
        quizManager.cntO += 1;
        myElem.text.innerHTML = messages.myAnswer.correct;
        if(quizManager.jumpToAnsBool){ jumpToAnswerIndex(quizManager.ansIndex, quizManager.ansIndexStartTime); }
    }else{
        playSndX();
        quizManager.cntX += 1;
        myElem.text.innerHTML = messages.myAnswer.incorrect; // messages.question.remainedPush(quizManager.limPush, quizManager.cntPush);
        if(quizManager.jumpToAnsBool){ jumpToAnswerIndex(quizManager.ansIndex, quizManager.ansIndexStartTime); }
    }
    myElem.numOX.innerHTML  = "⭕️："+quizManager.cntO+"　❌："+quizManager.cntX;
    if(isPortraitOrientation()){
        if(quizManager.correctBool === true || quizManager.limPush - quizManager.cntPush === 0){
            switchPushButton(BUTTON_STATE.disabled);
        }else{
            switchPushButton(BUTTON_STATE.standby);
        }
    }else{
        switchPushButton(BUTTON_STATE.disabled);
    }
    if(isMobileDevice() && quizManager.hidePlayerBool === true){
        opposePlayer();
    }
}
//
const myOrientationChangeEvent = () => {
    setTimeout(() => {
        resizePlayer();
        resizePushButton(document.getElementById('player').clientHeight, getElemHeight());
        if(quizManager.state === QUIZ_STATE.MyAnswer){
            if(isMobileDevice() && quizManager.hidePlayerBool === true){
                hidePlayer();
            }
        }
        if(isPortraitOrientation()){
            if(quizManager.state === QUIZ_STATE.MyAnswer){
                switchPushButton(BUTTON_STATE.released);
            }else{
                switchPushButton(BUTTON_STATE.standby);
            }
            if(quizManager.state === QUIZ_STATE.ButtonCheck){
                myElem.text.innerHTML = messages.buttonCheck.intro.mobile;
            }
        }else{
            switchPushButton(BUTTON_STATE.disabled);
            if(quizManager.state === QUIZ_STATE.ButtonCheck){
                myElem.text.innerHTML = messages.buttonCheck.orientation;
            }
            alert(messages.alert.orientation);
        }
    }, 800);
}
//
const myPageHiddenCheckEvent = () => {
    quizManager.pageHiddenBool = isPageHidden();
    if(!quizManager.pageHiddenBool){
        quizManager.currTime.playing = player.getCurrentTime();
        quizManager.watchedTime  = quizManager.currTime.playing;
    }
}
//
const myKeyDownEvent = (event) => {
    if(isPortraitOrientation()){
        if(isSpaceKeyPressed(event)){
            myButtonAction();
        }
        if(isEnterKeyPressed(event) && !quizManager.composingBool){ // for preventing new line in text area.
            return false;
        }
    }
}
//
const myTouchEvent = (event) => {
    if(isPortraitOrientation()){
        const touchObject = event.changedTouches[0];
        const pushButtonArea = getPushButtonArea()
        if(isWithinPushButtonArea(touchObject, pushButtonArea)){
                 myButtonAction();
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
                alert(messages.alert.page);
            }
        }
        if(quizManager.state === QUIZ_STATE.MyAnswer){ // answer time managemant
            if(document.activeElement.id === "anscol" || quizManager.ansTime.elapsed !== 0){
                quizManager.ansTime.elapsed += interval;
                myElem.text.innerHTML = messages.myAnswer.remainedTime(quizManager.ansTime.limit, quizManager.ansTime.elapsed);
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
            if(!isMobileDevice() && document.activeElement.id === "player"){
                instantFocusToElement(myElem.pushBtn); // preparation of js keydown event
            }
            quizManager.ansTime.elapsed = 0;
        }
    }
}
//
const myOnClickEvent = () => {
    if(Number(index) === 0){ // jump to init question.
        let tmpTime = quizManager.firstQuesStartTime-0.1;
        if(quizManager.currTime.playing < tmpTime){
            myElem.ansBtn.disabled = true;
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
resizePlayer();
//
myElem.ansCol.id  = 'anscol';
myElem.ansBtn.id  = 'ansbtn';
myElem.divUI.id   = 'divui';
myElem.divElem.id = 'divelem';
myElem.divBtn.id  = 'divbtn';
//
myElem.ansCol.value     = messages.question.column;
myElem.ansBtn.innerHTML = messages.talk.jump;
myElem.ansCol.disabled  = true;
myElem.ansBtn.disabled  = true;
myElem.numOX.innerHTML  = "⭕️："+quizManager.cntO+"　❌："+quizManager.cntX;
if(isMobileDevice()){
    myElem.text.innerHTML = messages.buttonCheck.intro.mobile;
}else{
    myElem.text.innerHTML = "YouTube Quiz Battle";
}
//
document.styleSheets.item(0).insertRule('html { touch-action: manipulation; }'); //disable double tap gesture
document.styleSheets.item(0).insertRule('body { text-align: center; margin: auto; background: #EFEFEF; }');
document.styleSheets.item(0).insertRule('.blinkImg   { animation: blinkImg 0.7s infinite alternate; }');
document.styleSheets.item(0).insertRule('@keyframes blinkImg { 0% { opacity: 0.3; } 100% { opacity: 1; }}');
document.styleSheets.item(0).insertRule('.blinkText  { animation: blinkText 0.7s infinite alternate; }');
document.styleSheets.item(0).insertRule('@keyframes blinkText{ 0% { opacity: 0;   } 100% { opacity: 1; }}');
document.styleSheets.item(0).insertRule('div#divelem { float: left; display: flex; align-items: center; justify-content: center; flex-direction: column; }');
document.styleSheets.item(0).insertRule('div#divbtn  { overflow: hidden; position: relative; transform-origin: left top; }');
document.styleSheets.item(0).insertRule('img#pushbtn { position: absolute; left: 0px; top: 0px; }');
const appendBlinkTag = (message) => {
    return `<span class='blinkText'>${message}</span>`;
};
//
if(isMobileDevice()){
    myElem.text.style.fontSize       = '42px';
    myElem.text.style.lineHeight     = '60px';
    myElem.text.style.fontWeight     = 'bold';
    myElem.text.style.display        = 'block';
    myElem.text.style.marginTop      = '32px';
    myElem.text.style.marginBottom   = '32px';
    myElem.text.style.padding        = '0px 10px';
    myElem.subText.style.fontSize    = '42px';
    myElem.subText.style.lineHeight  = '60px';
    myElem.subText.style.display     = 'block';
    myElem.ansCol.style.fontSize     = '50px';
    myElem.ansCol.style.height       = '100px';
    myElem.ansCol.style.textAlign    = 'center';
    myElem.ansCol.style.marginBottom = '10px';
    myElem.ansCol.style.marginLeft   = 'auto';
    myElem.ansCol.style.marginRight  = 'auto';
    myElem.ansCol.style.display      = 'block'
    myElem.ansBtn.style.fontSize     = '42px';
    myElem.ansBtn.style.width        = parseInt(myElem.ansBtn.style.fontSize, 10)*10+'px';
    myElem.ansBtn.style.height       = parseInt(myElem.ansBtn.style.fontSize, 10)*2+'px';
    myElem.ansBtn.style.marginBottom = '20px';
    myElem.ansBtn.style.marginLeft   = 'auto';
    myElem.ansBtn.style.marginRight  = 'auto';
    myElem.ansBtn.style.display      = 'block';
    myElem.numOX.style.fontSize      = '42px';
    myElem.numOX.style.lineHeight    = '80px';
    myElem.numOX.style.fontWeight    = 'bold';
    myElem.numOX.style.display       = 'block';
    //
    quizManager.viewFuncArray = [
        () => {
            document.querySelector('body').appendChild(myElem.text);
            document.querySelector('body').appendChild(myElem.ansBtn);
            // document.querySelector('body').appendChild(myElem.pushBtn);
            document.querySelector('body').appendChild(myElem.numOX);
        },
        () => {
            myElem.text.style.marginTop = '40px';
            myElem.text.style.marginBottom = '20px';
            myElem.subText.style.marginBottom = '40px';
            myElem.subText.style.padding = '0px 10px';
            document.querySelector('body').insertBefore(myElem.subText, myElem.text.nextSibling);
        },
        () => {
            myElem.text.style.marginTop    = '32px';
            myElem.text.style.marginBottom = '32px';
            myElem.text.parentNode.removeChild(myElem.subText);
            document.querySelector('body').insertBefore(myElem.ansCol, myElem.text.nextSibling);
        },
    ];
    quizManager.viewFuncArray.shift()();
}else{
    const playerHeight = document.getElementById('player').clientHeight;
    const playerWidth  = document.getElementById('player').clientWidth;
    const divUIHeight  = playerHeight*0.9;
    const divUIWidth   = playerWidth;
    const divElemWidth = playerWidth*2/3;
    document.querySelector('body').style.width = playerWidth+'px';
    myElem.divUI.style.width = divUIWidth+'px'; // set with an assignment to reference the value from elsewhere.
    myElem.divUI.style.height = divUIHeight+'px';
    myElem.divElem.style.width = divElemWidth+'px';
    myElem.divElem.style.height = divUIHeight+'px';
    //
    myElem.text.style.fontSize      = '25px';
    myElem.text.style.lineHeight    = '45px';
    myElem.text.style.fontWeight    = 'bold';
    myElem.text.style.display       = 'block';
    myElem.subText.style.fontSize   = '20px';
    myElem.subText.style.lineHeight = '30px';
    myElem.subText.style.display    = 'block';
    myElem.ansCol.style.fontSize    = '23px';
    myElem.ansCol.style.textAlign   = 'center';
    myElem.ansCol.style.width       = divElemWidth*0.75+'px';
    myElem.ansCol.style.margin      = '0px ' +(divElemWidth-parseInt(myElem.ansCol.style.width, 10))/2+'px 15px';
    myElem.ansBtn.style.fontSize    = '23px';
    myElem.ansBtn.style.width       = parseInt(myElem.ansBtn.style.fontSize, 10)*8+'px';
    myElem.ansBtn.style.margin      = '0px '+(divElemWidth-parseInt(myElem.ansBtn.style.width, 10))/2+'px 20px';
    myElem.numOX.style.fontSize     = '25px';
    myElem.numOX.style.lineHeight   = '45px';
    myElem.numOX.style.fontWeight   = 'bold';
    myElem.numOX.style.display      = 'block';
    //
    document.querySelector('body').appendChild(myElem.divUI);
    myElem.divUI.appendChild(myElem.divElem);
    //
    quizManager.viewFuncArray = [
        () => {
            myElem.text.style.margin  = '0px auto';
            myElem.text.style.padding = '0px 40px';
            document.getElementById("divelem").appendChild(myElem.text);
        },
        () => {
            myElem.text.style.margin  = '0px auto 30px';
            myElem.subText.style.margin  = '0px auto 50px';
            myElem.subText.style.padding = '0px 40px';
            document.getElementById("divelem").insertBefore(myElem.subText, myElem.text.nextSibling);
            // document.getElementById("divbtn").appendChild(myElem.pushBtn);
        },
        () => {
            document.getElementById("divelem").insertBefore(myElem.ansBtn, myElem.subText.nextSibling);
        },
        () => {
            myElem.text.style.margin = '0px auto 15px';
            myElem.text.parentNode.removeChild(myElem.subText);
            document.getElementById("divelem").insertBefore(myElem.ansCol, myElem.text.nextSibling);
            document.getElementById("divelem").appendChild(myElem.numOX);
        },
    ];
    quizManager.viewFuncArray.shift()();
}
//
const initPageAppearance = () => {
    /* append push button element */
    if(isMobileDevice()){
        document.querySelector('body').appendChild(myElem.divBtn);
    }else{
        myElem.divUI.appendChild(myElem.divBtn);
    }
    document.getElementById("divbtn").appendChild(myElem.pushBtn);
    //
    resizePlayer();
    resizePushButton(document.getElementById('player').clientHeight, getElemHeight());
    //
    if(isMobileDevice()){
        if(isPortraitOrientation()){
            switchPushButton(BUTTON_STATE.standby);
            myElem.text.innerHTML = messages.buttonCheck.intro.mobile;
        }else{
            switchPushButton(BUTTON_STATE.disabled);
            myElem.text.innerHTML = messages.buttonCheck.orientation;
            alert(messages.alert.orientation);
        }
        myElem.pushBtn.className = "blinkImg";
    }else{
        switchPushButton(BUTTON_STATE.standby);
        if(detectTouchPanel() === true){
            myElem.subText.innerHTML = appendBlinkTag(messages.buttonCheck.intro.other);
        }else{
            myElem.subText.innerHTML = appendBlinkTag(messages.buttonCheck.intro.other);
        }
        quizManager.viewFuncArray.shift()(); 
    }
}
//
(async () => {
    /* load push button image */
    myElem.pushBtn = await loadImage(PATH.button);
    myElem.pushBtn.id = 'pushbtn';
    myElem.pushBtn.tabIndex = 0; // set tabindex for adding focus
    //
    /* load audio data */
    const audioContext = new AudioContext();
    const response1 = await fetch(PATH.sound).catch(() => alert(messages.alert.audio));
    const responseBuffer = await response1.arrayBuffer();
    quizManager.audioBuffer = await audioContext.decodeAudioData(responseBuffer);
    prepareAudioBufferNode();
    //
    /* load answer file */
    const response2 = await fetch(PATH.answer).catch(() => alert(messages.alert.answer));
    const responseText = await response2.text();
    quizManager.ansArray = csvToArray(responseText);
    //
    initPageAppearance();
    quizManager.state = QUIZ_STATE.ButtonCheck;
    //
    window.addEventListener('orientationchange', myOrientationChangeEvent);
    document.addEventListener('webkitvisibilitychange', myPageHiddenCheckEvent, false);
    document.addEventListener("touchstart", myTouchEvent);
    document.addEventListener("compositionstart", () => { quizManager.composingBool = true; });
    document.addEventListener('compositionend',   () => { quizManager.composingBool = false; });
    player.addEventListener('onStateChange', myPlayerStateChangeEvent);
    document.onkeydown = myKeyDownEvent;
    myElem.ansBtn.onclick = myOnClickEvent;
    myElem.ansCol.onfocus = () => { myElem.ansCol.val = ""; }
    setInterval(myIntervalEvent, interval = 10);
})();
//
//---------------------------------------------------------------------------------------------------------------
/* set functions executed in each subtitle */
quizManager.jumpToAnsBool = true;
quizManager.hidePlayerBool = true;
quizManager.disableSeekbarBool = false;
quizManager.firstQuesStartTime = 4.01;
quizManager.srtFuncArray = [
    () => {
        quizManager.viewFuncArray.shift()();
        myElem.ansBtn.innerHTML = messages.question.button;
        /* Question 1 */
        quizManager.ansIndex = 2;
        quizManager.ansIndexStartTime = 18.78;
        //
        quizManager.state = QUIZ_STATE.Question;
        quizManager.quesNum = 1;
        quizManager.cntPush = 0;
        quizManager.correctBool = false;
        myElem.text.innerHTML = messages.question.number(quizManager.quesNum);
        myElem.ansCol.value = messages.question.column;
        myElem.ansCol.disabled = true;
        myElem.ansBtn.disabled = true;
        if(isPortraitOrientation()){ switchPushButton(BUTTON_STATE.standby); }
    },
    () => {
        quizManager.state = QUIZ_STATE.Talk;
        myElem.ansCol.disabled = true;
        myElem.ansBtn.disabled = true;
        switchPushButton(BUTTON_STATE.disabled);
    },
    () => {
        /* Question 2 */
        quizManager.ansIndex = 4;
        quizManager.ansIndexStartTime = 33.93;
        //
        quizManager.state = QUIZ_STATE.Question;
        quizManager.quesNum = 2;
        quizManager.cntPush = 0;
        quizManager.correctBool = false;
        myElem.text.innerHTML = messages.question.number(quizManager.quesNum);
        myElem.ansCol.value = messages.question.column;
        myElem.ansCol.disabled = true;
        myElem.ansBtn.disabled = true;
        if(isPortraitOrientation()){ switchPushButton(BUTTON_STATE.standby); }
    },
    () => {
        quizManager.state = QUIZ_STATE.Talk;
        myElem.ansCol.disabled = true;
        myElem.ansBtn.disabled = true;
        switchPushButton(BUTTON_STATE.disabled);
    },
    () => {
        /* Question 3 */
        quizManager.ansIndex = 6;
        quizManager.ansIndexStartTime = 52.61;
        //
        quizManager.state = QUIZ_STATE.Question;
        quizManager.quesNum = 3;
        quizManager.cntPush = 0;
        quizManager.correctBool = false;
        myElem.text.innerHTML = messages.question.number(quizManager.quesNum);
        myElem.ansCol.value = messages.question.column;
        myElem.ansCol.disabled = true;
        myElem.ansBtn.disabled = true;
        if(isPortraitOrientation()){ switchPushButton(BUTTON_STATE.standby); }
    },
    () => {
        quizManager.state = QUIZ_STATE.Talk;
        myElem.ansCol.disabled = true;
        myElem.ansBtn.disabled = true;
        switchPushButton(BUTTON_STATE.disabled);
    },
    () => {
        /* Question 4 */
        quizManager.ansIndex = 8;
        quizManager.ansIndexStartTime = 67.5;
        //
        quizManager.state = QUIZ_STATE.Question;
        quizManager.quesNum = 4;
        quizManager.cntPush = 0;
        quizManager.correctBool = false;
        myElem.text.innerHTML = messages.question.number(quizManager.quesNum);
        myElem.ansCol.value = messages.question.column;
        myElem.ansCol.disabled = true;
        myElem.ansBtn.disabled = true;
        if(isPortraitOrientation()){ switchPushButton(BUTTON_STATE.standby); }
    },
    () => {
        quizManager.state = QUIZ_STATE.Talk;
        myElem.ansCol.disabled = true;
        myElem.ansBtn.disabled = true;
        switchPushButton(BUTTON_STATE.disabled);
    },
    () => {
        /* Question 5 */
        quizManager.ansIndex = 10;
        quizManager.ansIndexStartTime = 84.39;
        //
        quizManager.state = QUIZ_STATE.Question;
        quizManager.quesNum = 5;
        quizManager.cntPush = 0;
        quizManager.correctBool = false;
        myElem.text.innerHTML = messages.question.number(quizManager.quesNum);
        myElem.ansCol.value = messages.question.column;
        myElem.ansCol.disabled = true;
        myElem.ansBtn.disabled = true;
        if(isPortraitOrientation()){ switchPushButton(BUTTON_STATE.standby); }
    },
    () => {
        quizManager.state = QUIZ_STATE.Talk;
        myElem.ansCol.disabled = true;
        myElem.ansBtn.disabled = true;
        switchPushButton(BUTTON_STATE.disabled);
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

