import React, { useState } from 'react';
import { Search, Home, Settings, LogOut, BarChart3 } from 'lucide-react';

const AdminDashboard = ({ onBackToHome, onLogout }) => {
  // Demo student data with realistic information
  const [students] = useState([
    {
      id: 1,
      name: 'Alex Chen',
      studentId: 'A123456',
      dqScore: '0.85',
      email: 'alex.chen@hawk.illinoistech.edu'
    },
    {
      id: 2,
      name: 'Maria Rodriguez',
      studentId: 'A123457',
      dqScore: '0.72',
      email: 'maria.rodriguez@hawk.illinoistech.edu'
    },
    {
      id: 3,
      name: 'David Kim',
      studentId: 'A123458',
      dqScore: '0.91',
      email: 'david.kim@hawk.illinoistech.edu'
    },
    {
      id: 4,
      name: 'Sarah Johnson',
      studentId: 'A123459',
      dqScore: '0.68',
      email: 'sarah.johnson@hawk.illinoistech.edu'
    },
    {
      id: 5,
      name: 'Michael Brown',
      studentId: 'A123460',
      dqScore: '0.79',
      email: 'michael.brown@hawk.illinoistech.edu'
    },
    {
      id: 6,
      name: 'Emily Davis',
      studentId: 'A123461',
      dqScore: '0.83',
      email: 'emily.davis@hawk.illinoistech.edu'
    },
    {
      id: 7,
      name: 'James Wilson',
      studentId: 'A123462',
      dqScore: '0.76',
      email: 'james.wilson@hawk.illinoistech.edu'
    },
    {
      id: 8,
      name: 'Lisa Anderson',
      studentId: 'A123463',
      dqScore: '0.88',
      email: 'lisa.anderson@hawk.illinoistech.edu'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="h-screen bg-white flex overflow-hidden">
      {/* Left Sidebar */}
      <div className="w-80 bg-gray-50 flex flex-col flex-shrink-0">
        {/* Decision Coach Title */}
        <div style={{ padding: '29px' }}>
          <div className="text-black font-bold text-[25px] leading-[28px]">
            <div>Decision</div>
            <div>Coach</div>
          </div>
        </div>
        
        {/* Navigation Icons */}
        <div className="flex-1 flex items-end p-6">
          <div className="bg-white rounded-lg shadow-lg p-4 flex items-center space-x-4 border w-full">
            <button 
              onClick={onBackToHome}
              className="w-8 h-8 flex items-center justify-center text-blue-600 hover:bg-blue-50 rounded transition-colors"
            >
              <Home className="w-5 h-5" />
            </button>
            <div className="w-px h-6 bg-gray-300"></div>
            <button 
              className="w-8 h-8 flex items-center justify-center text-green-600 hover:bg-green-50 rounded transition-colors"
              title="Admin Dashboard"
            >
              <BarChart3 className="w-5 h-5" />
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
      <div className="flex-1 flex flex-col pt-16 overflow-y-auto">
        {/* Header with User Greeting */}
        <div className="p-6">
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
          <div className="grid grid-cols-4 gap-4 py-4 px-4 border-b border-gray-200 text-sm font-semibold text-gray-600 bg-gray-50">
            <div>Name</div>
            <div>Student ID</div>
            <div>DQ Score</div>
            <div>View Assessment</div>
          </div>

          {/* Student Rows */}
          <div className="space-y-1">
            {students.map((student, index) => (
              <div key={student.id} className="grid grid-cols-4 gap-4 py-5 px-4 border-b border-gray-100 hover:bg-gray-50 transition-colors">
                <div className="flex flex-col justify-center">
                  <div className="text-gray-900 font-medium text-base mb-1">{student.name}</div>
                  <div className="text-blue-600 text-sm hover:underline cursor-pointer">{student.email}</div>
                </div>
                <div className="flex items-center">
                  <span className="text-gray-700 font-mono text-sm bg-gray-100 px-2 py-1 rounded">{student.studentId}</span>
                </div>
                <div className="flex items-center">
                  <span className="text-gray-900 font-semibold text-lg">{student.dqScore}</span>
                </div>
                <div className="flex items-center">
                  <button className="text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm hover:shadow-md">
                    View Assessment
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
