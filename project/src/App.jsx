import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import Attendance from './components/Attendance.jsx';
import Classes from './components/Classes.jsx';
import CreateStudent from './components/CreateStudent.jsx';
import Dashboard from './components/Dashboard.jsx';
import Layout from './components/Layout.jsx';
import Login from './components/Login.jsx';
import MyAttendance from './components/MyAttendance.jsx';
import MyClasses from './components/MyClasses.jsx';
import Students from './components/Students.jsx';
import TeacherAttendanceView from './components/TeacherAttendanceView.jsx';
import TeacherResultsView from './components/TeacherResultsView.jsx';
import TeacherTimetable from './components/TeacherTimetable.jsx';
import Teachers from './components/Teachers.jsx';
import { AuthProvider, useAuth } from './contexts/AuthContext.jsx';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const AppRoutes = () => {
  const { isAdmin } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout>
              <Navigate to="/dashboard" replace />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        }
      />
      {/* Admin Routes */}
      {isAdmin && (
        <>
          <Route
            path="/classes"
            element={
              <ProtectedRoute>
                <Layout>
                  <Classes />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/students"
            element={
              <ProtectedRoute>
                <Layout>
                  <Students />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/attendance"
            element={
              <ProtectedRoute>
                <Layout>
                  <Attendance />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/create-student"
            element={
              <ProtectedRoute>
                <Layout>
                  <CreateStudent />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/teachers"
            element={
              <ProtectedRoute>
                <Layout>
                  <Teachers />
                </Layout>
              </ProtectedRoute>
            }
          />
        </>
      )}
      {/* Student Routes */}
      {!isAdmin && (
        <>
          <Route
            path="/my-classes"
            element={
              <ProtectedRoute>
                <Layout>
                  <MyClasses />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-attendance"
            element={
              <ProtectedRoute>
                <Layout>
                  <MyAttendance />
                </Layout>
              </ProtectedRoute>
            }
          />
        </>
      )}
      {/* Teacher Routes */}
      <Route
        path="/teachers/:id/attendance"
        element={
          <ProtectedRoute>
            <Layout>
              <TeacherAttendanceView />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/teachers/:id/results"
        element={
          <ProtectedRoute>
            <Layout>
              <TeacherResultsView />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/teachers/:id/timetable"
        element={
          <ProtectedRoute>
            <Layout>
              <TeacherTimetable />
            </Layout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;