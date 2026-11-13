"""Weekly long video for The Hollow Archive: a countdown compilation of the week's shorts, 16:9, under 95 MB.

  ~/.faceless-shorts/venv/bin/python compile/make_long.py manifest.json out_dir

manifest.json:
{ "title": "10 Crazy Stories You Won't Forget",  # shown on the intro card
  "intro": "<optional spoken intro>", "tagline": "<optional line under the title>",
  "thumb1": "10 CRAZY", "thumb2": "STORIES", "sticker": "COUNTDOWN",
  "voice": "am_eric", "speed": 1.08,
  "items": [ { "mp4": "videos/.../x.mp4", "title": "The Man Who Stole the Crown Jewels" }, ... ] }
items are listed from #N (shown first) down to #1 (the best, shown last).

Writes out_dir/long.mp4, out_dir/thumb.jpg (1280x720), out_dir/chapters.txt (YouTube chapter lines).
Needs ffmpeg, ImageMagick (convert), and the faceless-shorts venv (kokoro_onnx) with the Kokoro model files.
"""
import json, os, subprocess, sys, textwrap
from pathlib import Path
import numpy as np
from scipy.io import wavfile

HERE = Path(__file__).resolve().parent
A = HERE / 'assets'
FONT = str(A / 'Inter-Black.otf')
KDIR = Path(os.environ.get('FACELESS_HOME', Path.home() / '.faceless-shorts')) / 'kokoro'
W, H, FPS, SR = 1920, 1080, 30, 24000
VX, VW = (W - 608) // 2, 608          # where the vertical short sits

