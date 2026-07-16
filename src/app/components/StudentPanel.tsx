import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  TextField,
  MenuItem,
  Grid,
  Chip,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  Divider,
  Alert
} from '@mui/material';
import { Search, MenuBook, History, CalendarToday } from '@mui/icons-material';
import { initialBooks, initialLoans, initialUsers, Book, Loan } from '../data/mockData';
import { differenceInDays, format } from 'date-fns';

export default function StudentPanel() {
  const [books, setBooks] = useState<Book[]>(initialBooks);
  const [loans, setLoans] = useState<Loan[]>(initialLoans);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState<'title' | 'author' | 'category'>('title');
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [currentUserId] = useState('U001'); // Simulating logged in student

  const currentUser = initialUsers.find(u => u.id === currentUserId);

  // Filter books based on search
  const filteredBooks = books.filter(book => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    switch (searchType) {
      case 'title':
        return book.title.toLowerCase().includes(term);
      case 'author':
        return book.author.toLowerCase().includes(term);
      case 'category':
        return book.category.toLowerCase().includes(term);
      default:
        return true;
    }
  });

  // Get user's loan history
  const userLoans = loans.filter(loan => loan.userId === currentUserId);

  // Get active loans with due dates
  const activeLoans = userLoans
    .filter(loan => loan.status === 'active' || loan.status === 'overdue')
    .map(loan => {
      const book = books.find(b => b.id === loan.bookId);
      const daysRemaining = differenceInDays(loan.dueDate, new Date());
      return { ...loan, book, daysRemaining };
    });

  // Get loan history
  const loanHistory = userLoans.map(loan => {
    const book = books.find(b => b.id === loan.bookId);
    return { ...loan, book };
  });

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <Card className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <CardContent>
          <Typography variant="h5" className="font-bold mb-2">
            Bienvenido, {currentUser?.name}
          </Typography>
          <Typography variant="body2">
            Código: {currentUser?.code} | Carrera: {currentUser?.career}
          </Typography>
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        {/* Left Column - Search */}
        <Grid item xs={12} lg={8}>
          {/* HU-01: Search Books */}
          <Card>
            <CardContent>
              <Box className="flex items-center gap-2 mb-4">
                <Search className="text-blue-600" />
                <Typography variant="h6">Búsqueda de Libros</Typography>
              </Box>

              <div className="space-y-4">
                <div className="flex gap-4">
                  <TextField
                    select
                    label="Buscar por"
                    value={searchType}
                    onChange={(e) => setSearchType(e.target.value as 'title' | 'author' | 'category')}
                    size="small"
                    sx={{ minWidth: 150 }}
                  >
                    <MenuItem value="title">Título</MenuItem>
                    <MenuItem value="author">Autor</MenuItem>
                    <MenuItem value="category">Categoría</MenuItem>
                  </TextField>

                  <TextField
                    fullWidth
                    label={`Buscar por ${searchType === 'title' ? 'título' : searchType === 'author' ? 'autor' : 'categoría'}`}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    size="small"
                    placeholder="Escriba para buscar..."
                  />
                </div>

                {/* Search Results */}
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {filteredBooks.length === 0 && searchTerm && (
                    <Alert severity="info">No se encontraron libros con ese criterio de búsqueda.</Alert>
                  )}

                  {filteredBooks.map(book => (
                    <Card
                      key={book.id}
                      variant="outlined"
                      className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => setSelectedBook(book)}
                    >
                      <CardContent>
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <Typography variant="subtitle1" className="font-bold text-blue-800">
                              {book.title}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Autor: {book.author}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Categoría: {book.category} | ISBN: {book.isbn}
                            </Typography>
                          </div>
                          <div className="text-right ml-4">
                            {/* HU-02: Show availability status */}
                            <Chip
                              label={book.availableCopies > 0 ? 'Disponible' : 'Prestado'}
                              color={book.availableCopies > 0 ? 'success' : 'error'}
                              size="small"
                              className="mb-2"
                            />
                            {/* HU-09: Show number of copies */}
                            <Typography variant="caption" display="block">
                              {book.availableCopies} de {book.totalCopies} disponibles
                            </Typography>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Selected Book Details */}
          {selectedBook && (
            <Card className="mt-4">
              <CardContent>
                <Box className="flex items-center gap-2 mb-4">
                  <MenuBook className="text-indigo-600" />
                  <Typography variant="h6">Detalles del Libro</Typography>
                </Box>

                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary">Título</Typography>
                    <Typography variant="body1" className="font-bold mb-2">{selectedBook.title}</Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary">Autor</Typography>
                    <Typography variant="body1" className="mb-2">{selectedBook.author}</Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary">ISBN</Typography>
                    <Typography variant="body1" className="mb-2">{selectedBook.isbn}</Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary">Categoría</Typography>
                    <Typography variant="body1" className="mb-2">{selectedBook.category}</Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary">Materia</Typography>
                    <Typography variant="body1" className="mb-2">{selectedBook.subject}</Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary">Ejemplares</Typography>
                    <Typography variant="body1" className="mb-2">
                      <span className="text-green-600 font-bold">{selectedBook.availableCopies}</span> disponibles de{' '}
                      <span className="font-bold">{selectedBook.totalCopies}</span> totales
                    </Typography>
                  </Grid>
                </Grid>

                <Box className="mt-4 p-3 bg-blue-50 rounded">
                  <Typography variant="body2" color="primary">
                    {selectedBook.availableCopies > 0
                      ? `✓ Este libro está disponible. Hay ${selectedBook.availableCopies} ejemplar${selectedBook.availableCopies > 1 ? 'es' : ''} que puede${selectedBook.availableCopies > 1 ? 'n' : ''} ser prestado${selectedBook.availableCopies > 1 ? 's' : ''}.`
                      : '✗ Todos los ejemplares de este libro están prestados actualmente. Intente más tarde.'}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          )}
        </Grid>

        {/* Right Column - User Info */}
        <Grid item xs={12} lg={4}>
          {/* HU-11: Active Loans with Due Dates */}
          <Card className="mb-4">
            <CardContent>
              <Box className="flex items-center gap-2 mb-4">
                <CalendarToday className="text-orange-600" />
                <Typography variant="h6">Mis Préstamos Activos</Typography>
              </Box>

              {activeLoans.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No tienes préstamos activos en este momento.
                </Typography>
              ) : (
                <List>
                  {activeLoans.map((loan, index) => (
                    <div key={loan.id}>
                      {index > 0 && <Divider />}
                      <ListItem>
                        <ListItemText
                          primary={loan.book?.title}
                          secondary={
                            <div>
                              <Typography variant="caption" display="block">
                                Fecha de préstamo: {format(loan.loanDate, 'dd/MM/yyyy')}
                              </Typography>
                              <Typography variant="caption" display="block">
                                Fecha de devolución: {format(loan.dueDate, 'dd/MM/yyyy')}
                              </Typography>
                              <Chip
                                label={
                                  loan.daysRemaining >= 0
                                    ? `${loan.daysRemaining} día${loan.daysRemaining !== 1 ? 's' : ''} restante${loan.daysRemaining !== 1 ? 's' : ''}`
                                    : `${Math.abs(loan.daysRemaining)} día${Math.abs(loan.daysRemaining) !== 1 ? 's' : ''} de retraso`
                                }
                                color={loan.daysRemaining >= 0 ? 'success' : 'error'}
                                size="small"
                                className="mt-1"
                              />
                            </div>
                          }
                        />
                      </ListItem>
                    </div>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>

          {/* HU-10: Loan History */}
          <Card>
            <CardContent>
              <Box className="flex items-center gap-2 mb-4">
                <History className="text-purple-600" />
                <Typography variant="h6">Historial de Préstamos</Typography>
              </Box>

              {loanHistory.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No tienes historial de préstamos.
                </Typography>
              ) : (
                <div className="max-h-96 overflow-y-auto">
                  <List>
                    {loanHistory.map((loan, index) => (
                      <div key={loan.id}>
                        {index > 0 && <Divider />}
                        <ListItem>
                          <ListItemText
                            primary={loan.book?.title}
                            secondary={
                              <div>
                                <Typography variant="caption" display="block">
                                  Préstamo: {format(loan.loanDate, 'dd/MM/yyyy')}
                                </Typography>
                                <Typography variant="caption" display="block">
                                  {loan.returnDate
                                    ? `Devuelto: ${format(loan.returnDate, 'dd/MM/yyyy')}`
                                    : `Vence: ${format(loan.dueDate, 'dd/MM/yyyy')}`
                                  }
                                </Typography>
                                <Chip
                                  label={
                                    loan.status === 'returned' ? 'Devuelto' :
                                    loan.status === 'active' ? 'Activo' :
                                    'Vencido'
                                  }
                                  color={
                                    loan.status === 'returned' ? 'default' :
                                    loan.status === 'active' ? 'primary' :
                                    'error'
                                  }
                                  size="small"
                                  className="mt-1"
                                />
                              </div>
                            }
                          />
                        </ListItem>
                      </div>
                    ))}
                  </List>
                </div>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </div>
  );
}
