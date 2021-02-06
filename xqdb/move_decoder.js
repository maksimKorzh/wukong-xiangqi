/************************************************\
 ================================================
 
            Script to decode moves from
                DHTML Xiangqi games
               (http://www.dpxq.com)
               
                        by
                        
                 Code Monkey King
 
 ===============================================
\************************************************/

const fs = require("fs")


/****************************\
 ============================

        PROCESS GAMES

 ============================              
\****************************/

// convert HTML game data to PGN
function processGames(indexFrom, indexTo) {
  let headers = '';
  let moves = '';
  let db = [];
  
  for (let index = indexFrom; index < indexTo; index++) {
    try {
      let file = fs.readFileSync('./games_html/' + index + '.html')
      let html = file.toString();
      let event = html.split('<h3>')[1].split('</h3>')[0];
      let red = html.split('[DhtmlXQ_red]')[1].split('[/DhtmlXQ_red]')[0];
      let black = html.split('[DhtmlXQ_black]')[1].split('[/DhtmlXQ_black]')[0];
      let moveList = html.split('[DhtmlXQ_movelist]')[1].split('[/DhtmlXQ_movelist]')[0];
      let headers = '[Event "' + event + '"]\n[Red "' + red + '"]\n[Black "' + black + '"]\n\n'
      let decode = 'traditional';
      let moves = getMovelistString(moveList, decode) + '\n\n';
      let pgn = headers + moves;

      console.log('decoding game', index);
      fs.appendFileSync('./games_pgn/xqdb_' + decode + '.pgn', pgn);
    } catch(e) {}
  }
}


/****************************\
 ============================

         DPXQ DECODER

 ============================              
\****************************/

// move to notation
function c_move_international(m) {
  // 车马相象仕士帅将炮　　　　　　　兵卒一１二２三３四４五５六６七７八８九９前中后进退平
  var b='\uFF32\uFF28\uFF25\uFF25\uFF21\uFF21\uFF2B\uFF2B\uFF23\u3000\u3000\u3000\u3000\u3000\u3000\u3000\uFF30\uFF30\uFF11\uFF11\uFF12\uFF12\uFF13\uFF13\uFF14\uFF14\uFF15\uFF15\uFF16\uFF16\uFF17\uFF17\uFF18\uFF18\uFF19\uFF19\uFF0B\uFF1D\uFF0D\uFF0B\uFF0D\uFF1D';
  var s='',n,x;
  for (x=0;x<4;x++) {n=m.charCodeAt(x)-49;s+=b.charAt(n);}
  return s;
}

function c_move_traditional(m) {
    var b = '\u8F66\u9A6C\u76F8\u8C61\u4ED5\u58EB\u5E05\u5C06\u70AE\u3000\u3000\u3000\u3000\u3000\u3000\u3000\u5175\u5352\u4E00\uFF11\u4E8C\uFF12\u4E09\uFF13\u56DB\uFF14\u4E94\uFF15\u516D\uFF16\u4E03\uFF17\u516B\uFF18\u4E5D\uFF19\u524D\u4E2D\u540E\u8FDB\u9000\u5E73';
    var s = '',
        n, x;
    for (x = 0; x < 4; x++) {
        n = m.charCodeAt(x) - 49;
        s += b.charAt(n);
    }
    return s;
}

