00:00:00,000 --> 00:10:00,000
var state = player.getPlayerState();
if(state == -1){
    未再生
}else if(state == 0){
    終了
}else if(state == 1){
    再生中
}else if(state == 2){
    一時停止
}