import React, { useState } from 'react';
import { Search, Eye, Home, Settings, LogOut } from 'lucide-react';

const AdminDashboard = ({ onBackToHome, onLogout }) => {
  // Demo student data matching the design
  const [students] = useState([
    {
      id: 1,
      name: 'Jane Doe',
      studentId: '740',
      dqScore: '5 years',
      email: 'Janedoe@hawk.illinoistech.edu'
    },
    {
      id: 2,
      name: 'Jane Doe',
      studentId: '740',
      dqScore: '5 years',
      email: 'Janedoe@hawk.illinoistech.edu'
    },
    {
      id: 3,
      name: 'Jane Doe',
      studentId: '740',
      dqScore: '5 years',
      email: 'Janedoe@hawk.illinoistech.edu'
    },
    {
      id: 4,
      name: 'Jane Doe',
      studentId: '740',
      dqScore: '5 years',
      email: 'Janedoe@hawk.illinoistech.edu'
    },
    {
      id: 5,
      name: 'Jane Doe',
      studentId: '740',
      dqScore: '5 years',
      email: 'Janedoe@hawk.illinoistech.edu'
    },
    {
      id: 6,
      name: 'Jane Doe',
      studentId: '740',
      dqScore: '5 years',
      email: 'Janedoe@hawk.illinoistech.edu'
    },
    {
      id: 7,
      name: 'Jane Doe',
      studentId: '740',
      dqScore: '5 years',
      email: 'Janedoe@hawk.illinoistech.edu'
    },
    {
      id: 8,
      name: 'Jane Doe',
      studentId: '740',
      dqScore: '5 years',
      email: 'Janedoe@hawk.illinoistech.edu'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="min-h-screen bg-white flex">
      {/* Left Sidebar */}
      <div className="w-80 bg-gray-50 flex flex-col">
        {/* Decision Coach Title */}
        <div className="p-6">
          <div className="text-black font-bold text-[25px] leading-[28px]">
            <div>Decision</div>
            <div>Coach</div>
          </div>
        </div>
        
        {/* Navigation Icons */}
        <div className="flex-1 flex items-end p-6">
          <div className="bg-white rounded-lg shadow-sm p-4 flex items-center space-x-4 w-full">
            <button 
              onClick={onBackToHome}
              className="w-8 h-8 flex items-center justify-center text-white bg-blue-600 rounded transition-colors"
            >
              <Home className="w-5 h-5" />
            </button>
            <div className="w-px h-6 bg-gray-300"></div>
            <button 
              className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-50 rounded transition-colors"
            >
              <Settings className="w-5 h-5" />
            </button>
            <div className="w-px h-6 bg-gray-300"></div>
            <button 
              onClick={onLogout}
              className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-50 rounded transition-colors"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Right Main Content */}
      <div className="flex-1 flex flex-col pt-16">
        {/* Header with User Greeting */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">J</span>
            </div>
            <span className="text-gray-700 font-medium">Welcome back, Jeremy!</span>
          </div>
        </div>

        {/* Search Bar */}
        <div className="p-6">
          <div className="relative max-w-2xl">
            <input
              type="text"
              placeholder="Search for a Student, #A number Eg. Tanya"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-600"
            />
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-600" />
          </div>
        </div>

        {/* Student Table */}
        <div className="flex-1 px-6 pb-6">
          {/* Table Headers */}
          <div className="grid grid-cols-5 gap-4 py-3 border-b border-gray-200 text-sm font-medium text-gray-500">
            <div>Name</div>
            <div>Student ID</div>
            <div>DQ Score</div>
            <div>Email</div>
            <div></div>
          </div>

          {/* Student Rows */}
          <div className="space-y-2">
            {students.map((student, index) => (
              <div key={student.id} className="grid grid-cols-5 gap-4 py-4 border-b border-gray-100 hover:bg-gray-50">
                <div className="flex items-center">
                  <span className="text-gray-400 text-sm mr-3">{index + 1}</span>
                  <span className="text-gray-900">{student.name}</span>
                </div>
                <div className="text-gray-900">{student.studentId}</div>
                <div className="text-gray-900">{student.dqScore}</div>
                <div className="text-blue-600 underline">{student.email}</div>
                <div className="flex justify-end">
                  <button className="text-blue-600 hover:text-blue-800">
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
