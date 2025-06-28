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
  Chip,
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineOppositeContent
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import BusinessIcon from '@mui/icons-material/Business';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import StorefrontIcon from '@mui/icons-material/Storefront';
import axios from 'axios';

interface SimplesNacional {
  cnpjBase: string;
  optanteMei: boolean;
  optanteSimples: boolean;
  dataOpcaoSimples: string | null;
  dataExclusaoSimples: string | null;
  dataOpcaoMei: string | null;
  dataExclusaoMei: string | null;
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
  municipio: string;
  uf: string;
}

interface SimplesDetalhado {
  simples: SimplesNacional;
  empresa: Empresa;
  estabelecimentos: Estabelecimento[];
}

const SimplesDetails = () => {
  const { cnpjBase } = useParams<{ cnpjBase: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [simplesDetalhado, setSimplesDetalhado] = useState<SimplesDetalhado | null>(null);

  useEffect(() => {
    const fetchSimplesDetails = async () => {
      if (!cnpjBase) {
        setError('CNPJ Base não fornecido');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Em um cenário real, esta seria uma chamada à API
        // Por enquanto, vamos simular com dados estáticos
        
        // Simulação de resposta da API
        setTimeout(() => {
          const mockSimples: SimplesDetalhado = {
            simples: {
              cnpjBase: cnpjBase,
              optanteMei: true,
              optanteSimples: true,
              dataOpcaoSimples: '2015-01-01',
              dataExclusaoSimples: null,
              dataOpcaoMei: '2015-01-15',
              dataExclusaoMei: null
            },
            empresa: {
              cnpjBase: cnpjBase,
              razaoSocial: 'EMPRESA DEMONSTRAÇÃO LTDA',
              naturezaJuridica: 'EMPRESÁRIO INDIVIDUAL',
              porte: 'MICRO EMPRESA',
              capitalSocial: 10000.00,
              dataAbertura: '2015-01-01'
            },
            estabelecimentos: [
              {
                cnpj: `${cnpjBase}000100`,
                nomeFantasia: 'ESTABELECIMENTO PRINCIPAL',
                situacaoCadastral: '2', // ATIVA
                cnaePrincipal: '4751201', // Comércio varejista especializado de equipamentos e suprimentos de informática
                municipio: 'SÃO PAULO',
                uf: 'SP'
              },
              {
                cnpj: `${cnpjBase}000200`,
                nomeFantasia: 'FILIAL 01',
                situacaoCadastral: '2', // ATIVA
                cnaePrincipal: '4751201', // Comércio varejista especializado de equipamentos e suprimentos de informática
                municipio: 'CAMPINAS',
                uf: 'SP'
              }
            ]
          };
          
          setSimplesDetalhado(mockSimples);
          setLoading(false);
        }, 1500);
        
      } catch (err) {
        console.error('Erro ao buscar detalhes do Simples Nacional:', err);
        setError('Não foi possível carregar os detalhes do Simples Nacional.');
        setLoading(false);
      }
    };

    fetchSimplesDetails();
  }, [cnpjBase]);

  const formatData = (data: string | null) => {
    if (!data) return '-';
    return new Date(data).toLocaleDateString('pt-BR');
  };

  const formatMoeda = (valor: number) => {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
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

  if (!simplesDetalhado) {
    return <Alert severity="info">Nenhum dado encontrado para este CNPJ Base.</Alert>;
  }

  const { simples, empresa, estabelecimentos } = simplesDetalhado;

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
        <Button
          component={Link}
          to="/simples"
          startIcon={<ArrowBackIcon />}
          sx={{ mr: 2 }}
        >
          Voltar
        </Button>
        <Typography variant="h4" component="h1">
          Simples Nacional: {empresa.razaoSocial}
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <BusinessIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">
                  Informações da Empresa
                </Typography>
              </Box>

              <Typography variant="subtitle2">CNPJ Base</Typography>
              <Typography variant="body1" gutterBottom>
                {empresa.cnpjBase}
              </Typography>

              <Typography variant="subtitle2" sx={{ mt: 2 }}>
                Razão Social
              </Typography>
              <Typography variant="body1" gutterBottom>
                {empresa.razaoSocial}
              </Typography>

              <Typography variant="subtitle2" sx={{ mt: 2 }}>
                Natureza Jurídica
              </Typography>
              <Typography variant="body1" gutterBottom>
                {empresa.naturezaJuridica}
              </Typography>

              <Typography variant="subtitle2" sx={{ mt: 2 }}>
                Porte
              </Typography>
              <Typography variant="body1" gutterBottom>
                {empresa.porte}
              </Typography>

              <Typography variant="subtitle2" sx={{ mt: 2 }}>
                Capital Social
              </Typography>
              <Typography variant="body1" gutterBottom>
                {formatMoeda(empresa.capitalSocial)}
              </Typography>

              <Typography variant="subtitle2" sx={{ mt: 2 }}>
                Data de Abertura
              </Typography>
              <Typography variant="body1" gutterBottom>
                {formatData(empresa.dataAbertura)}
              </Typography>

              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  component={Link}
                  to={`/empresas/${empresa.cnpjBase}`}
                  variant="outlined"
                  size="small"
                >
                  Ver Empresa
                </Button>
              </Box>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Status Atual
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle1" sx={{ mr: 1 }}>
                  Optante Simples Nacional:
                </Typography>
                <Chip 
                  icon={simples.optanteSimples ? <CheckCircleIcon /> : <CancelIcon />}
                  label={simples.optanteSimples ? 'Sim' : 'Não'}
                  color={simples.optanteSimples ? 'success' : 'default'}
                />
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="subtitle1" sx={{ mr: 1 }}>
                  Optante MEI:
                </Typography>
                <Chip 
                  icon={simples.optanteMei ? <CheckCircleIcon /> : <CancelIcon />}
                  label={simples.optanteMei ? 'Sim' : 'Não'}
                  color={simples.optanteMei ? 'primary' : 'default'}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Histórico do Simples Nacional
            </Typography>
            
            <Timeline position="alternate">
              {simples.dataOpcaoSimples && (
                <TimelineItem>
                  <TimelineOppositeContent color="text.secondary">
                    {formatData(simples.dataOpcaoSimples)}
                  </TimelineOppositeContent>
                  <TimelineSeparator>
                    <TimelineDot color="success" />
                    <TimelineConnector />
                  </TimelineSeparator>
                  <TimelineContent>
                    <Typography variant="h6" component="span">
                      Opção pelo Simples Nacional
                    </Typography>
                    <Typography>Empresa optou pelo regime tributário do Simples Nacional</Typography>
                  </TimelineContent>
                </TimelineItem>
              )}
              
              {simples.dataOpcaoMei && (
                <TimelineItem>
                  <TimelineOppositeContent color="text.secondary">
                    {formatData(simples.dataOpcaoMei)}
                  </TimelineOppositeContent>
                  <TimelineSeparator>
                    <TimelineDot color="primary" />
                    <TimelineConnector />
                  </TimelineSeparator>
                  <TimelineContent>
                    <Typography variant="h6" component="span">
                      Opção pelo MEI
                    </Typography>
                    <Typography>Empresa optou pelo enquadramento como Microempreendedor Individual</Typography>
                  </TimelineContent>
                </TimelineItem>
              )}
              
              {simples.dataExclusaoMei && (
                <TimelineItem>
                  <TimelineOppositeContent color="text.secondary">
                    {formatData(simples.dataExclusaoMei)}
                  </TimelineOppositeContent>
                  <TimelineSeparator>
                    <TimelineDot color="error" />
                    <TimelineConnector />
                  </TimelineSeparator>
                  <TimelineContent>
                    <Typography variant="h6" component="span">
                      Exclusão do MEI
                    </Typography>
                    <Typography>Empresa deixou de ser enquadrada como Microempreendedor Individual</Typography>
                  </TimelineContent>
                </TimelineItem>
              )}
              
              {simples.dataExclusaoSimples && (
                <TimelineItem>
                  <TimelineOppositeContent color="text.secondary">
                    {formatData(simples.dataExclusaoSimples)}
                  </TimelineOppositeContent>
                  <TimelineSeparator>
                    <TimelineDot color="error" />
                  </TimelineSeparator>
                  <TimelineContent>
                    <Typography variant="h6" component="span">
                      Exclusão do Simples Nacional
                    </Typography>
                    <Typography>Empresa deixou de ser optante pelo Simples Nacional</Typography>
                  </TimelineContent>
                </TimelineItem>
              )}
            </Timeline>
          </Paper>

          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <StorefrontIcon sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h6">
                Estabelecimentos
              </Typography>
            </Box>

            <Typography variant="body2" sx={{ mb: 2 }}>
              Esta empresa possui {estabelecimentos.length} estabelecimento{estabelecimentos.length !== 1 ? 's' : ''}.
            </Typography>

            <Grid container spacing={2}>
              {estabelecimentos.map((estabelecimento) => (
                <Grid item xs={12} sm={6} key={estabelecimento.cnpj}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle1" gutterBottom>
                        {estabelecimento.nomeFantasia || 'Sem nome fantasia'}
                      </Typography>
                      
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        CNPJ: {estabelecimento.cnpj}
                      </Typography>
                      
                      <Typography variant="body2" gutterBottom>
                        CNAE Principal: {estabelecimento.cnaePrincipal}
                      </Typography>
                      
                      <Typography variant="body2" gutterBottom>
                        Localização: {estabelecimento.municipio} - {estabelecimento.uf}
                      </Typography>
                      
                      <Typography variant="body2" gutterBottom>
                        Situação: {getSituacaoCadastralLabel(estabelecimento.situacaoCadastral)}
                      </Typography>
                      
                      <Box sx={{ mt: 1, display: 'flex', justifyContent: 'flex-end' }}>
                        <Button
                          component={Link}
                          to={`/estabelecimentos/${estabelecimento.cnpj}`}
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
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SimplesDetails;
