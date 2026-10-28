"""Mean colour of a frame region on both halves of a board (journal v2 check, reprise 17 Oct.)
  python3 sample.py <board> x0 y0 x1 y1 [mask=circle]"""
import sys
from PIL import Image, ImageDraw, ImageStat
b = Image.open(sys.argv[1]).convert('RGB'); x0, y0, x1, y1 = map(float, sys.argv[2:6])
W = (b.width - 20) // 2
circle = len(sys.argv) > 6 and sys.argv[6] == 'circle'
def mean(ox):
    box = (int(ox + x0), int(30 + y0), int(ox + x1), int(30 + y1))
    im = b.crop(box)
    m = None
    if circle:
        m = Image.new('L', im.size, 0); ImageDraw.Draw(m).ellipse((0, 0, im.width - 1, im.height - 1), fill=255)
    return [round(v, 1) for v in ImageStat.Stat(im, m).mean]
print('site', mean(0), 'figma', mean(W + 20))
