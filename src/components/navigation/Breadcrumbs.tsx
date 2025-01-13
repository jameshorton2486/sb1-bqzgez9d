import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

export function Breadcrumbs() {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter(x => x);

  return (
    <nav className="flex" aria-label="Breadcrumb">
      <ol className="flex items-center space-x-4">
        <li>
          <Link to="/" className="text-gray-400 hover:text-gray-500">
            <Home className="h-5 w-5" />
          </Link>
        </li>
        {pathnames.map((name, index) => {
          const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
          const isLast = index === pathnames.length - 1;

          return (
            <li key={name} className="flex items-center">
              <ChevronRight className="h-5 w-5 text-gray-400" />
              <Link
                to={routeTo}
                className={`ml-4 text-sm font-medium ${
                  isLast 
                    ? 'text-gray-700 cursor-default' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                aria-current={isLast ? 'page' : undefined}
              >
                {name.charAt(0).toUpperCase() + name.slice(1).replace(/-/g, ' ')}
              </Link>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}