export interface Book {
  id: string;
  title: string;
  author: string;
  isbn: string;
  category: string;
  subject: string;
  totalCopies: number;
  availableCopies: number;
}

export interface User {
  id: string;
  name: string;
  code: string;
  email: string;
  role: 'student' | 'teacher';
  career: string;
}

export interface Loan {
  id: string;
  bookId: string;
  userId: string;
  loanDate: Date;
  dueDate: Date;
  returnDate: Date | null;
  status: 'active' | 'returned' | 'overdue';
}

export const initialBooks: Book[] = [
  {
    id: 'B001',
    title: 'Fundamentos de Programación',
    author: 'Luis Joyanes Aguilar',
    isbn: '978-8448156602',
    category: 'Programación',
    subject: 'Ingeniería de Sistemas',
    totalCopies: 5,
    availableCopies: 2
  },
  {
    id: 'B002',
    title: 'Ingeniería de Software',
    author: 'Ian Sommerville',
    isbn: '978-6073221337',
    category: 'Ingeniería de Software',
    subject: 'Ingeniería de Sistemas',
    totalCopies: 4,
    availableCopies: 0
  },
  {
    id: 'B003',
    title: 'Base de Datos: Diseño y Gestión',
    author: 'Ramez Elmasri',
    isbn: '978-8478290857',
    category: 'Bases de Datos',
    subject: 'Ingeniería de Sistemas',
    totalCopies: 6,
    availableCopies: 3
  },
  {
    id: 'B004',
    title: 'Redes de Computadoras',
    author: 'Andrew S. Tanenbaum',
    isbn: '978-6073238939',
    category: 'Redes',
    subject: 'Ingeniería de Sistemas',
    totalCopies: 3,
    availableCopies: 1
  },
  {
    id: 'B005',
    title: 'Algoritmos y Estructuras de Datos',
    author: 'Niklaus Wirth',
    isbn: '978-0133766882',
    category: 'Algoritmos',
    subject: 'Ingeniería de Sistemas',
    totalCopies: 7,
    availableCopies: 4
  },
  {
    id: 'B006',
    title: 'Sistemas Operativos Modernos',
    author: 'Andrew S. Tanenbaum',
    isbn: '978-6073244558',
    category: 'Sistemas Operativos',
    subject: 'Ingeniería de Sistemas',
    totalCopies: 4,
    availableCopies: 2
  },
  {
    id: 'B007',
    title: 'Cálculo Diferencial e Integral',
    author: 'James Stewart',
    isbn: '978-6075195698',
    category: 'Matemáticas',
    subject: 'Matemáticas',
    totalCopies: 8,
    availableCopies: 5
  },
  {
    id: 'B008',
    title: 'Física Universitaria Vol. 1',
    author: 'Sears y Zemansky',
    isbn: '978-6073221467',
    category: 'Física',
    subject: 'Física',
    totalCopies: 6,
    availableCopies: 3
  },
  {
    id: 'B009',
    title: 'Metodologías Ágiles',
    author: 'Kenneth Rubin',
    isbn: '978-0134544908',
    category: 'Gestión de Proyectos',
    subject: 'Ingeniería de Sistemas',
    totalCopies: 3,
    availableCopies: 0
  },
  {
    id: 'B010',
    title: 'Inteligencia Artificial: Un Enfoque Moderno',
    author: 'Stuart Russell',
    isbn: '978-6073236904',
    category: 'Inteligencia Artificial',
    subject: 'Ingeniería de Sistemas',
    totalCopies: 5,
    availableCopies: 2
  }
];

export const initialUsers: User[] = [
  {
    id: 'U001',
    name: 'Juan Carlos Mamani',
    code: '2020-123456',
    email: 'jmamani@unap.edu.pe',
    role: 'student',
    career: 'Ingeniería de Sistemas'
  },
  {
    id: 'U002',
    name: 'María Elena Condori',
    code: '2021-234567',
    email: 'mcondori@unap.edu.pe',
    role: 'student',
    career: 'Ingeniería de Sistemas'
  },
  {
    id: 'U003',
    name: 'Pedro Quispe Flores',
    code: '2020-345678',
    email: 'pquispe@unap.edu.pe',
    role: 'student',
    career: 'Ingeniería Mecánica'
  },
  {
    id: 'U004',
    name: 'Ana Lucía Huanca',
    code: '2022-456789',
    email: 'ahuanca@unap.edu.pe',
    role: 'student',
    career: 'Ingeniería de Sistemas'
  },
  {
    id: 'U005',
    name: 'Carlos Apaza Nina',
    code: '2019-567890',
    email: 'capaza@unap.edu.pe',
    role: 'student',
    career: 'Ingeniería Electrónica'
  },
  {
    id: 'T001',
    name: 'Dr. Roberto Chura Yupanqui',
    code: 'DOC-001',
    email: 'rchura@unap.edu.pe',
    role: 'teacher',
    career: 'Ingeniería de Sistemas'
  },
  {
    id: 'T002',
    name: 'Mg. Silvia Arapa Ccallo',
    code: 'DOC-002',
    email: 'sarapa@unap.edu.pe',
    role: 'teacher',
    career: 'Ingeniería de Sistemas'
  }
];

export const initialLoans: Loan[] = [
  {
    id: 'L001',
    bookId: 'B002',
    userId: 'U001',
    loanDate: new Date('2026-04-20'),
    dueDate: new Date('2026-04-27'),
    returnDate: null,
    status: 'overdue'
  },
  {
    id: 'L002',
    bookId: 'B002',
    userId: 'U002',
    loanDate: new Date('2026-04-25'),
    dueDate: new Date('2026-05-02'),
    returnDate: null,
    status: 'overdue'
  },
  {
    id: 'L003',
    bookId: 'B001',
    userId: 'U001',
    loanDate: new Date('2026-05-01'),
    dueDate: new Date('2026-05-08'),
    returnDate: null,
    status: 'active'
  },
  {
    id: 'L004',
    bookId: 'B004',
    userId: 'U003',
    loanDate: new Date('2026-05-03'),
    dueDate: new Date('2026-05-10'),
    returnDate: null,
    status: 'active'
  },
  {
    id: 'L005',
    bookId: 'B009',
    userId: 'U004',
    loanDate: new Date('2026-04-15'),
    dueDate: new Date('2026-04-22'),
    returnDate: null,
    status: 'overdue'
  },
  {
    id: 'L006',
    bookId: 'B001',
    userId: 'U002',
    loanDate: new Date('2026-03-10'),
    dueDate: new Date('2026-03-17'),
    returnDate: new Date('2026-03-16'),
    status: 'returned'
  },
  {
    id: 'L007',
    bookId: 'B003',
    userId: 'U001',
    loanDate: new Date('2026-03-20'),
    dueDate: new Date('2026-03-27'),
    returnDate: new Date('2026-03-26'),
    status: 'returned'
  },
  {
    id: 'L008',
    bookId: 'B007',
    userId: 'U005',
    loanDate: new Date('2026-05-05'),
    dueDate: new Date('2026-05-12'),
    returnDate: null,
    status: 'active'
  },
  {
    id: 'L009',
    bookId: 'B002',
    userId: 'U005',
    loanDate: new Date('2026-04-28'),
    dueDate: new Date('2026-05-05'),
    returnDate: null,
    status: 'overdue'
  },
  {
    id: 'L010',
    bookId: 'B002',
    userId: 'U003',
    loanDate: new Date('2026-04-30'),
    dueDate: new Date('2026-05-07'),
    returnDate: null,
    status: 'active'
  }
];
