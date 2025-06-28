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

interface Empresa {
  cnpjBase: string;
  razaoSocial: string;
  naturezaJuridica: string;
  porte: string;
  capitalSocial: number;
  dataAbertura: string;
}

interface PaginatedResponse {
  data: Empresa[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

const EmpresasList = () => {
  const navigate = useNavigate();
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [naturezaJuridica, setNaturezaJuridica] = useState('');
  const [porte, setPorte] = useState('');

  const fetchEmpresas = async () => {
    try {
      setLoading(true);
      
      // Em um cenário real, esta seria uma chamada à API
      // Por enquanto, vamos simular com dados estáticos
      
      // Simulação de resposta da API
      setTimeout(() => {
        const mockEmpresas: Empresa[] = Array.from({ length: 50 }, (_, index) => ({
          cnpjBase: `${10000000 + index}`,
          razaoSocial: `Empresa ${index + 1} LTDA`,
          naturezaJuridica: index % 3 === 0 ? 'SOCIEDADE EMPRESÁRIA LIMITADA' : 
                           index % 3 === 1 ? 'EMPRESÁRIO INDIVIDUAL' : 'SOCIEDADE ANÔNIMA FECHADA',
          porte: index % 4 === 0 ? 'MICRO EMPRESA' : 
                index % 4 === 1 ? 'PEQUENO PORTE' : 
                index % 4 === 2 ? 'DEMAIS' : 'GRANDE PORTE',
          capitalSocial: Math.floor(Math.random() * 1000000) + 10000,
          dataAbertura: `${2000 + Math.floor(Math.random() * 23)}-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
        }));
        
        // Filtragem simulada
        let filteredEmpresas = [...mockEmpresas];
        
        if (searchTerm) {
          filteredEmpresas = filteredEmpresas.filter(empresa => 
            empresa.razaoSocial.toLowerCase().includes(searchTerm.toLowerCase())
          );
        }
        
        if (naturezaJuridica) {
          filteredEmpresas = filteredEmpresas.filter(empresa => 
            empresa.naturezaJuridica === naturezaJuridica
          );
        }
        
        if (porte) {
          filteredEmpresas = filteredEmpresas.filter(empresa => 
            empresa.porte === porte
          );
        }
        
        // Paginação simulada
        const startIndex = page * rowsPerPage;
        const paginatedEmpresas = filteredEmpresas.slice(startIndex, startIndex + rowsPerPage);
        
        setEmpresas(paginatedEmpresas);
        setTotalItems(filteredEmpresas.length);
        setLoading(false);
      }, 1000);
      
    } catch (err) {
      console.error('Erro ao buscar empresas:', err);
      setError('Não foi possível carregar a lista de empresas.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmpresas();
  }, [page, rowsPerPage, searchTerm, naturezaJuridica, porte]);

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
    fetchEmpresas();
  };

  const handleNaturezaJuridicaChange = (event: SelectChangeEvent) => {
    setNaturezaJuridica(event.target.value);
    setPage(0);
  };

  const handlePorteChange = (event: SelectChangeEvent) => {
    setPorte(event.target.value);
    setPage(0);
  };

  const handleRowClick = (cnpjBase: string) => {
    navigate(`/empresas/${cnpjBase}`);
  };

  const formatCapitalSocial = (valor: number) => {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const formatDataAbertura = (data: string) => {
    return new Date(data).toLocaleDateString('pt-BR');
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom component="h1">
        Empresas
      </Typography>
      
      <Paper sx={{ p: 3, mb: 4 }}>
        <Box component="form" onSubmit={handleSearch}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                label="Buscar por Razão Social"
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
            
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Natureza Jurídica</InputLabel>
                <Select
                  value={naturezaJuridica}
                  label="Natureza Jurídica"
                  onChange={handleNaturezaJuridicaChange}
                >
                  <MenuItem value="">Todas</MenuItem>
                  <MenuItem value="SOCIEDADE EMPRESÁRIA LIMITADA">SOCIEDADE EMPRESÁRIA LIMITADA</MenuItem>
                  <MenuItem value="EMPRESÁRIO INDIVIDUAL">EMPRESÁRIO INDIVIDUAL</MenuItem>
                  <MenuItem value="SOCIEDADE ANÔNIMA FECHADA">SOCIEDADE ANÔNIMA FECHADA</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Porte</InputLabel>
                <Select
                  value={porte}
                  label="Porte"
                  onChange={handlePorteChange}
                >
                  <MenuItem value="">Todos</MenuItem>
                  <MenuItem value="MICRO EMPRESA">MICRO EMPRESA</MenuItem>
                  <MenuItem value="PEQUENO PORTE">PEQUENO PORTE</MenuItem>
                  <MenuItem value="DEMAIS">DEMAIS</MenuItem>
                  <MenuItem value="GRANDE PORTE">GRANDE PORTE</MenuItem>
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
                    <TableCell>CNPJ Base</TableCell>
                    <TableCell>Razão Social</TableCell>
                    <TableCell>Natureza Jurídica</TableCell>
                    <TableCell>Porte</TableCell>
                    <TableCell>Capital Social</TableCell>
                    <TableCell>Data de Abertura</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {empresas.map((empresa) => (
                    <TableRow
                      key={empresa.cnpjBase}
                      hover
                      onClick={() => handleRowClick(empresa.cnpjBase)}
                      sx={{ cursor: 'pointer' }}
                    >
                      <TableCell>{empresa.cnpjBase}</TableCell>
                      <TableCell>{empresa.razaoSocial}</TableCell>
                      <TableCell>{empresa.naturezaJuridica}</TableCell>
                      <TableCell>{empresa.porte}</TableCell>
                      <TableCell>{formatCapitalSocial(empresa.capitalSocial)}</TableCell>
                      <TableCell>{formatDataAbertura(empresa.dataAbertura)}</TableCell>
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

export default EmpresasList;
