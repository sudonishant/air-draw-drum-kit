import React, { useState, useEffect, useRef } from 'react';
import { CertificateData, Stroke } from '../types';
import { CertificateService } from '../services/certificateService';
import { SCHOOL_LIST } from '../data/prompts';
import { Award, Download, Printer, X, Sparkles } from 'lucide-react';

interface CertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  strokes: Stroke[];
  score: number;
  accuracy: number;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({
  isOpen,
  onClose,
  strokes,
  score,
  accuracy
}) => {
  const [studentName, setStudentName] = useState<string>('');
  const [selectedSchool, setSelectedSchool] = useState<string>(SCHOOL_LIST[0]);
  const [signatureUrl, setSignatureUrl] = useState<string>('');
  const canvasPreviewRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const offCanvas = document.createElement('canvas');
    offCanvas.width = 400;
    offCanvas.height = 200;
    const ctx = offCanvas.getContext('2d');
    if (ctx && strokes.length > 0) {
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      const allPoints = strokes.flatMap(s => s.points);
      if (allPoints.length > 2) {
        let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
        allPoints.forEach(p => {
          if (p.x < minX) minX = p.x;
          if (p.x > maxX) maxX = p.x;
          if (p.y < minY) minY = p.y;
          if (p.y > maxY) maxY = p.y;
        });

        const width = Math.max(20, maxX - minX);
        const height = Math.max(20, maxY - minY);
        const scale = Math.min(360 / width, 160 / height);
        const offsetX = 20 - minX * scale;
        const offsetY = 20 - minY * scale;

        strokes.forEach(stroke => {
          if (stroke.points.length < 2) return;
          ctx.beginPath();
          ctx.moveTo(stroke.points[0].x * scale + offsetX, stroke.points[0].y * scale + offsetY);
          for (let i = 1; i < stroke.points.length; i++) {
            ctx.lineTo(stroke.points[i].x * scale + offsetX, stroke.points[i].y * scale + offsetY);
          }
          ctx.stroke();
        });
        setSignatureUrl(offCanvas.toDataURL('image/png'));
      }
    }
  }, [isOpen, strokes]);

  useEffect(() => {
    if (!isOpen) return;

    const certData: CertificateData = {
      studentName: studentName || 'Young Innovator',
      schoolName: selectedSchool,
      title: 'Best Air Artist',
      date: new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }),
      score: Math.max(score, 100),
      accuracy: Math.max(accuracy, 85),
      signatureImage: signatureUrl
    };

    const rendered = CertificateService.generateCertificateCanvas(certData);
    const previewCanvas = canvasPreviewRef.current;
    if (previewCanvas) {
      const pCtx = previewCanvas.getContext('2d');
      if (pCtx) {
        previewCanvas.width = 800;
        previewCanvas.height = (800 * 850) / 1200;
        pCtx.drawImage(rendered, 0, 0, previewCanvas.width, previewCanvas.height);
      }
    }
  }, [isOpen, studentName, selectedSchool, signatureUrl, score, accuracy]);

  if (!isOpen) return null;

  const handleDownload = () => {
    const certData: CertificateData = {
      studentName: studentName || 'Student',
      schoolName: selectedSchool,
      title: 'Best Air Artist',
      date: new Date().toLocaleDateString('en-US'),
      score: Math.max(score, 100),
      accuracy: Math.max(accuracy, 85),
      signatureImage: signatureUrl
    };
    CertificateService.downloadCertificate(certData);
  };

  const handlePrint = () => {
    const certData: CertificateData = {
      studentName: studentName || 'Student',
      schoolName: selectedSchool,
      title: 'Best Air Artist',
      date: new Date().toLocaleDateString('en-US'),
      score: Math.max(score, 100),
      accuracy: Math.max(accuracy, 85),
      signatureImage: signatureUrl
    };
    const canvas = CertificateService.generateCertificateCanvas(certData);
    const win = window.open('', '_blank');
    if (win) {
      win.document.write(`
        <html>
          <head><title>PM Shri School Certificate</title></head>
          <body style="margin:0;display:flex;justify-content:center;align-items:center;background:#000;">
            <img src="${canvas.toDataURL()}" style="max-width:100%;height:auto;" onload="window.print();" />
          </body>
        </html>
      `);
      win.document.close();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative max-w-4xl w-full bg-slate-900 border border-amber-500/40 rounded-3xl p-6 shadow-2xl overflow-y-auto max-h-[95vh]">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white">
              Digital Air Artist Certificate
            </h2>
            <p className="text-xs text-slate-400">
              Personalized with student name, school, score, and real air signature
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              Student Name:
            </label>
            <input
              type="text"
              placeholder="e.g. Alex Sharma / Priya Verma"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              Select School:
            </label>
            <select
              value={selectedSchool}
              onChange={(e) => setSelectedSchool(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white focus:outline-none focus:border-cyan-400"
            >
              {SCHOOL_LIST.map((sch) => (
                <option key={sch} value={sch}>
                  {sch}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mb-6 rounded-2xl overflow-hidden border border-slate-700 shadow-xl bg-slate-950 flex justify-center">
          <canvas ref={canvasPreviewRef} className="max-w-full h-auto" />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800">
          <div className="flex items-center gap-2 text-xs text-amber-400">
            <Sparkles className="w-4 h-4" />
            <span>Air signature drawn on camera is embedded directly on the certificate!</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition border border-slate-700"
            >
              <Printer className="w-4 h-4" />
              <span>Print</span>
            </button>

            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 text-xs font-black shadow-lg shadow-amber-500/20 transition transform active:scale-95"
            >
              <Download className="w-4 h-4" />
              <span>Download PNG Certificate</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
