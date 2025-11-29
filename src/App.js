import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import ClubPage from "./pages/ClubPage";
import Navbar from "./components/Navbar";
import SquadDataEntry from "./pages/SquadDataEntry";

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-slate-500 text-white">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/club/:id" element={<ClubPage />} />
          <Route path="/squad-data" element={<SquadDataEntry />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
