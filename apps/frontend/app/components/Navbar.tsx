import { Link } from "react-router";

export function Navbar() {
  return (
    <nav className="bg-navy-500 border-b border-navy-400">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link 
            to="/" 
            className="text-gray-100 text-xl font-bold hover:text-yellow-300 transition-colors"
          >
            Delphi Counter
          </Link>
          
          <div className="flex items-center space-x-4">
            <Link 
              to="/" 
              className="text-gray-200 hover:text-yellow-300 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Rooms
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}