import Banner from "../components/Banner";
import Contact from "../components/Contact";
import About from "../components/About";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import PDFToolsDashboard from "../components/PDFToolsDashboard";
const Home = () => {
  return (
    <>
      <Navbar />
      <Banner />
      <PDFToolsDashboard />
      <About />
      <Contact />
      <Footer />
    </>
  );
};

export default Home;
