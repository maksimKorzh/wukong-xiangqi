// UBB tags
const UBB_TAGS = [
  '[DhtmlXQ_ver]',
  '[DhtmlXQ_title]',
  '[DhtmlXQ_event]',
  '[DhtmlXQ_date]',
  '[DhtmlXQ_place]',
  '[DhtmlXQ_round]',
  '[DhtmlXQ_red]',
  '[DhtmlXQ_redteam]',
  '[DhtmlXQ_redrating]',
  '[DhtmlXQ_blacktime]',
  '[DhtmlXQ_black]',
  '[DhtmlXQ_blackteam]',
  '[DhtmlXQ_blackrating]',
  '[DhtmlXQ_blacktime]',
  '[DhtmlXQ_result]',
  '[DhtmlXQ_remark]',
  '[DhtmlXQ_author]',
  //'[DhtmlXQ_binit]',
  '[DhtmlXQ_movelist]',
  '[DhtmlXQ_move_',
  '[DhtmlXQ_comment',
  '[DhtmlXQ_type]',
  '[DhtmlXQ_timerule]',
  '[DhtmlXQ_endtype]',
  '[DhtmlXQ_owner]',
  //'[DhtmlXQ_firstnum]',
  '[DhtmlXQ_gametype]',
  '[DhtmlXQ_generator]'
];

// covert UBB to TXT
function ubb2txt() {
  let txt = '';
  let ubb = document.getElementById('ubb');
  let game = ubb.value.split('\n');
  
  for (let index = 0; index < game.length; index++) {
    let ubbTag = game[index];

    for (let tag = 0; tag < UBB_TAGS.length; tag++) {
      let data = ubbTag.split(UBB_TAGS[tag])[1];
      let tagName = UBB_TAGS[tag].split('_')[1].split(']')[0];
      
      if (data == undefined) continue;
      data = data.split('[')[0];
      if (data == '') continue;
      if (tagName == 'movelist') alert(data);
      
      txt += tagName + ': ' + data + '\n';
    }
  }
  
  ubb.value = txt;
}





