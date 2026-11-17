#!/usr/bin/env python3
"""Align a recorded narration (mp3/wav) to script.json lines without Whisper, using pocketsphinx (pip install pocketsphinx).
usage: python3 align_voice.py <project_dir> <audio> [outro_seconds]
Writes data/narration.wav (lead 0.2 s), data/lines.json, data/words.json. Then run: node tools/capture.mjs cues; tools/mix.py"""
import json, re, os, sys, difflib, subprocess
from pocketsphinx import Decoder, get_model_path
P, A = sys.argv[1], sys.argv[2]; outro = float(sys.argv[3]) if len(sys.argv) > 3 else 0.9
os.chdir(P)
subprocess.run(['ffmpeg','-y','-v','error','-i',A,'-af','silenceremove=stop_periods=-1:stop_duration=0.55:stop_threshold=-30dB:stop_silence=0.32,adelay=200|200,highpass=f=70','-ar','44100','-ac','1','data/narration.wav'],check=True)
subprocess.run(['ffmpeg','-y','-v','error','-i','data/narration.wav','-ar','16000','-ac','1','-f','s16le','data/v.raw'],check=True)
mp = get_model_path()
d = Decoder(hmm=os.path.join(mp,'en-us/en-us'), lm=os.path.join(mp,'en-us/en-us.lm.bin'), dict=os.path.join(mp,'en-us/cmudict-en-us.dict'), loglevel='FATAL')
d.start_utt(); d.process_raw(open('data/v.raw','rb').read(), False, True); d.end_utt()
rec = [(re.sub(r'\(\d\)','',s.word), s.start_frame/100, (s.end_frame+1)/100) for s in d.seg() if s.word[0] not in '<[+']
lines = [l if isinstance(l,str) else l['text'] for l in json.load(open('script.json'))['lines']]
toks = [(w,i) for i,t in enumerate(lines) for w in t.split()]
norm = lambda w: re.sub(r"[^a-z']",'',w.lower())
sw = [norm(w) for w,_ in toks]; rw = [norm(r[0]) for r in rec]
sm = difflib.SequenceMatcher(None, sw, rw, autojunk=False); st = [None]*len(sw)
for a,b,n in sm.get_matching_blocks():
    for k in range(n): st[a+k] = (rec[b+k][1], rec[b+k][2])
print('matched', sum(x is not None for x in st), 'of', len(sw))
dur = float(subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0','data/narration.wav']))
idx = [i for i,x in enumerate(st) if x]
if idx[0] > 0:
    t0 = st[idx[0]][0]
    for k in range(idx[0]): st[k] = (0.2+(t0-0.2)*k/idx[0], 0.2+(t0-0.2)*(k+1)/idx[0])
for a,b in zip(idx, idx[1:]):
    if b-a > 1:
        t0, t1, n = st[a][1], st[b][0], b-a-1
        for k in range(n): st[a+1+k] = (t0+(t1-t0)*k/n, t0+(t1-t0)*(k+1)/n)
last = idx[-1]; t0 = st[last][1]; n = len(sw)-last-1
for k in range(n): st[last+1+k] = (t0+(dur-0.1-t0)*k/n, t0+(dur-0.1-t0)*(k+1)/n)
words = [{'w':w,'line':l,'s':round(s,3),'e':round(max(e,s+0.08),3)} for (w,l),(s,e) in zip(toks,st)]
for a,b in zip(words, words[1:]):
    if b['s'] < a['s']: b['s'] = a['e']
    if a['e'] > b['s'] and b['s']-0.005 > a['s']: a['e'] = round(b['s']-0.005,3)
ls = []
for i,t in enumerate(lines):
    ws = [w for w in words if w['line']==i]; ls.append({'i':i,'text':t,'start':ws[0]['s'],'end':ws[-1]['e']})
json.dump({'duration':round(ls[-1]['end']+outro,3),'voice':'recorded','speed':1.0,'lines':ls}, open('data/lines.json','w'))
json.dump(words, open('data/words.json','w'))
for l in ls: print(l['i'], l['start'], l['end'])
