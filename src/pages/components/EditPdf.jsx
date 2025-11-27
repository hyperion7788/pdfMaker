import React, { useState, useRef, useEffect } from "react";
import {
  Upload,
  Download,
  Loader2,
  Sparkles,
  FileText,
  Trash2,
  RotateCw,
  Type,
  Image as ImageIcon,
  ZoomIn,
  ZoomOut,
  Maximize,
  Minimize,
  Move,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Plus,
  Minus,
  Eye,
  EyeOff,
} from "lucide-react";

// Import pdfjs-dist properly
import * as pdfjsLib from "pdfjs-dist/build/pdf";
import "pdfjs-dist/build/pdf.worker";

// Set up PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;

const EditPdf = () => {
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
  const [textInput, setTextInput] = useState("");
  const [textProperties, setTextProperties] = useState({
    fontSize: 16,
    color: "#000000",
    fontFamily: "Arial, sans-serif",
    bold: false,
    italic: false,
    underline: false,
    alignment: "left",
  });
  const [editingTextId, setEditingTextId] = useState(null);
  const [showOriginalText, setShowOriginalText] = useState(true);

  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);
  const canvasContainerRef = useRef(null);
  const textInputRef = useRef(null);

  // Calculate optimal zoom to fit page in container
  const calculateFitZoom = (
    pageWidth,
    pageHeight,
    containerWidth,
    containerHeight
  ) => {
    const widthRatio = (containerWidth - 80) / pageWidth; // 80px for padding
    const heightRatio = (containerHeight - 80) / pageHeight;
    return Math.min(widthRatio, heightRatio, 1.5); // Allow some scale up but not too much
  };

  // Load PDF and extract pages with text removal capability
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

        // Create canvas for the original page
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        await page.render({
          canvasContext: context,
          viewport: viewport,
        }).promise;

        const textContent = await page.getTextContent();

        // Create canvas for text-removed version
        const textRemovedCanvas = document.createElement("canvas");
        const textRemovedCtx = textRemovedCanvas.getContext("2d");
        textRemovedCanvas.width = viewport.width;
        textRemovedCanvas.height = viewport.height;

        // Draw original image
        textRemovedCtx.drawImage(canvas, 0, 0);

        // Remove text by painting white rectangles over text areas
        textContent.items.forEach((item) => {
          const x = item.transform[4];
          const y = viewport.height - item.transform[5] - item.height;
          const width = item.width;
          const height = item.height;

          textRemovedCtx.fillStyle = "white";
          textRemovedCtx.fillRect(x - 1, y - 1, width + 2, height + 2);
        });

        const displayScale = Math.min(1, 300 / viewport.width);

        pages.push({
          id: `page-${Date.now()}-${i}`,
          imageUrl: canvas.toDataURL("image/png"),
          textRemovedUrl: textRemovedCanvas.toDataURL("image/png"),
          originalPage: page,
          viewport: viewport,
          pageNumber: i,
          annotations: [],
          textItems: textContent.items.map((item, index) => ({
            ...item,
            id: `text-${Date.now()}-${index}`,
            isEditing: false,
            removed: false,
          })),
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

    // Calculate fit zoom for the selected page
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

  // Text removal functionality
  const removeTextItem = (pageId, textItemId) => {
    setPdfPages((prev) =>
      prev.map((page) =>
        page.id === pageId
          ? {
              ...page,
              textItems: page.textItems.map((item) =>
                item.id === textItemId ? { ...item, removed: true } : item
              ),
            }
          : page
      )
    );
  };

  const restoreTextItem = (pageId, textItemId) => {
    setPdfPages((prev) =>
      prev.map((page) =>
        page.id === pageId
          ? {
              ...page,
              textItems: page.textItems.map((item) =>
                item.id === textItemId ? { ...item, removed: false } : item
              ),
            }
          : page
      )
    );
  };

  // Page management
  const deletePage = (pageId) => {
    setPdfPages((prev) => {
      const newPages = prev.filter((page) => page.id !== pageId);
      return newPages.map((page, index) => ({
        ...page,
        pageNumber: index + 1,
      }));
    });
    if (selectedPage === pageId) {
      const remainingPage = pdfPages.find((p) => p.id !== pageId);
      if (remainingPage) {
        setSelectedPage(remainingPage.id);
      } else {
        setSelectedPage(null);
        setViewMode("grid");
      }
    }
  };

  const rotatePage = (pageId) => {
    setPdfPages((prev) =>
      prev.map((page) => {
        if (page.id === pageId) {
          return {
            ...page,
            rotation: (page.rotation + 90) % 360,
          };
        }
        return page;
      })
    );
  };

  const movePage = (fromIndex, toIndex) => {
    if (fromIndex === toIndex) return;

    setPdfPages((prev) => {
      const newPages = [...prev];
      const [movedPage] = newPages.splice(fromIndex, 1);
      newPages.splice(toIndex, 0, movedPage);

      return newPages.map((page, index) => ({
        ...page,
        pageNumber: index + 1,
      }));
    });
  };

  // Text annotations with advanced properties
  const addTextAnnotation = (pageId, x = 100, y = 100) => {
    if (!textInput.trim()) return;

    const fontStyle = [
      textProperties.bold ? "bold" : "",
      textProperties.italic ? "italic" : "",
    ]
      .filter(Boolean)
      .join(" ");

    const newAnnotation = {
      id: `text-${Date.now()}`,
      type: "text",
      text: textInput,
      x: x,
      y: y,
      fontSize: textProperties.fontSize,
      color: textProperties.color,
      fontFamily: textProperties.fontFamily,
      fontStyle: fontStyle,
      underline: textProperties.underline,
      alignment: textProperties.alignment,
      isEditing: true,
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
    setEditingTextId(newAnnotation.id);
  };

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

  const updateAnnotationText = (pageId, annotationId, newText) => {
    setPdfPages((prev) =>
      prev.map((page) =>
        page.id === pageId
          ? {
              ...page,
              annotations: page.annotations.map((ann) =>
                ann.id === annotationId
                  ? { ...ann, text: newText, isEditing: false }
                  : ann
              ),
            }
          : page
      )
    );
    setEditingTextId(null);
  };

  const updateAnnotationProperties = (pageId, annotationId, newProperties) => {
    setPdfPages((prev) =>
      prev.map((page) =>
        page.id === pageId
          ? {
              ...page,
              annotations: page.annotations.map((ann) =>
                ann.id === annotationId ? { ...ann, ...newProperties } : ann
              ),
            }
          : page
      )
    );
  };

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
    setEditingTextId(null);
  };

  // Image annotations
  const addImageAnnotation = async (pageId, file) => {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const newAnnotation = {
          id: `image-${Date.now()}`,
          type: "image",
          x: 100,
          y: 100,
          width: Math.min(img.width / 2, 200),
          height: Math.min(img.height / 2, 150),
          src: e.target.result,
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

  // Canvas click handler for precise placement
  const handleCanvasClick = (e, pageId) => {
    if (activeTool === "text") {
      const rect = e.currentTarget.getBoundingClientRect();
      const scale = zoom;
      const x = (e.clientX - rect.left) / scale;
      const y = (e.clientY - rect.top) / scale;
      addTextAnnotation(pageId, x, y);
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

        // Use text-removed version as base if any text was removed
        const baseImageUrl = page.textItems.some((item) => item.removed)
          ? page.textRemovedUrl
          : page.imageUrl;

        // Load the base page image
        const img = new Image();
        await new Promise((resolve) => {
          img.onload = resolve;
          img.src = baseImageUrl;
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
          if (annotation.type === "text") {
            const fontStyle = annotation.fontStyle || "";
            tempCtx.font = `${fontStyle} ${annotation.fontSize}px ${annotation.fontFamily}`;
            tempCtx.fillStyle = annotation.color;
            tempCtx.textAlign = annotation.alignment || "left";

            if (annotation.underline) {
              tempCtx.fillText(annotation.text, annotation.x, annotation.y);
              tempCtx.strokeStyle = annotation.color;
              tempCtx.lineWidth = 1;
              tempCtx.beginPath();
              tempCtx.moveTo(annotation.x, annotation.y + 2);
              tempCtx.lineTo(
                annotation.x + tempCtx.measureText(annotation.text).width,
                annotation.y + 2
              );
              tempCtx.stroke();
            } else {
              tempCtx.fillText(annotation.text, annotation.x, annotation.y);
            }
          } else if (annotation.type === "image") {
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

      pdf.save(`${pdfName}_edited.pdf`);
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
              Advanced PDF Editor
            </h1>
            <Sparkles className="w-8 h-8 text-yellow-400 animate-pulse ml-2" />
          </div>
          <p className="text-gray-300">
            Edit, remove text, add annotations, and customize your PDFs
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

                {/* Tools */}
                <div className="flex bg-gray-700 rounded-lg p-1">
                  <button
                    onClick={() => setActiveTool("select")}
                    className={`p-2 rounded-md transition-colors ${
                      activeTool === "select"
                        ? "bg-blue-600 text-white"
                        : "text-gray-300 hover:text-white"
                    }`}
                    title="Select Tool"
                  >
                    <Move className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setActiveTool("text")}
                    className={`p-2 rounded-md transition-colors ${
                      activeTool === "text"
                        ? "bg-green-600 text-white"
                        : "text-gray-300 hover:text-white"
                    }`}
                    title="Text Tool"
                  >
                    <Type className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => imageInputRef.current?.click()}
                    className={`p-2 rounded-md transition-colors ${
                      activeTool === "image"
                        ? "bg-purple-600 text-white"
                        : "text-gray-300 hover:text-white"
                    }`}
                    title="Image Tool"
                  >
                    <ImageIcon className="w-4 h-4" />
                  </button>
                </div>

                {/* Text Display Toggle */}
                {viewMode === "single" && (
                  <button
                    onClick={() => setShowOriginalText(!showOriginalText)}
                    className={`px-3 py-2 rounded-lg transition-colors flex items-center ${
                      showOriginalText
                        ? "bg-green-600 hover:bg-green-700"
                        : "bg-gray-600 hover:bg-gray-700"
                    }`}
                  >
                    {showOriginalText ? (
                      <Eye className="w-4 h-4 mr-2" />
                    ) : (
                      <EyeOff className="w-4 h-4 mr-2" />
                    )}
                    {showOriginalText ? "Show Text" : "Hide Text"}
                  </button>
                )}

                {/* Zoom Controls - Only show in single view */}
                {viewMode === "single" && (
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
                    <button
                      onClick={fitToScreen}
                      className="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded ml-2 transition-colors"
                    >
                      Fit
                    </button>
                  </div>
                )}

                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file && selectedPage) {
                      addImageAnnotation(selectedPage, file);
                    }
                  }}
                />

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
                  Export PDF
                </button>
              </div>
            </div>

            {/* Text Properties Toolbar */}
            {activeTool === "text" && (
              <div className="bg-gray-800 p-4 rounded-lg space-y-4">
                {/* Text Input */}
                <div className="flex gap-3 items-center">
                  <input
                    ref={textInputRef}
                    type="text"
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    placeholder="Enter text to add to the page..."
                    className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                    onKeyPress={(e) => {
                      if (e.key === "Enter" && selectedPage) {
                        addTextAnnotation(selectedPage);
                      }
                    }}
                  />
                  <button
                    onClick={() =>
                      selectedPage && addTextAnnotation(selectedPage)
                    }
                    disabled={!textInput.trim() || !selectedPage}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded-lg transition-colors"
                  >
                    Add Text
                  </button>
                </div>

                {/* Text Properties */}
                <div className="flex flex-wrap gap-4 items-center">
                  {/* Font Size */}
                  <div className="flex items-center gap-2">
                    <label className="text-sm text-gray-300">Size:</label>
                    <div className="flex items-center bg-gray-700 rounded">
                      <button
                        onClick={() =>
                          setTextProperties((prev) => ({
                            ...prev,
                            fontSize: Math.max(8, prev.fontSize - 2),
                          }))
                        }
                        className="p-1 hover:bg-gray-600 rounded-l"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-2 text-sm w-12 text-center">
                        {textProperties.fontSize}px
                      </span>
                      <button
                        onClick={() =>
                          setTextProperties((prev) => ({
                            ...prev,
                            fontSize: Math.min(72, prev.fontSize + 2),
                          }))
                        }
                        className="p-1 hover:bg-gray-600 rounded-r"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Color */}
                  <div className="flex items-center gap-2">
                    <label className="text-sm text-gray-300">Color:</label>
                    <input
                      type="color"
                      value={textProperties.color}
                      onChange={(e) =>
                        setTextProperties((prev) => ({
                          ...prev,
                          color: e.target.value,
                        }))
                      }
                      className="w-8 h-8 rounded border border-gray-600"
                    />
                  </div>

                  {/* Font Style */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() =>
                        setTextProperties((prev) => ({
                          ...prev,
                          bold: !prev.bold,
                        }))
                      }
                      className={`p-2 rounded ${
                        textProperties.bold
                          ? "bg-blue-600 text-white"
                          : "bg-gray-700 text-gray-300"
                      }`}
                    >
                      <Bold className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() =>
                        setTextProperties((prev) => ({
                          ...prev,
                          italic: !prev.italic,
                        }))
                      }
                      className={`p-2 rounded ${
                        textProperties.italic
                          ? "bg-blue-600 text-white"
                          : "bg-gray-700 text-gray-300"
                      }`}
                    >
                      <Italic className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() =>
                        setTextProperties((prev) => ({
                          ...prev,
                          underline: !prev.underline,
                        }))
                      }
                      className={`p-2 rounded ${
                        textProperties.underline
                          ? "bg-blue-600 text-white"
                          : "bg-gray-700 text-gray-300"
                      }`}
                    >
                      <Underline className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Alignment */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() =>
                        setTextProperties((prev) => ({
                          ...prev,
                          alignment: "left",
                        }))
                      }
                      className={`p-2 rounded ${
                        textProperties.alignment === "left"
                          ? "bg-blue-600 text-white"
                          : "bg-gray-700 text-gray-300"
                      }`}
                    >
                      <AlignLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() =>
                        setTextProperties((prev) => ({
                          ...prev,
                          alignment: "center",
                        }))
                      }
                      className={`p-2 rounded ${
                        textProperties.alignment === "center"
                          ? "bg-blue-600 text-white"
                          : "bg-gray-700 text-gray-300"
                      }`}
                    >
                      <AlignCenter className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() =>
                        setTextProperties((prev) => ({
                          ...prev,
                          alignment: "right",
                        }))
                      }
                      className={`p-2 rounded ${
                        textProperties.alignment === "right"
                          ? "bg-blue-600 text-white"
                          : "bg-gray-700 text-gray-300"
                      }`}
                    >
                      <AlignRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <p className="text-sm text-gray-400">
                  {viewMode === "single"
                    ? "Click on the page to place text, or use the button above"
                    : "Switch to single page view to place text"}
                </p>
              </div>
            )}

            {/* Page Content */}
            {viewMode === "grid" ? (
              // Grid View
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {pdfPages.map((page, index) => (
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
                    <div className="p-4 space-y-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => rotatePage(page.id)}
                          className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-lg transition-colors flex items-center justify-center text-sm"
                        >
                          <RotateCw className="w-4 h-4 mr-1" />
                          Rotate
                        </button>

                        <button
                          onClick={() => openPageInSingleView(page.id)}
                          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg transition-colors flex items-center justify-center text-sm"
                        >
                          <Maximize className="w-4 h-4 mr-1" />
                          Open
                        </button>

                        <button
                          onClick={() => deletePage(page.id)}
                          className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Move Controls */}
                      <div className="flex gap-2 text-xs">
                        <button
                          onClick={() =>
                            movePage(index, Math.max(0, index - 1))
                          }
                          disabled={index === 0}
                          className="flex-1 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-500 text-white px-2 py-1 rounded transition-colors"
                        >
                          Move Up
                        </button>
                        <button
                          onClick={() =>
                            movePage(
                              index,
                              Math.min(pdfPages.length - 1, index + 1)
                            )
                          }
                          disabled={index === pdfPages.length - 1}
                          className="flex-1 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-500 text-white px-2 py-1 rounded transition-colors"
                        >
                          Move Down
                        </button>
                      </div>
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
                        Editing Page {currentPage.pageNumber}
                      </h3>
                      <div className="flex gap-2">
                        <button
                          onClick={fitToScreen}
                          className="px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors text-sm"
                        >
                          Fit to Screen
                        </button>
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
                      className="bg-white rounded-lg   p-4 flex items-center justify-center"
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
                      >
                        {/* Base PDF Image - Use text-removed version if text is hidden */}
                        <img
                          src={
                            showOriginalText
                              ? currentPage.imageUrl
                              : currentPage.textRemovedUrl
                          }
                          alt={`Page ${currentPage.pageNumber}`}
                          style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            width: "100%",
                            height: "100%",
                          }}
                        />

                        {/* Original Text Items (for removal) */}
                        {showOriginalText &&
                          currentPage.textItems.map(
                            (item) =>
                              !item.removed && (
                                <div
                                  key={item.id}
                                  className="absolute cursor-pointer group"
                                  style={{
                                    left: `${item.transform[4]}px`,
                                    top: `${
                                      currentPage.viewport.height -
                                      item.transform[5] -
                                      item.height
                                    }px`,
                                    width: `${item.width}px`,
                                    height: `${item.height}px`,
                                  }}
                                  onDoubleClick={() =>
                                    removeTextItem(currentPage.id, item.id)
                                  }
                                >
                                  <div className="bg-red-500/20 group-hover:bg-red-500/40 transition-colors w-full h-full flex items-center justify-center">
                                    <span className="text-red-600 text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                                      Double-click to remove
                                    </span>
                                  </div>
                                </div>
                              )
                          )}

                        {/* Removed Text Items (for restoration) */}
                        {currentPage.textItems.map(
                          (item) =>
                            item.removed && (
                              <div
                                key={item.id}
                                className="absolute cursor-pointer group"
                                style={{
                                  left: `${item.transform[4]}px`,
                                  top: `${
                                    currentPage.viewport.height -
                                    item.transform[5] -
                                    item.height
                                  }px`,
                                  width: `${item.width}px`,
                                  height: `${item.height}px`,
                                }}
                                onDoubleClick={() =>
                                  restoreTextItem(currentPage.id, item.id)
                                }
                              >
                                <div className="bg-green-500/20 group-hover:bg-green-500/40 transition-colors w-full h-full flex items-center justify-center border border-dashed border-green-500">
                                  <span className="text-green-600 text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                                    Double-click to restore
                                  </span>
                                </div>
                              </div>
                            )
                        )}

                        {/* Annotations Layer */}
                        {currentPage.annotations.map((annotation) => (
                          <div
                            key={annotation.id}
                            className={`absolute ${
                              activeTool === "select"
                                ? "cursor-move"
                                : "cursor-default"
                            } ${
                              annotation.isEditing ? "ring-2 ring-blue-400" : ""
                            }`}
                            style={{
                              left: `${annotation.x}px`,
                              top: `${annotation.y}px`,
                              color: annotation.color,
                              fontSize: `${annotation.fontSize}px`,
                              fontFamily: annotation.fontFamily,
                              fontStyle: annotation.fontStyle,
                              textAlign: annotation.alignment,
                              textDecoration: annotation.underline
                                ? "underline"
                                : "none",
                            }}
                            onMouseDown={(e) => {
                              if (activeTool === "select") {
                                e.stopPropagation();
                                setActiveAnnotation(annotation.id);
                              }
                            }}
                            onDoubleClick={(e) => {
                              if (annotation.type === "text") {
                                e.stopPropagation();
                                setEditingTextId(annotation.id);
                                setPdfPages((prev) =>
                                  prev.map((p) =>
                                    p.id === currentPage.id
                                      ? {
                                          ...p,
                                          annotations: p.annotations.map(
                                            (ann) =>
                                              ann.id === annotation.id
                                                ? { ...ann, isEditing: true }
                                                : ann
                                          ),
                                        }
                                      : p
                                  )
                                );
                              }
                            }}
                          >
                            {annotation.type === "text" ? (
                              annotation.isEditing ? (
                                <div className="bg-white p-2 rounded shadow-lg">
                                  <input
                                    type="text"
                                    value={annotation.text}
                                    onChange={(e) =>
                                      updateAnnotationText(
                                        currentPage.id,
                                        annotation.id,
                                        e.target.value
                                      )
                                    }
                                    onBlur={() => {
                                      updateAnnotationText(
                                        currentPage.id,
                                        annotation.id,
                                        annotation.text
                                      );
                                      setEditingTextId(null);
                                    }}
                                    onKeyPress={(e) => {
                                      if (e.key === "Enter") {
                                        updateAnnotationText(
                                          currentPage.id,
                                          annotation.id,
                                          annotation.text
                                        );
                                        setEditingTextId(null);
                                      }
                                    }}
                                    className="bg-transparent border-b-2 border-blue-500 outline-none w-full"
                                    style={{
                                      color: annotation.color,
                                      fontSize: `${annotation.fontSize}px`,
                                      fontFamily: annotation.fontFamily,
                                    }}
                                    autoFocus
                                  />
                                  {/* Text Properties Editor for existing text */}
                                  <div className="flex gap-2 mt-2">
                                    <button
                                      onClick={() =>
                                        updateAnnotationProperties(
                                          currentPage.id,
                                          annotation.id,
                                          {
                                            fontSize: Math.max(
                                              8,
                                              annotation.fontSize - 2
                                            ),
                                          }
                                        )
                                      }
                                      className="p-1 bg-gray-200 rounded"
                                    >
                                      <Minus className="w-3 h-3" />
                                    </button>
                                    <span className="text-xs px-2">
                                      {annotation.fontSize}px
                                    </span>
                                    <button
                                      onClick={() =>
                                        updateAnnotationProperties(
                                          currentPage.id,
                                          annotation.id,
                                          {
                                            fontSize: Math.min(
                                              72,
                                              annotation.fontSize + 2
                                            ),
                                          }
                                        )
                                      }
                                      className="p-1 bg-gray-200 rounded"
                                    >
                                      <Plus className="w-3 h-3" />
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div className="bg-white/90 px-3 py-2 rounded shadow-lg">
                                  {annotation.text}
                                </div>
                              )
                            ) : (
                              <img
                                src={annotation.src}
                                alt="Annotation"
                                style={{
                                  width: `${annotation.width}px`,
                                  height: `${annotation.height}px`,
                                  objectFit: "contain",
                                }}
                                className="bg-white/80 p-1 rounded shadow-lg"
                              />
                            )}

                            {/* Delete Button */}
                            {activeTool === "select" &&
                              !annotation.isEditing && (
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

                    {/* Page Controls for Single View */}
                    <div className="flex gap-3 mt-4">
                      <button
                        onClick={() => rotatePage(currentPage.id)}
                        className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center"
                      >
                        <RotateCw className="w-4 h-4 mr-2" />
                        Rotate Page
                      </button>
                      <button
                        onClick={() => deletePage(currentPage.id)}
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete Page
                      </button>
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

export default EditPdf;
