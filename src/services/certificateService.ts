import { CertificateData } from '../types';

export class CertificateService {
  public static generateCertificateCanvas(data: CertificateData): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 850;
    const ctx = canvas.getContext('2d');
    if (!ctx) return canvas;

    // Background gradient - Royal Academic Dark Navy
    const bgGradient = ctx.createLinearGradient(0, 0, 1200, 850);
    bgGradient.addColorStop(0, '#0a0f24');
    bgGradient.addColorStop(0.5, '#0d1838');
    bgGradient.addColorStop(1, '#050814');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, 1200, 850);

    // Decorative Borders
    ctx.strokeStyle = '#eab308'; // Gold
    ctx.lineWidth = 10;
    ctx.strokeRect(30, 30, 1140, 790);

    ctx.strokeStyle = '#38bdf8'; // Cyan accent
    ctx.lineWidth = 2;
    ctx.strokeRect(45, 45, 1110, 760);

    // Header Badge / Logo
    ctx.fillStyle = '#eab308';
    ctx.font = 'bold 22px Outfit, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('⭐ PM SHRI SCHOOL - COLLEGE TECH ORIENTATION PROGRAM ⭐', 600, 100);

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 16px Outfit, sans-serif';
    ctx.fillText('DEPARTMENT OF COMPUTER SCIENCE & ARTIFICIAL INTELLIGENCE', 600, 130);

    // Title
    ctx.fillStyle = '#ffffff';
    ctx.font = '800 46px Baloo 2, Outfit, sans-serif';
    ctx.fillText('CERTIFICATE OF EXCELLENCE', 600, 200);

    ctx.fillStyle = '#f59e0b';
    ctx.font = '600 24px Outfit, sans-serif';
    ctx.fillText('AIR ART & ARTIFICIAL INTELLIGENCE INNOVATION', 600, 240);

    // Body text
    ctx.fillStyle = '#94a3b8';
    ctx.font = '20px Outfit, sans-serif';
    ctx.fillText('This certificate is proudly awarded to the Young Innovator', 600, 300);

    // Student Name
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 44px Baloo 2, Outfit, sans-serif';
    ctx.fillText(data.studentName || 'Young Innovator', 600, 360);

    // Line under name
    ctx.strokeStyle = '#eab308';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(350, 380);
    ctx.lineTo(850, 380);
    ctx.stroke();

    // School & Appreciation
    ctx.fillStyle = '#e2e8f0';
    ctx.font = '22px Outfit, sans-serif';
    ctx.fillText(`from ${data.schoolName || 'PM Shri School'}`, 600, 425);

    ctx.fillStyle = '#cbd5e1';
    ctx.font = '18px Outfit, sans-serif';
    ctx.fillText('for remarkable creativity and interaction in the "Air Draw & AI Recognizer"', 600, 475);
    ctx.fillText('Touchless Gesture-Based Computer Vision & AI Workshop.', 600, 505);

    // Score & Accolades Box
    ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2;
    ctx.fillRect(400, 540, 400, 75);
    ctx.strokeRect(400, 540, 400, 75);

    ctx.fillStyle = '#eab308';
    ctx.font = 'bold 20px Outfit, sans-serif';
    ctx.fillText(`AIR ARTIST SCORE: ${data.score} PTS | ACCURACY: ${data.accuracy}%`, 600, 585);

    // Bottom Signatures Section
    // 1. Faculty Coordinator
    ctx.fillStyle = '#94a3b8';
    ctx.font = '16px Outfit, sans-serif';
    ctx.fillText('Faculty Coordinator', 250, 740);
    ctx.fillText('Tech Orientation Program', 250, 765);
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(150, 715);
    ctx.lineTo(350, 715);
    ctx.stroke();

    // 2. Student's Air Signature
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 16px Outfit, sans-serif';
    ctx.fillText('Student Air Signature', 950, 740);
    ctx.fillStyle = '#64748b';
    ctx.font = '14px Outfit, sans-serif';
    ctx.fillText(`Verified on ${data.date}`, 950, 765);
    ctx.beginPath();
    ctx.moveTo(800, 715);
    ctx.lineTo(1100, 715);
    ctx.stroke();

    // If signature image provided, draw it over the signature line
    if (data.signatureImage) {
      const sigImg = new Image();
      sigImg.src = data.signatureImage;
      try {
        ctx.drawImage(sigImg, 850, 620, 200, 90);
      } catch {}
    }

    return canvas;
  }

  public static downloadCertificate(data: CertificateData): void {
    const canvas = this.generateCertificateCanvas(data);
    const link = document.createElement('a');
    link.download = `PM_Shri_Air_Artist_Certificate_${data.studentName.replace(/\s+/g, '_') || 'Student'}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  }
}
