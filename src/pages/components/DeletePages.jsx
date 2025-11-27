import React, { useState, useRef } from "react";
import {
  Upload,
  Download,
  Loader2,
  Sparkles,
  FileText,
  Trash2,
  Eye,
  CheckCircle,
  List,
  Grid3X3,
} from "lucide-react";

// Import pdfjs-dist properly
import * as pdfjsLib from "pdfjs-dist/build/pdf";
import "pdfjs-dist/build/pdf.worker";

// Set up PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;

const DeletePages = () => {
  const [pdfFile, setPdfFile] = useState(null);
  const [pdfPages, setPdfPages] = useState([]);
  const [pdfName, setPdfName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedPages, setSelectedPages] = useState([]);
  const [viewMode, setViewMode] = useState("grid"); // "grid" or "list"
  const [processedPdf, setProcessedPdf] = useState(null);
  const fileInputRef = useRef(null);

  // Load PDF and extract pages
  const loadPdfPages = async (file) => {
    if (!file || file.type !== "application/pdf") {
      alert("Please select a valid PDF file");
      return;
    }

    setIsLoading(true);
    setPdfFile(file);
    setPdfName(file.name.replace(".pdf", ""));
    setSelectedPages([]);
    setProcessedPdf(null);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

      const pages = [];
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 1.5 });

        // Create canvas for the page
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        await page.render({
          canvasContext: context,
          viewport: viewport,
        }).promise;

        const displayScale = Math.min(1, 200 / viewport.width);

        pages.push({
          id: `page-${i}-${Date.now()}`,
          imageUrl: canvas.toDataURL("image/png"),
          originalPage: page,
          viewport: viewport,
          pageNumber: i,
          displayScale: displayScale,
          selected: false,
        });
      }

      setPdfPages(pages);
    } catch (error) {
      console.error("Error loading PDF:", error);
      alert("Error loading PDF. Please try again.");
    }

    setIsLoading(false);
  };

  // File handling
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files[0]) {
      loadPdfPages(files[0]);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      loadPdfPages(file);
    }
  };

  // Page selection handling
  const togglePageSelection = (pageId) => {
    setSelectedPages((prev) => {
      if (prev.includes(pageId)) {
        return prev.filter((id) => id !== pageId);
      } else {
        return [...prev, pageId];
      }
    });

    // Update the selected state in pdfPages for visual feedback
    setPdfPages((prev) =>
      prev.map((page) => ({
        ...page,
        selected: page.id === pageId ? !page.selected : page.selected,
      }))
    );
  };

  const selectAllPages = () => {
    const allPageIds = pdfPages.map((page) => page.id);
    setSelectedPages(allPageIds);
    setPdfPages((prev) => prev.map((page) => ({ ...page, selected: true })));
  };

  const clearSelection = () => {
    setSelectedPages([]);
    setPdfPages((prev) => prev.map((page) => ({ ...page, selected: false })));
  };

  const selectPageRange = (startIndex, endIndex) => {
    const pagesToSelect = pdfPages.slice(startIndex, endIndex + 1);
    const pageIds = pagesToSelect.map((page) => page.id);

    setSelectedPages((prev) => {
      const newSelection = [...prev];
      pageIds.forEach((id) => {
        if (!newSelection.includes(id)) {
          newSelection.push(id);
        }
      });
      return newSelection;
    });

    setPdfPages((prev) =>
      prev.map((page) => ({
        ...page,
        selected: pageIds.includes(page.id) ? true : page.selected,
      }))
    );
  };

  // Delete selected pages and create new PDF
  const deleteSelectedPages = async () => {
    if (selectedPages.length === 0) {
      alert("Please select at least one page to delete.");
      return;
    }

    if (selectedPages.length === pdfPages.length) {
      alert("Cannot delete all pages. Please keep at least one page.");
      return;
    }

    setIsLoading(true);

    try {
      const { jsPDF } = await import("jspdf");

      const pdf = new jsPDF();
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      // Filter out the pages that are NOT selected for deletion (keep these)
      const pagesToKeep = pdfPages.filter(
        (page) => !selectedPages.includes(page.id)
      );

      for (let i = 0; i < pagesToKeep.length; i++) {
        const page = pagesToKeep[i];

        if (i > 0) {
          pdf.addPage();
        }

        // Create temporary canvas for page rendering
        const tempCanvas = document.createElement("canvas");
        const tempCtx = tempCanvas.getContext("2d");
        tempCanvas.width = page.viewport.width;
        tempCanvas.height = page.viewport.height;

        // Load the page image
        const img = new Image();
        await new Promise((resolve) => {
          img.onload = resolve;
          img.src = page.imageUrl;
        });

        // Draw image to temporary canvas
        tempCtx.drawImage(img, 0, 0);

        const finalImage = tempCanvas.toDataURL("image/jpeg", 0.9);

        // Calculate dimensions for PDF
        const imgRatio = tempCanvas.width / tempCanvas.height;
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

        pdf.addImage(finalImage, "JPEG", x, y, width, height);
      }

      const pdfBlob = pdf.output("blob");
      setProcessedPdf(URL.createObjectURL(pdfBlob));
    } catch (error) {
      console.error("Error processing PDF:", error);
      alert("Error processing PDF. Please try again.");
    }

    setIsLoading(false);
  };

  // Reset everything
  const resetAll = () => {
    setPdfFile(null);
    setPdfPages([]);
    setPdfName("");
    setSelectedPages([]);
    setProcessedPdf(null);
  };

  // Quick selection helpers
  const selectOddPages = () => {
    const oddPages = pdfPages.filter((_, index) => index % 2 === 0);
    const oddPageIds = oddPages.map((page) => page.id);
    setSelectedPages(oddPageIds);
    setPdfPages((prev) =>
      prev.map((page) => ({
        ...page,
        selected: oddPageIds.includes(page.id),
      }))
    );
  };

  const selectEvenPages = () => {
    const evenPages = pdfPages.filter((_, index) => index % 2 === 1);
    const evenPageIds = evenPages.map((page) => page.id);
    setSelectedPages(evenPageIds);
    setPdfPages((prev) =>
      prev.map((page) => ({
        ...page,
        selected: evenPageIds.includes(page.id),
      }))
    );
  };

  const invertSelection = () => {
    const newSelectedPages = pdfPages
      .filter((page) => !selectedPages.includes(page.id))
      .map((page) => page.id);

    setSelectedPages(newSelectedPages);
    setPdfPages((prev) =>
      prev.map((page) => ({
        ...page,
        selected: newSelectedPages.includes(page.id),
      }))
    );
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 py-1"></div>

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center mb-4">
            <Sparkles className="w-8 h-8 text-yellow-400 animate-pulse mr-2" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Delete PDF Pages
            </h1>
            <Sparkles className="w-8 h-8 text-yellow-400 animate-pulse ml-2" />
          </div>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Remove unwanted pages from your PDF documents. Select pages to
            delete and download the cleaned version.
          </p>
        </div>

        {/* Upload Area */}
        {pdfPages.length === 0 && !isLoading && (
          <div
            className={`relative border-3 border-dashed rounded-2xl p-12 mb-8 transition-all duration-300 ${
              isDragging
                ? "border-blue-400 bg-blue-900/20 scale-105"
                : "border-gray-600 bg-gray-800/50 hover:border-gray-500"
            }`}
            onDrop={handleDrop}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              setIsDragging(false);
            }}
          >
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div
                  className={`p-4 rounded-full transition-all duration-300 ${
                    isDragging ? "scale-110 bg-blue-600" : "bg-gray-700"
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
                accept=".pdf,application/pdf"
                hidden
                onChange={handleFileSelect}
              />
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <Loader2 className="w-16 h-16 text-blue-400 animate-spin mx-auto mb-4" />
            <p className="text-xl text-gray-300">
              {processedPdf ? "Processing PDF..." : "Loading PDF..."}
            </p>
          </div>
        )}

        {/* PDF Editor */}
        {pdfPages.length > 0 && !isLoading && (
          <div className="space-y-6">
            {/* Header with File Info and Controls */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-gray-800 p-6 rounded-xl">
              <div className="flex items-center">
                <FileText className="w-6 h-6 mr-3 text-blue-400" />
                <div>
                  <h2 className="text-xl font-semibold">{pdfName}</h2>
                  <p className="text-gray-400">
                    {pdfPages.length} pages • {selectedPages.length} selected
                    for deletion
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                {/* View Mode Toggle */}
                <div className="flex bg-gray-700 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-2 rounded-md transition-colors ${
                      viewMode === "grid"
                        ? "bg-blue-600 text-white"
                        : "text-gray-300 hover:text-white"
                    }`}
                    title="Grid View"
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-2 rounded-md transition-colors ${
                      viewMode === "list"
                        ? "bg-blue-600 text-white"
                        : "text-gray-300 hover:text-white"
                    }`}
                    title="List View"
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>

                {/* Action Buttons */}
                <button
                  onClick={resetAll}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  New PDF
                </button>

                {!processedPdf && (
                  <button
                    onClick={deleteSelectedPages}
                    disabled={selectedPages.length === 0}
                    className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-600 text-white rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center disabled:transform-none"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Selected ({selectedPages.length})
                  </button>
                )}
              </div>
            </div>

            {/* Selection Controls */}
            <div className="bg-gray-800 p-4 rounded-xl">
              <div className="flex flex-wrap gap-3 items-center justify-between">
                <div className="flex flex-wrap gap-2">
                  <span className="text-sm text-gray-300 font-medium">
                    Quick Select:
                  </span>
                  <button
                    onClick={selectAllPages}
                    className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors"
                  >
                    Select All
                  </button>
                  <button
                    onClick={clearSelection}
                    className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm transition-colors"
                  >
                    Clear All
                  </button>
                  <button
                    onClick={selectOddPages}
                    className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm transition-colors"
                  >
                    Odd Pages
                  </button>
                  <button
                    onClick={selectEvenPages}
                    className="px-3 py-1 bg-orange-600 hover:bg-orange-700 text-white rounded text-sm transition-colors"
                  >
                    Even Pages
                  </button>
                  <button
                    onClick={invertSelection}
                    className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm transition-colors"
                  >
                    Invert Selection
                  </button>
                </div>

                <div className="text-sm text-gray-300">
                  <span className="font-medium">
                    {pdfPages.length - selectedPages.length} pages will remain
                  </span>
                  {selectedPages.length > 0 && (
                    <span className="text-red-400 ml-2">
                      ({selectedPages.length} pages will be deleted)
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Pages Display */}
            {viewMode === "grid" ? (
              // Grid View
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {pdfPages.map((page) => (
                  <div
                    key={page.id}
                    className={`relative group bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border-2 cursor-pointer ${
                      page.selected
                        ? "border-red-500 bg-red-900/20"
                        : "border-transparent hover:border-gray-500"
                    }`}
                    onClick={() => togglePageSelection(page.id)}
                  >
                    {/* Selection Indicator */}
                    {page.selected && (
                      <div className="absolute top-3 right-3 z-10">
                        <div className="bg-red-500 text-white p-1 rounded-full">
                          <Trash2 className="w-4 h-4" />
                        </div>
                      </div>
                    )}

                    {/* Page Number */}
                    <div className="absolute top-3 left-3 z-10 bg-black/70 px-2 py-1 rounded text-sm font-medium">
                      Page {page.pageNumber}
                    </div>

                    {/* Page Image */}
                    <div className="flex items-center justify-center bg-white h-48 overflow-hidden">
                      <img
                        src={page.imageUrl}
                        alt={`Page ${page.pageNumber}`}
                        className="max-w-full max-h-48 object-contain"
                        style={{
                          transform: `scale(${page.displayScale})`,
                          transformOrigin: "center",
                        }}
                      />
                    </div>

                    {/* Page Info */}
                    <div className="p-4">
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-sm font-medium ${
                            page.selected ? "text-red-400" : "text-gray-300"
                          }`}
                        >
                          {page.selected
                            ? "Selected for deletion"
                            : "Click to select"}
                        </span>
                        {page.selected && (
                          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              // List View
              <div className="space-y-3">
                {pdfPages.map((page, index) => (
                  <div
                    key={page.id}
                    className={`flex items-center gap-4 p-4 rounded-xl transition-all duration-300 cursor-pointer ${
                      page.selected
                        ? "bg-red-900/30 border-2 border-red-500"
                        : "bg-gray-800 hover:bg-gray-700 border-2 border-transparent"
                    }`}
                    onClick={() => togglePageSelection(page.id)}
                  >
                    {/* Selection Checkbox */}
                    <div className="flex-shrink-0">
                      <div
                        className={`w-6 h-6 rounded border-2 flex items-center justify-center ${
                          page.selected
                            ? "bg-red-500 border-red-500"
                            : "border-gray-500"
                        }`}
                      >
                        {page.selected && (
                          <CheckCircle className="w-4 h-4 text-white" />
                        )}
                      </div>
                    </div>

                    {/* Page Thumbnail */}
                    <div className="flex-shrink-0">
                      <img
                        src={page.imageUrl}
                        alt={`Page ${page.pageNumber}`}
                        className="w-16 h-20 object-cover rounded border border-gray-600"
                      />
                    </div>

                    {/* Page Info */}
                    <div className="flex-grow">
                      <h3 className="font-semibold">Page {page.pageNumber}</h3>
                      <p
                        className={`text-sm ${
                          page.selected ? "text-red-400" : "text-gray-400"
                        }`}
                      >
                        {page.selected
                          ? "Marked for deletion"
                          : "Click to mark for deletion"}
                      </p>
                    </div>

                    {/* Quick Actions */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          // Quick range selection
                          if (e.shiftKey && selectedPages.length > 0) {
                            const lastSelectedIndex = pdfPages.findIndex(
                              (p) =>
                                p.id === selectedPages[selectedPages.length - 1]
                            );
                            const currentIndex = index;
                            const start = Math.min(
                              lastSelectedIndex,
                              currentIndex
                            );
                            const end = Math.max(
                              lastSelectedIndex,
                              currentIndex
                            );
                            selectPageRange(start, end);
                          } else {
                            togglePageSelection(page.id);
                          }
                        }}
                        className={`px-3 py-1 rounded text-sm transition-colors ${
                          page.selected
                            ? "bg-red-600 hover:bg-red-700 text-white"
                            : "bg-gray-700 hover:bg-gray-600 text-gray-300"
                        }`}
                      >
                        {page.selected ? "Deselect" : "Select"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Download Section */}
            {processedPdf && (
              <div className="text-center animate-fade-in">
                <div className="bg-gradient-to-r from-gray-800 to-gray-700 rounded-2xl p-8 shadow-2xl max-w-md mx-auto">
                  <div className="flex justify-center mb-4">
                    <div className="p-4 bg-green-600 rounded-full animate-bounce">
                      <Download className="w-12 h-12 text-white" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold mb-2">PDF Ready!</h3>
                  <p className="text-gray-300 mb-2">
                    Your modified PDF has been created successfully
                  </p>
                  <p className="text-gray-400 text-sm mb-6">
                    {pdfPages.length - selectedPages.length} pages remaining
                    <br />
                    {selectedPages.length} pages deleted
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <a
                      href={processedPdf}
                      download={`${pdfName}_cleaned.pdf`}
                      className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl inline-flex items-center justify-center"
                    >
                      <Download className="w-5 h-5 mr-2" />
                      Download Cleaned PDF
                    </a>
                    <button
                      onClick={resetAll}
                      className="bg-gray-600 hover:bg-gray-500 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 inline-flex items-center justify-center"
                    >
                      <FileText className="w-5 h-5 mr-2" />
                      Process Another
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Features Section */}
        {pdfPages.length === 0 && !isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            <div className="text-center p-6 bg-gray-800/50 rounded-xl hover:bg-gray-800 transition-all duration-300 transform hover:scale-105">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-red-600 rounded-full">
                  <Trash2 className="w-8 h-8" />
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-2">Select & Delete</h3>
              <p className="text-gray-400">
                Choose specific pages to remove from your PDF document
              </p>
            </div>
            <div className="text-center p-6 bg-gray-800/50 rounded-xl hover:bg-gray-800 transition-all duration-300 transform hover:scale-105">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-blue-600 rounded-full">
                  <Eye className="w-8 h-8" />
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-2">Visual Preview</h3>
              <p className="text-gray-400">
                See all pages clearly before making deletion decisions
              </p>
            </div>
            <div className="text-center p-6 bg-gray-800/50 rounded-xl hover:bg-gray-800 transition-all duration-300 transform hover:scale-105">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-green-600 rounded-full">
                  <Download className="w-8 h-8" />
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-2">Instant Download</h3>
              <p className="text-gray-400">
                Get your cleaned PDF immediately after processing
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

export default DeletePages;