// decode move
function getMoveText(s,p,b) {
  var tP,m,i,I=' ';
  var t=' UW| UVW| UEGW| UEGIW||| WU| WVU| WGEU| WIGEU'.split('|');
  var f='12357532199AAAAA12468642199BBBBB';
  var r='CDEFGHIJKLMNOPQRST';
  var fC=s.charAt(0)-0;
  var fR=s.charAt(1)-0;
  var tC=s.charAt(2)-0;
  var tR=s.charAt(3)-0;
  var fP=f.charAt(p[s.substr(0,2)-0]);
  if (b==0) {
    m=fP+r.charAt((8-fC)*2);
    if ((fP=='1')||(fP=='2')||(fP=='9')||(fP=='A')) {
      for (i=0;i<=9;i++) {tP=p[fC*10+i]; if ((tP<16)&&(f.charAt(tP)==fP)) I+=i;}
      if (I.length>=3) {
        m=t[I.length-3].charAt(I.indexOf(fR));
        if (I.length<=4&&fP=='A') {
            p=p.join('_')+'_';
            m+=(('|0'+p.indexOf('11_')/3+'|0'+p.indexOf('12_')/3+'|0'+p.indexOf('13_')/3+'|0'+p.indexOf('14_')/3+'|0'+p.indexOf('15_')/3+'|').match(/\|\d{2,3}/gi).join('').replace(/\|\d?(\d)\d/gi,'$1').replace(eval('/'+fC+'/gi'),'').search(/(\d).*\1/gi)!=-1)?(r.charAt(16-fC*2)):fP;
        }
        else m+=fP;
      }
    }
    if (fR==tR) m+='Z'+r.charAt((8-tC)*2);
    else if (fR>tR) m+='X'+r.charAt(((fP>1)&&(fP<7))?((8-tC)*2):((fR-tR-1)*2+b));
    else m+='Y'+r.charAt(((fP>1)&&(fP<7))?((8-tC)*2):((tR-fR-1)*2+b));
  }
  else {
    m=fP+r.charAt(fC*2+b);
    if ((fP=='1')||(fP=='2')||(fP=='9')||(fP=='B')) {
      for (i=0;i<=9;i++) {tP=p[fC*10+i]; if ((tP>15)&&(tP<32)&&(f.charAt(tP)==fP)) I+=i;}
      if (I.length>=3) {
          m=t[I.length+3].charAt(I.indexOf(fR));
          if (I.length<=4&&fP=='B')
          {
              p=p.join('_')+'_';
              m+=(('|0'+p.indexOf('27_')/3+'|0'+p.indexOf('28_')/3+'|0'+p.indexOf('29_')/3+'|0'+p.indexOf('30_')/3+'|0'+p.indexOf('31_')/3+'|').match(/\|\d{2,3}/gi).join('').replace(/\|\d?(\d)\d/gi,'$1').replace(eval('/'+fC+'/gi'),'').search(/(\d).*\1/gi)!=-1)?(r.charAt(fC*2+1)):fP;
          }
          else m+=fP;
      }
    }
    if (fR==tR) m+='Z'+r.charAt(tC*2+b);
    else if (fR>tR) m+='Y'+r.charAt(((fP>1)&&(fP<7))?(tC*2+b):((fR-tR-1)*2+b));
    else m+='X'+r.charAt(((fP>1)&&(fP<7))?(tC*2+b):((tR-fR-1)*2+b));
  }
  
  return m;
}

// decode movelist
function getMovelistString(m0, encoding) {
  // pick up move decoding output
  let c_move = (encoding == 'traditional') ? c_move_traditional : c_move_international;
  
  p0 = '8979695949392919097717866646260600102030405060708012720323436383';
  var i,t=99,ms='';
  var p='          '.replace(/ /gi,'          ').replace(/ /gi,'99').match(/\d\d/gi);
  p0=p0.match(/\d{2}/gi);
  for (i=0;i<32;i++) {p[p0[i]-0]=((100+i)+'').substr(1);}
  var m=m0.match(/\d{4}/gi);
  if (m==null) return '';
  var ml=m.length;
  let moveNumber = 1;
  for (i=0;i<ml;i++) {
    t=p[m[i].substr(0,2)-0];
    if ((t>=0)&&(t<=15)) {
      // add move number (CMK)
      ms += (i ? ' ' : '') + moveNumber + '. ';
      moveNumber++;
      
      ms+=c_move(getMoveText(m[i],p,0)) + ' '; //0  red
    } else if ((t>=16)&&(t<=31)) ms+=c_move(getMoveText(m[i],p,1)); // black
    else {ms+='\u7740\u6CD5\u9519\u8BEF'; continue;}
    p[m[i].substr(2,2)-0]=p[m[i].substr(0,2)-0];
    p[m[i].substr(0,2)-0]='99';
  }
  
  return ms;
}


/****************************\
 ============================

          MAIN DRIVER

 ============================              
\****************************/

processGames(41, 43879);

