import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Divider,
  Chip,
  Button,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Card,
  CardContent,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import BusinessIcon from '@mui/icons-material/Business';
import StoreIcon from '@mui/icons-material/Store';
import PeopleIcon from '@mui/icons-material/People';
import ReceiptIcon from '@mui/icons-material/Receipt';
import axios from 'axios';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`empresa-tabpanel-${index}`}
      aria-labelledby={`empresa-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

interface Empresa {
  cnpjBase: string;
  razaoSocial: string;
  naturezaJuridica: string;
  porte: string;
  capitalSocial: number;
  dataAbertura: string;
}

interface Estabelecimento {
  cnpj: string;
  nomeFantasia: string;
  situacaoCadastral: string;
  cnaePrincipal: string;
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  municipio: string;
  uf: string;
  cep: string;
  email: string;
  telefone: string;
  tipo: string;
  cnaesSecundarios: Array<{ codigo: string }>;
}

interface Socio {
  id: number;
  nome: string;
  identificador: string;
  qualificacao: string;
  dataEntrada: string;
}

interface SimplesNacional {
  optante: boolean;
  optanteMEI: boolean;
  dataOpcao?: string;
  dataExclusao?: string;
}

interface EmpresaDetalhada {
  empresa: Empresa;
  estabelecimentos: Estabelecimento[];
  socios: Socio[];
  simplesNacional?: SimplesNacional;
}

const EmpresaDetails = () => {
  const { cnpjBase } = useParams<{ cnpjBase: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [empresa, setEmpresa] = useState<EmpresaDetalhada | null>(null);
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    const fetchEmpresaDetails = async () => {
      if (!cnpjBase) {
        setError('CNPJ base não fornecido');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Em um cenário real, esta seria uma chamada à API
        // Por enquanto, vamos simular com dados estáticos
        
        // Simulação de resposta da API
        setTimeout(() => {
          const mockEmpresa: EmpresaDetalhada = {
            empresa: {
              cnpjBase,
              razaoSocial: 'EMPRESA DEMONSTRAÇÃO LTDA',
              naturezaJuridica: 'SOCIEDADE EMPRESÁRIA LIMITADA',
              porte: 'DEMAIS',
              capitalSocial: 100000.00,
              dataAbertura: '2010-05-15',
            },
            estabelecimentos: [
              {
                cnpj: `${cnpjBase}0001`,
                nomeFantasia: 'MATRIZ DEMO',
                situacaoCadastral: '2', // ATIVA
                cnaePrincipal: '6201500',
                logradouro: 'RUA EXEMPLO',
                numero: '123',
                complemento: 'SALA 456',
                bairro: 'CENTRO',
                municipio: 'SÃO PAULO',
                uf: 'SP',
                cep: '01001000',
                email: 'contato@empresa.com.br',
                telefone: '1133334444',
                tipo: 'MATRIZ',
                cnaesSecundarios: [
                  { codigo: '6202300' },
                  { codigo: '6209100' }
                ]
              },
              {
                cnpj: `${cnpjBase}0002`,
                nomeFantasia: 'FILIAL DEMO',
                situacaoCadastral: '2', // ATIVA
                cnaePrincipal: '6201500',
                logradouro: 'AVENIDA EXEMPLO',
                numero: '456',
                complemento: 'ANDAR 10',
                bairro: 'JARDINS',
                municipio: 'SÃO PAULO',
                uf: 'SP',
                cep: '01452000',
                email: 'filial@empresa.com.br',
                telefone: '1144445555',
                tipo: 'FILIAL',
                cnaesSecundarios: [
                  { codigo: '6202300' }
                ]
              }
            ],
            socios: [
              {
                id: 1,
                nome: 'JOÃO DA SILVA',
                identificador: '***123456**',
                qualificacao: 'SÓCIO-ADMINISTRADOR',
                dataEntrada: '2010-05-15'
              },
              {
                id: 2,
                nome: 'MARIA OLIVEIRA',
                identificador: '***789012**',
                qualificacao: 'SÓCIO',
                dataEntrada: '2010-05-15'
              }
            ],
            simplesNacional: {
              optante: true,
              optanteMEI: false,
              dataOpcao: '2015-01-01'
            }
          };
          
          setEmpresa(mockEmpresa);
          setLoading(false);
        }, 1500);
        
      } catch (err) {
        console.error('Erro ao buscar detalhes da empresa:', err);
        setError('Não foi possível carregar os detalhes da empresa.');
        setLoading(false);
      }
    };

    fetchEmpresaDetails();
  }, [cnpjBase]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const formatCapitalSocial = (valor: number) => {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

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

  if (!empresa) {
    return <Alert severity="info">Nenhum dado encontrado para este CNPJ.</Alert>;
  }

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
        <Button
          component={Link}
          to="/empresas"
          startIcon={<ArrowBackIcon />}
          sx={{ mr: 2 }}
        >
          Voltar
        </Button>
        <Typography variant="h4" component="h1">
          {empresa.empresa.razaoSocial}
        </Typography>
      </Box>

      <Paper sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" gutterBottom>
              CNPJ Base
            </Typography>
            <Typography variant="body1" gutterBottom>
              {empresa.empresa.cnpjBase}
            </Typography>

            <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
              Natureza Jurídica
            </Typography>
            <Typography variant="body1" gutterBottom>
              {empresa.empresa.naturezaJuridica}
            </Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" gutterBottom>
              Porte
            </Typography>
            <Typography variant="body1" gutterBottom>
              {empresa.empresa.porte}
            </Typography>

            <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
              Capital Social
            </Typography>
            <Typography variant="body1" gutterBottom>
              {formatCapitalSocial(empresa.empresa.capitalSocial)}
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle1" gutterBottom>
              Data de Abertura
            </Typography>
            <Typography variant="body1">
              {formatData(empresa.empresa.dataAbertura)}
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      <Box sx={{ mb: 4 }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="empresa tabs">
          <Tab icon={<StoreIcon />} label="Estabelecimentos" id="empresa-tab-0" />
          <Tab icon={<PeopleIcon />} label="Sócios" id="empresa-tab-1" />
          <Tab icon={<ReceiptIcon />} label="Simples Nacional" id="empresa-tab-2" />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            {empresa.estabelecimentos.map((estabelecimento) => (
              <Grid item xs={12} key={estabelecimento.cnpj}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h6">
                        {estabelecimento.nomeFantasia || 'Sem Nome Fantasia'}
                        <Typography variant="body2" component="span" sx={{ ml: 1 }}>
                          ({estabelecimento.tipo})
                        </Typography>
                      </Typography>
                      <Chip
                        label={getSituacaoCadastralLabel(estabelecimento.situacaoCadastral)}
                        color={getSituacaoCadastralColor(estabelecimento.situacaoCadastral)}
                        size="small"
                      />
                    </Box>

                    <Typography variant="body2" gutterBottom>
                      CNPJ: {estabelecimento.cnpj}
                    </Typography>

                    <Divider sx={{ my: 2 }} />

                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2">Endereço</Typography>
                        <Typography variant="body2">
                          {estabelecimento.logradouro}, {estabelecimento.numero}
                          {estabelecimento.complemento ? ` - ${estabelecimento.complemento}` : ''}
                        </Typography>
                        <Typography variant="body2">
                          {estabelecimento.bairro}
                        </Typography>
                        <Typography variant="body2">
                          {estabelecimento.municipio} - {estabelecimento.uf}
                        </Typography>
                        <Typography variant="body2">
                          CEP: {estabelecimento.cep}
                        </Typography>
                      </Grid>

                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2">Contato</Typography>
                        <Typography variant="body2">
                          Email: {estabelecimento.email || 'Não informado'}
                        </Typography>
                        <Typography variant="body2">
                          Telefone: {estabelecimento.telefone || 'Não informado'}
                        </Typography>

                        <Typography variant="subtitle2" sx={{ mt: 2 }}>
                          Atividade Principal
                        </Typography>
                        <Typography variant="body2">
                          {estabelecimento.cnaePrincipal}
                        </Typography>

                        {estabelecimento.cnaesSecundarios.length > 0 && (
                          <>
                            <Typography variant="subtitle2" sx={{ mt: 1 }}>
                              Atividades Secundárias
                            </Typography>
                            <Typography variant="body2">
                              {estabelecimento.cnaesSecundarios.map((cnae) => cnae.codigo).join(', ')}
                            </Typography>
                          </>
                        )}
                      </Grid>
                    </Grid>

                    <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                      <Button
                        component={Link}
                        to={`/estabelecimentos/${estabelecimento.cnpj}`}
                        variant="outlined"
                        size="small"
                      >
                        Ver Detalhes
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Nome</TableCell>
                  <TableCell>Identificador</TableCell>
                  <TableCell>Qualificação</TableCell>
                  <TableCell>Data de Entrada</TableCell>
                  <TableCell>Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {empresa.socios.map((socio) => (
                  <TableRow key={socio.id}>
                    <TableCell>{socio.nome}</TableCell>
                    <TableCell>{socio.identificador}</TableCell>
                    <TableCell>{socio.qualificacao}</TableCell>
                    <TableCell>{formatData(socio.dataEntrada)}</TableCell>
                    <TableCell>
                      <Button
                        component={Link}
                        to={`/socios/${socio.id}`}
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
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          {empresa.simplesNacional ? (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Simples Nacional
                </Typography>

                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2">Status</Typography>
                    <Typography variant="body1">
                      {empresa.simplesNacional.optante ? (
                        <Chip label="Optante" color="success" />
                      ) : (
                        <Chip label="Não Optante" color="error" />
                      )}
                    </Typography>

                    {empresa.simplesNacional.optante && (
                      <>
                        <Typography variant="subtitle2" sx={{ mt: 2 }}>
                          MEI
                        </Typography>
                        <Typography variant="body1">
                          {empresa.simplesNacional.optanteMEI ? (
                            <Chip label="Sim" color="success" />
                          ) : (
                            <Chip label="Não" color="default" />
                          )}
                        </Typography>
                      </>
                    )}
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    {empresa.simplesNacional.optante && empresa.simplesNacional.dataOpcao && (
                      <>
                        <Typography variant="subtitle2">Data de Opção</Typography>
                        <Typography variant="body1">
                          {formatData(empresa.simplesNacional.dataOpcao)}
                        </Typography>
                      </>
                    )}

                    {empresa.simplesNacional.dataExclusao && (
                      <>
                        <Typography variant="subtitle2" sx={{ mt: 2 }}>
                          Data de Exclusão
                        </Typography>
                        <Typography variant="body1">
                          {formatData(empresa.simplesNacional.dataExclusao)}
                        </Typography>
                      </>
                    )}
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          ) : (
            <Alert severity="info">
              Não há informações do Simples Nacional para esta empresa.
            </Alert>
          )}
        </TabPanel>
      </Box>
    </Box>
  );
};

export default EmpresaDetails;
