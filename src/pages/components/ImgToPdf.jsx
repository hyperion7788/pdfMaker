import React, { useState, useRef } from "react";
import jsPDF from "jspdf";
import {
  Upload,
  X,
  FileImage,
  Download,
  Loader2,
  Sparkles,
  ImagePlus,
  Trash2,
} from "lucide-react";

const ImgToPdf = () => {
  const [images, setImages] = useState([]);
  const [pdfOutput, setPdfOutput] = useState(null);
  const [isConverting, setIsConverting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const compressImage = async (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;

          // Calculate new dimensions while maintaining aspect ratio
          const maxDimension = 1920;
          if (width > maxDimension || height > maxDimension) {
            if (width > height) {
              height = (height / width) * maxDimension;
              width = maxDimension;
            } else {
              width = (width / height) * maxDimension;
              height = maxDimension;
            }
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, width, height);

          // Convert to WebP with quality 0.8 (good balance between quality and size)
          canvas.toBlob(
            (blob) => {
              const compressedUrl = URL.createObjectURL(blob);
              resolve({
                blob,
                url: compressedUrl,
                width,
                height,
              });
            },
            "image/webp",
            0.8
          );
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  };

  const processFiles = async (files) => {
    const newImages = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.type.startsWith("image/")) {
        const compressed = await compressImage(file);
        const originalSize = (file.size / 1024).toFixed(2);
        const compressedSize = (compressed.blob.size / 1024).toFixed(2);

        newImages.push({
          file: compressed.blob,
          preview: compressed.url,
          name: file.name,
          type: "WEBP",
          originalSize,
          compressedSize,
          width: compressed.width,
          height: compressed.height,
        });
      }
    }
    setImages((prev) => [...prev, ...newImages]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    processFiles(files);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    // If no images left, clear PDF output
    if (images.length === 1) {
      setPdfOutput(null);
    }
  };

  const convertToPdf = async () => {
    if (images.length === 0) return;
    setIsConverting(true);

    await new Promise((resolve) => setTimeout(resolve, 500));

    const pdf = new jsPDF();
    for (let i = 0; i < images.length; i++) {
      const img = images[i];

      if (i > 0) pdf.addPage();

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgRatio = img.width / img.height;
      const pdfRatio = pdfWidth / pdfHeight;

      let width, height;
      if (imgRatio > pdfRatio) {
        width = pdfWidth - 20;
        height = width / imgRatio;
      } else {
        height = pdfHeight - 20;
        width = height * imgRatio;
      }

      const x = (pdfWidth - width) / 2;
      const y = (pdfHeight - height) / 2;

      pdf.addImage(img.preview, "WEBP", x, y, width, height);

      // Add watermark
      pdf.setFontSize(12);
      pdf.setTextColor(150, 150, 150);
      pdf.setFont(undefined, "bold");
      const watermarkText = "PDF MAKER";
      const textWidth = pdf.getTextWidth(watermarkText);
      const watermarkX = pdfWidth - textWidth - 10;
      const watermarkY = pdfHeight - 10;
      pdf.text(watermarkText, watermarkX, watermarkY);
    }

    const pdfBlob = pdf.output("blob");
    setPdfOutput(URL.createObjectURL(pdfBlob));
    setIsConverting(false);
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
              Image to PDF Converter
            </h1>
            <Sparkles className="w-8 h-8 text-yellow-400 animate-pulse ml-2" />
          </div>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Transform your images into professional PDFs instantly. Images are
            automatically compressed to WebP for optimal file size.
          </p>
        </div>

        {/* Upload Area */}
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
              Drop your images here
            </h3>
            <p className="text-gray-400 mb-6">
              or click the button below to browse
            </p>
            <button
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl inline-flex items-center"
              onClick={() => fileInputRef.current.click()}
            >
              <ImagePlus className="w-5 h-5 mr-2" />
              Select Images
            </button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              hidden
              onChange={(e) => processFiles(e.target.files)}
            />
          </div>
        </div>

        {/* Images Grid */}
        {images.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <FileImage className="w-6 h-6 mr-2 text-blue-400" />
                <h2 className="text-2xl font-semibold">
                  Your Images{" "}
                  <span className="text-gray-400">({images.length})</span>
                </h2>
              </div>
              <button
                onClick={() => {
                  setImages([]);
                  setPdfOutput(null);
                }}
                className="text-red-400 hover:text-red-300 transition-colors duration-200 flex items-center"
              >
                <Trash2 className="w-5 h-5 mr-1" />
                Clear All
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {images.map((img, i) => (
                <div
                  key={i}
                  className="relative group bg-gray-700 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 animate-fade-in"
                  style={{ animationDelay: `${i * 50}ms` }}
                >
                  <img
                    src={img.preview}
                    alt={img.name}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute bottom-0 left-0 right-0 p-3">
                      <p className="text-white text-sm truncate font-medium">
                        {img.name}
                      </p>
                      <p className="text-gray-300 text-xs mb-1">{img.type}</p>
                      <p className="text-green-400 text-xs">
                        {img.originalSize} KB → {img.compressedSize} KB
                      </p>
                    </div>
                  </div>
                  <button
                    className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full transition-all duration-200 transform hover:scale-110 shadow-lg opacity-0 group-hover:opacity-100"
                    onClick={() => removeImage(i)}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Convert Button */}
        {images.length > 0 && (
          <div className="text-center mb-8">
            <button
              className={`bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white px-12 py-4 rounded-lg font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl inline-flex items-center ${
                isConverting ? "opacity-75 cursor-not-allowed" : ""
              }`}
              onClick={convertToPdf}
              disabled={isConverting}
            >
              {isConverting ? (
                <>
                  <Loader2 className="w-6 h-6 mr-2 animate-spin" />
                  Converting...
                </>
              ) : (
                <>
                  <FileImage className="w-6 h-6 mr-2" />
                  Convert to PDF
                </>
              )}
            </button>
          </div>
        )}

        {/* Download Section */}
        {pdfOutput && images.length > 0 && (
          <div className="text-center animate-fade-in">
            <div className="bg-gradient-to-r from-gray-700 to-gray-600 rounded-2xl p-8 shadow-2xl max-w-md mx-auto">
              <div className="flex justify-center mb-4">
                <div className="p-4 bg-green-600 rounded-full animate-bounce">
                  <Download className="w-12 h-12 text-white" />
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-2">PDF Ready!</h3>
              <p className="text-gray-300 mb-6">
                Your PDF has been created successfully
              </p>
              <a
                href={pdfOutput}
                download="converted.pdf"
                className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl inline-flex items-center"
              >
                <Download className="w-5 h-5 mr-2" />
                Download PDF
              </a>
              <button
                onClick={() => {
                  setPdfOutput(null);
                  setImages([]);
                }}
                className="mt-4 text-gray-400 hover:text-white transition-colors duration-200 block mx-auto"
              >
                Convert Another
              </button>
            </div>
          </div>
        )}

        {/* Features Section */}
        {images.length === 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            <div className="text-center p-6 bg-gray-700/50 rounded-xl hover:bg-gray-700 transition-all duration-300 transform hover:scale-105">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-blue-600 rounded-full">
                  <Upload className="w-8 h-8" />
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-2">Easy Upload</h3>
              <p className="text-gray-400">
                Drag and drop or click to upload multiple images at once
              </p>
            </div>
            <div className="text-center p-6 bg-gray-700/50 rounded-xl hover:bg-gray-700 transition-all duration-300 transform hover:scale-105">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-purple-600 rounded-full">
                  <Sparkles className="w-8 h-8" />
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-2">Smart Compression</h3>
              <p className="text-gray-400">
                Automatically converts to WebP and reduces file size by up to
                80%
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
                Download your optimized PDF immediately after conversion
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

export default ImgToPdf;
