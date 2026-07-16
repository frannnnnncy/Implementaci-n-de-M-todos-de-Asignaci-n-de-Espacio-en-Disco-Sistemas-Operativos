import { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  TextField,
  MenuItem,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Alert
} from '@mui/material';
import { MenuBook, School } from '@mui/icons-material';
import { initialBooks, initialUsers, Book } from '../data/mockData';

export default function TeacherPanel() {
  const [books] = useState<Book[]>(initialBooks);
  const [filterType, setFilterType] = useState<'subject' | 'category'>('subject');
  const [filterValue, setFilterValue] = useState('');
  const [currentTeacherId] = useState('T001'); // Simulating logged in teacher

  const currentTeacher = initialUsers.find(u => u.id === currentTeacherId);

  // Get unique subjects and categories
  const subjects = Array.from(new Set(books.map(b => b.subject)));
  const categories = Array.from(new Set(books.map(b => b.category)));

  // Filter books based on selection
  const filteredBooks = books.filter(book => {
    if (!filterValue) return true;
    if (filterType === 'subject') {
      return book.subject === filterValue;
    } else {
      return book.category === filterValue;
    }
  });

  // Group books by category for summary
  const booksByCategory = filteredBooks.reduce((acc, book) => {
    if (!acc[book.category]) {
      acc[book.category] = {
        total: 0,
        available: 0,
        books: []
      };
    }
    acc[book.category].total += book.totalCopies;
    acc[book.category].available += book.availableCopies;
    acc[book.category].books.push(book);
    return acc;
  }, {} as Record<string, { total: number; available: number; books: Book[] }>);

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <Card className="bg-gradient-to-r from-green-600 to-teal-600 text-white">
        <CardContent>
          <Typography variant="h5" className="font-bold mb-2">
            Panel de Docente
          </Typography>
          <Typography variant="body2">
            {currentTeacher?.name} | {currentTeacher?.career}
          </Typography>
        </CardContent>
      </Card>

      {/* HU-08: Catalog filtered by subject or career */}
      <Card>
        <CardContent>
          <Box className="flex items-center gap-2 mb-4">
            <MenuBook className="text-green-600" />
            <Typography variant="h6">Consulta del Catálogo Bibliográfico</Typography>
          </Box>

          <Typography variant="body2" color="text.secondary" className="mb-4">
            Busque libros por materia o categoría para recomendar a sus estudiantes.
            Vea la disponibilidad actual de cada título.
          </Typography>

          {/* Filters */}
          <Grid container spacing={3} className="mb-6">
            <Grid item xs={12} md={6}>
              <TextField
                select
                fullWidth
                label="Filtrar por"
                value={filterType}
                onChange={(e) => {
                  setFilterType(e.target.value as 'subject' | 'category');
                  setFilterValue('');
                }}
              >
                <MenuItem value="subject">Materia</MenuItem>
                <MenuItem value="category">Categoría</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                select
                fullWidth
                label={filterType === 'subject' ? 'Seleccione Materia' : 'Seleccione Categoría'}
                value={filterValue}
                onChange={(e) => setFilterValue(e.target.value)}
              >
                <MenuItem value="">Todas</MenuItem>
                {(filterType === 'subject' ? subjects : categories).map(item => (
                  <MenuItem key={item} value={item}>{item}</MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>

          {/* Summary Cards */}
          {filterValue && (
            <Grid container spacing={3} className="mb-6">
              {Object.entries(booksByCategory).map(([category, data]) => (
                <Grid item xs={12} md={4} key={category}>
                  <Card variant="outlined" className="bg-green-50">
                    <CardContent>
                      <Typography variant="subtitle2" color="text.secondary">
                        {category}
                      </Typography>
                      <Typography variant="h5" className="font-bold text-green-700">
                        {data.books.length}
                      </Typography>
                      <Typography variant="body2">
                        {data.books.length === 1 ? 'título' : 'títulos'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {data.available} de {data.total} ejemplares disponibles
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}

          {/* Books Table */}
          {filteredBooks.length === 0 ? (
            <Alert severity="info">
              {filterValue
                ? 'No hay libros en esta selección.'
                : 'Seleccione una materia o categoría para ver los libros disponibles.'
              }
            </Alert>
          ) : (
            <div>
              <Typography variant="subtitle1" className="mb-3 font-bold">
                Libros encontrados: {filteredBooks.length}
              </Typography>

              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Título</TableCell>
                      <TableCell>Autor</TableCell>
                      <TableCell>Categoría</TableCell>
                      <TableCell>Materia</TableCell>
                      <TableCell align="center">Ejemplares Totales</TableCell>
                      <TableCell align="center">Disponibles</TableCell>
                      <TableCell>Estado</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredBooks.map((book) => (
                      <TableRow
                        key={book.id}
                        sx={{
                          backgroundColor: book.availableCopies === 0 ? '#ffebee' : 'inherit'
                        }}
                      >
                        <TableCell>
                          <Typography variant="body2" className="font-bold">
                            {book.title}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            ISBN: {book.isbn}
                          </Typography>
                        </TableCell>
                        <TableCell>{book.author}</TableCell>
                        <TableCell>{book.category}</TableCell>
                        <TableCell>{book.subject}</TableCell>
                        <TableCell align="center">
                          <Typography variant="body1" className="font-bold">
                            {book.totalCopies}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Typography
                            variant="body1"
                            className="font-bold"
                            color={book.availableCopies > 0 ? 'success.main' : 'error.main'}
                          >
                            {book.availableCopies}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={book.availableCopies > 0 ? 'Disponible' : 'Agotado'}
                            color={book.availableCopies > 0 ? 'success' : 'error'}
                            size="small"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Recommendations Section */}
              <Box className="mt-6 p-4 bg-blue-50 rounded">
                <Box className="flex items-center gap-2 mb-2">
                  <School className="text-blue-600" />
                  <Typography variant="subtitle1" className="font-bold">
                    Recomendaciones para Asignación de Textos
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  • Los libros marcados como "Disponible" pueden ser recomendados con seguridad a sus estudiantes.
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  • Para libros "Agotado", considere asignar lectura en sala o solicitar más ejemplares a la dirección.
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  • Si un texto es obligatorio, verifique que haya suficientes ejemplares para toda la clase.
                </Typography>
              </Box>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Additional Info Card */}
      <Card variant="outlined">
        <CardContent>
          <Typography variant="h6" className="mb-3">
            Información Útil
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <Box className="p-3 bg-gray-50 rounded">
                <Typography variant="subtitle2" className="font-bold mb-1">
                  Total de Títulos
                </Typography>
                <Typography variant="h4" className="text-green-600">
                  {books.length}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box className="p-3 bg-gray-50 rounded">
                <Typography variant="subtitle2" className="font-bold mb-1">
                  Ejemplares Totales
                </Typography>
                <Typography variant="h4" className="text-blue-600">
                  {books.reduce((sum, book) => sum + book.totalCopies, 0)}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box className="p-3 bg-gray-50 rounded">
                <Typography variant="subtitle2" className="font-bold mb-1">
                  Disponibles Ahora
                </Typography>
                <Typography variant="h4" className="text-purple-600">
                  {books.reduce((sum, book) => sum + book.availableCopies, 0)}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </div>
  );
}
