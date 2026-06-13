import { useEffect, useRef, useState } from "react";
import { useCMS } from "../hooks/useCMS";

const WORKER_URL = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
const PDFJS_URL = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";

function Bylaws() {
  const cms = useCMS();
  const canvasRef = useRef(null);
  const pdfDocRef = useRef(null);
  const pageRenderingRef = useRef(false);
  const pageNumPendingRef = useRef(null);
  const scaleRef = useRef(1.5);
  const rotationRef = useRef(0);
  const [pageNum, setPageNum] = useState(1);
  const [pageCount, setPageCount] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(150);
  const [prevDisabled, setPrevDisabled] = useState(true);
  const [nextDisabled, setNextDisabled] = useState(false);
  const [pdfLoaded, setPdfLoaded] = useState(false);
  const [pdfError, setPdfError] = useState(false);

  // Get PDF URL from CMS, fallback to local asset
  const pdfUrl = cms("bylaws_pdf", "/assets/laws.pdf");

  const renderPage = (num) => {
    if (!pdfDocRef.current || !canvasRef.current) return;
    pageRenderingRef.current = true;
    pdfDocRef.current.getPage(num).then((page) => {
      const viewport = page.getViewport({ scale: scaleRef.current, rotation: rotationRef.current });
      const canvas = canvasRef.current;
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      const ctx = canvas.getContext("2d");
      const renderTask = page.render({ canvasContext: ctx, viewport });
      renderTask.promise.then(() => {
        pageRenderingRef.current = false;
        if (pageNumPendingRef.current !== null) { renderPage(pageNumPendingRef.current); pageNumPendingRef.current = null; }
      });
    });
    setPageNum(num);
    setPrevDisabled(num <= 1);
    setNextDisabled(num >= (pdfDocRef.current?.numPages || 1));
  };

  const queueRenderPage = (num) => {
    if (pageRenderingRef.current) pageNumPendingRef.current = num;
    else renderPage(num);
  };

  useEffect(() => {
    if (!pdfUrl) return;
    setPdfLoaded(false);
    setPdfError(false);

    const script = document.createElement("script");
    script.src = PDFJS_URL;
    script.onload = () => {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = WORKER_URL;
      window.pdfjsLib.getDocument(pdfUrl).promise
        .then((pdfDoc) => {
          pdfDocRef.current = pdfDoc;
          setPageCount(pdfDoc.numPages);
          setNextDisabled(pdfDoc.numPages <= 1);
          setPdfLoaded(true);
          renderPage(1);
        })
        .catch(() => setPdfError(true));
    };
    document.body.appendChild(script);
    return () => { if (document.body.contains(script)) document.body.removeChild(script); };
  }, [pdfUrl]);

  const handlePrev = () => { if (pageNum > 1) queueRenderPage(pageNum - 1); };
  const handleNext = () => { if (pdfDocRef.current && pageNum < pdfDocRef.current.numPages) queueRenderPage(pageNum + 1); };
  const handleZoomIn = () => { scaleRef.current += 0.25; setZoomLevel(Math.round(scaleRef.current * 100)); queueRenderPage(pageNum); };
  const handleZoomOut = () => { if (scaleRef.current <= 0.5) return; scaleRef.current -= 0.25; setZoomLevel(Math.round(scaleRef.current * 100)); queueRenderPage(pageNum); };
  const handleRotate = () => { rotationRef.current = (rotationRef.current + 90) % 360; queueRenderPage(pageNum); };
  const handleFullscreen = () => { const c = document.getElementById("canvasContainer"); if (c?.requestFullscreen) c.requestFullscreen(); };
  const handleDownload = () => { const a = document.createElement("a"); a.href = pdfUrl; a.download = "bylaws.pdf"; a.click(); };

  return (
    <>
      {/* HERO */}
      <section className="hero">
        <h1>{cms("bylaws_hero_title", "By-Laws")}</h1>
      </section>

      {/* PDF SECTION */}
      <section className="pdf-section">
        <div className="pdf-container">

          {pdfError ? (
            <div style={{ textAlign: "center", padding: "60px 20px", color: "#6b8099" }}>
              <div style={{ fontSize: 40, marginBottom: 16 }}>📄</div>
              <p style={{ fontSize: 16, marginBottom: 12 }}>PDF not available at the configured URL.</p>
              <p style={{ fontSize: 13, color: "#aaa" }}>Admin can update the PDF URL in the Content & CMS panel → By-Laws → Bylaws PDF File.</p>
            </div>
          ) : (
            <>
              {/* Controls */}
              <div className="pdf-controls">
                <div className="pdf-controls-left">
                  <button onClick={handlePrev} disabled={prevDisabled}>&#8249; Previous</button>
                  <span className="pdf-info">Page <span>{pageNum}</span> / <span>{pageCount || "—"}</span></span>
                  <button onClick={handleNext} disabled={nextDisabled}>Next &#8250;</button>
                </div>
                <div className="pdf-controls-center">
                  <button onClick={handleZoomOut}>&#8722;</button>
                  <span className="zoom-level">{zoomLevel}%</span>
                  <button onClick={handleZoomIn}>&#43;</button>
                </div>
                <div className="pdf-controls-right">
                  <button onClick={handleRotate}>↻ Rotate</button>
                  <button onClick={handleFullscreen}>⛶ Fullscreen</button>
                </div>
              </div>

              {/* Canvas */}
              <div className="pdf-canvas-container" id="canvasContainer">
                <canvas ref={canvasRef} id="pdfCanvas"></canvas>
              </div>

              {/* Download */}
              <div className="download-section">
                <button className="download-btn" onClick={handleDownload}>⬇ Download By-Laws PDF</button>
              </div>
            </>
          )}
        </div>
      </section>
    </>
  );
}

export default Bylaws;