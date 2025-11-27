import React, { useState, useRef } from "react";
import {
  Upload,
  Download,
  Loader2,
  Sparkles,
  FileText,
  Trash2,
  Minimize2,
  CheckCircle,
  Info,
} from "lucide-react";

const CompressPdf = () => {
  const [originalPdf, setOriginalPdf] = useState(null);
  const [compressedPdf, setCompressedPdf] = useState(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [compressionLevel, setCompressionLevel] = useState("balanced");
  const [stats, setStats] = useState(null);
  const fileInputRef = useRef(null);

  const compressionSettings = {
    maximum: {
      quality: 0.5,
      dpi: 72,
      description: "Smallest file size, lower quality - Best for web use",
    },
    balanced: {
      quality: 0.7,
      dpi: 96,
      description: "Balanced size and quality (Recommended)",
    },
    minimum: {
      quality: 0.9,
      dpi: 150,
      description: "Best quality, moderate compression",
    },
  };

  // Load PDF.js dynamically
  const loadPdfJs = async () => {
    if (window.pdfjsLib) {
      return window.pdfjsLib;
    }

    // Load PDF.js from CDN
    const script = document.createElement("script");
    script.src =
      "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
    document.head.appendChild(script);

    return new Promise((resolve, reject) => {
      script.onload = () => {
        window.pdfjsLib.GlobalWorkerOptions.workerSrc =
          "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
        resolve(window.pdfjsLib);
      };
      script.onerror = reject;
    });
  };

  const compressPdfFile = async (file) => {
    setIsCompressing(true);
    const originalSize = file.size;

    try {
      const pdfjsLib = await loadPdfJs();

      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

      // Create a new PDF document using pdf-lib
      const { PDFDocument, rgb } = await import("pdf-lib");
      const newPdfDoc = await PDFDocument.create();

      const settings = compressionSettings[compressionLevel];

      for (let i = 0; i < pdf.numPages; i++) {
        const page = await pdf.getPage(i + 1);

        // Get the page as image data for compression
        const viewport = page.getViewport({ scale: settings.dpi / 72 });

        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        await page.render({
          canvasContext: context,
          viewport: viewport,
        }).promise;

        // Convert to JPEG with quality setting
        const imageData = canvas.toDataURL("image/jpeg", settings.quality);

        // Extract base64 data from data URL
        const base64Data = imageData.split(",")[1];
        const imageBytes = Uint8Array.from(atob(base64Data), (c) =>
          c.charCodeAt(0)
        );

        // Create PDF page
        const pdfPage = newPdfDoc.addPage([viewport.width, viewport.height]);

        // Embed the JPEG image
        const jpegImage = await newPdfDoc.embedJpg(imageBytes);
        pdfPage.drawImage(jpegImage, {
          x: 0,
          y: 0,
          width: viewport.width,
          height: viewport.height,
        });

        // Add watermark - FIXED COLOR FORMAT
        pdfPage.drawText("PDF MAKER", {
          x: viewport.width - 100,
          y: 25,
          size: 12,
          color: rgb(0.6, 0.6, 0.6), // Use rgb() function instead of object
        });
      }

      // Compress the PDF
      const pdfBytes = await newPdfDoc.save({
        useObjectStreams: true,
        addDefaultPage: false,
      });

      const compressedSize = pdfBytes.length;
      const compressionRatio = (
        (1 - compressedSize / originalSize) *
        100
      ).toFixed(1);

      // Create blob and URL
      const pdfBlob = new Blob([pdfBytes], { type: "application/pdf" });

      setCompressedPdf(URL.createObjectURL(pdfBlob));
      setStats({
        originalSize: (originalSize / 1024 / 1024).toFixed(2),
        compressedSize: (compressedSize / 1024 / 1024).toFixed(2),
        compressionRatio: Math.max(0, compressionRatio), // Ensure non-negative
        pageCount: pdf.numPages,
      });
    } catch (error) {
      console.error("Error compressing PDF:", error);
      alert("Error compressing PDF. Please try again with a different file.");
    }

    setIsCompressing(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files[0] && files[0].type === "application/pdf") {
      setOriginalPdf(files[0]);
      setCompressedPdf(null);
      setStats(null);
    } else {
      alert("Please drop a valid PDF file.");
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file && file.type === "application/pdf") {
      setOriginalPdf(file);
      setCompressedPdf(null);
      setStats(null);
    } else {
      alert("Please select a valid PDF file.");
    }
  };

  const handleCompress = () => {
    if (originalPdf) {
      // Check file size limit (50MB)
      if (originalPdf.size > 50 * 1024 * 1024) {
        alert("File size too large. Please select a PDF smaller than 50MB.");
        return;
      }
      compressPdfFile(originalPdf);
    }
  };

  const handleReset = () => {
    setOriginalPdf(null);
    setCompressedPdf(null);
    setStats(null);
    setCompressionLevel("balanced");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="min-h-screen bg-gray-800 text-white">
      {/* Header with gradient */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 py-1"></div>

      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-flex items-center justify-center mb-4">
            <Sparkles className="w-8 h-8 text-yellow-400 animate-pulse mr-2" />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              PDF Compressor
            </h1>
            <Sparkles className="w-8 h-8 text-yellow-400 animate-pulse ml-2" />
          </div>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Reduce PDF file size while maintaining excellent quality. Fast,
            secure, and easy to use.
          </p>
        </div>

        {/* Upload Area */}
        {!originalPdf && (
          <div
            className={`relative border-3 border-dashed rounded-2xl p-12 mb-8 transition-all duration-300 ${
              isDragging
                ? "border-blue-400 bg-blue-900/20 scale-105"
                : "border-gray-600 bg-gray-700/50 hover:border-gray-500"
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div
                  className={`p-4 bg-gray-600 rounded-full transition-all duration-300 ${
                    isDragging ? "scale-110 bg-blue-600" : ""
                  }`}
                >
                  <Upload className="w-12 h-12 text-white" />
                </div>
              </div>
              <h3 className="text-2xl font-semibold mb-2">
                Drop your PDF here
              </h3>
              <p className="text-gray-400 mb-6">
                or click the button below to browse
              </p>
              <button
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl inline-flex items-center"
                onClick={() => fileInputRef.current?.click()}
              >
                <FileText className="w-5 h-5 mr-2" />
                Select PDF
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf"
                hidden
                onChange={handleFileSelect}
              />
              <p className="text-gray-400 text-sm mt-4">
                Maximum file size: 50MB
              </p>
            </div>
          </div>
        )}

        {/* Compression Settings */}
        {originalPdf && !compressedPdf && !isCompressing && (
          <div className="max-w-3xl mx-auto mb-8 animate-fade-in">
            <div className="bg-gray-700/50 rounded-2xl p-8 shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <FileText className="w-6 h-6 mr-3 text-blue-400" />
                  <div>
                    <h3 className="text-xl font-semibold">
                      {originalPdf.name}
                    </h3>
                    <p className="text-gray-400 text-sm">
                      Size: {(originalPdf.size / 1024 / 1024).toFixed(2)} MB •
                      Pages: Loading...
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleReset}
                  className="text-red-400 hover:text-red-300 transition-colors duration-200"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>

              <div className="mb-6">
                <label className="flex items-center text-lg font-semibold mb-4">
                  <Minimize2 className="w-5 h-5 mr-2 text-purple-400" />
                  Compression Level
                </label>

                <div className="space-y-3">
                  {Object.entries(compressionSettings).map(([key, setting]) => (
                    <label
                      key={key}
                      className={`flex items-start p-4 rounded-lg cursor-pointer transition-all duration-300 ${
                        compressionLevel === key
                          ? "bg-purple-600/30 border-2 border-purple-500"
                          : "bg-gray-600/50 border-2 border-transparent hover:bg-gray-600"
                      }`}
                    >
                      <input
                        type="radio"
                        name="compression"
                        value={key}
                        checked={compressionLevel === key}
                        onChange={(e) => setCompressionLevel(e.target.value)}
                        className="mt-1 mr-3"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold capitalize">
                            {key} Compression
                          </span>
                          {key === "balanced" && (
                            <span className="bg-green-600 text-white text-xs px-2 py-1 rounded-full">
                              Recommended
                            </span>
                          )}
                        </div>
                        <p className="text-gray-400 text-sm">
                          {setting.description}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="bg-blue-900/30 border border-blue-500/50 rounded-lg p-4 mb-6 flex items-start">
                <Info className="w-5 h-5 text-blue-400 mr-3 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-gray-300">
                  <strong>How it works:</strong> Your PDF pages are converted to
                  optimized JPEG images with adjustable quality and resolution.
                  This works best for scanned documents and image-heavy PDFs.
                  Text-based PDFs may see different compression results.
                </p>
              </div>

              <button
                onClick={handleCompress}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-4 rounded-lg font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl inline-flex items-center justify-center"
              >
                <Minimize2 className="w-6 h-6 mr-2" />
                Compress PDF
              </button>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isCompressing && (
          <div className="text-center py-12 animate-fade-in">
            <Loader2 className="w-16 h-16 text-purple-400 animate-spin mx-auto mb-4" />
            <p className="text-xl text-gray-300 mb-2">
              Compressing your PDF...
            </p>
            <p className="text-gray-400">
              This may take a moment depending on file size and complexity
            </p>
            <div className="mt-4 bg-gray-700 rounded-full h-2 w-64 mx-auto">
              <div className="bg-purple-600 h-2 rounded-full animate-pulse"></div>
            </div>
          </div>
        )}

        {/* Results */}
        {compressedPdf && stats && (
          <div className="max-w-4xl mx-auto animate-fade-in">
            <div className="bg-gradient-to-r from-gray-700 to-gray-600 rounded-2xl p-8 shadow-2xl mb-6">
              <div className="flex justify-center mb-6">
                <div className="p-4 bg-green-600 rounded-full">
                  <CheckCircle className="w-12 h-12 text-white" />
                </div>
              </div>

              <h3 className="text-3xl font-bold text-center mb-6">
                Compression Successful!
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-gray-800/50 rounded-xl p-6 text-center">
                  <p className="text-gray-400 text-sm mb-2">Original Size</p>
                  <p className="text-3xl font-bold text-red-400">
                    {stats.originalSize} MB
                  </p>
                </div>

                <div className="bg-gray-800/50 rounded-xl p-6 text-center">
                  <p className="text-gray-400 text-sm mb-2">Compressed Size</p>
                  <p className="text-3xl font-bold text-green-400">
                    {stats.compressedSize} MB
                  </p>
                </div>

                <div className="bg-gray-800/50 rounded-xl p-6 text-center">
                  <p className="text-gray-400 text-sm mb-2">Size Reduced</p>
                  <p className="text-3xl font-bold text-blue-400">
                    {stats.compressionRatio}%
                  </p>
                </div>
              </div>

              <div className="text-center mb-6 text-gray-300">
                <p>
                  Pages: {stats.pageCount} • File reduced by{" "}
                  {stats.compressionRatio}%
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href={compressedPdf}
                  download={`${originalPdf.name.replace(
                    ".pdf",
                    ""
                  )}_compressed.pdf`}
                  className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl inline-flex items-center justify-center"
                >
                  <Download className="w-5 h-5 mr-2" />
                  Download Compressed PDF
                </a>

                <button
                  onClick={handleReset}
                  className="bg-gray-600 hover:bg-gray-500 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 inline-flex items-center justify-center"
                >
                  <Upload className="w-5 h-5 mr-2" />
                  Compress Another
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Features Section */}
        {!originalPdf && !isCompressing && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-16">
            <div className="text-center p-6 bg-gray-700/50 rounded-xl hover:bg-gray-700 transition-all duration-300 transform hover:scale-105">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-purple-600 rounded-full">
                  <Minimize2 className="w-8 h-8" />
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-2">Smart Compression</h3>
              <p className="text-gray-400">
                Reduce file size by up to 80% while maintaining quality
              </p>
            </div>

            <div className="text-center p-6 bg-gray-700/50 rounded-xl hover:bg-gray-700 transition-all duration-300 transform hover:scale-105">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-blue-600 rounded-full">
                  <CheckCircle className="w-8 h-8" />
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-2">Quality Preserved</h3>
              <p className="text-gray-400">
                Advanced algorithms maintain document clarity
              </p>
            </div>

            <div className="text-center p-6 bg-gray-700/50 rounded-xl hover:bg-gray-700 transition-all duration-300 transform hover:scale-105">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-pink-600 rounded-full">
                  <Loader2 className="w-8 h-8" />
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-2">Fast Processing</h3>
              <p className="text-gray-400">
                Compress PDFs in seconds with optimized engine
              </p>
            </div>

            <div className="text-center p-6 bg-gray-700/50 rounded-xl hover:bg-gray-700 transition-all duration-300 transform hover:scale-105">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-green-600 rounded-full">
                  <Download className="w-8 h-8" />
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-2">Instant Download</h3>
              <p className="text-gray-400">
                Get your compressed PDF immediately
              </p>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default CompressPdf;
