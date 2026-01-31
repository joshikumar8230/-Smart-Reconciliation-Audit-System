import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./Login";
import Signup from "./Signup";
import Dashboard from "./Dashboard";
import Upload from "./Upload";
import ReportPage from "./ReportPage";
import EditReconciliation from "./EditReconciliation";
import AuditPage from "./AuditPage";
import UploadPreview from "./UploadPreview";
import ProtectedRoutes from "./ProtectedRoutes";


export default function App() {
 

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<ProtectedRoutes>
<Dashboard /></ProtectedRoutes>
} />
        <Route path="/upload" element={<ProtectedRoutes>
<Upload /></ProtectedRoutes>
} />
        <Route path="/report/:uploadJobId" element={<ProtectedRoutes>
<ReportPage /></ProtectedRoutes>
} />
        <Route path="/edit/:reconciliationId" element={<ProtectedRoutes>
<EditReconciliation /></ProtectedRoutes>
} />
        <Route path="/audits" element={<ProtectedRoutes>
<AuditPage /></ProtectedRoutes>
} />
        <Route path="/upload/preview" element={<ProtectedRoutes>
<UploadPreview /></ProtectedRoutes>
} />
      </Routes>
    </BrowserRouter>
  );
}