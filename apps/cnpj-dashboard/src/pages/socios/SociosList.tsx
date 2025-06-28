import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  CircularProgress,
  Alert,
  InputAdornment,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import axios from 'axios';

interface Socio {
  id: number;
  nome: string;
  identificador: string;
  qualificacao: string;
  dataEntrada: string;
  cnpjBase: string;
  empresa?: {
    razaoSocial: string;
  };
}

interface PaginatedResponse {
  data: Socio[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

const SociosList = () => {
  const navigate = useNavigate();
  const [socios, setSocios] = useState<Socio[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [qualificacao, setQualificacao] = useState('');

  const fetchSocios = async () => {
    try {
      setLoading(true);
      
      // Em um cenário real, esta seria uma chamada à API
      // Por enquanto, vamos simular com dados estáticos
      
      // Simulação de resposta da API
      setTimeout(() => {
        const mockSocios: Socio[] = Array.from({ length: 50 }, (_, index) => ({
          id: index + 1,
          nome: `SÓCIO ${index + 1}`,
          identificador: `***${100000 + index}**`,
          qualificacao: index % 4 === 0 ? 'SÓCIO-ADMINISTRADOR' : 
                       index % 4 === 1 ? 'SÓCIO' : 
                       index % 4 === 2 ? 'DIRETOR' : 'PRESIDENTE',
          dataEntrada: `${2000 + Math.floor(Math.random() * 23)}-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
          cnpjBase: `${10000000 + index}`,
          empresa: {
            razaoSocial: `Empresa ${index + 1} LTDA`
          }
        }));
        
        // Filtragem simulada
        let filteredSocios = [...mockSocios];
        
        if (searchTerm) {
          filteredSocios = filteredSocios.filter(socio => 
            socio.nome.toLowerCase().includes(searchTerm.toLowerCase())
          );
        }
        
        if (qualificacao) {
          filteredSocios = filteredSocios.filter(socio => 
            socio.qualificacao === qualificacao
          );
        }
        
        // Paginação simulada
        const startIndex = page * rowsPerPage;
        const paginatedSocios = filteredSocios.slice(startIndex, startIndex + rowsPerPage);
        
        setSocios(paginatedSocios);
        setTotalItems(filteredSocios.length);
        setLoading(false);
      }, 1000);
      
    } catch (err) {
      console.error('Erro ao buscar sócios:', err);
      setError('Não foi possível carregar a lista de sócios.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSocios();
  }, [page, rowsPerPage, searchTerm, qualificacao]);

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    setPage(0);
    fetchSocios();
  };

  const handleQualificacaoChange = (event: SelectChangeEvent) => {
    setQualificacao(event.target.value);
    setPage(0);
  };

  const handleRowClick = (id: number) => {
    navigate(`/socios/${id}`);
  };

  const formatData = (data: string) => {
    return new Date(data).toLocaleDateString('pt-BR');
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom component="h1">
        Sócios
      </Typography>
      
      <Paper sx={{ p: 3, mb: 4 }}>
        <Box component="form" onSubmit={handleSearch}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={6}>
              <TextField
                label="Buscar por Nome"
                variant="outlined"
                fullWidth
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth>
                <InputLabel>Qualificação</InputLabel>
                <Select
                  value={qualificacao}
                  label="Qualificação"
                  onChange={handleQualificacaoChange}
                >
                  <MenuItem value="">Todas</MenuItem>
                  <MenuItem value="SÓCIO-ADMINISTRADOR">SÓCIO-ADMINISTRADOR</MenuItem>
                  <MenuItem value="SÓCIO">SÓCIO</MenuItem>
                  <MenuItem value="DIRETOR">DIRETOR</MenuItem>
                  <MenuItem value="PRESIDENTE">PRESIDENTE</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6} md={2}>
              <Button 
                type="submit"
                variant="contained" 
                fullWidth
                sx={{ height: '56px' }}
              >
                Buscar
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>
      
      {error && (
        <Alert severity="error" sx={{ mb: 4 }}>
          {error}
        </Alert>
      )}
      
      <Paper>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Nome</TableCell>
                    <TableCell>Identificador</TableCell>
                    <TableCell>Qualificação</TableCell>
                    <TableCell>Data de Entrada</TableCell>
                    <TableCell>Empresa</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {socios.map((socio) => (
                    <TableRow
                      key={socio.id}
                      hover
                      onClick={() => handleRowClick(socio.id)}
                      sx={{ cursor: 'pointer' }}
                    >
                      <TableCell>{socio.nome}</TableCell>
                      <TableCell>{socio.identificador}</TableCell>
                      <TableCell>{socio.qualificacao}</TableCell>
                      <TableCell>{formatData(socio.dataEntrada)}</TableCell>
                      <TableCell>{socio.empresa?.razaoSocial || 'N/A'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={totalItems}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              labelRowsPerPage="Itens por página:"
              labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
            />
          </>
        )}
      </Paper>
    </Box>
  );
};

export default SociosList;
