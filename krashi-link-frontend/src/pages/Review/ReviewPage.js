import React from 'react';
import { Link } from 'react-router-dom';

const ReviewPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Reviews</h1>
          <p className="text-gray-600 mt-2">Manage and view your reviews</p>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Farmer Section */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">As a Farmer</h2>
            <p className="text-gray-600 mb-4">
              Review machines and owners you've worked with
            </p>
            <div className="space-y-3">
              <Link
                to="/farmer/my-reviews"
                className="block w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 text-center font-medium"
              >
                My Reviews Given
              </Link>
              <Link
                to="/farmer/bookings"
                className="block w-full border border-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-50 text-center font-medium"
              >
                Bookings to Review
              </Link>
            </div>
          </div>

          {/* Owner Section */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">As an Owner</h2>
            <p className="text-gray-600 mb-4">
              View reviews for your machines and profile
            </p>
            <div className="space-y-3">
              <Link
                to="/owner/reviews"
                className="block w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 text-center font-medium"
              >
                Reviews Received
              </Link>
              <Link
                to="/owner/my-machines"
                className="block w-full border border-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-50 text-center font-medium"
              >
                My Machines
              </Link>
            </div>
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-8 bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-800 mb-2">
            Why Reviews Matter?
          </h3>
          <ul className="text-blue-700 space-y-2">
            <li>✅ Help other farmers choose the right machines</li>
            <li>✅ Build trust in the farming community</li>
            <li>✅ Help owners improve their services</li>
            <li>✅ Earn trust score points for helpful reviews</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ReviewPage;