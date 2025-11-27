import React, { useState, useRef, useEffect } from "react";
import {
  Upload,
  Download,
  Loader2,
  Sparkles,
  FileText,
  Trash2,
  Type,
  Image as ImageIcon,
  ZoomIn,
  ZoomOut,
  Maximize,
  Minimize,
  Move,
  PenTool,
  Calendar,
  CheckSquare,
} from "lucide-react";

// Import pdfjs-dist properly
import * as pdfjsLib from "pdfjs-dist/build/pdf";
import "pdfjs-dist/build/pdf.worker";

// Set up PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;

const FillAndSign = () => {
  const [pdfFile, setPdfFile] = useState(null);
  const [pdfPages, setPdfPages] = useState([]);
  const [pdfName, setPdfName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedPage, setSelectedPage] = useState(null);
  const [activeAnnotation, setActiveAnnotation] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [viewMode, setViewMode] = useState("grid");
  const [activeTool, setActiveTool] = useState("select");
  const [signatureMode, setSignatureMode] = useState("draw"); // "draw", "type", "image"
  const [signatureData, setSignatureData] = useState("");
  const [drawing, setDrawing] = useState(false);
  const [drawingPoints, setDrawingPoints] = useState([]);
  const [textInput, setTextInput] = useState("");

  const fileInputRef = useRef(null);
  const signatureCanvasRef = useRef(null);
  const canvasContainerRef = useRef(null);
  const fileInputRef2 = useRef(null);

  // Calculate optimal zoom to fit page in container
  const calculateFitZoom = (
    pageWidth,
    pageHeight,
    containerWidth,
    containerHeight
  ) => {
    const widthRatio = (containerWidth - 80) / pageWidth;
    const heightRatio = (containerHeight - 80) / pageHeight;
    return Math.min(widthRatio, heightRatio, 1.5);
  };

  // Load PDF and extract pages
  const loadPdfPages = async (file) => {
    if (!file || file.type !== "application/pdf") {
      alert("Please select a valid PDF file");
      return;
    }

    setIsLoading(true);
    setPdfFile(file);
    setPdfName(file.name.replace(".pdf", ""));

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

      const pages = [];
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 2.0 });

        // Create canvas for the page
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        await page.render({
          canvasContext: context,
          viewport: viewport,
        }).promise;

        const displayScale = Math.min(1, 300 / viewport.width);

        pages.push({
          id: `page-${Date.now()}-${i}`,
          imageUrl: canvas.toDataURL("image/png"),
          originalPage: page,
          viewport: viewport,
          pageNumber: i,
          annotations: [],
          formFields: [],
          rotation: 0,
          displayScale: displayScale,
        });
      }

      setPdfPages(pages);
      if (pages.length > 0) {
        setSelectedPage(pages[0].id);
      }
    } catch (error) {
      console.error("Error loading PDF:", error);
      alert("Error loading PDF. Please try again.");
    }

    setIsLoading(false);
  };

  // Handle opening page in single view
  const openPageInSingleView = (pageId) => {
    setSelectedPage(pageId);
    setViewMode("single");

    setTimeout(() => {
      const container = canvasContainerRef.current;
      const page = pdfPages.find((p) => p.id === pageId);
      if (container && page) {
        const fitZoom = calculateFitZoom(
          page.viewport.width,
          page.viewport.height,
          container.clientWidth,
          container.clientHeight
        );
        setZoom(fitZoom);
      }
    }, 100);
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

  // Signature functionality
  const startDrawing = (e) => {
    if (activeTool !== "signature" || signatureMode !== "draw") return;

    const rect = e.currentTarget.getBoundingClientRect();
    const scale = zoom;
    const x = (e.clientX - rect.left) / scale;
    const y = (e.clientY - rect.top) / scale;

    setDrawing(true);
    setDrawingPoints([{ x, y }]);
  };

  const draw = (e) => {
    if (!drawing || activeTool !== "signature" || signatureMode !== "draw")
      return;

    const rect = e.currentTarget.getBoundingClientRect();
    const scale = zoom;
    const x = (e.clientX - rect.left) / scale;
    const y = (e.clientY - rect.top) / scale;

    setDrawingPoints((prev) => [...prev, { x, y }]);
  };

  const stopDrawing = (pageId) => {
    if (!drawing || drawingPoints.length < 2) {
      setDrawing(false);
      setDrawingPoints([]);
      return;
    }

    // Create signature annotation from drawing points
    const newAnnotation = {
      id: `signature-${Date.now()}`,
      type: "signature",
      points: [...drawingPoints],
      x: Math.min(...drawingPoints.map((p) => p.x)),
      y: Math.min(...drawingPoints.map((p) => p.y)),
      width:
        Math.max(...drawingPoints.map((p) => p.x)) -
        Math.min(...drawingPoints.map((p) => p.x)),
      height:
        Math.max(...drawingPoints.map((p) => p.y)) -
        Math.min(...drawingPoints.map((p) => p.y)),
      color: "#000000",
    };

    setPdfPages((prev) =>
      prev.map((page) =>
        page.id === pageId
          ? {
              ...page,
              annotations: [...page.annotations, newAnnotation],
            }
          : page
      )
    );

    setDrawing(false);
    setDrawingPoints([]);
  };

  // Text annotations for forms
  const addTextAnnotation = (pageId, x = 100, y = 100, fieldType = "text") => {
    if (!textInput.trim() && fieldType !== "checkbox") return;

    const newAnnotation = {
      id: `${fieldType}-${Date.now()}`,
      type: fieldType,
      text: textInput,
      x: x,
      y: y,
      fontSize: 14,
      color: "#000000",
      fontFamily: "Arial, sans-serif",
      fieldName: `field_${Date.now()}`,
      value: fieldType === "checkbox" ? false : textInput,
      required: false,
    };

    setPdfPages((prev) =>
      prev.map((page) =>
        page.id === pageId
          ? {
              ...page,
              annotations: [...page.annotations, newAnnotation],
            }
          : page
      )
    );

    setTextInput("");
  };

  // Typed signature
  const addTypedSignature = (pageId, x = 100, y = 100) => {
    if (!signatureData.trim()) return;

    const newAnnotation = {
      id: `signature-typed-${Date.now()}`,
      type: "signature",
      text: signatureData,
      x: x,
      y: y,
      fontSize: 24,
      color: "#000000",
      fontFamily: "cursive, sans-serif",
      isTyped: true,
    };

    setPdfPages((prev) =>
      prev.map((page) =>
        page.id === pageId
          ? {
              ...page,
              annotations: [...page.annotations, newAnnotation],
            }
          : page
      )
    );

    setSignatureData("");
  };

  // Image signature
  const addImageSignature = async (pageId, file) => {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const newAnnotation = {
          id: `signature-image-${Date.now()}`,
          type: "signature",
          x: 100,
          y: 100,
          width: Math.min(img.width / 3, 200),
          height: Math.min(img.height / 3, 80),
          src: e.target.result,
          isImage: true,
        };

        setPdfPages((prev) =>
          prev.map((page) =>
            page.id === pageId
              ? {
                  ...page,
                  annotations: [...page.annotations, newAnnotation],
                }
              : page
          )
        );
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  };

  // Update annotation position
  const updateAnnotationPosition = (pageId, annotationId, newX, newY) => {
    setPdfPages((prev) =>
      prev.map((page) =>
        page.id === pageId
          ? {
              ...page,
              annotations: page.annotations.map((ann) =>
                ann.id === annotationId ? { ...ann, x: newX, y: newY } : ann
              ),
            }
          : page
      )
    );
  };

  // Update annotation value (for form fields)
  const updateAnnotationValue = (pageId, annotationId, newValue) => {
    setPdfPages((prev) =>
      prev.map((page) =>
        page.id === pageId
          ? {
              ...page,
              annotations: page.annotations.map((ann) =>
                ann.id === annotationId ? { ...ann, value: newValue } : ann
              ),
            }
          : page
      )
    );
  };

  // Remove annotation
  const removeAnnotation = (pageId, annotationId) => {
    setPdfPages((prev) =>
      prev.map((page) =>
        page.id === pageId
          ? {
              ...page,
              annotations: page.annotations.filter(
                (a) => a.id !== annotationId
              ),
            }
          : page
      )
    );
    setActiveAnnotation(null);
  };

  // Canvas click handler for precise placement
  const handleCanvasClick = (e, pageId) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const scale = zoom;
    const x = (e.clientX - rect.left) / scale;
    const y = (e.clientY - rect.top) / scale;

    if (activeTool === "text") {
      addTextAnnotation(pageId, x, y, "text");
    } else if (activeTool === "signature" && signatureMode === "type") {
      addTypedSignature(pageId, x, y);
    } else if (activeTool === "date") {
      addTextAnnotation(pageId, x, y, "date");
    } else if (activeTool === "checkbox") {
      addTextAnnotation(pageId, x, y, "checkbox");
    }
  };

  // Fit to screen function
  const fitToScreen = () => {
    const container = canvasContainerRef.current;
    const currentPage = pdfPages.find((page) => page.id === selectedPage);

    if (container && currentPage) {
      const fitZoom = calculateFitZoom(
        currentPage.viewport.width,
        currentPage.viewport.height,
        container.clientWidth,
        container.clientHeight
      );
      setZoom(fitZoom);
    }
  };

  // Annotation dragging
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!activeAnnotation) return;

      const page = pdfPages.find((p) =>
        p.annotations.some((ann) => ann.id === activeAnnotation)
      );

      if (page) {
        const annotation = page.annotations.find(
          (ann) => ann.id === activeAnnotation
        );
        if (annotation) {
          updateAnnotationPosition(
            page.id,
            activeAnnotation,
            annotation.x + e.movementX / zoom,
            annotation.y + e.movementY / zoom
          );
        }
      }
    };

    const handleMouseUp = () => {
      setActiveAnnotation(null);
    };

    if (activeAnnotation) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [activeAnnotation, pdfPages, zoom]);

  // Clear signature drawing
  const clearSignature = () => {
    setDrawingPoints([]);
    setSignatureData("");
  };

  // Save signature for reuse
  const saveSignature = () => {
    if (drawingPoints.length > 1) {
      const signature = {
        type: "drawn",
        points: drawingPoints,
        timestamp: Date.now(),
      };
      localStorage.setItem("savedSignature", JSON.stringify(signature));
      alert("Signature saved successfully!");
    } else if (signatureData.trim()) {
      const signature = {
        type: "typed",
        text: signatureData,
        timestamp: Date.now(),
      };
      localStorage.setItem("savedSignature", JSON.stringify(signature));
      alert("Signature saved successfully!");
    }
  };

  // Load saved signature
  const loadSavedSignature = () => {
    const saved = localStorage.getItem("savedSignature");
    if (saved) {
      const signature = JSON.parse(saved);
      if (signature.type === "drawn") {
        setDrawingPoints(signature.points);
        setSignatureMode("draw");
      } else if (signature.type === "typed") {
        setSignatureData(signature.text);
        setSignatureMode("type");
      }
    }
  };

  // Download edited PDF
  const downloadEditedPdf = async () => {
    if (pdfPages.length === 0) return;

    setIsLoading(true);

    try {
      const { jsPDF } = await import("jspdf");

      const pdf = new jsPDF();
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      for (let i = 0; i < pdfPages.length; i++) {
        const page = pdfPages[i];

        if (i > 0) {
          pdf.addPage();
        }

        // Create temporary canvas for final page rendering
        const tempCanvas = document.createElement("canvas");
        const tempCtx = tempCanvas.getContext("2d");

        // Set canvas size
        tempCanvas.width = page.viewport.width;
        tempCanvas.height = page.viewport.height;

        // Load the base page image
        const img = new Image();
        await new Promise((resolve) => {
          img.onload = resolve;
          img.src = page.imageUrl;
        });

        // Draw base image
        tempCtx.drawImage(img, 0, 0);

        // Apply rotation
        if (page.rotation !== 0) {
          tempCtx.save();
          tempCtx.translate(tempCanvas.width / 2, tempCanvas.height / 2);
          tempCtx.rotate((page.rotation * Math.PI) / 180);
          tempCtx.drawImage(img, -img.width / 2, -img.height / 2);
          tempCtx.restore();
        }

        // Add annotations
        page.annotations.forEach((annotation) => {
          if (annotation.type === "signature") {
            if (annotation.points) {
              // Drawn signature
              tempCtx.strokeStyle = annotation.color;
              tempCtx.lineWidth = 2;
              tempCtx.lineCap = "round";
              tempCtx.lineJoin = "round";
              tempCtx.beginPath();
              annotation.points.forEach((point, index) => {
                if (index === 0) {
                  tempCtx.moveTo(point.x, point.y);
                } else {
                  tempCtx.lineTo(point.x, point.y);
                }
              });
              tempCtx.stroke();
            } else if (annotation.isTyped) {
              // Typed signature
              tempCtx.font = `${annotation.fontSize}px ${annotation.fontFamily}`;
              tempCtx.fillStyle = annotation.color;
              tempCtx.fillText(annotation.text, annotation.x, annotation.y);
            } else if (annotation.isImage) {
              // Image signature
              const img = new Image();
              img.src = annotation.src;
              tempCtx.drawImage(
                img,
                annotation.x,
                annotation.y,
                annotation.width,
                annotation.height
              );
            }
          } else if (annotation.type === "text" || annotation.type === "date") {
            // Text field
            tempCtx.font = `${annotation.fontSize}px ${annotation.fontFamily}`;
            tempCtx.fillStyle = annotation.color;
            tempCtx.fillText(
              annotation.value || annotation.text,
              annotation.x,
              annotation.y
            );
          } else if (annotation.type === "checkbox") {
            // Checkbox
            tempCtx.strokeStyle = annotation.color;
            tempCtx.lineWidth = 2;
            tempCtx.strokeRect(annotation.x, annotation.y - 14, 14, 14);
            if (annotation.value) {
              tempCtx.fillStyle = annotation.color;
              tempCtx.fillRect(annotation.x + 3, annotation.y - 11, 8, 8);
            }
          }
        });

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

      pdf.save(`${pdfName}_signed.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Error generating PDF. Please try again.");
    }

    setIsLoading(false);
  };

  // Get current page for single view
  const currentPage = pdfPages.find((page) => page.id === selectedPage);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 py-1"></div>

      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center mb-3">
            <Sparkles className="w-8 h-8 text-yellow-400 animate-pulse mr-2" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Fill & Sign PDF
            </h1>
            <Sparkles className="w-8 h-8 text-yellow-400 animate-pulse ml-2" />
          </div>
          <p className="text-gray-300">
            Add signatures, fill forms, and annotate your PDF documents
          </p>
        </div>

        {/* Upload Area */}
        {pdfPages.length === 0 && (
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
            <p className="text-xl text-gray-300">Processing PDF...</p>
          </div>
        )}

        {/* PDF Editor */}
        {pdfPages.length > 0 && !isLoading && (
          <div className="space-y-6">
            {/* Main Toolbar */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-gray-800 p-4 rounded-lg">
              <div className="flex items-center">
                <FileText className="w-6 h-6 mr-2 text-blue-400" />
                <h2 className="text-xl font-semibold">
                  {pdfName}
                  <span className="text-gray-400 ml-2">
                    ({pdfPages.length} pages)
                  </span>
                </h2>
              </div>

              <div className="flex flex-wrap gap-3">
                {/* View Mode Toggle */}
                <div className="flex bg-gray-700 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`px-3 py-2 rounded-md transition-colors ${
                      viewMode === "grid"
                        ? "bg-blue-600 text-white"
                        : "text-gray-300 hover:text-white"
                    }`}
                  >
                    Grid View
                  </button>
                  <button
                    onClick={() => setViewMode("single")}
                    className={`px-3 py-2 rounded-md transition-colors ${
                      viewMode === "single"
                        ? "bg-blue-600 text-white"
                        : "text-gray-300 hover:text-white"
                    }`}
                  >
                    Single Page
                  </button>
                </div>

                {/* Action Buttons */}
                <button
                  onClick={() => {
                    setPdfPages([]);
                    setPdfFile(null);
                    setPdfName("");
                    setSelectedPage(null);
                  }}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear
                </button>

                <button
                  onClick={downloadEditedPdf}
                  className="px-6 py-2 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export Signed PDF
                </button>
              </div>
            </div>

            {/* Tools Section */}
            <div className="bg-gray-800 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">Tools</h3>

              {/* Main Tools */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                <button
                  onClick={() => setActiveTool("select")}
                  className={`p-4 rounded-lg transition-all duration-300 flex flex-col items-center justify-center ${
                    activeTool === "select"
                      ? "bg-blue-600 text-white shadow-lg"
                      : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  }`}
                >
                  <Move className="w-6 h-6 mb-2" />
                  <span className="text-sm">Select</span>
                </button>

                <button
                  onClick={() => setActiveTool("signature")}
                  className={`p-4 rounded-lg transition-all duration-300 flex flex-col items-center justify-center ${
                    activeTool === "signature"
                      ? "bg-purple-600 text-white shadow-lg"
                      : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  }`}
                >
                  <PenTool className="w-6 h-6 mb-2" />
                  <span className="text-sm">Signature</span>
                </button>

                <button
                  onClick={() => setActiveTool("text")}
                  className={`p-4 rounded-lg transition-all duration-300 flex flex-col items-center justify-center ${
                    activeTool === "text"
                      ? "bg-green-600 text-white shadow-lg"
                      : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  }`}
                >
                  <Type className="w-6 h-6 mb-2" />
                  <span className="text-sm">Text</span>
                </button>

                <button
                  onClick={() => setActiveTool("date")}
                  className={`p-4 rounded-lg transition-all duration-300 flex flex-col items-center justify-center ${
                    activeTool === "date"
                      ? "bg-orange-600 text-white shadow-lg"
                      : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  }`}
                >
                  <Calendar className="w-6 h-6 mb-2" />
                  <span className="text-sm">Date</span>
                </button>

                <button
                  onClick={() => setActiveTool("checkbox")}
                  className={`p-4 rounded-lg transition-all duration-300 flex flex-col items-center justify-center ${
                    activeTool === "checkbox"
                      ? "bg-pink-600 text-white shadow-lg"
                      : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  }`}
                >
                  <CheckSquare className="w-6 h-6 mb-2" />
                  <span className="text-sm">Checkbox</span>
                </button>
              </div>

              {/* Signature Tools */}
              {activeTool === "signature" && (
                <div className="bg-gray-700 p-4 rounded-lg space-y-4">
                  <h4 className="font-semibold">Signature Options</h4>

                  <div className="flex flex-wrap gap-4">
                    {/* Draw Signature */}
                    <div className="flex-1 min-w-64">
                      <label className="block text-sm font-medium mb-2">
                        Draw Signature
                      </label>
                      <div className="bg-white rounded-lg p-4">
                        <canvas
                          ref={signatureCanvasRef}
                          width={300}
                          height={150}
                          className="w-full h-32 border-2 border-gray-300 rounded cursor-crosshair"
                          onMouseDown={(e) => startDrawing(e, selectedPage)}
                          onMouseMove={(e) => draw(e, selectedPage)}
                          onMouseUp={() => stopDrawing(selectedPage)}
                          onMouseLeave={() => stopDrawing(selectedPage)}
                        />
                        <div className="flex gap-2 mt-2">
                          <button
                            onClick={clearSignature}
                            className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm"
                          >
                            Clear
                          </button>
                          <button
                            onClick={saveSignature}
                            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm"
                          >
                            Save
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Type Signature */}
                    <div className="flex-1 min-w-64">
                      <label className="block text-sm font-medium mb-2">
                        Type Signature
                      </label>
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={signatureData}
                          onChange={(e) => setSignatureData(e.target.value)}
                          placeholder="Enter your signature"
                          className="w-full px-3 py-2 bg-gray-600 text-white rounded border border-gray-500 focus:border-blue-500 focus:outline-none"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={saveSignature}
                            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm"
                          >
                            Save
                          </button>
                          <button
                            onClick={loadSavedSignature}
                            className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm"
                          >
                            Load Saved
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Upload Signature */}
                    <div className="flex-1 min-w-64">
                      <label className="block text-sm font-medium mb-2">
                        Upload Signature
                      </label>
                      <input
                        ref={fileInputRef2}
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file && selectedPage) {
                            addImageSignature(selectedPage, file);
                          }
                        }}
                        className="hidden"
                      />
                      <button
                        onClick={() => fileInputRef2.current?.click()}
                        className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded transition-colors"
                      >
                        <ImageIcon className="w-4 h-4 inline mr-2" />
                        Upload Image
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Text Tool */}
              {activeTool === "text" && (
                <div className="bg-gray-700 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Add Text Field</h4>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={textInput}
                      onChange={(e) => setTextInput(e.target.value)}
                      placeholder="Enter text for the field..."
                      className="flex-1 px-3 py-2 bg-gray-600 text-white rounded border border-gray-500 focus:border-blue-500 focus:outline-none"
                    />
                    <button
                      onClick={() =>
                        selectedPage &&
                        addTextAnnotation(selectedPage, 100, 100, "text")
                      }
                      disabled={!textInput.trim() || !selectedPage}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded transition-colors"
                    >
                      Add Text
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Page Content */}
            {viewMode === "grid" ? (
              // Grid View
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {pdfPages.map((page) => (
                  <div
                    key={page.id}
                    className={`relative group bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border-2 ${
                      selectedPage === page.id
                        ? "border-blue-500"
                        : "border-transparent hover:border-gray-500"
                    }`}
                  >
                    {/* Page Header */}
                    <div className="absolute top-2 left-2 z-10 bg-black/70 px-2 py-1 rounded text-sm font-medium">
                      Page {page.pageNumber}
                    </div>

                    {/* Page Image */}
                    <div
                      className="flex items-center justify-center bg-white h-64 overflow-hidden cursor-pointer"
                      onClick={() => openPageInSingleView(page.id)}
                    >
                      <div
                        style={{
                          transform: `rotate(${page.rotation}deg) scale(${page.displayScale})`,
                          transformOrigin: "center",
                        }}
                      >
                        <img
                          src={page.imageUrl}
                          alt={`Page ${page.pageNumber}`}
                          className="max-w-full max-h-64 object-contain"
                        />
                      </div>
                    </div>

                    {/* Page Controls */}
                    <div className="p-4">
                      <button
                        onClick={() => openPageInSingleView(page.id)}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center"
                      >
                        <Maximize className="w-4 h-4 mr-2" />
                        Open to Sign
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              // Single Page View
              currentPage && (
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Sidebar - Page Thumbnails */}
                  <div className="w-full lg:w-64 flex-shrink-0 bg-gray-800 rounded-lg p-4">
                    <h3 className="font-semibold mb-4">Pages</h3>
                    <div className="grid grid-cols-2 lg:grid-cols-1 gap-3 max-h-96 overflow-y-auto">
                      {pdfPages.map((page) => (
                        <div
                          key={page.id}
                          className={`p-2 rounded-lg cursor-pointer transition-colors ${
                            selectedPage === page.id
                              ? "bg-blue-600"
                              : "bg-gray-700 hover:bg-gray-600"
                          }`}
                          onClick={() => openPageInSingleView(page.id)}
                        >
                          <div className="flex flex-col items-center">
                            <img
                              src={page.imageUrl}
                              alt={`Page ${page.pageNumber}`}
                              className="w-full h-20 object-cover rounded mb-1"
                            />
                            <span className="text-xs font-medium">
                              Page {page.pageNumber}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Main Canvas Area */}
                  <div
                    style={{ width: "72%" }}
                    className="flex-1 bg-gray-800 rounded-lg p-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3">
                      <h3 className="text-lg font-semibold">
                        Signing Page {currentPage.pageNumber}
                      </h3>
                      <div className="flex gap-2">
                        {/* Zoom Controls */}
                        <div className="flex items-center bg-gray-700 rounded-lg p-1">
                          <button
                            onClick={() => setZoom(Math.max(0.3, zoom - 0.1))}
                            className="p-2 text-gray-300 hover:text-white transition-colors"
                          >
                            <ZoomOut className="w-4 h-4" />
                          </button>
                          <button
                            onClick={fitToScreen}
                            className="px-3 py-1 text-sm text-gray-300 hover:text-white transition-colors"
                          >
                            {Math.round(zoom * 100)}%
                          </button>
                          <button
                            onClick={() => setZoom(Math.min(3, zoom + 0.1))}
                            className="p-2 text-gray-300 hover:text-white transition-colors"
                          >
                            <ZoomIn className="w-4 h-4" />
                          </button>
                        </div>

                        <button
                          onClick={() => setViewMode("grid")}
                          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors flex items-center"
                        >
                          <Minimize className="w-4 h-4 mr-2" />
                          Grid View
                        </button>
                      </div>
                    </div>

                    {/* Canvas Container */}
                    <div
                      ref={canvasContainerRef}
                      className="bg-white rounded-lg p-4 flex items-center justify-center min-h-[500px]"
                    >
                      <div
                        style={{
                          transform: `scale(${zoom})`,
                          transformOrigin: "center",
                          position: "relative",
                          width: `${currentPage.viewport.width}px`,
                          height: `${currentPage.viewport.height}px`,
                        }}
                        onClick={(e) => handleCanvasClick(e, currentPage.id)}
                        onMouseDown={(e) => startDrawing(e, currentPage.id)}
                        onMouseMove={(e) => draw(e, currentPage.id)}
                        onMouseUp={() => stopDrawing(currentPage.id)}
                        onMouseLeave={() => stopDrawing(currentPage.id)}
                      >
                        {/* Base PDF Image */}
                        <img
                          src={currentPage.imageUrl}
                          alt={`Page ${currentPage.pageNumber}`}
                          style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            width: "100%",
                            height: "100%",
                          }}
                        />

                        {/* Temporary Drawing */}
                        {drawing && drawingPoints.length > 0 && (
                          <svg
                            style={{
                              position: "absolute",
                              top: 0,
                              left: 0,
                              width: "100%",
                              height: "100%",
                              pointerEvents: "none",
                            }}
                          >
                            <path
                              d={`M ${drawingPoints
                                .map((p) => `${p.x},${p.y}`)
                                .join(" L ")}`}
                              stroke="#000000"
                              strokeWidth="2"
                              fill="none"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        )}

                        {/* Annotations Layer */}
                        {currentPage.annotations.map((annotation) => (
                          <div
                            key={annotation.id}
                            className={`absolute ${
                              activeTool === "select"
                                ? "cursor-move"
                                : "cursor-default"
                            }`}
                            style={{
                              left: `${annotation.x}px`,
                              top: `${annotation.y}px`,
                              color: annotation.color,
                              fontSize: `${annotation.fontSize}px`,
                              fontFamily: annotation.fontFamily,
                            }}
                            onMouseDown={(e) => {
                              if (activeTool === "select") {
                                e.stopPropagation();
                                setActiveAnnotation(annotation.id);
                              }
                            }}
                            onDoubleClick={(e) => {
                              e.stopPropagation();
                              if (annotation.type === "checkbox") {
                                updateAnnotationValue(
                                  currentPage.id,
                                  annotation.id,
                                  !annotation.value
                                );
                              }
                            }}
                          >
                            {annotation.type === "signature" &&
                              annotation.points && (
                                <svg
                                  width={annotation.width}
                                  height={annotation.height}
                                  style={{ pointerEvents: "none" }}
                                >
                                  <path
                                    d={`M ${annotation.points
                                      .map(
                                        (p) =>
                                          `${p.x - annotation.x},${
                                            p.y - annotation.y
                                          }`
                                      )
                                      .join(" L ")}`}
                                    stroke={annotation.color}
                                    strokeWidth="2"
                                    fill="none"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </svg>
                              )}

                            {annotation.type === "signature" &&
                              annotation.isTyped && (
                                <div
                                  className="bg-white/90 px-3 py-1 rounded shadow-lg"
                                  style={{
                                    fontFamily: "cursive, sans-serif",
                                    fontSize: `${annotation.fontSize}px`,
                                    color: annotation.color,
                                  }}
                                >
                                  {annotation.text}
                                </div>
                              )}

                            {annotation.type === "signature" &&
                              annotation.isImage && (
                                <img
                                  src={annotation.src}
                                  alt="Signature"
                                  style={{
                                    width: `${annotation.width}px`,
                                    height: `${annotation.height}px`,
                                    objectFit: "contain",
                                  }}
                                  className="bg-white/80 p-1 rounded shadow-lg"
                                />
                              )}

                            {(annotation.type === "text" ||
                              annotation.type === "date") && (
                              <div className="bg-white/90 px-3 py-1 rounded shadow-lg border border-gray-300 min-w-[100px]">
                                {annotation.value || annotation.text}
                              </div>
                            )}

                            {annotation.type === "checkbox" && (
                              <div
                                className="w-4 h-4 border-2 border-gray-400 bg-white cursor-pointer flex items-center justify-center"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  updateAnnotationValue(
                                    currentPage.id,
                                    annotation.id,
                                    !annotation.value
                                  );
                                }}
                              >
                                {annotation.value && (
                                  <div className="w-2 h-2 bg-gray-800" />
                                )}
                              </div>
                            )}

                            {/* Delete Button */}
                            {activeTool === "select" && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeAnnotation(
                                    currentPage.id,
                                    annotation.id
                                  );
                                }}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                              >
                                ×
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mt-4 text-sm text-gray-400">
                      <p>
                        <strong>Tips:</strong> Use Select tool to move elements.
                        Double-click checkboxes to toggle. Draw signatures
                        directly on the page or use the type/upload options.
                      </p>
                    </div>
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FillAndSign;
