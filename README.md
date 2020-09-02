# quizBattle.srt.js

YouTube動画内のクイズ企画に視聴者が参加できるようにするもの

[デモページ](https://srtjs.azurewebsites.net/?v=5HPPGh7bNrQ&surl=https://raw.githubusercontent.com/t-yokota/quizBattle/master/contents/demo/forDemoQuizBattle/quizBattle.srt.js)

## battleMaker.srt.js

- 各動画コンテンツに合わせたsrc.jsスクリプトを生成するためのツール
- ツール上で各問題の時間範囲と正答を入力し、コンテンツ用のスクリプトと正答ファイルを生成
  - 生成されたスクリプトをquizBattle.srt.jsのコンテンツ別内容の部分に貼り付ける
  - 生成されたanswer.csvファイルはgithubにアップして、コンテンツ用のquizBattle.srt.js内にURL記載する。

### ツールの使い方

- TBA

## Bookmarklet

※ 以下はYouTubeページのURL形式を網羅的にフォローしているわけではないので注意

### コンテンツページへ移動する

- YouTube上の動画視聴ページからsrt.jsのコンテンツ用ページを作成して移動する
  - surlのパラメータ値には、githubにpushしたコンテンツ用スクリプトのurlを貼り付ける

```js
javascript:(function(){if(window.location.href.indexOf("youtube.com/watch")>-1){var a=window.location.search.split("v=")[1].substring(0,11);window.open("https://srtjs.azurewebsites.net/?v="+a+"&surl=")}else alert("use this bookmarklet in youtube video page: \n'https://www.youtube.com/watch?v=...'")})();
```

### コンテンツ生成用ページへ移動する

- YouTubeの視聴画面からコンテンツ作成用画面に移動する

```js
javascript:(function(){if(window.location.href.indexOf("youtube.com/watch")>-1){var a=window.location.search.split("v=")[1].substring(0,11);window.open("https://srtjs.azurewebsites.net/?v="+a+"&surl=https://raw.githubusercontent.com/t-yokota/quizBattle/master/src/battleMaker.srt.js")}else alert("use this bookmarklet in youtube video page: \n'https://www.youtube.com/watch?v=...'")})();
```
