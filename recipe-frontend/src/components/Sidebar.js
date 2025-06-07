"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import { useState } from 'react';
import { HomeIcon, BookOpenIcon, ShoppingBagIcon, CogIcon } from '@heroicons/react/24/outline';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="hidden md:flex md:w-64 md:flex-col">
      <div className="flex min-h-0 flex-1 flex-col border-r border-gray-200 bg-white">
        <div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
          <div className="flex flex-shrink-0 items-center px-4">
            <h1 className="text-xl font-bold text-indigo-600">Recipe AI</h1>
          </div>
          <nav className="mt-5 flex-1 space-y-1 px-2">
            <Link
              href="/dashboard/inventory"
              className="flex items-center rounded-lg px-2 py-3 text-sm font-medium text-indigo-700 bg-indigo-50"
            >
              <HomeIcon className="mr-3 h-6 w-6 flex-shrink-0" />
              Inventory dashboard
            </Link>
            <Link
              href="/dashboard/saved-recipes"
              className="flex items-center rounded-lg px-2 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            >
              <BookOpenIcon className="mr-3 h-6 w-6 flex-shrink-0" />
              Saved Recipes
            </Link>
            <Link
              href="#"
              className="flex items-center rounded-lg px-2 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            >
              <ShoppingBagIcon className="mr-3 h-6 w-6 flex-shrink-0" />
              Inventory
            </Link>
            <Link
              href="#"
              className="flex items-center rounded-lg px-2 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            >
              <CogIcon className="mr-3 h-6 w-6 flex-shrink-0" />
              Settings
            </Link>
          </nav>
        </div>
        <div className="flex flex-shrink-0 p-4">
          <div className="group block w-full flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div>
                  <img
                    className="inline-block h-9 w-9 rounded-full"
                    src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                    alt=""
                  />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-700">{user?.name || 'User'}</p>
                </div>
              </div>
              {isLoggingOut ? (
                <div className="h-5 w-5 animate-spin rounded-full border-b-2 border-indigo-600"></div>
              ) : (
                <button
                  onClick={handleLogout}
                  className="rounded-md px-3 py-1 text-sm font-medium text-indigo-600 hover:bg-indigo-50"
                >
                  Logout
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}