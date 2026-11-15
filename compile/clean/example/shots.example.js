import * as THREE from 'three';
import { ctx, W, H, clamp, lerp, seg, eio } from './core/lib.js';
import { camera } from './core/engine.js';
import * as W2 from './core/world2.js';
import { Toon } from './core/toon.js';
import * as X from './core/fx2.js';
const V3 = (x, y, z) => new THREE.Vector3(x, y, z), mix = (a, b, k) => a.clone().lerp(b, k);
const P = (look) => new Toon(look);
const SK = ['#F6D9B5', '#EBC49A', '#D9A877'];
export function buildShots(E) {
  const S = [], cam = camera(36);
  const shoot = (scene, ppl, from, to, at, k, fov = 36) => { if (cam.fov !== fov) { cam.fov = fov; cam.updateProjectionMatrix(); } cam.position.copy(mix(from, to, k)); cam.lookAt(at); ppl.forEach((p) => p.face(cam)); E.render(scene, cam, { bloom: 0.15, bloomThreshold: 0.9 }); };
  // courtroom
  const C = W2.room2(E, { wall: '#3F7F6E', posters: [['EARLY RELEASE', 'back', 2.6]] });
  const bench = new THREE.Mesh(new THREE.BoxGeometry(3.4, 1.3, 0.9), new THREE.MeshStandardMaterial({ color: '#6B4429', roughness: 0.6 })); bench.position.set(1.6, 0.65, -5.2); bench.castShadow = bench.receiveShadow = true; C.add(bench);
  const judge = P({ body: '#2A2A33', head: SK[0], hair: 'bald', extra: ['glasses'] }); judge.at(1.6, 0.4, -5.8); C.add(judge.group);
  const pris = P({ body: '#F4F1EA', pattern: 'hstripes', patCol: '#2A2A33', head: SK[1], hair: 'swoop', extra: ['stubble'] }); pris.at(-0.6, 0, -3.2); C.add(pris.group);
  const guard = P({ body: '#3C4A6B', head: SK[2], hat: 'mailcap', hatCol: '#2A3048' }); guard.at(-2.4, 0, -4.8); C.add(guard.group);
  S.push({ id: 'C1', at: 0, draw(lt, d, t, blit) { const k = eio(clamp(lt / d)); judge.set({ mood: 'neutral', armR: [70, 30] }); pris.set({ mood: 'sad', tears: 1, armL: [80, 40], armR: [80, 40] }); guard.set({ mood: 'neutral' });
    shoot(C.scene, [judge, pris, guard], V3(-2.4, 1.5, 0.8), V3(-2.0, 1.5, 0.3), V3(0.3, 1.6, -4.6), k, 46); blit(); } });
  // street, day
  const ST = W2.townStreet(E, { flagAt: [3.2, -12] }); const man = P({ body: '#7A5236', head: SK[0], hat: 'bowler', hatCol: '#2A2220', extra: ['mustache'] }); man.at(-2.0, 0, -5); ST.scene.add(man.group);
  S.push({ id: 'ST', at: 2, dissolve: 0.4, draw(lt, d, t, blit) { const k = eio(clamp(lt / d)); ST.wave(t); man.set({ mood: 'happy', legs: 'walk', phase: t * 6 });
    shoot(ST.scene, [man], V3(-0.4, 1.4, 1.6), V3(-0.7, 1.45, 0.6), V3(-2.4, 4.6, -14), k, 46); blit(); } });
  // street, night, overhead
  const SN = W2.townStreet(E, { night: true }); const thief = P({ body: '#3A3F55', head: SK[1], hat: 'beanie', hatCol: '#2A3048' }); thief.at(-5.0, 0.18, -12.6); SN.scene.add(thief.group);
  S.push({ id: 'SN', at: 4, draw(lt, d, t, blit) { const k = eio(clamp(lt / d)); thief.set({ mood: 'sly' }); shoot(SN.scene, [thief], V3(2.5, 11, 0), V3(2.2, 10, -2), V3(-3, 1, -12), k, 44); blit(); } });
  // close-up smug + chalk marks
  const CU = W2.room2(E, { wall: '#7A7486', wains: '#5A5466', windows: [], posters: [], clockAt: null, lamps: false });
  const smug = P({ body: '#F4F1EA', pattern: 'hstripes', patCol: '#2A2A33', head: SK[1], hair: 'swoop', extra: ['stubble'] }); smug.at(-0.8, 0, -6.5); CU.add(smug.group);
  S.push({ id: 'CU', at: 6, draw(lt, d, t, blit) { const k = eio(clamp(lt / d)); smug.set({ mood: 'sly', look: [0.3, 0] });
    shoot(CU.scene, [smug], V3(-0.85, 1.55, -4.1), V3(-0.85, 1.55, -4.4), V3(-0.8, 1.55, -6.5), k, 42); blit();
    X.chalk('VAULT', 800, 360, seg(lt, 0.2, 0.6), { size: 120 }); X.arrow(800, 620, 800, 450, seg(lt, 0.5, 0.9)); X.chalk('10 FT', 800, 720, seg(lt, 0.8, 1.2), { size: 110 }); } });
  // overlay graphics: calendar + tape
  S.push({ id: 'OV', at: 8, draw(lt, d, t, blit) { const k = eio(clamp(lt / d)); smug.set({ mood: 'worried' }); shoot(CU.scene, [smug], V3(0.6, 1.4, -3.4), V3(0.4, 1.4, -3.8), V3(-0.6, 1.3, -6.5), k, 44); blit();
    X.calendar(540, 700, 'JUNE', Math.floor(seg(lt, 0.2, 1.6) * 14), seg(lt, 0, 0.4)); X.tape(240, 1000, 700, '3 FT', seg(lt, 0.6, 1.4)); } });
  return { shots: S, cues: [] };
}
