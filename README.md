# quizBattle.srt.js

YouTube動画内のクイズ企画に視聴者が参加できるしくみ

Bookmarklet

> javascript:(function(){if(window.location.href.indexOf("youtube.com/watch")>-1){var a=window.location.search.split("v=")[1].substring(0,11);window.open("https://srtjs.azurewebsites.net/?v="+a+"&surl=https://raw.githubusercontent.com/t-yokota/quizBattle/master/src/battleMaker.srt.js")}else alert("use this bookmarklet in youtube video page: \n'https://www.youtube.com/watch?v=...'")})();

