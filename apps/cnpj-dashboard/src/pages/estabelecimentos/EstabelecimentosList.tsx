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

interface Estabelecimento {
  cnpj: string;
  nomeFantasia: string;
  situacaoCadastral: string;
  cnaePrincipal: string;
  municipio: string;
  uf: string;
  tipo: string;
}

interface PaginatedResponse {
  data: Estabelecimento[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

const EstabelecimentosList = () => {
  const navigate = useNavigate();
  const [estabelecimentos, setEstabelecimentos] = useState<Estabelecimento[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [situacaoCadastral, setSituacaoCadastral] = useState('');
  const [uf, setUf] = useState('');

  const fetchEstabelecimentos = async () => {
    try {
      setLoading(true);
      
      // Em um cenário real, esta seria uma chamada à API
      // Por enquanto, vamos simular com dados estáticos
      
      // Simulação de resposta da API
      setTimeout(() => {
        const mockEstabelecimentos: Estabelecimento[] = Array.from({ length: 50 }, (_, index) => ({
          cnpj: `${10000000}0001${String(index + 1).padStart(2, '0')}`,
          nomeFantasia: index % 5 === 0 ? '' : `Estabelecimento ${index + 1}`,
          situacaoCadastral: index % 10 === 0 ? '8' : // BAIXADA
                            index % 10 === 1 ? '4' : // INAPTA
                            index % 10 === 2 ? '3' : // SUSPENSA
                            '2', // ATIVA
          cnaePrincipal: `${6201500 + index * 100}`,
          municipio: index % 3 === 0 ? 'SÃO PAULO' : 
                    index % 3 === 1 ? 'RIO DE JANEIRO' : 'BELO HORIZONTE',
          uf: index % 3 === 0 ? 'SP' : 
              index % 3 === 1 ? 'RJ' : 'MG',
          tipo: index % 5 === 0 ? 'MATRIZ' : 'FILIAL'
        }));
        
        // Filtragem simulada
        let filteredEstabelecimentos = [...mockEstabelecimentos];
        
        if (searchTerm) {
          filteredEstabelecimentos = filteredEstabelecimentos.filter(estabelecimento => 
            estabelecimento.nomeFantasia.toLowerCase().includes(searchTerm.toLowerCase())
          );
        }
        
        if (situacaoCadastral) {
          filteredEstabelecimentos = filteredEstabelecimentos.filter(estabelecimento => 
            estabelecimento.situacaoCadastral === situacaoCadastral
          );
        }
        
        if (uf) {
          filteredEstabelecimentos = filteredEstabelecimentos.filter(estabelecimento => 
            estabelecimento.uf === uf
          );
        }
        
        // Paginação simulada
        const startIndex = page * rowsPerPage;
        const paginatedEstabelecimentos = filteredEstabelecimentos.slice(startIndex, startIndex + rowsPerPage);
        
        setEstabelecimentos(paginatedEstabelecimentos);
        setTotalItems(filteredEstabelecimentos.length);
        setLoading(false);
      }, 1000);
      
    } catch (err) {
      console.error('Erro ao buscar estabelecimentos:', err);
      setError('Não foi possível carregar a lista de estabelecimentos.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEstabelecimentos();
  }, [page, rowsPerPage, searchTerm, situacaoCadastral, uf]);

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
    fetchEstabelecimentos();
  };

  const handleSituacaoCadastralChange = (event: SelectChangeEvent) => {
    setSituacaoCadastral(event.target.value);
    setPage(0);
  };

  const handleUfChange = (event: SelectChangeEvent) => {
    setUf(event.target.value);
    setPage(0);
  };

  const handleRowClick = (cnpj: string) => {
    navigate(`/estabelecimentos/${cnpj}`);
  };

  const getSituacaoCadastralLabel = (codigo: string) => {
    const situacoes: Record<string, string> = {
      '1': 'NULA',
      '2': 'ATIVA',
      '3': 'SUSPENSA',
      '4': 'INAPTA',
      '8': 'BAIXADA',
    };
    return situacoes[codigo] || codigo;
  };

  const getSituacaoCadastralColor = (codigo: string) => {
    const cores: Record<string, string> = {
      '1': 'error',
      '2': 'success',
      '3': 'warning',
      '4': 'error',
      '8': 'error',
    };
    return cores[codigo] as 'error' | 'success' | 'warning' | 'info';
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom component="h1">
        Estabelecimentos
      </Typography>
      
      <Paper sx={{ p: 3, mb: 4 }}>
        <Box component="form" onSubmit={handleSearch}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                label="Buscar por Nome Fantasia"
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
                <InputLabel>Situação Cadastral</InputLabel>
                <Select
                  value={situacaoCadastral}
                  label="Situação Cadastral"
                  onChange={handleSituacaoCadastralChange}
                >
                  <MenuItem value="">Todas</MenuItem>
                  <MenuItem value="2">ATIVA</MenuItem>
                  <MenuItem value="3">SUSPENSA</MenuItem>
                  <MenuItem value="4">INAPTA</MenuItem>
                  <MenuItem value="8">BAIXADA</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>UF</InputLabel>
                <Select
                  value={uf}
                  label="UF"
                  onChange={handleUfChange}
                >
                  <MenuItem value="">Todas</MenuItem>
                  <MenuItem value="SP">São Paulo</MenuItem>
                  <MenuItem value="RJ">Rio de Janeiro</MenuItem>
                  <MenuItem value="MG">Minas Gerais</MenuItem>
                  <MenuItem value="RS">Rio Grande do Sul</MenuItem>
                  <MenuItem value="PR">Paraná</MenuItem>
                  <MenuItem value="BA">Bahia</MenuItem>
                  <MenuItem value="SC">Santa Catarina</MenuItem>
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
                    <TableCell>CNPJ</TableCell>
                    <TableCell>Nome Fantasia</TableCell>
                    <TableCell>Situação</TableCell>
                    <TableCell>CNAE Principal</TableCell>
                    <TableCell>Município</TableCell>
                    <TableCell>UF</TableCell>
                    <TableCell>Tipo</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {estabelecimentos.map((estabelecimento) => (
                    <TableRow
                      key={estabelecimento.cnpj}
                      hover
                      onClick={() => handleRowClick(estabelecimento.cnpj)}
                      sx={{ cursor: 'pointer' }}
                    >
                      <TableCell>{estabelecimento.cnpj}</TableCell>
                      <TableCell>{estabelecimento.nomeFantasia || 'Não informado'}</TableCell>
                      <TableCell>
                        <Chip 
                          label={getSituacaoCadastralLabel(estabelecimento.situacaoCadastral)}
                          color={getSituacaoCadastralColor(estabelecimento.situacaoCadastral)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{estabelecimento.cnaePrincipal}</TableCell>
                      <TableCell>{estabelecimento.municipio}</TableCell>
                      <TableCell>{estabelecimento.uf}</TableCell>
                      <TableCell>{estabelecimento.tipo}</TableCell>
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

export default EstabelecimentosList;
