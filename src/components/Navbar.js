import { useState } from "react";
import { Link } from "react-router-dom";
import "./Navbar.css";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="bg-slate-950 text-white px-20 py-12 flex items-center justify-between">
      {/* App name clickable */}
      <Link to="/" className="text-6xl hover:text-indigo-400 monoton-font">
        Futboliro.com
      </Link>

      {/* Menu items */}
      <ul
        className={`md:flex md:items-center md:gap-6 absolute md:static top-16 left-0 w-full md:w-auto bg-gray-900 md:bg-transparent transition-all duration-300 ${
          open ? "block" : "hidden"
        }`}
      >
        {/* You can add more links here */}
        <li>
          <Link
            to="/squad-data"
            className="block px-4 py-2 hover:text-indigo-400"
            onClick={() => setOpen(false)}
          >
            Squad Data Entry
          </Link>
        </li>
      </ul>
    </nav>
  );
}
