import { Route, Routes, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";
import NotFound from "./pages/NotFound";
import ResetPassword from "./pages/auth/ResetPassword";
import "./App.css";
// import Register from "./pages/auth/Register";
import { PrivateRoute, PublicRoute } from "./routes/AuthRoute";

import Home from "./pages/home/Home";
import AboutUs from "./pages/home/About";
import ContactUs from "./pages/home/ContactUs";
import Services from "./pages/home/Services";
import VerifyEmail from "./pages/auth/VerifyEmail";

import ImageToPdf from "./pages/home/ImageToPdf";
import PdfEditer from "./pages/home/PdfEditer";
import CPdf from "./pages/home/CPdf";
import MergePdf from "./pages/home/MergePdf";
import SplitPdf from "./pages/home/SplitPdf";
import FillAndSignPdf from "./pages/home/FillAndSignPdf";
import DeletePdf from "./pages/home/DeletePdf";
import ProtectPdf from "./pages/home/ProtectPdf";

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

const App = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route
          path="/"
          element={
            <motion.div
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.4 }}
            >
              <Home />
            </motion.div>
          }
        />
        <Route
          path="/img-to-pdf"
          element={
            <motion.div
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.4 }}
            >
              <ImageToPdf />
            </motion.div>
          }
        />
        <Route
          path="/pdf-editor"
          element={
            <motion.div
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.4 }}
            >
              <PdfEditer />
            </motion.div>
          }
        />
        <Route
          path="/compress-pdf"
          element={
            <motion.div
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.4 }}
            >
              <CPdf />
            </motion.div>
          }
        />
        <Route
          path="/merge-pdf"
          element={
            <motion.div
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.4 }}
            >
              <MergePdf />
            </motion.div>
          }
        />
        <Route
          path="/split-pdf"
          element={
            <motion.div
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.4 }}
            >
              <SplitPdf />
            </motion.div>
          }
        />
        <Route
          path="/fill-sign-pdf"
          element={
            <motion.div
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.4 }}
            >
              <FillAndSignPdf />
            </motion.div>
          }
        />
        <Route
          path="/delete-pages-pdf"
          element={
            <motion.div
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.4 }}
            >
              <DeletePdf />
            </motion.div>
          }
        />
        <Route
          path="/protect-pdf"
          element={
            <motion.div
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.4 }}
            >
              <ProtectPdf />
            </motion.div>
          }
        />
        <Route
          path="/about"
          element={
            <motion.div
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.4 }}
            >
              <AboutUs />
            </motion.div>
          }
        />
        <Route
          path="/contact"
          element={
            <motion.div
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.4 }}
            >
              <ContactUs />
            </motion.div>
          }
        />
        <Route
          path="/services"
          element={
            <motion.div
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.4 }}
            >
              <Services />
            </motion.div>
          }
        />

        <Route
          path="/login"
          element={
            <motion.div
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.4 }}
            >
              <PublicRoute>
                <Login />
              </PublicRoute>
            </motion.div>
          }
        />

        <Route
          path="/verify/:token"
          element={
            <motion.div
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.4 }}
            >
              <PublicRoute>
                <VerifyEmail />
              </PublicRoute>
            </motion.div>
          }
        />

        <Route
          path="/register"
          element={
            <motion.div
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.4 }}
            >
              <PublicRoute>
                <Register />
              </PublicRoute>
            </motion.div>
          }
        />

        <Route
          path="/forgot-password"
          element={
            <motion.div
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.4 }}
            >
              <PublicRoute>
                <ForgotPassword />
              </PublicRoute>
            </motion.div>
          }
        />
        <Route
          path="/reset-password-user/:token"
          element={
            <motion.div
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.4 }}
            >
              <PublicRoute>
                <ResetPassword />
              </PublicRoute>
            </motion.div>
          }
        />

        <Route
          path="*"
          element={
            <motion.div
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.4 }}
            >
              <NotFound />
            </motion.div>
          }
        />
      </Routes>
    </AnimatePresence>
  );
};

export default App;
