<div style="text-align: center">
    <img class="main" src="https://raw.githubusercontent.com/t-yokota/quizBattle/master/docs/images/main-image.png">
</div>

# YouTube動画で早押しクイズをする

スマホやPCでYouTube上のクイズ動画を見ながら、動画内で出題されたクイズに早押しで解答できるツールです。

各端末のブラウザから（大体）利用できると思います。

## 注意事項

本ツールではブラウザ上でJavaScriptのプログラムが実行されます。あらかじめご了承ください。利用中に正常に動作しなくなった場合は、ブラウザのタブを閉じるか、再度読み込んでください。

# 使い方

1. コンテンツから動画を選択して視聴ページに移動する。
1. 表示されるポップアップを確認した後、動画プレイヤーの再生ボタンをタップ（またはクリック）する。

# コンテンツ

## ■ お試しクイズ

本ツールのデモ用に作成した1分30秒の短いクイズ動画です（全5問、音声なし）。

<table class="contents">
    <tr>
        <td>
            <a href="https://srtjs.azurewebsites.net/?v=BHWd-HDorfY&surl=https://raw.githubusercontent.com/t-yokota/quizBattle/master/src/quizBattle.srt.js" target="_blank" rel="noopener noreferrer">
                <div class="sample-box">
                    <img class='thumbnail' src="https://i.ytimg.com/vi_webp/BHWd-HDorfY/sddefault.webp" alt="お試しクイズ">
                    <img class='icon' src="https://raw.githubusercontent.com/t-yokota/quizBattle/master/docs/images/video_icon.png">
                </div>
                お試しクイズ
            </a>
        </td>
        <td>
        </td>
    </tr>
</table>

## ■ abc the 12th by ラミィ(@quiz_reader)

ラミィ([@quiz_reader](https://twitter.com/quiz_reader?s=20))さんによる、学生クイズ大会abc12thの過去問の問読み動画をお借りしたコンテンツです。

<table class="contents">
    <tr>
        <td>
            <a href="https://srtjs.azurewebsites.net/?v=ue9b06lFQG0&surl=https://raw.githubusercontent.com/t-yokota/quizBattle/master/contents/lamy_abc_12th/content-1.srt.js" target="_blank" rel="noopener noreferrer">
                <div class="sample-box">
                    <img class='thumbnail' src="https://i.ytimg.com/vi_webp/ue9b06lFQG0/sddefault.webp" alt="【問い読み】クイズの問題を読む 第1回【abc the 12th】">
                    <img class='icon' src="https://raw.githubusercontent.com/t-yokota/quizBattle/master/docs/images/video_icon.png">
                </div>
                【問い読み】クイズの問題を読む 第1回【abc the 12th】
            </a>
        </td>
        <td>
            <a href="https://srtjs.azurewebsites.net/?v=Mlxs5v3bQK4&surl=https://raw.githubusercontent.com/t-yokota/quizBattle/master/contents/lamy_abc_12th/content-2.srt.js" target="_blank" rel="noopener noreferrer">
                <div class="sample-box">
                    <img class='thumbnail' src="https://i.ytimg.com/vi_webp/Mlxs5v3bQK4/sddefault.webp" alt="【問い読み】クイズの問題を読む 第2回【abc the 12th】">
                    <img class='icon' src="https://raw.githubusercontent.com/t-yokota/quizBattle/master/docs/images/video_icon.png">
                </div>
                【問い読み】クイズの問題を読む 第2回【abc the 12th】
            </a>
        </td>
    </tr>
    <tr>
        <td>
            <a href="https://srtjs.azurewebsites.net/?v=V6R8y2VRm0I&surl=https://raw.githubusercontent.com/t-yokota/quizBattle/master/contents/lamy_abc_12th/content-3.srt.js" target="_blank" rel="noopener noreferrer">
                <div class="sample-box">
                    <img class='thumbnail' src="https://i.ytimg.com/vi_webp/V6R8y2VRm0I/sddefault.webp" alt="【問い読み】クイズの問題を読む 第3回【abc the 12th】">
                    <img class='icon' src="https://raw.githubusercontent.com/t-yokota/quizBattle/master/docs/images/video_icon.png">
                </div>
                【問い読み】クイズの問題を読む 第3回【abc the 12th】
            </a>
        </td>
        <td>
            <a href="https://srtjs.azurewebsites.net/?v=vJQIxN-H2Uw&surl=https://raw.githubusercontent.com/t-yokota/quizBattle/master/contents/lamy_abc_12th/content-3.srt.js" target="_blank" rel="noopener noreferrer">
                <div class="sample-box">
                    <img class='thumbnail' src="https://i.ytimg.com/vi_webp/vJQIxN-H2Uw/sddefault.webp" alt="【問い読み】クイズの問題を読む 第4回【abc the 12th】">
                    <img class='icon' src="https://raw.githubusercontent.com/t-yokota/quizBattle/master/docs/images/video_icon.png">
                </div>
                【問い読み】クイズの問題を読む 第4回【abc the 12th】
            </a>
        </td>
    </tr>
</table>

# 問い合わせ

本ツールに関する問い合わせは、Twitter（[@yktm_0529](https://twitter.com/yktm_0529)）のDMからお願いいたします。

本ツールを使用したコンテンツの作成に関心があり、クイズ動画の使用許可をいただける動画製作者の方がいらっしゃいましたら、ぜひご連絡いただけると幸いです。

# Q＆A

<div class="qa-list mts">
<dl class="qa">
<dt>正しい解答を入力しているはずなのに、誤答と判定されてしまう。</dt>
<dd>
<p>クイズの解答は各コンテンツの動画ごとにcsvファイルで管理しています。複数の解答のパターン（漢字表記・ひらがな表記、あるいは別解等）を可能な範囲でカバーするようにしてはおりますが、網羅はできていません。確実に合っているのに誤答になってしまった、という場合はご一報ください。csvファイルの更新を検討させていただきます（解答チェック処理の不具合だった場合は修正します）。</p>
</dd>
</dl>
<dl class="qa">
<dt>ここに質問が入ります</dt>
<dd>
<p>ここに回答が入ります</p>
</dd>
</dl>
<dl class="qa">
<dt>ここに質問が入ります</dt>
<dd>
<p>ここに回答が入ります</p>
</dd>
</dl>
</div>

---

本ツールは、津田塾大学の栗原一貴先生による[srt.js](https://www.unryu.org/home/srtjs)を利用して開発しています。