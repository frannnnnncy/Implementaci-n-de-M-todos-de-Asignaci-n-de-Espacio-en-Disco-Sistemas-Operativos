import { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Tabs,
  Tab,
  TextField,
  Button,
  Grid,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  Divider
} from '@mui/material';
import {
  AddCircle,
  LibraryAdd,
  AssignmentReturn,
  Warning,
  PersonSearch,
  Assessment
} from '@mui/icons-material';
import { initialBooks, initialLoans, initialUsers, Book, Loan, User } from '../data/mockData';
import { differenceInDays, format, startOfMonth, endOfMonth } from 'date-fns';

export default function LibrarianPanel() {
  const [activeTab, setActiveTab] = useState(0);
  const [books, setBooks] = useState<Book[]>(initialBooks);
  const [loans, setLoans] = useState<Loan[]>(initialLoans);
  const [users] = useState<User[]>(initialUsers);

  // New Loan State (HU-03)
  const [newLoan, setNewLoan] = useState({
    userId: '',
    bookId: '',
    loanDate: format(new Date(), 'yyyy-MM-dd'),
    dueDate: format(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd')
  });
  const [loanError, setLoanError] = useState('');
  const [loanSuccess, setLoanSuccess] = useState('');

  // New Book State (HU-04)
  const [newBook, setNewBook] = useState({
    title: '',
    author: '',
    isbn: '',
    category: '',
    subject: '',
    totalCopies: 1
  });
  const [bookError, setBookError] = useState('');
  const [bookSuccess, setBookSuccess] = useState('');

  // Return Book State (HU-05)
  const [returnSearchTerm, setReturnSearchTerm] = useState('');
  const [selectedReturnLoan, setSelectedReturnLoan] = useState<Loan | null>(null);
  const [returnSuccess, setReturnSuccess] = useState('');

  // User Search State (HU-07)
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Report State (HU-12)
  const [reportMonth, setReportMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [reportFilter, setReportFilter] = useState<'all' | 'career' | 'category'>('all');
  const [reportFilterValue, setReportFilterValue] = useState('');

  // HU-03: Register New Loan
  const handleRegisterLoan = () => {
    setLoanError('');
    setLoanSuccess('');

    const book = books.find(b => b.id === newLoan.bookId);
    if (!book) {
      setLoanError('Por favor seleccione un libro.');
      return;
    }

    if (!newLoan.userId) {
      setLoanError('Por favor seleccione un usuario.');
      return;
    }

    if (book.availableCopies <= 0) {
      setLoanError(`El libro "${book.title}" no tiene ejemplares disponibles.`);
      return;
    }

    const loanId = `L${String(loans.length + 1).padStart(3, '0')}`;
    const newLoanEntry: Loan = {
      id: loanId,
      bookId: newLoan.bookId,
      userId: newLoan.userId,
      loanDate: new Date(newLoan.loanDate),
      dueDate: new Date(newLoan.dueDate),
      returnDate: null,
      status: 'active'
    };

    setLoans([...loans, newLoanEntry]);
    setBooks(books.map(b =>
      b.id === newLoan.bookId
        ? { ...b, availableCopies: b.availableCopies - 1 }
        : b
    ));

    setLoanSuccess(`Préstamo registrado exitosamente. ID: ${loanId}`);
    setNewLoan({
      userId: '',
      bookId: '',
      loanDate: format(new Date(), 'yyyy-MM-dd'),
      dueDate: format(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd')
    });
  };

  // HU-04: Add New Book
  const handleAddBook = () => {
    setBookError('');
    setBookSuccess('');

    if (!newBook.title || !newBook.author || !newBook.isbn || !newBook.category) {
      setBookError('Por favor complete todos los campos obligatorios.');
      return;
    }

    const bookId = `B${String(books.length + 1).padStart(3, '0')}`;
    const bookToAdd: Book = {
      id: bookId,
      title: newBook.title,
      author: newBook.author,
      isbn: newBook.isbn,
      category: newBook.category,
      subject: newBook.subject,
      totalCopies: newBook.totalCopies,
      availableCopies: newBook.totalCopies
    };

    setBooks([...books, bookToAdd]);
    setBookSuccess(`Libro agregado exitosamente. ID: ${bookId}`);
    setNewBook({
      title: '',
      author: '',
      isbn: '',
      category: '',
      subject: '',
      totalCopies: 1
    });
  };

  // HU-05: Return Book
  const activeLoansForReturn = loans
    .filter(loan => loan.status === 'active' || loan.status === 'overdue')
    .filter(loan => {
      if (!returnSearchTerm) return true;
      const book = books.find(b => b.id === loan.bookId);
      const user = users.find(u => u.id === loan.userId);
      const term = returnSearchTerm.toLowerCase();
      return (
        book?.title.toLowerCase().includes(term) ||
        user?.name.toLowerCase().includes(term) ||
        user?.code.toLowerCase().includes(term)
      );
    })
    .map(loan => ({
      ...loan,
      book: books.find(b => b.id === loan.bookId),
      user: users.find(u => u.id === loan.userId)
    }));

  const handleReturnBook = (loanId: string) => {
    const loan = loans.find(l => l.id === loanId);
    if (!loan) return;

    setLoans(loans.map(l =>
      l.id === loanId
        ? { ...l, returnDate: new Date(), status: 'returned' as const }
        : l
    ));

    setBooks(books.map(b =>
      b.id === loan.bookId
        ? { ...b, availableCopies: b.availableCopies + 1 }
        : b
    ));

    setReturnSuccess('Libro devuelto exitosamente. Stock actualizado.');
    setTimeout(() => setReturnSuccess(''), 3000);
  };

  // HU-06: Overdue Loans
  const overdueLoans = loans
    .filter(loan => {
      if (loan.status === 'returned') return false;
      return differenceInDays(new Date(), loan.dueDate) > 0;
    })
    .map(loan => ({
      ...loan,
      book: books.find(b => b.id === loan.bookId),
      user: users.find(u => u.id === loan.userId),
      daysOverdue: differenceInDays(new Date(), loan.dueDate)
    }))
    .sort((a, b) => b.daysOverdue - a.daysOverdue);

  // HU-07: User Search
  const searchedUsers = users.filter(user => {
    if (!userSearchTerm) return false;
    const term = userSearchTerm.toLowerCase();
    return (
      user.name.toLowerCase().includes(term) ||
      user.code.toLowerCase().includes(term)
    );
  });

  const userActiveLoans = selectedUser
    ? loans
        .filter(loan => loan.userId === selectedUser.id && (loan.status === 'active' || loan.status === 'overdue'))
        .map(loan => ({
          ...loan,
          book: books.find(b => b.id === loan.bookId)
        }))
    : [];

  // HU-12: Monthly Report
  const getMonthlyReport = () => {
    const [year, month] = reportMonth.split('-').map(Number);
    const monthStart = startOfMonth(new Date(year, month - 1));
    const monthEnd = endOfMonth(new Date(year, month - 1));

    let filteredLoans = loans.filter(loan => {
      const loanDate = new Date(loan.loanDate);
      return loanDate >= monthStart && loanDate <= monthEnd;
    });

    if (reportFilter === 'career' && reportFilterValue) {
      filteredLoans = filteredLoans.filter(loan => {
        const user = users.find(u => u.id === loan.userId);
        return user?.career === reportFilterValue;
      });
    }

    if (reportFilter === 'category' && reportFilterValue) {
      filteredLoans = filteredLoans.filter(loan => {
        const book = books.find(b => b.id === loan.bookId);
        return book?.category === reportFilterValue;
      });
    }

    return filteredLoans.map(loan => ({
      ...loan,
      book: books.find(b => b.id === loan.bookId),
      user: users.find(u => u.id === loan.userId)
    }));
  };

  const careers = Array.from(new Set(users.map(u => u.career)));
  const categories = Array.from(new Set(books.map(b => b.category)));

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
        <CardContent>
          <Typography variant="h5" className="font-bold mb-2">
            Panel de Bibliotecario
          </Typography>
          <Typography variant="body2">
            Gestión completa de préstamos, inventario y usuarios
          </Typography>
        </CardContent>
      </Card>

      <Card>
        <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)} variant="scrollable">
          <Tab icon={<AddCircle />} label="Registrar Préstamo" />
          <Tab icon={<LibraryAdd />} label="Agregar Libro" />
          <Tab icon={<AssignmentReturn />} label="Devoluciones" />
          <Tab icon={<Warning />} label="Préstamos Vencidos" />
          <Tab icon={<PersonSearch />} label="Buscar Usuario" />
          <Tab icon={<Assessment />} label="Reportes" />
        </Tabs>

        <CardContent>
          {/* HU-03: Register Loan */}
          {activeTab === 0 && (
            <div className="space-y-4">
              <Typography variant="h6">Registrar Nuevo Préstamo</Typography>

              {loanError && <Alert severity="error">{loanError}</Alert>}
              {loanSuccess && <Alert severity="success">{loanSuccess}</Alert>}

              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    select
                    fullWidth
                    label="Usuario"
                    value={newLoan.userId}
                    onChange={(e) => setNewLoan({ ...newLoan, userId: e.target.value })}
                  >
                    <MenuItem value="">Seleccione un usuario</MenuItem>
                    {users.map(user => (
                      <MenuItem key={user.id} value={user.id}>
                        {user.name} - {user.code} ({user.role === 'student' ? 'Estudiante' : 'Docente'})
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    select
                    fullWidth
                    label="Libro"
                    value={newLoan.bookId}
                    onChange={(e) => setNewLoan({ ...newLoan, bookId: e.target.value })}
                  >
                    <MenuItem value="">Seleccione un libro</MenuItem>
                    {books.map(book => (
                      <MenuItem key={book.id} value={book.id} disabled={book.availableCopies <= 0}>
                        {book.title} - {book.author} ({book.availableCopies} disponibles)
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Fecha de Préstamo"
                    type="date"
                    value={newLoan.loanDate}
                    onChange={(e) => setNewLoan({ ...newLoan, loanDate: e.target.value })}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Fecha Límite"
                    type="date"
                    value={newLoan.dueDate}
                    onChange={(e) => setNewLoan({ ...newLoan, dueDate: e.target.value })}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleRegisterLoan}
                    size="large"
                  >
                    Registrar Préstamo
                  </Button>
                </Grid>
              </Grid>
            </div>
          )}

          {/* HU-04: Add Book */}
          {activeTab === 1 && (
            <div className="space-y-4">
              <Typography variant="h6">Agregar Nuevo Libro al Inventario</Typography>

              {bookError && <Alert severity="error">{bookError}</Alert>}
              {bookSuccess && <Alert severity="success">{bookSuccess}</Alert>}

              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Título *"
                    value={newBook.title}
                    onChange={(e) => setNewBook({ ...newBook, title: e.target.value })}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Autor *"
                    value={newBook.author}
                    onChange={(e) => setNewBook({ ...newBook, author: e.target.value })}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="ISBN *"
                    value={newBook.isbn}
                    onChange={(e) => setNewBook({ ...newBook, isbn: e.target.value })}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Categoría *"
                    value={newBook.category}
                    onChange={(e) => setNewBook({ ...newBook, category: e.target.value })}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Materia"
                    value={newBook.subject}
                    onChange={(e) => setNewBook({ ...newBook, subject: e.target.value })}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Cantidad de Ejemplares *"
                    type="number"
                    value={newBook.totalCopies}
                    onChange={(e) => setNewBook({ ...newBook, totalCopies: parseInt(e.target.value) || 1 })}
                    inputProps={{ min: 1 }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleAddBook}
                    size="large"
                  >
                    Agregar Libro
                  </Button>
                </Grid>
              </Grid>
            </div>
          )}

          {/* HU-05: Return Books */}
          {activeTab === 2 && (
            <div className="space-y-4">
              <Typography variant="h6">Registrar Devolución</Typography>

              {returnSuccess && <Alert severity="success">{returnSuccess}</Alert>}

              <TextField
                fullWidth
                label="Buscar préstamo por usuario o libro"
                value={returnSearchTerm}
                onChange={(e) => setReturnSearchTerm(e.target.value)}
                placeholder="Nombre de usuario, código o título del libro"
              />

              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Usuario</TableCell>
                      <TableCell>Libro</TableCell>
                      <TableCell>Fecha Préstamo</TableCell>
                      <TableCell>Fecha Límite</TableCell>
                      <TableCell>Estado</TableCell>
                      <TableCell>Acción</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {activeLoansForReturn.map((loan) => (
                      <TableRow key={loan.id}>
                        <TableCell>
                          {loan.user?.name}<br />
                          <Typography variant="caption">{loan.user?.code}</Typography>
                        </TableCell>
                        <TableCell>{loan.book?.title}</TableCell>
                        <TableCell>{format(loan.loanDate, 'dd/MM/yyyy')}</TableCell>
                        <TableCell>{format(loan.dueDate, 'dd/MM/yyyy')}</TableCell>
                        <TableCell>
                          <Chip
                            label={loan.status === 'active' ? 'Activo' : 'Vencido'}
                            color={loan.status === 'active' ? 'primary' : 'error'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="contained"
                            color="success"
                            size="small"
                            onClick={() => handleReturnBook(loan.id)}
                          >
                            Devolver
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </div>
          )}

          {/* HU-06: Overdue Loans */}
          {activeTab === 3 && (
            <div className="space-y-4">
              <Box className="flex items-center justify-between">
                <Typography variant="h6">Préstamos Vencidos</Typography>
                <Chip
                  label={`${overdueLoans.length} préstamo${overdueLoans.length !== 1 ? 's' : ''} vencido${overdueLoans.length !== 1 ? 's' : ''}`}
                  color="error"
                />
              </Box>

              {overdueLoans.length === 0 ? (
                <Alert severity="success">No hay préstamos vencidos.</Alert>
              ) : (
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Usuario</TableCell>
                        <TableCell>Libro</TableCell>
                        <TableCell>Fecha Límite</TableCell>
                        <TableCell>Días de Retraso</TableCell>
                        <TableCell>Contacto</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {overdueLoans.map((loan) => (
                        <TableRow key={loan.id}>
                          <TableCell>
                            <div>
                              <Typography variant="body2" className="font-bold">
                                {loan.user?.name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {loan.user?.code}
                              </Typography>
                            </div>
                          </TableCell>
                          <TableCell>{loan.book?.title}</TableCell>
                          <TableCell>{format(loan.dueDate, 'dd/MM/yyyy')}</TableCell>
                          <TableCell>
                            <Chip
                              label={`${loan.daysOverdue} día${loan.daysOverdue !== 1 ? 's' : ''}`}
                              color="error"
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="caption">{loan.user?.email}</Typography>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </div>
          )}

          {/* HU-07: User Search */}
          {activeTab === 4 && (
            <div className="space-y-4">
              <Typography variant="h6">Buscar Usuario y Ver Préstamos</Typography>

              <TextField
                fullWidth
                label="Buscar usuario por nombre o código"
                value={userSearchTerm}
                onChange={(e) => setUserSearchTerm(e.target.value)}
                placeholder="Ingrese nombre o código del usuario"
              />

              {searchedUsers.length > 0 && (
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle2" className="mb-2">Resultados:</Typography>
                    <List>
                      {searchedUsers.map((user, index) => (
                        <div key={user.id}>
                          {index > 0 && <Divider />}
                          <ListItem
                            button
                            onClick={() => setSelectedUser(user)}
                            selected={selectedUser?.id === user.id}
                          >
                            <ListItemText
                              primary={user.name}
                              secondary={`${user.code} | ${user.career} | ${user.role === 'student' ? 'Estudiante' : 'Docente'}`}
                            />
                          </ListItem>
                        </div>
                      ))}
                    </List>
                  </CardContent>
                </Card>
              )}

              {selectedUser && (
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" className="mb-4">
                      Préstamos Activos de {selectedUser.name}
                    </Typography>

                    {userActiveLoans.length === 0 ? (
                      <Alert severity="info">Este usuario no tiene préstamos activos.</Alert>
                    ) : (
                      <TableContainer component={Paper}>
                        <Table>
                          <TableHead>
                            <TableRow>
                              <TableCell>Libro</TableCell>
                              <TableCell>Fecha Préstamo</TableCell>
                              <TableCell>Fecha Límite</TableCell>
                              <TableCell>Estado</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {userActiveLoans.map((loan) => (
                              <TableRow key={loan.id}>
                                <TableCell>{loan.book?.title}</TableCell>
                                <TableCell>{format(loan.loanDate, 'dd/MM/yyyy')}</TableCell>
                                <TableCell>{format(loan.dueDate, 'dd/MM/yyyy')}</TableCell>
                                <TableCell>
                                  <Chip
                                    label={loan.status === 'active' ? 'Activo' : 'Vencido'}
                                    color={loan.status === 'active' ? 'primary' : 'error'}
                                    size="small"
                                  />
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* HU-12: Monthly Reports */}
          {activeTab === 5 && (
            <div className="space-y-4">
              <Typography variant="h6">Reporte Mensual de Préstamos</Typography>

              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Mes"
                    type="month"
                    value={reportMonth}
                    onChange={(e) => setReportMonth(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <TextField
                    select
                    fullWidth
                    label="Filtrar por"
                    value={reportFilter}
                    onChange={(e) => {
                      setReportFilter(e.target.value as any);
                      setReportFilterValue('');
                    }}
                  >
                    <MenuItem value="all">Todos</MenuItem>
                    <MenuItem value="career">Carrera</MenuItem>
                    <MenuItem value="category">Categoría</MenuItem>
                  </TextField>
                </Grid>

                {reportFilter === 'career' && (
                  <Grid item xs={12} md={4}>
                    <TextField
                      select
                      fullWidth
                      label="Carrera"
                      value={reportFilterValue}
                      onChange={(e) => setReportFilterValue(e.target.value)}
                    >
                      <MenuItem value="">Todas</MenuItem>
                      {careers.map(career => (
                        <MenuItem key={career} value={career}>{career}</MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                )}

                {reportFilter === 'category' && (
                  <Grid item xs={12} md={4}>
                    <TextField
                      select
                      fullWidth
                      label="Categoría"
                      value={reportFilterValue}
                      onChange={(e) => setReportFilterValue(e.target.value)}
                    >
                      <MenuItem value="">Todas</MenuItem>
                      {categories.map(category => (
                        <MenuItem key={category} value={category}>{category}</MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                )}
              </Grid>

              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle1" className="mb-2">
                    Total de préstamos: {getMonthlyReport().length}
                  </Typography>

                  <TableContainer component={Paper}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Usuario</TableCell>
                          <TableCell>Carrera</TableCell>
                          <TableCell>Libro</TableCell>
                          <TableCell>Categoría</TableCell>
                          <TableCell>Fecha Préstamo</TableCell>
                          <TableCell>Estado</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {getMonthlyReport().map((loan) => (
                          <TableRow key={loan.id}>
                            <TableCell>{loan.user?.name}</TableCell>
                            <TableCell>{loan.user?.career}</TableCell>
                            <TableCell>{loan.book?.title}</TableCell>
                            <TableCell>{loan.book?.category}</TableCell>
                            <TableCell>{format(loan.loanDate, 'dd/MM/yyyy')}</TableCell>
                            <TableCell>
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
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
