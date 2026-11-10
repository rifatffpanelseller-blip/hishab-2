(function(){
  const LN = window.Capacitor && Capacitor.Plugins && Capacitor.Plugins.LocalNotifications;
  if(!LN) return;
  const nid = s => { let h = 0; for(const c of String(s)) h = (h*31 + c.charCodeAt(0)) | 0; return Math.abs(h) % 2000000000 + 1; };
  async function setup(){
    try{
      let p = await LN.checkPermissions();
      if(p.display !== 'granted') p = await LN.requestPermissions();
      try{
        const e = await LN.checkExactNotificationSetting();
        if(e.exact_alarm !== 'granted') await LN.changeExactNotificationSetting();
      }catch(e){}
      await LN.createChannel({id:'alarm', name:'রিমাইন্ডার', importance:5, vibration:true, visibility:1});
    }catch(e){}
  }
  async function sync(){
    try{
      const list = [];
      db.people.forEach(p => (p.rem||[]).forEach(r => {
        if(!r.fired && new Date(r.t).getTime() > Date.now()){
          list.push({
            id: nid(r.id),
            title: 'নক দিন: ' + p.name,
            body: r.note || p.phone || '',
            channelId: 'alarm',
            schedule: { at: new Date(r.t), allowWhileIdle: true }
          });
        }
      }));
      if(list.length) await LN.schedule({ notifications: list });
    }catch(e){}
  }
  const oa = window.addRem, od = window.delRem;
  window.addRem = function(){ oa(); setup().then(sync); };
  window.delRem = function(i){
    try{ LN.cancel({ notifications: [{ id: nid(i) }] }); }catch(e){}
    od(i);
  };
  setup().then(sync);
})();
