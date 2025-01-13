// Add new export formats to export.ts
export interface ExportOptions {
  format: 'docx' | 'txt' | 'json' | 'srt' | 'vtt' | 'pdf' | 'html' | 'csv';
  includeMetadata?: boolean;
  includeSpeakers?: boolean;
  includeTimestamps?: boolean;
  customHeader?: string;
  customFooter?: string;
  styleOptions?: {
    fontSize?: number;
    fontFamily?: string;
    lineSpacing?: number;
    pageSize?: 'A4' | 'Letter';
    margins?: {
      top: number;
      bottom: number;
      left: number;
      right: number;
    };
  };
}

// Add new export functions
export async function exportToPDF(result: TranscriptionResult, options: ExportOptions) {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF({
    format: options.styleOptions?.pageSize || 'Letter'
  });

  const margins = options.styleOptions?.margins || {
    top: 20,
    bottom: 20,
    left: 20,
    right: 20
  };

  let y = margins.top;

  // Add header
  if (options.customHeader) {
    doc.setFontSize(16);
    doc.text(options.customHeader, margins.left, y);
    y += 10;
  }

  // Add metadata
  if (options.includeMetadata) {
    doc.setFontSize(12);
    doc.text(`Duration: ${result.metadata?.duration.toFixed(2)}s`, margins.left, y);
    y += 6;
    doc.text(`Confidence: ${(result.confidence * 100).toFixed(1)}%`, margins.left, y);
    y += 10;
  }

  // Add transcript
  doc.setFontSize(12);
  let currentSpeaker = '';
  
  result.words.forEach(word => {
    if (options.includeSpeakers && word.speaker !== undefined && word.speaker.toString() !== currentSpeaker) {
      currentSpeaker = word.speaker.toString();
      if (y > doc.internal.pageSize.height - margins.bottom) {
        doc.addPage();
        y = margins.top;
      }
      y += 6;
      doc.setFont(undefined, 'bold');
      doc.text(`Speaker ${currentSpeaker}:`, margins.left, y);
      doc.setFont(undefined, 'normal');
      y += 6;
    }

    const timestamp = options.includeTimestamps 
      ? `[${formatTimestamp(word.start)}] `
      : '';

    const text = timestamp + (word.punctuated_word || word.word) + ' ';
    const textWidth = doc.getTextWidth(text);

    if (textWidth > doc.internal.pageSize.width - margins.left - margins.right) {
      y += 6;
      if (y > doc.internal.pageSize.height - margins.bottom) {
        doc.addPage();
        y = margins.top;
      }
    }

    doc.text(text, margins.left, y);
    y += 6;
  });

  // Add footer
  if (options.customFooter) {
    doc.setFontSize(10);
    doc.text(
      options.customFooter,
      doc.internal.pageSize.width / 2,
      doc.internal.pageSize.height - margins.bottom,
      { align: 'center' }
    );
  }

  const blob = doc.output('blob');
  saveAs(blob, 'transcript.pdf');
}

export function exportToHTML(result: TranscriptionResult, options: ExportOptions) {
  let html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Transcript</title>
  <style>
    body {
      font-family: ${options.styleOptions?.fontFamily || 'Arial, sans-serif'};
      line-height: ${options.styleOptions?.lineSpacing || 1.5};
      max-width: 800px;
      margin: 2rem auto;
      padding: 0 1rem;
    }
    .speaker { font-weight: bold; margin-top: 1em; }
    .timestamp { color: #666; font-size: 0.9em; }
    .word { margin-right: 0.25em; }
    .low-confidence { background-color: #fff3cd; }
    .metadata { color: #666; margin-bottom: 2rem; }
  </style>
</head>
<body>`;

  if (options.customHeader) {
    html += `<h1>${options.customHeader}</h1>`;
  }

  if (options.includeMetadata) {
    html += `
<div class="metadata">
  <p>Duration: ${result.metadata?.duration.toFixed(2)}s</p>
  <p>Confidence: ${(result.confidence * 100).toFixed(1)}%</p>
</div>`;
  }

  let currentSpeaker = '';
  result.words.forEach(word => {
    if (options.includeSpeakers && word.speaker !== undefined && word.speaker.toString() !== currentSpeaker) {
      currentSpeaker = word.speaker.toString();
      html += `<div class="speaker">Speaker ${currentSpeaker}:</div>`;
    }

    const timestamp = options.includeTimestamps 
      ? `<span class="timestamp">[${formatTimestamp(word.start)}]</span> `
      : '';

    html += `<span class="word${word.confidence < 0.85 ? ' low-confidence' : ''}" title="Confidence: ${
      Math.round(word.confidence * 100)
    }%">${timestamp}${word.punctuated_word || word.word}</span>`;
  });

  if (options.customFooter) {
    html += `<footer style="margin-top: 2rem; text-align: center;">${options.customFooter}</footer>`;
  }

  html += `</body></html>`;

  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  saveAs(blob, 'transcript.html');
}

export function exportToCSV(result: TranscriptionResult, options: ExportOptions) {
  let csv = 'Start Time,End Time,Speaker,Text,Confidence\n';

  result.words.forEach(word => {
    const row = [
      formatTimestamp(word.start),
      formatTimestamp(word.end),
      options.includeSpeakers ? `Speaker ${word.speaker || 1}` : '',
      `"${word.punctuated_word || word.word}"`,
      word.confidence.toFixed(3)
    ];
    csv += row.join(',') + '\n';
  });

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  saveAs(blob, 'transcript.csv');
}