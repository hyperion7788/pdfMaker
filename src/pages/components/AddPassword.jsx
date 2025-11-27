import React, { useState, useRef } from "react";
import {
  Upload,
  Download,
  Loader2,
  Sparkles,
  FileText,
  Trash2,
  Lock,
  Eye,
  EyeOff,
  CheckCircle,
  Info,
  Shield,
  Key,
} from "lucide-react";

const AddPassword = () => {
  const [pdfFile, setPdfFile] = useState(null);
  const [securedPdf, setSecuredPdf] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState("");
  const [fileInfo, setFileInfo] = useState(null);
  const [encryptionMethod, setEncryptionMethod] = useState("standard"); // 'standard' or 'strong'
  const fileInputRef = useRef(null);

  // Password strength checker
  const checkPasswordStrength = (pwd) => {
    if (pwd.length === 0) return "";
    let strength = 0;
    if (pwd.length >= 8) strength++;
    if (pwd.match(/[a-z]/) && pwd.match(/[A-Z]/)) strength++;
    if (pwd.match(/\d/)) strength++;
    if (pwd.match(/[^a-zA-Z\d]/)) strength++;
    const strengthLabels = ["", "Weak", "Fair", "Good", "Strong"];
    return strengthLabels[strength];
  };

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    setPasswordStrength(checkPasswordStrength(newPassword));
  };

  // File handling
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files[0] && files[0].type === "application/pdf") {
      processSelectedFile(files[0]);
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
      processSelectedFile(file);
    } else {
      alert("Please select a valid PDF file.");
    }
  };

  const processSelectedFile = (file) => {
    if (file.size > 50 * 1024 * 1024) {
      // 50MB limit
      alert("File size too large. Please select a file smaller than 50MB.");
      return;
    }
    setPdfFile(file);
    setSecuredPdf(null);
    setFileInfo({
      name: file.name,
      size: (file.size / 1024 / 1024).toFixed(2),
    });
    setPassword("");
    setConfirmPassword("");
    setPasswordStrength("");
  };

  // ==========================================
  // SOLUTION 1: Using pdf-lib (More reliable)
  // ==========================================
  const securePdfWithPassword = async () => {
    if (!pdfFile) {
      alert("Please select a PDF file first.");
      return;
    }
    if (!password) {
      alert("Please enter a password.");
      return;
    }
    if (password !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    setIsProcessing(true);

    try {
      // Dynamic import for pdf-lib
      const { PDFDocument } = await import("pdf-lib");

      // Read the PDF file
      const arrayBuffer = await pdfFile.arrayBuffer();

      // Load the PDF document
      const pdfDoc = await PDFDocument.load(arrayBuffer);

      // Encrypt the PDF
      pdfDoc.encrypt({
        userPassword: password,
        ownerPassword: password, // Same as user password for simplicity
        permissions: {
          printing: "lowResolution", // Allow printing but low resolution
          modifying: false, // Disable modifying
          copying: false, // Disable copying
          annotating: false, // Disable annotations
          fillingForms: false, // Disable form filling
          contentAccessibility: false, // Disable content accessibility
          documentAssembly: false, // Disable document assembly
        },
      });

      // Save the encrypted PDF
      const encryptedPdfBytes = await pdfDoc.save();

      // Create blob and URL
      const blob = new Blob([encryptedPdfBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);

      setSecuredPdf(url);
    } catch (error) {
      console.error("Encryption failed:", error);
      alert(`❌ Failed to encrypt PDF: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // ==========================================
  // SOLUTION 2: Backend API Approach
  // ==========================================
  const securePdfWithBackend = async () => {
    if (!pdfFile) {
      alert("Please select a PDF file first.");
      return;
    }
    if (!password) {
      alert("Please enter a password.");
      return;
    }
    if (password !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    setIsProcessing(true);

    try {
      const formData = new FormData();
      formData.append("pdf", pdfFile);
      formData.append("password", password);
      formData.append("encryptionLevel", encryptionMethod);

      const response = await fetch("/api/encrypt-pdf", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Server error: " + response.statusText);
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setSecuredPdf(url);
    } catch (error) {
      console.error("Backend encryption failed:", error);
      alert(`❌ Encryption failed: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // ==========================================
  // SOLUTION 3: Using pdfjs-dist (Alternative)
  // ==========================================
  const securePdfWithPDFJS = async () => {
    // This is a more complex implementation using PDF.js
    // Would require additional setup and worker
    alert("PDF.js implementation would require additional setup");
  };

  const handleReset = () => {
    setPdfFile(null);
    setSecuredPdf(null);
    setPassword("");
    setConfirmPassword("");
    setPasswordStrength("");
    setFileInfo(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    if (securedPdf) {
      URL.revokeObjectURL(securedPdf);
    }
  };

  const getPasswordStrengthColor = () => {
    switch (passwordStrength) {
      case "Weak":
        return "text-red-400";
      case "Fair":
        return "text-orange-400";
      case "Good":
        return "text-yellow-400";
      case "Strong":
        return "text-green-400";
      default:
        return "text-gray-400";
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
              Secure PDF
            </h1>
            <Sparkles className="w-8 h-8 text-yellow-400 animate-pulse ml-2" />
          </div>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Protect your PDF documents with strong passwords. Multiple
            encryption methods available.
          </p>
        </div>

        {/* Upload Area */}
        {!pdfFile && (
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

        {/* Password Settings */}
        {pdfFile && !securedPdf && !isProcessing && (
          <div className="max-w-2xl mx-auto mb-8 animate-fade-in">
            <div className="bg-gray-700/50 rounded-2xl p-8 shadow-xl">
              {/* File Info */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center">
                  <FileText className="w-6 h-6 mr-3 text-blue-400" />
                  <div>
                    <h3 className="text-xl font-semibold">{fileInfo?.name}</h3>
                    <p className="text-gray-400 text-sm">
                      Size: {fileInfo?.size} MB
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

              {/* Encryption Method Selection */}
              <div className="mb-6">
                <label className="flex items-center text-lg font-semibold mb-3">
                  <Shield className="w-5 h-5 mr-2 text-blue-400" />
                  Encryption Method
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setEncryptionMethod("standard")}
                    className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                      encryptionMethod === "standard"
                        ? "border-purple-500 bg-purple-900/30"
                        : "border-gray-600 bg-gray-600/50 hover:border-gray-500"
                    }`}
                  >
                    <div className="text-center">
                      <div className="font-semibold">Standard</div>
                      <div className="text-sm text-gray-400 mt-1">Frontend</div>
                    </div>
                  </button>
                  <button
                    onClick={() => setEncryptionMethod("strong")}
                    className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                      encryptionMethod === "strong"
                        ? "border-green-500 bg-green-900/30"
                        : "border-gray-600 bg-gray-600/50 hover:border-gray-500"
                    }`}
                  >
                    <div className="text-center">
                      <div className="font-semibold">Strong</div>
                      <div className="text-sm text-gray-400 mt-1">Backend</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Password Inputs */}
              <div className="space-y-6">
                <div>
                  <label className="flex items-center text-lg font-semibold mb-4">
                    <Lock className="w-5 h-5 mr-2 text-purple-400" />
                    Set PDF Password
                  </label>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Password *
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={handlePasswordChange}
                          placeholder="Enter a strong password"
                          className="w-full px-4 py-3 bg-gray-600 border border-gray-500 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 pr-12"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                        >
                          {showPassword ? (
                            <EyeOff className="w-5 h-5" />
                          ) : (
                            <Eye className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                      {password && (
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-sm text-gray-400">
                            Strength:
                          </span>
                          <span
                            className={`text-sm font-medium ${getPasswordStrengthColor()}`}
                          >
                            {passwordStrength}
                          </span>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Confirm Password *
                      </label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Confirm your password"
                          className="w-full px-4 py-3 bg-gray-600 border border-gray-500 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 pr-12"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="w-5 h-5" />
                          ) : (
                            <Eye className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                      {confirmPassword && password !== confirmPassword && (
                        <p className="text-red-400 text-sm mt-2">
                          Passwords do not match
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Security Information */}
                <div className="bg-blue-900/30 border border-blue-500/50 rounded-lg p-4">
                  <div className="flex items-start">
                    <Info className="w-5 h-5 text-blue-400 mr-3 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-gray-300">
                      <p className="font-semibold mb-1">Security Features:</p>
                      <ul className="list-disc list-inside space-y-1">
                        <li>Password required to open the PDF</li>
                        <li>
                          {encryptionMethod === "standard"
                            ? "Standard"
                            : "Strong"}{" "}
                          encryption applied
                        </li>
                        <li>Copying and content extraction protected</li>
                        <li>Editing and printing restrictions</li>
                        {encryptionMethod === "strong" && (
                          <li>Advanced AES encryption</li>
                        )}
                      </ul>
                      <p className="mt-2 text-yellow-400">
                        ⚠️ Remember your password! It cannot be recovered if
                        lost.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Secure Button */}
                <button
                  onClick={
                    encryptionMethod === "standard"
                      ? securePdfWithPassword
                      : securePdfWithBackend
                  }
                  disabled={
                    !password ||
                    !confirmPassword ||
                    password !== confirmPassword ||
                    password.length < 4
                  }
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-600 text-white px-8 py-4 rounded-lg font-bold text-lg transition-all duration-300 transform hover:scale-105 disabled:transform-none shadow-xl hover:shadow-2xl inline-flex items-center justify-center"
                >
                  <Shield className="w-6 h-6 mr-2" />
                  {encryptionMethod === "standard"
                    ? "Secure PDF (Frontend)"
                    : "Secure PDF (Backend)"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isProcessing && (
          <div className="text-center py-12 animate-fade-in">
            <Loader2 className="w-16 h-16 text-purple-400 animate-spin mx-auto mb-4" />
            <p className="text-xl text-gray-300 mb-2">
              {encryptionMethod === "standard"
                ? "Securing your PDF..."
                : "Processing with backend..."}
            </p>
            <p className="text-gray-400">
              Encrypting document and applying security settings...
            </p>
            <div className="mt-4 bg-gray-700 rounded-full h-2 w-64 mx-auto">
              <div className="bg-purple-600 h-2 rounded-full animate-pulse"></div>
            </div>
          </div>
        )}

        {/* Results Section - Same as before */}
        {securedPdf && (
          <div className="max-w-2xl mx-auto animate-fade-in">
            <div className="bg-gradient-to-r from-gray-700 to-gray-600 rounded-2xl p-8 shadow-2xl">
              <div className="flex justify-center mb-6">
                <div className="p-4 bg-green-600 rounded-full">
                  <CheckCircle className="w-12 h-12 text-white" />
                </div>
              </div>
              <h3 className="text-3xl font-bold text-center mb-4">
                PDF Secured Successfully!
              </h3>
              <div className="text-center mb-6">
                <p className="text-gray-300 text-lg mb-2">
                  Your PDF is now protected with a password
                </p>
                <div className="bg-yellow-900/30 border border-yellow-600/50 rounded-lg p-4 inline-block">
                  <p className="text-yellow-400 font-semibold">
                    🔒 Password Protected
                  </p>
                </div>
              </div>

              <div className="bg-gray-800/50 rounded-xl p-6 mb-6">
                <h4 className="font-semibold text-lg mb-3 text-center">
                  Security Features Applied
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center text-green-400">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Password required to open
                  </div>
                  <div className="flex items-center text-green-400">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    {encryptionMethod === "standard"
                      ? "Standard"
                      : "Strong"}{" "}
                    encryption
                  </div>
                  <div className="flex items-center text-red-400">
                    <Lock className="w-4 h-4 mr-2" />
                    Editing restricted
                  </div>
                  <div className="flex items-center text-red-400">
                    <Lock className="w-4 h-4 mr-2" />
                    Copying disabled
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href={securedPdf}
                  download={`${fileInfo?.name?.replace(
                    ".pdf",
                    ""
                  )}_secured.pdf`}
                  className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl inline-flex items-center justify-center"
                >
                  <Download className="w-5 h-5 mr-2" />
                  Download Secured PDF
                </a>
                <button
                  onClick={handleReset}
                  className="bg-gray-600 hover:bg-gray-500 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 inline-flex items-center justify-center"
                >
                  <Shield className="w-5 h-5 mr-2" />
                  Secure Another PDF
                </button>
              </div>

              <div className="mt-6 text-center">
                <p className="text-yellow-400 text-sm">
                  ⚠️ Remember to save your password in a secure location!
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Features Section */}
        {!pdfFile && !isProcessing && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
            <div className="text-center p-6 bg-gray-700/50 rounded-xl hover:bg-gray-700 transition-all duration-300 transform hover:scale-105">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-purple-600 rounded-full">
                  <Lock className="w-8 h-8" />
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-2">
                Multiple Encryption Methods
              </h3>
              <p className="text-gray-400">
                Choose between frontend or backend encryption based on your
                needs
              </p>
            </div>
            <div className="text-center p-6 bg-gray-700/50 rounded-xl hover:bg-gray-700 transition-all duration-300 transform hover:scale-105">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-blue-600 rounded-full">
                  <Shield className="w-8 h-8" />
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-2">Access Control</h3>
              <p className="text-gray-400">
                Complete control over printing, editing, and copying permissions
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
                Get your password-protected PDF immediately after processing
              </p>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fade-in 0.6s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default AddPassword;
