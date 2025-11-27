import React, { useState, useRef } from "react";
import { jsPDF } from "jspdf";
import {
  Upload,
  X,
  Download,
  Loader2,
  Sparkles,
  Scissors,
  Trash2,
  FileText,
  Copy,
  Split,
  Filter,
} from "lucide-react";

const SplitPdfC = () => {
  const [file, setFile] = useState(null);
  const [splitOutputs, setSplitOutputs] = useState([]);
  const [isSplitting, setIsSplitting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [splitMode, setSplitMode] = useState("all"); // "all", "range", "custom"
  const [pageRanges, setPageRanges] = useState("");
  const [selectedPages, setSelectedPages] = useState([]);
  const fileInputRef = useRef(null);

  // Load PDF.js dynamically
  const loadPdfJs = async () => {
    if (window.pdfjsLib) {
      return window.pdfjsLib;
    }

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

  const processPDFFile = async (file) => {
    try {
      const pdfjsLib = await loadPdfJs();
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

      return {
        type: "pdf",
        name: file.name,
        pageCount: pdf.numPages,
        pdfDoc: pdf,
        size: (file.size / 1024).toFixed(2),
      };
    } catch (error) {
      console.error("Error processing PDF:", error);
      alert(`Error processing PDF "${file.name}": ${error.message}`);
      return null;
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const fileList = Array.from(e.dataTransfer.files);
    const pdfFile = fileList.find((file) => file.type === "application/pdf");

    if (pdfFile) {
      handleFileProcessing(pdfFile);
    } else {
      alert("Please drop a PDF file.");
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
    const pdfFile = fileList.find((file) => file.type === "application/pdf");

    if (pdfFile) {
      handleFileProcessing(pdfFile);
    }
    e.target.value = "";
  };

  const handleFileProcessing = async (pdfFile) => {
    setIsSplitting(true);
    const processedPDF = await processPDFFile(pdfFile);
    if (processedPDF) {
      setFile(processedPDF);
      // Initialize all pages as selected for custom mode
      setSelectedPages(
        Array.from({ length: processedPDF.pageCount }, (_, i) => i + 1)
      );
    }
    setIsSplitting(false);
  };

  const removeFile = () => {
    setFile(null);
    setSplitOutputs([]);
    setPageRanges("");
    setSelectedPages([]);
  };

  const togglePageSelection = (pageNumber) => {
    setSelectedPages((prev) =>
      prev.includes(pageNumber)
        ? prev.filter((p) => p !== pageNumber)
        : [...prev, pageNumber].sort((a, b) => a - b)
    );
  };

  const selectAllPages = () => {
    if (file) {
      setSelectedPages(Array.from({ length: file.pageCount }, (_, i) => i + 1));
    }
  };

  const clearSelection = () => {
    setSelectedPages([]);
  };

  const splitPDF = async () => {
    if (!file) return;

    setIsSplitting(true);
    setSplitOutputs([]);

    try {
      let pagesToSplit = [];

      if (splitMode === "all") {
        // Split all pages into individual PDFs
        pagesToSplit = Array.from({ length: file.pageCount }, (_, i) => [
          i + 1,
        ]);
      } else if (splitMode === "range" && pageRanges.trim()) {
        // Split by page ranges
        const ranges = pageRanges.split(",").map((range) => range.trim());
        for (const range of ranges) {
          if (range.includes("-")) {
            const [start, end] = range.split("-").map((num) => parseInt(num));
            if (!isNaN(start) && !isNaN(end) && start <= end) {
              pagesToSplit.push(
                Array.from({ length: end - start + 1 }, (_, i) => start + i)
              );
            }
          } else {
            const page = parseInt(range);
            if (!isNaN(page)) {
              pagesToSplit.push([page]);
            }
          }
        }
      } else if (splitMode === "custom" && selectedPages.length > 0) {
        // Split selected individual pages
        pagesToSplit = selectedPages.map((page) => [page]);
      } else {
        alert("Please specify pages to split.");
        setIsSplitting(false);
        return;
      }

      const outputs = [];

      for (const pageGroup of pagesToSplit) {
        const pdf = new jsPDF();
        let isFirstPage = true;

        for (const pageNumber of pageGroup) {
          if (pageNumber < 1 || pageNumber > file.pageCount) continue;

          if (!isFirstPage) {
            pdf.addPage();
          }
          isFirstPage = false;

          const page = await file.pdfDoc.getPage(pageNumber);
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

          const pdfWidth = pdf.internal.pageSize.getWidth();
          const pdfHeight = pdf.internal.pageSize.getHeight();

          const imgRatio = viewport.width / viewport.height;
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

          pdf.addImage(imageData, "JPEG", x, y, width, height);

          // Add watermark
          pdf.setFontSize(10);
          pdf.setTextColor(150, 150, 150);
          const watermarkText = "PDF MAKER";
          const textWidth = pdf.getTextWidth(watermarkText);
          const watermarkX = pdfWidth - textWidth - 10;
          const watermarkY = pdfHeight - 10;
          pdf.text(watermarkText, watermarkX, watermarkY);
        }

        const pdfBlob = pdf.output("blob");
        const outputName =
          pageGroup.length === 1
            ? `page-${pageGroup[0]}.pdf`
            : `pages-${pageGroup[0]}-${pageGroup[pageGroup.length - 1]}.pdf`;

        outputs.push({
          url: URL.createObjectURL(pdfBlob),
          name: outputName,
          pages: pageGroup,
          size: (pdfBlob.size / 1024).toFixed(2),
        });
      }

      setSplitOutputs(outputs);
    } catch (error) {
      console.error("Error splitting PDF:", error);
      alert("Error splitting PDF. Please try again.");
    } finally {
      setIsSplitting(false);
    }
  };

  const downloadAll = () => {
    splitOutputs.forEach((output) => {
      const link = document.createElement("a");
      link.href = output.url;
      link.download = output.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  };

  return (
    <div className="min-h-screen bg-gray-800 text-white">
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 py-1"></div>

      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-flex items-center justify-center mb-4">
            <Sparkles className="w-8 h-8 text-yellow-400 animate-pulse mr-2" />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Split PDF
            </h1>
            <Sparkles className="w-8 h-8 text-yellow-400 animate-pulse ml-2" />
          </div>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Split PDF by page ranges or extract every page into separate
            documents. Choose specific pages or ranges to create new PDF files.
          </p>
        </div>

        {/* Upload Area */}
        {!file && (
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
            </div>
          </div>
        )}

        {/* File Info and Split Options */}
        {file && (
          <div className="max-w-4xl mx-auto space-y-8">
            {/* File Info */}
            <div className="bg-gray-700/50 rounded-2xl p-6 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <FileText className="w-6 h-6 mr-3 text-blue-400" />
                  <div>
                    <h3 className="text-xl font-semibold">{file.name}</h3>
                    <p className="text-gray-400 text-sm">
                      {file.pageCount} pages • {file.size} KB
                    </p>
                  </div>
                </div>
                <button
                  onClick={removeFile}
                  className="text-red-400 hover:text-red-300 transition-colors duration-200"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Split Options */}
            <div className="bg-gray-700/50 rounded-2xl p-6 shadow-xl">
              <h3 className="text-xl font-semibold mb-6 flex items-center">
                <Scissors className="w-5 h-5 mr-2 text-purple-400" />
                Split Options
              </h3>

              <div className="space-y-6">
                {/* Split Mode Selection */}
                <div>
                  <label className="block text-lg font-semibold mb-3">
                    How do you want to split?
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                      {
                        value: "all",
                        label: "All Pages",
                        desc: "Extract every page as separate PDF",
                      },
                      {
                        value: "range",
                        label: "Page Ranges",
                        desc: "Split by specific ranges (e.g., 1-3, 5, 7-9)",
                      },
                      {
                        value: "custom",
                        label: "Custom Selection",
                        desc: "Choose individual pages to extract",
                      },
                    ].map((mode) => (
                      <label
                        key={mode.value}
                        className={`flex flex-col p-4 rounded-lg cursor-pointer transition-all duration-300 ${
                          splitMode === mode.value
                            ? "bg-purple-600/30 border-2 border-purple-500"
                            : "bg-gray-600/50 border-2 border-transparent hover:bg-gray-600"
                        }`}
                      >
                        <input
                          type="radio"
                          name="splitMode"
                          value={mode.value}
                          checked={splitMode === mode.value}
                          onChange={(e) => setSplitMode(e.target.value)}
                          className="mb-2"
                        />
                        <span className="font-semibold mb-1">{mode.label}</span>
                        <span className="text-gray-400 text-sm">
                          {mode.desc}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Page Range Input */}
                {splitMode === "range" && (
                  <div>
                    <label className="block text-lg font-semibold mb-2">
                      Page Ranges
                    </label>
                    <input
                      type="text"
                      value={pageRanges}
                      onChange={(e) => setPageRanges(e.target.value)}
                      placeholder="e.g., 1-3, 5, 7-9"
                      className="w-full px-4 py-3 bg-gray-600 border border-gray-500 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                    />
                    <p className="text-gray-400 text-sm mt-2">
                      Enter page ranges separated by commas. Example: 1-3, 5,
                      7-9
                    </p>
                  </div>
                )}

                {/* Custom Page Selection */}
                {splitMode === "custom" && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="block text-lg font-semibold">
                        Select Pages
                      </label>
                      <div className="flex gap-2">
                        <button
                          onClick={selectAllPages}
                          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm transition-colors"
                        >
                          Select All
                        </button>
                        <button
                          onClick={clearSelection}
                          className="px-3 py-1 bg-gray-600 hover:bg-gray-700 rounded text-sm transition-colors"
                        >
                          Clear
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2 max-h-60 overflow-y-auto p-2">
                      {Array.from(
                        { length: file.pageCount },
                        (_, i) => i + 1
                      ).map((pageNumber) => (
                        <button
                          key={pageNumber}
                          onClick={() => togglePageSelection(pageNumber)}
                          className={`p-3 rounded-lg transition-all duration-200 ${
                            selectedPages.includes(pageNumber)
                              ? "bg-purple-600 text-white shadow-lg transform scale-105"
                              : "bg-gray-600 hover:bg-gray-500"
                          }`}
                        >
                          {pageNumber}
                        </button>
                      ))}
                    </div>
                    <p className="text-gray-400 text-sm mt-2">
                      Selected: {selectedPages.length} pages
                    </p>
                  </div>
                )}
              </div>

              {/* Split Button */}
              <button
                onClick={splitPDF}
                disabled={
                  isSplitting ||
                  (splitMode === "custom" && selectedPages.length === 0) ||
                  (splitMode === "range" && !pageRanges.trim())
                }
                className={`w-full mt-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-4 rounded-lg font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl inline-flex items-center justify-center ${
                  isSplitting ||
                  (splitMode === "custom" && selectedPages.length === 0) ||
                  (splitMode === "range" && !pageRanges.trim())
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
              >
                {isSplitting ? (
                  <>
                    <Loader2 className="w-6 h-6 mr-2 animate-spin" />
                    Splitting PDF...
                  </>
                ) : (
                  <>
                    <Scissors className="w-6 h-6 mr-2" />
                    Split PDF
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Results */}
        {splitOutputs.length > 0 && (
          <div className="max-w-4xl mx-auto animate-fade-in">
            <div className="bg-gradient-to-r from-gray-700 to-gray-600 rounded-2xl p-8 shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <Split className="w-8 h-8 mr-3 text-green-400" />
                  <div>
                    <h3 className="text-2xl font-bold">Split Successful!</h3>
                  </div>
                </div>
                {splitOutputs.length > 1 && (
                  <button
                    onClick={downloadAll}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors duration-200 inline-flex items-center"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download All
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                {splitOutputs.map((output, index) => (
                  <div
                    key={index}
                    className="bg-gray-800/50 rounded-xl p-4 hover:bg-gray-800 transition-all duration-300"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-white truncate mb-1">
                          {output.name}
                        </h4>
                        <p className="text-gray-400 text-sm">
                          Pages: {output.pages.join(", ")} • {output.size} KB
                        </p>
                      </div>
                      <a
                        href={output.url}
                        download={output.name}
                        className="ml-4 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg transition-colors duration-200 inline-flex items-center"
                      >
                        <Download className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Features Section */}
        {!file && !isSplitting && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            <div className="text-center p-6 bg-gray-700/50 rounded-xl hover:bg-gray-700 transition-all duration-300 transform hover:scale-105">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-purple-600 rounded-full">
                  <Scissors className="w-8 h-8" />
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-2">Split by Pages</h3>
              <p className="text-gray-400">
                Extract specific pages or ranges into separate PDF files
              </p>
            </div>
            <div className="text-center p-6 bg-gray-700/50 rounded-xl hover:bg-gray-700 transition-all duration-300 transform hover:scale-105">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-blue-600 rounded-full">
                  <Filter className="w-8 h-8" />
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-2">Custom Selection</h3>
              <p className="text-gray-400">
                Choose individual pages or multiple ranges to extract
              </p>
            </div>
            <div className="text-center p-6 bg-gray-700/50 rounded-xl hover:bg-gray-700 transition-all duration-300 transform hover:scale-105">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-green-600 rounded-full">
                  <Download className="w-8 h-8" />
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-2">Batch Download</h3>
              <p className="text-gray-400">
                Download all split PDFs at once or individually
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

export default SplitPdfC;
