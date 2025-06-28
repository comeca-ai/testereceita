import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Divider,
  Button,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PersonIcon from '@mui/icons-material/Person';
import BusinessIcon from '@mui/icons-material/Business';
import axios from 'axios';

interface Socio {
  id: number;
  nome: string;
  identificador: string;
  qualificacao: string;
  dataEntrada: string;
  cnpjBase: string;
  representanteLegal?: string;
  pais?: string;
}

interface Empresa {
  cnpjBase: string;
  razaoSocial: string;
  naturezaJuridica: string;
  porte: string;
  dataAbertura: string;
  estabelecimentoPrincipal?: {
    cnpj: string;
    nomeFantasia: string;
    situacaoCadastral: string;
    municipio: string;
    uf: string;
  };
}

interface SocioDetalhado {
  socio: Socio;
  empresas: Empresa[];
}

const SocioDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [socioDetalhado, setSocioDetalhado] = useState<SocioDetalhado | null>(null);

  useEffect(() => {
    const fetchSocioDetails = async () => {
      if (!id) {
        setError('ID do sócio não fornecido');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Em um cenário real, esta seria uma chamada à API
        // Por enquanto, vamos simular com dados estáticos
        
        // Simulação de resposta da API
        setTimeout(() => {
          const mockSocio: SocioDetalhado = {
            socio: {
              id: parseInt(id),
              nome: 'JOÃO DA SILVA',
              identificador: '***123456**',
              qualificacao: 'SÓCIO-ADMINISTRADOR',
              dataEntrada: '2010-05-15',
              cnpjBase: '12345678',
              representanteLegal: '',
              pais: 'BRASIL'
            },
            empresas: [
              {
                cnpjBase: '12345678',
                razaoSocial: 'EMPRESA PRINCIPAL LTDA',
                naturezaJuridica: 'SOCIEDADE EMPRESÁRIA LIMITADA',
                porte: 'DEMAIS',
                dataAbertura: '2010-05-15',
                estabelecimentoPrincipal: {
                  cnpj: '12345678000100',
                  nomeFantasia: 'EMPRESA PRINCIPAL',
                  situacaoCadastral: '2',
                  municipio: 'SÃO PAULO',
                  uf: 'SP'
                }
              },
              {
                cnpjBase: '87654321',
                razaoSocial: 'EMPRESA SECUNDÁRIA LTDA',
                naturezaJuridica: 'SOCIEDADE EMPRESÁRIA LIMITADA',
                porte: 'MICRO EMPRESA',
                dataAbertura: '2015-10-20',
                estabelecimentoPrincipal: {
                  cnpj: '87654321000100',
                  nomeFantasia: 'EMPRESA SECUNDÁRIA',
                  situacaoCadastral: '2',
                  municipio: 'RIO DE JANEIRO',
                  uf: 'RJ'
                }
              },
              {
                cnpjBase: '98765432',
                razaoSocial: 'EMPRESA TERCIÁRIA LTDA',
                naturezaJuridica: 'SOCIEDADE EMPRESÁRIA LIMITADA',
                porte: 'PEQUENO PORTE',
                dataAbertura: '2018-03-10',
                estabelecimentoPrincipal: {
                  cnpj: '98765432000100',
                  nomeFantasia: 'EMPRESA TERCIÁRIA',
                  situacaoCadastral: '2',
                  municipio: 'BELO HORIZONTE',
                  uf: 'MG'
                }
              }
            ]
          };
          
          setSocioDetalhado(mockSocio);
          setLoading(false);
        }, 1500);
        
      } catch (err) {
        console.error('Erro ao buscar detalhes do sócio:', err);
        setError('Não foi possível carregar os detalhes do sócio.');
        setLoading(false);
      }
    };

    fetchSocioDetails();
  }, [id]);

  const formatData = (data: string) => {
    return new Date(data).toLocaleDateString('pt-BR');
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

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (!socioDetalhado) {
    return <Alert severity="info">Nenhum dado encontrado para este sócio.</Alert>;
  }

  const { socio, empresas } = socioDetalhado;

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
        <Button
          component={Link}
          to="/socios"
          startIcon={<ArrowBackIcon />}
          sx={{ mr: 2 }}
        >
          Voltar
        </Button>
        <Typography variant="h4" component="h1">
          {socio.nome}
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <PersonIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">
                  Informações do Sócio
                </Typography>
              </Box>

              <Typography variant="subtitle2">Nome</Typography>
              <Typography variant="body1" gutterBottom>
                {socio.nome}
              </Typography>

              <Typography variant="subtitle2" sx={{ mt: 2 }}>
                Identificador
              </Typography>
              <Typography variant="body1" gutterBottom>
                {socio.identificador}
              </Typography>

              <Typography variant="subtitle2" sx={{ mt: 2 }}>
                Qualificação
              </Typography>
              <Typography variant="body1" gutterBottom>
                {socio.qualificacao}
              </Typography>

              <Typography variant="subtitle2" sx={{ mt: 2 }}>
                Data de Entrada
              </Typography>
              <Typography variant="body1" gutterBottom>
                {formatData(socio.dataEntrada)}
              </Typography>

              {socio.pais && (
                <>
                  <Typography variant="subtitle2" sx={{ mt: 2 }}>
                    País
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {socio.pais}
                  </Typography>
                </>
              )}

              {socio.representanteLegal && (
                <>
                  <Typography variant="subtitle2" sx={{ mt: 2 }}>
                    Representante Legal
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {socio.representanteLegal}
                  </Typography>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <BusinessIcon sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h6">
                Empresas Relacionadas
              </Typography>
            </Box>

            <Typography variant="body2" sx={{ mb: 2 }}>
              Este sócio está relacionado a {empresas.length} empresa{empresas.length !== 1 ? 's' : ''}.
            </Typography>

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>CNPJ Base</TableCell>
                    <TableCell>Razão Social</TableCell>
                    <TableCell>Natureza Jurídica</TableCell>
                    <TableCell>Porte</TableCell>
                    <TableCell>Data de Abertura</TableCell>
                    <TableCell>Situação</TableCell>
                    <TableCell>Ações</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {empresas.map((empresa) => (
                    <TableRow key={empresa.cnpjBase}>
                      <TableCell>{empresa.cnpjBase}</TableCell>
                      <TableCell>{empresa.razaoSocial}</TableCell>
                      <TableCell>{empresa.naturezaJuridica}</TableCell>
                      <TableCell>{empresa.porte}</TableCell>
                      <TableCell>{formatData(empresa.dataAbertura)}</TableCell>
                      <TableCell>
                        {empresa.estabelecimentoPrincipal ? 
                          getSituacaoCadastralLabel(empresa.estabelecimentoPrincipal.situacaoCadastral) : 
                          'N/A'}
                      </TableCell>
                      <TableCell>
                        <Button
                          component={Link}
                          to={`/empresas/${empresa.cnpjBase}`}
                          variant="outlined"
                          size="small"
                        >
                          Ver Detalhes
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SocioDetails;
