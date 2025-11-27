import React, { useState, useRef } from "react";
import { jsPDF } from "jspdf";
import {
  Upload,
  X,
  FileImage,
  Download,
  Loader2,
  Sparkles,
  Plus,
  Trash2,
  FileText,
  Layers,
  ArrowUpDown,
} from "lucide-react";

const Merge = () => {
  const [files, setFiles] = useState([]);
  const [mergedOutput, setMergedOutput] = useState(null);
  const [isMerging, setIsMerging] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

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

  const processImageFile = async (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;

          // Calculate dimensions to fit PDF page (A4 aspect ratio)
          const pdfWidth = 595; // A4 width in points
          const pdfHeight = 842; // A4 height in points
          const maxWidth = pdfWidth - 40; // 20px margin on each side
          const maxHeight = pdfHeight - 40;

          if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height);
            width = width * ratio;
            height = height * ratio;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, width, height);

          const imageData = canvas.toDataURL("image/jpeg", 0.8);
          resolve({
            type: "image",
            name: file.name,
            imageData: imageData,
            width: width,
            height: height,
            originalWidth: img.width,
            originalHeight: img.height,
            size: (file.size / 1024).toFixed(2),
          });
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  };

  const processPDFFile = async (file) => {
    try {
      const pdfjsLib = await loadPdfJs();

      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

      const pages = [];
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 1.5 });

        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        await page.render({
          canvasContext: context,
          viewport: viewport,
        }).promise;

        const imageData = canvas.toDataURL("image/jpeg", 0.8);
        pages.push({
          imageData: imageData,
          width: viewport.width,
          height: viewport.height,
        });
      }

      return {
        type: "pdf",
        name: file.name,
        pageCount: pdf.numPages,
        pages: pages,
        size: (file.size / 1024).toFixed(2),
      };
    } catch (error) {
      console.error("Error processing PDF:", error);
      alert(`Error processing PDF "${file.name}": ${error.message}`);
      return null;
    }
  };

  const processFiles = async (fileList) => {
    const newFiles = [];
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      setIsMerging(true);

      try {
        if (file.type.startsWith("image/")) {
          const processedImage = await processImageFile(file);
          newFiles.push(processedImage);
        } else if (file.type === "application/pdf") {
          const processedPDF = await processPDFFile(file);
          if (processedPDF) {
            newFiles.push(processedPDF);
          }
        }
      } catch (error) {
        console.error(`Error processing file ${file.name}:`, error);
        alert(`Error processing file "${file.name}". Please try again.`);
      }
    }

    setFiles((prev) => [...prev, ...newFiles]);
    setIsMerging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const fileList = Array.from(e.dataTransfer.files);

    // Filter only PDF and image files
    const validFiles = fileList.filter(
      (file) =>
        file.type.startsWith("image/") || file.type === "application/pdf"
    );

    if (validFiles.length > 0) {
      processFiles(validFiles);
    } else {
      alert("Please drop only PDF or image files.");
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
    const fileList = Array.from(e.target.files);
    if (fileList.length > 0) {
      processFiles(fileList);
    }
    // Reset input to allow selecting same files again
    e.target.value = "";
  };

  const removeFile = (index) => {
    setFiles((prev) => {
      const newFiles = prev.filter((_, i) => i !== index);
      if (newFiles.length === 0) {
        setMergedOutput(null);
      }
      return newFiles;
    });
  };

  const moveFile = (index, direction) => {
    const newFiles = [...files];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= files.length) return;
    [newFiles[index], newFiles[targetIndex]] = [
      newFiles[targetIndex],
      newFiles[index],
    ];
    setFiles(newFiles);
  };

  const mergeToPDF = async () => {
    if (files.length === 0) return;

    setIsMerging(true);
    setMergedOutput(null);

    try {
      const pdf = new jsPDF();
      let isFirstPage = true;

      for (const file of files) {
        if (file.type === "image") {
          if (!isFirstPage) {
            pdf.addPage();
          }
          isFirstPage = false;

          const pdfWidth = pdf.internal.pageSize.getWidth();
          const pdfHeight = pdf.internal.pageSize.getHeight();

          // Calculate image dimensions to fit page with margins
          const margin = 20;
          const maxWidth = pdfWidth - 2 * margin;
          const maxHeight = pdfHeight - 2 * margin;

          let width = file.width;
          let height = file.height;

          // Scale image to fit within page margins
          if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height);
            width = width * ratio;
            height = height * ratio;
          }

          const x = (pdfWidth - width) / 2;
          const y = (pdfHeight - height) / 2;

          pdf.addImage(file.imageData, "JPEG", x, y, width, height);

          // Add watermark
          pdf.setFontSize(10);
          pdf.setTextColor(150, 150, 150);
          const watermarkText = "PDF MAKER";
          const textWidth = pdf.getTextWidth(watermarkText);
          const watermarkX = pdfWidth - textWidth - 10;
          const watermarkY = pdfHeight - 10;
          pdf.text(watermarkText, watermarkX, watermarkY);
        } else if (file.type === "pdf") {
          for (let i = 0; i < file.pages.length; i++) {
            if (!isFirstPage) {
              pdf.addPage();
            }
            isFirstPage = false;

            const page = file.pages[i];
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();

            // Calculate dimensions to fit page
            const margin = 20;
            const maxWidth = pdfWidth - 2 * margin;
            const maxHeight = pdfHeight - 2 * margin;

            let width = page.width;
            let height = page.height;

            // Scale page to fit within page margins
            if (width > maxWidth || height > maxHeight) {
              const ratio = Math.min(maxWidth / width, maxHeight / height);
              width = width * ratio;
              height = height * ratio;
            }

            const x = (pdfWidth - width) / 2;
            const y = (pdfHeight - height) / 2;

            pdf.addImage(page.imageData, "JPEG", x, y, width, height);

            // Add watermark
            pdf.setFontSize(10);
            pdf.setTextColor(150, 150, 150);
            const watermarkText = "PDF MAKER";
            const textWidth = pdf.getTextWidth(watermarkText);
            const watermarkX = pdfWidth - textWidth - 10;
            const watermarkY = pdfHeight - 10;
            pdf.text(watermarkText, watermarkX, watermarkY);
          }
        }
      }

      const pdfBlob = pdf.output("blob");
      setMergedOutput(URL.createObjectURL(pdfBlob));
    } catch (error) {
      console.error("Error merging PDF:", error);
      alert("Error creating merged PDF. Please try again.");
    } finally {
      setIsMerging(false);
    }
  };

  const getTotalPages = () => {
    return files.reduce((total, file) => {
      if (file.type === "image") return total + 1;
      if (file.type === "pdf") return total + file.pageCount;
      return total;
    }, 0);
  };

  const getTotalSize = () => {
    return files
      .reduce((total, file) => total + parseFloat(file.size || 0), 0)
      .toFixed(2);
  };

  return (
    <div className="min-h-screen bg-gray-800 text-white">
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 py-1"></div>

      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-flex items-center justify-center mb-4">
            <Sparkles className="w-8 h-8 text-yellow-400 animate-pulse mr-2" />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Merge PDFs & Images
            </h1>
            <Sparkles className="w-8 h-8 text-yellow-400 animate-pulse ml-2" />
          </div>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Combine multiple PDFs and images into one document. Drag to reorder
            files before merging.
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
              Drop PDFs and images here
            </h3>
            <p className="text-gray-400 mb-6">
              or click the button below to browse
            </p>
            <button
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl inline-flex items-center"
              onClick={() => fileInputRef.current?.click()}
            >
              <Plus className="w-5 h-5 mr-2" />
              Select Files
            </button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,application/pdf"
              hidden
              onChange={handleFileSelect}
            />
            <p className="text-gray-400 text-sm mt-4">
              Supports: PDF, JPG, PNG, WebP, GIF
            </p>
          </div>
        </div>

        {/* Files List */}
        {files.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <Layers className="w-6 h-6 mr-2 text-blue-400" />
                <h2 className="text-2xl font-semibold">
                  Your Files{" "}
                  <span className="text-gray-400">
                    ({files.length} files, {getTotalPages()} pages,{" "}
                    {getTotalSize()} KB)
                  </span>
                </h2>
              </div>
              <button
                onClick={() => {
                  setFiles([]);
                  setMergedOutput(null);
                }}
                className="text-red-400 hover:text-red-300 transition-colors duration-200 flex items-center"
              >
                <Trash2 className="w-5 h-5 mr-1" />
                Clear All
              </button>
            </div>

            <div className="space-y-4">
              {files.map((file, index) => (
                <div
                  key={index}
                  className="relative group bg-gray-700 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-center p-4">
                    <div className="flex-shrink-0 mr-4">
                      {file.type === "image" ? (
                        <div className="relative">
                          <img
                            src={file.imageData}
                            alt={file.name}
                            className="w-20 h-20 object-cover rounded-lg"
                          />
                          <div className="absolute inset-0 bg-blue-600/20 rounded-lg flex items-center justify-center">
                            <FileImage className="w-8 h-8 text-white" />
                          </div>
                        </div>
                      ) : (
                        <div className="w-20 h-20 bg-red-600 rounded-lg flex items-center justify-center">
                          <FileText className="w-10 h-10 text-white" />
                        </div>
                      )}
                    </div>

                    <div className="flex-grow">
                      <h3 className="font-semibold text-white mb-1 truncate">
                        {file.name}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-gray-400">
                        <span className="flex items-center">
                          {file.type === "image" ? (
                            <>
                              <FileImage className="w-4 h-4 mr-1" />
                              Image
                            </>
                          ) : (
                            <>
                              <FileText className="w-4 h-4 mr-1" />
                              PDF ({file.pageCount} pages)
                            </>
                          )}
                        </span>
                        <span>{file.size} KB</span>
                        {file.type === "image" && (
                          <span>
                            {file.originalWidth}×{file.originalHeight}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => moveFile(index, "up")}
                        disabled={index === 0}
                        className="p-2 bg-gray-600 hover:bg-gray-500 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Move up"
                      >
                        <ArrowUpDown className="w-4 h-4 rotate-180" />
                      </button>
                      <button
                        onClick={() => moveFile(index, "down")}
                        disabled={index === files.length - 1}
                        className="p-2 bg-gray-600 hover:bg-gray-500 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Move down"
                      >
                        <ArrowUpDown className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => removeFile(index)}
                        className="p-2 bg-red-500 hover:bg-red-600 rounded-lg transition-colors"
                        title="Remove file"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Merge Button */}
        {files.length > 0 && (
          <div className="text-center mb-8">
            <button
              className={`bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white px-12 py-4 rounded-lg font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl inline-flex items-center ${
                isMerging ? "opacity-75 cursor-not-allowed" : ""
              }`}
              onClick={mergeToPDF}
              disabled={isMerging}
            >
              {isMerging ? (
                <>
                  <Loader2 className="w-6 h-6 mr-2 animate-spin" />
                  Merging... ({getTotalPages()} pages)
                </>
              ) : (
                <>
                  <Layers className="w-6 h-6 mr-2" />
                  Merge to PDF ({getTotalPages()} pages)
                </>
              )}
            </button>
          </div>
        )}

        {/* Download Section */}
        {mergedOutput && (
          <div className="text-center animate-fade-in">
            <div className="bg-gradient-to-r from-gray-700 to-gray-600 rounded-2xl p-8 shadow-2xl max-w-md mx-auto">
              <div className="flex justify-center mb-4">
                <div className="p-4 bg-green-600 rounded-full animate-bounce">
                  <Download className="w-12 h-12 text-white" />
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-2">PDF Ready!</h3>
              <p className="text-gray-300 mb-2">
                Your merged PDF has been created successfully
              </p>
              <p className="text-gray-400 text-sm mb-6">
                {getTotalPages()} pages combined from {files.length} files
              </p>
              <a
                href={mergedOutput}
                download="merged-document.pdf"
                className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl inline-flex items-center"
              >
                <Download className="w-5 h-5 mr-2" />
                Download Merged PDF
              </a>
              <button
                onClick={() => {
                  setMergedOutput(null);
                  setFiles([]);
                }}
                className="mt-4 text-gray-400 hover:text-white transition-colors duration-200 block mx-auto"
              >
                Merge Another Document
              </button>
            </div>
          </div>
        )}

        {/* Features Section */}
        {files.length === 0 && !isMerging && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            <div className="text-center p-6 bg-gray-700/50 rounded-xl hover:bg-gray-700 transition-all duration-300 transform hover:scale-105">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-blue-600 rounded-full">
                  <Layers className="w-8 h-8" />
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-2">Combine Files</h3>
              <p className="text-gray-400">
                Merge multiple PDFs and images into a single document
              </p>
            </div>
            <div className="text-center p-6 bg-gray-700/50 rounded-xl hover:bg-gray-700 transition-all duration-300 transform hover:scale-105">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-purple-600 rounded-full">
                  <ArrowUpDown className="w-8 h-8" />
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-2">Reorder Pages</h3>
              <p className="text-gray-400">
                Drag and arrange files in any order before merging
              </p>
            </div>
            <div className="text-center p-6 bg-gray-700/50 rounded-xl hover:bg-gray-700 transition-all duration-300 transform hover:scale-105">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-green-600 rounded-full">
                  <Download className="w-8 h-8" />
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-2">Export PDF</h3>
              <p className="text-gray-400">
                Download your merged PDF with all files combined
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

export default Merge;