def sh(*a): subprocess.run(a, check=True)
def dur(p): return float(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', str(p)]).decode().strip())
def ts(s): s = int(s); return f'{s // 60}:{s % 60:02d}' if s < 3600 else f'{s // 3600}:{s % 3600 // 60:02d}:{s % 60:02d}'

def say(k, text, voice, speed, out):
    x, _ = k.create(text, voice=voice, speed=speed, lang='en-us'); x = np.asarray(x, dtype=np.float32)
    pad = np.zeros(int(0.25 * SR), dtype=np.float32); x = np.concatenate([pad, x, pad * 2])
    wavfile.write(out, SR, (np.clip(x, -1, 1) * 32767).astype(np.int16)); return len(x) / SR

def bg(out, dark=0.25):
    sh('convert', str(A / 'bg.png'), '-resize', f'{W}x{H}^', '-gravity', 'center', '-extent', f'{W}x{H}',
       '-fill', 'black', '-colorize', f'{int(dark * 100)}%', out)

def text_img(out, txt, w, h, pt, fill='#FFFFFF', stroke=10):
    """outlined caption text: a thick ink outline layer under a clean fill layer"""
    base = ['-background', 'none', '-size', f'{w}x{h}', '-gravity', 'center', '-font', FONT, '-pointsize', str(pt)]
    sh('convert', *base, '-fill', '#1F1C33', '-stroke', '#1F1C33', '-strokewidth', str(stroke * 2), f'caption:{txt}', out + '.o.png')
    sh('convert', *base, '-fill', fill, '-stroke', 'none', f'caption:{txt}', out + '.f.png')
    sh('convert', out + '.o.png', out + '.f.png', '-composite', out)

def panel(out, num, title):
    """transparent 1920x1080 overlay: big #N on the left, story title on the right"""
    t = Path(out).with_suffix('')
    text_img(f'{t}_n.png', f'#{num}', 560, 420, 260, '#FFD54A', 16)
    text_img(f'{t}_t.png', title.upper(), 560, 620, 64, '#FFFFFF', 9)
    sh('convert', '-size', f'{W}x{H}', 'xc:none',
       '-fill', 'rgba(15,18,32,0.85)', '-draw', f'roundrectangle 40,120 {VX - 40},{H - 120} 40,40',
       '-draw', f'roundrectangle {VX + VW + 40},120 {W - 40},{H - 120} 40,40',
       f'{t}_n.png', '-geometry', f'+{(VX - 560) // 2}+{(H - 420) // 2}', '-composite',
       f'{t}_t.png', '-geometry', f'+{VX + VW + (W - VX - VW - 560) // 2}+{(H - 620) // 2}', '-composite', out)

def card(out_png, big, small, logo=False):
    """full-frame title card"""
    t = Path(out_png).with_suffix('')
    bg(f'{t}_bg.png', 0.35)
    text_img(f'{t}_big.png', big, 1500, 420, 210 if len(big) < 8 else 120, '#FFD54A', 16)
    text_img(f'{t}_small.png', small.upper(), 1500, 300, 70, '#FFFFFF', 9)
    args = ['convert', f'{t}_bg.png']
    if logo: args += ['(', str(A / 'logo.png'), '-resize', '300x300', ')', '-geometry', f'+{(W - 300) // 2}+70', '-composite']
    y_big = 360 if logo else 200
    args += [f'{t}_big.png', '-geometry', f'+{(W - 1500) // 2}+{y_big}', '-composite', f'{t}_small.png', '-geometry', f'+{(W - 1500) // 2}+{y_big + 400}', '-composite', out_png]
    sh(*args)

def card_clip(png, wav, d, out):
    """still card with a slow push-in, the narration, ending on a short beat"""
    n = int(d * FPS)
    sh('ffmpeg', '-v', 'error', '-y', '-loop', '1', '-i', png, '-i', wav, '-filter_complex',
       f'[0:v]scale={W * 2}:{H * 2},zoompan=z=\'1+0.04*on/{n}\':x=\'iw/2-(iw/zoom/2)\':y=\'ih/2-(ih/zoom/2)\':d={n}:s={W}x{H}:fps={FPS},format=yuv420p[v];'
       f'[1:a]aresample=48000,apad[a]', '-map', '[v]', '-map', '[a]', '-t', f'{d:.3f}',
       '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '18', '-c:a', 'aac', '-b:a', '160k', '-ar', '48000', '-ac', '2', out)

def short_clip(bgpng, panelpng, mp4, out):
    sh('ffmpeg', '-v', 'error', '-y', '-loop', '1', '-i', bgpng, '-i', panelpng, '-i', mp4, '-filter_complex',
       f'[2:v]scale={VW}:{H},setsar=1[s];[0:v][s]overlay={VX}:0[b];[b][1:v]overlay=0:0,fps={FPS},format=yuv420p[v];'
       f'[2:a]aresample=48000[a]', '-map', '[v]', '-map', '[a]', '-t', f'{dur(mp4):.3f}',
       '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '18', '-c:a', 'aac', '-b:a', '160k', '-ar', '48000', '-ac', '2', out)

def main():
    man = json.loads(Path(sys.argv[1]).read_text()); out = Path(sys.argv[2]); out.mkdir(parents=True, exist_ok=True)
    tmp = out / 'tmp'; tmp.mkdir(exist_ok=True)
    from kokoro_onnx import Kokoro
    k = Kokoro(str(KDIR / 'kokoro-v1.0.onnx'), str(KDIR / 'voices-v1.0.bin'))
    voice, speed, items = man.get('voice', 'am_eric'), man.get('speed', 1.08), man['items']
    N = len(items); parts, chapters, t = [], [], 0.0
    bg(str(tmp / 'bg.png'), 0.2)

    # intro
    d = say(k, man.get('intro', f"Here are {N} of the craziest stories on The Hollow Archive. Some are true, some are legends, and every one has an ending you won't see coming. Let's count them down."), voice, speed, str(tmp / 'intro.wav'))
    card(str(tmp / 'intro.png'), man['title'].upper(), man.get('tagline', 'Stories you will never forget'), logo=True)
    card_clip(str(tmp / 'intro.png'), str(tmp / 'intro.wav'), max(10.5, d + 0.3), str(tmp / 'p00.mp4')); parts.append(tmp / 'p00.mp4')
    chapters.append((0.0, 'Intro')); t += dur(tmp / 'p00.mp4')

    for i, it in enumerate(items):
        num = N - i
        wav = str(tmp / f'c{i:02d}.wav'); d = say(k, f"Number {num}.", voice, speed, wav)
        card(str(tmp / f'c{i:02d}.png'), f'#{num}', it['title'])
        card_clip(str(tmp / f'c{i:02d}.png'), wav, max(2.2, d + 0.4), str(tmp / f'p{i:02d}a.mp4'))
        panel(str(tmp / f'panel{i:02d}.png'), num, it['title'])
        short_clip(str(tmp / 'bg.png'), str(tmp / f'panel{i:02d}.png'), it['mp4'], str(tmp / f'p{i:02d}b.mp4'))
        chapters.append((t, f"#{num} {it['title']}"))
        parts += [tmp / f'p{i:02d}a.mp4', tmp / f'p{i:02d}b.mp4']; t += dur(tmp / f'p{i:02d}a.mp4') + dur(tmp / f'p{i:02d}b.mp4')

    # outro
    d = say(k, "And that's all of them. A brand new story drops every single day on The Hollow Archive, so subscribe, and I'll see you in the next one.", voice, speed, str(tmp / 'outro.wav'))
    card(str(tmp / 'outro.png'), 'SUBSCRIBE', 'New stories every day', logo=True)
    card_clip(str(tmp / 'outro.png'), str(tmp / 'outro.wav'), d + 0.6, str(tmp / 'pzz.mp4')); parts.append(tmp / 'pzz.mp4')
    t += dur(tmp / 'pzz.mp4')   # the outro stays inside the last chapter (chapters must be 10 s or longer)

    # join, normalise loudness, encode to fit under 95 MB (GitHub limit 100 MB)
    (tmp / 'list.txt').write_text(''.join(f"file '{p.resolve()}'\n" for p in parts))
    sh('ffmpeg', '-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', str(tmp / 'list.txt'), '-c', 'copy', str(tmp / 'joined.mp4'))
    total = dur(tmp / 'joined.mp4'); vk = min(4500, max(600, int(85 * 8 * 1000 / total - 170)))
    common = ['-c:v', 'libx264', '-preset', 'fast', '-b:v', f'{vk}k', '-maxrate', f'{int(vk * 1.6)}k', '-bufsize', f'{vk * 3}k']
    sh('ffmpeg', '-v', 'error', '-y', '-i', str(tmp / 'joined.mp4'), *common, '-pass', '1', '-passlogfile', str(tmp / 'x264'), '-an', '-f', 'mp4', '/dev/null')
    sh('ffmpeg', '-v', 'error', '-y', '-i', str(tmp / 'joined.mp4'), *common, '-pass', '2', '-passlogfile', str(tmp / 'x264'),
       '-af', 'loudnorm=I=-14:TP=-1.5:LRA=11', '-c:a', 'aac', '-b:a', '160k', '-movflags', '+faststart', str(out / 'long.mp4'))

    # chapters (YouTube needs the first at 0:00, each at least 10 s long)
    (out / 'chapters.txt').write_text('\n'.join(f'{ts(s)} {name}' for s, name in chapters) + '\n')

    # thumbnail 1280x720: three cover frames + big text + the detective logo
    covers = []
    for i, it in enumerate(items[-3:]):
        c = str(tmp / f'cov{i}.jpg'); sh('ffmpeg', '-v', 'error', '-y', '-ss', f'{dur(it["mp4"]) * 0.35:.2f}', '-i', it['mp4'], '-frames:v', '1', '-vf', 'scale=300:534', c); covers.append(c)
    args = ['convert', str(A / 'bg.png'), '-resize', '1280x720^', '-gravity', 'center', '-extent', '1280x720', '-gravity', 'northwest']
    for i, c in enumerate(covers):   # three tilted cover cards across the top
        args += ['(', c, '-resize', '260x462', '-bordercolor', '#1F1C33', '-border', '6', '-rotate', str([-7, 2, 8][i]), '-background', 'none', ')', '-geometry', f'+{150 + i * 330}+{10 + (i % 2) * 20}', '-composite']
    args += [str(tmp / 'th_bg.png')]
    sh(*args)
    sh('bash', str(HERE / 'thumb_long.sh'), str(tmp / 'th_bg.png'), man.get('thumb1', f'{N} CRAZY'), man.get('thumb2', 'STORIES'), str(out / 'thumb.jpg'), man.get('sticker', 'COUNTDOWN'))
    print(f"{out / 'long.mp4'}  {total:.1f} s  {os.path.getsize(out / 'long.mp4') / 1e6:.1f} MB")
    print((out / 'chapters.txt').read_text())

if __name__ == '__main__':
    main()
