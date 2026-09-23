"use client";

import { Button } from "./ui/Button";
import { Modal } from "./ui/Modal";
import { Download, Share2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export interface ShareData {
  title: string; // например «Неделя 3»
  subtitle: string; // «Точка А 60 кг → точка Б 55 кг»
  big: string; // «−1,8 кг»
  bigLabel: string;
  rows: { label: string; value: string }[];
  level: string;
  progressPct: number;
  brand?: string;
  footer?: string;
}

function draw(canvas: HTMLCanvasElement, d: ShareData) {
  const W = 1080;
  const H = 1350;
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;
  const g = ctx.createLinearGradient(0, 0, W, H);
  g.addColorStop(0, "#0b0d14");
  g.addColorStop(1, "#1a1210");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  // акцентное пятно
  const r = ctx.createRadialGradient(W * 0.8, H * 0.15, 20, W * 0.8, H * 0.15, 520);
  r.addColorStop(0, "rgba(255,149,56,0.35)");
  r.addColorStop(1, "rgba(255,149,56,0)");
  ctx.fillStyle = r;
  ctx.fillRect(0, 0, W, H);

  const font = (px: number, weight = 600) => `${weight} ${px}px -apple-system, Inter, system-ui, sans-serif`;
  ctx.fillStyle = "#ff9538";
  ctx.font = font(30, 700);
  ctx.fillText(d.brand ?? "ТОЧКА Б", 80, 120);
  ctx.fillStyle = "#8a93a6";
  ctx.font = font(34, 500);
  ctx.fillText(d.title, 80, 190);
  ctx.fillStyle = "#e8ecf4";
  ctx.font = font(44, 600);
  ctx.fillText(d.subtitle, 80, 250);

  ctx.fillStyle = "#22d399";
  ctx.font = font(190, 700);
  ctx.fillText(d.big, 80, 480);
  ctx.fillStyle = "#8a93a6";
  ctx.font = font(34, 500);
  ctx.fillText(d.bigLabel, 80, 540);

  // прогресс-бар
  const bx = 80, by = 610, bw = W - 160, bh = 22;
  ctx.fillStyle = "#1f2532";
  roundRect(ctx, bx, by, bw, bh, 11);
  ctx.fill();
  const pg = ctx.createLinearGradient(bx, 0, bx + bw, 0);
  pg.addColorStop(0, "#ff9538");
  pg.addColorStop(1, "#22d399");
  ctx.fillStyle = pg;
  roundRect(ctx, bx, by, Math.max(22, (bw * Math.min(100, d.progressPct)) / 100), bh, 11);
  ctx.fill();
  ctx.fillStyle = "#8a93a6";
  ctx.font = font(30, 500);
  ctx.fillText(`${Math.round(d.progressPct)}% пути`, bx, by + 70);

  // строки
  let y = 780;
  for (const row of d.rows) {
    ctx.fillStyle = "#1f2532";
    ctx.fillRect(80, y - 58, W - 160, 1);
    ctx.fillStyle = "#a3adbd";
    ctx.font = font(36, 500);
    ctx.fillText(row.label, 80, y);
    ctx.fillStyle = "#e8ecf4";
    ctx.font = font(40, 700);
    ctx.textAlign = "right";
    ctx.fillText(row.value, W - 80, y);
    ctx.textAlign = "left";
    y += 96;
  }

  ctx.fillStyle = "#ff9538";
  ctx.font = font(38, 700);
  ctx.fillText(d.level, 80, H - 150);
  ctx.fillStyle = "#5b6577";
  ctx.font = font(28, 500);
  ctx.fillText(d.footer ?? "Точка Б · план, дневник, результат", 80, H - 80);
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

export function ShareCardButton({ data, fileName = "tochka-b.png" }: { data: ShareData; fileName?: string }) {
  const [open, setOpen] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    const c = canvasRef.current ?? document.createElement("canvas");
    draw(c, data);
    setUrl(c.toDataURL("image/png"));
  }, [open, data]);

  function download() {
    if (!url) return;
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    a.click();
  }
  async function share() {
    if (!url) return;
    try {
      const blob = await (await fetch(url)).blob();
      const file = new File([blob], fileName, { type: "image/png" });
      const nav = navigator as Navigator & { canShare?: (d: ShareData | { files: File[] }) => boolean };
      if (nav.share && nav.canShare?.({ files: [file] })) {
        await nav.share({ files: [file], title: "Точка Б" } as ShareData & { files: File[] });
        return;
      }
    } catch {}
    download();
  }

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}><Share2 className="h-3.5 w-3.5" /> Карточка для сторис</Button>
      <Modal open={open} onClose={() => setOpen(false)} title="Карточка для сторис" description="Скачай или поделись прямо в Instagram / Telegram" size="sm"
        footer={<><Button variant="ghost" size="sm" onClick={() => setOpen(false)}>Закрыть</Button><Button variant="outline" size="sm" onClick={download}><Download className="h-3.5 w-3.5" /> Скачать</Button><Button variant="primary" size="sm" onClick={share}><Share2 className="h-3.5 w-3.5" /> Поделиться</Button></>}
      >
        <canvas ref={canvasRef} className="hidden" />
        {url && <img src={url} alt="Карточка" className="w-full rounded-xl border border-border" />}
      </Modal>
    </>
  );
}
