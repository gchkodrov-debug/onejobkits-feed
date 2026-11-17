/* OneJobKits Free Converter Hub — everything runs client-side.
   Files are processed in the visitor's browser only. Nothing is uploaded. */
(function () {
  'use strict';

  if (window.pdfjsLib) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'assets/pdf.worker.min.js';
  }

  /* ---------- helpers ---------- */
  function baseName(name) {
    var i = name.lastIndexOf('.');
    return i > 0 ? name.slice(0, i) : name;
  }
  function fmtBytes(n) {
    if (n < 1024) return n + ' B';
    if (n < 1024 * 1024) return (n / 1024).toFixed(1) + ' KB';
    return (n / (1024 * 1024)).toFixed(2) + ' MB';
  }
  function downloadBlob(blob, filename) {
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(function () {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 4000);
  }
  function canvasBlob(canvas, type, quality) {
    return new Promise(function (resolve, reject) {
      canvas.toBlob(function (b) {
        if (b) resolve(b); else reject(new Error('The browser could not create the output file.'));
      }, type, quality);
    });
  }
  function decodeImage(file) {
    if (window.createImageBitmap) {
      return createImageBitmap(file).catch(function () { return decodeImageFallback(file); });
    }
    return decodeImageFallback(file);
  }
  function decodeImageFallback(file) {
    return new Promise(function (resolve, reject) {
      var url = URL.createObjectURL(file);
      var img = new Image();
      img.onload = function () { resolve(img); };
      img.onerror = function () { URL.revokeObjectURL(url); reject(new Error('That image could not be read.')); };
      img.src = url;
    });
  }
  function drawImage(img, maxDim, bg) {
    var w = img.width, h = img.height;
    var scale = 1;
    if (maxDim && maxDim > 0) {
      var m = Math.max(w, h);
      if (m > maxDim) scale = maxDim / m;
    }
    var cw = Math.max(1, Math.round(w * scale));
    var ch = Math.max(1, Math.round(h * scale));
    var canvas = document.createElement('canvas');
    canvas.width = cw; canvas.height = ch;
    var ctx = canvas.getContext('2d');
    if (bg) { ctx.fillStyle = bg; ctx.fillRect(0, 0, cw, ch); }
    ctx.drawImage(img, 0, 0, cw, ch);
    return canvas;
  }
  function readArrayBuffer(file) {
    return file.arrayBuffer();
  }

  /* ---------- card framework ---------- */
  function wireCard(id, opts) {
    var card = document.getElementById(id);
    if (!card) return null;
    var input = card.querySelector('.file');
    var btn = card.querySelector('.go');
    var out = card.querySelector('.out');
    var label = card.querySelector('.drop span');
    var defaultLabel = label.textContent;

    input.addEventListener('change', function () {
      var files = Array.prototype.slice.call(input.files || []);
      if (!files.length) { label.textContent = defaultLabel; return; }
      label.textContent = defaultLabel;
      var names = document.createElement('span');
      names.className = 'fname';
      names.textContent = files.map(function (f) { return f.name; }).join(', ');
      label.appendChild(names);
      out.innerHTML = '';
      if (opts.onFiles) {
        Promise.resolve(opts.onFiles(card, files)).catch(function (e) {
          showError(out, e);
        });
      }
    });

    btn.addEventListener('click', function () {
      var files = Array.prototype.slice.call(input.files || []);
      if (!files.length) { showError(out, new Error('Choose a file first.')); return; }
      btn.disabled = true;
      out.innerHTML = 'Working…';
      Promise.resolve()
        .then(function () { return opts.convert(card, files); })
        .then(function (result) {
          var items = result.items || [];
          out.innerHTML = '';
          var done = document.createElement('span');
          done.textContent = 'Done — your download' + (items.length > 1 ? 's' : '') + ' should start automatically:';
          out.appendChild(done);
          out.appendChild(document.createElement('br'));
          items.forEach(function (item, idx) {
            setTimeout(function () { downloadBlob(item.blob, item.name); }, idx * 450);
            var a = document.createElement('a');
            a.className = 'dl';
            a.textContent = '⬇ ' + item.name;
            a.href = URL.createObjectURL(item.blob);
            a.download = item.name;
            out.appendChild(a);
          });
          if (result.note) {
            var meta = document.createElement('span');
            meta.className = 'meta';
            meta.textContent = result.note;
            out.appendChild(meta);
          }
        })
        .catch(function (e) { showError(out, e); })
        .finally(function () { btn.disabled = false; });
    });
    return card;
  }
  function showError(out, e) {
    out.innerHTML = '';
    var s = document.createElement('span');
    s.className = 'err';
    s.textContent = 'Sorry — ' + (e && e.message ? e.message : 'something went wrong with that file.');
    out.appendChild(s);
  }
  function optVal(card, cls) {
    var el = card.querySelector(cls);
    return el ? el.value : '';
  }

  /* ---------- Family A: everyday converters ---------- */

  wireCard('tool-jpg-to-png', {
    convert: function (card, files) {
      return decodeImage(files[0]).then(function (img) {
        var canvas = drawImage(img, 0, null);
        return canvasBlob(canvas, 'image/png').then(function (blob) {
          return { items: [{ blob: blob, name: baseName(files[0].name) + '.png' }] };
        });
      });
    }
  });

  wireCard('tool-png-to-jpg', {
    convert: function (card, files) {
      return decodeImage(files[0]).then(function (img) {
        var canvas = drawImage(img, 0, '#ffffff');
        return canvasBlob(canvas, 'image/jpeg', 0.92).then(function (blob) {
          return { items: [{ blob: blob, name: baseName(files[0].name) + '.jpg' }],
                   note: 'Transparent areas were placed on white — JPG does not support transparency.' };
        });
      });
    }
  });

  wireCard('tool-webp-convert', {
    convert: function (card, files) {
      var fmt = optVal(card, '.opt-format');
      return decodeImage(files[0]).then(function (img) {
        var canvas = drawImage(img, 0, fmt === 'jpg' ? '#ffffff' : null);
        var type = fmt === 'jpg' ? 'image/jpeg' : 'image/png';
        return canvasBlob(canvas, type, 0.92).then(function (blob) {
          return { items: [{ blob: blob, name: baseName(files[0].name) + '.' + fmt }] };
        });
      });
    }
  });

  wireCard('tool-images-to-pdf', {
    convert: function (card, files) {
      var PDFLib = window.PDFLib;
      return PDFLib.PDFDocument.create().then(function (doc) {
        var chain = Promise.resolve();
        files.forEach(function (file) {
          chain = chain.then(function () {
            var type = (file.type || '').toLowerCase();
            var name = file.name.toLowerCase();
            if (type === 'image/jpeg' || /\.jpe?g$/.test(name)) {
              return readArrayBuffer(file).then(function (buf) { return doc.embedJpg(buf); });
            }
            if (type === 'image/png' || /\.png$/.test(name)) {
              return readArrayBuffer(file).then(function (buf) { return doc.embedPng(buf); });
            }
            return decodeImage(file).then(function (img) {
              var canvas = drawImage(img, 0, null);
              return canvasBlob(canvas, 'image/png').then(function (blob) {
                return blob.arrayBuffer().then(function (buf) { return doc.embedPng(buf); });
              });
            });
          }).then(function (embedded) {
            var w = embedded.width, h = embedded.height;
            var maxPt = 12000;
            var s = Math.min(1, maxPt / Math.max(w, h));
            var page = doc.addPage([w * s, h * s]);
            page.drawImage(embedded, { x: 0, y: 0, width: w * s, height: h * s });
          });
        });
        return chain.then(function () { return doc.save(); }).then(function (bytes) {
          var blob = new Blob([bytes], { type: 'application/pdf' });
          var name = files.length === 1 ? baseName(files[0].name) + '.pdf' : 'images-combined.pdf';
          return { items: [{ blob: blob, name: name }],
                   note: files.length + ' image' + (files.length > 1 ? 's' : '') + ', one per page.' };
        });
      });
    }
  });

  wireCard('tool-pdf-to-images', {
    convert: function (card, files) {
      var fmt = optVal(card, '.opt-format');
      var type = fmt === 'jpg' ? 'image/jpeg' : 'image/png';
      return readArrayBuffer(files[0]).then(function (buf) {
        return pdfjsLib.getDocument({ data: buf }).promise;
      }).then(function (pdf) {
        var items = [];
        var chain = Promise.resolve();
        var n = pdf.numPages;
        var base = baseName(files[0].name);
        for (var i = 1; i <= n; i++) {
          (function (pageNum) {
            chain = chain.then(function () {
              return pdf.getPage(pageNum).then(function (page) {
                var viewport = page.getViewport({ scale: 2 });
                var canvas = document.createElement('canvas');
                canvas.width = Math.round(viewport.width);
                canvas.height = Math.round(viewport.height);
                var ctx = canvas.getContext('2d');
                if (fmt === 'jpg') { ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, canvas.width, canvas.height); }
                return page.render({ canvasContext: ctx, viewport: viewport }).promise.then(function () {
                  return canvasBlob(canvas, type, 0.92);
                }).then(function (blob) {
                  items.push({ blob: blob, name: base + '-page-' + pageNum + '.' + fmt });
                });
              });
            });
          })(i);
        }
        return chain.then(function () {
          return { items: items, note: n + ' page' + (n > 1 ? 's' : '') + ' converted at 2× size.' };
        });
      });
    }
  });

  wireCard('tool-merge-pdf', {
    convert: function (card, files) {
      if (files.length < 2) return Promise.reject(new Error('Choose at least two PDFs to merge.'));
      var PDFLib = window.PDFLib;
      return PDFLib.PDFDocument.create().then(function (out) {
        var chain = Promise.resolve();
        var total = 0;
        files.forEach(function (file) {
          chain = chain.then(function () {
            return readArrayBuffer(file).then(function (buf) {
              return PDFLib.PDFDocument.load(buf);
            }).then(function (src) {
              total += src.getPageCount();
              return out.copyPages(src, src.getPageIndices());
            }).then(function (pages) {
              pages.forEach(function (p) { out.addPage(p); });
            });
          });
        });
        return chain.then(function () { return out.save(); }).then(function (bytes) {
          return { items: [{ blob: new Blob([bytes], { type: 'application/pdf' }), name: 'merged.pdf' }],
                   note: files.length + ' PDFs merged, ' + total + ' pages in total.' };
        });
      });
    }
  });

  wireCard('tool-split-pdf', {
    convert: function (card, files) {
      var mode = optVal(card, '.opt-mode');
      var PDFLib = window.PDFLib;
      return readArrayBuffer(files[0]).then(function (buf) {
        return PDFLib.PDFDocument.load(buf).then(function (src) {
          var count = src.getPageCount();
          var base = baseName(files[0].name);
          if (mode === 'each') {
            var chain = Promise.resolve();
            var items = [];
            for (var i = 0; i < count; i++) {
              (function (idx) {
                chain = chain.then(function () {
                  return PDFLib.PDFDocument.create().then(function (doc) {
                    return doc.copyPages(src, [idx]).then(function (pages) {
                      doc.addPage(pages[0]);
                      return doc.save();
                    });
                  }).then(function (bytes) {
                    items.push({ blob: new Blob([bytes], { type: 'application/pdf' }),
                                 name: base + '-page-' + (idx + 1) + '.pdf' });
                  });
                });
              })(i);
            }
            return chain.then(function () {
              return { items: items, note: count + ' separate one-page PDFs.' };
            });
          }
          /* range mode */
          var spec = optVal(card, '.opt-range') || '1-' + count;
          var wanted = [];
          spec.split(',').forEach(function (tok) {
            tok = tok.trim();
            if (!tok) return;
            var m = tok.match(/^(\d+)\s*-\s*(\d+)$/);
            if (m) {
              var a = parseInt(m[1], 10), b = parseInt(m[2], 10);
              for (var p = Math.min(a, b); p <= Math.max(a, b); p++) wanted.push(p);
            } else if (/^\d+$/.test(tok)) {
              wanted.push(parseInt(tok, 10));
            } else {
              throw new Error('Could not read the page range "' + tok + '". Use pages like 1-3, 5.');
            }
          });
          var seen = {}, pagesIdx = [];
          wanted.forEach(function (p) {
            if (p < 1 || p > count) throw new Error('Page ' + p + ' is outside this PDF (it has ' + count + ' pages).');
            if (!seen[p]) { seen[p] = true; pagesIdx.push(p - 1); }
          });
          if (!pagesIdx.length) throw new Error('No pages selected.');
          return PDFLib.PDFDocument.create().then(function (doc) {
            return doc.copyPages(src, pagesIdx).then(function (pages) {
              pages.forEach(function (p) { doc.addPage(p); });
              return doc.save();
            });
          }).then(function (bytes) {
            return { items: [{ blob: new Blob([bytes], { type: 'application/pdf' }),
                                name: base + '-pages-' + spec.replace(/[^0-9,-]/g, '') + '.pdf' }],
                     note: pagesIdx.length + ' page' + (pagesIdx.length > 1 ? 's' : '') + ' extracted.' };
          });
        });
      });
    }
  });

  wireCard('tool-resize-image', {
    convert: function (card, files) {
      var maxDim = parseInt(optVal(card, '.opt-maxdim'), 10) || 0;
      var quality = (parseInt(optVal(card, '.opt-quality'), 10) || 80) / 100;
      var file = files[0];
      return decodeImage(file).then(function (img) {
        var type = (file.type || '').toLowerCase();
        var outType, ext;
        if (type === 'image/png') { outType = 'image/png'; ext = 'png'; }
        else { outType = 'image/jpeg'; ext = 'jpg'; }
        var canvas = drawImage(img, maxDim, outType === 'image/jpeg' ? '#ffffff' : null);
        return canvasBlob(canvas, outType, quality).then(function (blob) {
          var note = 'Before: ' + fmtBytes(file.size) + ' (' + img.width + '×' + img.height + ') → After: ' +
                     fmtBytes(blob.size) + ' (' + canvas.width + '×' + canvas.height + ').';
          if (blob.size >= file.size) {
            note += ' The result is not smaller — the original was already well compressed, so re-saving could not shrink it further.';
          }
          return { items: [{ blob: blob, name: baseName(file.name) + '-resized.' + ext }], note: note };
        });
      });
    }
  });

  /* quality slider readout */
  var resizeCard = document.getElementById('tool-resize-image');
  if (resizeCard) {
    var q = resizeCard.querySelector('.opt-quality');
    var qv = resizeCard.querySelector('.q-val');
    q.addEventListener('input', function () { qv.textContent = q.value + '%'; });
    var modeSel = document.querySelector('#tool-split-pdf .opt-mode');
    var rangeLabel = document.querySelector('#tool-split-pdf .range-label');
    if (modeSel && rangeLabel) {
      modeSel.addEventListener('change', function () {
        rangeLabel.style.display = modeSel.value === 'range' ? '' : 'none';
      });
    }
  }

  /* ---------- Family B: office converters ---------- */

  function loadWorkbook(card, file) {
    return readArrayBuffer(file).then(function (buf) {
      var wb = XLSX.read(buf, { type: 'array' });
      card._wb = wb;
      card._fileName = file.name;
      var sel = card.querySelector('.opt-sheet');
      sel.innerHTML = '';
      wb.SheetNames.forEach(function (name) {
        var o = document.createElement('option');
        o.value = name; o.textContent = name;
        sel.appendChild(o);
      });
      return wb;
    });
  }

  wireCard('tool-xlsx-to-csv', {
    onFiles: function (card, files) { return loadWorkbook(card, files[0]); },
    convert: function (card, files) {
      var ready = card._wb ? Promise.resolve(card._wb) : loadWorkbook(card, files[0]);
      return ready.then(function (wb) {
        var sheetName = optVal(card, '.opt-sheet') || wb.SheetNames[0];
        var ws = wb.Sheets[sheetName];
        if (!ws) throw new Error('That sheet could not be read.');
        var csv = XLSX.utils.sheet_to_csv(ws, { blankrows: false });
        var blob = new Blob([csv], { type: 'text/csv' });
        return { items: [{ blob: blob, name: baseName(files[0].name) + '-' + sheetName.replace(/[^\w\- ]/g, '').trim() + '.csv' }],
                 note: 'Sheet "' + sheetName + '" converted.' };
      });
    }
  });

  wireCard('tool-csv-to-xlsx', {
    convert: function (card, files) {
      return files[0].text().then(function (text) {
        var wb = XLSX.read(text, { type: 'string' });
        var out = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        var blob = new Blob([out], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        return { items: [{ blob: blob, name: baseName(files[0].name) + '.xlsx' }] };
      });
    }
  });

  wireCard('tool-xlsx-to-pdf', {
    onFiles: function (card, files) { return loadWorkbook(card, files[0]); },
    convert: function (card, files) {
      var ready = card._wb ? Promise.resolve(card._wb) : loadWorkbook(card, files[0]);
      return ready.then(function (wb) {
        var sheetName = optVal(card, '.opt-sheet') || wb.SheetNames[0];
        var ws = wb.Sheets[sheetName];
        if (!ws) throw new Error('That sheet could not be read.');
        var rows = XLSX.utils.sheet_to_json(ws, { header: 1, raw: false, defval: '' });
        /* trim fully empty trailing rows and columns */
        while (rows.length && rows[rows.length - 1].every(function (c) { return String(c) === ''; })) rows.pop();
        var colCount = 0;
        rows.forEach(function (r) { colCount = Math.max(colCount, r.length); });
        rows.forEach(function (r) { while (r.length < colCount) r.push(''); });
        while (colCount > 0 && rows.every(function (r) { return String(r[colCount - 1]) === ''; })) colCount--;
        if (!rows.length || !colCount) throw new Error('That sheet looks empty.');
        var trimmedCols = false;
        var MAXCOLS = 14;
        if (colCount > MAXCOLS) { colCount = MAXCOLS; trimmedCols = true; }
        rows = rows.map(function (r) { return r.slice(0, colCount); });

        var PDFLib = window.PDFLib;
        return PDFLib.PDFDocument.create().then(function (doc) {
          return doc.embedFont(PDFLib.StandardFonts.Helvetica).then(function (font) {
            return doc.embedFont(PDFLib.StandardFonts.HelveticaBold).then(function (bold) {
              var pageW = 841.89, pageH = 595.28, margin = 36;
              var usableW = pageW - margin * 2;
              var fontSize = 8, rowH = 13;
              /* column weights from content length */
              var weights = [];
              for (var c = 0; c < colCount; c++) {
                var mx = 4;
                rows.forEach(function (r) { mx = Math.max(mx, Math.min(42, String(r[c]).length)); });
                weights.push(mx);
              }
              var totalW = weights.reduce(function (a, b) { return a + b; }, 0);
              var colW = weights.map(function (w) { return Math.max(28, (w / totalW) * usableW); });
              var scaleBack = usableW / colW.reduce(function (a, b) { return a + b; }, 0);
              colW = colW.map(function (w) { return w * scaleBack; });

              function fit(text, width, fnt) {
                var t = String(text);
                if (fnt.widthOfTextAtSize(t, fontSize) <= width - 5) return t;
                while (t.length && fnt.widthOfTextAtSize(t + '…', fontSize) > width - 5) t = t.slice(0, -1);
                return t + '…';
              }
              var titleH = 26;
              var rowsPerPage = Math.floor((pageH - margin * 2 - titleH) / rowH);
              var page = null, rowOnPage = 0;
              function newPage(first) {
                page = doc.addPage([pageW, pageH]);
                rowOnPage = 0;
                var title = (first ? '' : '(continued) ') + sheetName + ' — ' + (card._fileName || 'spreadsheet');
                page.drawText(fit(title, usableW, bold), { x: margin, y: pageH - margin - 4, size: 11, font: bold, color: PDFLib.rgb(0, 0.3, 0.25) });
              }
              newPage(true);
              rows.forEach(function (row, ri) {
                if (rowOnPage >= rowsPerPage) newPage(false);
                var y = pageH - margin - titleH - rowOnPage * rowH;
                var x = margin;
                var fnt = ri === 0 ? bold : font;
                row.forEach(function (cell, ci) {
                  var w = colW[ci];
                  page.drawRectangle({ x: x, y: y - rowH + 3, width: w, height: rowH,
                    borderColor: PDFLib.rgb(0.85, 0.88, 0.86), borderWidth: 0.5,
                    color: ri === 0 ? PDFLib.rgb(0.93, 0.96, 0.94) : PDFLib.rgb(1, 1, 1) });
                  var txt = fit(cell, w, fnt);
                  if (txt) page.drawText(txt, { x: x + 3, y: y - rowH + 6, size: fontSize, font: fnt, color: PDFLib.rgb(0.07, 0.07, 0.07) });
                  x += w;
                });
                rowOnPage++;
              });
              return doc.save().then(function (bytes) {
                var note = rows.length + ' rows × ' + colCount + ' columns, sheet "' + sheetName + '".';
                if (trimmedCols) note += ' The sheet is wider than 14 columns, so only the first 14 were printed.';
                return { items: [{ blob: new Blob([bytes], { type: 'application/pdf' }),
                                   name: baseName(files[0].name) + '-' + sheetName.replace(/[^\w\- ]/g, '').trim() + '.pdf' }],
                         note: note };
              });
            });
          });
        });
      });
    }
  });

  window.__hubReady = true;
})();
