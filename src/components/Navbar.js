import { useState } from "react";
import { Link } from "react-router-dom";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="bg-yellow-700 text-white px-6 py-4 flex items-center justify-between">
      {/* App name clickable */}
      <Link to="/" className="text-2xl font-bold hover:text-blue-100">
        Soccer Stats ⚽
      </Link>

      {/* Hamburger button for mobile */}
      <button
        className="md:hidden text-white text-2xl"
        onClick={() => setOpen(!open)}
      >
        ☰
      </button>

      {/* Menu items */}
      <ul
        className={`md:flex md:items-center md:gap-6 absolute md:static top-16 left-0 w-full md:w-auto bg-gray-900 md:bg-transparent transition-all duration-300 ${
          open ? "block" : "hidden"
        }`}
      >
        <li className="p-3 md:p-0">
          <Link
            to="/"
            className="hover:text-blue-400"
            onClick={() => setOpen(false)}
          >
            Home
          </Link>
        </li>
        {/* You can add more links here */}
      </ul>
    </nav>
  );
}
