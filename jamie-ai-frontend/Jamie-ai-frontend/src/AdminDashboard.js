import React, { useState } from 'react';
import { Search, Home, Settings, LogOut, BarChart3 } from 'lucide-react';

const AdminDashboard = ({ onBackToHome, onLogout, currentView }) => {
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showAssessmentModal, setShowAssessmentModal] = useState(false);

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

  const handleViewAssessment = (student) => {
    setSelectedStudent(student);
    setShowAssessmentModal(true);
  };

  const closeAssessmentModal = () => {
    setShowAssessmentModal(false);
    setSelectedStudent(null);
  };

  // Filter students based on search term
  const filteredStudents = students.filter(student => 
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
              className={`w-8 h-8 flex items-center justify-center rounded transition-colors ${
                currentView === 'homepage' 
                  ? 'text-blue-600 hover:bg-blue-50' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Home className="w-5 h-5" />
            </button>
            <div className="w-px h-6 bg-gray-300"></div>
            <button 
              className={`w-8 h-8 flex items-center justify-center rounded transition-colors ${
                currentView === 'admin' 
                  ? 'text-blue-600 hover:bg-blue-50' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
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
      <div className="flex-1 flex flex-col pt-16 pl-8 overflow-y-auto">
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
            {filteredStudents.length > 0 ? (
              filteredStudents.map((student, index) => (
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
                    <button 
                      onClick={() => handleViewAssessment(student)}
                      className="text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm hover:shadow-md"
                    >
                      View Assessment
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center">
                <p className="text-gray-500 text-lg">No students found matching "{searchTerm}"</p>
                <p className="text-gray-400 text-sm mt-2">Try searching by name, student ID, or email</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Assessment Modal */}
      {showAssessmentModal && selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[80vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {selectedStudent.name}'s Assessment
                </h2>
                <p className="text-sm text-gray-600">
                  Student ID: {selectedStudent.studentId} | DQ Score: {selectedStudent.dqScore}
                </p>
              </div>
              <button
                onClick={closeAssessmentModal}
                className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
              >
                ×
              </button>
            </div>

            {/* Modal Content - Scrollable Chat Session */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-6">
                {/* Welcome Message - Jamie */}
                <div className="flex gap-[30px] items-start">
                  {/* Jamie's Avatar */}
                  <div className="w-[70px] h-[70px] rounded-full bg-[#2C73EB] flex items-end justify-center flex-shrink-0 overflow-hidden">
                    <img 
                      src="/images/cu-JAMIE.png" 
                      alt="Jamie" 
                      className="w-[70px] h-[70px] object-cover object-bottom"
                    />
                  </div>
                  
                  {/* Jamie's Message */}
                  <div className="bg-white rounded-[5px] shadow-[0px_6px_20px_10px_rgba(200,201,201,0.11)] px-[33px] py-6 max-w-[597px]">
                    <div className="text-[16px] text-[#333333] leading-[26px]">
                      <p>Hi {selectedStudent.name}! I'm Jamie, a sophomore mechanical engineering student considering switching to art/design. I'm worried about disappointing my immigrant parents. How would you coach me through this decision?</p>
                    </div>
                  </div>
                </div>

                {/* Student Response */}
                <div className="flex justify-end">
                  <div className="bg-[#e8f1f8] rounded-[5px] shadow-[0px_6px_20px_10px_rgba(200,201,201,0.11)] px-6 py-6 max-w-[605px]">
                    <p className="text-[16px] text-[#363636] leading-[26px]">
                      I understand this is a difficult decision. Let's start by exploring what draws you to art/design. What specific aspects of these fields excite you most?
                    </p>
                  </div>
                </div>

                {/* Jamie's Response */}
                <div className="flex gap-[30px] items-start">
                  {/* Jamie's Avatar */}
                  <div className="w-[70px] h-[70px] rounded-full bg-[#2C73EB] flex items-end justify-center flex-shrink-0 overflow-hidden">
                    <img 
                      src="/images/cu-JAMIE.png" 
                      alt="Jamie" 
                      className="w-[70px] h-[70px] object-cover object-bottom"
                    />
                  </div>
                  
                  {/* Jamie's Message */}
                  <div className="bg-white rounded-[5px] shadow-[0px_6px_20px_10px_rgba(200,201,201,0.11)] px-[33px] py-6 max-w-[597px]">
                    <div className="text-[16px] text-[#333333] leading-[26px]">
                      <p>I've always loved creating things with my hands and expressing myself visually. In my engineering classes, I find myself doodling and thinking about how things could look better, not just function better. But I'm scared I'm not talented enough to succeed in art.</p>
                    </div>
                  </div>
                </div>

                {/* Student Response */}
                <div className="flex justify-end">
                  <div className="bg-[#e8f1f8] rounded-[5px] shadow-[0px_6px_20px_10px_rgba(200,201,201,0.11)] px-6 py-6 max-w-[605px]">
                    <p className="text-[16px] text-[#363636] leading-[26px]">
                      That's a common concern. Let's reframe this - what if we looked at this as developing skills rather than relying on innate talent? What steps could you take to build your confidence in your artistic abilities?
                    </p>
                  </div>
                </div>

                {/* Jamie's Response */}
                <div className="flex gap-[30px] items-start">
                  {/* Jamie's Avatar */}
                  <div className="w-[70px] h-[70px] rounded-full bg-[#2C73EB] flex items-end justify-center flex-shrink-0 overflow-hidden">
                    <img 
                      src="/images/cu-JAMIE.png" 
                      alt="Jamie" 
                      className="w-[70px] h-[70px] object-cover object-bottom"
                    />
                  </div>
                  
                  {/* Jamie's Message */}
                  <div className="bg-white rounded-[5px] shadow-[0px_6px_20px_10px_rgba(200,201,201,0.11)] px-[33px] py-6 max-w-[597px]">
                    <div className="text-[16px] text-[#333333] leading-[26px]">
                      <p>I could take some art classes, maybe join a design club, or even start a portfolio. But what about my parents? They've sacrificed so much for me to have this engineering opportunity.</p>
                    </div>
                  </div>
                </div>

                {/* Student Response */}
                <div className="flex justify-end">
                  <div className="bg-[#e8f1f8] rounded-[5px] shadow-[0px_6px_20px_10px_rgba(200,201,201,0.11)] px-6 py-6 max-w-[605px]">
                    <p className="text-[16px] text-[#363636] leading-[26px]">
                      Your parents' sacrifices show they want the best for you. How might you involve them in this exploration? What if you could show them that design and engineering can complement each other?
                    </p>
                  </div>
                </div>

                {/* Assessment Summary */}
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-semibold text-blue-900 mb-2">Assessment Summary</h3>
                  <p className="text-blue-800 text-sm">
                    <strong>Coaching Quality:</strong> Excellent use of open-ended questions and reframing techniques. 
                    The coach helped Jamie explore both practical and emotional aspects of the decision while 
                    addressing family concerns constructively.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
