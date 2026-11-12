/* Opt-in labels for drawn vectors. Values and graph axes use ordinary text. */
window.PraxisVectorLabel = function (ctx, text, x, y) {
  const metrics = ctx.measureText(text);
  const alignedLeft = x - (ctx.textAlign === 'center' ? metrics.width / 2 :
    ['right', 'end'].includes(ctx.textAlign) ? metrics.width : 0);
  const width = Math.max(7, ctx.measureText(text[0]).width);
  const top = y - metrics.actualBoundingBoxAscent - 3;
  const right = alignedLeft + width;
  ctx.fillText(text, x, y);
  ctx.save();
  ctx.strokeStyle = ctx.fillStyle;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(alignedLeft, top);
  ctx.lineTo(right, top);
  ctx.moveTo(right - 2.5, top - 2);
  ctx.lineTo(right, top);
  ctx.lineTo(right - 2.5, top + 2);
  ctx.stroke();
  ctx.restore();
};
