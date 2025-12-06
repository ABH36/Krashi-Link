import React from 'react';
import UserTable from '../../components/admin/UserTable';

const Verification = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">User Verification</h1>
        <p className="text-gray-600">Verify and manage platform users</p>
      </div>
      <UserTable />
    </div>
  );
};

export default Verification;