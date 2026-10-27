import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";  
import DetailPage from "./pages/DetailPage";
import ProjectsPage from "./pages/ProjectsPage";
import ContactPage from "./pages/ContactPage";
import AdminPanel from "./pages/AdminPanel";
import { useEffect } from "react";

import { HashRouter as Router, Routes, Route, useLocation } from "react-router-dom";

function ScrollToTopOnRouteChange() {
  const location = useLocation();

  useEffect(() => {
    // Keep hash-anchor behavior (e.g. /#skills) but reset scroll for normal route changes.
    if (!location.hash) {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    }
  }, [location.pathname, location.search, location.hash]);

  return null;
}

function AppShell() {
  const location = useLocation();
  const isAdminRoute = location.pathname === "/adminpanel";

  return (
    <>
      <ScrollToTopOnRouteChange />
      {!isAdminRoute && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/adminpanel" element={<AdminPanel />} />
        <Route path="/detail/:category/:id" element={<DetailPage />} />
      </Routes>
      {!isAdminRoute && <Footer />}
    </>
  );
}

export default function App() {
  return (
    <Router>
      <AppShell />
    </Router>
  );
}