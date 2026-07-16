import { useState } from 'react';
import { Tabs, Tab, Box, ThemeProvider, createTheme } from '@mui/material';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import StudentPanel from './components/StudentPanel';
import LibrarianPanel from './components/LibrarianPanel';
import TeacherPanel from './components/TeacherPanel';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

export default function App() {
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  return (
    <ThemeProvider theme={theme}>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        {/* Header */}
        <div className="bg-blue-900 text-white shadow-lg">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center gap-3">
              <LibraryBooksIcon sx={{ fontSize: 40 }} />
              <div>
                <h1 className="text-3xl font-bold">Sistema de Gestión de Biblioteca</h1>
                <p className="text-blue-200">Universidad Nacional del Altiplano - UNA Puno</p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white shadow-md">
          <div className="container mx-auto px-4">
            <Tabs value={activeTab} onChange={handleTabChange} variant="fullWidth">
              <Tab label="Estudiante" />
              <Tab label="Bibliotecario" />
              <Tab label="Docente" />
            </Tabs>
          </div>
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 py-6">
          <Box hidden={activeTab !== 0}>
            <StudentPanel />
          </Box>
          <Box hidden={activeTab !== 1}>
            <LibrarianPanel />
          </Box>
          <Box hidden={activeTab !== 2}>
            <TeacherPanel />
          </Box>
        </div>

        {/* Footer */}
        <div className="mt-12 bg-gray-800 text-white py-6">
          <div className="container mx-auto px-4 text-center">
            <p className="text-gray-400">Metodología Scrum | Curso: Ingeniería de Software | Mayo 2026</p>
          </div>
        </div>
      </div>
    </ThemeProvider>
  );
}
