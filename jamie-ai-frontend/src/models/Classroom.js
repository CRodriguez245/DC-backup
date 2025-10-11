// Classroom Data Model for Teacher-Student linking
export class Classroom {
  constructor(classroomData = {}) {
    this.id = classroomData.id || this.generateId();
    this.name = classroomData.name || '';
    this.code = classroomData.code || this.generateClassCode();
    this.teacherId = classroomData.teacherId || '';
    this.teacherName = classroomData.teacherName || '';
    this.studentIds = classroomData.studentIds || [];
    this.createdAt = classroomData.createdAt || new Date().toISOString();
    this.updatedAt = classroomData.updatedAt || new Date().toISOString();
    this.description = classroomData.description || '';
    this.isActive = classroomData.isActive !== undefined ? classroomData.isActive : true;
  }

  generateId() {
    return 'classroom_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
  }

  generateClassCode() {
    // Generate a 6-character code (e.g., ABC123)
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    let code = '';
    
    // 3 letters
    for (let i = 0; i < 3; i++) {
      code += letters.charAt(Math.floor(Math.random() * letters.length));
    }
    
    // 3 numbers
    for (let i = 0; i < 3; i++) {
      code += numbers.charAt(Math.floor(Math.random() * numbers.length));
    }
    
    return code;
  }

  addStudent(studentId) {
    if (!this.studentIds.includes(studentId)) {
      this.studentIds.push(studentId);
      this.updatedAt = new Date().toISOString();
      return true;
    }
    return false;
  }

  removeStudent(studentId) {
    const index = this.studentIds.indexOf(studentId);
    if (index > -1) {
      this.studentIds.splice(index, 1);
      this.updatedAt = new Date().toISOString();
      return true;
    }
    return false;
  }

  getStudentCount() {
    return this.studentIds.length;
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      code: this.code,
      teacherId: this.teacherId,
      teacherName: this.teacherName,
      studentIds: this.studentIds,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      description: this.description,
      isActive: this.isActive
    };
  }

  static fromJSON(jsonData) {
    return new Classroom(jsonData);
  }
}

// Classroom Management Utilities
export class ClassroomManager {
  static STORAGE_KEY = 'decision_coach_classrooms';
  
  static saveClassrooms(classrooms) {
    try {
      const classroomsData = classrooms.map(c => c.toJSON());
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(classroomsData));
      return true;
    } catch (error) {
      console.error('Failed to save classrooms:', error);
      return false;
    }
  }
  
  static loadClassrooms() {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      if (data) {
        const classroomsData = JSON.parse(data);
        return classroomsData.map(c => Classroom.fromJSON(c));
      }
      return [];
    } catch (error) {
      console.error('Failed to load classrooms:', error);
      return [];
    }
  }
  
  static createClassroom(classroomData) {
    try {
      const classrooms = this.loadClassrooms();
      const newClassroom = new Classroom(classroomData);
      classrooms.push(newClassroom);
      
      if (this.saveClassrooms(classrooms)) {
        return { success: true, classroom: newClassroom };
      } else {
        throw new Error('Failed to save classroom');
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
  
  static getClassroom(classroomId) {
    const classrooms = this.loadClassrooms();
    return classrooms.find(c => c.id === classroomId);
  }
  
  static getClassroomByCode(code) {
    const classrooms = this.loadClassrooms();
    return classrooms.find(c => c.code === code.toUpperCase());
  }
  
  static getTeacherClassrooms(teacherId) {
    const classrooms = this.loadClassrooms();
    return classrooms.filter(c => c.teacherId === teacherId);
  }
  
  static getStudentClassrooms(studentId) {
    const classrooms = this.loadClassrooms();
    return classrooms.filter(c => c.studentIds.includes(studentId));
  }
  
  static updateClassroom(classroomId, updates) {
    try {
      const classrooms = this.loadClassrooms();
      const index = classrooms.findIndex(c => c.id === classroomId);
      
      if (index === -1) {
        throw new Error('Classroom not found');
      }
      
      // Update the classroom
      const classroom = classrooms[index];
      Object.assign(classroom, updates);
      classroom.updatedAt = new Date().toISOString();
      
      if (this.saveClassrooms(classrooms)) {
        return { success: true, classroom: classroom };
      } else {
        throw new Error('Failed to save classroom');
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
  
  static addStudentToClassroom(classroomCode, studentId) {
    try {
      const classroom = this.getClassroomByCode(classroomCode);
      
      if (!classroom) {
        throw new Error('Classroom not found. Please check the code.');
      }
      
      if (classroom.addStudent(studentId)) {
        const classrooms = this.loadClassrooms();
        const index = classrooms.findIndex(c => c.id === classroom.id);
        classrooms[index] = classroom;
        
        if (this.saveClassrooms(classrooms)) {
          return { success: true, classroom: classroom };
        } else {
          throw new Error('Failed to save classroom');
        }
      } else {
        throw new Error('Student is already enrolled in this classroom');
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
  
  static removeStudentFromClassroom(classroomId, studentId) {
    try {
      const classrooms = this.loadClassrooms();
      const index = classrooms.findIndex(c => c.id === classroomId);
      
      if (index === -1) {
        throw new Error('Classroom not found');
      }
      
      const classroom = classrooms[index];
      if (classroom.removeStudent(studentId)) {
        if (this.saveClassrooms(classrooms)) {
          return { success: true, classroom: classroom };
        } else {
          throw new Error('Failed to save classroom');
        }
      } else {
        throw new Error('Student not found in classroom');
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
  
  static deleteClassroom(classroomId) {
    try {
      const classrooms = this.loadClassrooms();
      const filteredClassrooms = classrooms.filter(c => c.id !== classroomId);
      
      if (this.saveClassrooms(filteredClassrooms)) {
        return { success: true };
      } else {
        throw new Error('Failed to delete classroom');
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}
