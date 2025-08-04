import React from 'react';
import 'antd/dist/reset.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Login from './pages/Login/index';
import './i18n';


import Dashboard from './pages/Dashboard';
import StaffPage from './pages/StaffPage';
import AddStaffPage from './pages/AddStaffPage';
import StudyGroupsPage from './pages/StudyGroupsPage';
import GroupDetailsPage from './pages/GroupDetailsPage';
import LessonDistributionPage from './pages/LessonDistributionPage';
import GroupRatingsPage from './pages/GroupRatingsPage';
import GroupEditPage from './pages/GroupEditPage';
import AddStudyGroupPage from './pages/AddStudyGroupPage';
import DirectionsPage from './pages/DirectionsPage';
import TeachersPage from './pages/TeachersPage';
import AddTeacherPage from './pages/AddTeacherPage';
import CurriculumsPage from './pages/CurriculumsPage';
import CurriculumDetailsPage from './pages/CurriculumDetailsPage';
import CurriculumSubjectDistributionPage from './pages/CurriculumSubjectDistributionPage';
import CurriculumEditPage from './pages/CurriculumEditPage';
import AddCurriculumPage from './pages/AddCurriculumPage';
import StudentsPage from './pages/StudentsPage';
import StudentDetailPage from './pages/StudentDetailPage';
import StudentEditPage from './pages/StudentEditPage';
import AddStudentPage from './pages/AddStudentPage';
import GraduatesPage from './pages/GraduatesPage';
import ClassHoursPage from './pages/ClassHoursPage';
import BuildingsPage from './pages/BuildingsPage';
import AddBuildingsPage from './pages/AddBuildingsPage';
import EditBuildingsPage from './pages/ EditBuildingsPage';
import RoomsPage from './pages/RoomsPage';
import AddRoomsPage from './pages/AddRoomsPage';
import ReportsTeachersPage from './pages/ReportsTeachersPage';




const AdminProcessHomePage = () => <p className="p-6 text-xl">Ma'muriy Jarayonlar Asosiy sahifasi</p>;
const StudyProcessHomePage = () => <p className="p-6 text-xl">O'quv Jarayonlari Asosiy sahifasi</p>;
//const DirectionsPage = () => <p className="p-6 text-xl">Yo'nalishlar sahifasi</p>;
//const StudentsPage = () => <p className="p-6 text-xl">Talabalar sahifasi</p>;
//const GraduatesPage = () => <p className="p-6 text-xl">Bitiruvchilar sahifasi</p>;
const LessonHoursPage = () => <p className="p-6 text-xl">Dars soatlari sahifasi</p>;
const TmInfoHomePage = () => <p className="p-6 text-xl">TM Ma'lumotlari Asosiy sahifasi</p>;
//const BuildingsPage = () => <p className="p-6 text-xl">Bino korpus sahifasi</p>;
//const RoomsPage = () => <p className="p-6 text-xl">Xona sahifasi</p>;
const ReportsHomePage = () => <p className="p-6 text-xl">Hisobotlar Asosiy sahifasi</p>;
//const ReportsTeachersPage = () => <p className="p-6 text-xl">O'qituvchilar hisoboti sahifasi</p>;


function App() {
  const isAuthenticated = true;
  return (
    <Router>
      <ThemeProvider>
        <div className="flex flex-col h-screen bg-gray-100">
          {isAuthenticated && <Header />}
          <div className="flex flex-1 overflow-hidden">
            {isAuthenticated && <Sidebar />}
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path='/login' element={<Login />} />


              <Route path="/admin-process" element={<AdminProcessHomePage />} />
              <Route path="/study-process/directions" element={<DirectionsPage />} />
              <Route path="/admin-process/staffs/add" element={<AddStaffPage />} />
              <Route path="/admin-process/staffs" element={<StaffPage />} />
              <Route path="/admin-process/teachers/add" element={<AddTeacherPage />} />
              <Route path="/admin-process/teachers" element={<TeachersPage />} />
              <Route path="/study-process" element={<StudyProcessHomePage />} />
              <Route path="/study-process/plans/add" element={<AddCurriculumPage />} />
              <Route path="/study-process/plans" element={<CurriculumsPage />} />
              <Route path="/study-process/plans/details/:id" element={<CurriculumDetailsPage />} />
              <Route path="/study-process/plans/details/:id/distribute-subjects" element={<CurriculumSubjectDistributionPage />} />
              <Route path="/study-process/plans/details/:id/edit" element={<CurriculumEditPage />} />
              <Route path="/study-process/groups/add" element={<AddStudyGroupPage />} />
              <Route path="/study-process/groups" element={<StudyGroupsPage />} />
              <Route path="/study-process/groups/:id" element={<GroupDetailsPage />} />
              <Route path="/study-process/groups/:groupId/lesson-distribution" element={<LessonDistributionPage />} />
              <Route path="/study-process/groups/:id/ratings" element={<GroupRatingsPage />} />
              <Route path="/study-process/groups/:id/edit" element={<GroupEditPage />} />
              <Route path="/study-process/students/add" element={<AddStudentPage />} />
              <Route path="/study-process/students/:studentId" element={<StudentDetailPage />} />
              <Route path="/study-process/students/:studentId/edit" element={<StudentEditPage />} />
              <Route path="/study-process/students" element={<StudentsPage />} />
              <Route path="/study-process/graduates" element={<GraduatesPage />} />
              <Route path="/study-process/lesson-hours" element={<ClassHoursPage />} />

              <Route path="/tm-info" element={<TmInfoHomePage />} />
              <Route path="/tm-info/buildings/:buildingId/edit" element={<EditBuildingsPage />} />
              <Route path="/tm-info/buildings/add" element={<AddBuildingsPage />} />
              <Route path="/tm-info/buildings" element={<BuildingsPage />} />
              <Route path="/tm-info/rooms/add" element={<AddRoomsPage />} />
              <Route path="/tm-info/rooms/edit/:roomId" element={<AddRoomsPage />} />
              <Route path="/tm-info/rooms" element={<RoomsPage />} />


              <Route path="/reports" element={<ReportsHomePage />} />
              <Route path="/reports/teachers" element={<ReportsTeachersPage />} />


              <Route path="*" element={<p className="p-6 text-xl text-red-500">Sahifa topilmadi (404)</p>} />
            </Routes>
          </div>
        </div>
      </ThemeProvider>
    </Router>
  );
}

export default App;