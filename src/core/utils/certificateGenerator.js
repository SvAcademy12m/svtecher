import jsPDF from 'jspdf';

/**
 * Generates a premium SvTech Academy Certificate
 * @param {Object} cert - Certificate data (studentName, courseName, grade, completionDate, certificateId, etc.)
 * @param {Boolean} isSample - Whether to include a "SAMPLE" watermark
 */
export const generatePremiumCertificate = (cert, isSample = false) => {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  const w = 297;
  const h = 210;

  // 1. Dark Background Frame
  doc.setFillColor(10, 15, 30); // Very deep navy
  doc.rect(0, 0, w, h, 'F');

  // 2. Artistic Border Elements (Gold/Blue gradient feel)
  doc.setFillColor(30, 58, 138); // Blue 900
  doc.rect(0, 0, w, 30, 'F');
  doc.rect(0, h - 30, w, 30, 'F');

  // Decorative Triangles/Shapes in corners
  doc.setFillColor(59, 130, 246, 0.2); // Blue 500 with opacity
  doc.triangle(0, 0, 80, 0, 0, 80, 'F');
  doc.triangle(w, 0, w - 80, 0, w, 80, 'F');
  doc.triangle(0, h, 80, h, 0, h - 80, 'F');
  doc.triangle(w, h, w - 80, h, w, h - 80, 'F');

  // 3. Main Certificate Paper (Creamy White)
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(12, 12, w - 24, h - 24, 4, 4, 'F');

  // 4. Double Border Frame
  doc.setDrawColor(30, 58, 138);
  doc.setLineWidth(1.5);
  doc.rect(15, 15, w - 30, h - 30);
  
  doc.setDrawColor(190, 155, 70); // Gold-ish
  doc.setLineWidth(0.5);
  doc.rect(17, 17, w - 34, h - 34);

  // 5. Decorative Corners (Gold)
  const cs = 25;
  doc.setDrawColor(190, 155, 70);
  doc.setLineWidth(1);
  // TL
  doc.line(15, 15 + cs, 15, 15); doc.line(15, 15, 15 + cs, 15);
  // TR
  doc.line(w - 15 - cs, 15, w - 15, 15); doc.line(w - 15, 15, w - 15, 15 + cs);
  // BL
  doc.line(15, h - 15 - cs, 15, h - 15); doc.line(15, h - 15, 15 + cs, h - 15);
  // BR
  doc.line(w - 15 - cs, h - 15, w - 15, h - 15); doc.line(w - 15, h - 15, w - 15, h - 15 - cs);

  // 6. Header
  // Logo placeholder (Circular with SV)
  doc.setFillColor(30, 58, 138);
  doc.circle(w/2, 40, 14, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('SV', w/2, 42.5, { align: 'center' });

  doc.setTextColor(30, 58, 138);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('SVTECH DIGITAL TECHNOLOGY ACADEMY', w/2, 62, { align: 'center' });
  
  doc.setDrawColor(190, 155, 70);
  doc.setLineWidth(0.3);
  doc.line(w/2 - 40, 65, w/2 + 40, 65);

  // 7. Main Title
  doc.setTextColor(10, 15, 30);
  doc.setFontSize(30);
  doc.setFont('times', 'bold');
  doc.text('SHORT TERM & ADVANCED CERTIFICATE', w/2, 85, { align: 'center' });
  
  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('OF PROFESSIONAL ACHIEVEMENT', w/2, 95, { align: 'center', charSpace: 2 });

  // 8. Body Text
  doc.setFontSize(11);
  doc.setTextColor(71, 85, 105);
  doc.text('THIS DOCUMENT SERVES TO OFFICIALLY RECOGNIZE THAT', w/2, 110, { align: 'center' });

  // Student Name
  doc.setFontSize(36);
  doc.setFont('times', 'bolditalic');
  doc.setTextColor(30, 58, 138);
  doc.text(cert.studentName?.toUpperCase() || 'VALUED SCHOLAR', w/2, 125, { align: 'center' });

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('HAS SUCCESSFULLY DEMONSTRATED PROFICIENCY AND EXCELLENCE IN', w/2, 138, { align: 'center' });

  // Course Name
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(cert.courseName?.toUpperCase() || 'ADVANCED TECHNOLOGY MODULE', w/2, 152, { align: 'center' });

  // 9. Status & Identifiers
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text(`CREDENTIAL ID: ${cert.certificateId}`, 40, 172);
  doc.text(`ISSUED ON: ${cert.completionDate}`, w - 40, 172, { align: 'right' });
  
  doc.setTextColor(16, 185, 129); // emerald green
  doc.setFontSize(14);
  doc.text(`FINAL GRADE SCORE: ${cert.grade || 'A'}`, w/2, 172, { align: 'center' });

  // 10. Signatures Row
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.5);
  doc.line(40, 192, 110, 192); // Left signature line
  doc.line(w - 110, 192, w - 40, 192); // Right signature line

  // Samuel Tegegn Signature (Advanced Digital Script)
  doc.setTextColor(30, 58, 138);
  doc.setFont('times', 'italic');
  doc.setFontSize(26);
  doc.text('Samuel Tegegn', 75, 186, { align: 'center' });
  
  // Digital Signature "Stamp"
  doc.setDrawColor(30, 58, 138, 0.5);
  doc.setLineWidth(0.1);
  doc.circle(75, 185, 12, 'S');
  doc.setFontSize(6);
  doc.text('ELECTRONICALLY SIGNED', 75, 190.5, { align: 'center' });
  
  doc.setTextColor(100, 116, 139);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('SAMUEL TEGEGN', 75, 196, { align: 'center' });
  doc.text('FOUNDER & EXECUTIVE DIRECTOR', 75, 200, { align: 'center' });
  doc.setTextColor(30, 58, 138);
  doc.setFontSize(6);
  doc.text('SVTech Training and Consulting', 75, 204, { align: 'center' });

  // Academic Council & QR Placeholder
  doc.setTextColor(30, 58, 138);
  doc.setFont('times', 'italic');
  doc.setFontSize(24);
  doc.text('Digital Verifier', w - 75, 186, { align: 'center' });
  
  // QR Code / Verification Stamp Placeholder
  doc.setFillColor(240, 240, 240);
  doc.rect(w - 85, 175, 20, 20, 'F');
  doc.setFontSize(5);
  doc.setTextColor(150, 150, 150);
  doc.text('SCAN TO VERIFY', w - 75, 194, { align: 'center' });
  
  doc.setTextColor(100, 116, 139);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('SVTECH ACADEMIC BOARD', w - 75, 198, { align: 'center' });
  doc.text('BLOCKCHAIN VERIFIED NODE', w - 75, 202, { align: 'center' });

  // 11. Footer Verification Bar
  doc.setFillColor(10, 15, 30);
  doc.rect(15, h - 18, w - 30, 8, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(7);
  doc.setFont('courier', 'normal');
  const verifyText = `VERIFICATION URL: SVTECH.DIGITAL/VERIFY | TOKEN: ${cert.certificateId} | DIGITAL ARCHIVE SECURED BY SV-PROTOCOL`;
  doc.text(verifyText, w/2, h - 13, { align: 'center' });

  // 12. Watermark for Samples
  if (isSample) {
    doc.setTextColor(255, 0, 0, 0.15); // Red with opacity
    doc.setFontSize(120);
    doc.setFont('helvetica', 'bold');
    doc.text('SAMPLE', w/2, h/2 + 20, { align: 'center', angle: 45 });
    
    doc.setFontSize(14);
    doc.text('OFFICIAL COPY PENDING VERIFICATION', w/2, h/2 + 40, { align: 'center', angle: 45 });
  }

  // 13. Save/Output
  const fileName = isSample ? `SAMPLE_CERT_${cert.certificateId}.pdf` : `SVTECH_CERT_${cert.studentName?.replace(/\s+/g, '_')}.pdf`;
  doc.save(fileName);
};
