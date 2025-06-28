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
  SelectChangeEvent,
  Chip
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import axios from 'axios';

interface SimplesNacional {
  cnpjBase: string;
  optanteMei: boolean;
  optanteSimples: boolean;
  dataOpcaoSimples: string | null;
  dataExclusaoSimples: string | null;
  dataOpcaoMei: string | null;
  dataExclusaoMei: string | null;
  empresa?: {
    razaoSocial: string;
  };
}

interface PaginatedResponse {
  data: SimplesNacional[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

const SimplesList = () => {
  const navigate = useNavigate();
  const [simplesData, setSimplesData] = useState<SimplesNacional[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [optanteFilter, setOptanteFilter] = useState('');
  const [meiFilter, setMeiFilter] = useState('');

  const fetchSimplesData = async () => {
    try {
      setLoading(true);
      
      // Em um cenário real, esta seria uma chamada à API
      // Por enquanto, vamos simular com dados estáticos
      
      // Simulação de resposta da API
      setTimeout(() => {
        const mockSimplesData: SimplesNacional[] = Array.from({ length: 50 }, (_, index) => ({
          cnpjBase: `${10000000 + index}`,
          optanteMei: index % 3 === 0,
          optanteSimples: index % 2 === 0,
          dataOpcaoSimples: index % 2 === 0 ? `${2010 + Math.floor(index / 10)}-01-01` : null,
          dataExclusaoSimples: index % 10 === 0 && index % 2 === 0 ? `${2020 + Math.floor(index / 10)}-12-31` : null,
          dataOpcaoMei: index % 3 === 0 ? `${2011 + Math.floor(index / 10)}-01-01` : null,
          dataExclusaoMei: index % 15 === 0 && index % 3 === 0 ? `${2021 + Math.floor(index / 10)}-12-31` : null,
          empresa: {
            razaoSocial: `Empresa ${index + 1} LTDA`
          }
        }));
        
        // Filtragem simulada
        let filteredData = [...mockSimplesData];
        
        if (searchTerm) {
          filteredData = filteredData.filter(item => 
            item.empresa?.razaoSocial.toLowerCase().includes(searchTerm.toLowerCase())
          );
        }
        
        if (optanteFilter) {
          const isOptante = optanteFilter === 'sim';
          filteredData = filteredData.filter(item => item.optanteSimples === isOptante);
        }
        
        if (meiFilter) {
          const isOptanteMei = meiFilter === 'sim';
          filteredData = filteredData.filter(item => item.optanteMei === isOptanteMei);
        }
        
        // Paginação simulada
        const startIndex = page * rowsPerPage;
        const paginatedData = filteredData.slice(startIndex, startIndex + rowsPerPage);
        
        setSimplesData(paginatedData);
        setTotalItems(filteredData.length);
        setLoading(false);
      }, 1000);
      
    } catch (err) {
      console.error('Erro ao buscar dados do Simples Nacional:', err);
      setError('Não foi possível carregar os dados do Simples Nacional.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSimplesData();
  }, [page, rowsPerPage, searchTerm, optanteFilter, meiFilter]);

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
    fetchSimplesData();
  };

  const handleOptanteFilterChange = (event: SelectChangeEvent) => {
    setOptanteFilter(event.target.value);
    setPage(0);
  };

  const handleMeiFilterChange = (event: SelectChangeEvent) => {
    setMeiFilter(event.target.value);
    setPage(0);
  };

  const handleRowClick = (cnpjBase: string) => {
    navigate(`/simples/${cnpjBase}`);
  };

  const formatData = (data: string | null) => {
    if (!data) return '-';
    return new Date(data).toLocaleDateString('pt-BR');
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom component="h1">
        Simples Nacional
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
                <InputLabel>Optante Simples</InputLabel>
                <Select
                  value={optanteFilter}
                  label="Optante Simples"
                  onChange={handleOptanteFilterChange}
                >
                  <MenuItem value="">Todos</MenuItem>
                  <MenuItem value="sim">Sim</MenuItem>
                  <MenuItem value="nao">Não</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Optante MEI</InputLabel>
                <Select
                  value={meiFilter}
                  label="Optante MEI"
                  onChange={handleMeiFilterChange}
                >
                  <MenuItem value="">Todos</MenuItem>
                  <MenuItem value="sim">Sim</MenuItem>
                  <MenuItem value="nao">Não</MenuItem>
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
                    <TableCell>Optante Simples</TableCell>
                    <TableCell>Data Opção Simples</TableCell>
                    <TableCell>Data Exclusão Simples</TableCell>
                    <TableCell>Optante MEI</TableCell>
                    <TableCell>Data Opção MEI</TableCell>
                    <TableCell>Data Exclusão MEI</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {simplesData.map((item) => (
                    <TableRow
                      key={item.cnpjBase}
                      hover
                      onClick={() => handleRowClick(item.cnpjBase)}
                      sx={{ cursor: 'pointer' }}
                    >
                      <TableCell>{item.cnpjBase}</TableCell>
                      <TableCell>{item.empresa?.razaoSocial || 'N/A'}</TableCell>
                      <TableCell>
                        <Chip 
                          label={item.optanteSimples ? 'Sim' : 'Não'}
                          color={item.optanteSimples ? 'success' : 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{formatData(item.dataOpcaoSimples)}</TableCell>
                      <TableCell>{formatData(item.dataExclusaoSimples)}</TableCell>
                      <TableCell>
                        <Chip 
                          label={item.optanteMei ? 'Sim' : 'Não'}
                          color={item.optanteMei ? 'primary' : 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{formatData(item.dataOpcaoMei)}</TableCell>
                      <TableCell>{formatData(item.dataExclusaoMei)}</TableCell>
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

export default SimplesList;
