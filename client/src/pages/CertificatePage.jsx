import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import logo from '../../../logo.png';

const CertificatePage = () => {
  const { user } = useAuth();
  const [certs, setCerts] = useState([]);

  const load = () => {
    api
      .get('/certificates/me')
      .then((res) => setCerts(res.data))
      .catch(() => {});
  };

  useEffect(() => {
    load();
  }, []);

  const downloadAsPdf = (cert) => {
    const win = window.open('', '_blank');
    if (!win) return;
    const date = new Date(cert.completionDate).toLocaleDateString();
    win.document.write(`
      <html>
        <head>
          <title>Certificate - ${cert.courseId?.title}</title>
          <style>
            body { font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; padding: 40px; }
            .certificate {
              border: 4px solid #2563eb;
              padding: 40px;
              text-align: center;
            }
            .logo { width: 56px; height: 56px; object-fit: contain; margin: 0 auto 10px; display: block; }
            h1 { margin-bottom: 0.5rem; }
            h2 { margin-top: 0; font-weight: 500; }
            p { margin: 0.35rem 0; }
            .muted { color: #6b7280; font-size: 0.85rem; }
          </style>
        </head>
        <body>
          <div class="certificate">
            <img class="logo" src="${logo}" alt="SkillPathshala" />
            <h1>SkillPathshala</h1>
            <p class="muted">Upgrade Your Skills Anytime, Anywhere.</p>
            <h2>Certificate of Completion</h2>
            <p>This certifies that</p>
            <p><strong>${user?.name || 'Student'}</strong></p>
            <p>has successfully completed the course</p>
            <p><strong>${cert.courseId?.title}</strong></p>
            <p>on ${date}</p>
            <p class="muted">Certificate Code: ${cert.certificateCode}</p>
          </div>
          <script>
            window.print();
          </script>
        </body>
      </html>
    `);
    win.document.close();
  };

  return (
    <div className="page">
      <h2>My Certificates</h2>
      <p className="muted small">
        Download by opening a certificate and choosing “Save as PDF” in the print dialog.
      </p>
      <div className="grid">
        {certs.map((c) => (
          <div key={c._id} className="card certificate-card">
            <h3>{c.courseId?.title}</h3>
            <p>Completion Date: {new Date(c.completionDate).toLocaleDateString()}</p>
            <p className="muted">Code: {c.certificateCode}</p>
            {c.fileUrl ? (
              <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                <a
                  href={c.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-secondary"
                >
                  View
                </a>
                <a
                  href={c.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  download
                  className="btn-secondary"
                >
                  Download
                </a>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                <button className="btn-secondary" onClick={() => downloadAsPdf(c)}>
                  View PDF
                </button>
                <button className="btn-secondary" onClick={() => downloadAsPdf(c)}>
                  Download
                </button>
              </div>
            )}
          </div>
        ))}
        {certs.length === 0 && <p>No certificates yet. Complete a course to earn one.</p>}
      </div>
    </div>
  );
};

export default CertificatePage;

