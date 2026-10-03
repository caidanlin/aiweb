# -*- coding: utf-8 -*-
"""生成网站所需的全部图片，输出到 assets/。

素材来源与用途：
  自拍.jpg                         -> 首页「我的自拍」
  20230427001146_25119.jpg         -> 白底全身雷姆（结尾竖图）
  20230327094151_f51f9.jpg         -> 雷姆特写（备用）
  微信图片_20260815033854_1_36.jpg -> 泳池雷姆（首页主视觉 / 全站氛围背景）
  5d0f3438...png / d89b7993...png  -> 表情包合集截图，按精确坐标裁成一张张 Q 版贴纸

Q 版贴纸坐标是在 tools/canvas-*.png（带 100px 网格的画布放大图）上人工核对后确定的。
"""
import os
from PIL import Image

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(BASE, "assets")
os.makedirs(OUT, exist_ok=True)

IMG1 = "5d0f3438e28442fd426bc67f3aff48c9.png"
IMG2 = "d89b79934fd5d7114b69c8d33c4e0261.png"

# (输出名, 截图坐标框) —— 坐标已在网格图上逐张核对
# 左边界不小于 576/572：再往左就是浏览器界面的灰蓝色背景，会带出一条灰边
Q1 = [
    ("rem-q-wink.png",    (620, 150, 860, 400)),    # 眨眼吐舌 · 猫耳
    ("rem-q-calm.png",    (862, 150, 1010, 400)),   # 平静特写 · 猫耳
    ("rem-q-cat.png",     (1018, 150, 1265, 430)),  # 大眼睛 · 猫耳
    ("rem-q-sleep.png",   (622, 490, 858, 715)),    # 闭眼低头
    ("rem-q-big.png",     (816, 445, 1160, 810)),   # 张嘴大哭 · 大只
    ("rem-q-catwave.png", (1018, 430, 1270, 645)),  # 双手张开 · 猫耳
    ("rem-q-glow.png",    (620, 705, 860, 955)),    # 亮眼张嘴
    ("rem-q-tiny.png",    (1118, 700, 1262, 915)),  # 小只闭眼
]
Q2 = [
    ("rem-q-shy.png",     (574, 30, 770, 500)),     # 捧脸害羞 · 猫耳
    ("rem-q-pawpad.png",  (860, 45, 1040, 240)),    # 猫爪爪印（装饰用）
    ("rem-q-cat2.png",    (1050, 60, 1205, 400)),   # 微笑 · 猫耳
    ("rem-q-stare.png",   (800, 300, 1075, 700)),   # 正面盯 · 猫耳
    ("rem-q-happy.png",   (574, 555, 775, 1035)),   # 闭眼开心张嘴 · 猫耳
    ("rem-q-lie.png",     (830, 700, 1205, 1000)),  # 趴着闭眼 · 猫耳
    ("rem-q-side.png",    (1200, 520, 1360, 1010)), # 右侧半边（半身）
]


def p(n):
    return os.path.join(BASE, n)


def square(img, size, ax=0.5, ay=0.35):
    w, h = img.size
    s = min(w, h)
    left, top = int((w - s) * ax), int((h - s) * ay)
    return img.crop((left, top, left + s, top + s)).resize((size, size), Image.LANCZOS)


def save(img, name):
    dst = os.path.join(OUT, name)
    img.save(dst)
    print(f"  {name:22s} {img.size[0]:>4}x{img.size[1]:<5} {os.path.getsize(dst)//1024:>5} KB")


print("[1/5] 全身雷姆立绘")
full = Image.open(p("20230427001146_25119.jpg")).convert("RGB")
w, h = full.size
save(full.crop((int(w * 0.05), int(h * 0.01), int(w * 0.95), int(h * 0.98))), "rem-full.png")

print("[2/5] 雷姆特写")
face = Image.open(p("20230327094151_f51f9.jpg")).convert("RGB")
save(face.crop((0, 0, int(face.size[0] * 0.58), face.size[1])), "rem-face.jpg")

print("[3/5] 泳池雷姆")
pool = Image.open(p("微信图片_20260815033854_1_36.jpg")).convert("RGB")
pw, ph = pool.size
save(pool.crop((int(pw * 0.26), 0, int(pw * 0.60), ph)), "rem-pool.jpg")     # 首页主视觉：雷姆居中
save(pool.crop((int(pw * 0.04), 0, int(pw * 0.99), ph)).resize((1600, 900), Image.LANCZOS),
     "pool-wide.jpg")                                                          # 全站氛围背景

print("[4/5] 我的自拍")
selfie = Image.open(p("自拍.jpg")).convert("RGB")
sw, sh = selfie.size
save(square(selfie, 760, 0.5, 0.28), "selfie-square.jpg")
save(selfie.resize((760, int(760 * sh / sw)), Image.LANCZOS), "selfie-portrait.jpg")

print("[5/5] Q 版雷姆贴纸")
for src, items in ((IMG1, Q1), (IMG2, Q2)):
    im = Image.open(p(src)).convert("RGB")
    for name, box in items:
        save(im.crop(box), name)

print("\n完成 ->", OUT)
